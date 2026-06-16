<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class Step3ConsentRequest extends FormRequest
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
            'head_of_household' => 'required|array',
            'head_of_household.name' => 'required|string|max:255',
            'head_of_household.signature' => 'required|string|min:10',
            'head_of_household.consent_date' => 'required|date|before_or_equal:today',

            'co_head' => 'nullable|array',
            'co_head.name' => 'nullable|string|max:255',
            'co_head.signature' => 'nullable|string|min:10',
            'co_head.consent_date' => 'nullable|date|before_or_equal:today',

            'adult_members' => 'nullable|array',
            'adult_members.*.name' => 'required|string|max:255',
            'adult_members.*.signature' => 'required|string|min:10',
            'adult_members.*.consent_date' => 'required|date|before_or_equal:today',
        ];
    }

    public function messages(): array
    {
        return [
            'head_of_household.name.required' => 'Head of household name is required',
            'head_of_household.signature.required' => 'Head of household signature is required',
            'head_of_household.consent_date.required' => 'Consent date is required',
            'head_of_household.consent_date.before_or_equal' => 'Consent date cannot be in the future',

            'adult_members.*.name.required' => 'Adult member name is required',
            'adult_members.*.signature.required' => 'Adult member signature is required',
            'adult_members.*.signature.min' => 'Please provide a valid signature',
            'adult_members.*.consent_date.required' => 'Consent date is required',
            'adult_members.*.consent_date.before_or_equal' => 'Consent date cannot be in the future',
        ];
    }
}
