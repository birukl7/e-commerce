<?php

namespace Database\Factories;

use App\Models\OfflinePaymentSubmission;
use App\Models\User;
use App\Models\OfflinePaymentMethod;
use Illuminate\Database\Eloquent\Factories\Factory;

class OfflinePaymentSubmissionFactory extends Factory
{
    protected $model = OfflinePaymentSubmission::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'submission_ref' => 'OFFLINE-' . $this->faker->unique()->randomNumber(8),
            'offline_payment_method_id' => OfflinePaymentMethod::factory(),
            'order_id' => null,
            'product_request_id' => null,
            'amount' => $this->faker->randomFloat(2, 100, 5000),
            'currency' => 'ETB',
            'customer_name' => $this->faker->name(),
            'customer_email' => $this->faker->email(),
            'customer_phone' => $this->faker->phoneNumber(),
            'payment_reference' => $this->faker->word(),
            'payment_notes' => $this->faker->sentence(),
            'payment_screenshot' => 'screenshots/test.jpg',
            'status' => 'pending',
        ];
    }
}

