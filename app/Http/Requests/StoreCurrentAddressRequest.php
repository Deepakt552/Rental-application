<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCurrentAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'country' => 'required|string|max:100',
            'address_line_1' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'zip_code' => 'required|string|max:20',
            'address_line_2' => 'nullable|string|max:255',
            'apartment_community' => 'nullable|string|max:255',
            'residency_from_date' => 'nullable|date',
            'monthly_rent' => 'nullable|numeric|min:0',
            'reason_for_moving' => 'nullable|string',
            'notice_given' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'country.required' => 'Country is required.',
            'address_line_1.required' => 'Street address is required.',
            'city.required' => 'City is required.',
            'state.required' => 'State is required.',
            'zip_code.required' => 'ZIP code is required.',
        ];
    }
}