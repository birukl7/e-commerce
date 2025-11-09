<?php

namespace Database\Factories;

use App\Models\PaymentRejectionReason;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentRejectionReasonFactory extends Factory
{
    protected $model = PaymentRejectionReason::class;

    public function definition(): array
    {
        return [
            'reason_code' => 'test_reason_' . $this->faker->unique()->word(),
            'reason_text' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'applies_to' => ['both'],
            'is_active' => true,
            'sort_order' => $this->faker->numberBetween(0, 100),
        ];
    }

    public function forProductRequest(): static
    {
        return $this->state(fn (array $attributes) => [
            'applies_to' => ['product_request'],
        ]);
    }

    public function forNormalPurchase(): static
    {
        return $this->state(fn (array $attributes) => [
            'applies_to' => ['normal_purchase'],
        ]);
    }

    public function forBoth(): static
    {
        return $this->state(fn (array $attributes) => [
            'applies_to' => ['both'],
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
