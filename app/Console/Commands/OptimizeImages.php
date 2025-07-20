<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ImageOptimizationService;

class OptimizeImages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'images:optimize 
                            {--quality=85 : Set image quality (1-100)}
                            {--responsive : Create responsive image versions}
                            {--sizes=800,1200,1600 : Comma-separated list of widths for responsive images}
                            {--single= : Optimize a single image file}
                            {--stats : Show optimization statistics}
                            {--dry-run : Show what would be optimized without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Optimize all images in public/images directory using Spatie Image package';

    /**
     * Execute the console command.
     */
    public function handle(ImageOptimizationService $imageService): int
    {
        // Show stats only
        if ($this->option('stats')) {
            return $this->showStats($imageService);
        }

        // Dry run mode
        if ($this->option('dry-run')) {
            return $this->dryRun($imageService);
        }

        // Optimize single image
        if ($this->option('single')) {
            return $this->optimizeSingle($imageService);
        }

        // Create responsive images
        if ($this->option('responsive')) {
            return $this->createResponsiveImages($imageService);
        }

        // Default: optimize all images
        return $this->optimizeAll($imageService);
    }

    protected function optimizeAll(ImageOptimizationService $imageService): int
    {
        $this->info('Starting image optimization...');
        $this->newLine();

        $progressBar = $this->output->createProgressBar();
        $progressBar->setFormat('verbose');

        $results = $imageService->optimizeAllImages();

        $progressBar->finish();
        $this->newLine(2);

        // Display results
        $this->displayResults($results);

        return Command::SUCCESS;
    }

    protected function optimizeSingle(ImageOptimizationService $imageService): int
    {
        $imagePath = $this->option('single');
        $quality = (int) $this->option('quality');

        $this->info("Optimizing single image: {$imagePath}");

        try {
            if ($quality !== 85) {
                $result = $imageService->optimizeWithQuality($imagePath, $quality);
                $this->info("Optimized with quality: {$quality}%");
            } else {
                $result = $imageService->optimizeImage($imagePath);
            }

            $this->displaySingleResult($result);

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error("Error optimizing image: " . $e->getMessage());
            return Command::FAILURE;
        }
    }

    protected function createResponsiveImages(ImageOptimizationService $imageService): int
    {
        $imagePath = $this->option('single');
        
        if (!$imagePath) {
            $this->error('You must specify a single image with --single when using --responsive');
            return Command::FAILURE;
        }

        $sizes = array_map('intval', explode(',', $this->option('sizes')));

        $this->info("Creating responsive versions for: {$imagePath}");
        $this->info("Sizes: " . implode(', ', $sizes) . 'px wide');

        try {
            $results = $imageService->createResponsiveImages($imagePath, $sizes);

            $this->table(
                ['Width', 'File', 'Size (KB)', 'Status'],
                array_map(function ($result) {
                    return [
                        $result['width'] . 'px',
                        $result['file'] ?? 'N/A',
                        isset($result['size']) ? round($result['size'] / 1024, 1) : 'N/A',
                        $result['created'] ? '✅ Created' : '❌ Failed'
                    ];
                }, $results)
            );

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error("Error creating responsive images: " . $e->getMessage());
            return Command::FAILURE;
        }
    }

    protected function showStats(ImageOptimizationService $imageService): int
    {
        $stats = $imageService->getStats();

        $this->info('Image Directory Statistics');
        $this->newLine();
        
        $this->table(
            ['Metric', 'Value'],
            [
                ['Total Files', number_format($stats['total_files'])],
                ['Total Size', $this->formatBytes($stats['total_size'])],
                ['Total Size (MB)', $stats['total_size_mb'] . ' MB'],
                ['Supported Formats', implode(', ', $stats['supported_formats'])]
            ]
        );

        return Command::SUCCESS;
    }

    protected function dryRun(ImageOptimizationService $imageService): int
    {
        $this->info('Dry run mode - showing what would be optimized:');
        $this->newLine();

        // Get all images that would be processed
        $reflection = new \ReflectionClass($imageService);
        $method = $reflection->getMethod('getAllImages');
        $method->setAccessible(true);
        $images = $method->invoke($imageService);

        if (empty($images)) {
            $this->warn('No images found to optimize.');
            return Command::SUCCESS;
        }

        $this->table(
            ['File', 'Current Size'],
            array_map(function ($imagePath) {
                $fullPath = public_path('images/' . $imagePath);
                $size = file_exists($fullPath) ? filesize($fullPath) : 0;
                
                return [
                    $imagePath,
                    $this->formatBytes($size)
                ];
            }, $images)
        );

        $this->info('Total files that would be optimized: ' . count($images));

        return Command::SUCCESS;
    }

    protected function displayResults(array $results): void
    {
        // Summary
        $this->info('Optimization Summary:');
        $this->table(
            ['Metric', 'Value'],
            [
                ['Files Processed', $results['processed']],
                ['Files Skipped', $results['skipped']],
                ['Errors', $results['errors']],
                ['Total Size Before', $this->formatBytes($results['total_size_before'])],
                ['Total Size After', $this->formatBytes($results['total_size_after'])],
                ['Total Saved', $this->formatBytes($results['total_size_before'] - $results['total_size_after'])],
                ['Space Saved %', $results['total_size_before'] > 0 ? 
                    round((($results['total_size_before'] - $results['total_size_after']) / $results['total_size_before']) * 100, 2) . '%' : '0%']
            ]
        );

        // Show detailed results if requested
        if ($this->option('verbose') && !empty($results['files'])) {
            $this->newLine();
            $this->info('Detailed Results:');
            
            $tableData = array_map(function ($file) {
                if (isset($file['error'])) {
                    return [
                        $file['file'],
                        '❌ Error',
                        $file['error']
                    ];
                }
                
                if (!$file['processed']) {
                    return [
                        $file['file'],
                        '⏭️ Skipped',
                        'No optimization needed'
                    ];
                }

                return [
                    $file['file'],
                    '✅ Optimized',
                    $this->formatBytes($file['saved_bytes']) . ' (' . $file['saved_percentage'] . '% saved)'
                ];
            }, array_slice($results['files'], 0, 20)); // Limit to first 20 files

            $this->table(['File', 'Status', 'Details'], $tableData);
            
            if (count($results['files']) > 20) {
                $this->info('... and ' . (count($results['files']) - 20) . ' more files');
            }
        }
    }

    protected function displaySingleResult(array $result): void
    {
        $this->table(
            ['Metric', 'Value'],
            [
                ['File', $result['file']],
                ['Size Before', $this->formatBytes($result['size_before'])],
                ['Size After', $this->formatBytes($result['size_after'])],
                ['Saved', $this->formatBytes($result['saved_bytes'])],
                ['Saved %', $result['saved_percentage'] . '%'],
                ['Quality', isset($result['quality']) ? $result['quality'] . '%' : 'Default']
            ]
        );
    }

    protected function formatBytes(int $bytes): string
    {
        if ($bytes >= 1073741824) {
            return round($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return round($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return round($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' B';
        }
    }
}