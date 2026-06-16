<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class Step1ConsentRequest extends FormRequest
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
            'applicant_tenant' => 'required|array',
            'applicant_tenant.applicant_name' => 'required|string|max:255',
            'applicant_tenant.signature' => 'required|string|min:10', // Base64 signature
            'applicant_tenant.consent_date' => 'required|date|before_or_equal:today',

            'co_applicants' => 'nullable|array',
            'co_applicants.*.name' => 'required_with:co_applicants.*.signature|string|max:255',
            'co_applicants.*.signature' => 'required_with:co_applicants.*.name|string|min:10',
            'co_applicants.*.consent_date' => 'required_with:co_applicants.*.name|date|before_or_equal:today',
        ];
    }


    public function messages(): array
    {
        return [
            'applicant_tenant.applicant_name.required' => 'Applicant name is required',
            'applicant_tenant.signature.required' => 'Signature is required for applicant',
            'applicant_tenant.signature.min' => 'Please provide a valid signature',
            'applicant_tenant.consent_date.required' => 'Consent date is required',
            'applicant_tenant.consent_date.before_or_equal' => 'Consent date cannot be in the future',

            'co_applicants.*.name.required_with' => 'Name is required when signature is provided',
            'co_applicants.*.signature.required_with' => 'Signature is required when name is provided',
            'co_applicants.*.signature.min' => 'Please provide a valid signature',
            'co_applicants.*.consent_date.required_with' => 'Consent date is required when name is provided',
            'co_applicants.*.consent_date.before_or_equal' => 'Consent date cannot be in the future',
        ];
    }
}
