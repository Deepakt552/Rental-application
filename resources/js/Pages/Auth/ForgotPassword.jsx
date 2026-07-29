import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Send, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

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
                            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Reset Password</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">We'll send you a recovery link</p>
                        </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Forgot your password? Enter your registered email address below and we'll send you a secure link to reset it.
                    </p>

                    {status && (
                        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                            <span>{status}</span>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
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
                                    autoFocus
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-[11px] text-red-500 font-bold flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.email}
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
                                <span>Sending Link...</span>
                            ) : (
                                <>Send Reset Link <Send className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    {/* Back to Login Link */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700/80 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Remember your password?{' '}
                            <Link
                                href={route('login')}
                                className="font-extrabold text-[#0e4a81] dark:text-blue-400 hover:underline"
                            >
                                Back to Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
