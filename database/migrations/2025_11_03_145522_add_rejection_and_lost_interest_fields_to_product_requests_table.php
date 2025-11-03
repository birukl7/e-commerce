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
            if (!Schema::hasColumn('product_requests', 'rejection_reason')) {
                $table->string('rejection_reason')->nullable()->after('admin_response');
            }
            if (!Schema::hasColumn('product_requests', 'lost_interest_at')) {
                $table->timestamp('lost_interest_at')->nullable()->after('willingness_confirmed_at');
            }
            if (!Schema::hasColumn('product_requests', 'lost_interest_reason')) {
                $table->string('lost_interest_reason')->nullable()->after('lost_interest_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_requests', function (Blueprint $table) {
            if (Schema::hasColumn('product_requests', 'rejection_reason')) {
                $table->dropColumn('rejection_reason');
            }
            if (Schema::hasColumn('product_requests', 'lost_interest_at')) {
                $table->dropColumn('lost_interest_at');
            }
            if (Schema::hasColumn('product_requests', 'lost_interest_reason')) {
                $table->dropColumn('lost_interest_reason');
            }
        });
    }
};
