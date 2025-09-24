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
        Schema::create('tax_classes', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('is_active');
            $table->index('is_default');
            $table->index('sort_order');
        });
        
        // Create a default tax class
        DB::table('tax_classes')->insert([
            'name' => 'Standard',
            'slug' => 'standard',
            'description' => 'Standard tax class',
            'is_active' => true,
            'is_default' => true,
            'sort_order' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // First, remove the foreign key constraint from tax_settings
        if (Schema::hasTable('tax_settings')) {
            Schema::table('tax_settings', function (Blueprint $table) {
                if (DB::getDriverName() !== 'sqlite') {
                    $table->dropForeign(['tax_class_id']);
                }
            });
        }
        
        // Then drop the tax_classes table
        Schema::dropIfExists('tax_classes');
    }
};
