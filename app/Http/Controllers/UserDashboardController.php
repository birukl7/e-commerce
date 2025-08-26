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

    // Add these methods to your UserDashboardController class

    // Updated orders method to show all orders including failed payments
    public function orders()
    {
        $user = Auth::user();
        
        // Get user's orders with items - including ALL payment statuses
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
                'o.payment_method',
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
                
                $items = $orderGroup->whereNotNull('item_id')->map(function ($item) {
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
                    'payment_method' => $firstOrder->payment_method,
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

    public function showOrder(Order $order)
    {
        // Ensure user can only view their own orders
        if ($order->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Get order with items and product details
        $orderData = DB::table('orders as o')
            ->leftJoin('order_items as oi', 'o.id', '=', 'oi.order_id')
            ->leftJoin('products as p', 'oi.product_id', '=', 'p.id')
            ->leftJoin('product_images as pi', function($join) {
                $join->on('p.id', '=', 'pi.product_id')
                    ->where('pi.is_primary', true);
            })
            ->select([
                'o.*',
                'oi.id as item_id',
                'oi.quantity',
                'oi.price as item_price',
                'oi.total as item_total',
                'p.name as product_name',
                'p.slug as product_slug',
                'pi.image_path as primary_image',
            ])
            ->where('o.id', $order->id)
            ->get();

        if ($orderData->isEmpty()) {
            abort(404, 'Order not found');
        }

        $firstOrder = $orderData->first();
        $items = $orderData->where('item_id', '!=', null)->map(function ($item) {
            return [
                'id' => $item->item_id,
                'product_name' => $item->product_name,
                'product_slug' => $item->product_slug,
                'quantity' => $item->quantity,
                'price' => (float) $item->item_price,
                'total' => (float) $item->item_total,
                'primary_image' => $item->primary_image ? asset('storage/' . $item->primary_image) : null,
            ];
        })->toArray();

        $orderDetails = [
            'id' => $firstOrder->id,
            'order_number' => $firstOrder->order_number,
            'status' => $firstOrder->status,
            'payment_status' => $firstOrder->payment_status,
            'payment_method' => $firstOrder->payment_method,
            'currency' => $firstOrder->currency,
            'subtotal' => (float) $firstOrder->subtotal,
            'tax_amount' => (float) $firstOrder->tax_amount,
            'shipping_amount' => (float) $firstOrder->shipping_amount,
            'discount_amount' => (float) $firstOrder->discount_amount,
            'total_amount' => (float) $firstOrder->total_amount,
            'shipping_method' => $firstOrder->shipping_method,
            'created_at' => $firstOrder->created_at,
            'updated_at' => $firstOrder->updated_at,
            'shipped_at' => $firstOrder->shipped_at,
            'delivered_at' => $firstOrder->delivered_at,
            'items' => $items,
        ];

        return Inertia::render('user/order-details', [
            'order' => $orderDetails,
        ]);
    }

    public function trackOrder(Order $order)
    {
        // Ensure user can only track their own orders
        if ($order->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Create order tracking timeline
        $timeline = [];
        
        // Order placed
        $timeline[] = [
            'status' => 'ordered',
            'title' => 'Order Placed',
            'description' => 'Your order has been placed and is being processed',
            'date' => $order->created_at,
            'completed' => true,
        ];

        // Payment status
        if ($order->payment_status === 'paid') {
            $timeline[] = [
                'status' => 'paid',
                'title' => 'Payment Confirmed',
                'description' => 'Payment has been confirmed',
                'date' => $order->updated_at, // You might want to track payment date separately
                'completed' => true,
            ];
        } elseif ($order->payment_status === 'pending') {
            $timeline[] = [
                'status' => 'payment_pending',
                'title' => 'Payment Pending',
                'description' => 'Waiting for payment confirmation',
                'date' => null,
                'completed' => false,
            ];
        } elseif ($order->payment_status === 'failed') {
            $timeline[] = [
                'status' => 'payment_failed',
                'title' => 'Payment Failed',
                'description' => 'Payment could not be processed',
                'date' => $order->updated_at,
                'completed' => false,
                'error' => true,
            ];
        }

        // Processing
        if ($order->status === 'processing' && $order->payment_status === 'paid') {
            $timeline[] = [
                'status' => 'processing',
                'title' => 'Processing',
                'description' => 'Your order is being prepared for shipment',
                'date' => null,
                'completed' => true,
            ];
        } else {
            $timeline[] = [
                'status' => 'processing',
                'title' => 'Processing',
                'description' => 'Your order will be processed once payment is confirmed',
                'date' => null,
                'completed' => false,
            ];
        }

        // Shipped
        if ($order->status === 'shipped' || $order->status === 'delivered') {
            $timeline[] = [
                'status' => 'shipped',
                'title' => 'Shipped',
                'description' => 'Your order has been shipped',
                'date' => $order->shipped_at,
                'completed' => true,
            ];
        } else {
            $timeline[] = [
                'status' => 'shipped',
                'title' => 'Shipping',
                'description' => 'Your order will be shipped soon',
                'date' => null,
                'completed' => false,
            ];
        }

        // Delivered
        if ($order->status === 'delivered') {
            $timeline[] = [
                'status' => 'delivered',
                'title' => 'Delivered',
                'description' => 'Your order has been delivered',
                'date' => $order->delivered_at,
                'completed' => true,
            ];
        } else {
            $timeline[] = [
                'status' => 'delivered',
                'title' => 'Delivery',
                'description' => 'Your order will be delivered soon',
                'date' => null,
                'completed' => false,
            ];
        }

        // Handle cancelled orders
        if ($order->status === 'cancelled') {
            $timeline = [
                $timeline[0], // Keep order placed
                [
                    'status' => 'cancelled',
                    'title' => 'Order Cancelled',
                    'description' => 'Your order has been cancelled',
                    'date' => $order->updated_at,
                    'completed' => true,
                    'error' => true,
                ]
            ];
        }

        return Inertia::render('user/order-tracking', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'total_amount' => (float) $order->total_amount,
                'currency' => $order->currency,
                'created_at' => $order->created_at,
            ],
            'timeline' => $timeline,
        ]);
    }

    
}
