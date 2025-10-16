<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('supplier_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('business_name');
            $table->string('business_email')->unique();
            $table->string('phone');
            $table->string('tax_id')->nullable();
            $table->json('address');
            $table->enum('verification_status', ['pending', 'approved', 'rejected', 'banned'])->default('pending');
            $table->text('verification_notes')->nullable();
            $table->decimal('default_commission_rate', 5, 2)->default(15.00);
            $table->json('payout_method')->nullable();
            $table->foreignId('created_by_admin_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('supplier_profiles');
    }
};
