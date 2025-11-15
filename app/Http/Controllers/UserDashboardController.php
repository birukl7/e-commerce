<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Wishlist;
use App\Models\ProductRequest;
use App\Models\Order;
use App\Models\ChapaPaymentMethod;
use App\Services\ImageUrlService;
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
        
        // First get all orders for the user, sorted by newest first
        // Get orders separately to avoid join issues
        $orders = DB::table('orders as o')
            ->select([
                'o.id',
                'o.order_number',
                'o.status',
                'o.payment_status',
                'o.payment_method',
                'o.total_amount',
                'o.currency',
                'o.created_at',
                'o.updated_at',
            ])
            ->where('o.user_id', $user->id)
            ->orderBy('o.created_at', 'desc')
            ->orderBy('o.id', 'desc') // Secondary sort to ensure consistent ordering
            ->get();
            
        // Get all order items for the user's orders
        $orderItems = [];
        if ($orders->isNotEmpty()) {
            $orderIds = $orders->pluck('id')->toArray();
            
            $items = DB::table('order_items as oi')
                ->join('products as p', 'oi.product_id', '=', 'p.id')
                ->leftJoin('product_images as pi', function($join) {
                    $join->on('p.id', '=', 'pi.product_id')
                        ->where('pi.is_primary', true);
                })
                ->select([
                    'oi.order_id',
                    'oi.id as item_id',
                    'oi.quantity',
                    'oi.price as item_price',
                    'p.name as product_name',
                    'p.slug as product_slug',
                    'pi.image_path as primary_image',
                ])
                ->whereIn('oi.order_id', $orderIds)
                ->get();
                
            // Group items by order_id
            foreach ($items as $item) {
                $orderItems[$item->order_id][] = $item;
            }
        }
        
        // Get payment transactions with rejection reasons for orders that have them
        // Handle both numeric order_id (numeric) and order_number (string) cases
        $orderIds = $orders->pluck('id')->toArray();
        $orderNumbers = $orders->pluck('order_number')->toArray();
        
        // Create a lookup map for orders by order_number and by amount
        $ordersByNumber = $orders->keyBy('order_number');
        $ordersByAmount = $orders->groupBy('total_amount');
        
        // Get all payment transactions that might match these orders
        // Include transactions with null order_id that might match by amount and user
        $allPaymentTransactions = \App\Models\PaymentTransaction::with('rejectionReason')
            ->whereNull('deleted_at')
            ->where('customer_email', $user->email)
            ->where(function($query) use ($orderIds, $orderNumbers, $orders) {
                // Match when order_id is numeric and in orderIds
                if (!empty($orderIds)) {
                    $query->where(function($q) use ($orderIds) {
                        foreach ($orderIds as $orderId) {
                            $q->orWhereRaw('CAST(order_id AS UNSIGNED) = ?', [$orderId]);
                        }
                    });
                }
                // OR when order_id is a string and in orderNumbers
                if (!empty($orderNumbers)) {
                    $query->orWhereIn('order_id', $orderNumbers);
                }
                // OR when order_id is null, try to match by amount and time window
                $query->orWhere(function($q) use ($orders) {
                    $q->whereNull('order_id');
                    // For each order, check if there's a payment transaction with matching amount
                    // created within 1 hour of the order
                    foreach ($orders as $order) {
                        $q->orWhere(function($subQ) use ($order) {
                            $subQ->where('amount', $order->total_amount)
                                 ->whereBetween('created_at', [
                                     date('Y-m-d H:i:s', strtotime($order->created_at) - 3600),
                                     date('Y-m-d H:i:s', strtotime($order->created_at) + 3600)
                                 ]);
                        });
                    }
                });
            })
            ->get();
        
        // Create a mapping of order_id -> payment transaction
        // Handle both numeric IDs, order_number strings, and null order_id with amount matching
        $paymentTransactionsByOrder = [];
        foreach ($allPaymentTransactions as $pt) {
            // Try to match by numeric order_id
            if (is_numeric($pt->order_id) && in_array((int)$pt->order_id, $orderIds)) {
                $paymentTransactionsByOrder[(int)$pt->order_id] = $pt;
            }
            // Also try to match by order_number
            elseif (in_array($pt->order_id, $orderNumbers)) {
                $matchingOrder = $ordersByNumber->get($pt->order_id);
                if ($matchingOrder) {
                    $paymentTransactionsByOrder[$matchingOrder->id] = $pt;
                }
            }
            // Try to match by amount and time when order_id is null
            elseif (empty($pt->order_id)) {
                $matchingOrders = $orders->filter(function($order) use ($pt) {
                    return abs((float)$order->total_amount - (float)$pt->amount) < 0.01 // Amount matches (within 1 cent)
                        && abs(strtotime($order->created_at) - strtotime($pt->created_at)) < 3600; // Within 1 hour
                });
                
                if ($matchingOrders->isNotEmpty()) {
                    // Use the most recent matching order
                    $matchingOrder = $matchingOrders->sortByDesc('created_at')->first();
                    if ($matchingOrder && !isset($paymentTransactionsByOrder[$matchingOrder->id])) {
                        $paymentTransactionsByOrder[$matchingOrder->id] = $pt;
                    }
                }
            }
        }
        
        // Process and group orders with their items and payment transactions
        $orders = $orders->map(function ($order) use ($orderItems, $paymentTransactionsByOrder) {
            // Add items to each order
            $items = collect($orderItems[$order->id] ?? [])
                ->map(function ($item) {
                    return [
                        'id' => $item->item_id,
                        'product_name' => $item->product_name,
                        'product_slug' => $item->product_slug,
                        'quantity' => $item->quantity,
                        'price' => (float) $item->item_price,
                        'total' => (float) $item->item_price * $item->quantity,
                        'primary_image' => ImageUrlService::formatImageUrl($item->primary_image),
                    ];
                })->toArray();
                
            // Get first product name for display
            $firstProduct = $items[0] ?? null;
            $productSummary = $firstProduct ? 
                $firstProduct['product_name'] . 
                (count($items) > 1 ? ' +' . (count($items) - 1) . ' more' : '') : 
                'No items';
                
            // Get payment transaction for this order if it exists
            $paymentTransaction = $paymentTransactionsByOrder[$order->id] ?? null;
            $txRef = $paymentTransaction ? $paymentTransaction->tx_ref : null;
            $gatewayStatus = $paymentTransaction ? $paymentTransaction->gateway_status : null;
            $adminStatus = $paymentTransaction ? $paymentTransaction->admin_status : null;
            
            // Get payment method type from payment_method and tx_ref
            $paymentMethodType = 'Unknown';
            if ($order->payment_method === 'offline') {
                $paymentMethodType = 'Offline';
            } elseif ($this->isChapaPaymentMethod($order->payment_method)) {
                $paymentMethodType = 'Online';
            } elseif ($txRef) {
                if (str_starts_with($txRef, 'TX-')) {
                    $paymentMethodType = 'Online';
                } elseif (str_starts_with($txRef, 'OFFLINE-')) {
                    $paymentMethodType = 'Offline';
                }
            }
                
            // Determine actual order status based on persisted order first.
            // Only fall back to payment transaction when order is still pending/unpaid.
            $actualStatus = $order->status;
            $actualPaymentStatus = $order->payment_status;

                // Normalize: if order has progressed but payment_status is still pending, assume paid
                if (in_array($actualStatus, ['processing', 'shipped', 'delivered'], true) && $actualPaymentStatus === 'pending') {
                    $actualPaymentStatus = 'paid';
                }

                $isOrderFinalized = in_array($order->payment_status, ['paid', 'completed', 'rejected', 'refunded'], true)
                    || in_array($order->status, ['processing', 'shipped', 'delivered', 'cancelled'], true);

                if (!$isOrderFinalized && $gatewayStatus && $adminStatus) {
                    if ($gatewayStatus === 'paid' && $adminStatus === 'approved') {
                        $actualStatus = 'processing';
                        $actualPaymentStatus = 'paid';
                    } elseif ($gatewayStatus === 'proof_uploaded' && $adminStatus === 'unseen') {
                        $actualStatus = 'pending_payment_approval';
                        $actualPaymentStatus = 'pending_approval';
                    } elseif ($adminStatus === 'approved' && $gatewayStatus === 'proof_uploaded') {
                        // Offline flow: admin approved with proof uploaded
                        $actualStatus = 'processing';
                        $actualPaymentStatus = 'paid';
                    } elseif ($adminStatus === 'rejected') {
                        $actualStatus = 'payment_rejected';
                        $actualPaymentStatus = 'rejected';
                    }
                }
                
                // Also check payment transaction for rejected status even if order is finalized
                if ($adminStatus === 'rejected') {
                    $actualStatus = 'payment_rejected';
                    $actualPaymentStatus = 'rejected';
                }

                $orderData = [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $actualStatus,
                    'payment_status' => $actualPaymentStatus,
                    'payment_method' => $this->formatPaymentMethod($order->payment_method),
                    'payment_type' => $paymentMethodType,
                    'tx_ref' => $txRef,
                    'total_amount' => (float) $order->total_amount,
                    'currency' => $order->currency,
                    'created_at' => $order->created_at,
                    'updated_at' => $order->updated_at,
                    'items' => $items,
                    'item_count' => count($items),
                    'product_summary' => $productSummary,
                    'first_item_image' => $firstProduct['primary_image'] ?? null,
                ];
                
                // Add payment transaction data if it exists (for all statuses, not just rejected)
                if ($paymentTransaction) {
                    $orderData['paymentTransaction'] = [
                        'id' => $paymentTransaction->id,
                        'admin_status' => $paymentTransaction->admin_status,
                        'gateway_status' => $paymentTransaction->gateway_status,
                        'rejection_reason_code' => $paymentTransaction->rejection_reason_code,
                        'rejection_reason' => $paymentTransaction->rejectionReason ? [
                            'reason_text' => $paymentTransaction->rejectionReason->reason_text,
                            'description' => $paymentTransaction->rejectionReason->description,
                        ] : null,
                        'admin_notes' => $paymentTransaction->admin_notes,
                    ];
                }
                
                return $orderData;
            })
            ->values()
            ->toArray();

        // Orders already have payment transaction data from the map above
        // Just ensure they're sorted correctly
        $ordersWithPayments = collect($orders)
        ->sortByDesc(function ($order) {
            // Ensure orders are sorted by created_at descending (newest first)
            return $order['created_at'];
        })
        ->values()
        ->toArray();

        return Inertia::render('user/orders', [
            'orders' => $ordersWithPayments,
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
                'pt.id as payment_transaction_id',
                'pt.payment_method as actual_payment_method',
                'pt.gateway_status',
                'pt.admin_status',
                'pt.rejection_reason_code',
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
                'primary_image' => ImageUrlService::formatImageUrl($item->primary_image),
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

        // Create payment timeline similar to trackOrder
        $timeline = [];
        
        // Order placed
        $timeline[] = [
            'status' => 'ordered',
            'title' => 'Order Placed',
            'description' => 'Your order has been placed and is being processed',
            'date' => $firstOrder->created_at,
            'completed' => true,
        ];

        // Enhanced payment status tracking
        if ($actualPaymentStatus === 'paid') {
            // Payment received step
            $timeline[] = [
                'status' => 'payment_received',
                'title' => 'Payment Received',
                'description' => "Payment received via {$paymentMethodType}",
                'date' => $firstOrder->updated_at,
                'completed' => true,
            ];
            
            // Admin approval step
            $timeline[] = [
                'status' => 'admin_approved',
                'title' => 'Payment Approved',
                'description' => 'Payment has been reviewed and approved by admin',
                'date' => $firstOrder->updated_at,
                'completed' => true,
            ];
        } elseif ($actualPaymentStatus === 'pending_approval') {
            // Payment received step
            $timeline[] = [
                'status' => 'payment_received',
                'title' => 'Payment Received',
                'description' => "Payment received via {$paymentMethodType}",
                'date' => $firstOrder->updated_at,
                'completed' => true,
            ];
            
            // Awaiting admin approval step
            $timeline[] = [
                'status' => 'pending_payment_approval',
                'title' => 'Pending Payment Approval',
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
                'date' => $firstOrder->updated_at,
                'completed' => false,
                'error' => true,
            ];
        } elseif ($actualPaymentStatus === 'failed') {
            $timeline[] = [
                'status' => 'payment_failed',
                'title' => 'Payment Failed',
                'description' => 'Payment could not be processed',
                'date' => $firstOrder->updated_at,
                'completed' => false,
                'error' => true,
            ];
        }

        // Add order processing steps if payment is approved
        if ($actualStatus === 'processing') {
            $timeline[] = [
                'status' => 'processing',
                'title' => 'Processing',
                'description' => 'Your order is being processed',
                'date' => $firstOrder->updated_at,
                'completed' => true,
            ];
        } elseif (in_array($actualStatus, ['shipped', 'delivered'])) {
            $timeline[] = [
                'status' => 'processing',
                'title' => 'Processing',
                'description' => 'Your order is being processed',
                'date' => $firstOrder->updated_at,
                'completed' => true,
            ];
            
            $shippedDate = $firstOrder->shipped_at ?? now();
            $timeline[] = [
                'status' => 'shipped',
                'title' => 'Shipped',
                'description' => 'Your order has been shipped',
                'date' => $shippedDate,
                'completed' => true,
            ];
            
            if ($actualStatus === 'delivered') {
                $deliveredDate = $firstOrder->delivered_at ?? now();
                $timeline[] = [
                    'status' => 'delivered',
                    'title' => 'Delivered',
                    'description' => 'Your order has been delivered',
                    'date' => $deliveredDate,
                    'completed' => true,
                ];
            }
        }

        // Detailed tax breakdown for user view
        $taxBreakdown = [];
        try {
            $taxService = app(\App\Services\TaxService::class);
            $calc = $taxService->calculateTaxes((float) $firstOrder->subtotal);
            $taxBreakdown = $calc['taxes'] ?? [];
        } catch (\Throwable $e) {
            \Log::warning('Failed to compute tax breakdown for user order', [
                'order_id' => $firstOrder->id,
                'error' => $e->getMessage(),
            ]);
        }

        // Get payment transaction with rejection reason if payment was rejected
        $paymentTransaction = null;
        if ($firstOrder->payment_transaction_id) {
            $paymentTransaction = \App\Models\PaymentTransaction::with('rejectionReason')
                ->find($firstOrder->payment_transaction_id);
        }

        return Inertia::render('user/order-details', [
            'order' => $orderDetails,
            'timeline' => $timeline,
            'taxBreakdown' => $taxBreakdown,
            'paymentTransaction' => $paymentTransaction ? [
                'id' => $paymentTransaction->id,
                'admin_status' => $paymentTransaction->admin_status,
                'rejection_reason_code' => $paymentTransaction->rejection_reason_code,
                'rejection_reason' => $paymentTransaction->rejectionReason ? [
                    'reason_text' => $paymentTransaction->rejectionReason->reason_text,
                    'description' => $paymentTransaction->rejectionReason->description,
                ] : null,
                'admin_notes' => $paymentTransaction->admin_notes,
            ] : null,
        ]);
    }

    public function trackOrder(Order $order)
    {
        if ($order->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $trackingData = $this->buildOrderTrackingData($order);

        return Inertia::render('user/order-tracking', $trackingData);
    }

    public function trackOrderData(Order $order)
    {
        if ($order->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        return response()->json($this->buildOrderTrackingData($order));
    }

    private function buildOrderTrackingData(Order $order): array
    {
        $actualStatus = $order->status;
        $actualPaymentStatus = $order->payment_status;

        // Get payment transaction to check actual admin approval status
        $paymentTransaction = \App\Models\PaymentTransaction::with('rejectionReason')
            ->where('order_id', $order->id)
            ->first();
        
        // Use OrderLookupService to find payment transaction if order_id lookup fails
        if (!$paymentTransaction && $order->id) {
            // Try to find payment transaction using OrderLookupService
            $orderLookupService = app(\App\Services\OrderLookupService::class);
            // This won't work directly, so let's try a different approach
            $paymentTransaction = \App\Models\PaymentTransaction::where(function($query) use ($order) {
                $query->where('order_id', $order->id)
                      ->orWhere('order_id', $order->order_number);
            })->with('rejectionReason')->first();
        }

        // Determine actual payment status based on payment transaction admin_status
        // This is more accurate than relying on order.payment_status alone
        $isPaymentApproved = false;
        $isPaymentReceived = false;
        
        if ($paymentTransaction) {
            // Payment is received if gateway shows paid or proof uploaded
            $isPaymentReceived = in_array($paymentTransaction->gateway_status, ['paid', 'proof_uploaded']);
            
            // Payment is approved only if admin_status is 'approved'
            $isPaymentApproved = $paymentTransaction->admin_status === 'approved';
            
            // Update actualPaymentStatus based on payment transaction state
            if ($isPaymentReceived && $isPaymentApproved) {
                $actualPaymentStatus = 'paid';
            } elseif ($isPaymentReceived && !$isPaymentApproved && !$paymentTransaction->isAdminRejected()) {
                $actualPaymentStatus = 'pending_approval';
            } elseif ($paymentTransaction->isAdminRejected()) {
                $actualPaymentStatus = 'rejected';
            }
        } else {
            // Fallback: if order status suggests payment was processed but no transaction found
            if (in_array($actualStatus, ['processing', 'shipped', 'delivered'], true) && $actualPaymentStatus === 'pending') {
                $actualPaymentStatus = 'paid';
            }
        }

        $timeline = [];

        $timeline[] = [
            'status' => 'ordered',
            'title' => 'Order Placed',
            'description' => 'Your order has been placed and is being processed',
            'date' => $order->created_at,
            'completed' => true,
        ];

        $paymentMethodType = 'Unknown Payment';
        $resolvedPaymentMethod = $order->payment_method ?: 'N/A';

        if ($paymentTransaction) {
            $resolvedPaymentMethod = $paymentTransaction->payment_method ?: $resolvedPaymentMethod;

            if (str_starts_with($paymentTransaction->tx_ref, 'TX-')) {
                $paymentMethodType = 'Chapa Online Payment';
            } elseif (str_starts_with($paymentTransaction->tx_ref, 'OFFLINE-')) {
                $paymentMethodType = 'Offline Payment';
            } elseif ($paymentTransaction->payment_method) {
                $paymentMethodType = $this->formatPaymentMethod($paymentTransaction->payment_method);
            }
        } else {
            if (str_starts_with((string) $resolvedPaymentMethod, 'OFFLINE-') || $resolvedPaymentMethod === 'offline') {
                $paymentMethodType = 'Offline Payment';
            } elseif (str_starts_with((string) $resolvedPaymentMethod, 'TX-') || $this->isChapaPaymentMethod($resolvedPaymentMethod)) {
                $paymentMethodType = 'Chapa Online Payment';
            } elseif ($resolvedPaymentMethod !== 'N/A') {
                $paymentMethodType = $this->formatPaymentMethod($resolvedPaymentMethod);
            }
        }

        // Show payment received step if payment was received (gateway shows paid/proof_uploaded)
        if ($isPaymentReceived) {
            $timeline[] = [
                'status' => 'payment_received',
                'title' => 'Payment Received',
                'description' => "Payment received via {$paymentMethodType}",
                'date' => $paymentTransaction ? $paymentTransaction->created_at : $order->updated_at,
                'completed' => true,
            ];

            // Show payment approved step only if admin has actually approved
            if ($isPaymentApproved) {
                $timeline[] = [
                    'status' => 'admin_approved',
                    'title' => 'Payment Approved',
                    'description' => 'Payment has been reviewed and approved by admin',
                    'date' => $paymentTransaction->updated_at ?? $order->updated_at,
                    'completed' => true,
                ];
            } else {
                // Show pending approval step if payment received but not approved
                $timeline[] = [
                    'status' => 'pending_payment_approval',
                    'title' => 'Pending Payment Approval',
                    'description' => 'Payment is being reviewed by admin for approval',
                    'date' => null,
                    'completed' => false,
                ];
            }
        } elseif ($actualPaymentStatus === 'pending_approval') {
            $timeline[] = [
                'status' => 'payment_received',
                'title' => 'Payment Received',
                'description' => "Payment received via {$paymentMethodType}",
                'date' => $order->updated_at,
                'completed' => true,
            ];

            $timeline[] = [
                'status' => 'pending_payment_approval',
                'title' => 'Pending Payment Approval',
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

        if ($actualStatus === 'cancelled') {
            $timeline = [
                $timeline[0],
                [
                    'status' => 'cancelled',
                    'title' => 'Order Cancelled',
                    'description' => 'Your order has been cancelled',
                    'date' => $order->updated_at,
                    'completed' => true,
                    'error' => true,
                ],
            ];
        }

        return [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $actualStatus,
                'payment_status' => $actualPaymentStatus,
                'payment_method' => $this->formatPaymentMethod($resolvedPaymentMethod),
                'payment_method_type' => $paymentMethodType,
                'total_amount' => (float) $order->total_amount,
                'currency' => $order->currency,
                'created_at' => $order->created_at,
            ],
            'timeline' => $timeline,
            'paymentTransaction' => $paymentTransaction ? [
                'id' => $paymentTransaction->id,
                'admin_status' => $paymentTransaction->admin_status,
                'rejection_reason_code' => $paymentTransaction->rejection_reason_code,
                'rejection_reason' => $paymentTransaction->rejectionReason ? [
                    'reason_text' => $paymentTransaction->rejectionReason->reason_text,
                    'description' => $paymentTransaction->rejectionReason->description,
                ] : null,
                'admin_notes' => $paymentTransaction->admin_notes,
            ] : null,
        ];
    }

    public function products()
    {
        $user = Auth::user();

        $items = DB::table('order_items as oi')
            ->join('orders as o', 'oi.order_id', '=', 'o.id')
            ->join('products as p', 'oi.product_id', '=', 'p.id')
            ->leftJoin('product_images as pi', function ($join) {
                $join->on('p.id', '=', 'pi.product_id')
                    ->where('pi.is_primary', true);
            })
            ->leftJoin('brands as b', 'p.brand_id', '=', 'b.id')
            ->select([
                'oi.id as order_item_id',
                'oi.order_id',
                'oi.quantity',
                'oi.price as unit_price',
                'oi.total',
                'o.order_number',
                'o.status as order_status',
                'o.payment_status',
                'o.created_at as purchased_at',
                'p.id as product_id',
                'p.name as product_name',
                'p.slug as product_slug',
                'p.sku as product_sku',
                'pi.image_path as primary_image_path',
                'b.name as brand_name',
            ])
            ->where('o.user_id', $user->id)
            ->orderBy('o.created_at', 'desc')
            ->get();

        $products = $items->map(function ($item) {
            $image = ImageUrlService::formatImageUrl($item->primary_image_path);

            return [
                'order_item_id' => $item->order_item_id,
                'order_id' => $item->order_id,
                'order_number' => $item->order_number,
                'order_status' => $item->order_status,
                'payment_status' => $item->payment_status,
                'purchased_at' => $item->purchased_at,
                'product' => [
                    'id' => $item->product_id,
                    'name' => $item->product_name,
                    'slug' => $item->product_slug,
                    'sku' => $item->product_sku,
                    'brand' => $item->brand_name,
                    'image' => $image,
                ],
                'quantity' => (int) $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'total' => (float) $item->total,
            ];
        });

        $summary = [
            'items_count' => $products->count(),
            'unique_products' => $products->pluck('product.id')->unique()->count(),
            'total_quantity' => $products->sum('quantity'),
            'total_spent' => $products->sum('total'),
            'status_breakdown' => $products->groupBy('order_status')->map->count(),
        ];

        return Inertia::render('user/products', [
            'purchasedItems' => $products,
            'summary' => $summary,
        ]);
    }

    private function formatPaymentMethod($method)
    {
        if (str_starts_with($method, 'TX-')) {
            return 'Chapa Online Payment';
        } elseif (str_starts_with($method, 'OFFLINE-')) {
            return 'Offline Payment';
        }
        return $method;
    }
    
    /**
     * Check if a payment method is a Chapa payment method
     */
    private function isChapaPaymentMethod($method): bool
    {
        if ($method === 'chapa') {
            return true;
        }
        
        // Check if the method code exists in ChapaPaymentMethod table
        return ChapaPaymentMethod::where('code', $method)
            ->where('is_active', true)
            ->exists();
    }
}
