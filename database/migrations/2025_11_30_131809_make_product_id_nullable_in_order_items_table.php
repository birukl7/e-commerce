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
        Schema::table('order_items', function (Blueprint $table) {
            // Make product_id nullable to support product requests
            // Product requests don't have a product_id, so we store all info in product_snapshot
            $table->foreignId('product_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            // Before making it non-nullable, we need to remove any null values
            // or assign them to a placeholder product
            $table->foreignId('product_id')->nullable(false)->change();
        });
    }
};
