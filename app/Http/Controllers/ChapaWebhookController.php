<?php

namespace App\Http\Controllers;

use App\Models\PaymentTransaction;
use App\Models\Order;
use App\Services\PaymentFinalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
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
        $webhookId = 'WEBHOOK-' . uniqid() . '-' . time();
        $logContext = ['webhook_id' => $webhookId];
        
        try {
            Log::info('=== CHAPA WEBHOOK RECEIVED ===', $logContext);
            
            // Verify webhook signature if configured
            $this->verifyWebhookSignature($request);

            $payload = $request->all();
            Log::info('Chapa webhook payload received', ['payload' => $payload] + $logContext);

            // Extract transaction reference and status from Chapa payload
            $txRef = $payload['tx_ref'] ?? null;
            $status = $payload['status'] ?? null;
            $event = $payload['event'] ?? null;

            if (!$txRef) {
                Log::warning('Chapa webhook missing tx_ref', ['payload' => $payload] + $logContext);
                return response()->json(['error' => 'Missing tx_ref'], 400);
            }

            // Map Chapa status to our gateway status
            $gatewayStatus = $this->mapChapaStatusToGatewayStatus($status, $event);

            if (!$gatewayStatus) {
                Log::warning('Unknown Chapa status received', [
                    'tx_ref' => $txRef,
                    'status' => $status,
                    'event' => $event
                ] + $logContext);
                return response()->json(['error' => 'Unknown status'], 400);
            }

            // Start database transaction for atomic updates
            DB::beginTransaction();
            
            try {
                // Update payment gateway status idempotently
                $payment = $this->paymentFinalizer->updateGatewayStatus(
                    $txRef,
                    $gatewayStatus,
                    $payload
                );

                if (!$payment) {
                    Log::warning('Payment not found for Chapa webhook', ['tx_ref' => $txRef] + $logContext);
                    DB::rollBack();
                    return response()->json(['error' => 'Payment not found'], 404);
                }

                // Update order status based on payment status
                if ($payment->order) {
                    $order = $payment->order;
                    $oldStatus = $order->payment_status;
                    
                    // Update order payment status
                    $order->payment_status = $gatewayStatus;
                    $order->payment_method = 'chapa';
                    
                    // Update order status based on payment
                    if ($gatewayStatus === 'paid') {
                        $order->status = 'processing';
                    } elseif ($gatewayStatus === 'failed') {
                        $order->status = 'processing'; // Keep as processing even if payment fails
                    }
                    
                    $order->save();
                    
                    Log::info('Order status updated', [
                        'order_id' => $order->id,
                        'old_payment_status' => $oldStatus,
                        'new_payment_status' => $gatewayStatus,
                        'order_status' => $order->status
                    ] + $logContext);
                }

                DB::commit();
                
                Log::info('Chapa webhook processed successfully', [
                    'payment_id' => $payment->id,
                    'gateway_status' => $gatewayStatus,
                    'tx_ref' => $txRef
                ] + $logContext);

                return response()->json(['status' => 'success'], 200);
                
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Database transaction failed during webhook processing', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'tx_ref' => $txRef
                ] + $logContext);
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Chapa webhook processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payload' => $request->all(),
                'webhook_id' => $webhookId
            ]);

            return response()->json(['error' => 'Webhook processing failed'], 500);
        } finally {
            Log::info('=== CHAPA WEBHOOK PROCESSING COMPLETED ===', [
                'webhook_id' => $webhookId,
                'duration_ms' => round((microtime(true) - LARAVEL_START) * 1000, 2)
            ]);
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
        $secret = config('services.chapa.webhook_secret');
        
        if (!$signature || !$secret) {
            Log::info('Webhook signature verification skipped - not configured');
            return; // Skip verification if not configured
        }

        $computedSignature = hash_hmac('sha256', $request->getContent(), $secret);
        
        if (!hash_equals($signature, $computedSignature)) {
            Log::warning('Invalid Chapa webhook signature', [
                'received' => $signature,
                'computed' => $computedSignature
            ]);
            throw new \Exception('Invalid webhook signature');
        }
        
        Log::info('Webhook signature verified successfully');
    }
}