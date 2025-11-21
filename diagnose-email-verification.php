<?php

/**
 * Email Verification Signature Diagnostic Script
 * 
 * This script helps diagnose why email verification links are failing with 403 "Invalid signature"
 * 
 * Run this on your cPanel server:
 * php diagnose-email-verification.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Email Verification Signature Diagnostic ===\n\n";

// 1. Check APP_KEY
echo "1. APP_KEY Configuration:\n";
$appKey = config('app.key');
if (empty($appKey)) {
    echo "   ❌ APP_KEY is not set!\n";
    echo "   Fix: Run 'php artisan key:generate' on the server\n\n";
} else {
    echo "   ✓ APP_KEY is set\n";
    echo "   First 20 chars: " . substr($appKey, 0, 20) . "...\n\n";
}

// 2. Check APP_URL
echo "2. APP_URL Configuration:\n";
$appUrl = config('app.url');
echo "   Current APP_URL: {$appUrl}\n";
$expectedUrl = 'https://e-commerce.biruklemma.com';
if ($appUrl !== $expectedUrl) {
    echo "   ⚠️  APP_URL doesn't match expected URL\n";
    echo "   Expected: {$expectedUrl}\n";
    echo "   Current: {$appUrl}\n";
    echo "   Fix: Set APP_URL={$expectedUrl} in .env file\n\n";
} else {
    echo "   ✓ APP_URL matches expected URL\n\n";
}

// 3. Test signature generation
echo "3. Testing Signature Generation:\n";
try {
    $testUser = \App\Models\User::find(30); // User ID from the URL
    if (!$testUser) {
        echo "   ⚠️  User ID 30 not found\n";
        echo "   Testing with first available user...\n";
        $testUser = \App\Models\User::first();
    }
    
    if ($testUser) {
        $verificationUrl = \Illuminate\Support\Facades\URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $testUser->id, 'hash' => sha1($testUser->email)]
        );
        
        echo "   ✓ Signature generation works\n";
        echo "   Generated URL: {$verificationUrl}\n";
        
        // Extract signature from URL
        $parsedUrl = parse_url($verificationUrl);
        parse_str($parsedUrl['query'] ?? '', $queryParams);
        if (isset($queryParams['signature'])) {
            echo "   Signature: " . substr($queryParams['signature'], 0, 20) . "...\n";
        }
        echo "\n";
    } else {
        echo "   ⚠️  No users found in database\n\n";
    }
} catch (\Throwable $e) {
    echo "   ❌ Error generating signature: " . $e->getMessage() . "\n\n";
}

// 4. Check if URL from email matches current configuration
echo "4. URL Analysis:\n";
$emailUrl = 'https://e-commerce.biruklemma.com/verify-email/30/58c81eaeefd22c13ecede10d5874922d83be1d95?expires=1763474634&signature=fded2e706e49b3bbdb2f1479399f35b47e2b18170251cf1ff5121ecf38b6eea9';
echo "   Email URL: {$emailUrl}\n";

// Parse the URL
$parsed = parse_url($emailUrl);
parse_str($parsed['query'] ?? '', $params);

echo "   User ID: " . ($parsed['path'] ? explode('/', $parsed['path'])[2] : 'N/A') . "\n";
echo "   Hash: " . ($parsed['path'] ? explode('/', $parsed['path'])[3] : 'N/A') . "\n";
echo "   Expires: " . (isset($params['expires']) ? date('Y-m-d H:i:s', $params['expires']) : 'N/A') . "\n";
echo "   Signature: " . (isset($params['signature']) ? substr($params['signature'], 0, 20) . '...' : 'N/A') . "\n";

// Check if expired
if (isset($params['expires']) && $params['expires'] < time()) {
    echo "   ❌ URL has expired!\n";
    echo "   Expired at: " . date('Y-m-d H:i:s', $params['expires']) . "\n";
    echo "   Current time: " . date('Y-m-d H:i:s') . "\n\n";
} else {
    echo "   ✓ URL is not expired\n\n";
}

// 5. Test signature validation
echo "5. Testing Signature Validation:\n";
try {
    // Create a mock request
    $request = \Illuminate\Http\Request::create($emailUrl, 'GET');
    
    // Try to validate the signature
    $route = \Illuminate\Support\Facades\Route::getRoutes()->match($request);
    
    if ($route) {
        echo "   ✓ Route matched\n";
        echo "   Route name: " . $route->getName() . "\n";
        
        // Check middleware
        $middleware = $route->gatherMiddleware();
        echo "   Middleware: " . implode(', ', $middleware) . "\n";
    } else {
        echo "   ❌ Route not found\n";
    }
} catch (\Illuminate\Routing\Exceptions\InvalidSignatureException $e) {
    echo "   ❌ Invalid signature detected!\n";
    echo "   Error: " . $e->getMessage() . "\n";
    echo "\n   This confirms the signature validation is failing.\n";
    echo "   Most likely causes:\n";
    echo "   1. APP_KEY mismatch (email generated with different key)\n";
    echo "   2. APP_URL mismatch (email generated with different URL)\n";
    echo "   3. URL was modified by email client\n\n";
} catch (\Throwable $e) {
    echo "   ⚠️  Could not test signature validation: " . $e->getMessage() . "\n\n";
}

// 6. Recommendations
echo "=== Recommendations ===\n\n";
echo "If signature validation is failing:\n";
echo "1. Ensure APP_KEY is the same on both environments\n";
echo "2. Ensure APP_URL matches the actual domain\n";
echo "3. Check if email client modified the URL\n";
echo "4. Try requesting a new verification email\n";
echo "5. Check server time is synchronized (NTP)\n\n";

echo "To fix:\n";
echo "1. On cPanel, check .env file:\n";
echo "   - APP_KEY should match the key used when email was sent\n";
echo "   - APP_URL should be: https://e-commerce.biruklemma.com\n";
echo "\n";
echo "2. If APP_KEY changed, all existing verification links will be invalid\n";
echo "   Solution: Users need to request new verification emails\n";
echo "\n";
echo "3. To test, generate a new verification link:\n";
echo "   php artisan tinker\n";
echo "   \$user = App\\Models\\User::find(30);\n";
echo "   \$url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(60), ['id' => \$user->id, 'hash' => sha1(\$user->email)]);\n";
echo "   echo \$url;\n\n";

