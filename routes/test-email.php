<?php

use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::get('/test-email', function () {
    // Get the latest order and payment transaction for testing
    $order = Order::latest()->first();
    $payment = PaymentTransaction::latest()->first();
    $user = User::find(1); // or any user ID

    if (!$order || !$payment || !$user) {
        return "Test data not found. Make sure you have orders and payment transactions in the database.";
    }

    try {
        // Send the email directly
        \Mail::to($user->email)
            ->send(new \App\Mail\PaymentConfirmation($order, $payment));
            
        return "Test email sent to {$user->email} for order #{$order->order_number}";
    } catch (\Exception $e) {
        return "Error sending email: " . $e->getMessage() . "\n" . $e->getTraceAsString();
    }
})->name('test.email');
