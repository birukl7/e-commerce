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
        Schema::table('tax_settings', function (Blueprint $table) {
            $table->string('country', 2)->nullable()->after('is_active');
            $table->string('state', 100)->nullable()->after('country');
            $table->string('city', 100)->nullable()->after('state');
            $table->string('postal_code', 20)->nullable()->after('city');
            $table->unsignedInteger('priority')->default(1)->after('postal_code');
            $table->boolean('compound')->default(false)->after('priority');
            $table->boolean('shipping_taxable')->default(true)->after('compound');
            $table->unsignedBigInteger('tax_class_id')->nullable()->after('shipping_taxable');
            
            // Indexes
            $table->index(['country', 'state', 'city', 'postal_code']);
            $table->index('priority');
            $table->index('tax_class_id');
            
            // Add foreign key constraint after the column is created
            $table->foreign('tax_class_id')
                ->references('id')
                ->on('tax_classes')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tax_settings', function (Blueprint $table) {
            // Drop foreign key first
            $table->dropForeign(['tax_class_id']);
            
            // Drop indexes
            $table->dropIndex(['country', 'state', 'city', 'postal_code']);
            $table->dropIndex(['priority']);
            $table->dropIndex(['tax_class_id']);
            
            // Drop columns
            $table->dropColumn([
                'country',
                'state',
                'city',
                'postal_code',
                'priority',
                'compound',
                'shipping_taxable',
                'tax_class_id'
            ]);
        });
    }
};
