<?php

namespace App\Services;

use Spatie\Image\Image;
use Spatie\Image\Enums\Fit;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class ImageOptimizationService
{
    protected array $supportedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    protected string $basePath;

    public function __construct()
    {
        $this->basePath = public_path('images');
    }

    /**
     * Optimize all images in the public/images directory
     */
    public function optimizeAllImages(): array
    {
        $results = [
            'processed' => 0,
            'skipped' => 0,
            'errors' => 0,
            'total_size_before' => 0,
            'total_size_after' => 0,
            'files' => []
        ];

        if (!File::exists($this->basePath)) {
            Log::warning("Images directory does not exist: {$this->basePath}");
            return $results;
        }

        $images = $this->getAllImages();

        foreach ($images as $imagePath) {
            try {
                $result = $this->optimizeImage($imagePath);
                
                if ($result['processed']) {
                    $results['processed']++;
                    $results['total_size_before'] += $result['size_before'];
                    $results['total_size_after'] += $result['size_after'];
                } else {
                    $results['skipped']++;
                }

                $results['files'][] = $result;

            } catch (\Exception $e) {
                $results['errors']++;
                $results['files'][] = [
                    'file' => $imagePath,
                    'processed' => false,
                    'error' => $e->getMessage()
                ];
                
                Log::error("Error optimizing image {$imagePath}: " . $e->getMessage());
            }
        }

        return $results;
    }

    /**
     * Optimize a single image
     */
    public function optimizeImage(string $imagePath): array
    {
        $fullPath = $this->basePath . '/' . ltrim($imagePath, '/');
        
        if (!File::exists($fullPath)) {
            throw new \Exception("Image not found: {$fullPath}");
        }

        $sizeBefore = File::size($fullPath);
        $backupPath = $fullPath . '.backup';

        // Create backup
        File::copy($fullPath, $backupPath);

        try {
            // Optimize the image
            Image::load($fullPath)
                ->optimize()
                ->save();

            $sizeAfter = File::size($fullPath);
            $savedBytes = $sizeBefore - $sizeAfter;
            $savedPercentage = $sizeBefore > 0 ? round(($savedBytes / $sizeBefore) * 100, 2) : 0;

            // Remove backup if optimization was successful
            File::delete($backupPath);

            return [
                'file' => $imagePath,
                'processed' => true,
                'size_before' => $sizeBefore,
                'size_after' => $sizeAfter,
                'saved_bytes' => $savedBytes,
                'saved_percentage' => $savedPercentage
            ];

        } catch (\Exception $e) {
            // Restore from backup if optimization failed
            if (File::exists($backupPath)) {
                File::move($backupPath, $fullPath);
            }
            throw $e;
        }
    }

    /**
     * Optimize images with specific quality settings
     */
    public function optimizeWithQuality(string $imagePath, int $quality = 85): array
    {
        $fullPath = $this->basePath . '/' . ltrim($imagePath, '/');
        
        if (!File::exists($fullPath)) {
            throw new \Exception("Image not found: {$fullPath}");
        }

        $sizeBefore = File::size($fullPath);
        $backupPath = $fullPath . '.backup';

        // Create backup
        File::copy($fullPath, $backupPath);

        try {
            // Optimize with specific quality
            Image::load($fullPath)
                ->quality($quality)
                ->optimize()
                ->save();

            $sizeAfter = File::size($fullPath);
            $savedBytes = $sizeBefore - $sizeAfter;
            $savedPercentage = $sizeBefore > 0 ? round(($savedBytes / $sizeBefore) * 100, 2) : 0;

            // Remove backup if optimization was successful
            File::delete($backupPath);

            return [
                'file' => $imagePath,
                'processed' => true,
                'size_before' => $sizeBefore,
                'size_after' => $sizeAfter,
                'saved_bytes' => $savedBytes,
                'saved_percentage' => $savedPercentage,
                'quality' => $quality
            ];

        } catch (\Exception $e) {
            // Restore from backup if optimization failed
            if (File::exists($backupPath)) {
                File::move($backupPath, $fullPath);
            }
            throw $e;
        }
    }

    /**
     * Create optimized versions with different sizes
     */
    public function createResponsiveImages(string $imagePath, array $sizes = [800, 1200, 1600]): array
    {
        $fullPath = $this->basePath . '/' . ltrim($imagePath, '/');
        
        if (!File::exists($fullPath)) {
            throw new \Exception("Image not found: {$fullPath}");
        }

        $results = [];
        $pathInfo = pathinfo($fullPath);
        $baseName = $pathInfo['dirname'] . '/' . $pathInfo['filename'];
        $extension = $pathInfo['extension'];

        foreach ($sizes as $width) {
            $outputPath = "{$baseName}-{$width}w.{$extension}";
            
            try {
                Image::load($fullPath)
                    ->width($width)
                    ->optimize()
                    ->save($outputPath);

                $results[] = [
                    'width' => $width,
                    'file' => str_replace($this->basePath . '/', '', $outputPath),
                    'size' => File::size($outputPath),
                    'created' => true
                ];

            } catch (\Exception $e) {
                $results[] = [
                    'width' => $width,
                    'file' => str_replace($this->basePath . '/', '', $outputPath),
                    'created' => false,
                    'error' => $e->getMessage()
                ];
            }
        }

        return $results;
    }

    /**
     * Get all image files in the directory recursively
     */
    public function getAllImages(): array
    {
        $images = [];
        
        if (!File::exists($this->basePath)) {
            return $images;
        }
        
        $files = File::allFiles($this->basePath);
        
        foreach ($files as $file) {
            $extension = strtolower($file->getExtension());
            
            if (in_array($extension, $this->supportedExtensions)) {
                // Skip backup files
                if (str_ends_with($file->getFilename(), '.backup')) {
                    continue;
                }
                
                $images[] = $file->getRelativePathname();
            }
        }

        return $images;
    }

    /**
     * Get optimization statistics
     */
    public function getStats(): array
    {
        $images = $this->getAllImages();
        $totalSize = 0;
        $fileCount = count($images);

        foreach ($images as $imagePath) {
            $fullPath = $this->basePath . '/' . $imagePath;
            if (File::exists($fullPath)) {
                $totalSize += File::size($fullPath);
            }
        }

        return [
            'total_files' => $fileCount,
            'total_size' => $totalSize,
            'total_size_mb' => round($totalSize / 1024 / 1024, 2),
            'supported_formats' => $this->supportedExtensions
        ];
    }
}