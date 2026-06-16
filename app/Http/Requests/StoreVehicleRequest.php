<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicles' => 'nullable|array|max:4',
            'vehicles.*.vehicle_type' => 'nullable|string|max:50',
            'vehicles.*.model' => 'nullable|string|max:255',
            'vehicles.*.plate_number' => 'nullable|string|max:50',
        ];
    }

    public function messages(): array
    {
        return [
            'vehicles.max' => 'Maximum 4 vehicles are allowed.',
        ];
    }
}