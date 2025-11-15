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
            str_starts_with($imagePath, 'brands/') ||
            str_starts_with($imagePath, 'images/')) {
            // Storage path from Laravel store() method (products/filename.jpg, images/filename.jpg, etc.)
            // These are stored in storage/app/public/ and need /storage/ prefix
            return '/storage/' . $imagePath;
        }
        
        if (str_starts_with($imagePath, '/')) {
            // Path starting with / - could be:
            // 1. Old format: /filename.jpg (legacy images in public/image/)
            // 2. Already formatted: /storage/... or /image/... (handled above)
            // 3. Public image: /image/filename.jpg
            
            // If it's just a filename (no directory), check if it's a legacy image
            $pathWithoutSlash = ltrim($imagePath, '/');
            if (!str_contains($pathWithoutSlash, '/')) {
                // It's just a filename - could be:
                // - Legacy image in /image/ (symlinked to storage/app/public)
                // - New image in /storage/products/
                // Try /image/ first for backward compatibility, then /storage/products/
                // Since public/image is symlinked to storage/app/public, /image/ works for both
                return '/image/' . $pathWithoutSlash;
            }
            
            // If it starts with image/, use it as is
            if (str_starts_with($imagePath, '/image/')) {
                return $imagePath;
            }
            
            // Otherwise, return as-is (might be a valid absolute path)
            return $imagePath;
        }
        
        if (str_starts_with($imagePath, 'image/')) {
            // Image folder path
            return '/' . $imagePath;
        }
        
        // Default: assume it's a filename in the products bucket
        return '/storage/products/' . ltrim($imagePath, '/');
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

    /**
     * Normalize image path to storage format (remove /storage/ prefix, etc.)
     * Converts formatted paths back to raw storage paths for database storage
     * 
     * @param string|null $imagePath The formatted image path
     * @return string|null The normalized storage path
     */
    public static function normalizeToStoragePath(?string $imagePath): ?string
    {
        if (!$imagePath) {
            return null;
        }

        $imagePath = trim($imagePath);

        // If it's a full URL, return as-is (can't normalize)
        if (str_starts_with($imagePath, 'http://') || str_starts_with($imagePath, 'https://')) {
            return $imagePath;
        }

        // Remove /storage/ prefix if present
        if (str_starts_with($imagePath, '/storage/')) {
            return ltrim($imagePath, '/storage/');
        }

        // Remove /image/ prefix if present (legacy format)
        if (str_starts_with($imagePath, '/image/')) {
            $pathWithoutPrefix = ltrim($imagePath, '/image/');
            // If it's just a filename, assume it's in images/ bucket
            if (!str_contains($pathWithoutPrefix, '/')) {
                return 'images/' . $pathWithoutPrefix;
            }
            return $pathWithoutPrefix;
        }

        // Remove storage/ prefix if present (without leading slash)
        if (str_starts_with($imagePath, 'storage/')) {
            return ltrim($imagePath, 'storage/');
        }

        // If it starts with / and is just a filename, assume images/ bucket
        if (str_starts_with($imagePath, '/') && !str_contains(ltrim($imagePath, '/'), '/')) {
            return 'images/' . ltrim($imagePath, '/');
        }

        // Already in storage format (images/filename.jpg, products/filename.jpg, etc.)
        return $imagePath;
    }
}

