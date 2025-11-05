<?php

namespace App\Services;

class ImageUrlService
{
    /**
     * Format image path to a full URL that can be used in the frontend
     * 
     * Handles various image path formats:
     * - Full URLs (http://, https://)
     * - Storage paths (products/, categories/, brands/)
     * - Already formatted paths (/storage/, /image/)
     * - Relative paths
     * 
     * @param string|null $imagePath The image path from database
     * @return string|null The formatted image URL or null if no path provided
     */
    public static function formatImageUrl(?string $imagePath): ?string
    {
        if (!$imagePath) {
            return null;
        }

        // Handle different image path formats
        $imagePath = trim($imagePath);
        
        if (str_starts_with($imagePath, 'http://') || str_starts_with($imagePath, 'https://')) {
            // Already a full URL
            return $imagePath;
        }
        
        if (str_starts_with($imagePath, '/storage/') || str_starts_with($imagePath, '/image/')) {
            // Already formatted path starting with /storage/ or /image/
            return $imagePath;
        }
        
        if (str_starts_with($imagePath, 'storage/')) {
            // Storage path without leading slash
            return '/' . $imagePath;
        }
        
        if (str_starts_with($imagePath, 'products/') || 
            str_starts_with($imagePath, 'categories/') || 
            str_starts_with($imagePath, 'brands/')) {
            // Storage path from Laravel store() method (products/filename.jpg)
            // These are stored in storage/app/public/ and need /storage/ prefix
            return '/storage/' . $imagePath;
        }
        
        if (str_starts_with($imagePath, '/')) {
            // Absolute path starting with /
            return $imagePath;
        }
        
        if (str_starts_with($imagePath, 'image/')) {
            // Image folder path
            return '/' . $imagePath;
        }
        
        // Default: assume it's a filename or relative path in the image folder
        return '/image/' . ltrim($imagePath, '/');
    }

    /**
     * Format multiple image paths at once
     * 
     * @param array $imagePaths Array of image paths
     * @return array Array of formatted image URLs
     */
    public static function formatImageUrls(array $imagePaths): array
    {
        return array_map(
            fn($path) => self::formatImageUrl($path),
            $imagePaths
        );
    }
}

