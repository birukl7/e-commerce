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
        $request->validate([
            'status' => ['required', 'in:pending,reviewed,approved,rejected'],
            'admin_response' => ['nullable', 'string', 'max:5000'],
        ]);

        $productRequest->update([
            'status' => $request->status,
            'admin_response' => $request->admin_response,
            'admin_id' => Auth::id(),
        ]);

        return redirect()->route('admin.product-requests.show', $productRequest->id)
                         ->with('success', 'Product request updated successfully.');
    }
}
