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
            // Product details
            if (!Schema::hasColumn('product_requests', 'product_url')) {
                $table->string('product_url')->nullable()->after('product_name');
            }
            if (!Schema::hasColumn('product_requests', 'brand')) {
                $table->string('brand')->nullable()->after('product_url');
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
                $table->unsignedInteger('quantity')->default(1)->after('size');
            }

            // Price and budget
            if (!Schema::hasColumn('product_requests', 'estimated_price')) {
                $table->decimal('estimated_price', 10, 2)->nullable()->after('amount');
            }
            if (!Schema::hasColumn('product_requests', 'max_budget')) {
                $table->decimal('max_budget', 10, 2)->nullable()->after('estimated_price');
            }

            // Shipping and delivery
            if (!Schema::hasColumn('product_requests', 'shipping_address')) {
                $table->string('shipping_address')->nullable()->after('max_budget');
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

            // Additional information
            if (!Schema::hasColumn('product_requests', 'additional_notes')) {
                $table->text('additional_notes')->nullable()->after('desired_delivery_date');
            }
            if (!Schema::hasColumn('product_requests', 'specifications')) {
                $table->json('specifications')->nullable()->after('additional_notes');
            }

            // Status tracking
            if (!Schema::hasColumn('product_requests', 'fulfillment_status')) {
                $table->enum('fulfillment_status', ['pending', 'ordered', 'shipped', 'delivered', 'cancelled'])
                    ->default('pending')
                    ->after('status');
            }
            if (!Schema::hasColumn('product_requests', 'tracking_number')) {
                $table->string('tracking_number')->nullable()->after('fulfillment_status');
            }
            if (!Schema::hasColumn('product_requests', 'tracking_url')) {
                $table->string('tracking_url')->nullable()->after('tracking_number');
            }

            // Foreign key to link with orders when fulfilled
            if (!Schema::hasColumn('product_requests', 'order_id')) {
                $table->foreignId('order_id')->nullable()->after('admin_id')->constrained('orders')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_requests', function (Blueprint $table) {
            $table->dropColumn([
                'product_url',
                'brand',
                'model',
                'color',
                'size',
                'quantity',
                'estimated_price',
                'max_budget',
                'shipping_address',
                'shipping_method',
                'shipping_cost',
                'desired_delivery_date',
                'additional_notes',
                'specifications',
                'fulfillment_status',
                'tracking_number',
                'tracking_url',
                'order_id'
            ]);
        });
    }
};
