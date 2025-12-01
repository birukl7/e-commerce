<?php

/**
 * Script to fix existing product request orders that were created without order items
 * 
 * This script:
 * 1. Finds orders created from product requests that have no order items
 * 2. Creates order items for them using the product request data
 * 3. Includes images in the product_snapshot
 * 
 * Usage: php artisan tinker < fix-product-request-orders-without-items.php
 * Or: php fix-product-request-orders-without-items.php (if run directly)
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Order;
use App\Models\ProductRequest;
use App\Services\ImageUrlService;
use Illuminate\Support\Facades\DB;

echo "Starting fix for product request orders without items...\n\n";

// Find orders created from product requests that have no items
// Method 1: Orders linked via PaymentTransaction (product_request_id + order_id)
$paymentTransactions = \App\Models\PaymentTransaction::whereNotNull('product_request_id')
    ->whereNotNull('order_id')
    ->pluck('order_id')
    ->unique()
    ->toArray();

// Method 2: Orders linked via ProductRequest.order_id
$productRequestOrderIds = ProductRequest::whereNotNull('order_id')
    ->pluck('order_id')
    ->toArray();

// Combine both methods
$allProductRequestOrderIds = array_unique(array_merge($paymentTransactions, $productRequestOrderIds));

// Find orders without items
$ordersWithoutItems = Order::whereIn('id', $allProductRequestOrderIds)
    ->doesntHave('items')
    ->get();

$ordersToFix = $ordersWithoutItems->unique('id');

echo "Found " . $ordersToFix->count() . " orders without items that might be product requests\n\n";

$fixed = 0;
$skipped = 0;
$errors = 0;

foreach ($ordersToFix as $order) {
    try {
        // Try to find the product request for this order
        $productRequest = null;
        
        // Method 1: Find via PaymentTransaction (most reliable)
        $paymentTransaction = \App\Models\PaymentTransaction::where('order_id', $order->id)
            ->whereNotNull('product_request_id')
            ->first();
        
        if ($paymentTransaction && $paymentTransaction->product_request_id) {
            $productRequest = ProductRequest::find($paymentTransaction->product_request_id);
        }
        
        // Method 2: Find product request by order_id (direct link)
        if (!$productRequest) {
            $productRequest = ProductRequest::where('order_id', $order->id)->first();
        }
        
        // Method 3: Try to extract product request ID from notes
        if (!$productRequest && preg_match('/product request #(\d+)/i', $order->notes ?? '', $matches)) {
            $productRequestId = (int) $matches[1];
            $productRequest = ProductRequest::find($productRequestId);
        }
        
        if (!$productRequest) {
            echo "Skipping order #{$order->order_number} (ID: {$order->id}) - no product request found\n";
            $skipped++;
            continue;
        }
        
        // Check if order already has items (race condition check)
        if ($order->items()->count() > 0) {
            echo "Skipping order #{$order->order_number} (ID: {$order->id}) - already has items\n";
            $skipped++;
            continue;
        }
        
        // Create order item for the product request
        $amount = $order->subtotal ?? $productRequest->amount ?? $productRequest->estimated_price ?? 0;
        
        DB::beginTransaction();
        
        try {
            $orderItem = \App\Models\OrderItem::create([
                'order_id' => $order->id,
                'product_id' => null, // Product requests don't have a product_id
                'product_snapshot' => [
                    'id' => null,
                    'name' => $productRequest->product_name,
                    'price' => (float) $amount,
                    'image' => $productRequest->image ? ImageUrlService::formatImageUrl($productRequest->image) : null,
                    'product_request_id' => $productRequest->id,
                    'description' => $productRequest->description,
                    'created_at' => $productRequest->created_at?->toDateTimeString() ?? now()->toDateTimeString(),
                    'updated_at' => $productRequest->updated_at?->toDateTimeString() ?? now()->toDateTimeString(),
                ],
                'quantity' => $productRequest->quantity ?? 1,
                'price' => (float) $amount,
                'total' => (float) $amount * ($productRequest->quantity ?? 1),
            ]);
            
            DB::commit();
            
            echo "✓ Fixed order #{$order->order_number} (ID: {$order->id}) - Product Request #{$productRequest->id}: {$productRequest->product_name}\n";
            $fixed++;
            
        } catch (\Exception $e) {
            DB::rollBack();
            echo "✗ Error fixing order #{$order->order_number} (ID: {$order->id}): {$e->getMessage()}\n";
            $errors++;
        }
        
    } catch (\Exception $e) {
        echo "✗ Error processing order #{$order->order_number} (ID: {$order->id}): {$e->getMessage()}\n";
        $errors++;
    }
}

echo "\n";
echo "========================================\n";
echo "Summary:\n";
echo "  Fixed: {$fixed}\n";
echo "  Skipped: {$skipped}\n";
echo "  Errors: {$errors}\n";
echo "========================================\n";

