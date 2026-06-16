<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pets' => 'nullable|array|max:2',
            'pets.*.pet_type' => 'required_with:pets.*|string|max:50',
            'pets.*.pet_name' => 'required_with:pets.*|string|max:255',
            'pets.*.breed' => 'nullable|string|max:255',
            'pets.*.age' => 'nullable|integer|min:0|max:50',
            'pets.*.weight' => 'nullable|numeric|min:0|max:300',
            'pets.*.color' => 'nullable|string|max:100',
            'pets.*.vaccinated' => 'nullable|boolean',
            'pets.*.special_notes' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'pets.max' => 'Maximum 2 pets are allowed.',
            'pets.*.pet_type.required_with' => 'Pet type is required.',
            'pets.*.pet_name.required_with' => 'Pet name is required.',
        ];
    }
}