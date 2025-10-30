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
        Schema::table('tax_classes', function (Blueprint $table) {
            if (!Schema::hasColumn('tax_classes', 'is_default')) {
                $table->boolean('is_default')->default(false)->after('is_active');
            }
        });

        // Add index only if missing (MySQL/MariaDB safe)
        try {
            $connection = Schema::getConnection();
            $driver = $connection->getDriverName();

            if (in_array($driver, ['mysql'])) {
                $existing = collect(\DB::select("SHOW INDEX FROM tax_classes WHERE Key_name = 'tax_classes_is_default_index'"));
                if ($existing->isEmpty()) {
                    Schema::table('tax_classes', function (Blueprint $table) {
                        $table->index('is_default', 'tax_classes_is_default_index');
                    });
                }
            } else {
                // Other drivers: best-effort create
                Schema::table('tax_classes', function (Blueprint $table) {
                    $table->index('is_default', 'tax_classes_is_default_index');
                });
            }
        } catch (\Throwable $e) {
            // If index already exists, ignore
        }
        
        // Set the first tax class as default if none exists
        if (\App\Models\TaxClass::count() > 0) {
            $defaultExists = \App\Models\TaxClass::where('is_default', true)->exists();
            if (!$defaultExists) {
                \App\Models\TaxClass::first()->update(['is_default' => true]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tax_classes', function (Blueprint $table) {
            $table->dropIndex(['is_default']);
            $table->dropColumn('is_default');
        });
    }
};
