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
            $table->string('product_url')->nullable()->after('product_name');
            $table->string('brand')->nullable()->after('product_url');
            $table->string('model')->nullable()->after('brand');
            $table->string('color')->nullable()->after('model');
            $table->string('size')->nullable()->after('color');
            $table->unsignedInteger('quantity')->default(1)->after('size');
            
            // Price and budget
            $table->decimal('estimated_price', 10, 2)->nullable()->after('amount');
            $table->decimal('max_budget', 10, 2)->nullable()->after('estimated_price');
            
            // Shipping and delivery
            $table->string('shipping_address')->nullable()->after('max_budget');
            $table->string('shipping_method')->nullable()->after('shipping_address');
            $table->decimal('shipping_cost', 10, 2)->nullable()->after('shipping_method');
            $table->date('desired_delivery_date')->nullable()->after('shipping_cost');
            
            // Additional information
            $table->text('additional_notes')->nullable()->after('desired_delivery_date');
            $table->json('specifications')->nullable()->after('additional_notes');
            
            // Status tracking
            $table->enum('fulfillment_status', ['pending', 'ordered', 'shipped', 'delivered', 'cancelled'])
                ->default('pending')
                ->after('status');
            $table->string('tracking_number')->nullable()->after('fulfillment_status');
            $table->string('tracking_url')->nullable()->after('tracking_number');
            
            // Foreign key to link with orders when fulfilled
            $table->foreignId('order_id')->nullable()->after('admin_id')->constrained('orders')->onDelete('set null');
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
