<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Add low_stock_threshold if it doesn't exist
            if (!Schema::hasColumn('products', 'low_stock_threshold')) {
                $table->integer('low_stock_threshold')->default(5)->after('manage_stock');
            }
        });

        // Update stock_status enum values if needed, skip on SQLite
        if (Schema::hasColumn('products', 'stock_status')) {
            $driver = Schema::getConnection()->getDriverName();

            if ($driver === 'mysql') {
                DB::statement("
                    ALTER TABLE products 
                    MODIFY COLUMN stock_status 
                    ENUM('in_stock', 'out_of_stock', 'on_backorder', 'low_stock') 
                    NOT NULL DEFAULT 'in_stock'
                ");
            } elseif ($driver === 'pgsql') {
                // Postgres: emulate enum using CHECK constraint (optional - no-op for safety)
                // You may implement an ALTER TYPE here if stock_status is a domain/enum in your schema
            } else {
                // SQLite and other drivers: no-op to avoid unsupported ALTER/MODIFY/ENUM
                // Keep existing column definition and enforce values at application level
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // We won't drop any columns in the down method to prevent data loss
        // This is a safety measure since we're only adding/updating columns
        Schema::table('products', function (Blueprint $table) {
            // If you need to revert, you would need to create a new migration
        });
    }
};
