<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('offline_payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Bank Transfer", "Mobile Money"
            $table->string('type'); // e.g., "bank", "mobile", "cash"
            $table->text('description');
            $table->text('instructions'); // Payment instructions for users
            $table->json('details'); // Account details, phone numbers, etc.
            $table->string('logo')->nullable(); // Path to payment method logo
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offline_payment_methods');
    }
};
