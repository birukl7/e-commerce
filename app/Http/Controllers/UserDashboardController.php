<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Wishlist;
use App\Models\ProductRequest;
use Illuminate\Support\Facades\Auth;

class UserDashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // Get dashboard statistics
        $stats = [
            'wishlist_count' => $user->wishlists()->count(),
            'requests_count' => ProductRequest::where('user_id', $user->id)->count(),
            'pending_requests' => ProductRequest::where('user_id', $user->id)->where('status', 'pending')->count(),
            'approved_requests' => ProductRequest::where('user_id', $user->id)->where('status', 'approved')->count(),
        ];

        // Get recent wishlist items (last 3)
        $recentWishlist = $user->wishlistProducts()
            ->with(['images', 'category', 'brand'])
            ->latest('wishlists.created_at')
            ->take(3)
            ->get()
            ->map(function ($product) {
                $primaryImage = $product->images->where('is_primary', true)->first()
                             ?? $product->images->first();
                
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => (float) $product->price,
                    'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
                    'current_price' => (float) ($product->sale_price ?? $product->price),
                    'image' => $primaryImage ? asset('image' . $primaryImage->image_path) : asset('image/placeholder.jpg'),
                    'category' => $product->category ? $product->category->name : null,
                    'brand' => $product->brand ? $product->brand->name : null,
                    'stock_status' => $product->stock_status,
                    'added_at' => $product->pivot->created_at,
                ];
            });

        // Get recent requests (last 3)
        $recentRequests = ProductRequest::where('user_id', $user->id)
            ->latest()
            ->take(3)
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

        return Inertia::render('user/dashboard', [
            'stats' => $stats,
            'recentWishlist' => $recentWishlist,
            'recentRequests' => $recentRequests,
        ]);
    }
}
