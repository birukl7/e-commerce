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
        Schema::table('product_requests', function (Blueprint $table) {
            // Advance payment fields
            $table->decimal('advance_amount', 10, 2)->nullable()->after('amount');
            $table->decimal('final_amount', 10, 2)->nullable()->after('advance_amount');
            $table->string('advance_payment_status')->default('pending')->after('final_amount');
            $table->string('final_payment_status')->default('pending')->after('advance_payment_status');
            $table->timestamp('advance_paid_at')->nullable()->after('final_payment_status');
            $table->timestamp('final_paid_at')->nullable()->after('advance_paid_at');
            
            // Procurement tracking
            $table->string('procurement_status')->default('not_started')->after('final_paid_at');
            $table->text('procurement_notes')->nullable()->after('procurement_status');
            $table->timestamp('procurement_started_at')->nullable()->after('procurement_notes');
            $table->timestamp('procurement_completed_at')->nullable()->after('procurement_started_at');
            $table->timestamp('product_arrived_at')->nullable()->after('procurement_completed_at');
            
            // Customer willingness
            $table->boolean('customer_willing_to_buy')->default(false)->after('product_arrived_at');
            $table->timestamp('willingness_confirmed_at')->nullable()->after('customer_willing_to_buy');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_requests', function (Blueprint $table) {
            $table->dropColumn([
                'advance_amount',
                'final_amount', 
                'advance_payment_status',
                'final_payment_status',
                'advance_paid_at',
                'final_paid_at',
                'procurement_status',
                'procurement_notes',
                'procurement_started_at',
                'procurement_completed_at',
                'product_arrived_at',
                'customer_willing_to_buy',
                'willingness_confirmed_at'
            ]);
        });
    }
};
