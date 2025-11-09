<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentRejectionReason;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentRejectionReasonController extends Controller
{
    /**
     * Display a listing of rejection reasons.
     */
    public function index()
    {
        $reasons = PaymentRejectionReason::ordered()->get();

        return Inertia::render('admin/payment-rejection-reasons/index', [
            'reasons' => $reasons,
        ]);
    }

    /**
     * Store a newly created rejection reason.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reason_code' => 'required|string|max:255|unique:payment_rejection_reasons,reason_code',
            'reason_text' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'applies_to' => 'required|array',
            'applies_to.*' => 'in:product_request,normal_purchase,both',
            'is_active' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer|min:0',
        ]);

        PaymentRejectionReason::create($validated);

        return redirect()->route('admin.payment-rejection-reasons.index')
            ->with('success', 'Rejection reason created successfully.');
    }

    /**
     * Update the specified rejection reason.
     */
    public function update(Request $request, PaymentRejectionReason $paymentRejectionReason)
    {
        $validated = $request->validate([
            'reason_code' => 'sometimes|string|max:255|unique:payment_rejection_reasons,reason_code,' . $paymentRejectionReason->id,
            'reason_text' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'applies_to' => 'sometimes|array',
            'applies_to.*' => 'in:product_request,normal_purchase,both',
            'is_active' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer|min:0',
        ]);

        $paymentRejectionReason->update($validated);

        return redirect()->route('admin.payment-rejection-reasons.index')
            ->with('success', 'Rejection reason updated successfully.');
    }

    /**
     * Remove the specified rejection reason.
     */
    public function destroy(PaymentRejectionReason $paymentRejectionReason)
    {
        // Check if reason is being used
        if ($paymentRejectionReason->paymentTransactions()->count() > 0) {
            return back()->with('error', 'Cannot delete rejection reason that is in use.');
        }

        $paymentRejectionReason->delete();

        return redirect()->route('admin.payment-rejection-reasons.index')
            ->with('success', 'Rejection reason deleted successfully.');
    }

    /**
     * Get active rejection reasons for a payment type (API endpoint).
     */
    public function getActiveReasons(Request $request)
    {
        $paymentType = $request->input('payment_type', 'both'); // 'product_request', 'normal_purchase', or 'both'

        $reasons = PaymentRejectionReason::active()
            ->forPaymentType($paymentType)
            ->ordered()
            ->get(['id', 'reason_code', 'reason_text', 'description']);

        return response()->json($reasons);
    }
}
