<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\SearchController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PayPalController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::resource('categories', CategoryController::class)->parameters([
    'categories' => 'category:slug',
]);

// Route::get('/request')
Route::resource('request', RequestController::class)->middleware('auth');

Route::get('/search', [SearchController::class, 'search'])->name('search');

Route::get('/search/suggestions', [SearchController::class, 'suggestions'])->name('search.suggestions');

Route::get('/products/{slug}', [ProductController::class, 'show'])->name('products.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});


Route::get('/paypal', [PayPalController::class, 'index'])->name('paypal');
Route::post('/paypal/payment', [PayPalController::class, 'payment'])->name('paypal.payment');
Route::get('/paypal/payment/success', [PayPalController::class, 'paymentSuccess'])->name('paypal.payment.success');
Route::get('/paypal/payment/cancel', [PayPalController::class, 'paymentCancel'])->name('paypal.payment.cancel');
Route::get('/paypal/payment/status', [PayPalController::class, 'getPaymentStatus'])->name('paypal.payment.status');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
