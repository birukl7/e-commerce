<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TaxClassRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->can('manage tax settings');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $taxClass = $this->route('tax_class') ?? null;
        $taxClassId = $taxClass ? $taxClass->id : null;
        
        $rules = [
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:tax_classes,name' . ($taxClassId ? ",$taxClassId" : '')
            ],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                'unique:tax_classes,slug' . ($taxClassId ? ",$taxClassId" : '')
            ],
            'description' => 'nullable|string|max:1000',
            'is_active' => 'sometimes|boolean',
            'is_default' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer|min:0|max:999',
        ];
        
        return $rules;
    }
    
    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // If slug is not provided, generate it from the name
        if ($this->has('name') && !$this->has('slug')) {
            $this->merge([
                'slug' => \Illuminate\Support\Str::slug($this->name)
            ]);
        }
    }
    
    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The tax class name is required.',
            'name.unique' => 'A tax class with this name already exists.',
            'slug.unique' => 'This slug is already in use by another tax class.',
            'slug.regex' => 'The slug may only contain letters, numbers, and dashes. Dashes are only allowed between alphanumeric characters.',
            'sort_order.integer' => 'The sort order must be a number.',
            'sort_order.min' => 'The sort order must be at least 0.',
            'sort_order.max' => 'The sort order may not be greater than 999.',
        ];
    }
}
