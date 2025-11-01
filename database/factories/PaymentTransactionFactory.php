<?php

namespace Database\Factories;

use App\Models\PaymentTransaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentTransactionFactory extends Factory
{
    protected $model = PaymentTransaction::class;

    public function definition(): array
    {
        return [
            'tx_ref' => 'TX-' . $this->faker->unique()->randomNumber(8),
            'order_id' => null,
            'product_request_id' => null,
            'amount' => $this->faker->randomFloat(2, 100, 5000),
            'currency' => 'ETB',
            'customer_email' => $this->faker->email(),
            'customer_name' => $this->faker->name(),
            'customer_phone' => $this->faker->phoneNumber() ?? '+251911000000',
            'payment_method' => 'chapa',
            'gateway_status' => 'pending',
            'admin_status' => 'unseen',
            'checkout_url' => null,
            'gateway_payload' => [],
            'admin_notes' => null,
            'admin_id' => null,
            'admin_action_at' => null,
        ];
    }
}

