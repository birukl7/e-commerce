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
        Schema::create('payment_rejection_reasons', function (Blueprint $table) {
            $table->id();
            $table->string('reason_code')->unique(); // e.g., 'insufficient_funds', 'invalid_payment_method'
            $table->string('reason_text'); // Human-readable text
            $table->text('description')->nullable(); // Detailed description
            $table->json('applies_to')->default('["both"]'); // ['product_request', 'normal_purchase', 'both']
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
        Schema::dropIfExists('payment_rejection_reasons');
    }
};
