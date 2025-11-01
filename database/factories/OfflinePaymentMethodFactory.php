<?php

namespace Database\Factories;

use App\Models\OfflinePaymentMethod;
use Illuminate\Database\Eloquent\Factories\Factory;

class OfflinePaymentMethodFactory extends Factory
{
    protected $model = OfflinePaymentMethod::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->company() . ' Bank',
            'type' => $this->faker->randomElement(['bank', 'mobile_money']),
            'description' => $this->faker->sentence(),
            'instructions' => $this->faker->paragraph(),
            'details' => [
                'account_name' => $this->faker->name(),
                'account_number' => $this->faker->bankAccountNumber(),
            ],
            'is_active' => true,
            'sort_order' => $this->faker->numberBetween(1, 10),
        ];
    }
}

