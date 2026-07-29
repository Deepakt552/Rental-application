import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { User, Mail, Lock, UserPlus, AlertCircle, ShieldCheck } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <GuestLayout>
            <Head title="Register Account" />

            <div className="w-full bg-white dark:bg-slate-800 shadow-2xl shadow-slate-900/10 rounded-3xl border border-slate-100 dark:border-slate-700/80 p-6 sm:p-8 relative overflow-hidden transition-all">
                {/* Accent Top Line */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0e4a81] via-[#1a5c9e] to-[#2563eb]"></div>

                <div className="relative z-10 space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-[#0e4a81] text-white flex items-center justify-center shadow-md shadow-[#0e4a81]/25 shrink-0">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create Account</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sign up to manage your application</p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Full Name
                            </label>
                            <div className="relative group">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0e4a81] transition-colors" />
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#0e4a81]/20 focus:border-[#0e4a81] text-xs text-slate-900 dark:text-white placeholder-slate-400 transition-all outline-none"
                                    placeholder="John Doe"
                                    autoComplete="name"
                                    autoFocus
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-1 text-[11px] text-red-500 font-bold flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Email Address
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0e4a81] transition-colors" />
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#0e4a81]/20 focus:border-[#0e4a81] text-xs text-slate-900 dark:text-white placeholder-slate-400 transition-all outline-none"
                                    placeholder="name@example.com"
                                    autoComplete="username"
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-[11px] text-red-500 font-bold flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0e4a81] transition-colors" />
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#0e4a81]/20 focus:border-[#0e4a81] text-xs text-slate-900 dark:text-white placeholder-slate-400 transition-all outline-none"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-[11px] text-red-500 font-bold flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Password Confirmation */}
                        <div>
                            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Confirm Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0e4a81] transition-colors" />
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#0e4a81]/20 focus:border-[#0e4a81] text-xs text-slate-900 dark:text-white placeholder-slate-400 transition-all outline-none"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                />
                            </div>
                            {errors.password_confirmation && (
                                <p className="mt-1 text-[11px] text-red-500 font-bold flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.password_confirmation}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full mt-2 py-3 px-4 bg-[#0e4a81] hover:bg-[#0c3f6e] text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-[#0e4a81]/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 uppercase tracking-wider"
                        >
                            {processing ? (
                                <span>Creating Account...</span>
                            ) : (
                                <>Create Account <UserPlus className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700/80 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Already registered?{' '}
                            <Link
                                href={route('login')}
                                className="font-extrabold text-[#0e4a81] dark:text-blue-400 hover:underline"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}