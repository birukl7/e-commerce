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
use App\Http\Controllers\AdminSalesController;
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

    Route::resource('admin/products', AdminProductController::class);
    Route::resource('/admin/customers', CustomerController::class);
    Route::get('/admin/suppliers', [CustomerController::class, 'suppliers'])->name('admin.suppliers.index');
    Route::resource('admin/product-requests', AdminProductRequestController::class);
    
    Route::get('/site-config', [AdminSiteConfigController::class, 'index'])->name('admin.site-config.index');
    Route::post('/site-config', [AdminSiteConfigController::class, 'update'])->name('admin.site-config.update');
    
    // Offline Payment Methods Management
    Route::post('/admin/offline-payment-methods', [AdminSiteConfigController::class, 'storeOfflinePaymentMethod'])->name('admin.offline-payment-methods.store');
    Route::patch('/admin/offline-payment-methods/{offlinePaymentMethod}', [AdminSiteConfigController::class, 'updateOfflinePaymentMethod'])->name('admin.offline-payment-methods.update');
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

    // Payment flow routes
    Route::prefix('payment')->name('payment.')->group(function () {
        // Chapa payment method selection
        Route::get('/chapa/method', [PaymentController::class, 'showChapaMethodSelect'])->name('chapa.method');
        
        // Payment processing
        Route::get('/process', [PaymentController::class, 'showPaymentPage'])->name('show');
        Route::post('/process', [PaymentController::class, 'processPayment'])->name('process');
        
        // Chapa payment routes
        Route::post('/callback', [PaymentController::class, 'paymentCallback'])->name('callback');
        Route::get('/return/{tx_ref}', [PaymentController::class, 'paymentReturn'])->name('return');
        
        // Test route for debugging callbacks
        Route::get('/test-callback', [PaymentController::class, 'testCallback'])->name('test.callback');
        
        // Payment verification route
        Route::get('/verify/{tx_ref}', [PaymentController::class, 'verifyPayment'])->name('verify');
        
        // Offline payment routes
        Route::post('/offline/submit', [PaymentController::class, 'submitOffline'])->name('offline.submit');
        Route::get('/offline/success', [PaymentController::class, 'offlineSubmissionSuccess'])->name('offline.success');
        
        // Generic success/failed pages
        Route::get('/success', [PaymentController::class, 'paymentSuccess'])->name('payment.success');
        Route::get('/failed', [PaymentController::class, 'paymentFailed'])->name('payment.failed');
    }); 
    // Wishlist AJAX routes
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle'])->name('wishlist.toggle');
    Route::post('/wishlist/add', [WishlistController::class, 'store'])->name('wishlist.store');
    Route::delete('/wishlist/remove', [WishlistController::class, 'destroy'])->name('wishlist.destroy');
    Route::get('/wishlist/check', [WishlistController::class, 'check'])->name('wishlist.check');

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