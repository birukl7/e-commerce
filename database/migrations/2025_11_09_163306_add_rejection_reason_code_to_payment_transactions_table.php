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
        Schema::table('payment_transactions', function (Blueprint $table) {
            $table->string('rejection_reason_code')->nullable()->after('admin_notes');
            $table->foreign('rejection_reason_code')->references('reason_code')->on('payment_rejection_reasons')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_transactions', function (Blueprint $table) {
            $table->dropForeign(['rejection_reason_code']);
            $table->dropColumn('rejection_reason_code');
        });
    }
};
