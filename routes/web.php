<?php

use App\Http\Controllers\AdminBrandController;
use App\Http\Controllers\AdminCategoryController;
use App\Http\Controllers\AdminProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ChooseRoleController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\PayPalController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\SocialiteController;
use App\Http\Controllers\UserDashboardController;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


/**
 * Google Login
 */
Route::controller(SocialiteController::class)->group(function() {
    Route::get('auth/redirection/google', 'authProviderRedirect')->name('auth.redirection');

    Route::get('auth/google/callback', 'googleAuthentication')->name('auth.callback');

    Route::get('/choose-role', [ChooseRoleController::class, 'index'])->name('choose-role.index');

    Route::post('/choose-role', [ChooseRoleController::class, 'store'])->name('choose-role.store');
});



Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Legal pages
Route::get('/terms', function () {
    return Inertia::render('terms');
})->name('terms');

Route::get('/privacy', function () {
    return Inertia::render('privacy');
})->name('privacy');

Route::resource('categories', CategoryController::class)->parameters([
    'categories' => 'category:slug',
]);

// Search routes
Route::get('/search', [SearchController::class, 'search'])->name('search');

Route::get('/request', fn()=> Inertia::render('request/index'))->name(
'request.index');
Route::post('/request', [RequestController::class, 'store']);



Route::get('/search/suggestions', [SearchController::class, 'suggestions'])->name('search.suggestions');

// Product routes
Route::get('/products/{slug}', [ProductController::class, 'show'])->name('products.show');

Route::get('/products/{product}/reviews', [ProductController::class, 'getProductReviews'])->name('products.reviews');

// PayPal routes
Route::get('/paypal', [PayPalController::class, 'index'])->name('paypal');
Route::post('/paypal/payment', [PayPalController::class, 'payment'])->name('paypal.payment');
Route::get('/paypal/payment/success', [PayPalController::class, 'paymentSuccess'])->name('paypal.payment.success');
Route::get('/paypal/payment/cancel', [PayPalController::class, 'paymentCancel'])->name('paypal.payment.cancel');
Route::get('/paypal/payment/status', [PayPalController::class, 'getPaymentStatus'])->name('paypal.payment.status');

// Admin routes
Route::middleware(['auth', 'verified', 'admin'])->group(function () {

    Route::get('/admin-dashboard', fn()=>Inertia::render('admin/dashboard'))->name('admin.dashboard');
    

    Route::get('admin/categories', [AdminCategoryController::class, 'index'])->name('admin.categories.index');

    Route::get('admin/categories/create', [AdminCategoryController::class, 'create'])->name('admin.categories.create');

    Route::post('admin/categories', [AdminCategoryController::class, 'store'])->name('admin.categories.store');

    Route::get('admin/categories/{category}', [AdminCategoryController::class, 'show'])->name('admin.categories.show');

    Route::get('admin/categories/{category}/edit', [AdminCategoryController::class, 'edit'])->name('admin.categories.edit');

    Route::put('admin/categories/{category}', [AdminCategoryController::class, 'update'])->name('admin.categories.update');

    Route::delete('admin/categories/{category}', [AdminCategoryController::class, 'destroy'])->name('admin.categories.destroy');

    Route::resource('admin/brands', AdminBrandController::class);

    Route::resource('admin/products', AdminProductController::class);
});
// Authenticated routes
Route::middleware(['auth', 'verified',])->group(function () {
    // Main dashboard
    Route::get('/user-dashboard', [UserDashboardController::class, 'index'])->name('user.dashboard');

    
    // User dashboard (if different from main dashboard)
    // Route::get('/user-dashboard', fn() => Inertia::render('user/dashboard'))->name('user.dashboard');
    
    // Checkout
    Route::get('/checkout', fn() => Inertia::render('checkout/show'))->name('checkout');
    
    // User-specific pages
    Route::get('/user-wishlist', [WishlistController::class, 'index'])->name('user.wishlist');
    Route::get('/user-request', [RequestController::class, 'index'])->name('user.request');
    // Route::get('/user-order', fn() => Inertia::render('user/orders'))->name('user.order');
    // Route::get('/user-products', fn() => Inertia::render('user/products'))->name('user.products');
    
    // Product Request routes
    Route::post('/user-request', [RequestController::class, 'store'])->name('user.request.store');
    Route::get('/user-request/history', [RequestController::class, 'history'])->name('user.request.history');
    
    // Wishlist AJAX routes
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle'])->name('wishlist.toggle');
    Route::post('/wishlist/add', [WishlistController::class, 'store'])->name('wishlist.store');
    Route::delete('/wishlist/remove', [WishlistController::class, 'destroy'])->name('wishlist.destroy');
    Route::get('/wishlist/check', [WishlistController::class, 'check'])->name('wishlist.check');

    // Review routes
    Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');
    Route::post('/reviews/{review}/helpful', [ReviewController::class, 'toggleHelpful'])->name('reviews.helpful');
});

// Legacy API routes (if still needed)
Route::middleware(['auth', 'web'])->group(function () {
    Route::get('/api/wishlist', [WishlistController::class, 'index'])->name('api.wishlist.index');
    Route::post('/api/wishlist', [WishlistController::class, 'store'])->name('api.wishlist.store');
    Route::delete('/api/wishlist', [WishlistController::class, 'destroy'])->name('api.wishlist.destroy');
    Route::post('/api/wishlist/toggle', [WishlistController::class, 'toggle'])->name('api.wishlist.toggle');
    Route::get('/api/wishlist/check', [WishlistController::class, 'check'])->name('api.wishlist.check');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
