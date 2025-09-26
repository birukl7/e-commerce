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



