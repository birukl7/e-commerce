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
        
        $requests = ProductRequest::where('user_id', $user->id)
            ->latest()
            ->get()
            ->map(function ($request) {
                return [
                    'id' => $request->id,
                    'product_name' => $request->title,
                    'description' => $request->description,
                    'status' => $request->status,
                    'image' => $request->image ? asset('storage/' . $request->image) : null,
                    'created_at' => $request->created_at,
                    'admin_response' => $request->admin_response,
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
            'title' => $validated['product_name'],
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

        return Inertia::render('request/show', [
            'request' => [
                'id' => $productRequest->id,
                'title' => $productRequest->title,
                'product_name' => $productRequest->title,
                'description' => $productRequest->description,
                'status' => $productRequest->status,
                'admin_response' => $productRequest->admin_response,
                'amount' => $productRequest->amount,
                'currency' => $productRequest->currency,
                'payment_status' => $productRequest->payment_status,
                'payment_method' => $productRequest->payment_method,
                'payment_reference' => $productRequest->payment_reference,
                'paid_at' => $productRequest->paid_at,
                'image' => $productRequest->image ? asset('storage/' . $productRequest->image) : null,
                'created_at' => $productRequest->created_at,
                'updated_at' => $productRequest->updated_at,
                'requires_payment' => $productRequest->requiresPayment(),
            ]
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
            'title' => $validated['product_name'],
            'description' => $validated['description'],
            'image' => $imagePath,
        ]);

        return redirect()->route('request.index')
            ->with('success', 'Product request updated successfully!');
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
                    'product_name' => $request->title,
                    'description' => $request->description,
                    'status' => $request->status,
                    'image' => $request->image ? asset('storage/' . $request->image) : null,
                    'created_at' => $request->created_at,
                    'admin_response' => $request->admin_response,
                ];
            });

        return Inertia::render('request/request-dashboard', [
            'requests' => $requests
        ]);
    }
}
