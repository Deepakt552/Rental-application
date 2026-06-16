<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class Step2ConsentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'session_id' => 'required|string|uuid',
            'applicants' => 'required|array|min:1',
            'applicants.*.applicant_name' => 'required|string|max:255',
            'applicants.*.social_security_no' => 'nullable|string|max:11|regex:/^\d{3}-?\d{2}-?\d{4}$/',
            'applicants.*.date_of_birth' => 'required|date|before:today',
            'applicants.*.today_date' => 'required|date|before_or_equal:today',
            'applicants.*.signature' => 'required|string|min:10',
        ];
    }

    public function messages(): array
    {
        return [
            'applicants.required' => 'At least one applicant is required',
            'applicants.*.applicant_name.required' => 'Applicant name is required',
            'applicants.*.social_security_no.regex' => 'Please enter a valid SSN (format: XXX-XX-XXXX or XXXXXXXX)',
            'applicants.*.date_of_birth.required' => 'Date of birth is required',
            'applicants.*.date_of_birth.before' => 'Date of birth must be in the past',
            'applicants.*.today_date.required' => 'Today\'s date is required',
            'applicants.*.today_date.today' => 'Today\'s date must be current date',
            'applicants.*.signature.required' => 'Signature is required',
            'applicants.*.signature.min' => 'Please provide a valid signature',
        ];
    }
}
