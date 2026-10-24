<?php

namespace App\Console\Commands;

use App\Services\LinksEtService;
use Illuminate\Console\Command;

class LinksEtStatusCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'links-et:status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check upstream status and health of links.et and connected Ethiopian banks';

    /**
     * Execute the console command.
     */
    public function handle(LinksEtService $service): int
    {
        $this->info("Checking links.et status...");

        $health = $service->checkHealth();
        $this->line("Health check: " . ($health['ok'] ? '<fg=green>OK</>' : '<fg=red>FAIL</>'));

        $statusData = $service->checkStatus();
        $components = $statusData['components'] ?? [];

        if (empty($components)) {
            $this->warn("No components returned.");
            return Command::SUCCESS;
        }

        $rows = [];
        foreach ($components as $comp) {
            $status = $comp['status'] ?? 'unknown';
            $statusFormatted = match ($status) {
                'operational' => '<fg=green>operational</>',
                'slow' => '<fg=yellow>slow</>',
                'down' => '<fg=red>down</>',
                default => $status,
            };

            $rows[] = [
                $comp['name'] ?? 'N/A',
                $comp['group'] ?? 'N/A',
                $statusFormatted,
                isset($comp['responseMs']) ? "{$comp['responseMs']}ms" : 'N/A',
                $comp['httpStatus'] ?? 'N/A',
            ];
        }

        $this->table(['Component / Bank', 'Group', 'Status', 'Response Time', 'HTTP'], $rows);

        return Command::SUCCESS;
    }
}
