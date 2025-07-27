<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ProductRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

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
                    'product_name' => $request->product_name,
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
            'product_name' => $validated['product_name'],
            'description' => $validated['description'],
            'image' => $imagePath,
            'status' => 'pending',
            'admin_response' => '',
        ]);

        return redirect()->back()->with('success', 'Product request submitted successfully!');
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
                ];
            });

        return Inertia::render('request/request-dashboard', [
            'requests' => $requests
        ]);
    }
}
