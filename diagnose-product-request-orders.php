<?php

/**
 * Diagnostic script to check product request orders
 * 
 * Usage: php artisan tinker < diagnose-product-request-orders.php
 * Or: php diagnose-product-request-orders.php (if run directly)
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Order;
use App\Models\ProductRequest;
use App\Models\PaymentTransaction;
use Illuminate\Support\Facades\DB;

echo "=== Product Request Orders Diagnostic ===\n\n";

// 1. Check recent product requests with order_id
echo "1. Product Requests with order_id:\n";
$productRequests = ProductRequest::whereNotNull('order_id')
    ->latest()
    ->take(10)
    ->get(['id', 'order_id', 'product_name', 'user_id', 'created_at']);

echo "   Found: " . $productRequests->count() . "\n";
foreach ($productRequests as $pr) {
    $order = Order::find($pr->order_id);
    $itemCount = $order ? $order->items()->count() : 0;
    echo "   PR #{$pr->id} -> Order ID: {$pr->order_id} " . ($order ? "(exists, {$itemCount} items)" : "(NOT FOUND)") . "\n";
}

// 2. Check recent orders from product requests
echo "\n2. Recent Orders with 'product request' in notes:\n";
$orders = Order::where('notes', 'like', '%product request%')
    ->latest()
    ->take(10)
    ->get(['id', 'order_number', 'user_id', 'notes', 'created_at']);

echo "   Found: " . $orders->count() . "\n";
foreach ($orders as $order) {
    $itemCount = $order->items()->count();
    echo "   Order #{$order->order_number} (ID: {$order->id}) - User: {$order->user_id} - Items: {$itemCount}\n";
}

// 3. Check payment transactions linked to product requests
echo "\n3. Recent Payment Transactions for Product Requests:\n";
$payments = PaymentTransaction::whereNotNull('product_request_id')
    ->whereNotNull('order_id')
    ->latest()
    ->take(10)
    ->get(['id', 'product_request_id', 'order_id', 'tx_ref', 'admin_status', 'gateway_status']);

echo "   Found: " . $payments->count() . "\n";
foreach ($payments as $payment) {
    $order = Order::find($payment->order_id);
    $itemCount = $order ? $order->items()->count() : 0;
    echo "   Payment #{$payment->id} (tx_ref: {$payment->tx_ref})\n";
    echo "      -> PR #{$payment->product_request_id}, Order ID: {$payment->order_id} " . ($order ? "(exists, {$itemCount} items)" : "(NOT FOUND)") . "\n";
    echo "      -> Status: gateway={$payment->gateway_status}, admin={$payment->admin_status}\n";
}

// 4. Check for orders without items
echo "\n4. Orders without items (potential issues):\n";
$ordersWithoutItems = Order::doesntHave('items')
    ->where('notes', 'like', '%product request%')
    ->latest()
    ->take(10)
    ->get(['id', 'order_number', 'user_id', 'created_at']);

echo "   Found: " . $ordersWithoutItems->count() . "\n";
foreach ($ordersWithoutItems as $order) {
    echo "   Order #{$order->order_number} (ID: {$order->id}) - User: {$order->user_id} - Created: {$order->created_at}\n";
}

// 5. Check database transaction logs (if available)
echo "\n5. Recent Laravel Log Errors (last 20 lines with 'order' or 'product request'):\n";
$logFile = storage_path('logs/laravel.log');
if (file_exists($logFile)) {
    $lines = file($logFile);
    $relevantLines = array_filter($lines, function($line) {
        return stripos($line, 'order') !== false || stripos($line, 'product request') !== false || stripos($line, 'error') !== false;
    });
    $lastLines = array_slice($relevantLines, -20);
    foreach ($lastLines as $line) {
        echo "   " . trim($line) . "\n";
    }
} else {
    echo "   Log file not found\n";
}

echo "\n=== End Diagnostic ===\n";

