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
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('tx_ref')->unique();
            $table->string('order_id');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('ETB');
            $table->string('customer_email');
            $table->string('customer_name');
            $table->string('customer_phone')->nullable();
            $table->string('payment_method');
            
            // Two-layer status system
            $table->enum('gateway_status', ['pending', 'proof_uploaded', 'paid', 'failed', 'refunded'])->default('pending');
            $table->enum('admin_status', ['unseen', 'seen', 'approved', 'rejected'])->default('unseen');
            
            // Keep old status for backward compatibility during migration
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
            
            $table->string('checkout_url')->nullable();
            $table->json('chapa_data')->nullable();
            $table->json('gateway_payload')->nullable(); // For all gateway responses
            
            // Admin tracking
            $table->unsignedBigInteger('admin_id')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamp('admin_action_at')->nullable();
            
            $table->softDeletes();
            $table->timestamps();

            $table->index(['gateway_status', 'created_at']);
            $table->index(['admin_status', 'created_at']);
            $table->index(['customer_email']);
            $table->index(['payment_method']);
            $table->index(['tx_ref']);
            
            $table->foreign('admin_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};