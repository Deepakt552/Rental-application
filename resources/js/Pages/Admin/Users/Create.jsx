import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { UserPlus, ArrowLeft, Mail, Lock, User as UserIcon, Shield } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
    });

    console.log('Form Data:', data);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/users');
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
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Create New User</h1>
                    </div>

                    {/* Main Form Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {/* Card Header with Gradient */}
                        <div className="bg-gradient-to-r from-[#0e4a81] to-[#1a5c9e] dark:from-[#1a5c9e] dark:to-[#0e4a81] px-6 py-4">
                            <div className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5 text-white" />
                                <h2 className="text-lg font-semibold text-white">User Information</h2>
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
                                        placeholder="Enter full name"
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
                                        placeholder="user@example.com"
                                        required
                                    />
                                </div>
                                {errors.email && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.email}</p>}
                            </div>

                            {/* Password Fields Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="pl-10 w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-[#0e4a81] focus:border-[#0e4a81] dark:focus:ring-[#5a9bd5] dark:focus:border-[#5a9bd5] transition-colors"
                                            placeholder="Minimum 8 characters"
                                            required
                                        />
                                    </div>
                                    {errors.password && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Confirm Password <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
                                        <input
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className="pl-10 w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-[#0e4a81] focus:border-[#0e4a81] dark:focus:ring-[#5a9bd5] dark:focus:border-[#5a9bd5] transition-colors"
                                            placeholder="Confirm password"
                                            required
                                        />
                                    </div>
                                </div>
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
                                    </select>
                                </div>
                            </div>

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
                                    className="px-4 py-2 bg-gradient-to-r from-[#0e4a81] to-[#1a5c9e] dark:from-[#1a5c9e] dark:to-[#0e4a81] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all font-medium shadow-sm hover:shadow-md"
                                >
                                    {processing ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}