import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Save, ArrowLeft, Mail, Lock, User as UserIcon, Shield, Building, Search, X } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit({ user, properties = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        role: user.role,
        property_ids: user.property_ids || [],
        can_edit_applications: Boolean(user.can_edit_applications),
    });

    const [showPassword, setShowPassword] = useState(false);
    const [propertySearch, setPropertySearch] = useState('');

    const toggleProperty = (id) => {
        const current = data.property_ids || [];
        if (current.includes(id)) {
            setData('property_ids', current.filter(pId => pId !== id));
        } else {
            setData('property_ids', [...current, id]);
        }
    };

    const selectAllFiltered = () => {
        const filteredIds = filteredProperties.map(p => p.id);
        const merged = Array.from(new Set([...(data.property_ids || []), ...filteredIds]));
        setData('property_ids', merged);
    };

    const clearAllProperties = () => {
        setData('property_ids', []);
    };

    const filteredProperties = properties.filter(p => {
        const term = propertySearch.toLowerCase();
        return (
            p.property_name?.toLowerCase().includes(term) ||
            p.property_code?.toLowerCase().includes(term) ||
            p.company_name?.toLowerCase().includes(term)
        );
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/admin/users/${user.id}`);
    };

    return (
        <AuthenticatedLayout>
            <div className="py-6 min-h-screen bg-slate-50 dark:bg-slate-900">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header with Back Button */}
                    <div className="mb-6 flex items-center gap-4">
                        <button
                            onClick={() => router.get('/admin/users')}
                            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Edit User</h1>
                    </div>

                    {/* Main Form Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {/* Card Header with Gradient */}
                        <div className="bg-gradient-to-r from-[#0e4a81] to-[#1a5c9e] dark:from-[#1a5c9e] dark:to-[#0e4a81] px-6 py-4">
                            <div className="flex items-center gap-2">
                                <UserIcon className="h-5 w-5 text-white" />
                                <h2 className="text-lg font-semibold text-white">Edit User Information</h2>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Full Name Field */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="pl-10 w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-[#0e4a81] focus:border-[#0e4a81] dark:focus:ring-[#5a9bd5] dark:focus:border-[#5a9bd5] transition-colors"
                                        required
                                    />
                                </div>
                                {errors.name && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.name}</p>}
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="pl-10 w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-[#0e4a81] focus:border-[#0e4a81] dark:focus:ring-[#5a9bd5] dark:focus:border-[#5a9bd5] transition-colors"
                                        required
                                    />
                                </div>
                                {errors.email && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.email}</p>}
                            </div>

                            {/* Password Section with Toggle */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-sm text-[#0e4a81] dark:text-[#5a9bd5] hover:text-[#0b3a6a] dark:hover:text-[#7ab3d4] transition-colors font-medium"
                                    >
                                        {showPassword ? 'Cancel' : 'Change Password'}
                                    </button>
                                </div>
                                {showPassword && (
                                    <div className="space-y-4 mt-2">
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
                                            <input
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className="pl-10 w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-[#0e4a81] focus:border-[#0e4a81] dark:focus:ring-[#5a9bd5] dark:focus:border-[#5a9bd5] transition-colors"
                                                placeholder="New password (leave blank to keep current)"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
                                            <input
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className="pl-10 w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-[#0e4a81] focus:border-[#0e4a81] dark:focus:ring-[#5a9bd5] dark:focus:border-[#5a9bd5] transition-colors"
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                    </div>
                                )}
                                {errors.password && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.password}</p>}
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="pl-10 w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-[#0e4a81] focus:border-[#0e4a81] dark:focus:ring-[#5a9bd5] dark:focus:border-[#5a9bd5] transition-colors"
                                    >
                                        <option value="user">Regular User</option>
                                        <option value="admin">Administrator</option>
                                        <option value="superadmin">Super Admin</option>
                                        <option value="property_manager">Property Manager</option>
                                    </select>
                                </div>
                            </div>

                            {/* Property Selection for Property Manager */}
                            {data.role === 'property_manager' && (
                                <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/20 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                                            Assign Properties <span className="text-red-500">*</span>
                                        </label>
                                        <span className="text-xs text-sky-700 dark:text-sky-400 font-semibold">
                                            {data.property_ids?.length || 0} propert{data.property_ids?.length === 1 ? 'y' : 'ies'} selected
                                        </span>
                                    </div>

                                    {/* Selected Properties Badges */}
                                    {data.property_ids?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {data.property_ids.map(id => {
                                                const prop = properties.find(p => p.id === id);
                                                if (!prop) return null;
                                                return (
                                                    <span
                                                        key={id}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#0e4a81] text-white shadow-2xs"
                                                    >
                                                        <Building className="w-3.5 h-3.5" />
                                                        {prop.property_name}
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleProperty(id)}
                                                            className="ml-1 hover:text-red-300 transition-colors cursor-pointer"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Search input for properties */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search properties by name or code..."
                                            value={propertySearch}
                                            onChange={(e) => setPropertySearch(e.target.value)}
                                            className="pl-9 pr-3 py-1.5 w-full text-xs rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-[#0e4a81] focus:border-[#0e4a81]"
                                        />
                                    </div>

                                    {/* Quick select buttons */}
                                    <div className="flex items-center justify-between text-xs">
                                        <button
                                            type="button"
                                            onClick={selectAllFiltered}
                                            className="text-[#0e4a81] dark:text-sky-400 font-bold hover:underline cursor-pointer"
                                        >
                                            Select All ({filteredProperties.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={clearAllProperties}
                                            className="text-slate-500 dark:text-slate-400 font-bold hover:underline cursor-pointer"
                                        >
                                            Clear All
                                        </button>
                                    </div>

                                    {/* Properties checklist */}
                                    <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                        {filteredProperties.length === 0 ? (
                                            <div className="p-3 text-center text-xs text-slate-400">
                                                No properties match your search
                                            </div>
                                        ) : (
                                            filteredProperties.map(property => {
                                                const isSelected = data.property_ids?.includes(property.id);
                                                return (
                                                    <label
                                                        key={property.id}
                                                        className={`flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs transition-colors ${
                                                            isSelected ? 'bg-sky-50/60 dark:bg-sky-950/40 font-bold' : ''
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleProperty(property.id)}
                                                                className="rounded border-slate-300 text-[#0e4a81] focus:ring-[#0e4a81] h-4 w-4"
                                                            />
                                                            <div className="truncate">
                                                                <span className="text-slate-800 dark:text-slate-200">{property.property_name}</span>
                                                                {property.property_code && (
                                                                    <span className="ml-1.5 text-[10px] text-slate-400">({property.property_code})</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {property.company_name && (
                                                            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                                                                {property.company_name}
                                                            </span>
                                                        )}
                                                    </label>
                                                );
                                            })
                                        )}
                                    </div>

                                    {errors.property_ids && (
                                        <p className="text-xs text-red-500 font-bold">{errors.property_ids}</p>
                                    )}
                                </div>
                            )}

                            {/* Application Editing Permission for Property Manager */}
                            {data.role === 'property_manager' && (
                                <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/40 dark:bg-indigo-950/20">
                                    <div className="flex items-start gap-3">
                                        <div className="pt-0.5">
                                            <input
                                                type="checkbox"
                                                id="can_edit_applications"
                                                checked={!!data.can_edit_applications}
                                                onChange={(e) => setData('can_edit_applications', e.target.checked)}
                                                className="h-4 w-4 rounded border-slate-300 text-[#0e4a81] focus:ring-[#0e4a81] cursor-pointer"
                                            />
                                        </div>
                                        <label htmlFor="can_edit_applications" className="text-sm cursor-pointer select-none">
                                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                                                Allow Property Manager to edit application details
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                                                By default, editing is disabled (read-only mode). Check this box to allow this property manager to edit application details, move-in status, comments, upload/delete documents, and manage reminders.
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Form Actions */}
                            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => router.get('/admin/users')}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-gradient-to-r from-[#0e4a81] to-[#1a5c9e] dark:from-[#1a5c9e] dark:to-[#0e4a81] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all font-medium shadow-sm hover:shadow-md flex items-center gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}