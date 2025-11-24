<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Database\Seeders\ChapaPaymentMethodSeeder;
use App\Services\SiteConfigService;

class SeedChapaPaymentMethods extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'chapa:seed-methods';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed Chapa payment methods into the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Seeding Chapa payment methods...');
        
        try {
            $seeder = new ChapaPaymentMethodSeeder();
            $seeder->run();
            
            // Clear cache to ensure fresh data
            $siteConfig = app(SiteConfigService::class);
            $siteConfig->clearChapaPaymentMethodsCache();
            
            $count = \App\Models\ChapaPaymentMethod::active()->count();
            
            $this->info("✓ Successfully seeded Chapa payment methods!");
            $this->info("✓ Found {$count} active payment methods in database.");
            $this->info("✓ Cache cleared.");
            
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Failed to seed Chapa payment methods: ' . $e->getMessage());
            $this->error($e->getTraceAsString());
            return Command::FAILURE;
        }
    }
}

