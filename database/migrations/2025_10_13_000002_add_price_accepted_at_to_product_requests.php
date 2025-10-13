<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('product_requests', 'price_accepted_at')) {
                $table->timestamp('price_accepted_at')->nullable()->after('paid_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('product_requests', function (Blueprint $table) {
            if (Schema::hasColumn('product_requests', 'price_accepted_at')) {
                $table->dropColumn('price_accepted_at');
            }
        });
    }
};


