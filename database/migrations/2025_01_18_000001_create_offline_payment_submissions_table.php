<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('offline_payment_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('submission_ref')->unique(); // Unique reference for the submission
            $table->foreignId('offline_payment_method_id')->constrained()->onDelete('cascade');
            $table->string('order_id');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('ETB');
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone')->nullable();
            $table->string('payment_reference')->nullable(); // Reference from bank/mobile money
            $table->text('payment_notes')->nullable(); // Additional notes from customer
            $table->string('payment_screenshot'); // Path to uploaded screenshot
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->text('admin_notes')->nullable(); // Notes from admin when reviewing
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offline_payment_submissions');
    }
};
