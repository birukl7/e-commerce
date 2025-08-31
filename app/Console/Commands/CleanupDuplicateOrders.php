<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CleanupDuplicateOrders extends Command
{
    protected $signature = 'orders:cleanup-duplicates {--force} {--dry-run}';
    protected $description = 'Clean up duplicate orders by order_number, keeping the most recent one';

    public function handle()
    {
        $force = $this->option('force');
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info('Running in dry-run mode. No changes will be made.');
        } elseif (!$force) {
            if (!$this->confirm('This will permanently delete duplicate orders. Are you sure you want to continue?')) {
                $this->info('Operation cancelled.');
                return 0;
            }
        }

        // Find all duplicate order numbers
        $duplicates = DB::table('orders')
            ->select('order_number', DB::raw('COUNT(*) as count'))
            ->groupBy('order_number')
            ->having('count', '>', 1)
            ->pluck('count', 'order_number');

        if ($duplicates->isEmpty()) {
            $this->info('No duplicate orders found.');
            return 0;
        }

        $this->info(sprintf('Found %d order numbers with duplicates:', $duplicates->count()));
        
        $totalDeleted = 0;
        
        foreach ($duplicates as $orderNumber => $count) {
            $this->line(sprintf('Processing order number: %s (%d duplicates)', $orderNumber, $count - 1));
            
            // Get all orders with this order number
            $orders = DB::table('orders')
                ->where('order_number', $orderNumber)
                ->orderBy('created_at', 'desc')
                ->get();

            // The first one is the most recent one we want to keep
            $orderToKeep = $orders->first();
            $ordersToDelete = $orders->slice(1);
            
            $this->line(sprintf('  Will keep order ID %s (created: %s)', 
                $orderToKeep->id, 
                $orderToKeep->created_at
            ));
            
            $this->line(sprintf('  Will delete %d duplicate(s):', $ordersToDelete->count()));
            
            foreach ($ordersToDelete as $order) {
                $this->line(sprintf('    - ID: %s, Created: %s', 
                    $order->id, 
                    $order->created_at
                ));
                
                if (!$dryRun) {
                    // Delete related records first to maintain referential integrity
                    DB::table('order_items')
                        ->where('order_id', $order->id)
                        ->delete();
                        
                    DB::table('orders')
                        ->where('id', $order->id)
                        ->delete();
                        
                    Log::info('Deleted duplicate order', [
                        'order_id' => $order->id,
                        'order_number' => $orderNumber,
                        'kept_order_id' => $orderToKeep->id
                    ]);
                }
                
                $totalDeleted++;
            }
        }
        
        if ($dryRun) {
            $this->info(sprintf('Dry run complete. Would delete %d duplicate orders.', $totalDeleted));
        } else {
            $this->info(sprintf('Cleanup complete. Deleted %d duplicate orders.', $totalDeleted));
        }
        
        return 0;
    }
}
