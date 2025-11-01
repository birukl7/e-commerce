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
            $table->date('procurement_expected_completion_date')->nullable()->after('procurement_started_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_requests', function (Blueprint $table) {
            $table->dropColumn('procurement_expected_completion_date');
        });
    }
};
