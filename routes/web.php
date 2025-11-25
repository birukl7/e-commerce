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
use App\Http\Controllers\Supplier\SupplierController;
use App\Http\Controllers\Supplier\SupplierProductController;
use App\Http\Controllers\AdminSalesController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminOrderController;
use App\Http\Controllers\AdminSiteConfigController;
use App\Http\Controllers\Admin\TaxSettingController;
use App\Http\Controllers\Admin\StockNotificationController;
use App\Http\Controllers\Admin\AdminTaxController;
use App\Http\Controllers\Admin\AdminStockController;
use App\Models\ProductRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use App\Http\Controllers\Admin\AdminSupplierController;
use App\Http\Controllers\OutOfStockNotificationController;
// use App\Http\Controller\AdminProductRequestController;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Setting;
use App\Services\SiteConfigService;
use App\Services\ImageUrlService;


/**
 * Google Login
 */
Route::controller(SocialiteController::class)->group(function() {
    Route::get('auth/redirection/google', 'authProviderRedirect')->name('auth.redirection');

    Route::get('auth/google/callback', 'googleAuthentication')->name('auth.callback');

    Route::post('/choose-role', [ChooseRoleController::class, 'store'])->name('choose-role.store');
});



Route::get('/', function () {
    // Backend diagnostics for welcome page
    try {
        $totalProducts = Product::query()->count();
        $zeroStock = Product::query()->where('stock_quantity', 0)->count();
        
        // Get featured products (you can adjust the logic based on your needs)
        $featuredProducts = Product::query()
            ->where('featured', true)
            ->where('status', 'published')
            ->with(['images', 'brand', 'category'])
            ->limit(8)
            ->get();
            
        // Get latest products
        $latestProducts = Product::query()
            ->where('status', 'published')
            ->with(['images', 'brand', 'category'])
            ->latest()
            ->limit(8)
            ->get();
            
        Log::info('Welcome page diagnostics', [
            'total_products' => $totalProducts,
            'zero_stock_products' => $zeroStock,
        ]);
    } catch (\Throwable $e) {
        Log::error('Welcome page diagnostics failed', ['message' => $e->getMessage()]);
        $totalProducts = null;
        $zeroStock = null;
        $featuredProducts = collect();
        $latestProducts = collect();
    }

    // Fetch settings from database
    // Get all settings with 'site.' prefix and map them to remove the prefix
    $dbSettings = Setting::where('key', 'like', 'site.%')
        ->get()
        ->mapWithKeys(function ($setting) {
            // Remove 'site.' prefix from key
            $key = str_replace('site.', '', $setting->key);
            $value = $setting->getTypedValue();
            
            // Parse JSON fields if they're strings
            if (in_array($key, ['footer_columns', 'social_links']) && is_string($value)) {
                try {
                    $value = json_decode($value, true);
                } catch (\Exception $e) {
                    // If parsing fails, keep original value
                }
            }
            
            return [$key => $value];
        })
        ->toArray();
    
    // Default settings (used as fallback if not in database)
    $defaultSettings = [
        'banner_main_title' => 'Back to school',
        'banner_main_subtitle' => 'For the first day and beyond',
        'banner_main_button_text' => 'Shop school supplies',
        'banner_main_button_link' => '/categories/school-supplies',
        'banner_main_image' => 'image/image-3.jpg',
        'banner_secondary_title' => 'Teacher Appreciation Gifts',
        'banner_secondary_button_text' => 'Shop now',
        'banner_secondary_button_link' => '/categories/gifts',
        'banner_secondary_image' => 'image/image-4.jpg',
    ];
    
    // Merge defaults with database settings (database settings take precedence)
    $bannerSettings = array_merge($defaultSettings, $dbSettings);
    
    // Format image paths using ImageUrlService
    if (!empty($bannerSettings['banner_main_image'])) {
        $bannerSettings['banner_main_image'] = ImageUrlService::formatImageUrl($bannerSettings['banner_main_image']) ?? $bannerSettings['banner_main_image'];
    }
    if (!empty($bannerSettings['banner_secondary_image'])) {
        $bannerSettings['banner_secondary_image'] = ImageUrlService::formatImageUrl($bannerSettings['banner_secondary_image']) ?? $bannerSettings['banner_secondary_image'];
    }
    
    $settings = array_merge([
        'site_name' => config('app.name'),
        'featured_products' => $featuredProducts,
        'latest_products' => $latestProducts,
        'footer_content' => '© ' . date('Y') . ' ' . config('app.name') . '. All rights reserved.',
    ], $bannerSettings);
    
    return Inertia::render('welcome', [
        'settings' => $settings,
        'diagnostics' => [
            'totalProducts' => $totalProducts,
            'zeroStock' => $zeroStock,
        ],
    ]);
})->name('home');

