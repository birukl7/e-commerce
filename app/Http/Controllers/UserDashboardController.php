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
        
        // Get user's orders with items and payment transaction status
        $orders = DB::table('orders as o')
            ->leftJoin('order_items as oi', 'o.id', '=', 'oi.order_id')
            ->leftJoin('products as p', 'oi.product_id', '=', 'p.id')
            ->leftJoin('product_images as pi', function($join) {
                $join->on('p.id', '=', 'pi.product_id')
                    ->where('pi.is_primary', true);
            })
            ->leftJoin('payment_transactions as pt', 'o.id', '=', 'pt.order_id')
            ->select([
                'o.id',
                'o.order_number',
                'o.total_amount',
                'o.status',
                'o.payment_status',
                'o.payment_method',
                'o.created_at',
                'o.updated_at',
                'pt.gateway_status',
                'pt.admin_status',
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

                // Determine actual order status based on persisted order first.
                // Only fall back to payment transaction when order is still pending/unpaid.
                $actualStatus = $firstOrder->status;
                $actualPaymentStatus = $firstOrder->payment_status;

                // Normalize: if order has progressed but payment_status is still pending, assume paid
                if (in_array($actualStatus, ['processing', 'shipped', 'delivered'], true) && $actualPaymentStatus === 'pending') {
                    $actualPaymentStatus = 'paid';
                }

                $isOrderFinalized = in_array($firstOrder->payment_status, ['paid', 'completed', 'rejected', 'refunded'], true)
                    || in_array($firstOrder->status, ['processing', 'shipped', 'delivered', 'cancelled'], true);

                if (!$isOrderFinalized && $firstOrder->gateway_status && $firstOrder->admin_status) {
                    if ($firstOrder->gateway_status === 'paid' && $firstOrder->admin_status === 'approved') {
                        $actualStatus = 'processing';
                        $actualPaymentStatus = 'paid';
                    } elseif ($firstOrder->gateway_status === 'proof_uploaded' && $firstOrder->admin_status === 'unseen') {
                        $actualStatus = 'awaiting_admin_approval';
                        $actualPaymentStatus = 'pending_approval';
                    } elseif ($firstOrder->admin_status === 'approved' && $firstOrder->gateway_status === 'proof_uploaded') {
                        // Offline flow: admin approved with proof uploaded
                        $actualStatus = 'processing';
                        $actualPaymentStatus = 'paid';
                    } elseif ($firstOrder->admin_status === 'rejected') {
                        $actualStatus = 'payment_rejected';
                        $actualPaymentStatus = 'rejected';
                    }
                }

                return [
                    'id' => $firstOrder->id,
                    'order_number' => $firstOrder->order_number,
                    'total_amount' => (float) $firstOrder->total_amount,
                    'status' => $actualStatus,
                    'payment_status' => $actualPaymentStatus,
                    'payment_method' => $firstOrder->payment_method,
                    'gateway_status' => $firstOrder->gateway_status,
                    'admin_status' => $firstOrder->admin_status,
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

        // Get order with items, product details, and payment transaction
        $orderData = DB::table('orders as o')
            ->leftJoin('order_items as oi', 'o.id', '=', 'oi.order_id')
            ->leftJoin('products as p', 'oi.product_id', '=', 'p.id')
            ->leftJoin('product_images as pi', function($join) {
                $join->on('p.id', '=', 'pi.product_id')
                    ->where('pi.is_primary', true);
            })
            ->leftJoin('payment_transactions as pt', 'o.id', '=', 'pt.order_id')
            ->select([
                'o.*',
                'oi.id as item_id',
                'oi.quantity',
                'oi.price as item_price',
                'oi.total as item_total',
                'p.name as product_name',
                'p.slug as product_slug',
                'pi.image_path as primary_image',
                'pt.payment_method as actual_payment_method',
                'pt.gateway_status',
                'pt.admin_status',
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

        // Apply same status normalization as orders list
        $actualStatus = $firstOrder->status;
        $actualPaymentStatus = $firstOrder->payment_status;
        
        // For Chapa payments, require both gateway paid AND admin approval
        // For offline payments, require admin approval of proof upload
        if ($firstOrder->gateway_status && $firstOrder->admin_status) {
            if ($firstOrder->gateway_status === 'paid' && $firstOrder->admin_status === 'approved') {
                $actualStatus = 'processing';
                $actualPaymentStatus = 'paid';
            } elseif ($firstOrder->gateway_status === 'proof_uploaded' && $firstOrder->admin_status === 'approved') {
                $actualStatus = 'processing';
                $actualPaymentStatus = 'paid';
            } elseif ($firstOrder->gateway_status === 'paid' && $firstOrder->admin_status === 'unseen') {
                $actualStatus = 'awaiting_admin_approval';
                $actualPaymentStatus = 'pending_approval';
            } elseif ($firstOrder->gateway_status === 'proof_uploaded' && $firstOrder->admin_status === 'unseen') {
                $actualStatus = 'awaiting_admin_approval';
                $actualPaymentStatus = 'pending_approval';
            } elseif ($firstOrder->admin_status === 'rejected') {
                $actualStatus = 'payment_rejected';
                $actualPaymentStatus = 'rejected';
            }
        }
        
        // Remove duplicate payment method assignment - will be set below
        
        // Get payment transaction data for better context
        $paymentTransaction = \App\Models\PaymentTransaction::where('order_id', $order->id)->first();
        
        // Determine payment method type based on tx_ref pattern
        $paymentMethodType = 'Unknown';
        if ($paymentTransaction) {
            if (str_starts_with($paymentTransaction->tx_ref, 'TX-')) {
                $paymentMethodType = 'Chapa Online Payment';
                $actualPaymentMethod = $paymentTransaction->payment_method ?: $firstOrder->payment_method ?: 'chapa';
            } elseif (str_starts_with($paymentTransaction->tx_ref, 'OFFLINE-')) {
                $paymentMethodType = 'Offline Payment';
                $actualPaymentMethod = $paymentTransaction->payment_method ?: 'offline';
            } else {
                $actualPaymentMethod = $paymentTransaction->payment_method ?: $firstOrder->payment_method ?: 'N/A';
            }
        } else {
            $actualPaymentMethod = $firstOrder->payment_method ?: 'N/A';
        }
        
        $orderDetails = [
            'id' => $firstOrder->id,
            'order_number' => $firstOrder->order_number,
            'status' => $actualStatus,
            'payment_status' => $actualPaymentStatus,
            'payment_method' => $actualPaymentMethod,
            'payment_method_type' => $paymentMethodType,
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

        // Apply same status normalization for tracking
        $actualStatus = $order->status;
        $actualPaymentStatus = $order->payment_status;
        
        if (in_array($actualStatus, ['processing', 'shipped', 'delivered'], true) && $actualPaymentStatus === 'pending') {
            $actualPaymentStatus = 'paid';
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

        // Get payment transaction for detailed status
        $paymentTransaction = \App\Models\PaymentTransaction::where('order_id', $order->id)->first();
        $paymentMethodType = 'Unknown Payment';
        if ($paymentTransaction) {
            if (str_starts_with($paymentTransaction->tx_ref, 'TX-')) {
                $paymentMethodType = 'Chapa Online Payment';
            } elseif (str_starts_with($paymentTransaction->tx_ref, 'OFFLINE-')) {
                $paymentMethodType = 'Offline Payment';
            }
        }

        // Enhanced payment status tracking
        if ($actualPaymentStatus === 'paid') {
            // Payment received step
            $timeline[] = [
                'status' => 'payment_received',
                'title' => 'Payment Received',
                'description' => "Payment received via {$paymentMethodType}",
                'date' => $order->updated_at,
                'completed' => true,
            ];
            
            // Admin approval step
            $timeline[] = [
                'status' => 'admin_approved',
                'title' => 'Payment Approved',
                'description' => 'Payment has been reviewed and approved by admin',
                'date' => $order->updated_at,
                'completed' => true,
            ];
        } elseif ($actualPaymentStatus === 'pending_approval') {
            // Payment received step
            $timeline[] = [
                'status' => 'payment_received',
                'title' => 'Payment Received',
                'description' => "Payment received via {$paymentMethodType}",
                'date' => $order->updated_at,
                'completed' => true,
            ];
            
            // Awaiting admin approval step
            $timeline[] = [
                'status' => 'awaiting_admin_approval',
                'title' => 'Awaiting Admin Approval',
                'description' => 'Payment is being reviewed by admin for approval',
                'date' => null,
                'completed' => false,
            ];
        } elseif ($actualPaymentStatus === 'pending') {
            $timeline[] = [
                'status' => 'payment_pending',
                'title' => 'Payment Pending',
                'description' => 'Waiting for payment confirmation',
                'date' => null,
                'completed' => false,
            ];
        } elseif ($actualPaymentStatus === 'rejected') {
            $timeline[] = [
                'status' => 'payment_rejected',
                'title' => 'Payment Rejected',
                'description' => 'Payment was rejected by admin',
                'date' => $order->updated_at,
                'completed' => false,
                'error' => true,
            ];
        } elseif ($actualPaymentStatus === 'failed') {
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
        if ($actualStatus === 'processing' && $actualPaymentStatus === 'paid') {
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
        if ($actualStatus === 'shipped' || $actualStatus === 'delivered') {
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
        if ($actualStatus === 'delivered') {
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
        if ($actualStatus === 'cancelled') {
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
                'status' => $actualStatus,
                'payment_status' => $actualPaymentStatus,
                'total_amount' => (float) $order->total_amount,
                'currency' => $order->currency,
                'created_at' => $order->created_at,
            ],
            'timeline' => $timeline,
        ]);
    }

    
}
