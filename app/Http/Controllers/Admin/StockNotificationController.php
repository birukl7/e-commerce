<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OutOfStockNotification;
use App\Models\Product;
use App\Services\StockNotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class StockNotificationController extends Controller
{
    use AuthorizesRequests;

    protected StockNotificationService $stockNotificationService;

    public function __construct(StockNotificationService $stockNotificationService)
    {
        $this->stockNotificationService = $stockNotificationService;
    }

    /**
     * Display a listing of stock notifications
     */
    public function index(Request $request)
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

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $notifications = $query->paginate(20);

        // Get statistics
        $stats = [
            'total_notifications' => OutOfStockNotification::count(),
            'pending_notifications' => OutOfStockNotification::where('is_notified', false)->count(),
            'notified_count' => OutOfStockNotification::where('is_notified', true)->count(),
            'products_with_notifications' => OutOfStockNotification::distinct('product_id')->count(),
        ];

        // Get products with pending notifications
        $productsWithPendingNotifications = $this->stockNotificationService->getProductsWithPendingNotifications();

        return Inertia::render('Admin/StockNotifications/Index', [
            'notifications' => $notifications,
            'stats' => $stats,
            'productsWithPendingNotifications' => $productsWithPendingNotifications,
            'filters' => $request->only(['product_search', 'status', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Show notification statistics for a specific product
     */
    public function showProductStats(Product $product)
    {
        $this->authorize('viewAny', OutOfStockNotification::class);

        $stats = $this->stockNotificationService->getProductNotificationStats($product);
        $notifications = OutOfStockNotification::where('product_id', $product->id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Admin/StockNotifications/ProductStats', [
            'product' => $product,
            'stats' => $stats,
            'notifications' => $notifications,
        ]);
    }

    /**
     * Manually trigger back-in-stock notifications for a product
     */
    public function triggerNotifications(Product $product)
    {
        $this->authorize('update', $product);

        if ($product->stock_quantity <= 0) {
            return back()->with('error', 'Product is still out of stock. Cannot trigger notifications.');
        }

        $notifiedCount = $this->stockNotificationService->checkAndNotifyBackInStock($product);

        return back()->with('success', "Successfully notified {$notifiedCount} subscribers that {$product->name} is back in stock.");
    }

    /**
     * Delete a notification subscription
     */
    public function destroy(OutOfStockNotification $notification)
    {
        $this->authorize('delete', $notification);

        $notification->delete();

        return back()->with('success', 'Notification subscription removed successfully.');
    }

    /**
     * Bulk delete notifications
     */
    public function bulkDelete(Request $request)
    {
        $this->authorize('delete', OutOfStockNotification::class);

        $request->validate([
            'notification_ids' => 'required|array',
            'notification_ids.*' => 'exists:out_of_stock_notifications,id',
        ]);

        $deletedCount = OutOfStockNotification::whereIn('id', $request->notification_ids)->delete();

        return back()->with('success', "Successfully deleted {$deletedCount} notification subscriptions.");
    }
}
