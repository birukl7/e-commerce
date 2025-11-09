<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Fixing rejected payments with null order_id...\n\n";

$rejected = DB::table('payment_transactions')
    ->where('admin_status', 'rejected')
    ->whereNull('order_id')
    ->whereNull('deleted_at')
    ->get(['id', 'tx_ref', 'amount', 'customer_email', 'created_at']);

foreach ($rejected as $tx) {
    echo "Processing payment transaction ID: {$tx->id} (tx_ref: {$tx->tx_ref}, amount: {$tx->amount})\n";
    
    // Get user ID from email
    $user = DB::table('users')->where('email', $tx->customer_email)->first(['id']);
    if (!$user) {
        echo "  User not found for email: {$tx->customer_email}\n";
        continue;
    }
    
    // Try to find order by amount and time window (within 2 hours)
    $order = DB::table('orders')
        ->where('user_id', $user->id)
        ->where('total_amount', $tx->amount)
        ->whereBetween('created_at', [
            date('Y-m-d H:i:s', strtotime($tx->created_at) - 7200),
            date('Y-m-d H:i:s', strtotime($tx->created_at) + 7200)
        ])
        ->first(['id', 'order_number', 'total_amount', 'created_at']);
    
    if ($order) {
        echo "  Found matching order: ID={$order->id}, number={$order->order_number}, amount={$order->total_amount}\n";
        DB::table('payment_transactions')->where('id', $tx->id)->update(['order_id' => $order->id]);
        echo "  ✓ Updated payment transaction order_id to {$order->id}\n";
    } else {
        echo "  ✗ No matching order found\n";
    }
    echo "\n";
}

echo "Done!\n";

