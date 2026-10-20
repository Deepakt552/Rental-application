<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    /**
     * Search Property By Company + Name
     *
     * Example:
     * /properties/search?company_name=Triumph&search=sk
     */
    public function search(Request $request)
    {
        try {
            $search = trim((string) $request->get('search', ''));
            $companyName = trim((string) $request->get('company_name', ''));

            $query = Property::query();

            if (!empty($companyName)) {
                $query->where(function ($q) use ($companyName) {
                    $q->where('company_name', 'LIKE', "%{$companyName}%")
                        ->orWhereRaw('LOWER(company_name) = ?', [strtolower($companyName)]);
                });
            }

            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('property_name', 'LIKE', "%{$search}%")
                        ->orWhere('property_code', 'LIKE', "%{$search}%")
                        ->orWhere('address', 'LIKE', "%{$search}%");
                });
            }

            $properties = $query->select(
                'id',
                'property_code',
                'property_name',
                'company_name',
                'property_type',
                'address'
            )
            ->limit(20)
            ->get();

            return response()->json([
                'status' => true,
                'data' => $properties,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
                'data' => [],
            ], 200);
        }
    }

    /**
     * Get Single Property Types
     */
    public function getPropertyTypes($id)
    {
        $property = Property::select(
            'id',
            'property_name',
            'property_type',
            'company_name'
        )
            ->find($id);

        if (!$property) {
            return response()->json([
                'status' => false,
                'message' => 'Property not found',
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => [
                'id' => $property->id,
                'property_name' => $property->property_name,
                'company_name' => $property->company_name,
                'property_types' => $property->property_type,
            ]
        ]);
    }
}
