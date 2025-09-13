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
            $table->decimal('amount', 10, 2)->nullable()->after('admin_response');
            $table->string('currency', 3)->default('ETB')->after('amount');
            $table->string('payment_status')->default('pending')->after('currency');
            $table->string('payment_method')->nullable()->after('payment_status');
            $table->string('payment_reference')->nullable()->after('payment_method');
            $table->timestamp('paid_at')->nullable()->after('payment_reference');
            $table->text('payment_details')->nullable()->after('paid_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_requests', function (Blueprint $table) {
            $table->dropColumn([
                'amount',
                'currency',
                'payment_status',
                'payment_method',
                'payment_reference',
                'paid_at',
                'payment_details'
            ]);
        });
    }
};
