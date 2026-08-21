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
            \Log::debug('[IMAGE URL] formatImageUrl called with null/empty path');
            return null;
        }

        $originalPath = $imagePath;
        
        // Handle different image path formats
        $imagePath = trim($imagePath);
        
        $formattedUrl = null;
        $formatType = 'unknown';
        
        if (str_starts_with($imagePath, 'http://') || str_starts_with($imagePath, 'https://')) {
            // Already a full URL
            $formattedUrl = $imagePath;
            $formatType = 'full_url';
        } elseif (str_starts_with($imagePath, '/storage/products/product-requests/')) {
            // Fix incorrectly formatted path: /storage/products/product-requests/... -> /storage/product-requests/...
            $formattedUrl = str_replace('/storage/products/product-requests/', '/storage/product-requests/', $imagePath);
            $formatType = 'corrected_path';
        } elseif (str_starts_with($imagePath, '/storage/') || str_starts_with($imagePath, '/image/')) {
            // Already formatted path starting with /storage/ or /image/
            $formattedUrl = $imagePath;
            $formatType = 'already_formatted';
        } elseif (str_starts_with($imagePath, 'storage/')) {
            // Storage path without leading slash
            $formattedUrl = '/' . $imagePath;
            $formatType = 'storage_without_slash';
        } elseif (str_starts_with($imagePath, 'products/') || 
            str_starts_with($imagePath, 'categories/') || 
            str_starts_with($imagePath, 'brands/') ||
            str_starts_with($imagePath, 'images/') ||
            str_starts_with($imagePath, 'product-requests/') ||
            str_starts_with($imagePath, 'payment-proofs/')) {
            // Storage path from Laravel store() method (products/filename.jpg, images/filename.jpg, etc.)
            // These are stored in storage/app/public/ and need /storage/ prefix
            $formattedUrl = '/storage/' . $imagePath;
            $formatType = 'storage_path';
        } elseif (str_starts_with($imagePath, '/')) {
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
                $formattedUrl = '/image/' . $pathWithoutSlash;
                $formatType = 'legacy_filename';
            } elseif (str_starts_with($imagePath, '/image/')) {
                // If it starts with image/, use it as is
                $formattedUrl = $imagePath;
                $formatType = 'image_path';
            } else {
                // Otherwise, return as-is (might be a valid absolute path)
                $formattedUrl = $imagePath;
                $formatType = 'absolute_path';
            }
        } elseif (str_starts_with($imagePath, 'image/')) {
            // Image folder path
            $formattedUrl = '/' . $imagePath;
            $formatType = 'image_folder';
        } else {
            // Default: assume it's a filename in the products bucket
            $formattedUrl = '/storage/products/' . ltrim($imagePath, '/');
            $formatType = 'default_products';
        }
        
        \Log::debug('[IMAGE URL] Image URL formatted', [
            'original_path' => $originalPath,
            'formatted_url' => $formattedUrl,
            'format_type' => $formatType,
            'path_changed' => $originalPath !== $formattedUrl,
        ]);
        
        return $formattedUrl;
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
            return preg_replace('#^/storage/#', '', $imagePath);
        }

        // Remove /image/ prefix if present (legacy format)
        if (str_starts_with($imagePath, '/image/')) {
            $pathWithoutPrefix = preg_replace('#^/image/#', '', $imagePath);
            if (!str_contains($pathWithoutPrefix, '/')) {
                return 'image/' . $pathWithoutPrefix;
            }
            return $pathWithoutPrefix;
        }

        // Remove storage/ prefix if present (without leading slash)
        if (str_starts_with($imagePath, 'storage/')) {
            return preg_replace('#^storage/#', '', $imagePath);
        }

        // If it starts with / and is just a filename, assume images/ bucket
        if (str_starts_with($imagePath, '/') && !str_contains(ltrim($imagePath, '/'), '/')) {
            return 'images/' . ltrim($imagePath, '/');
        }

        // Already in storage format (images/filename.jpg, products/filename.jpg, etc.)
        return $imagePath;
    }
}

