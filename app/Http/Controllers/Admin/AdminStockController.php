<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\OutOfStockNotification;
use App\Services\StockNotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class AdminStockController extends Controller
{
    use AuthorizesRequests;

    protected $stockNotificationService;

    public function __construct(StockNotificationService $stockNotificationService)
    {
        $this->stockNotificationService = $stockNotificationService;
    }

    /**
     * Display the stock management dashboard with tabs
     */
    public function dashboard()
    {
        $this->authorize('viewAny', OutOfStockNotification::class);
        
        $lowStockProducts = Product::where('stock_quantity', '>', 0)
            ->where('stock_quantity', '<=', DB::raw('low_stock_threshold'))
            ->orderBy('stock_quantity')
            ->limit(10)
            ->get();
            
        $outOfStockProducts = Product::where('stock_quantity', '<=', 0)
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get();
            
        $recentNotifications = OutOfStockNotification::with(['product', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
        
        $activeTab = request()->string('tab', 'alerts')->toString();

        return Inertia::render('admin/stock/index', [
            'activeTab' => $activeTab,
            'tabs' => [
                'alerts' => 'Stock Alerts',
                'out_of_stock' => 'Out of Stock',
                'low_stock' => 'Low Stock',
                'history' => 'Stock History',
            ],
            'lowStockProducts' => $lowStockProducts,
            'outOfStockProducts' => $outOfStockProducts,
            'recentNotifications' => $recentNotifications,
            'stats' => [
                'totalProducts' => Product::count(),
                'lowStockCount' => Product::where('stock_quantity', '>', 0)
                    ->where('stock_quantity', '<=', DB::raw('low_stock_threshold'))
                    ->count(),
                'outOfStockCount' => Product::where('stock_quantity', '<=', 0)->count(),
                'pendingNotifications' => OutOfStockNotification::where('is_notified', false)->count(),
            ]
        ]);
    }

    /**
     * Update product stock quantity
     */
    public function updateStock(Request $request, Product $product)
    {
        $this->authorize('update', $product);
        
        $validated = $request->validate([
            'stock_quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'required|integer|min:0',
            'backorders' => 'required|boolean',
            'manage_stock' => 'required|boolean',
        ]);

        $originalStock = $product->stock_quantity;
        $product->update($validated);
        
        // If stock was restocked, check for notifications
        if ($validated['stock_quantity'] > 0 && $originalStock <= 0) {
            $this->stockNotificationService->checkAndNotifyBackInStock($product);
        }

        return response()->json([
            'success' => true,
            'message' => 'Stock updated successfully',
            'data' => $product->fresh()
        ]);
    }

    /**
     * Get stock notifications with filters
     */
    public function getNotifications(Request $request)
    {
        $this->authorize('viewAny', OutOfStockNotification::class);
        
        $query = OutOfStockNotification::with(['product', 'user'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->has('product_search') && $request->product_search) {
            $query->whereHas('product', function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->product_search . '%')
                  ->orWhere('sku', 'like', '%' . $request->product_search . '%');
            });
        }

        if ($request->has('status') && $request->status) {
            if ($request->status === 'pending') {
                $query->where('is_notified', false);
            } elseif ($request->status === 'notified') {
                $query->where('is_notified', true);
            }
        }

        $notifications = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }

    /**
     * Mark notification as notified
     */
    public function markNotified(OutOfStockNotification $notification)
    {
        $this->authorize('update', $notification);
        
        $notification->update(['is_notified' => true]);
        
        return response()->json([
            'success' => true,
            'message' => 'Notification marked as notified'
        ]);
    }

    /**
     * Get stock history for a product
     */
    public function getStockHistory(Product $product)
    {
        $this->authorize('view', $product);
        
        $history = $product->stockHistory()
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $history
        ]);
    }
}
