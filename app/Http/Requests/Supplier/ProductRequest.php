<?php

namespace App\Http\Requests\Supplier;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->isSupplier();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'sku' => 'required|string|max:100|unique:products,sku,' . $this->route('product'),
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0|lt:price',
            'cost_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'length' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'manage_stock' => 'boolean',
            'featured' => 'boolean',
            'visibility' => 'required|in:private,public',
            'meta_title' => 'nullable|string|max:60',
            'meta_description' => 'nullable|string|max:160',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240', // 10MB max per image
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Product name is required.',
            'description.required' => 'Product description is required.',
            'sku.required' => 'Product SKU is required.',
            'sku.unique' => 'This SKU is already in use.',
            'price.required' => 'Product price is required.',
            'price.min' => 'Product price must be at least 0.',
            'sale_price.lt' => 'Sale price must be less than regular price.',
            'category_id.required' => 'Please select a category.',
            'category_id.exists' => 'Selected category is invalid.',
            'brand_id.exists' => 'Selected brand is invalid.',
            'visibility.required' => 'Please select product visibility.',
            'images.*.image' => 'Uploaded file must be an image.',
            'images.*.mimes' => 'Images must be in JPEG, PNG, JPG, or GIF format.',
            'images.*.max' => 'Each image must be smaller than 10MB.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert string values to appropriate types
        $this->merge([
            'manage_stock' => $this->boolean('manage_stock'),
            'featured' => $this->boolean('featured'),
            'price' => $this->price ? (float) $this->price : null,
            'sale_price' => $this->sale_price ? (float) $this->sale_price : null,
            'cost_price' => $this->cost_price ? (float) $this->cost_price : null,
            'stock_quantity' => $this->stock_quantity ? (int) $this->stock_quantity : 0,
            'low_stock_threshold' => $this->low_stock_threshold ? (int) $this->low_stock_threshold : 5,
            'weight' => $this->weight ? (float) $this->weight : null,
            'length' => $this->length ? (float) $this->length : null,
            'width' => $this->width ? (float) $this->width : null,
            'height' => $this->height ? (float) $this->height : null,
        ]);
    }
}