// Legal pages
Route::get('/terms', function () {
    // Fetch settings from database
    $dbSettings = Setting::where('key', 'like', 'site.%')
        ->get()
        ->mapWithKeys(function ($setting) {
            $key = str_replace('site.', '', $setting->key);
            return [$key => $setting->getTypedValue()];
        })
        ->toArray();
    
    $settings = array_merge([
        'site_name' => config('app.name'),
    ], $dbSettings);
    
    return Inertia::render('terms', ['settings' => $settings]);
})->name('terms');

Route::get('/privacy', function () {
    // Fetch settings from database
    $dbSettings = Setting::where('key', 'like', 'site.%')
        ->get()
        ->mapWithKeys(function ($setting) {
            $key = str_replace('site.', '', $setting->key);
            return [$key => $setting->getTypedValue()];
        })
        ->toArray();
    
    $settings = array_merge([
        'site_name' => config('app.name'),
    ], $dbSettings);
    
    return Inertia::render('privacy', ['settings' => $settings]);
})->name('privacy');

// Public tax info page
Route::get('/tax-info', function() {
    $taxService = app(\App\Services\TaxService::class);
    $activeTaxes = $taxService->getActiveTaxSettings();
    return Inertia::render('tax/info', [
        'activeTaxes' => $activeTaxes,
    ]);
})->name('tax.info');

// Web category routes with 'web.' prefix
Route::prefix('categories')->name('web.categories.')->group(function () {
    Route::get('/', [CategoryController::class, 'index'])->name('index');
    Route::post('/', [CategoryController::class, 'store'])->name('store');
    Route::get('/create', [CategoryController::class, 'create'])->name('create');
    Route::get('/{category:slug}', [CategoryController::class, 'show'])->name('show');
    Route::put('/{category:slug}', [CategoryController::class, 'update'])->name('update');
    Route::delete('/{category:slug}', [CategoryController::class, 'destroy'])->name('destroy');
    Route::get('/{category:slug}/edit', [CategoryController::class, 'edit'])->name('edit');
});

// Search routes
Route::get('/search', [SearchController::class, 'search'])->name('search');

Route::get('/request', fn()=> Inertia::render('request/index'))->name(
'request.index');
Route::post('/request', [RequestController::class, 'store']);



Route::get('/search/suggestions', [SearchController::class, 'suggestions'])->name('search.suggestions');

// Product routes with 'web.' prefix
Route::prefix('products')->name('web.products.')->group(function () {
    Route::get('/{slug}', [ProductController::class, 'show'])->name('show');
    Route::get('/{product}/reviews', [ProductController::class, 'getProductReviews'])->name('reviews');
});

// Out of stock notification routes
Route::post('/api/products/{product}/notifications/subscribe', [OutOfStockNotificationController::class, 'subscribe'])->name('api.products.notifications.subscribe');
Route::post('/api/products/{product}/notifications/unsubscribe', [OutOfStockNotificationController::class, 'unsubscribe'])->name('api.products.notifications.unsubscribe');
Route::post('/api/products/{product}/notifications/check', [OutOfStockNotificationController::class, 'checkSubscription'])->name('api.products.notifications.check');

// PayPal routes
Route::get('/paypal', [PayPalController::class, 'index'])->name('paypal');
Route::post('/paypal/payment', [PayPalController::class, 'payment'])->name('paypal.payment');
Route::get('/paypal/payment/success', [PayPalController::class, 'paymentSuccess'])->name('paypal.payment.success');
Route::get('/paypal/payment/cancel', [PayPalController::class, 'paymentCancel'])->name('paypal.payment.cancel');
Route::get('/paypal/payment/status', [PayPalController::class, 'getPaymentStatus'])->name('paypal.payment.status');


// Add these routes to your web.php file



