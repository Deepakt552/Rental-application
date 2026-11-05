<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $query = User::with('properties:id,property_name');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role') && $request->role != 'all') {
            $query->where('role', $request->role);
        }

        // Sort logic
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $allowedSorts = ['id', 'name', 'email', 'role', 'created_at'];
        
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->latest();
        }

        $users = $query->paginate(10);
        $users->appends($request->only(['search', 'role', 'sort_by', 'sort_dir']));

        $stats = [
            'total' => User::count(),
            'admins' => User::where('role', 'admin')->count(),
            'users' => User::where('role', 'user')->count(),
            'superadmin' => User::where('role', 'superadmin')->count(),
            'property_managers' => User::where('role', 'property_manager')->count(),
        ];

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search ?? '',
                'role' => $request->role ?? 'all',
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ]
        ]);
    }

    /**
     * Export Users.
     */
    public function export(Request $request)
    {
        $query = User::with('properties:id,property_name');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role') && $request->role != 'all') {
            $query->where('role', $request->role);
        }

        // Sort logic
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $allowedSorts = ['id', 'name', 'email', 'role', 'created_at'];
        
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->latest();
        }

        $users = $query->get();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=users.csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['ID', 'Name', 'Email', 'Role', 'Assigned Properties', 'Can Edit Applications', 'Created At'];

        $callback = function() use($users, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($users as $user) {
                $row['ID'] = $user->id;
                $row['Name'] = $user->name;
                $row['Email'] = $user->email;
                $row['Role'] = $user->role === 'property_manager' ? 'Property Manager' : ucfirst($user->role);
                $row['Assigned Properties'] = $user->properties->pluck('property_name')->join(', ');
                $row['Can Edit Applications'] = $user->role === 'property_manager' ? ($user->can_edit_applications ? 'Yes' : 'No') : 'N/A';
                $row['Created At'] = $user->created_at->format('Y-m-d H:i:s');

                fputcsv($file, array($row['ID'], $row['Name'], $row['Email'], $row['Role'], $row['Assigned Properties'], $row['Can Edit Applications'], $row['Created At']));
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Show form to create new user.
     */
    public function create()
    {
        $properties = \App\Models\Property::select('id', 'property_name', 'company_name', 'property_code')->orderBy('property_name')->get();

        return Inertia::render('Admin/Users/Create', [
            'properties' => $properties
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:user,admin,superadmin,property_manager',
            'property_ids' => 'nullable|array',
            'property_ids.*' => 'exists:properties,id',
            'can_edit_applications' => 'nullable|boolean',
        ]);

        if ($validated['role'] === 'property_manager' && empty($validated['property_ids'])) {
            return back()->withErrors(['property_ids' => 'Please select at least one property for the Property Manager.'])->withInput();
        }

        $canEdit = $validated['role'] === 'property_manager' ? (bool) $request->input('can_edit_applications', false) : false;

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'can_edit_applications' => $canEdit,
        ]);

        if ($validated['role'] === 'property_manager' && !empty($validated['property_ids'])) {
            $user->properties()->sync($validated['property_ids']);
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'User created successfully!');
    }

    /**
     * Show form to edit user.
     */
    public function edit($id)
    {
        $user = User::with('properties:id,property_name')->findOrFail($id);
        $properties = \App\Models\Property::select('id', 'property_name', 'company_name', 'property_code')->orderBy('property_name')->get();

        return Inertia::render('Admin/Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'can_edit_applications' => (bool) $user->can_edit_applications,
                'property_ids' => $user->properties->pluck('id')->toArray(),
            ],
            'properties' => $properties
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'role' => 'required|in:user,admin,superadmin,property_manager',
            'property_ids' => 'nullable|array',
            'property_ids.*' => 'exists:properties,id',
            'can_edit_applications' => 'nullable|boolean',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        if ($validated['role'] === 'property_manager' && empty($validated['property_ids'])) {
            return back()->withErrors(['property_ids' => 'Please select at least one property for the Property Manager.'])->withInput();
        }

        $canEdit = $validated['role'] === 'property_manager' ? (bool) $request->input('can_edit_applications', false) : false;

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'can_edit_applications' => $canEdit,
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        if ($validated['role'] === 'property_manager') {
            $user->properties()->sync($validated['property_ids'] ?? []);
        } else {
            $user->properties()->detach();
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated successfully!');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $authUser = $request->user();

        // Prevent deleting yourself
        if ($user->id === $authUser->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        // Delete associated applicant records cleanly first
        $applicants = \App\Models\Applicant::where('user_id', $user->id)->get();
        foreach ($applicants as $applicant) {
            $applicant->delete();
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User deleted successfully!');
    }

    /**
     * Change user role.
     */
    public function changeRole(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'role' => 'required|in:user,admin,superadmin,property_manager',
        ]);
        $authUser = $request->user();

        // Prevent changing your own role
        if ($user->id === $authUser->id) {
            return back()->with('error', 'You cannot change your own role.');
        }

        $user->update(['role' => $request->role]);

        return back()->with('success', 'User role updated successfully!');
    }
}
