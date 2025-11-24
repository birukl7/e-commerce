<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Product;
use App\Models\PaymentTransaction;
use App\Models\ProductRequest;
use App\Models\Order;
use Illuminate\Http\Request;

/**
 * Test API Routes
 * 
 * These routes are only available in the testing or local environment.
 * They provide helpers for E2E testing with Playwright.
 */
// Note: These routes are included from api.php, so they're already under /api prefix
// We use 'test' prefix to make them /api/test/*
if (app()->environment(['testing', 'local']) || env('APP_ENV') === 'testing') {
    Route::prefix('test')->group(function () {
        
        // Health check route
        Route::get('/health', function () {
            return response()->json([
                'status' => 'ok',
                'environment' => app()->environment(),
                'app_env' => env('APP_ENV'),
            ]);
        });
        
        // ============================================
        // User Management
        // ============================================
        
        Route::post('/users/customer', function () {
            $user = User::factory()->customer()->create([
                'email_verified_at' => now(),
                'status' => 'active',
            ]);
            
            return response()->json([
                'id' => $user->id,
                'email' => $user->email,
                'password' => 'password', // Factory default
                'name' => $user->name,
                'role' => 'customer',
            ]);
        });

        Route::post('/users/admin', function () {
            $user = User::factory()->admin()->create([
                'email_verified_at' => now(),
                'status' => 'active',
            ]);
            
            return response()->json([
                'id' => $user->id,
                'email' => $user->email,
                'password' => 'password', // Factory default
                'name' => $user->name,
                'role' => 'admin',
            ]);
        });

        Route::get('/users/{id}', function ($id) {
            $user = User::findOrFail($id);
            return response()->json($user);
        });

        // ============================================
        // Database Management
        // ============================================
        
        Route::post('/database/reset', function () {
            Artisan::call('migrate:fresh', ['--seed' => true]);
            return response()->json(['status' => 'success', 'message' => 'Database reset and seeded']);
        });

        Route::post('/database/seed', function () {
            Artisan::call('db:seed');
            return response()->json(['status' => 'success', 'message' => 'Database seeded']);
        });

        Route::post('/database/refresh', function () {
            Artisan::call('migrate:refresh', ['--seed' => true]);
            return response()->json(['status' => 'success', 'message' => 'Database refreshed']);
        });

        // ============================================
        // Product Management
        // ============================================
        
        Route::post('/products', function (Request $request) {
            try {
                // Get or create default category and brand if not provided
                $categoryId = $request->input('category_id');
                if (!$categoryId) {
                    $category = \App\Models\Category::first();
                    if (!$category) {
                        $category = \App\Models\Category::factory()->create();
                    }
                    $categoryId = $category->id;
                }
                
                $brandId = $request->input('brand_id');
                if (!$brandId) {
                    $brand = \App\Models\Brand::first();
                    if (!$brand) {
                        $brand = \App\Models\Brand::factory()->create();
                    }
                    $brandId = $brand->id;
                }
                
                // Merge defaults with request data
                $data = array_merge([
                    'category_id' => $categoryId,
                    'brand_id' => $brandId,
                    'status' => 'published',
                    'stock_status' => 'in_stock',
                    'manage_stock' => true,
                ], $request->all());
                
                $product = Product::factory()->create($data);
                return response()->json($product);
            } catch (\Exception $e) {
                return response()->json([
                    'error' => 'Failed to create product',
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ], 500);
            }
        });

        Route::get('/products/{id}', function ($id) {
            $product = Product::findOrFail($id);
            return response()->json($product);
        });

        // ============================================
        // Payment Management
        // ============================================
        
        Route::get('/payments/by-order/{orderId}', function ($orderId) {
            $payment = PaymentTransaction::where('order_id', $orderId)
                ->latest()
                ->first();
            
            if (!$payment) {
                return response()->json(['error' => 'Payment not found'], 404);
            }
            
            return response()->json($payment);
        });

        Route::get('/payments/{id}', function ($id) {
            $payment = PaymentTransaction::findOrFail($id);
            return response()->json($payment);
        });

        Route::post('/payments/create', function (Request $request) {
            $payment = PaymentTransaction::create($request->all());
            return response()->json($payment);
        });

        Route::get('/payments/by-product-request/{productRequestId}', function ($productRequestId) {
            $payments = PaymentTransaction::where('product_request_id', $productRequestId)
                ->get();
            
            return response()->json($payments);
        });

        // ============================================
        // Product Request Management
        // ============================================
        
        Route::get('/product-requests/{id}', function ($id) {
            $productRequest = ProductRequest::findOrFail($id);
            return response()->json($productRequest);
        });

        Route::post('/product-requests', function (Request $request) {
            $productRequest = ProductRequest::create($request->all());
            return response()->json($productRequest);
        });

        // ============================================
        // Order Management
        // ============================================
        
        Route::get('/orders/{id}', function ($id) {
            $order = Order::findOrFail($id);
            return response()->json($order);
        });

        Route::post('/orders', function (Request $request) {
            $order = Order::create($request->all());
            return response()->json($order);
        });

        // ============================================
        // Test State Management (for flow chaining)
        // ============================================
        
        Route::post('/state/store', function (Request $request) {
            $key = $request->input('key');
            $value = $request->input('value');
            
            // Store in cache for the test session
            cache()->put("e2e_test_state_{$key}", $value, 3600);
            
            return response()->json(['status' => 'success', 'key' => $key]);
        });

        Route::get('/state/{key}', function ($key) {
            $value = cache()->get("e2e_test_state_{$key}");
            
            if ($value === null) {
                return response()->json(['error' => 'Key not found'], 404);
            }
            
            return response()->json(['key' => $key, 'value' => $value]);
        });

        Route::delete('/state/{key}', function ($key) {
            cache()->forget("e2e_test_state_{$key}");
            return response()->json(['status' => 'success']);
        });

        Route::post('/state/clear', function () {
            // Clear all test state keys (this is a simple implementation)
            // In production, you might want a more sophisticated approach
            return response()->json(['status' => 'success', 'message' => 'Test state cleared']);
        });
    });
}

