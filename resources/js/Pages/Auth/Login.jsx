import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Lock, LogIn, ArrowLeft, Home, AlertCircle, CheckCircle } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col sm:justify-center items-center pt-6 sm:pt-0 font-sans selection:bg-brand-light selection:text-brand">
            <Head title="Log in" />

            <div className="w-full sm:max-w-md mt-6 px-8 py-10 bg-white dark:bg-slate-800 shadow-2xl shadow-slate-200 sm:rounded-3xl border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-light rounded-full -mr-16 -mt-16 -z-0"></div>
                
                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand transition-colors mb-8 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Home</span>
                    </Link>

                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand">
                            <Home className="text-white w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome Back</h1>
                            <p className="text-slate-500 text-sm">Sign in to continue your application</p>
                        </div>
                    </div>

                    {status && (
                        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm font-medium flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand transition-colors" />
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-brand-light focus:border-brand transition-all outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                    placeholder="name@example.com"
                                    autoComplete="username"
                                    autoFocus
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </div>
                            {errors.email && <div className="mt-2 text-sm text-red-500 flex items-center gap-1.5 font-medium"><AlertCircle className="w-4 h-4" /> {errors.email}</div>}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-xs font-semibold text-brand hover:text-brand-dark transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand transition-colors" />
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-brand-light focus:border-brand transition-all outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                            </div>
                            {errors.password && <div className="mt-2 text-sm text-red-500 flex items-center gap-1.5 font-medium"><AlertCircle className="w-4 h-4" /> {errors.password}</div>}
                        </div>

                        <div className="flex items-center">
                            <label className="flex items-center group cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    className="w-5 h-5 rounded-lg border-slate-300 text-brand focus:ring-brand transition-all cursor-pointer"
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span className="ml-3 text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:text-slate-100 transition-colors">Remember me</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-brand text-white text-lg font-bold hover:bg-brand-dark transition-all hover:translate-y-[-2px] shadow-xl shadow-brand active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
                        >
                            {processing ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>Sign In <LogIn className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700 text-center">
                        <p className="text-slate-500 text-sm">
                            Don't have an account?{' '}
                            <Link
                                href={route('register')}
                                className="font-bold text-brand hover:text-brand-dark transition-colors"
                            >
                                Start Application
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}