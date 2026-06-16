<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreScreeningRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date_of_birth' => 'required|date|before:today',
            'screening_country' => 'nullable|string|max:100',
            'has_ssn' => 'nullable|boolean',
            'ssn' => 'nullable|string|max:20',
            'government_id' => 'nullable|string|max:100',
            'issuing_entity' => 'nullable|string|max:255',
            'evicted' => 'nullable|boolean',
            'eviction_reason' => 'required_if:evicted,true|nullable|string',
            'felony' => 'nullable|boolean',
            'felony_reason' => 'required_if:felony,true|nullable|string',
            'legal_case' => 'nullable|boolean',
            'legal_case_details' => 'required_if:legal_case,true|nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'date_of_birth.required' => 'Date of birth is required.',
            'date_of_birth.before' => 'Date of birth must be a past date.',
            'eviction_reason.required_if' => 'Please explain the eviction circumstances.',
            'felony_reason.required_if' => 'Please explain the felony circumstances.',
            'legal_case_details.required_if' => 'Please explain the legal case details.',
        ];
    }
}