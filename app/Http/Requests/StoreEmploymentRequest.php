<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmploymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employment_country' => 'required|string|max:100',
            'employment_status' => 'nullable|string|max:50',
            'job_title' => 'nullable|string|max:255',
            'employer_name' => 'nullable|string|max:255',
            'supervisor_name' => 'nullable|string|max:255',
            'employed_since' => 'nullable|date',
            'monthly_income' => 'nullable|numeric|min:0',
            'additional_income' => 'nullable|numeric|min:0',
            'additional_income_source' => 'nullable|string|max:255',
            'employer_address_1' => 'nullable|string|max:255',
            'employer_address_2' => 'nullable|string|max:255',
            'employer_city' => 'nullable|string|max:100',
            'employer_state' => 'nullable|string|max:100',
            'employer_zip' => 'nullable|string|max:20',
            'employer_phone' => 'nullable|string|max:20',
        ];
    }

    public function messages(): array
    {
        return [
            'employment_country.required' => 'Employment country is required.',
        ];
    }
}