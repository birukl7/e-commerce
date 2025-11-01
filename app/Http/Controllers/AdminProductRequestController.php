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
        $productRequest->load(['user', 'admin']);
        
        // Load payment transactions for this product request
        $paymentTransactions = \App\Models\PaymentTransaction::where('product_request_id', $productRequest->id)
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Add workflow status and payment information
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

        if ($productRequest->advance_payment_status !== 'paid') {
            return back()->withErrors(['error' => 'Advance payment must be completed before starting procurement.'])->withInput();
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
            'status' => ['required', 'in:pending,reviewed,approved,rejected'],
            'admin_response' => ['nullable', 'string', 'max:5000'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'available' => ['nullable', 'boolean'],
        ], [
            'status.required' => 'Please select a status for this request.',
            'status.in' => 'The selected status is invalid.',
            'admin_response.max' => 'Admin response cannot exceed 5000 characters.',
            'amount.numeric' => 'Amount must be a valid number.',
            'amount.min' => 'Amount cannot be negative.',
            'currency.size' => 'Currency must be a 3-letter currency code.',
        ]);

        $updateData = [
            'status' => $validated['status'],
            'admin_response' => $validated['admin_response'],
            'admin_id' => Auth::id(),
            'updated_at' => now(),
        ];

        if (array_key_exists('available', $validated)) {
            $updateData['available'] = (bool) $validated['available'];
        }

        // If status is approved, enforce availability first and then set up payment structure
        if ($validated['status'] === 'approved') {
            if (empty($updateData['available'])) {
                return back()->withErrors(['available' => 'Please mark the product as available before approving.'])->withInput();
            }

            if (isset($validated['amount']) && $validated['amount'] > 0) {
                $totalAmount = $validated['amount'];
                $advancePercentage = 0.3; // 30% advance payment
                $advanceAmount = $totalAmount * $advancePercentage;
                $finalAmount = $totalAmount - $advanceAmount;

                $updateData['amount'] = $totalAmount;
                $updateData['advance_amount'] = $advanceAmount;
                $updateData['final_amount'] = $finalAmount;
                $updateData['currency'] = $validated['currency'] ?? 'ETB';
                $updateData['advance_payment_status'] = 'pending';
                $updateData['final_payment_status'] = 'pending';
                $updateData['payment_status'] = 'pending';
            } else {
                // Clear payment-related fields if no amount set
                $updateData['amount'] = null;
                $updateData['advance_amount'] = null;
                $updateData['final_amount'] = null;
                $updateData['currency'] = null;
            }
        }

        $productRequest->update($updateData);

        // Send notification to user about the status update
        if ($validated['status'] === 'approved' && $productRequest->amount > 0) {
            // Send payment request to user
            $productRequest->user->notify(new ProductRequestStatusUpdated(
                $productRequest,
                'Your product request has been approved. Please complete the payment to proceed.',
                'Payment Required',
                route('user.product-requests.payment', $productRequest->id)
            ));
        } else {
            // Send regular status update
            $productRequest->user->notify(new ProductRequestStatusUpdated(
                $productRequest,
                $this->getStatusUpdateMessage($validated['status'], $productRequest),
                'Request ' . ucfirst($validated['status'])
            ));
        }

        $statusMessages = [
            'pending' => 'Product request status has been set to pending.',
            'reviewed' => 'Product request has been marked as reviewed.',
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
            'approved' => $productRequest->amount > 0
                ? sprintf('Your product request has been approved. Please complete the payment of %s %s to proceed.', 
                    number_format($productRequest->amount, 2), 
                    $productRequest->currency)
                : 'Your product request has been approved.',
            'rejected' => 'Your product request has been rejected. ' . 
                ($productRequest->admin_response ? 'Reason: ' . $productRequest->admin_response : ''),
        ];

        return $messages[$status] ?? 'Your product request status has been updated.';
    }
}
