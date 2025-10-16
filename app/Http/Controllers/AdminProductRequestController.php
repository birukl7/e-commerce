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
        return Inertia::render('admin/product-request/show', [
            'product_request' => $productRequest,
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

        // If status is approved, enforce availability first and then optional payment
        if ($validated['status'] === 'approved') {
            if (empty($updateData['available'])) {
                return back()->withErrors(['available' => 'Please mark the product as available before approving.'])->withInput();
            }

            if (isset($validated['amount']) && $validated['amount'] > 0) {
                $updateData['amount'] = $validated['amount'];
                $updateData['currency'] = $validated['currency'] ?? 'ETB';
                $updateData['payment_status'] = 'pending';
            } else {
                // Clear payment-related fields if no amount set
                $updateData['amount'] = null;
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
