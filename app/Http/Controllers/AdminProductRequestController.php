<?php

namespace App\Http\Controllers;

use App\Models\ProductRequest;
use App\Notifications\ProductRequestStatusUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminProductRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = ProductRequest::with('user')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->string('payment_status'));
        }

        if ($request->filled('available')) {
            $available = filter_var($request->input('available'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if (!is_null($available)) {
                $query->where('available', $available);
            }
        }

        $product_requests = $query->paginate(20)->withQueryString();
        
        // Add workflow status to each product request
        $product_requests->getCollection()->transform(function ($productRequest) {
            $productRequest->workflow_status = $productRequest->getWorkflowStatus();
            return $productRequest;
        });
        
        return Inertia::render('admin/product-request/index', [
            'product_requests' => $product_requests,
            'filters' => [
                'status' => $request->input('status'),
                'payment_status' => $request->input('payment_status'),
                'available' => $request->input('available'),
            ],
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(ProductRequest $productRequest)
    {
        // Refresh the model to get latest payment status from database
        $productRequest->refresh();
        
        $productRequest->load(['user', 'admin']);
        
        // Load payment transactions for this product request
        $paymentTransactions = \App\Models\PaymentTransaction::where('product_request_id', $productRequest->id)
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Add workflow status and payment information AFTER refreshing
        // This ensures we calculate workflow_status based on the latest payment status
        $productRequest->workflow_status = $productRequest->getWorkflowStatus();
        
        return Inertia::render('admin/product-request/show', [
            'product_request' => $productRequest,
            'payment_transactions' => $paymentTransactions,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ProductRequest $productRequest)
    {
        $productRequest->load('user');
        return Inertia::render('admin/product-request/edit', [
            'product_request' => $productRequest,
        ]);
    }

    /**
     * Start procurement for a product request.
     */
    public function startProcurement(Request $request, ProductRequest $productRequest)
    {
        $validated = $request->validate([
            'procurement_expected_completion_date' => ['required', 'date', 'after:today'],
            'procurement_notes' => ['nullable', 'string', 'max:5000'],
        ], [
            'procurement_expected_completion_date.required' => 'Please set an expected completion date.',
            'procurement_expected_completion_date.date' => 'The expected completion date must be a valid date.',
            'procurement_expected_completion_date.after' => 'The expected completion date must be in the future.',
        ]);

        // Refresh to get latest payment status
        $productRequest->refresh();
        
        // Prevent workflow updates if request is terminated
        if ($productRequest->isTerminated()) {
            return back()->withErrors(['error' => 'Cannot start procurement: Product request is terminated (rejected or customer lost interest).'])->withInput();
        }
        
        // Allow starting procurement if payment is either 'paid' or 'processing' (admin can approve and start procurement)
        // But for now, we require 'paid' status for procurement (admin should approve payment first)
        if ($productRequest->advance_payment_status !== 'paid') {
            return back()->withErrors(['error' => 'Advance payment must be approved before starting procurement.'])->withInput();
        }

        $productRequest->startProcurement(
            $validated['procurement_expected_completion_date'],
            $validated['procurement_notes'] ?? null
        );

        // Calculate days until arrival
        $arrivalDate = \Carbon\Carbon::parse($validated['procurement_expected_completion_date']);
        $daysUntilArrival = now()->diffInDays($arrivalDate);
        
        // Send notification to customer
        $productRequest->user->notify(new ProductRequestStatusUpdated(
            $productRequest,
            sprintf(
                'Great news! We have started getting the product for you. It will arrive in %d %s (by %s).',
                $daysUntilArrival,
                $daysUntilArrival === 1 ? 'day' : 'days',
                $arrivalDate->format('F j, Y')
            ),
            'We\'re Getting Your Product',
            route('user.product-requests.show', $productRequest->id)
        ));

        return redirect()->route('admin.product-requests.show', $productRequest->id)
                         ->with('success', 'Started getting the product. Customer has been notified.');
    }

    /**
     * Complete procurement for a product request.
     */
    public function completeProcurement(Request $request, ProductRequest $productRequest)
    {
        $validated = $request->validate([
            'procurement_notes' => ['nullable', 'string', 'max:5000'],
        ]);

        // Refresh to get latest status
        $productRequest->refresh();

        // Prevent workflow updates if request is terminated
        if ($productRequest->isTerminated()) {
            return back()->withErrors(['error' => 'Cannot complete procurement: Product request is terminated (rejected or customer lost interest).'])->withInput();
        }

        if ($productRequest->procurement_status !== 'in_progress') {
            return back()->withErrors(['error' => 'Procurement must be in progress before it can be completed.'])->withInput();
        }

        // Ensure procurement was started (additional validation)
        if (!$productRequest->procurement_started_at) {
            return back()->withErrors(['error' => 'Procurement has not been started yet.'])->withInput();
        }

        $productRequest->completeProcurement($validated['procurement_notes'] ?? null);
        $productRequest->markProductArrived();

        // Send notification to customer
        $productRequest->user->notify(new ProductRequestStatusUpdated(
            $productRequest,
            'Your product has arrived! Please complete the final payment to proceed with delivery. You can now pay the remaining amount.',
            'Product Arrived - Payment Required',
            route('user.product-requests.show', $productRequest->id)
        ));

        return redirect()->route('admin.product-requests.show', $productRequest->id)
                         ->with('success', 'Product marked as arrived. Customer has been notified to pay the remaining amount.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProductRequest $productRequest)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,approved,rejected'],
            'admin_response' => ['nullable', 'string', 'max:5000'],
            'rejection_reason' => ['required_if:status,rejected', 'nullable', 'string', 'in:product_not_available,specifications_not_matching,out_of_stock,discontinued,other'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'estimated_arrival_date' => ['nullable', 'date', 'after_or_equal:today'],
            'currency' => ['nullable', 'string', 'size:3'],
            'available' => ['nullable', 'boolean'],
        ], [
            'status.required' => 'Please select a status for this request.',
            'status.in' => 'The selected status is invalid.',
            'admin_response.max' => 'Admin response cannot exceed 5000 characters.',
            'rejection_reason.required_if' => 'Please select a reason for rejection.',
            'rejection_reason.in' => 'The selected rejection reason is invalid.',
            'amount.numeric' => 'Amount must be a valid number.',
            'amount.min' => 'Amount cannot be negative.',
            'estimated_arrival_date.date' => 'Estimated arrival date must be a valid date.',
            'estimated_arrival_date.after_or_equal' => 'Estimated arrival date must be today or in the future.',
            'currency.size' => 'Currency must be a 3-letter currency code.',
        ]);

        $updateData = [
            'status' => $validated['status'],
            'admin_response' => $validated['admin_response'] ?? null,
            'rejection_reason' => $validated['rejection_reason'] ?? null,
            'admin_id' => Auth::id(),
            'updated_at' => now(),
        ];

        if (array_key_exists('available', $validated)) {
            $updateData['available'] = (bool) $validated['available'];
        }

        // If status is approved, set up payment structure
        if ($validated['status'] === 'approved') {
            if (isset($validated['amount']) && $validated['amount'] > 0) {
                $totalAmount = $validated['amount'];
                $advancePercentage = 0.3; // 30% advance payment
                $advanceAmount = $totalAmount * $advancePercentage;
                $finalAmount = $totalAmount - $advanceAmount;

                $updateData['amount'] = $totalAmount;
                $updateData['advance_amount'] = $advanceAmount;
                $updateData['final_amount'] = $finalAmount;
                $updateData['currency'] = $validated['currency'] ?? 'ETB';
                $updateData['estimated_arrival_date'] = $validated['estimated_arrival_date'] ?? null;
                $updateData['advance_payment_status'] = 'pending';
                $updateData['final_payment_status'] = 'pending';
                $updateData['payment_status'] = 'pending';
            } else {
                // Clear payment-related fields if no amount set
                $updateData['amount'] = null;
                $updateData['advance_amount'] = null;
                $updateData['final_amount'] = null;
                $updateData['currency'] = null;
                $updateData['estimated_arrival_date'] = null;
            }
        } else {
            // If status is not approved, clear estimated_arrival_date
            $updateData['estimated_arrival_date'] = null;
        }

        $productRequest->update($updateData);

        // Send notification to user about the status update
        $productRequest->refresh(); // Refresh to get latest data including rejection_reason
        
        if ($validated['status'] === 'approved' && $productRequest->amount > 0) {
            // Send payment request to user
            $productRequest->user->notify(new ProductRequestStatusUpdated(
                $productRequest,
                'Your product request has been approved. Please complete the payment to proceed.',
                'Payment Required',
                route('user.product-requests.payment', $productRequest->id)
            ));
        } else {
            // Send regular status update with appropriate message
            $notificationMessage = $this->getStatusUpdateMessage($validated['status'], $productRequest);
            $notificationSubject = $validated['status'] === 'rejected' 
                ? 'Product Request Rejected' 
                : 'Request ' . ucfirst($validated['status']);
            
            $productRequest->user->notify(new ProductRequestStatusUpdated(
                $productRequest,
                $notificationMessage,
                $notificationSubject
            ));
        }

        $statusMessages = [
            'pending' => 'Product request status has been set to pending.',
            'approved' => $productRequest->amount > 0 
                ? 'Product request has been approved. A payment request has been sent to the user.'
                : 'Product request has been approved successfully.',
            'rejected' => 'Product request has been rejected.',
        ];

        $message = $statusMessages[$validated['status']] ?? 'Product request updated successfully.';

        return redirect()->route('admin.product-requests.show', $productRequest->id)
                         ->with('success', $message);
    }

    /**
     * Get the status update message for notifications.
     */
    protected function getStatusUpdateMessage($status, ProductRequest $productRequest)
    {
        $messages = [
            'pending' => 'Your product request is pending review.',
            'reviewed' => 'Your product request is being reviewed.',
            'approved' => $this->getApprovalMessage($productRequest),
            'rejected' => $this->getRejectionMessage($productRequest),
        ];

        return $messages[$status] ?? 'Your product request status has been updated.';
    }

    /**
     * Get approval message with pricing and arrival date.
     */
    protected function getApprovalMessage(ProductRequest $productRequest): string
    {
        $message = 'Your product request has been approved!';
        
        if ($productRequest->amount > 0) {
            $message .= sprintf(' The total cost is %s %s.', 
                number_format($productRequest->amount, 2), 
                $productRequest->currency);
            
            if ($productRequest->estimated_arrival_date) {
                $message .= sprintf(' Expected arrival: %s.', 
                    $productRequest->estimated_arrival_date->format('F j, Y'));
            }
            
            $message .= ' Please review the details and confirm your willingness to proceed.';
        } else {
            $message .= ' ' . ($productRequest->admin_response ?? '');
        }
        
        return $message;
    }

    /**
     * Get rejection message based on rejection reason.
     */
    protected function getRejectionMessage(ProductRequest $productRequest): string
    {
        $baseMessage = 'We regret to inform you that your product request has been rejected.';
        
        if (!$productRequest->rejection_reason) {
            return $baseMessage . ($productRequest->admin_response ? ' ' . $productRequest->admin_response : '');
        }

        $reasonMessages = [
            'product_not_available' => 'Unfortunately, the product you requested is not available at this time. We are unable to source this product from our suppliers.',
            'specifications_not_matching' => 'We were unable to find a product that matches your exact specifications. The available options do not meet the requirements you specified.',
            'out_of_stock' => 'The product is currently out of stock with our suppliers and is not expected to be available in the foreseeable future.',
            'discontinued' => 'The product has been discontinued by the manufacturer and is no longer available in the market.',
            'other' => 'Your product request could not be fulfilled for the reasons specified below.',
        ];

        $reasonMessage = $reasonMessages[$productRequest->rejection_reason] ?? $baseMessage;
        
        // Add admin response if provided
        if ($productRequest->admin_response) {
            $reasonMessage .= "\n\nAdditional Information: " . $productRequest->admin_response;
        }

        return $reasonMessage;
    }
}
