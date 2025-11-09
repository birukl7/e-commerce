<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('chapa_payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Telebirr", "CBE", "M-Pesa"
            $table->string('code')->unique(); // e.g., "telebirr", "cbe", "mpesa" - used in API calls
            $table->text('description')->nullable(); // Description for admin/customers
            $table->string('logo')->nullable(); // Path to payment method logo/icon
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chapa_payment_methods');
    }
};
