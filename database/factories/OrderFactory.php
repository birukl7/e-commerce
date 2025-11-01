<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'order_number' => 'ORD-' . $this->faker->unique()->randomNumber(8),
            'status' => 'processing', // Valid values: processing, shipped, delivered, cancelled
            'payment_status' => 'pending',
            'payment_method' => 'chapa', // Cannot be null
            'currency' => 'ETB',
            'subtotal' => $this->faker->randomFloat(2, 100, 5000),
            'tax_amount' => function (array $attributes) {
                // Calculate approximate tax (15% typical)
                return ($attributes['subtotal'] ?? 1000) * 0.15;
            },
            'shipping_amount' => $this->faker->randomFloat(2, 0, 500),
            'total_amount' => function (array $attributes) {
                $subtotal = $attributes['subtotal'] ?? 1000;
                $tax = $attributes['tax_amount'] ?? ($subtotal * 0.15);
                $shipping = $attributes['shipping_amount'] ?? 0;
                return $subtotal + $tax + $shipping;
            },
        ];
    }
}

