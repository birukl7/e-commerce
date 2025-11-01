<?php

namespace Database\Factories;

use App\Models\TaxSetting;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaxSettingFactory extends Factory
{
    protected $model = TaxSetting::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->words(2, true),
            'type' => 'percentage',
            'rate' => $this->faker->randomFloat(2, 5, 25),
            'description' => $this->faker->sentence(),
            'is_active' => true,
        ];
    }
}

