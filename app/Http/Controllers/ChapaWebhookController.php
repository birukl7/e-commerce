<?php

namespace App\Http\Controllers;

use App\Models\PaymentTransaction;
use App\Models\Order;
use App\Services\PaymentFinalizer;
use App\Events\PaymentCompleted;
use App\Events\PaymentFailed;
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
                // For product request payments, create PaymentTransaction if it doesn't exist
                if (str_starts_with($txRef, 'ADV-') || str_starts_with($txRef, 'FINAL-')) {
                    $payment = \App\Models\PaymentTransaction::where('tx_ref', $txRef)->first();
                    
                    if (!$payment) {
                        // Extract product request ID from transaction reference
                        $parts = explode('-', $txRef);
                        if (count($parts) >= 2) {
                            $productRequestId = $parts[1];
                            $productRequest = \App\Models\ProductRequest::find($productRequestId);
                            
                            if ($productRequest) {
                                // Calculate actual tax for the payment amount
                                $taxService = app(\App\Services\TaxService::class);
                                $subtotal = str_starts_with($txRef, 'ADV-') 
                                    ? (float) $productRequest->advance_amount
                                    : (float) $productRequest->final_amount;
                                
                                $taxCalculation = $taxService->calculateTaxes($subtotal);
                                $totalWithTax = $taxCalculation['total'];
                                
                                // Get amount from payload if available (actual paid amount), otherwise use calculated
                                $actualAmount = isset($payload['amount']) ? (float) $payload['amount'] : $totalWithTax;
                                
                                $payment = \App\Models\PaymentTransaction::create([
                                    'tx_ref' => $txRef,
                                    'order_id' => null,
                                    'product_request_id' => $productRequestId,
                                    'amount' => $actualAmount,
                                    'currency' => $productRequest->currency ?? 'ETB',
                                    'customer_email' => $productRequest->user->email,
                                    'customer_name' => $productRequest->user->name,
                                    'customer_phone' => $productRequest->user->phone,
                                    'payment_method' => 'chapa',
                                    'gateway_status' => 'pending',
                                    'admin_status' => 'unseen',
                                    'gateway_payload' => array_merge($payload ?? [], [
                                        'payment_type' => str_starts_with($txRef, 'ADV-') ? 'advance' : 'final',
                                        'subtotal' => $subtotal,
                                        'tax_amount' => $taxCalculation['total_tax_amount'],
                                        'taxes' => $taxCalculation['taxes'],
                                    ]),
                                ]);
                                
                                Log::info('Created PaymentTransaction for product request payment', [
                                    'tx_ref' => $txRef,
                                    'product_request_id' => $productRequestId,
                                    'payment_id' => $payment->id
                                ] + $logContext);
                            }
                        }
                    }
                }
                
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

                // Handle different payment types
                $this->handlePaymentType($payment, $gatewayStatus, $txRef, $logContext);

                // Dispatch domain event when gateway indicates paid
                if ($gatewayStatus === 'paid') {
                    $context = (str_starts_with($txRef, 'ADV-') || str_starts_with($txRef, 'FINAL-'))
                        ? 'advance'
                        : 'checkout';
                    event(new PaymentCompleted($payment, $context));
                } elseif ($gatewayStatus === 'failed') {
                    $context = (str_starts_with($txRef, 'ADV-') || str_starts_with($txRef, 'FINAL-'))
                        ? 'advance'
                        : 'checkout';
                    event(new PaymentFailed($payment, $context));
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

    /**
     * Handle different payment types based on transaction reference
     */
    private function handlePaymentType($payment, $gatewayStatus, $txRef, $logContext)
    {
        // Check if this is a product request payment
        // Can be identified by:
        // 1. tx_ref prefix (ADV- or FINAL-)
        // 2. product_request_id on the payment transaction
        $isProductRequestPayment = str_starts_with($txRef, 'ADV-') || 
                                   str_starts_with($txRef, 'FINAL-') ||
                                   ($payment && $payment->product_request_id);
        
        if ($isProductRequestPayment) {
            $this->handleProductRequestPayment($payment, $gatewayStatus, $txRef, $logContext);
        } else {
            $this->handleRegularOrderPayment($payment, $gatewayStatus, $txRef, $logContext);
        }
    }

    /**
     * Handle regular order payments
     */
    private function handleRegularOrderPayment($payment, $gatewayStatus, $txRef, $logContext)
    {
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
    }

    /**
     * Handle product request payments (advance or final)
     */
    private function handleProductRequestPayment($payment, $gatewayStatus, $txRef, $logContext)
    {
        // Get product request ID from payment transaction or extract from tx_ref
        $productRequestId = $payment->product_request_id ?? null;
        $paymentType = null;
        
        // Try to extract from tx_ref if we have ADV- or FINAL- prefix
        if (str_starts_with($txRef, 'ADV-') || str_starts_with($txRef, 'FINAL-')) {
            $parts = explode('-', $txRef);
            if (count($parts) >= 2) {
                $productRequestId = $productRequestId ?? $parts[1]; // Use payment's product_request_id if available, otherwise extract
                $paymentType = $parts[0]; // 'ADV' or 'FINAL'
            }
        }
        
        // If we still don't have product_request_id, try to get it from payment's gateway_payload
        if (!$productRequestId && $payment && isset($payment->gateway_payload['meta']['product_request_id'])) {
            $productRequestId = $payment->gateway_payload['meta']['product_request_id'];
        }
        
        // Determine payment type from gateway payload if not from tx_ref
        if (!$paymentType && $payment && isset($payment->gateway_payload['meta']['payment_type'])) {
            $payloadPaymentType = $payment->gateway_payload['meta']['payment_type'];
            if ($payloadPaymentType === 'advance' || $payloadPaymentType === 'product_request_advance') {
                $paymentType = 'ADV';
            } elseif ($payloadPaymentType === 'final' || $payloadPaymentType === 'product_request_final') {
                $paymentType = 'FINAL';
            }
        }
        
        if (!$productRequestId) {
            Log::warning('Product request payment detected but product_request_id not found', [
                'tx_ref' => $txRef,
                'payment_id' => $payment->id ?? null,
                'has_product_request_id' => isset($payment->product_request_id)
            ] + $logContext);
            return;
        }
        
        $productRequest = \App\Models\ProductRequest::find($productRequestId);
        
        if ($productRequest) {
            if ($gatewayStatus === 'paid') {
                // If payment type not determined, check payment status to infer
                if (!$paymentType) {
                    // If advance not paid but final is also not paid, it's likely advance
                    if ($productRequest->advance_payment_status !== 'paid' && $productRequest->final_payment_status !== 'paid') {
                        $paymentType = 'ADV';
                    } elseif ($productRequest->advance_payment_status === 'paid' && $productRequest->final_payment_status !== 'paid') {
                        $paymentType = 'FINAL';
                    } else {
                        // Default to advance if we can't determine
                        $paymentType = 'ADV';
                        Log::warning('Could not determine payment type, defaulting to ADV', [
                            'product_request_id' => $productRequestId,
                            'tx_ref' => $txRef
                        ] + $logContext);
                    }
                }
                
                if ($paymentType === 'ADV') {
                        // Mark advance payment as paid (returns false if already paid)
                        $result = $productRequest->markAdvancePaid('chapa', $txRef, $payment->gateway_payload ?? []);
                        
                        // Ensure PaymentTransaction is linked and updated
                        if ($payment && !$payment->product_request_id) {
                            $payment->update(['product_request_id' => $productRequestId]);
                        }
                        
                        // Only send notification if payment was newly marked as paid
                        if ($result) {
                            // Send notification
                            $productRequest->user->notify(new \App\Notifications\ProductRequestStatusUpdated(
                                $productRequest,
                                'Your advance payment has been received. We will now start getting the product for you.',
                                'Advance Payment Received',
                                route('user.product-requests.show', $productRequest->id)
                            ));
                            
                            Log::info('Advance payment processed', [
                                'product_request_id' => $productRequestId,
                                'payment_transaction_id' => $payment->id ?? null,
                                'tx_ref' => $txRef
                            ] + $logContext);
                        } else {
                            Log::info('Advance payment already marked as paid, skipping notification', [
                                'product_request_id' => $productRequestId,
                                'tx_ref' => $txRef
                            ] + $logContext);
                        }
                        
                    } elseif ($paymentType === 'FINAL') {
                        try {
                            // Mark final payment as paid (returns false if already paid, throws if advance not paid)
                            $result = $productRequest->markFinalPaid('chapa', $txRef, $payment->gateway_payload ?? []);
                            
                            // Create order (processing + paid) only if payment was newly marked
                            if ($result && !$productRequest->order_id) {
                                $order = $productRequest->createOrder(markPaid: true);
                            } else {
                                $order = $productRequest->order;
                            }
                        
                            // Update PaymentTransaction with order_id if available
                            if ($payment && $order) {
                                $payment->update([
                                    'order_id' => $order->id,
                                    'product_request_id' => $productRequestId,
                                ]);
                            }
                            
                            // Only send notification if payment was newly marked as paid
                            if ($result) {
                                // Send notification
                                $productRequest->user->notify(new \App\Notifications\ProductRequestStatusUpdated(
                                    $productRequest,
                                    'Your final payment has been received. Your order is now complete!',
                                    'Payment Complete',
                                    $order ? route('user.orders.show', $order->id) : route('user.product-requests.show', $productRequest->id)
                                ));
                                
                                Log::info('Final payment processed', [
                                    'product_request_id' => $productRequestId,
                                    'order_id' => $order->id ?? null,
                                    'payment_transaction_id' => $payment->id ?? null,
                                    'tx_ref' => $txRef
                                ] + $logContext);
                            } else {
                                Log::info('Final payment already marked as paid, skipping notification', [
                                    'product_request_id' => $productRequestId,
                                    'tx_ref' => $txRef
                                ] + $logContext);
                            }
                        } catch (\Exception $e) {
                            Log::error('Failed to process final payment in webhook', [
                                'product_request_id' => $productRequestId,
                                'error' => $e->getMessage(),
                                'tx_ref' => $txRef
                            ] + $logContext);
                        }
                    }
                } else {
                    Log::warning('Product request payment failed', [
                        'product_request_id' => $productRequestId,
                        'payment_type' => $paymentType,
                        'gateway_status' => $gatewayStatus,
                        'tx_ref' => $txRef
                    ] + $logContext);
                }
            } else {
                Log::warning('Product request not found for payment', [
                    'product_request_id' => $productRequestId,
                    'tx_ref' => $txRef
                ] + $logContext);
            }
        }
    }