// Admin routes
Route::middleware(['web', 'auth', 'verified', 'admin', 'validate.admin.session'])->group(function () {
    Route::get('/admin-dashboard',[AdminDashboardController::class, 'index'])->name('admin.dashboard');
    
    Route::get("/admin/sales", [AdminSalesController::class, 'index'])->name('admin.sales.index');
    Route::get("/admin/sales/orders/{order}", [AdminSalesController::class, 'showOrder'])->name('admin.sales.orders.show');

    // Add proper admin/payment route for consistency
    Route::get('/admin/payment', [AdminPaymentController::class, 'index'])->name('admin.payment.index');
    Route::post('/admin/payments/{payment}/approve', [AdminPaymentController::class, 'approve'])->name('admin.payments.approve');
    Route::post('/admin/payments/{payment}/reject', [AdminPaymentController::class, 'reject'])->name('admin.payments.reject');
    Route::post('/admin/payments/{payment}/mark-seen', [AdminPaymentController::class, 'markSeen'])->name('admin.payments.mark_seen');
    Route::post('/admin/payments/bulk-action', [AdminPaymentController::class, 'bulkAction'])->name('admin.payments.bulk_action');
    Route::get('/admin/payments/export', [AdminPaymentController::class, 'export'])->name('admin.payments.export');
    Route::get('/paymentStats', [AdminPaymentController::class, 'index'])->name('admin.payments.index');
    Route::get('/paymentStats/{payment}', [AdminPaymentController::class, 'show'])->name('admin.payments.show');
    
    // Payment Rejection Reasons Management
    Route::get('/admin/payment-rejection-reasons', [App\Http\Controllers\Admin\PaymentRejectionReasonController::class, 'index'])->name('admin.payment-rejection-reasons.index');
    Route::post('/admin/payment-rejection-reasons', [App\Http\Controllers\Admin\PaymentRejectionReasonController::class, 'store'])->name('admin.payment-rejection-reasons.store');
    Route::patch('/admin/payment-rejection-reasons/{paymentRejectionReason}', [App\Http\Controllers\Admin\PaymentRejectionReasonController::class, 'update'])->name('admin.payment-rejection-reasons.update');
    Route::delete('/admin/payment-rejection-reasons/{paymentRejectionReason}', [App\Http\Controllers\Admin\PaymentRejectionReasonController::class, 'destroy'])->name('admin.payment-rejection-reasons.destroy');
    Route::get('/api/payment-rejection-reasons', [App\Http\Controllers\Admin\PaymentRejectionReasonController::class, 'getActiveReasons'])->name('api.payment-rejection-reasons.active');
    
    Route::resource('admin/orders', AdminOrderController::class);

    Route::get('/admin/offline-payments', [App\Http\Controllers\OfflinePaymentController::class, 'adminIndex'])
    ->name('admin.offline-payments.index');

    // category routes
    Route::get('admin/categories', [AdminCategoryController::class, 'index'])->name('admin.categories.index');
    Route::get('admin/categories/create', [AdminCategoryController::class, 'create'])->name('admin.categories.create');
    Route::post('admin/categories', [AdminCategoryController::class, 'store'])->name('admin.categories.store');
    Route::get('admin/categories/{category}', [AdminCategoryController::class, 'show'])->name('admin.categories.show');
    Route::get('admin/categories/{category}/edit', [AdminCategoryController::class, 'edit'])->name('admin.categories.edit');
    Route::put('admin/categories/{category}', [AdminCategoryController::class, 'update'])->name('admin.categories.update');
    Route::delete('admin/categories/{category}', [AdminCategoryController::class, 'destroy'])->name('admin.categories.destroy');

    Route::resource('admin/brands', AdminBrandController::class);

    Route::resource('admin/products', AdminProductController::class)->names([
        'index' => 'admin.products.index',
        'create' => 'admin.products.create',
        'store' => 'admin.products.store',
        'show' => 'admin.products.show',
        'edit' => 'admin.products.edit',
        'update' => 'admin.products.update',
        'destroy' => 'admin.products.destroy'
    ]);
    Route::resource('/admin/customers', CustomerController::class);
    Route::get('/admin/suppliers', [CustomerController::class, 'suppliers'])->name('admin.suppliers.index');
    Route::resource('admin/product-requests', AdminProductRequestController::class)->names([
        'index' => 'admin.product-requests.index',
        'create' => 'admin.product-requests.create',
        'store' => 'admin.product-requests.store',
        'show' => 'admin.product-requests.show',
        'edit' => 'admin.product-requests.edit',
        'update' => 'admin.product-requests.update',
        'destroy' => 'admin.product-requests.destroy',
    ]);
    
    Route::post('admin/product-requests/{productRequest}/start-procurement', [AdminProductRequestController::class, 'startProcurement'])
        ->name('admin.product-requests.start-procurement');
    Route::post('admin/product-requests/{productRequest}/complete-procurement', [AdminProductRequestController::class, 'completeProcurement'])
        ->name('admin.product-requests.complete-procurement');
    Route::post('admin/product-requests/{productRequest}/mark-arrived', [AdminProductRequestController::class, 'markProductArrived'])
        ->name('admin.product-requests.mark-arrived');
    
    Route::get('/site-config', [AdminSiteConfigController::class, 'index'])->name('admin.site-config.index');
    Route::post('/site-config', [AdminSiteConfigController::class, 'update'])->name('admin.site-config.update');
    
    // Stock Management
    Route::get('/admin/stock-notifications', [StockNotificationController::class, 'index'])->name('admin.stock-notifications.index');
    Route::get('/admin/products/stock', [StockNotificationController::class, 'index'])->name('admin.products.stock.index');
    Route::delete('/admin/stock-notifications/{notification}', [StockNotificationController::class, 'destroy'])->name('admin.stock-notifications.destroy');
    Route::post('/admin/stock-notifications/products/{product}/trigger', [StockNotificationController::class, 'triggerNotifications'])->name('admin.stock-notifications.trigger');
    Route::post('/admin/stock-notifications/bulk-delete', [StockNotificationController::class, 'bulkDelete'])->name('admin.stock-notifications.bulk-delete');
    
    // Out of stock notification admin routes
    Route::get('/api/products/{product}/notifications/stats', [OutOfStockNotificationController::class, 'getStats'])->name('admin.products.notifications.stats');
    Route::get('/api/notifications/pending', [OutOfStockNotificationController::class, 'getProductsWithPendingNotifications'])->name('admin.notifications.pending');
    
    // Admin Supplier Management
    Route::prefix('admin/suppliers')->name('admin.suppliers.')->group(function () {
        require __DIR__.'/admin/suppliers.php';
    });

    // Tax Settings - Consolidated all tax-related routes under a single group
    Route::prefix('admin/tax')->name('admin.tax.')->group(function () {
        // Main tax settings page with tabs
        Route::get('settings', [\App\Http\Controllers\Admin\TaxSettingsController::class, 'index'])
            ->name('settings.index');
            
        // Tab-specific routes
        Route::get('settings/{tab}', [\App\Http\Controllers\Admin\TaxSettingsController::class, 'index'])
            ->where('tab', 'classes|rates|settings')
            ->name('settings.tab');
        
        // Tax Classes API endpoints
        Route::post('classes', [\App\Http\Controllers\Admin\TaxSettingsController::class, 'storeClass'])
            ->name('classes.store');
            
        Route::put('classes/{taxClass}', [\App\Http\Controllers\Admin\TaxSettingsController::class, 'updateClass'])
            ->name('classes.update');
            
        Route::delete('classes/{taxClass}', [\App\Http\Controllers\Admin\TaxSettingsController::class, 'destroyClass'])
            ->name('classes.destroy');
        
        // Tax Rates API endpoints
        Route::post('rates', [\App\Http\Controllers\Admin\TaxSettingsController::class, 'storeRate'])
            ->name('rates.store');
            
        Route::put('rates/{taxSetting}', [\App\Http\Controllers\Admin\TaxSettingsController::class, 'updateRate'])
            ->name('rates.update');
            
        Route::delete('rates/{taxSetting}', [\App\Http\Controllers\Admin\TaxSettingsController::class, 'destroyRate'])
            ->name('rates.destroy');
            
        Route::put('rates/{taxSetting}/toggle-status', [\App\Http\Controllers\Admin\TaxSettingsController::class, 'toggleStatus'])
            ->name('rates.toggle-status');
            
        // Tax Settings API endpoints
        Route::put('settings/update', [\App\Http\Controllers\Admin\TaxSettingsController::class, 'updateSettings'])
            ->name('settings.update');
            
        // Tax calculation endpoints
        Route::post('calculate-preview', [\App\Http\Controllers\Admin\TaxSettingsController::class, 'calculatePreview'])
            ->name('calculate-preview');
            
        // Active taxes API endpoint
        Route::get('active', [\App\Http\Controllers\Admin\TaxSettingsController::class, 'getActiveTaxes'])
            ->name('active');
            
        // Set default tax class
        Route::post('classes/{taxClass}/set-as-default', [\App\Http\Controllers\Admin\TaxSettingsController::class, 'setAsDefault'])
            ->name('classes.set-default');
    });
    
    // Stock Management
    Route::get('/admin/stock', [AdminStockController::class, 'dashboard'])->name('admin.stock.dashboard');
    Route::put('/admin/stock/products/{product}', [AdminStockController::class, 'updateStock'])->name('admin.stock.products.update');
    Route::get('/admin/stock/notifications', [AdminStockController::class, 'getNotifications'])->name('admin.stock.notifications.index');
    Route::put('/admin/stock/notifications/{notification}/mark-notified', [AdminStockController::class, 'markNotified'])->name('admin.stock.notifications.mark-notified');
    Route::get('/admin/stock/products/{product}/history', [AdminStockController::class, 'getStockHistory'])->name('admin.stock.products.history');
    
    // Offline Payment Methods Management
    Route::post('/admin/offline-payment-methods', [AdminSiteConfigController::class, 'storeOfflinePaymentMethod'])->name('admin.offline-payment-methods.store');
    Route::patch('/admin/offline-payment-methods/{offlinePaymentMethod}', [AdminSiteConfigController::class, 'updateOfflinePaymentMethod'])->name('admin.offline-payment-methods.update');
    
    // Chapa Payment Methods Management
    Route::post('/admin/chapa-payment-methods', [AdminSiteConfigController::class, 'storeChapaPaymentMethod'])->name('admin.chapa-payment-methods.store');
    Route::patch('/admin/chapa-payment-methods/{chapaPaymentMethod}', [AdminSiteConfigController::class, 'updateChapaPaymentMethod'])->name('admin.chapa-payment-methods.update');
    Route::delete('/admin/chapa-payment-methods/{chapaPaymentMethod}', [AdminSiteConfigController::class, 'destroyChapaPaymentMethod'])->name('admin.chapa-payment-methods.destroy');
    // Offline Payment Submissions Management
    Route::get('/admin/offline-payments', [App\Http\Controllers\OfflinePaymentController::class, 'adminIndex'])->name('admin.offline-payments.index');
    Route::get('/admin/offline-payments/{submission}', [App\Http\Controllers\OfflinePaymentController::class, 'adminShow'])->name('admin.offline-payments.show');
    Route::post('/admin/offline-payments/{submission}/status', [App\Http\Controllers\OfflinePaymentController::class, 'adminUpdateStatus'])->name('admin.offline-payments.update-status');
});

