<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentTransaction;
use App\Models\ProductRequest;
use Illuminate\Console\Command;

class DeleteUserOrderData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:delete-order-data 
                            {user : User email or ID to delete order data for}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete all order-related data for a specific user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userIdentifier = $this->argument('user');
        
        // Find user by email or ID
        $user = is_numeric($userIdentifier) 
            ? User::find($userIdentifier)
            : User::where('email', $userIdentifier)->first();
        
        if (!$user) {
            $this->error("User not found: {$userIdentifier}");
            return 1;
        }
        
        $this->info("Found user: {$user->name} ({$user->email})");
        
        // Get all orders for this user
        $orders = Order::where('user_id', $user->id)->get();
        $orderCount = $orders->count();
        
        if ($orderCount === 0) {
            $this->info("No orders found for this user.");
            return 0;
        }
        
        $this->info("Found {$orderCount} order(s) for this user.");
        
        // Get order IDs and order numbers
        $orderIds = $orders->pluck('id')->toArray();
        $orderNumbers = $orders->pluck('order_number')->toArray();
        
        // Count related data
        $orderItemCount = OrderItem::whereIn('order_id', $orderIds)->count();
        // Payment transactions use order_number (string) not order_id
        $paymentTransactionCount = PaymentTransaction::whereIn('order_id', $orderNumbers)->count();
        $productRequestCount = ProductRequest::whereIn('order_id', $orderIds)->count();
        
        $this->info("Related data to be deleted:");
        $this->info("  - Order Items: {$orderItemCount}");
        $this->info("  - Payment Transactions: {$paymentTransactionCount}");
        $this->info("  - Product Requests (order_id will be set to null): {$productRequestCount}");
        $this->info("  - Orders: {$orderCount}");
        
        if (!$this->confirm('Are you sure you want to delete all this data?', true)) {
            $this->info('Operation cancelled.');
            return 0;
        }
        
        // Delete payment transactions (using order numbers, not IDs)
        $deletedPayments = PaymentTransaction::whereIn('order_id', $orderNumbers)->delete();
        $this->info("Deleted {$deletedPayments} payment transaction(s).");
        
        // Set order_id to null for product requests (since it's nullable and has set null on delete)
        $updatedProductRequests = ProductRequest::whereIn('order_id', $orderIds)->update(['order_id' => null]);
        $this->info("Updated {$updatedProductRequests} product request(s) (set order_id to null).");
        
        // Delete orders (this will cascade delete order_items due to foreign key constraint)
        $deletedOrders = Order::whereIn('id', $orderIds)->delete();
        $this->info("Deleted {$deletedOrders} order(s).");
        
        $this->info("Successfully deleted all order-related data for user: {$user->email}");
        
        return 0;
    }
}

