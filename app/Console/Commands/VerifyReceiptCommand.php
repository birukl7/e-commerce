<?php

namespace App\Console\Commands;

use App\Services\LinksEtService;
use Illuminate\Console\Command;

class VerifyReceiptCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'links-et:verify 
                            {target : The receipt URL, telebirr reference, or image file path to verify}
                            {--image : Force verification as an image/screenshot}
                            {--wait= : Optional waitMs for synchronous hold (max 30000)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verify an Ethiopian payment receipt via links.et';

    /**
     * Execute the console command.
     */
    public function handle(LinksEtService $service): int
    {
        $target = $this->argument('target');
        $isImage = $this->option('image') || file_exists($target);
        $waitMs = $this->option('wait') ? (int) $this->option('wait') : null;

        $this->info("Verifying via links.et: {$target}");

        if ($isImage) {
            $this->comment("Mode: Image / Screenshot Verification");
            $result = $service->verifyImage($target);
        } else {
            $this->comment("Mode: URL / Reference Verification");
            $options = [];
            if ($waitMs !== null) {
                $options['waitMs'] = $waitMs;
            }
            $result = $service->verify($target, $options);
        }

        if (!empty($result['ok'])) {
            $this->info("✓ Verification Succeeded!");
            
            $receipt = $result['receipt'] ?? ($result['upstream']['result']['receipt'] ?? null);
            if ($receipt) {
                $source = $receipt['source'] ?? 'unknown';
                $amount = LinksEtService::extractAmount($receipt);
                $reference = LinksEtService::extractReference($receipt);
                $payer = LinksEtService::extractPayerName($receipt);

                $this->table(
                    ['Field', 'Value'],
                    [
                        ['Receipt Source', $source],
                        ['Reference', $reference ?? 'N/A'],
                        ['Payer Name', $payer ?? 'N/A'],
                        ['Amount Extracted', $amount !== null ? number_format($amount, 2) . ' ETB' : 'N/A'],
                        ['Provider Key', $result['providerKey'] ?? ($result['detected']['provider'] ?? 'N/A')],
                        ['Fetched At', $result['fetchedAt'] ?? 'N/A'],
                    ]
                );
            }

            $this->line(json_encode($result, JSON_PRETTY_PRINT));
            return Command::SUCCESS;
        }

        $this->error("✗ Verification Failed or Incomplete");
        $this->line(json_encode($result, JSON_PRETTY_PRINT));
        return Command::FAILURE;
    }
}
