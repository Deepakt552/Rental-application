<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePreviousEmploymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'previous_employer_name' => 'nullable|string|max:255',
            'previous_supervisor_name' => 'nullable|string|max:255',
            'previous_job_title' => 'nullable|string|max:255',
            'previous_monthly_income' => 'nullable|numeric|min:0',
            'previous_additional_income' => 'nullable|numeric|min:0',
            'previous_income_source' => 'nullable|string|max:255',
            'previous_start_date' => 'nullable|date',
            'previous_end_date' => 'nullable|date|after_or_equal:previous_start_date',
            'previous_employer_address_1' => 'nullable|string|max:255',
            'previous_employer_address_2' => 'nullable|string|max:255',
            'previous_employer_city' => 'nullable|string|max:100',
            'previous_employer_state' => 'nullable|string|max:100',
            'previous_employer_zip' => 'nullable|string|max:20',
            'previous_employer_phone' => 'nullable|string|max:20',
        ];
    }
}