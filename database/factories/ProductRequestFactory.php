<?php

namespace Database\Factories;

use App\Models\ProductRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductRequestFactory extends Factory
{
    protected $model = ProductRequest::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'product_name' => $this->faker->words(3, true),
            'product_url' => $this->faker->url(),
            'description' => $this->faker->paragraph(),
            'image' => null,
            'status' => 'pending',
            'admin_response' => null,
            'admin_id' => null,
            'order_id' => null,
            'amount' => $this->faker->randomFloat(2, 100, 10000),
            'estimated_price' => null,
            'max_budget' => null,
            'currency' => 'ETB',
            'payment_status' => 'pending',
            'payment_method' => null,
            'payment_reference' => null,
            'paid_at' => null,
            'payment_details' => null,
            'advance_amount' => null,
            'final_amount' => null,
            'advance_payment_status' => 'pending',
            'final_payment_status' => 'pending',
            'advance_paid_at' => null,
            'final_paid_at' => null,
            'procurement_status' => 'not_started',
            'procurement_notes' => null,
            'procurement_started_at' => null,
            'procurement_expected_completion_date' => null,
            'procurement_completed_at' => null,
            'product_arrived_at' => null,
            'customer_willing_to_buy' => false,
            'willingness_confirmed_at' => null,
        ];
    }
}

