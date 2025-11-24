<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->words(3, true);
        
        // Get or create category
        $category = Category::first();
        if (!$category) {
            $category = Category::create([
                'name' => fake()->words(2, true),
                'slug' => Str::slug(fake()->words(2, true)),
                'description' => fake()->sentence(),
            ]);
        }
        
        // Get or create brand
        $brand = Brand::first();
        if (!$brand) {
            $brand = Brand::create([
                'name' => fake()->company(),
                'slug' => Str::slug(fake()->company()),
                'description' => fake()->sentence(),
            ]);
        }
        
        return [
            'name' => $name,
            'description' => fake()->paragraph(),
            'slug' => Str::slug($name),
            'sku' => 'SKU-' . fake()->unique()->numerify('####'),
            'price' => fake()->randomFloat(2, 10, 1000),
            'sale_price' => fake()->optional()->randomFloat(2, 5, 500),
            'cost_price' => fake()->optional()->randomFloat(2, 5, 300),
            'stock_quantity' => fake()->numberBetween(0, 100),
            'manage_stock' => true,
            'low_stock_threshold' => 10,
            'stock_status' => fake()->randomElement(['in_stock', 'out_of_stock', 'on_backorder']),
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'featured' => false,
            'status' => 'published',
            'meta_title' => $name,
            'meta_description' => fake()->sentence(),
        ];
    }
}