// Supplier Routes
Route::middleware(['auth', 'verified'])->prefix('supplier')->name('supplier.')->group(function () {
    // Registration
    Route::get('/register', [SupplierController::class, 'showRegistrationForm'])
         ->name('register')
         ->middleware('can:supplier.register');
         
    Route::post('/register', [SupplierController::class, 'register'])
         ->name('register.submit')
         ->middleware('can:supplier.register');
    
    // Dashboard and protected routes
    Route::middleware('role:supplier')->group(function () {
        Route::get('/dashboard', [SupplierController::class, 'dashboard'])->name('dashboard');
        
        // Product management routes
        Route::resource('products', SupplierProductController::class);
        Route::post('/products/{product}/submit', [SupplierProductController::class, 'submitForReview'])->name('products.submit');
        
        // TODO: Add more supplier routes (orders, earnings, settings, etc.)
    });
});

// Authenticated routes
// Product Request Payment Routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Show payment form for a product request
    Route::get('/product-requests/{productRequest}/payment', [\App\Http\Controllers\ProductRequestPaymentController::class, 'show'])
        ->name('product-requests.payment.show');
    
    // Process payment for a product request
    Route::post('/product-requests/{productRequest}/process-payment', [\App\Http\Controllers\ProductRequestPaymentController::class, 'process'])
        ->name('product-requests.payment.process');
    
    // Handle payment callback from payment gateway
    Route::post('/product-requests/{productRequest}/payment/callback', [\App\Http\Controllers\ProductRequestPaymentController::class, 'handleCallback'])
        ->name('product-requests.payment.callback');
    
    // Payment success page
    Route::get('/product-requests/{productRequest}/payment/success', [\App\Http\Controllers\ProductRequestPaymentController::class, 'success'])
        ->name('product-requests.payment.success');
    
    // Payment failure page
    Route::get('/product-requests/{productRequest}/payment/failure', [\App\Http\Controllers\ProductRequestPaymentController::class, 'failure'])
        ->name('product-requests.payment.failure');
    
    // Payment retry route
    Route::post('/payments/{payment}/retry', [PaymentController::class, 'retryPayment'])->name('payments.retry');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Main dashboard - alias for backward compatibility with tests
    Route::get('/dashboard', [UserDashboardController::class, 'index'])->name('dashboard');
    Route::get('/user-dashboard', [UserDashboardController::class, 'index'])->name('user.dashboard');
   
    // User dashboard (if different from main dashboard)
    // Route::get('/user-dashboard', fn() => Inertia::render('user/dashboard'))->name('user.dashboard');
    
    // Checkout
    Route::get('/checkout', function() {
        $taxService = app(\App\Services\TaxService::class);
        $activeTaxes = $taxService->getActiveTaxSettings();
        
        return Inertia::render('checkout/show', [
            'activeTaxes' => $activeTaxes
        ]);
    })->name('checkout');
    
    // User-specific pages
    Route::get('/user-wishlist', [WishlistController::class, 'index'])->name('user.wishlist');
    Route::get('/user-request', [RequestController::class, 'index'])->name('user.request');
    Route::get('/user-order', [UserDashboardController::class, 'orders'])->name('user.orders');
    Route::get('/contact', fn() => Inertia::render('user/orders'))->name('contact'); 

    Route::get('/user-products', [UserDashboardController::class, 'products'])->name('user.products');

    // Individual order details and tracking
    Route::get('/user/orders/{order}', [UserDashboardController::class, 'showOrder'])->name('user.orders.show');
    Route::get('/user/orders/{order}/track', [UserDashboardController::class, 'trackOrder'])->name('user.orders.track');
    Route::get('/user/orders/{order}/tracking-data', [UserDashboardController::class, 'trackOrderData'])->name('user.orders.track-data');
    Route::get('/user/orders/{order}/receipt', [\App\Http\Controllers\ReceiptController::class, 'download'])->name('user.orders.receipt');
    Route::get('/receipts/transaction/{txRef}', [\App\Http\Controllers\ReceiptController::class, 'downloadByTransaction'])->name('receipts.transaction');
    Route::get('/product-requests/{productRequest}/receipt/{paymentType}', [\App\Http\Controllers\ReceiptController::class, 'downloadProductRequest'])->name('product-requests.receipt');
    
    // Product Request routes
    Route::get('/request', [RequestController::class, 'index'])->name('request.index');
    Route::post('/request', [RequestController::class, 'store'])->name('request.store');
    Route::get('/request/{productRequest}/edit', [RequestController::class, 'edit'])->name('request.edit');
    Route::put('/request/{productRequest}', [RequestController::class, 'update'])->name('request.update');
    Route::delete('/request/{productRequest}', [RequestController::class, 'destroy'])->name('request.destroy');
    Route::get('/request/history', [RequestController::class, 'history'])->name('request.history');
    Route::post('/request/{productRequest}/accept-price', [RequestController::class, 'acceptPrice'])->name('request.accept-price');
    
    // Enhanced workflow routes
    Route::get('/request/{productRequest}/willingness', [RequestController::class, 'showWillingness'])->name('request.willingness');
    Route::post('/request/{productRequest}/lost-interest', [RequestController::class, 'markLostInterest'])->name('request.lost-interest');
    Route::post('/request/{productRequest}/confirm-willingness', [RequestController::class, 'confirmWillingness'])->name('request.confirm-willingness');
    
    // Debug route to check authorization status (remove after debugging)
    Route::get('/debug/confirm-willingness/{productRequest}', function (ProductRequest $productRequest) {
        $user = Auth::user();
        $canUpdate = Gate::allows('update', $productRequest);
        $canConfirmWillingness = Gate::allows('confirmWillingness', $productRequest);
        
        \Log::info('DEBUG: Authorization check for confirm willingness', [
            'product_request_id' => $productRequest->id,
            'user_id' => $user?->id,
            'product_request_user_id' => $productRequest->user_id,
            'status' => $productRequest->status,
            'is_terminated' => $productRequest->isTerminated(),
            'can_update' => $canUpdate,
            'can_confirm_willingness' => $canConfirmWillingness,
        ]);
        
        return response()->json([
            'product_request_id' => $productRequest->id,
            'authenticated_user_id' => $user?->id,
            'product_request_user_id' => $productRequest->user_id,
            'status' => $productRequest->status,
            'is_terminated' => $productRequest->isTerminated(),
            'willingness_confirmed_at' => $productRequest->willingness_confirmed_at,
            'authorization' => [
                'can_update' => $canUpdate,
                'can_confirm_willingness' => $canConfirmWillingness,
                'user_owns_request' => $user && $user->id === $productRequest->user_id,
            ],
        ]);
    })->name('debug.confirm-willingness');
    
    // User product request routes
    Route::get('/user/product-requests', [RequestController::class, 'index'])->name('user.product-requests.index');
    Route::get('/user/product-requests/{productRequest}', [RequestController::class, 'show'])->name('user.product-requests.show');
    Route::get('/user/product-requests/{productRequest}/payment', [\App\Http\Controllers\ProductRequestPaymentController::class, 'show'])
        ->name('user.product-requests.payment');
    
    // Advance payment routes
    Route::get('/product-requests/{productRequest}/advance-payment', [\App\Http\Controllers\ProductRequestPaymentController::class, 'showAdvancePaymentMethod'])
        ->name('product-requests.advance-payment.show');
    Route::post('/product-requests/{productRequest}/advance-payment/process', [\App\Http\Controllers\ProductRequestPaymentController::class, 'processAdvancePayment'])
        ->name('product-requests.advance-payment.process');
    Route::post('/product-requests/{productRequest}/advance-payment/callback', [\App\Http\Controllers\ProductRequestPaymentController::class, 'handleAdvancePaymentCallback'])
        ->name('product-requests.advance-payment.callback');
    Route::get('/product-requests/{productRequest}/advance-payment/success', [\App\Http\Controllers\ProductRequestPaymentController::class, 'advancePaymentSuccess'])
        ->name('product-requests.advance-payment.success');
    
    // Final payment routes
    Route::get('/product-requests/{productRequest}/final-payment', [\App\Http\Controllers\ProductRequestPaymentController::class, 'showFinalPayment'])
        ->name('product-requests.final-payment.show');
    Route::post('/product-requests/{productRequest}/final-payment/process', [\App\Http\Controllers\ProductRequestPaymentController::class, 'processFinalPayment'])
        ->name('product-requests.final-payment.process');
    Route::post('/product-requests/{productRequest}/final-payment/callback', [\App\Http\Controllers\ProductRequestPaymentController::class, 'handleFinalPaymentCallback'])
        ->name('product-requests.final-payment.callback');
    Route::get('/product-requests/{productRequest}/final-payment/success', [\App\Http\Controllers\ProductRequestPaymentController::class, 'finalPaymentSuccess'])
        ->name('product-requests.final-payment.success');

    // Payment flow routes
    Route::prefix('payment')->name('payment.')->group(function () {
        // Chapa payment method selection
        Route::get('/chapa/method', [PaymentController::class, 'showChapaMethodSelect'])->name('chapa.method');
        
        // Payment processing
        Route::get('/process', [PaymentController::class, 'showPaymentPage'])->name('show');
        Route::post('/process', [PaymentController::class, 'processPayment'])->name('process');
        
        // Chapa payment routes
        Route::post('/callback', [PaymentController::class, 'paymentCallback'])->name('callback');
        Route::get('/return/{tx_ref?}', [PaymentController::class, 'paymentReturn'])->name('return');
        
        // Test route for debugging callbacks
        Route::get('/test-callback', [PaymentController::class, 'testCallback'])->name('test.callback');
        
        // Payment verification route
        Route::get('/verify/{tx_ref}', [PaymentController::class, 'verifyPayment'])->name('verify');
        
        // Offline payment routes
        Route::post('/offline/submit', [PaymentController::class, 'submitOffline'])->name('offline.submit');
        Route::get('/offline/success', [PaymentController::class, 'offlineSubmissionSuccess'])->name('offline.success');
        Route::get('/offline/methods', [\App\Http\Controllers\OfflinePaymentController::class, 'getMethods'])->name('offline.methods');
        
        // Generic success/failed pages
        Route::get('/success', [PaymentController::class, 'paymentSuccess'])->name('payment.success');
    });

    // Payment failure route
    Route::get('/payment/failed', [PaymentController::class, 'paymentFailed'])->name('payment.failed');
    
    // Wishlist AJAX routes
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle'])->name('wishlist.toggle');
    Route::post('/wishlist/add', [WishlistController::class, 'store'])->name('wishlist.store');
    Route::delete('/wishlist/remove', [WishlistController::class, 'destroy'])->name('wishlist.destroy');
    Route::get('/wishlist/check', [WishlistController::class, 'check'])->name('wishlist.check');

    // Review routes
    // Review routes
    Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');
    Route::post('/reviews/{review}/helpful', [ReviewController::class, 'toggleHelpful'])->name('reviews.helpful');
    
    // Checkout routes
    Route::post('/checkout/process', [PaymentController::class, 'processCheckout'])->name('checkout.process');
});

