<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Api\ProductController as ApiProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


// Category API routes with 'api.' prefix
Route::prefix('categories')->name('api.categories.')->group(function () {
    Route::get('tree', [CategoryController::class, 'tree'])->name('tree');
    Route::get('featured', [CategoryController::class, 'featured'])->name('featured');
    Route::get('trending', [CategoryController::class, 'trending'])->name('trending');
    Route::get('showcase', [CategoryController::class, 'showcase'])->name('showcase');
    
    // Resource routes
    Route::get('/', [CategoryController::class, 'index'])->name('index');
    Route::post('/', [CategoryController::class, 'store'])->name('store');
    Route::get('/create', [CategoryController::class, 'create'])->name('create');
    Route::get('/{category}', [CategoryController::class, 'show'])->name('show');
    Route::put('/{category}', [CategoryController::class, 'update'])->name('update');
    Route::delete('/{category}', [CategoryController::class, 'destroy'])->name('destroy');
    Route::get('/{category}/edit', [CategoryController::class, 'edit'])->name('edit');
});

// Product API routes with 'api.' prefix
Route::prefix('products')->name('api.products.')->group(function () {
    Route::get('showcase', [ProductController::class, 'showcase'])->name('showcase');
    Route::get('featured', [ProductController::class, 'featured'])->name('featured');
    
    // Resource routes
    Route::get('/', [ProductController::class, 'index'])->name('index');
    Route::post('/', [ProductController::class, 'store'])->name('store');
    Route::get('/create', [ProductController::class, 'create'])->name('create');
    // Use API controller for JSON product details used by cart-context
    Route::get('/{product}', [ApiProductController::class, 'show'])->name('show');
    Route::put('/{product}', [ProductController::class, 'update'])->name('update');
    Route::delete('/{product}', [ProductController::class, 'destroy'])->name('destroy');
    Route::get('/{product}/edit', [ProductController::class, 'edit'])->name('edit');
});

// Product Request API routes
Route::prefix('product-requests')->name('api.product-requests.')->group(function () {
    // Public routes
    Route::get('/', [\App\Http\Controllers\ProductRequestController::class, 'index'])->name('index');
    Route::get('/{productRequest}', [\App\Http\Controllers\ProductRequestController::class, 'show'])->name('show');
    
    // Protected routes (require authentication)
    Route::middleware('auth:api')->group(function () {
        Route::post('/', [\App\Http\Controllers\ProductRequestController::class, 'store'])->name('store');
        Route::put('/{productRequest}', [\App\Http\Controllers\ProductRequestController::class, 'update'])->name('update');
        Route::delete('/{productRequest}', [\App\Http\Controllers\ProductRequestController::class, 'destroy'])->name('destroy');
        
        // Admin-only routes
        Route::middleware('admin')->group(function () {
            Route::get('admin', [\App\Http\Controllers\ProductRequestController::class, 'adminIndex'])->name('admin.index');
            Route::post('{productRequest}/status', [\App\Http\Controllers\ProductRequestController::class, 'updateStatus'])->name('status.update');
        });
    });
});

// Debug endpoint for payment-failed component (always available for debugging)
Route::post('/debug/payment-failed-props', function (Request $request) {
    \Log::info('=== FRONTEND PAYMENT FAILED PROPS RECEIVED ===', [
        'timestamp' => now()->toISOString(),
        'url' => $request->input('url'),
        'frontend_timestamp' => $request->input('timestamp'),
        'props_received' => $request->input('props'),
        'props_json' => json_encode($request->input('props'), JSON_PRETTY_PRINT),
        'all_request_data' => $request->all(),
    ]);
    
    return response()->json([
        'status' => 'logged',
        'message' => 'Frontend props logged successfully',
    ]);
})->name('api.debug.payment-failed-props');

// Test API routes (only in testing/local environment)
// These routes are in api.php to bypass CSRF protection
if (app()->environment(['testing', 'local']) || env('APP_ENV') === 'testing') {
    require __DIR__.'/test-api.php';
}
