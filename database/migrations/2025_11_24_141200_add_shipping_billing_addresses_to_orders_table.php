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
        Schema::table('orders', function (Blueprint $table) {
            // Shipping address fields
            if (!Schema::hasColumn('orders', 'shipping_fullname')) {
                $table->string('shipping_fullname')->nullable()->after('shipping_method');
            }
            if (!Schema::hasColumn('orders', 'shipping_email')) {
                $table->string('shipping_email')->nullable()->after('shipping_fullname');
            }
            if (!Schema::hasColumn('orders', 'shipping_phone')) {
                $table->string('shipping_phone')->nullable()->after('shipping_email');
            }
            if (!Schema::hasColumn('orders', 'shipping_address')) {
                $table->text('shipping_address')->nullable()->after('shipping_phone');
            }
            if (!Schema::hasColumn('orders', 'shipping_city')) {
                $table->string('shipping_city')->nullable()->after('shipping_address');
            }
            if (!Schema::hasColumn('orders', 'shipping_country')) {
                $table->string('shipping_country')->nullable()->after('shipping_city');
            }
            
            // Billing address fields
            if (!Schema::hasColumn('orders', 'billing_fullname')) {
                $table->string('billing_fullname')->nullable()->after('shipping_country');
            }
            if (!Schema::hasColumn('orders', 'billing_email')) {
                $table->string('billing_email')->nullable()->after('billing_fullname');
            }
            if (!Schema::hasColumn('orders', 'billing_phone')) {
                $table->string('billing_phone')->nullable()->after('billing_email');
            }
            if (!Schema::hasColumn('orders', 'billing_address')) {
                $table->text('billing_address')->nullable()->after('billing_phone');
            }
            if (!Schema::hasColumn('orders', 'billing_city')) {
                $table->string('billing_city')->nullable()->after('billing_address');
            }
            if (!Schema::hasColumn('orders', 'billing_country')) {
                $table->string('billing_country')->nullable()->after('billing_city');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'shipping_fullname',
                'shipping_email',
                'shipping_phone',
                'shipping_address',
                'shipping_city',
                'shipping_country',
                'billing_fullname',
                'billing_email',
                'billing_phone',
                'billing_address',
                'billing_city',
                'billing_country',
            ]);
        });
    }
};

