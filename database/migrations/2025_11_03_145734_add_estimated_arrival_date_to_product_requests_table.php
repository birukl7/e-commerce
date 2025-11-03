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
            if (!Schema::hasColumn('product_requests', 'estimated_arrival_date')) {
                $table->date('estimated_arrival_date')->nullable()->after('amount');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_requests', function (Blueprint $table) {
            if (Schema::hasColumn('product_requests', 'estimated_arrival_date')) {
                $table->dropColumn('estimated_arrival_date');
            }
        });
    }
};
