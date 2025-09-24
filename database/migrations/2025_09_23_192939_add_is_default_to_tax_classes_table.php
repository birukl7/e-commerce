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
            
            // Add index for better performance on the is_default column if it doesn't exist
            if (!collect(DB::select('SHOW INDEX FROM tax_classes'))->pluck('Key_name')->contains('tax_classes_is_default_index')) {
                $table->index('is_default');
            }
        });
        
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
