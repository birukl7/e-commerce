<?php

use App\Http\Controllers\Admin\AdminSupplierController;
use Illuminate\Support\Facades\Route;

Route::prefix('suppliers')->name('suppliers.')->group(function () {
    Route::get('/', [AdminSupplierController::class, 'index'])->name('index');
    Route::get('/{supplier}', [AdminSupplierController::class, 'show'])->name('show');
    
    // Update supplier status (approve/reject/ban)
    Route::put('/{supplier}/status', [AdminSupplierController::class, 'updateStatus'])->name('status.update');
    
    // Update payout method
    Route::put('/{supplier}/payout-method', [AdminSupplierController::class, 'updatePayoutMethod'])->name('payout-method.update');
    
    // Update commission rate
    Route::put('/{supplier}/commission', [AdminSupplierController::class, 'updateCommission'])->name('commission.update');
    
    // Delete supplier
    Route::delete('/{supplier}', [AdminSupplierController::class, 'destroy'])->name('destroy');
});
