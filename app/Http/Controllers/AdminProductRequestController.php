<?php

namespace App\Http\Controllers;

use App\Models\ProductRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminProductRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $product_requests = ProductRequest::with('user')->latest()->get();
        return Inertia::render('admin/product-request/index', [
            'product_requests' => $product_requests,
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
        ], [
            'status.required' => 'Please select a status for this request.',
            'status.in' => 'The selected status is invalid.',
            'admin_response.max' => 'Admin response cannot exceed 5000 characters.',
        ]);

        $productRequest->update([
            'status' => $validated['status'],
            'admin_response' => $validated['admin_response'],
            'admin_id' => Auth::id(),
            'updated_at' => now(),
        ]);

        $statusMessages = [
            'pending' => 'Product request status has been set to pending.',
            'reviewed' => 'Product request has been marked as reviewed.',
            'approved' => 'Product request has been approved successfully.',
            'rejected' => 'Product request has been rejected.',
        ];

        $message = $statusMessages[$validated['status']] ?? 'Product request updated successfully.';

        return redirect()->route('admin.product-requests.show', $productRequest->id)
                         ->with('success', $message);
    }
}
