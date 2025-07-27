<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


// Move specific routes BEFORE the resource route
Route::get('categories/tree', [CategoryController::class, 'tree']);
Route::get('categories/featured', [CategoryController::class, 'featured']);
Route::get('categories/trending', [CategoryController::class, 'trending']);
Route::get('categories/showcase', [CategoryController::class, 'showcase']); // Move this up

// Resource route should come AFTER specific routes
Route::resource('categories', CategoryController::class);

// Products routes
Route::get('products/showcase', [ProductController::class, 'showcase']);
Route::get('products/featured', [ProductController::class, 'featured']);
Route::resource('products', ProductController::class);



