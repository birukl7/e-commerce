<?php

namespace App\Http\Controllers;

use App\Models\PaymentTransaction;
use App\Models\OfflinePaymentMethod;
use App\Services\PaymentFinalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
        $request->validate([
            'order_id' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|string|max:3',
            'offline_payment_method_id' => 'required|exists:offline_payment_methods,id',
            'payment_reference' => 'nullable|string|max:255',
            'payment_notes' => 'nullable|string|max:1000',
            'payment_screenshot' => 'required|image|max:5120', // 5MB max
        ]);

        try {
            // Get the offline payment method
            $offlineMethod = OfflinePaymentMethod::findOrFail($request->offline_payment_method_id);

            // Create transaction reference
            $txRef = 'offline_' . Str::random(16) . '_' . time();

            // Store the uploaded screenshot
            $screenshotPath = null;
            if ($request->hasFile('payment_screenshot')) {
                $file = $request->file('payment_screenshot');
                $filename = $txRef . '_' . time() . '.' . $file->getClientOriginalExtension();
                $screenshotPath = $file->storeAs('payment-proofs', $filename, 'public');
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
                ]
            ]);

            // Use PaymentFinalizer to handle proof upload
            $this->paymentFinalizer->handleProofUpload($payment);

            // Redirect to success page
            return redirect()->route('payment.offline.success', [
                'submission_ref' => $txRef,
                'order_id' => $request->order_id,
                'amount' => $request->amount,
                'currency' => $request->currency,
                'payment_method' => $offlineMethod->name,
            ]);

        } catch (\Exception $e) {
            \Log::error('Offline payment submission failed', [
                'error' => $e->getMessage(),
                'request_data' => $request->except(['payment_screenshot'])
            ]);

            return back()->withErrors([
                'submission' => 'Failed to submit payment proof. Please try again.'
            ])->withInput();
        }
    }

    /**
     * Show success page after offline payment submission
     */
    public function success(Request $request)
    {
        return inertia('payment/offline-submission-success', [
            'submission_ref' => $request->get('submission_ref'),
            'order_id' => $request->get('order_id'),
            'amount' => (float) $request->get('amount'),
            'currency' => $request->get('currency'),
            'payment_method' => $request->get('payment_method'),
        ]);
    }

    /**
     * Get offline payment methods
     */
    public function getMethods()
    {
        $methods = OfflinePaymentMethod::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'methods' => $methods
        ]);
    }
}