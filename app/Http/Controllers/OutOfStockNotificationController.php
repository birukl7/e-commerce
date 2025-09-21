<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\OutOfStockNotification;
use App\Services\StockNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class OutOfStockNotificationController extends Controller
{
    protected StockNotificationService $stockNotificationService;

    public function __construct(StockNotificationService $stockNotificationService)
    {
        $this->stockNotificationService = $stockNotificationService;
    }

    /**
     * Subscribe to out of stock notifications
     */
    public function subscribe(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a valid email address.',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if product is actually out of stock
        if ($product->stock_quantity > 0) {
            return response()->json([
                'success' => false,
                'message' => 'This product is currently in stock. No need to subscribe for notifications.'
            ], 400);
        }

        $email = $request->input('email');
        $user = Auth::user();

        // Check if already subscribed
        if (OutOfStockNotification::existsForProductAndEmail($product->id, $email)) {
            return response()->json([
                'success' => false,
                'message' => 'You are already subscribed to notifications for this product.'
            ], 400);
        }

        try {
            $this->stockNotificationService->addToNotificationList($product, $user, $email);

            return response()->json([
                'success' => true,
                'message' => 'You have been subscribed to notifications for this product. We will notify you when it becomes available again.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to subscribe to notifications. Please try again.'
            ], 500);
        }
    }

    /**
     * Unsubscribe from out of stock notifications
     */
    public function unsubscribe(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a valid email address.',
                'errors' => $validator->errors()
            ], 422);
        }

        $email = $request->input('email');

        try {
            $notification = OutOfStockNotification::where('product_id', $product->id)
                ->where('email', $email)
                ->first();

            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'No subscription found for this email address.'
                ], 404);
            }

            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'You have been unsubscribed from notifications for this product.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to unsubscribe. Please try again.'
            ], 500);
        }
    }

    /**
     * Check subscription status
     */
    public function checkSubscription(Request $request, Product $product)
    {
        $email = $request->input('email');

        if (!$email) {
            return response()->json([
                'subscribed' => false
            ]);
        }

        $subscribed = OutOfStockNotification::existsForProductAndEmail($product->id, $email);

        return response()->json([
            'subscribed' => $subscribed
        ]);
    }

    /**
     * Get notification statistics for admin
     */
    public function getStats(Product $product)
    {
        $this->authorize('viewAny', OutOfStockNotification::class);

        $stats = $this->stockNotificationService->getProductNotificationStats($product);

        return response()->json($stats);
    }

    /**
     * Get all products with pending notifications (admin)
     */
    public function getProductsWithPendingNotifications()
    {
        $this->authorize('viewAny', OutOfStockNotification::class);

        $products = $this->stockNotificationService->getProductsWithPendingNotifications();

        return response()->json($products);
    }
}
