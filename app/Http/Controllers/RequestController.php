<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ProductRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class RequestController extends Controller
{
    /**
     * Display the product request form and history.
     */
    public function index()
    {
        $user = Auth::user();
        
        // Get requests and refresh each one to ensure we have latest payment status
        $requests = ProductRequest::where('user_id', $user->id)
            ->latest()
            ->get()
            ->map(function ($request) {
                // Refresh to get latest payment status from database
                $request->refresh();
                
                return [
                    'id' => $request->id,
                    'product_name' => $request->product_name,
                    'description' => $request->description,
                    'status' => $request->status,
                    'image' => $request->image ? asset('storage/' . $request->image) : null,
                    'created_at' => $request->created_at,
                    'admin_response' => $request->admin_response,
                    'rejection_reason' => $request->rejection_reason,
                    'amount' => $request->amount,
                    'currency' => $request->currency,
                    'payment_status' => $request->payment_status,
                    'payment_method' => $request->payment_method,
                    'payment_reference' => $request->payment_reference,
                    'paid_at' => $request->paid_at,
                    'price_accepted_at' => $request->price_accepted_at,
                    'requires_payment' => $request->requiresPayment(),
                    'available' => $request->available,
                    // New procurement fields
                    'advance_amount' => $request->advance_amount,
                    'final_amount' => $request->final_amount,
                    'advance_payment_status' => $request->advance_payment_status,
                    'final_payment_status' => $request->final_payment_status,
                    'advance_paid_at' => $request->advance_paid_at,
                    'final_paid_at' => $request->final_paid_at,
                    'procurement_status' => $request->procurement_status,
                    'procurement_notes' => $request->procurement_notes,
                    'procurement_started_at' => $request->procurement_started_at,
                    'procurement_completed_at' => $request->procurement_completed_at,
                    'product_arrived_at' => $request->product_arrived_at,
                    'estimated_arrival_date' => $request->estimated_arrival_date,
                    'customer_willing_to_buy' => $request->customer_willing_to_buy,
                    'willingness_confirmed_at' => $request->willingness_confirmed_at,
                    'lost_interest_at' => $request->lost_interest_at,
                    'lost_interest_reason' => $request->lost_interest_reason,
                    // Calculate workflow status AFTER refreshing the model
                    'workflow_status' => $request->getWorkflowStatus(),
                ];
            });

        return Inertia::render('request/request-dashboard', [
            'requests' => $requests
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_name' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240', // 10MB max
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('product-requests', 'public');
        }

        ProductRequest::create([
            'user_id' => Auth::id(),
            'product_name' => $validated['product_name'],
            'description' => $validated['description'],
            'image' => $imagePath,
            'status' => 'pending',
            'admin_response' => '',
        ]);

        return redirect()->back()->with('success', 'Product request submitted successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(ProductRequest $productRequest)
    {
        // Check if the user owns this request
        if ($productRequest->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        // Calculate tax for advance and final amounts if needed
        $taxService = app(\App\Services\TaxService::class);
        $advanceTaxCalculation = null;
        $finalTaxCalculation = null;
        
        if ($productRequest->advance_amount) {
            $advanceTaxCalculation = $taxService->calculateTaxes((float) $productRequest->advance_amount);
        }
        
        if ($productRequest->final_amount) {
            $finalTaxCalculation = $taxService->calculateTaxes((float) $productRequest->final_amount);
        }

        // Refresh the model to get latest payment status from database
        $productRequest->refresh();

        // Get payment transactions with rejection information
        $advancePayment = \App\Models\PaymentTransaction::where('product_request_id', $productRequest->id)
            ->where('tx_ref', 'like', 'ADV-%')
            ->with('rejectionReason')
            ->latest()
            ->first();
        
        $finalPayment = \App\Models\PaymentTransaction::where('product_request_id', $productRequest->id)
            ->where('tx_ref', 'like', 'FINAL-%')
            ->with('rejectionReason')
            ->latest()
            ->first();

        return Inertia::render('request/show', [
            'request' => [
                'id' => $productRequest->id,
                'title' => $productRequest->product_name,
                'product_name' => $productRequest->product_name,
                'description' => $productRequest->description,
                'status' => $productRequest->status,
                'admin_response' => $productRequest->admin_response,
                'rejection_reason' => $productRequest->rejection_reason,
                'amount' => $productRequest->amount,
                'currency' => $productRequest->currency,
                'payment_status' => $productRequest->payment_status,
                'payment_method' => $productRequest->payment_method,
                'payment_reference' => $productRequest->payment_reference,
                'paid_at' => $productRequest->paid_at,
                'price_accepted_at' => $productRequest->price_accepted_at,
                'image' => $productRequest->image ? asset('storage/' . $productRequest->image) : null,
                'created_at' => $productRequest->created_at,
                'updated_at' => $productRequest->updated_at,
                'requires_payment' => $productRequest->requiresPayment(),
                // Procurement and payment workflow fields
                'advance_amount' => $productRequest->advance_amount,
                'final_amount' => $productRequest->final_amount,
                'advance_payment_status' => $productRequest->advance_payment_status,
                'final_payment_status' => $productRequest->final_payment_status,
                'advance_paid_at' => $productRequest->advance_paid_at,
                'final_paid_at' => $productRequest->final_paid_at,
                'customer_willing_to_buy' => $productRequest->customer_willing_to_buy,
                'willingness_confirmed_at' => $productRequest->willingness_confirmed_at,
                'procurement_status' => $productRequest->procurement_status,
                'procurement_started_at' => $productRequest->procurement_started_at,
                'procurement_expected_completion_date' => $productRequest->procurement_expected_completion_date,
                'procurement_completed_at' => $productRequest->procurement_completed_at,
                'procurement_notes' => $productRequest->procurement_notes,
                'product_arrived_at' => $productRequest->product_arrived_at,
                'arrival_notes' => $productRequest->arrival_notes,
                'estimated_arrival_date' => $productRequest->estimated_arrival_date,
                'lost_interest_at' => $productRequest->lost_interest_at,
                'lost_interest_reason' => $productRequest->lost_interest_reason,
                // Calculate workflow status AFTER refreshing the model
                'workflow_status' => $productRequest->getWorkflowStatus(),
                // Calculate requires flags AFTER refreshing payment status
                'requires_advance_payment' => $productRequest->requiresAdvancePayment(),
                'requires_final_payment' => $productRequest->requiresFinalPayment(),
                // Tax calculations
                'advance_tax_breakdown' => $advanceTaxCalculation,
                'final_tax_breakdown' => $finalTaxCalculation,
            ],
            'advancePayment' => $advancePayment ? [
                'id' => $advancePayment->id,
                'admin_status' => $advancePayment->admin_status,
                'rejection_reason_code' => $advancePayment->rejection_reason_code,
                'rejection_reason' => $advancePayment->rejectionReason ? [
                    'reason_text' => $advancePayment->rejectionReason->reason_text,
                    'description' => $advancePayment->rejectionReason->description,
                ] : null,
                'admin_notes' => $advancePayment->admin_notes,
            ] : null,
            'finalPayment' => $finalPayment ? [
                'id' => $finalPayment->id,
                'admin_status' => $finalPayment->admin_status,
                'rejection_reason_code' => $finalPayment->rejection_reason_code,
                'rejection_reason' => $finalPayment->rejectionReason ? [
                    'reason_text' => $finalPayment->rejectionReason->reason_text,
                    'description' => $finalPayment->rejectionReason->description,
                ] : null,
                'admin_notes' => $finalPayment->admin_notes,
            ] : null,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ProductRequest $productRequest)
    {
        // Check if the user owns this request and it's still editable
        if ($productRequest->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        // Users can only edit pending requests
        if ($productRequest->status !== 'pending') {
            return redirect()->route('request.index')
                ->with('error', 'You can only edit pending requests.');
        }

        return Inertia::render('request/edit', [
            'request' => $productRequest
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProductRequest $productRequest)
    {
        // Check if the user owns this request
        if ($productRequest->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        // Users can only edit pending requests
        if ($productRequest->status !== 'pending') {
            return redirect()->route('request.index')
                ->with('error', 'You can only edit pending requests.');
        }

        // Debug: Log the incoming request data
        Log::info('Update request data:', [
            'all_data' => $request->all(),
            'files' => $request->allFiles(),
            'product_name' => $request->get('product_name'),
            'description' => $request->get('description'),
            'has_image' => $request->hasFile('image'),
            'remove_image' => $request->get('remove_image'),
        ]);

        try {
            $validated = $request->validate([
                'product_name' => 'required|string|max:255',
                'description' => 'required|string|max:1000',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240', // 10MB max
                'remove_image' => 'nullable|boolean',
                '_method' => 'nullable|string', // Allow _method field from Inertia
            ], [
                'product_name.required' => 'Product name is required.',
                'product_name.string' => 'Product name must be a valid text.',
                'product_name.max' => 'Product name cannot exceed 255 characters.',
                'description.required' => 'Description is required.',
                'description.string' => 'Description must be a valid text.',
                'description.max' => 'Description cannot exceed 1000 characters.',
                'image.image' => 'The file must be a valid image.',
                'image.mimes' => 'Image must be JPEG, PNG, JPG, GIF, or WebP format.',
                'image.max' => 'Image size cannot exceed 10MB.',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed:', [
                'errors' => $e->errors(),
                'request_data' => $request->all(),
            ]);
            throw $e;
        }

        $imagePath = $productRequest->image;
        
        // Handle image update
        if ($request->hasFile('image')) {
            // Delete old image if it exists
            if ($productRequest->image) {
                Storage::disk('public')->delete($productRequest->image);
            }
            $imagePath = $request->file('image')->store('product-requests', 'public');
        } elseif ($request->has('remove_image') && $request->remove_image) {
            // Remove image if user chose to remove it
            if ($productRequest->image) {
                Storage::disk('public')->delete($productRequest->image);
            }
            $imagePath = null;
        }

        $productRequest->update([
            'product_name' => $validated['product_name'],
            'description' => $validated['description'],
            'image' => $imagePath,
        ]);

        return redirect()->route('request.index')
            ->with('success', 'Product request updated successfully!');
    }

    /**
     * Accept the price set by admin for this request.
     */
    public function acceptPrice(ProductRequest $productRequest)
    {
        if ($productRequest->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        if (!$productRequest->amount || !$productRequest->currency) {
            return redirect()->route('user.product-requests.show', $productRequest->id)
                ->with('error', 'Price has not been set by admin yet.');
        }

        $productRequest->update([
            'price_accepted_at' => now(),
        ]);

        // Check if this is the new advance payment workflow
        if ($productRequest->advance_amount && $productRequest->final_amount) {
            // New workflow: redirect to advance payment method selection
            return redirect()->route('product-requests.advance-payment.show', $productRequest->id)
                ->with('success', 'Price accepted. Please choose advance payment method.');
        } else {
            // Old workflow: redirect to single payment
            return redirect()->route('product-requests.payment.show', $productRequest->id)
                ->with('success', 'Price accepted. Proceed to payment.');
        }
    }

    /**
     * Show customer willingness to buy the product.
     */
    public function showWillingness(ProductRequest $productRequest)
    {
        if ($productRequest->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        if ($productRequest->status !== 'approved') {
            return redirect()->route('request.index')
                ->with('error', 'This request has not been approved yet.');
        }

        return Inertia::render('request/willingness', [
            'request' => [
                'id' => $productRequest->id,
                'product_name' => $productRequest->product_name,
                'description' => $productRequest->description,
                'amount' => $productRequest->amount,
                'advance_amount' => $productRequest->advance_amount,
                'final_amount' => $productRequest->final_amount,
                'currency' => $productRequest->currency,
                'admin_response' => $productRequest->admin_response,
                'image' => $productRequest->image ? asset('storage/' . $productRequest->image) : null,
            ]
        ]);
    }

    /**
     * Confirm customer willingness to buy.
     */
    public function confirmWillingness(ProductRequest $productRequest)
    {
        // Manual authorization check to avoid automatic policy resolution conflicts
        $user = Auth::user();
        
        if (!$user || $user->id !== $productRequest->user_id) {
            abort(403, 'Unauthorized action.');
        }

        if ($productRequest->status !== 'approved') {
            return redirect()->route('request.index')
                ->with('error', 'This request has not been approved yet.');
        }

        // Refresh to get latest status before marking willingness
        $productRequest->refresh();

        // Prevent workflow updates if request is terminated
        if ($productRequest->isTerminated()) {
            return redirect()->route('request.index')
                ->with('error', 'Cannot confirm willingness: This request has been terminated.');
        }
        
        $productRequest->markCustomerWillingness();
        
        // Refresh again to get updated willingness status
        $productRequest->refresh();

        return redirect()->route('product-requests.advance-payment.show', $productRequest->id)
            ->with('success', 'Thank you for confirming your willingness to buy. Please proceed with advance payment.');
    }

    /**
     * Mark customer as lost interest.
     */
    public function markLostInterest(Request $request, ProductRequest $productRequest)
    {
        if ($productRequest->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        if ($productRequest->status !== 'approved') {
            return redirect()->route('request.index')
                ->with('error', 'This request has not been approved yet.');
        }

        // Refresh to get latest status
        $productRequest->refresh();

        // Prevent lost interest if advance payment has been paid or is processing
        if ($productRequest->advance_payment_status === 'paid' || $productRequest->advance_payment_status === 'processing') {
            return redirect()->route('user.product-requests.show', $productRequest->id)
                ->with('error', 'You cannot indicate lost interest after advance payment has been made.');
        }

        $validated = $request->validate([
            'reason' => ['required', 'string', 'in:price_too_high,delivery_date_too_long,simply_lost_interest,changed_mind,found_elsewhere,other'],
            'additional_notes' => ['required_if:reason,other', 'nullable', 'string', 'max:500'],
        ], [
            'reason.required' => 'Please select a reason for losing interest.',
            'reason.in' => 'The selected reason is invalid.',
            'additional_notes.required_if' => 'Please provide additional notes when selecting "Other".',
            'additional_notes.max' => 'Additional notes cannot exceed 500 characters.',
        ]);
        
        // Build lost interest reason - if "other", combine with additional notes
        $lostInterestReason = $validated['reason'];
        if ($validated['reason'] === 'other' && !empty($validated['additional_notes'])) {
            $lostInterestReason = $validated['reason'] . ': ' . $validated['additional_notes'];
        } elseif ($validated['reason'] !== 'other') {
            // Store just the reason code for standard reasons
            $lostInterestReason = $validated['reason'];
        }
        
        // Mark as lost interest
        $productRequest->update([
            'lost_interest_at' => now(),
            'lost_interest_reason' => $lostInterestReason,
            'customer_willing_to_buy' => false, // Reset willingness
        ]);

        return redirect()->route('user.product-requests.show', $productRequest->id)
            ->with('info', 'You have indicated that you\'ve lost interest in this product request.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductRequest $productRequest)
    {
        // Check if the user owns this request
        if ($productRequest->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        // Users can only delete pending requests
        if ($productRequest->status !== 'pending') {
            return redirect()->route('request.index')
                ->with('error', 'You can only delete pending requests.');
        }

        // Delete associated image
        if ($productRequest->image) {
            Storage::disk('public')->delete($productRequest->image);
        }

        $productRequest->delete();

        return redirect()->route('request.index')
            ->with('success', 'Product request deleted successfully!');
    }

    /**
     * Get user's request history.
     */
    public function history()
    {
        $user = Auth::user();
        
        $requests = ProductRequest::where('user_id', $user->id)
            ->latest()
            ->paginate(10)
            ->through(function ($request) {
                return [
                    'id' => $request->id,
                    'product_name' => $request->product_name,
                    'description' => $request->description,
                    'status' => $request->status,
                    'image' => $request->image ? asset('storage/' . $request->image) : null,
                    'created_at' => $request->created_at,
                    'admin_response' => $request->admin_response,
                    'amount' => $request->amount,
                    'currency' => $request->currency,
                    'payment_status' => $request->payment_status,
                    'payment_method' => $request->payment_method,
                    'payment_reference' => $request->payment_reference,
                    'paid_at' => $request->paid_at,
                    'price_accepted_at' => $request->price_accepted_at,
                    'requires_payment' => $request->requiresPayment(),
                    'available' => $request->available,
                    // New procurement fields
                    'advance_amount' => $request->advance_amount,
                    'final_amount' => $request->final_amount,
                    'advance_payment_status' => $request->advance_payment_status,
                    'final_payment_status' => $request->final_payment_status,
                    'advance_paid_at' => $request->advance_paid_at,
                    'final_paid_at' => $request->final_paid_at,
                    'procurement_status' => $request->procurement_status,
                    'procurement_notes' => $request->procurement_notes,
                    'procurement_started_at' => $request->procurement_started_at,
                    'procurement_completed_at' => $request->procurement_completed_at,
                    'product_arrived_at' => $request->product_arrived_at,
                    'customer_willing_to_buy' => $request->customer_willing_to_buy,
                    'willingness_confirmed_at' => $request->willingness_confirmed_at,
                    'workflow_status' => $request->getWorkflowStatus(),
                ];
            });

        return Inertia::render('request/request-dashboard', [
            'requests' => $requests
        ]);
    }
}
