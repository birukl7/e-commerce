<?php

use App\Http\Controllers\Settings\AddressController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/addresses', [AddressController::class, 'index'])->name('settings.addresses.index');
    Route::put('settings/address', [AddressController::class, 'upsert'])->name('settings.address.update');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');

    // Admin profile settings routes
    Route::get('settings/admin/profile', [ProfileController::class, 'editAdmin'])->name('admin.profile.edit');
    Route::patch('settings/admin/profile', [ProfileController::class, 'updateAdmin'])->name('admin.profile.update');
    Route::put('settings/admin/password', [ProfileController::class, 'updateAdminPassword'])->name('admin.password.update');
});
