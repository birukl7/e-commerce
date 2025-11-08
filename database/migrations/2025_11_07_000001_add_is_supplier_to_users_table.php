<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'is_supplier')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('is_supplier')->default(false)->after('google_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'is_supplier')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('is_supplier');
            });
        }
    }
};