// Legacy API routes (if still needed)
Route::middleware(['auth', 'web'])->group(function () {
    Route::get('/api/wishlist', [WishlistController::class, 'index'])->name('api.wishlist.index');
    Route::post('/api/wishlist', [WishlistController::class, 'store'])->name('api.wishlist.store');
    Route::delete('/api/wishlist', [WishlistController::class, 'destroy'])->name('api.wishlist.destroy');
    Route::post('/api/wishlist/toggle', [WishlistController::class, 'toggle'])->name('api.wishlist.toggle');
    Route::get('/api/wishlist/check', [WishlistController::class, 'check'])->name('api.wishlist.check');
});

// Test email route (only in development)
// Simple test email route
Route::get('/test-direct-email', function () {
    try {
        $testEmail = 'test@example.com'; // Change this to your test email
        
        Mail::raw('This is a test email from Laravel', function($message) use ($testEmail) {
            $message->to($testEmail)
                    ->subject('Test Email from Laravel');
        });
        
        return "Test email sent to {$testEmail}. Please check your inbox.";
    } catch (\Exception $e) {
        return "Error sending test email: " . $e->getMessage();
    }
});

if (app()->environment('local')) {
    Route::get('/test-email', function () {
        // Get the latest order and payment transaction for testing
        $order = \App\Models\Order::with('user')->latest()->first();
        $payment = \App\Models\PaymentTransaction::latest()->first();

        if (!$order || !$payment || !$order->user) {
            return "Test data not found. Make sure you have orders with users and payment transactions in the database.";
        }

        try {
            // Log the email sending attempt
            \Log::info('Attempting to send email to: ' . $order->user->email);
            
            // Send the email directly to the order's user
            $result = \Mail::to($order->user->email)
                ->send(new \App\Mail\PaymentConfirmation($order, $payment));
            
            // Log the result
            \Log::info('Email send result: ' . json_encode($result !== null));
            
            // Check if email was actually sent
            if ($result === null) {
                return "Email was queued to {$order->user->email} for order #{$order->order_number}";
            }
            
            return "Test email sent to {$order->user->email} for order #{$order->order_number}";
        } catch (\Exception $e) {
            return "Error sending email: " . $e->getMessage() . "\n" . $e->getTraceAsString();
        }
    })->name('test.email');
}

