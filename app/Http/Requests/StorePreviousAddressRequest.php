<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePreviousAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'previous_country' => 'nullable|string|max:100',
            'previous_address_line_1' => 'nullable|string|max:255',
            'previous_address_line_2' => 'nullable|string|max:255',
            'previous_city' => 'nullable|string|max:100',
            'previous_state' => 'nullable|string|max:100',
            'previous_zip_code' => 'nullable|string|max:20',
            'previous_apartment' => 'nullable|string|max:255',
            'previous_from_date' => 'nullable|date',
            'previous_to_date' => 'nullable|date|after_or_equal:previous_from_date',
            'previous_rent' => 'nullable|numeric|min:0',
            'previous_reason' => 'nullable|string',
        ];
    }
}