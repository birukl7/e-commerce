<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;

return new class extends Migration
{
    public function up()
    {
        // First, find and remove any duplicate order numbers
        $duplicates = DB::table('orders')
            ->select('order_number', DB::raw('COUNT(*) as count'))
            ->groupBy('order_number')
            ->having('count', '>', 1)
            ->pluck('order_number');

        foreach ($duplicates as $orderNumber) {
            // Get all orders with this order number
            $orders = DB::table('orders')
                ->where('order_number', $orderNumber)
                ->orderBy('created_at', 'desc')
                ->get();

            // Keep the first (most recent) order and delete others
            if ($orders->count() > 1) {
                $orderToKeep = $orders->first();
                
                // Delete all but the most recent order
                DB::table('orders')
                    ->where('order_number', $orderNumber)
                    ->where('id', '!=', $orderToKeep->id)
                    ->delete();
                    
                \Log::info('Cleaned up duplicate orders', [
                    'order_number' => $orderNumber,
                    'kept_order_id' => $orderToKeep->id,
                    'deleted_count' => $orders->count() - 1
                ]);
            }
        }

        // Check if the unique constraint already exists
        $hasIndex = false;
        try {
            $indexes = DB::select("SHOW INDEX FROM orders WHERE Key_name = 'orders_order_number_unique'");
            $hasIndex = count($indexes) > 0;
        } catch (\Exception $e) {
            // Ignore errors, we'll try to add the index
        }

        if (!$hasIndex) {
            try {
                Schema::table('orders', function (Blueprint $table) {
                    $table->unique('order_number');
                });
                \Log::info('Added unique constraint to order_number column');
            } catch (\Exception $e) {
                \Log::warning('Failed to add unique constraint to order_number: ' . $e->getMessage());
            }
        } else {
            \Log::info('Unique constraint on order_number already exists');
        }
    }

    public function down()
    {
        // This is intentionally left empty to prevent accidental removal of the unique constraint
        // in production environments
        if (app()->environment('local', 'testing')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropUnique(['order_number']);
            });
        }
    }
};
