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
        $request->validate([
            'company_name' => 'required|in:Triumph,Excel',
            'search' => 'nullable|string|min:2',
        ]);

        $search = $request->search;
        $companyName = $request->company_name;

        $properties = Property::query()
            ->where('company_name', $companyName)
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('property_name', 'LIKE', "%{$search}%")
                        ->orWhere('address', 'LIKE', "%{$search}%");
                });
            })
            ->select(
                'id',
                'property_name',
                'company_name',
                'property_type',
                'address'
            )
            ->limit(10)
            ->get();

        return response()->json([
            'status' => true,
            'data' => $properties,
        ]);
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
