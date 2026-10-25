<?php

namespace App\Http\Controllers;

use App\Models\PaymentTransaction;
use App\Models\OfflinePaymentMethod;
use App\Models\Order;
use App\Services\PaymentFinalizer;
use App\Services\LinksEtService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Events\PaymentApproved;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class OfflinePaymentController extends Controller
{
    public function __construct(
        private PaymentFinalizer $paymentFinalizer,
        private LinksEtService $linksEtService
    ) {}

    /**
     * Extract shipping address data from request or user's saved address
     */
    private function extractShippingAddressData($shippingAddress, $user)
    {
        $data = [
            'shipping_fullname' => $user->name,
            'shipping_email' => $user->email,
            'shipping_phone' => $user->phone,
            'shipping_address' => null,
            'shipping_city' => null,
            'shipping_country' => 'Ethiopia',
            'billing_fullname' => $user->name,
            'billing_email' => $user->email,
            'billing_phone' => $user->phone,
            'billing_address' => null,
            'billing_city' => null,
            'billing_country' => 'Ethiopia',
        ];

        // If shipping address is provided (from checkout form)
        if ($shippingAddress) {
            // Handle both object and array formats
            if (is_string($shippingAddress)) {
                $shippingAddress = json_decode($shippingAddress, true);
            }

            if (is_array($shippingAddress)) {
                // Extract from checkout form format
                $fullName = trim(($shippingAddress['firstName'] ?? '') . ' ' . ($shippingAddress['lastName'] ?? ''));
                if (empty($fullName)) {
                    $fullName = $user->name;
                }

                $data['shipping_fullname'] = $fullName;
                $data['shipping_email'] = $shippingAddress['email'] ?? $user->email;
                $data['shipping_phone'] = $shippingAddress['phone'] ?? $user->phone;
                $data['shipping_address'] = $shippingAddress['address'] ?? null;
                $data['shipping_city'] = $shippingAddress['city'] ?? null;
                $data['shipping_country'] = $shippingAddress['country'] ?? 'Ethiopia';
                
                // Use same data for billing (can be updated later if needed)
                $data['billing_fullname'] = $data['shipping_fullname'];
                $data['billing_email'] = $data['shipping_email'];
                $data['billing_phone'] = $data['shipping_phone'];
                $data['billing_address'] = $data['shipping_address'];
                $data['billing_city'] = $data['shipping_city'];
                $data['billing_country'] = $data['shipping_country'];
            }
        } else {
            // Try to get from user's default saved address
            $defaultAddress = $user->addresses()->where('is_default', true)->first();
            if ($defaultAddress) {
                $data['shipping_address'] = $defaultAddress->address_line_1 . 
                    ($defaultAddress->address_line_2 ? ', ' . $defaultAddress->address_line_2 : '');
                $data['shipping_city'] = $defaultAddress->city;
                $data['shipping_country'] = $defaultAddress->country;
                $data['shipping_phone'] = $defaultAddress->phone ?? $user->phone;
                
                $data['billing_address'] = $data['shipping_address'];
                $data['billing_city'] = $data['shipping_city'];
                $data['billing_country'] = $data['shipping_country'];
            }
        }

        return $data;
    }

    /**
     * Submit offline payment proof
     */
    public function submit(Request $request)
    {
        $requestId = 'OFFLINE-' . Str::random(8) . '-' . time();
        $logContext = ['request_id' => $requestId];
        
        try {
            Log::info('=== OFFLINE PAYMENT SUBMISSION STARTED ===', $logContext);
            
            $request->validate([
                'order_id' => 'required|string',
                'amount' => 'required|numeric|min:0.01',
                'currency' => 'required|string|max:3',
                'offline_payment_method_id' => 'required|exists:offline_payment_methods,id',
                'payment_reference' => 'nullable|string|max:1000',
                'payment_link' => 'nullable|string|max:1000',
                'payment_notes' => 'nullable|string|max:1000',
                'payment_screenshot' => 'nullable|image|max:5120', // 5MB max (optional fallback)
            ]);

            // Ensure either payment link / reference or screenshot is provided
            $paymentLinkOrRef = trim($request->input('payment_link') ?? $request->input('payment_reference') ?? '');
            if (empty($paymentLinkOrRef) && !$request->hasFile('payment_screenshot')) {
                return back()->withErrors([
                    'payment_link' => 'Please provide your payment link or transaction reference number.'
                ])->withInput();
            }

            // Get the offline payment method
            $offlineMethod = OfflinePaymentMethod::findOrFail($request->offline_payment_method_id);
            Log::info('Offline payment method found', [
                'method_id' => $offlineMethod->id,
                'method_name' => $offlineMethod->name
            ] + $logContext);

            // Create transaction reference
            $txRef = 'offline_' . Str::random(16) . '_' . time();
            Log::info('Generated transaction reference', ['tx_ref' => $txRef] + $logContext);

            // Start database transaction
            DB::beginTransaction();
            
            try {
                // Store the uploaded screenshot if provided
                $screenshotPath = null;
                if ($request->hasFile('payment_screenshot')) {
                    $file = $request->file('payment_screenshot');
                    $filename = $txRef . '_' . time() . '.' . $file->getClientOriginalExtension();
                    $screenshotPath = $file->storeAs('payment-proofs', $filename, 'public');
                    
                    Log::info('Payment screenshot stored', [
                        'path' => $screenshotPath,
                        'filename' => $filename
                    ] + $logContext);
                }

                // Check if order exists, create if not
                $order = Order::where('order_number', $request->order_id)->first();
                if (!$order) {
                    Log::info('Order not found, creating new one', ['order_id' => $request->order_id] + $logContext);
                    
                    // Extract shipping address from request
                    $shippingAddress = $request->get('shipping_address');
                    $shippingData = $this->extractShippingAddressData($shippingAddress, auth()->user());
                    
                    // Create basic order for offline payment
                    $order = Order::create([
                        'order_number' => $request->order_id,
                        'user_id' => auth()->id(),
                        'status' => 'processing',
                        'payment_status' => 'pending',
                        'payment_method' => 'offline',
                        'currency' => $request->currency,
                        'subtotal' => $request->amount,
                        'tax_amount' => 0,
                        'shipping_amount' => 0,
                        'discount_amount' => 0,
                        'total_amount' => $request->amount,
                        'shipping_method' => 'standard',
                        'notes' => 'Order created via offline payment',
                    ] + $shippingData);
                    
                    Log::info('New order created for offline payment', [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number
                    ] + $logContext);
                } else {
                    // Update existing order
                    $order->update([
                        'payment_status' => 'pending',
                        'payment_method' => 'offline',
                        'total_amount' => $request->amount,
                        'currency' => $request->currency,
                    ]);
                    
                    Log::info('Existing order updated', [
                        'order_id' => $order->id,
                        'payment_status' => 'pending'
                    ] + $logContext);
                }

                // Create payment transaction record
                $paymentData = [
                    'tx_ref' => $txRef,
                    'order_id' => $order->id, // Use the actual order ID
                    'amount' => $request->amount,
                    'currency' => $request->currency,
                    'customer_email' => auth()->user()->email,
                    'customer_name' => auth()->user()->name,
                    'customer_phone' => auth()->user()->phone,
                    'payment_method' => 'offline',
                    'gateway_status' => 'pending',
                    'admin_status' => 'pending_review',
                    'gateway_payload' => [
                        'offline_method_id' => $offlineMethod->id,
                        'payment_reference' => $request->payment_reference,
                        'payment_notes' => $request->payment_notes,
                        'screenshot_path' => $screenshotPath,
                        'submitted_at' => now()->toIso8601String(),
                        'order_number' => $order->order_number, // Store order number in gateway_payload for reference
                        'original_order_id' => $request->order_id, // Store the original order ID from request
                    ],
                ];

                Log::info('Creating payment transaction with data', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'payment_data' => $paymentData
                ]);

                $payment = PaymentTransaction::create($paymentData);

                // Log the payment creation
                Log::info('Payment transaction created', [
                    'payment_id' => $payment->id,
                    'order_id' => $payment->order_id,
                    'order_number' => $order->order_number,
                    'tx_ref' => $txRef
                ] + $logContext);

                Log::info('Payment transaction created', [
                    'payment_id' => $payment->id,
                    'tx_ref' => $txRef
                ] + $logContext);

                // Use PaymentFinalizer to handle proof upload
                $this->paymentFinalizer->handleProofUpload($payment);

                // --- LIVE ACTION: Verify with links.et immediately during submission ---
                if ($this->linksEtService->isConfigured()) {
                    try {
                        $reference = $request->payment_reference;
                        $verificationResult = null;

                        // 1. If reference/link provided, verify via verify()
                        if (!empty($reference)) {
                            $isUrl = filter_var($reference, FILTER_VALIDATE_URL) || str_starts_with($reference, 'http://') || str_starts_with($reference, 'https://');
                            if ($isUrl || preg_match('/^[A-Za-z0-9_-]{6,32}$/', trim($reference))) {
                                $verificationResult = $this->linksEtService->verify($reference, ['waitMs' => 10000]);
                            }
                        }

                        // 2. If reference verify didn't succeed and screenshot was uploaded, verify via verifyImage()
                        if ((empty($verificationResult) || empty($verificationResult['ok'])) && !empty($screenshotPath)) {
                            $fullDiskPath = Storage::disk('public')->path($screenshotPath);
                            if (file_exists($fullDiskPath)) {
                                $imageResult = $this->linksEtService->verifyImage($fullDiskPath);
                                if (!empty($imageResult['ok']) || !empty($imageResult['detected'])) {
                                    $verificationResult = $imageResult;
                                }
                            }
                        }

                        if (!empty($verificationResult)) {
                            $isVerifiedOk = !empty($verificationResult['ok']);
                            $receipt = $verificationResult['receipt'] ?? ($verificationResult['upstream']['result']['receipt'] ?? null);

                            $payload = $payment->gateway_payload ?? [];
                            $payload['links_et_verification'] = [
                                'verified_at' => now()->toIso8601String(),
                                'ok' => $isVerifiedOk,
                                'providerKey' => $verificationResult['providerKey'] ?? ($verificationResult['detected']['provider'] ?? null),
                                'detected' => $verificationResult['detected'] ?? null,
                                'upstream_attempted' => $verificationResult['upstream']['attempted'] ?? false,
                                'raw_result' => $verificationResult,
                            ];

                            if ($receipt) {
                                $extractedAmount = LinksEtService::extractAmount($receipt);
                                $extractedRef = LinksEtService::extractReference($receipt);
                                $extractedPayer = LinksEtService::extractPayerName($receipt);

                                $payload['links_et_verification']['extracted_amount'] = $extractedAmount;
                                $payload['links_et_verification']['extracted_reference'] = $extractedRef;
                                $payload['links_et_verification']['extracted_payer'] = $extractedPayer;
                                $payload['links_et_verification']['receipt_source'] = $receipt['source'] ?? null;

                                if ($extractedAmount !== null) {
                                    $expectedAmount = (float) $payment->amount;
                                    $amountMatches = abs($extractedAmount - $expectedAmount) < 0.50;
                                    $payload['links_et_verification']['amount_matches'] = $amountMatches;

                                    if ($amountMatches && $isVerifiedOk) {
                                        $payment->gateway_status = 'paid';
                                        
                                        // Automatic confirmation: No admin manual review needed when verified at source by links.et
                                        $payment->admin_status = 'approved';
                                        $payment->admin_notes = 'Automatically verified and approved at source via links.et';
                                        $payment->admin_action_at = now();

                                        Log::info('Payment auto-approved via links.et source verification', [
                                            'payment_id' => $payment->id,
                                            'extracted_amount' => $extractedAmount,
                                            'expected_amount' => $expectedAmount
                                        ] + $logContext);
                                    }
                                }
                            }

                            $payment->gateway_payload = $payload;
                            $payment->save();

                            // If auto-approved, finalize order directly so it is marked paid and ready for fulfillment
                            if ($payment->admin_status === 'approved' && $payment->gateway_status === 'paid') {
                                try {
                                    $this->paymentFinalizer->finalizeOrder($payment->fresh());
                                    
                                    $context = ($payment->product_request_id !== null) ? 'advance' : 'checkout';
                                    event(new PaymentApproved($payment->fresh(), $context));
                                    Log::info('Order automatically finalized via links.et verification without admin intervention', [
                                        'payment_id' => $payment->id,
                                        'order_id' => $payment->order_id
                                    ] + $logContext);
                                } catch (\Throwable $fe) {
                                    Log::error('Failed to auto-finalize order after links.et verification', [
                                        'error' => $fe->getMessage()
                                    ] + $logContext);
                                }
                            }

                            Log::info('Live links.et verification completed', [
                                'payment_id' => $payment->id,
                                'ok' => $isVerifiedOk,
                                'auto_approved' => ($payment->admin_status === 'approved')
                            ] + $logContext);
                        }
                    } catch (\Throwable $ve) {
                        Log::warning('Live links.et verification skipped or failed', [
                            'error' => $ve->getMessage()
                        ] + $logContext);
                    }
                }

                DB::commit();
                Log::info('Database transaction committed successfully', $logContext);

                $isAutoApproved = ($payment->admin_status === 'approved' && $payment->gateway_status === 'paid');

                // Determine redirect target: If verified and approved, send directly to order details!
                $orderRedirectUrl = null;
                if ($isAutoApproved && $order) {
                    $orderRedirectUrl = route('user.orders.show', ['order' => $order->order_number ?? $order->id]);
                } else {
                    $orderRedirectUrl = route('payment.offline.success', [
                        'submission_ref' => $txRef,
                        'order_id' => $request->order_id,
                        'amount' => $request->amount,
                        'currency' => $request->currency,
                        'payment_method' => $offlineMethod->name,
                    ]);
                }

                // If AJAX / JSON request, return JSON so frontend can display verification success and redirect
                if ($request->wantsJson() || $request->ajax()) {
                    return response()->json([
                        'success' => true,
                        'verified' => $isAutoApproved,
                        'message' => $isAutoApproved ? 'Payment successfully verified! Redirecting to your order...' : 'Payment submitted for review.',
                        'order_number' => $order ? $order->order_number : null,
                        'order_id' => $order ? $order->id : $request->order_id,
                        'redirect' => $orderRedirectUrl
                    ]);
                }

                // Redirect to order page if verified, or success page if pending manual review
                return redirect($orderRedirectUrl)->with(
                    'success', 
                    $isAutoApproved ? 'Payment successfully verified!' : 'Payment submitted successfully.'
                );

            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Database transaction failed during offline payment submission', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ] + $logContext);
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Offline payment submission failed', [
                'error' => $e->getMessage(),
                'request_data' => $request->except(['payment_screenshot']),
                'request_id' => $requestId
            ]);

            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment could not be processed at this time. Please check your payment details or try again.'
                ], 500);
            }

            return back()->withErrors([
                'submission' => 'Failed to submit payment proof. Please try again.'
            ])->withInput();
        } finally {
            Log::info('=== OFFLINE PAYMENT SUBMISSION COMPLETED ===', [
                'request_id' => $requestId,
                'duration_ms' => round((microtime(true) - LARAVEL_START) * 1000, 2)
            ]);
        }
    }

    /**
     * Show success page after offline payment submission
     */
    public function success(Request $request)
    {
        try {
            return inertia('payment/offline-submission-success', [
                'submission_ref' => $request->get('submission_ref'),
                'order_id' => $request->get('order_id'),
                'amount' => (float) $request->get('amount'),
                'currency' => $request->get('currency'),
                'payment_method' => $request->get('payment_method'),
            ]);
        } catch (\Exception $e) {
            Log::error('Offline payment success page error: ' . $e->getMessage());
            return redirect()->route('checkout')->with('error', 'An error occurred. Please try again.');
        }
    }

    /**
     * Get offline payment methods
     */
    public function getMethods()
    {
        try {
            $methods = OfflinePaymentMethod::where('is_active', true)
                ->orderBy('sort_order')
                ->get();

            return response()->json([
                'success' => true,
                'methods' => $methods
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get offline payment methods: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve payment methods'
            ], 500);
        }
    }

    /**
     * Admin index for offline payment submissions
     */
    public function adminIndex()
    {
        try {
            $submissions = PaymentTransaction::where('payment_method', 'like', 'offline_%')
                ->with(['order', 'admin'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return inertia('Admin/offline-payments/index', [
                'submissions' => $submissions
            ]);
        } catch (\Exception $e) {
            Log::error('Admin offline payments index error: ' . $e->getMessage());
            return back()->with('error', 'Failed to load offline payments');
        }
    }

    /**
     * Admin show for offline payment submission
     */
    public function adminShow(PaymentTransaction $submission)
    {
        try {
            $submission->load(['order', 'admin']);
            
            return inertia('Admin/offline-payments/show', [
                'submission' => $submission
            ]);
        } catch (\Exception $e) {
            Log::error('Admin offline payment show error: ' . $e->getMessage());
            return back()->with('error', 'Failed to load payment submission');
        }
    }

    /**
     * Admin update status for offline payment submission
     */
    public function adminUpdateStatus(Request $request, PaymentTransaction $submission)
    {
        try {
            $request->validate([
                'admin_status' => 'required|in:approved,rejected',
                'admin_notes' => 'nullable|string|max:1000',
            ]);

            DB::beginTransaction();
            
            try {
                // Update payment transaction
                $submission->update([
                    'admin_status' => $request->admin_status,
                    'admin_notes' => $request->admin_notes,
                    'admin_id' => auth()->id(),
                    'admin_action_at' => now(),
                ]);

                // Use PaymentFinalizer to handle the approval and update product request/order status
                // This will properly handle both regular orders and product request payments
                if ($request->admin_status === 'approved') {
                    $finalized = $this->paymentFinalizer->finalizeOrder($submission->fresh());
                    
                    if ($finalized) {
                        Log::info('Payment finalized successfully via PaymentFinalizer', [
                            'payment_id' => $submission->id,
                            'product_request_id' => $submission->product_request_id,
                            'order_id' => $submission->order_id
                        ]);
                    } else {
                        Log::warning('PaymentFinalizer returned false', [
                            'payment_id' => $submission->id,
                            'can_finalize' => $this->paymentFinalizer->canFinalizeOrder($submission->fresh())
                        ]);
                    }
                } else {
                    // If rejected, update order status directly
                    // Use OrderLookupService to get order (handles both numeric ID and order_number string)
                    $orderLookupService = app(\App\Services\OrderLookupService::class);
                    $order = $orderLookupService->getOrderForPayment($submission);
                    
                    if ($order) {
                        $order->payment_status = 'failed';
                        $order->save();
                        
                        Log::info('Order payment status updated to failed by admin', [
                            'order_id' => $order->id,
                            'admin_id' => auth()->id()
                        ]);
                    }
                }

                // Dispatch domain event for admin approval (offline)
                try {
                    $context = ($submission->product_request_id !== null) ? 'advance' : 'checkout';
                    // Coerce to PaymentTransaction model type if needed
                    if ($submission instanceof \App\Models\PaymentTransaction) {
                        event(new PaymentApproved($submission->fresh(), $context));
                    }
                } catch (\Throwable $e) {
                    Log::warning('Failed to dispatch PaymentApproved event for offline submission', [
                        'error' => $e->getMessage(),
                        'submission_id' => $submission->id
                    ]);
                }

                DB::commit();
                
                return back()->with('success', 'Payment status updated successfully');
                
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Failed to update payment status: ' . $e->getMessage());
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Admin update status error: ' . $e->getMessage());
            return back()->with('error', 'Failed to update payment status');
        }
    }
}