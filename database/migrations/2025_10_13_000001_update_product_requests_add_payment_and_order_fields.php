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
            // Basic fields alignment
            if (!Schema::hasColumn('product_requests', 'product_url')) {
                $table->string('product_url')->nullable()->after('product_name');
            }

            // Admin who processed
            if (!Schema::hasColumn('product_requests', 'admin_id')) {
                $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete()->after('status');
            }

            // Link to order
            if (!Schema::hasColumn('product_requests', 'order_id')) {
                $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete()->after('admin_id');
            }

            // Pricing/payment
            if (!Schema::hasColumn('product_requests', 'amount')) {
                $table->decimal('amount', 10, 2)->nullable()->after('order_id');
            }
            if (!Schema::hasColumn('product_requests', 'estimated_price')) {
                $table->decimal('estimated_price', 10, 2)->nullable()->after('amount');
            }
            if (!Schema::hasColumn('product_requests', 'max_budget')) {
                $table->decimal('max_budget', 10, 2)->nullable()->after('estimated_price');
            }
            if (!Schema::hasColumn('product_requests', 'currency')) {
                $table->string('currency', 3)->nullable()->after('max_budget');
            }
            if (!Schema::hasColumn('product_requests', 'payment_status')) {
                $table->string('payment_status')->nullable()->after('currency');
            }
            if (!Schema::hasColumn('product_requests', 'payment_method')) {
                $table->string('payment_method')->nullable()->after('payment_status');
            }
            if (!Schema::hasColumn('product_requests', 'payment_reference')) {
                $table->string('payment_reference')->nullable()->after('payment_method');
            }
            if (!Schema::hasColumn('product_requests', 'paid_at')) {
                $table->timestamp('paid_at')->nullable()->after('payment_reference');
            }
            if (!Schema::hasColumn('product_requests', 'payment_details')) {
                $table->json('payment_details')->nullable()->after('paid_at');
            }

            // Product specs & fulfillment
            if (!Schema::hasColumn('product_requests', 'brand')) {
                $table->string('brand')->nullable()->after('payment_details');
            }
            if (!Schema::hasColumn('product_requests', 'model')) {
                $table->string('model')->nullable()->after('brand');
            }
            if (!Schema::hasColumn('product_requests', 'color')) {
                $table->string('color')->nullable()->after('model');
            }
            if (!Schema::hasColumn('product_requests', 'size')) {
                $table->string('size')->nullable()->after('color');
            }
            if (!Schema::hasColumn('product_requests', 'quantity')) {
                $table->integer('quantity')->nullable()->after('size');
            }
            if (!Schema::hasColumn('product_requests', 'shipping_address')) {
                $table->text('shipping_address')->nullable()->after('quantity');
            }
            if (!Schema::hasColumn('product_requests', 'shipping_method')) {
                $table->string('shipping_method')->nullable()->after('shipping_address');
            }
            if (!Schema::hasColumn('product_requests', 'shipping_cost')) {
                $table->decimal('shipping_cost', 10, 2)->nullable()->after('shipping_method');
            }
            if (!Schema::hasColumn('product_requests', 'desired_delivery_date')) {
                $table->date('desired_delivery_date')->nullable()->after('shipping_cost');
            }
            if (!Schema::hasColumn('product_requests', 'additional_notes')) {
                $table->text('additional_notes')->nullable()->after('desired_delivery_date');
            }
            if (!Schema::hasColumn('product_requests', 'specifications')) {
                $table->json('specifications')->nullable()->after('additional_notes');
            }
            if (!Schema::hasColumn('product_requests', 'fulfillment_status')) {
                $table->string('fulfillment_status')->nullable()->after('specifications');
            }
            if (!Schema::hasColumn('product_requests', 'tracking_number')) {
                $table->string('tracking_number')->nullable()->after('fulfillment_status');
            }
            if (!Schema::hasColumn('product_requests', 'tracking_url')) {
                $table->string('tracking_url')->nullable()->after('tracking_number');
            }

            // Optional explicit availability flag for admin decision
            if (!Schema::hasColumn('product_requests', 'available')) {
                $table->boolean('available')->nullable()->after('status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_requests', function (Blueprint $table) {
            // Note: We won't drop foreign keys or core fields in down() to avoid data loss.
            // If needed, selectively drop columns added in up().
            $dropIfExists = [
                'product_url','order_id','amount','estimated_price','max_budget','currency','payment_status','payment_method','payment_reference','paid_at','payment_details','brand','model','color','size','quantity','shipping_address','shipping_method','shipping_cost','desired_delivery_date','additional_notes','specifications','fulfillment_status','tracking_number','tracking_url','available'
            ];
            foreach ($dropIfExists as $col) {
                if (Schema::hasColumn('product_requests', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};


