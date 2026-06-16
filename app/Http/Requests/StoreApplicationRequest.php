<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Email
            'email' => 'required|email|unique:applicants,email',

            // Personal Information
            'personal_info.first_name' => 'required|string|max:255',
            'personal_info.last_name' => 'required|string|max:255',
            'personal_info.phone' => 'required|string|max:20',
            'personal_info.email' => 'required|email',
            'personal_info.title' => 'nullable|string|max:50',
            'personal_info.middle_name' => 'nullable|string|max:255',
            'personal_info.preferred_name' => 'nullable|string|max:255',
            'personal_info.marital_status' => 'nullable|string|max:50',

            // Current Address
            'current_address.country' => 'required|string|max:100',
            'current_address.address_line_1' => 'required|string|max:255',
            'current_address.city' => 'required|string|max:100',
            'current_address.state' => 'required|string|max:100',
            'current_address.zip_code' => 'required|string|max:20',
            'current_address.address_line_2' => 'nullable|string|max:255',
            'current_address.apartment_community' => 'nullable|string|max:255',
            'current_address.residency_from_date' => 'nullable|date',
            'current_address.monthly_rent' => 'nullable|numeric|min:0',
            'current_address.reason_for_moving' => 'nullable|string',
            'current_address.notice_given' => 'nullable|boolean',

            // Employment
            'employment.employment_country' => 'required|string|max:100',
            'employment.employment_status' => 'nullable|string|max:50',
            'employment.job_title' => 'nullable|string|max:255',
            'employment.employer_name' => 'nullable|string|max:255',
            'employment.supervisor_name' => 'nullable|string|max:255',
            'employment.employed_since' => 'nullable|date',
            'employment.monthly_income' => 'nullable|numeric|min:0',
            'employment.additional_income' => 'nullable|numeric|min:0',
            'employment.additional_income_source' => 'nullable|string|max:255',
            'employment.employer_address_1' => 'nullable|string|max:255',
            'employment.employer_address_2' => 'nullable|string|max:255',
            'employment.employer_city' => 'nullable|string|max:100',
            'employment.employer_state' => 'nullable|string|max:100',
            'employment.employer_zip' => 'nullable|string|max:20',
            'employment.employer_phone' => 'nullable|string|max:20',

            // Previous Address
            'previous_address' => 'nullable|array',

            'previous_address.previous_country' => 'nullable|string|max:100',
            'previous_address.previous_address_line_1' => 'nullable|string|max:255',
            'previous_address.previous_address_line_2' => 'nullable|string|max:255',
            'previous_address.previous_city' => 'nullable|string|max:100',
            'previous_address.previous_state' => 'nullable|string|max:100',
            'previous_address.previous_zip_code' => 'nullable|string|max:20',
            'previous_address.previous_apartment' => 'nullable|string|max:255',
            'previous_address.previous_from_date' => 'nullable|date',
            'previous_address.previous_to_date' => 'nullable|date',
            'previous_address.previous_rent' => 'nullable|numeric|min:0',
            'previous_address.previous_reason' => 'nullable|string',


            // Screening
            'screening.date_of_birth' => 'required|date|before:today',
            'screening.screening_country' => 'nullable|string|max:100',
            'screening.has_ssn' => 'nullable|boolean',
            'screening.ssn' => 'nullable|string|max:20',
            'screening.government_id' => 'nullable|string|max:100',
            'screening.issuing_entity' => 'nullable|string|max:255',
            'screening.evicted' => 'nullable|boolean',
            'screening.eviction_reason' => 'nullable|string',
            'screening.felony' => 'nullable|boolean',
            'screening.felony_reason' => 'nullable|string',
            'screening.legal_case' => 'nullable|boolean',
            'screening.legal_case_details' => 'nullable|string',

            // Emergency Contact
            'emergency_contact.full_name' => 'required|string|max:255',
            'emergency_contact.relationship' => 'required|string|max:100',
            'emergency_contact.phone' => 'required|string|max:20',
            'emergency_contact.email' => 'nullable|email',
            'emergency_contact.country' => 'nullable|string|max:100',
            'emergency_contact.address_line_1' => 'nullable|string|max:255',
            'emergency_contact.address_line_2' => 'nullable|string|max:255',
            'emergency_contact.city' => 'nullable|string|max:100',
            'emergency_contact.state' => 'nullable|string|max:100',
            'emergency_contact.zip_code' => 'nullable|string|max:20',

            // Pets
            'pets' => 'nullable|array|max:2',
            'pets.*.pet_type' => 'required_with:pets.*|string|max:50',
            'pets.*.pet_name' => 'required_with:pets.*|string|max:255',
            'pets.*.breed' => 'nullable|string|max:255',
            'pets.*.age' => 'nullable|integer|min:0|max:50',
            'pets.*.weight' => 'nullable|numeric|min:0|max:300',
            'pets.*.color' => 'nullable|string|max:100',
            'pets.*.vaccinated' => 'nullable|boolean',
            'pets.*.special_notes' => 'nullable|string',

            // Vehicles
            'vehicles' => 'nullable|array|max:4',
            'vehicles.*.vehicle_type' => 'nullable|string|max:50',
            'vehicles.*.model' => 'nullable|string|max:255',
            'vehicles.*.plate_number' => 'nullable|string|max:50',



            'additional_persons' => 'nullable|array',
            'additional_persons.*.full_name' => 'nullable|string|max:255',
            'additional_persons.*.date_of_birth' => 'nullable|date',
            'additional_persons.*.relationship' => 'nullable|string|max:100',
            'additional_persons.*.phone' => 'nullable|string|max:20',
            'additional_persons.*.email' => 'nullable|email|max:50',
            'additional_persons.*.occupation' => 'nullable|string|max:255',
            'additional_persons.*.is_emergency_contact' => 'nullable|boolean',
            'additional_persons.*.notes' => 'nullable|string',


            'documents.driving_license' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'documents.pay_check' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'documents.bank_statement' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'documents.social_security_card' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'documents.other_source_of_income.file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'documents.other_source_of_income.description' => 'nullable|string',
            'documents.other.file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'documents.other.description' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email address is required.',
            'email.unique' => 'This email is already registered.',
            'personal_info.first_name.required' => 'First name is required.',
            'personal_info.last_name.required' => 'Last name is required.',
            'personal_info.phone.required' => 'Phone number is required.',
            'personal_info.email.required' => 'Email address is required in personal information.',
            'current_address.country.required' => 'Country is required.',
            'current_address.address_line_1.required' => 'Street address is required.',
            'current_address.city.required' => 'City is required.',
            'current_address.state.required' => 'State is required.',
            'current_address.zip_code.required' => 'ZIP code is required.',
            'employment.employment_country.required' => 'Employment country is required.',
            'screening.date_of_birth.required' => 'Date of birth is required.',
            'screening.date_of_birth.before' => 'Date of birth must be a past date.',
            'emergency_contact.full_name.required' => 'Emergency contact full name is required.',
            'emergency_contact.relationship.required' => 'Relationship is required.',
            'emergency_contact.phone.required' => 'Emergency contact phone number is required.',
            'pets.max' => 'Maximum 2 pets are allowed.',
            'vehicles.max' => 'Maximum 4 vehicles are allowed.',
        ];
    }
}
