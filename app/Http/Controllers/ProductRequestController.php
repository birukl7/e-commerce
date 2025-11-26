<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequestRequest;
use App\Http\Requests\UpdateProductRequestRequest;
use App\Http\Resources\ProductRequestResource;
use App\Http\Resources\ProductRequestCollection;
use App\Models\ProductRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductRequestController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        $this->middleware('auth:api', ['except' => ['index', 'show']]);
        $this->authorizeResource(ProductRequest::class, 'productRequest', [
            'except' => ['index', 'adminIndex', 'updateStatus']
        ]);
    }

    /**
     * Display a listing of the resource for the authenticated user.
     */
    public function index()
    {
        $this->authorize('viewAny', ProductRequest::class);
        
        $requests = ProductRequest::with(['user', 'admin', 'order'])
            ->where('user_id', Auth::id())
            ->latest()
            ->paginate(15);

        return new ProductRequestCollection($requests);
    }

    /**
     * Display a listing of all product requests (admin only).
     */
    public function adminIndex(Request $request)
    {
        $this->authorize('viewAdminIndex', ProductRequest::class);
        
        $query = ProductRequest::with(['user', 'admin']);
        
        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Filter by payment status
        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }
        
        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('product_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('id', $search);
            });
        }

        $requests = $query->latest()->paginate(15);
        return new ProductRequestCollection($requests);
    }

    /**
     * Store a newly created resource in storage.
     */
    /**
     * Store a newly created product request in storage.
     *
     * @param  \App\Http\Requests\StoreProductRequestRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreProductRequestRequest $request)
    {
        $validated = $request->validated();
        
        // Handle file upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('product-requests', 'public');
            $validated['image'] = $path;
        }

        // Add user ID and default status
        $validated['user_id'] = Auth::id();
        $validated['status'] = 'pending';
        $validated['payment_status'] = 'pending';
        $validated['fulfillment_status'] = 'pending';

        $productRequest = ProductRequest::create($validated);
        $productRequest->load(['user', 'admin', 'order']);

        return new ProductRequestResource($productRequest);
    }

    /**
     * Display the specified resource.
     */
    public function show(ProductRequest $productRequest)
    {
        // Only allow the owner or admin to view the request
        // Cast to int to handle potential type mismatch (string vs int)
        if ((int)Auth::id() !== (int)$productRequest->user_id && !Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $productRequest->load(['user', 'admin', 'order']);
        return new ProductRequestResource($productRequest);
    }

    /**
     * Update the specified resource in storage.
     */
    /**
     * Update the specified product request in storage.
     *
     * @param  \App\Http\Requests\UpdateProductRequestRequest  $request
     * @param  \App\Models\ProductRequest  $productRequest
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateProductRequestRequest $request, ProductRequest $productRequest)
    {

        $validated = $request->validated();

        // Handle file upload if new image is provided
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($productRequest->image) {
                Storage::disk('public')->delete($productRequest->image);
            }
            $path = $request->file('image')->store('product-requests', 'public');
            $validated['image'] = $path;
        }

        $productRequest->update($validated);

        return response()->json($productRequest);
    }

    /**
     * Update the status of a product request (admin only).
     */
    public function updateStatus(Request $request, ProductRequest $productRequest)
    {
        $this->authorize('updateStatus', $productRequest);
        
        $validated = $request->validate([
            'status' => ['required', Rule::in(['approved', 'rejected', 'pending', 'cancelled'])],
            'admin_response' => 'required_if:status,rejected|string|nullable',
            'amount' => 'required_if:status,approved|numeric|min:0|nullable',
            'shipping_cost' => 'numeric|min:0|nullable',
            'estimated_delivery_date' => 'date|after:today|nullable',
        ]);

        // If status is being updated to approved, ensure required fields are present
        if ($validated['status'] === 'approved' && !isset($validated['amount'])) {
            return response()->json([
                'message' => 'Amount is required when approving a request',
                'errors' => ['amount' => ['The amount field is required when status is approved.']]
            ], 422);
        }

        // Add admin ID
        $validated['admin_id'] = Auth::id();
        
        // If this is an approval, set the payment status to pending
        if ($validated['status'] === 'approved') {
            $validated['payment_status'] = 'pending';
        }

        $productRequest->update($validated);

        return response()->json($productRequest);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductRequest $productRequest)
    {
        // Only allow the owner to delete their own pending request
        // Cast to int to handle potential type mismatch (string vs int)
        if ((int)Auth::id() !== (int)$productRequest->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($productRequest->status !== 'pending') {
            return response()->json([
                'message' => 'Cannot delete request after it has been processed'
            ], 422);
        }

        // Delete associated image if exists
        if ($productRequest->image) {
            Storage::disk('public')->delete($productRequest->image);
        }

        $productRequest->delete();

        return response()->json([
            'message' => 'Product request deleted successfully',
            'id' => $productRequest->id
        ]);
    }
}