// Create test product request
Route::get('/create-test-request', function () {
    try {
        $user = \App\Models\User::first();
        
        if (!$user) {
            return "No users found in the database. Please create a user first.";
        }
        
        $productRequest = \App\Models\ProductRequest::create([
            'user_id' => $user->id,
            'product_name' => 'Test Product ' . time(),
            'description' => 'This is a test product request',
            'status' => 'pending',
            'admin_notes' => 'Test request for email notification'
        ]);
        
        return "Created test product request #{$productRequest->id}";
    } catch (\Exception $e) {
        return "Error: " . $e->getMessage();
    }
});

// Test queue worker with a simple job
Route::get('/test-queue', function () {
    \App\Jobs\TestQueueJob::dispatch();
    return 'Test job dispatched to the queue. Check the queue worker log for output.';
});

// Test payment confirmation email directly
Route::get('/test-payment-confirmation', function () {
    try {
        $order = \App\Models\Order::with('user')->latest()->first();
        $transaction = \App\Models\PaymentTransaction::latest()->first();
        
        if (!$order || !$transaction) {
            return "Order or transaction not found. Make sure you have orders and payment transactions in the database.";
        }
        
        // Send email directly (bypassing queue for testing)
        \Mail::to($order->user->email)
            ->send(new \App\Mail\PaymentConfirmation($order, $transaction));
            
        return "Payment confirmation email sent directly to {$order->user->email} for order #{$order->order_number}";
    } catch (\Exception $e) {
        return "Error: " . $e->getMessage() . "\n" . $e->getTraceAsString();
    }
});

