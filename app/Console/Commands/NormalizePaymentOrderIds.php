<?php

namespace App\Console\Commands;

use App\Models\PaymentTransaction;
use App\Services\OrderLookupService;
use Illuminate\Console\Command;

class NormalizePaymentOrderIds extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:normalize-order-ids 
                            {--dry-run : Show what would be normalized without making changes}
                            {--limit= : Limit the number of transactions to process}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Normalize payment transaction order_id values to store numeric IDs instead of order_number strings';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');
        $limit = $this->option('limit') ? (int)$this->option('limit') : null;

        $this->info('Starting payment transaction order_id normalization...');
        if ($dryRun) {
            $this->warn('DRY RUN MODE - No changes will be made');
        }

        $orderLookupService = app(OrderLookupService::class);

        // Find all payment transactions with non-numeric order_id
        $query = PaymentTransaction::whereNotNull('order_id')
            ->whereRaw('order_id NOT REGEXP "^[0-9]+$"');

        if ($limit) {
            $query->limit($limit);
        }

        $transactions = $query->get();
        $totalCount = $transactions->count();

        if ($totalCount === 0) {
            $this->info('No payment transactions found that need normalization.');
            return 0;
        }

        $this->info("Found {$totalCount} payment transaction(s) with string order_id values.");

        $progressBar = $this->output->createProgressBar($totalCount);
        $progressBar->start();

        $normalized = 0;
        $notFound = 0;
        $errors = 0;

        foreach ($transactions as $transaction) {
            try {
                $oldOrderId = $transaction->order_id;
                $order = $orderLookupService->findOrderFromPayment($transaction);

                if ($order) {
                    if (!$dryRun) {
                        $orderLookupService->normalizePaymentOrderId($transaction, $order);
                    }
                    $normalized++;
                } else {
                    $notFound++;
                    if ($this->getOutput()->isVerbose()) {
                        $this->newLine();
                        $this->warn("Order not found for payment transaction {$transaction->id} (order_id: {$oldOrderId})");
                    }
                }
            } catch (\Exception $e) {
                $errors++;
                if ($this->getOutput()->isVerbose()) {
                    $this->newLine();
                    $this->error("Error processing payment transaction {$transaction->id}: " . $e->getMessage());
                }
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        // Summary
        $this->info('Normalization Summary:');
        $this->table(
            ['Status', 'Count'],
            [
                ['Total Processed', $totalCount],
                ['Normalized', $normalized],
                ['Order Not Found', $notFound],
                ['Errors', $errors],
            ]
        );

        if ($dryRun) {
            $this->warn('This was a dry run. Run without --dry-run to apply changes.');
        } else {
            $this->info('Normalization completed successfully!');
        }

        return 0;
    }
}

