<?php

namespace App\Services;

use App\Models\Product;
use App\Models\OutOfStockNotification;
use App\Models\User;
use App\Notifications\ProductBackInStock;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class StockNotificationService
{
    /**
     * Add a user to the out of stock notification list
     */
    public function addToNotificationList(Product $product, ?User $user, string $email): OutOfStockNotification
    {
        $notification = OutOfStockNotification::createOrGet(
            $product->id,
            $user?->id,
            $email
        );

        Log::info('Added user to out of stock notification list', [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'user_id' => $user?->id,
            'email' => $email,
            'notification_id' => $notification->id,
        ]);

        return $notification;
    }

    /**
     * Check if a product is back in stock and notify users
     */
    public function checkAndNotifyBackInStock(Product $product): int
    {
        if ($product->stock_quantity <= 0) {
            return 0; // Still out of stock
        }

        $pendingNotifications = OutOfStockNotification::where('product_id', $product->id)
            ->pending()
            ->get();

        $notifiedCount = 0;

        foreach ($pendingNotifications as $notification) {
            try {
                // Send email notification
                if ($notification->user_id) {
                    $user = User::find($notification->user_id);
                    if ($user) {
                        $user->notify(new ProductBackInStock($product));
                    }
                } else {
                    // Send email to non-registered users
                    Mail::send('emails.product-back-in-stock', [
                        'product' => $product,
                        'email' => $notification->email,
                    ], function ($message) use ($notification, $product) {
                        $message->to($notification->email)
                            ->subject('🎉 Good News! ' . $product->name . ' is Back in Stock');
                    });
                }

                // Mark as notified
                $notification->markAsNotified();
                $notifiedCount++;

                Log::info('Sent back in stock notification', [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'email' => $notification->email,
                    'user_id' => $notification->user_id,
                ]);

            } catch (\Exception $e) {
                Log::error('Failed to send back in stock notification', [
                    'product_id' => $product->id,
                    'email' => $notification->email,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $notifiedCount;
    }

    /**
     * Get notification statistics for a product
     */
    public function getProductNotificationStats(Product $product): array
    {
        $total = OutOfStockNotification::where('product_id', $product->id)->count();
        $pending = OutOfStockNotification::where('product_id', $product->id)->pending()->count();
        $notified = OutOfStockNotification::where('product_id', $product->id)->notified()->count();

        return [
            'total' => $total,
            'pending' => $pending,
            'notified' => $notified,
        ];
    }

    /**
     * Get all products with pending notifications
     */
    public function getProductsWithPendingNotifications(): array
    {
        return OutOfStockNotification::with('product')
            ->pending()
            ->get()
            ->groupBy('product_id')
            ->map(function ($notifications) {
                $product = $notifications->first()->product;
                return [
                    'product' => $product,
                    'notification_count' => $notifications->count(),
                    'notifications' => $notifications,
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Clean up old notifications (optional - for maintenance)
     */
    public function cleanupOldNotifications(int $daysOld = 90): int
    {
        $cutoffDate = now()->subDays($daysOld);
        
        return OutOfStockNotification::where('is_notified', true)
            ->where('notified_at', '<', $cutoffDate)
            ->delete();
    }
}