// Test queue worker with email job
Route::get('/test-queue-email', function () {
    try {
        $order = \App\Models\Order::with('user')->latest()->first();
        
        if (!$order) {
            return "No orders found in the database.";
        }
        
        // Dispatch a test email job
        \App\Jobs\SendEmailJob::dispatch(
            $order->user->email,
            'Test Queued Email',
            'emails.test',
            ['message' => 'This is a test of the queued email system.']
        );
        
        return "Test email job dispatched to the queue for {$order->user->email}";
    } catch (\Exception $e) {
        return "Error: " . $e->getMessage();
    }
});

// Test product request notification email
Route::get('/test-request-email', function () {
    try {
        $productRequest = \App\Models\ProductRequest::with('user')->latest()->first();
        
        if (!$productRequest) {
            return "No product requests found in the database.";
        }
        
        // Test different notification types
        $type = 'status_updated'; // Try 'submitted' or 'admin_notification' as well
        $admin = \App\Models\User::where('role', 'admin')->first();
        
        \Mail::to($productRequest->user->email)
            ->send(new \App\Mail\ProductRequestNotification(
                $productRequest,
                $productRequest->user,
                $type,
                $admin
            ));
            
        return "Product request notification sent to {$productRequest->user->email} for request #{$productRequest->id}";
    } catch (\Exception $e) {
        return "Error: " . $e->getMessage();
    }
});

