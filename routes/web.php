<?php

use App\Http\Controllers\AdminBrandController;
use App\Http\Controllers\AdminCategoryController;
use App\Http\Controllers\AdminProductController;
use App\Http\Controllers\AdminProductRequestController;
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
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\UserDashboardController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\AdminPaymentController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminOrderController;
use App\Http\Controllers\AdminSiteConfigController;
// use App\Http\Controller\AdminProductRequestController;
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
    $settings = App\Http\Controllers\AdminSiteConfigController::getAllSettings();
    return Inertia::render('welcome', ['settings' => $settings]);
})->name('home');

// Legal pages
Route::get('/terms', function () {
    $settings = App\Http\Controllers\AdminSiteConfigController::getAllSettings();
    return Inertia::render('terms', ['settings' => $settings]);
})->name('terms');

Route::get('/privacy', function () {
    $settings = App\Http\Controllers\AdminSiteConfigController::getAllSettings();
    return Inertia::render('privacy', ['settings' => $settings]);
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


// Add these routes to your web.php file



// Admin routes
Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('/admin-dashboard',[AdminDashboardController::class, 'index'])->name('admin.dashboard');

    Route::get('admin/categories', [AdminCategoryController::class, 'index'])->name('admin.categories.index');

    Route::get('admin/categories/create', [AdminCategoryController::class, 'create'])->name('admin.categories.create');

    Route::post('admin/categories', [AdminCategoryController::class, 'store'])->name('admin.categories.store');

    Route::get('admin/paymentStats', [AdminPaymentController::class, 'index'])->name('admin.payment-stats');
    Route::get('admin/paymentStats/{paymentId}', [AdminPaymentController::class, 'show'])->name('admin.payment-stats');

    Route::get('admin/categories/{category}', [AdminCategoryController::class, 'show'])->name('admin.categories.show');

    Route::get('admin/categories/{category}/edit', [AdminCategoryController::class, 'edit'])->name('admin.categories.edit');

    Route::put('admin/categories/{category}', [AdminCategoryController::class, 'update'])->name('admin.categories.update');

    Route::delete('admin/categories/{category}', [AdminCategoryController::class, 'destroy'])->name('admin.categories.destroy');

    Route::resource('admin/brands', AdminBrandController::class);

    Route::resource('admin/products', AdminProductController::class);
    Route::resource('/admin/customers', CustomerController::class);
    Route::get('/admin/suppliers', [CustomerController::class, 'suppliers'])->name('admin.suppliers.index');
    Route::resource('admin/orders', AdminOrderController::class);
    Route::resource('admin/product-requests', AdminProductRequestController::class);
    
    Route::get('/admin/payments', [AdminPaymentController::class, 'index'])->name('admin.payments.index');
    Route::get('/admin/payments/export', [AdminPaymentController::class, 'export'])->name('admin.payments.export');
    Route::get('/admin/payments/{payment}', [AdminPaymentController::class, 'show'])->name('admin.payments.show');
    Route::put('/admin/payments/{payment}/status', [AdminPaymentController::class, 'updateStatus'])->name('admin.payments.updateStatus');

    // Payment management routes
    Route::get('/admin/payments', [AdminPaymentController::class, 'index'])->name('admin.payments.index');
    Route::get('/admin/payments/export', [AdminPaymentController::class, 'export'])->name('admin.payments.export');
    Route::get('/admin/payments/{payment}', [AdminPaymentController::class, 'show'])->name('admin.payments.show');
    Route::put('/admin/payments/{payment}/status', [AdminPaymentController::class, 'updateStatus'])->name('admin.payments.updateStatus');

    // Site Configuration routes
    Route::get('/admin/site-config', [AdminSiteConfigController::class, 'index'])->name('admin.site-config.index');
    Route::post('/admin/site-config', [AdminSiteConfigController::class, 'update'])->name('admin.site-config.update');
    
    // Offline Payment Method Management
    Route::post('/admin/offline-payment-methods', [AdminSiteConfigController::class, 'storeOfflinePaymentMethod'])->name('admin.offline-payment-methods.store');
    Route::put('/admin/offline-payment-methods/{offlinePaymentMethod}', [AdminSiteConfigController::class, 'updateOfflinePaymentMethod'])->name('admin.offline-payment-methods.update');
    Route::delete('/admin/offline-payment-methods/{offlinePaymentMethod}', [AdminSiteConfigController::class, 'deleteOfflinePaymentMethod'])->name('admin.offline-payment-methods.destroy');
    
    // Offline Payment Submissions Management
    Route::get('/admin/offline-payments', [App\Http\Controllers\OfflinePaymentController::class, 'adminIndex'])->name('admin.offline-payments.index');
    Route::get('/admin/offline-payments/{submission}', [App\Http\Controllers\OfflinePaymentController::class, 'adminShow'])->name('admin.offline-payments.show');
    Route::post('/admin/offline-payments/{submission}/status', [App\Http\Controllers\OfflinePaymentController::class, 'adminUpdateStatus'])->name('admin.offline-payments.update-status');
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
    Route::get('/user-order', [UserDashboardController::class, 'orders'])->name('user.orders');
    Route::get('/contact', fn() => Inertia::render('user/orders'))->name('contact'); 

    // Route::get('/user-products', fn() => Inertia::render('user/products'))->name('user.products');
    // Add these routes to your web.php file in the authenticated middleware group

    // Individual order details and tracking
    Route::get('/user/orders/{order}', [UserDashboardController::class, 'showOrder'])->name('user.orders.show');
    Route::get('/user/orders/{order}/track', [UserDashboardController::class, 'trackOrder'])->name('user.orders.track');
    
    // Product Request routes
    Route::get('/request', [RequestController::class, 'index'])->name('request.index');
    Route::post('/request', [RequestController::class, 'store'])->name('request.store');
    Route::get('/request/{productRequest}/edit', [RequestController::class, 'edit'])->name('request.edit');
    Route::put('/request/{productRequest}', [RequestController::class, 'update'])->name('request.update');
    Route::delete('/request/{productRequest}', [RequestController::class, 'destroy'])->name('request.destroy');
    Route::get('/request/history', [RequestController::class, 'history'])->name('request.history');

    // Payment flow routes (replace existing payment routes)
    Route::prefix('payment')->name('payment.')->group(function () {
        // Payment method selection (first step after checkout)
        Route::get('/select', [PaymentController::class, 'selectMethod'])->name('select');
        
        // Payment processing page (shows Chapa form or offline form based on selection)
        Route::get('/process', [PaymentController::class, 'showPaymentPage'])->name('show');
        Route::post('/process', [PaymentController::class, 'processPayment'])->name('process');
        
        // Chapa payment routes
        Route::post('/callback', [PaymentController::class, 'paymentCallback'])->name('callback');
        Route::get('/return/{tx_ref}', [PaymentController::class, 'paymentReturn'])->name('return');
        
        // Offline payment routes
        Route::post('/offline/submit', [PaymentController::class, 'submitOffline'])->name('offline.submit');
        Route::get('/offline/success', [PaymentController::class, 'offlineSubmissionSuccess'])->name('offline.success');
        
        // Generic success/failed pages
        Route::get('/success', [PaymentController::class, 'paymentSuccess'])->name('success');
        Route::get('/failed', [PaymentController::class, 'paymentFailed'])->name('failed');
    }); 
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
