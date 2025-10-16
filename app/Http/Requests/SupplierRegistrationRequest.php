<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SupplierRegistrationRequest extends FormRequest
{
    public function authorize()
    {
        return true; // Will be handled by middleware
    }

    public function rules()
    {
        return [
            'business_name' => ['required', 'string', 'max:255'],
            'business_email' => ['required', 'string', 'email', 'max:255', 'unique:supplier_profiles,business_email'],
            'phone' => ['required', 'string', 'max:20'],
            'tax_id' => ['nullable', 'string', 'max:100'],
            'address' => ['required', 'array'],
            'address.street' => ['required', 'string', 'max:255'],
            'address.city' => ['required', 'string', 'max:100'],
            'address.state' => ['required', 'string', 'max:100'],
            'address.postal_code' => ['required', 'string', 'max:20'],
            'address.country' => ['required', 'string', 'max:100'],
            'payout_method' => ['nullable', 'array'],
            'payout_method.type' => ['required_with:payout_method', 'string', 'in:bank_transfer,paypal,other'],
            'payout_method.details' => ['required_with:payout_method', 'array'],
        ];
    }

    public function messages()
    {
        return [
            'business_name.required' => 'Business name is required',
            'business_email.unique' => 'This business email is already registered',
            'address.required' => 'Business address is required',
            'payout_method.type.in' => 'Invalid payout method selected',
        ];
    }
}
