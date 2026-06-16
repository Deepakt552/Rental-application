<?php


namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PropertyController extends Controller
{
    /**
     * Display a listing of the properties.
     */
    public function index(Request $request)
    {
        $query = Property::with('user');

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function($q) use ($request) {
                $q->where('property_name', 'like', '%' . $request->search . '%')
                  ->orWhere('company_name', 'like', '%' . $request->search . '%')
                  ->orWhere('address', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('company') && !empty($request->company) && $request->company !== 'all') {
            $query->where('company_name', $request->company);
        }

        if ($request->has('type') && !empty($request->type) && $request->type !== 'all') {
            $query->whereJsonContains('property_type', $request->type);
        }

        // Sort logic
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $allowedSorts = ['id', 'property_name', 'company_name', 'created_at'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->latest();
        }

        $properties = $query->paginate(10);
        $properties->appends($request->only(['search', 'company', 'type', 'sort_by', 'sort_dir']));

        $users = User::all();
        
        $totalExcel = Property::where('company_name', 'Excel')->count();
        $totalTriumph = Property::where('company_name', 'Triumph')->count();
        $totalProperties = Property::count();
        
        return inertia('Admin/Properties/Index', [
            'properties' => $properties,
            'users' => $users,
            'stats' => [
                'total' => $totalProperties,
                'excel' => $totalExcel,
                'triumph' => $totalTriumph,
            ],
            'filters' => [
                'search' => $request->search ?? '',
                'company' => $request->company ?? 'all',
                'type' => $request->type ?? 'all',
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ]
        ]);
    }

    /**
     * Store a newly created property.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'property_name' => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'property_type' => 'required|array',
            'property_type.*' => 'string',
            'address' => 'required|string|max:255',
            'added_by' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        Property::create($request->all());

        return redirect()->route('admin.properties.index')
            ->with('success', 'Property created successfully.');
    }

    /**
     * Update the specified property.
     */
    public function update(Request $request, Property $property)
    {
        $validator = Validator::make($request->all(), [
            'property_name' => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'property_type' => 'required|array',
            'property_type.*' => 'string',
            'address' => 'required|string|max:255',
            'added_by' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $property->update($request->all());

        return redirect()->route('admin.properties.index')
            ->with('success', 'Property updated successfully.');
    }

    /**
     * Delete the specified property.
     */
    public function destroy(Property $property)
    {
        $property->delete();

        return redirect()->route('admin.properties.index')
            ->with('success', 'Property deleted successfully.');
    }

    /**
     * Get property details for edit.
     */
    public function edit(Property $property)
    {
        return response()->json($property);
    }

    /**
     * Export properties.
     */
    public function export(Request $request)
    {
        $query = Property::with('user');

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function($q) use ($request) {
                $q->where('property_name', 'like', '%' . $request->search . '%')
                  ->orWhere('company_name', 'like', '%' . $request->search . '%')
                  ->orWhere('address', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('company') && !empty($request->company) && $request->company !== 'all') {
            $query->where('company_name', $request->company);
        }

        if ($request->has('type') && !empty($request->type) && $request->type !== 'all') {
            $query->whereJsonContains('property_type', $request->type);
        }

        // Sort logic
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $allowedSorts = ['id', 'property_name', 'company_name', 'created_at'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->latest();
        }

        $properties = $query->get();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=properties.csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['ID', 'Property Name', 'Company Name', 'Address', 'Property Type', 'Added By', 'Created At'];

        $callback = function() use($properties, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($properties as $property) {
                $row['ID']  = $property->id;
                $row['Property Name'] = $property->property_name;
                $row['Company Name']  = $property->company_name;
                $row['Address'] = $property->address ?? 'N/A';
                $row['Property Type'] = implode(', ', $property->property_type ?? []);
                $row['Added By'] = $property->user ? $property->user->name : 'N/A';
                $row['Created At'] = $property->created_at->format('Y-m-d H:i:s');

                fputcsv($file, array($row['ID'], $row['Property Name'], $row['Company Name'], $row['Address'], $row['Property Type'], $row['Added By'], $row['Created At']));
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}