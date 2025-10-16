<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            // Add supplier_id foreign key
            $table->foreignId('supplier_id')
                  ->nullable()
                  ->after('id')
                  ->constrained('users')
                  ->onDelete('set null');
            
            // Add moderation status
            $table->enum('moderation_status', [
                'draft', 'pending_review', 'approved', 'rejected', 'suspended'
            ])->default('draft')->after('status');
            
            // Add visibility
            $table->enum('visibility', ['private', 'public'])->default('private')->after('moderation_status');
            
            // Add rejection reason
            $table->text('rejection_reason')->nullable()->after('visibility');
            
            // Add listing fee flag
            $table->boolean('listing_fee_applied')->default(false)->after('rejection_reason');
            
            // Add index for better query performance
            $table->index(['supplier_id', 'moderation_status']);
        });
    }

    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['supplier_id']);
            $table->dropColumn([
                'supplier_id',
                'moderation_status',
                'visibility',
                'rejection_reason',
                'listing_fee_applied'
            ]);
        });
    }
};
