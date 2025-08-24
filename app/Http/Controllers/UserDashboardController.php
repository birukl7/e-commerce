<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Wishlist;
use App\Models\ProductRequest;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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

    public function orders()
    {
        $user = Auth::user();
        
        // Get user's orders with items
        $orders = DB::table('orders as o')
            ->leftJoin('order_items as oi', 'o.id', '=', 'oi.order_id')
            ->leftJoin('products as p', 'oi.product_id', '=', 'p.id')
            ->leftJoin('product_images as pi', function($join) {
                $join->on('p.id', '=', 'pi.product_id')
                     ->where('pi.is_primary', true);
            })
            ->select([
                'o.id',
                'o.order_number',
                'o.total_amount',
                'o.status',
                'o.payment_status',
                'o.created_at',
                'o.updated_at',
                'oi.id as item_id',
                'oi.quantity',
                'oi.price as item_price',
                'p.name as product_name',
                'p.slug as product_slug',
                'pi.image_path as primary_image',
            ])
            ->where('o.user_id', $user->id)
            ->orderBy('o.created_at', 'desc')
            ->get()
            ->groupBy('id')
            ->map(function ($orderGroup) {
                $firstOrder = $orderGroup->first();
                
                $items = $orderGroup->map(function ($item) {
                    return [
                        'id' => $item->item_id,
                        'product_name' => $item->product_name,
                        'product_slug' => $item->product_slug,
                        'quantity' => $item->quantity,
                        'price' => (float) $item->item_price,
                        'primary_image' => $item->primary_image ? asset('storage/' . $item->primary_image) : null,
                    ];
                })->toArray();

                return [
                    'id' => $firstOrder->id,
                    'order_number' => $firstOrder->order_number,
                    'total_amount' => (float) $firstOrder->total_amount,
                    'status' => $firstOrder->status,
                    'payment_status' => $firstOrder->payment_status,
                    'created_at' => $firstOrder->created_at,
                    'updated_at' => $firstOrder->updated_at,
                    'items' => $items,
                ];
            })
            ->values()
            ->toArray();

        return Inertia::render('user/orders', [
            'orders' => $orders,
        ]);
    }
}
