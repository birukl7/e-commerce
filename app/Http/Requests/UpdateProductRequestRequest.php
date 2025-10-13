<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // The controller will handle the actual authorization
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_name' => 'sometimes|required|string|max:255',
            'product_url' => 'nullable|url|max:1000',
            'description' => 'sometimes|required|string',
            'brand' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:50',
            'size' => 'nullable|string|max:50',
            'quantity' => 'sometimes|required|integer|min:1|max:1000',
            'max_budget' => 'sometimes|required|numeric|min:0|max:1000000',
            'shipping_address' => 'sometimes|required|string|max:500',
            'shipping_method' => 'nullable|string|max:100',
            'desired_delivery_date' => 'nullable|date|after:today',
            'additional_notes' => 'nullable|string|max:2000',
            'specifications' => 'nullable|array',
            'specifications.*.key' => 'required_with:specifications|string|max:100',
            'specifications.*.value' => 'required_with:specifications|string|max:500',
            'image' => 'nullable|image|max:5120|mimes:jpg,jpeg,png,webp',
        ];
    }
}
