<?php

namespace App\Http\Controllers;

use App\Models\PaymentTransaction;
use App\Models\OfflinePaymentMethod;
use App\Models\Order;
use App\Services\PaymentFinalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class OfflinePaymentController extends Controller
{
    public function __construct(
        private PaymentFinalizer $paymentFinalizer
    ) {}

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
                'payment_reference' => 'nullable|string|max:255',
                'payment_notes' => 'nullable|string|max:1000',
                'payment_screenshot' => 'required|image|max:5120', // 5MB max
            ]);

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
                // Store the uploaded screenshot
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
                    
                    // Create basic order for offline payment
                    $order = Order::create([
                        'order_number' => $request->order_id,
                        'user_id' => auth()->id(),
                        'status' => 'processing',
                        'payment_status' => 'pending_verification',
                        'payment_method' => 'offline',
                        'currency' => $request->currency,
                        'subtotal' => $request->amount,
                        'tax_amount' => 0,
                        'shipping_amount' => 0,
                        'discount_amount' => 0,
                        'total_amount' => $request->amount,
                        'shipping_method' => 'standard',
                        'shipping_fullname' => auth()->user()->name,
                        'shipping_email' => auth()->user()->email,
                        'shipping_phone' => auth()->user()->phone,
                        'billing_fullname' => auth()->user()->name,
                        'billing_email' => auth()->user()->email,
                        'billing_phone' => auth()->user()->phone,
                        'billing_address' => auth()->user()->address ?? '',
                        'shipping_address' => auth()->user()->address ?? '',
                        'shipping_city' => auth()->user()->city ?? '',
                        'billing_city' => auth()->user()->city ?? '',
                        'shipping_country' => auth()->user()->country ?? 'Ethiopia',
                        'billing_country' => auth()->user()->country ?? 'Ethiopia',
                        'notes' => 'Order created via offline payment',
                    ]);
                    
                    Log::info('New order created for offline payment', [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number
                    ] + $logContext);
                } else {
                    // Update existing order
                    $order->update([
                        'payment_status' => 'pending_verification',
                        'payment_method' => 'offline',
                        'total_amount' => $request->amount,
                        'currency' => $request->currency,
                    ]);
                    
                    Log::info('Existing order updated', [
                        'order_id' => $order->id,
                        'payment_status' => 'pending_verification'
                    ] + $logContext);
                }

                // Create payment transaction record
                $payment = PaymentTransaction::create([
                    'tx_ref' => $txRef,
                    'order_id' => $request->order_id,
                    'amount' => $request->amount,
                    'currency' => $request->currency,
                    'customer_email' => auth()->user()->email,
                    'customer_name' => auth()->user()->name,
                    'customer_phone' => auth()->user()->phone,
                    'payment_method' => 'offline_' . $offlineMethod->type,
                    'gateway_status' => 'proof_uploaded',
                    'admin_status' => 'unseen',
                    'gateway_payload' => [
                        'offline_method' => $offlineMethod->toArray(),
                        'payment_reference' => $request->payment_reference,
                        'payment_notes' => $request->payment_notes,
                        'screenshot_path' => $screenshotPath,
                        'submitted_at' => now()->toISOString(),
                    ],
                ]);

                Log::info('Payment transaction created', [
                    'payment_id' => $payment->id,
                    'tx_ref' => $txRef
                ] + $logContext);

                // Use PaymentFinalizer to handle proof upload
                $this->paymentFinalizer->handleProofUpload($payment);

                DB::commit();
                Log::info('Database transaction committed successfully', $logContext);

                // Redirect to success page
                return redirect()->route('payment.offline.success', [
                    'submission_ref' => $txRef,
                    'order_id' => $request->order_id,
                    'amount' => $request->amount,
                    'currency' => $request->currency,
                    'payment_method' => $offlineMethod->name,
                ]);

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

            return inertia('admin/offline-payments/index', [
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
            
            return inertia('admin/offline-payments/show', [
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

                // Update order status
                if ($submission->order) {
                    $order = $submission->order;
                    $order->payment_status = $request->admin_status === 'approved' ? 'paid' : 'failed';
                    $order->save();
                    
                    Log::info('Order payment status updated by admin', [
                        'order_id' => $order->id,
                        'new_status' => $order->payment_status,
                        'admin_id' => auth()->id()
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