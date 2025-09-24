<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TaxSettingRequest extends FormRequest
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
        $taxSetting = $this->route('tax_setting') ?? null;
        $taxSettingId = $taxSetting ? $taxSetting->id : null;
        
        $rules = [
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:tax_settings,name' . ($taxSettingId ? ",$taxSettingId" : '')
            ],
            'type' => [
                'required',
                'string',
                'in:percentage,fixed'
            ],
            'rate' => [
                'required',
                'numeric',
                'min:0',
                'max:100',
                function ($attribute, $value, $fail) {
                    if ($this->input('type') === 'percentage' && $value > 100) {
                        $fail('The rate must be less than or equal to 100 for percentage type.');
                    }
                },
            ],
            'description' => 'nullable|string|max:1000',
            'is_active' => 'sometimes|boolean',
            'country' => 'required|string|size:2',
            'state' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'priority' => 'sometimes|integer|min:0|max:100',
            'compound' => 'sometimes|boolean',
            'shipping_taxable' => 'sometimes|boolean',
            'tax_class_id' => 'required|exists:tax_classes,id',
        ];
        
        return $rules;
    }
    
    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Ensure country code is uppercase
        if ($this->has('country')) {
            $this->merge([
                'country' => strtoupper($this->country)
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
            'name.required' => 'The tax rate name is required.',
            'name.unique' => 'A tax rate with this name already exists.',
            'type.in' => 'The tax type must be either percentage or fixed.',
            'rate.required' => 'The tax rate is required.',
            'rate.numeric' => 'The tax rate must be a number.',
            'rate.min' => 'The tax rate must be at least 0.',
            'rate.max' => 'The tax rate may not be greater than 100.',
            'country.required' => 'The country code is required.',
            'country.size' => 'The country code must be 2 characters.',
            'tax_class_id.required' => 'Please select a tax class.',
            'tax_class_id.exists' => 'The selected tax class is invalid.',
        ];
    }
    
    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'tax_class_id' => 'tax class',
        ];
    }
}