// Test order status update email
Route::get('/test-status-email', function () {
    try {
        $order = \App\Models\Order::with('user')->latest()->first();
        
        if (!$order) {
            return "No orders found in the database.";
        }
        
        $status = 'shipped';
        $updateMessage = 'Your order has been shipped and is on its way to you!';
        
        \Mail::to($order->user->email)
            ->send(new \App\Mail\OrderStatusUpdate($order, $status, $updateMessage));
            
        return "Order status update email sent to {$order->user->email} for order #{$order->order_number}";
    } catch (\Exception $e) {
        return "Error: " . $e->getMessage();
    }
});

// Test payment confirmation email
Route::get('/test-payment-email', function () {
    try {
        $order = \App\Models\Order::with('user')->latest()->first();
        $transaction = \App\Models\PaymentTransaction::latest()->first();
        
        if (!$order || !$transaction) {
            return "Test data not found. Make sure you have orders and payment transactions in the database.";
        }
        
        \Mail::to($order->user->email)
            ->send(new \App\Mail\PaymentConfirmation($order, $transaction));
            
        return "Payment confirmation email sent to {$order->user->email} for order #{$order->order_number}";
    } catch (\Exception $e) {
        return "Error: " . $e->getMessage();
    }
});

// Test simple email
Route::get('/test-simple-email', function () {
    try {
        $email = 'test@example.com'; // Change this to your test email
        
        \Mail::send('emails.test', [], function($message) use ($email) {
            $message->to($email)
                   ->subject('Simple Test Email');
        });
        
        return "Simple test email sent to {$email}";
    } catch (\Exception $e) {
        return "Error: " . $e->getMessage();
    }
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

// Note: Test API routes are now in routes/api.php to bypass CSRF protection