<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)->ignore($this->user()->id)],
            'phone' => ['nullable', 'string', 'regex:/^(?:(?:09|07)\d{8}|(?:2519|2517)\d{8}|\+(?:2519|2517)\d{8})$/'],
            'profile_image' => ['nullable', 'image', 'max:2048'], // 2MB max
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'phone.regex' => 'Phone must be: 10 digits starting with 09 or 07, 12 digits starting with 2519 or 2517 or 13 digits starting with +2519 or +2517',
            'profile_image.max' => 'Profile image must not be larger than 2MB.',
        ];
    }
}