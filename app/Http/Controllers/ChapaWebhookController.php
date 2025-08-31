<?php

namespace App\Http\Controllers;

use App\Models\PaymentTransaction;
use App\Services\PaymentFinalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ChapaWebhookController extends Controller
{
    public function __construct(
        private PaymentFinalizer $paymentFinalizer
    ) {}

    /**
     * Handle Chapa webhook notifications
     */
    public function handle(Request $request)
    {
        try {
            // Verify webhook signature if needed
            // $this->verifyWebhookSignature($request);

            $payload = $request->all();
            
            Log::info('Chapa webhook received', ['payload' => $payload]);

            // Extract transaction reference and status from Chapa payload
            $txRef = $payload['tx_ref'] ?? null;
            $status = $payload['status'] ?? null;
            $event = $payload['event'] ?? null;

            if (!$txRef) {
                Log::warning('Chapa webhook missing tx_ref', ['payload' => $payload]);
                return response()->json(['error' => 'Missing tx_ref'], 400);
            }

            // Map Chapa status to our gateway status
            $gatewayStatus = $this->mapChapaStatusToGatewayStatus($status, $event);

            if (!$gatewayStatus) {
                Log::warning('Unknown Chapa status received', [
                    'tx_ref' => $txRef,
                    'status' => $status,
                    'event' => $event
                ]);
                return response()->json(['error' => 'Unknown status'], 400);
            }

            // Update payment gateway status idempotently
            $payment = $this->paymentFinalizer->updateGatewayStatus(
                $txRef,
                $gatewayStatus,
                $payload
            );

            if (!$payment) {
                Log::warning('Payment not found for Chapa webhook', ['tx_ref' => $txRef]);
                return response()->json(['error' => 'Payment not found'], 404);
            }

            Log::info('Chapa webhook processed successfully', [
                'payment_id' => $payment->id,
                'gateway_status' => $gatewayStatus,
                'tx_ref' => $txRef
            ]);

            return response()->json(['status' => 'success'], 200);

        } catch (\Exception $e) {
            Log::error('Chapa webhook processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payload' => $request->all()
            ]);

            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    /**
     * Map Chapa status to our internal gateway status
     */
    private function mapChapaStatusToGatewayStatus(?string $status, ?string $event): ?string
    {
        // Chapa uses different status values, map them to our enum
        return match (strtolower($status ?? '')) {
            'success', 'successful', 'completed' => 'paid',
            'failed', 'cancelled', 'timeout' => 'failed',
            'pending', 'processing' => 'pending',
            'refunded' => 'refunded',
            default => null,
        };
    }

    /**
     * Verify webhook signature (implement based on Chapa documentation)
     */
    private function verifyWebhookSignature(Request $request): void
    {
        // Implement signature verification based on Chapa's webhook security
        // This might involve checking headers like 'chapa-signature' or similar
        
        $signature = $request->header('chapa-signature');
        $secret = config('chapa.webhook_secret');
        
        if (!$signature || !$secret) {
            return; // Skip verification if not configured
        }

        $computedSignature = hash_hmac('sha256', $request->getContent(), $secret);
        
        if (!hash_equals($signature, $computedSignature)) {
            Log::warning('Invalid Chapa webhook signature');
            throw new \Exception('Invalid webhook signature');
        }
    }
}