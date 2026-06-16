import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { User, Mail, Lock, UserPlus, ArrowLeft, Home, AlertCircle } from 'lucide-react';

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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col sm:justify-center items-center pt-6 sm:pt-0 font-sans selection:bg-brand-light selection:text-brand px-4">
            <Head title="Register" />

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
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Get Started</h1>
                            <p className="text-slate-500 text-sm">Create an account to start your application</p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand transition-colors" />
                                <input
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-brand-light focus:border-brand transition-all outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                    placeholder="John Doe"
                                    autoComplete="name"
                                    autoFocus
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                            </div>
                            {errors.name && <div className="mt-2 text-sm text-red-500 flex items-center gap-1.5 font-medium"><AlertCircle className="w-4 h-4" /> {errors.name}</div>}
                        </div>

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
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                            </div>
                            {errors.email && <div className="mt-2 text-sm text-red-500 flex items-center gap-1.5 font-medium"><AlertCircle className="w-4 h-4" /> {errors.email}</div>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand transition-colors" />
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-brand-light focus:border-brand transition-all outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                            </div>
                            {errors.password && <div className="mt-2 text-sm text-red-500 flex items-center gap-1.5 font-medium"><AlertCircle className="w-4 h-4" /> {errors.password}</div>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand transition-colors" />
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-brand-light focus:border-brand transition-all outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                />
                            </div>
                            {errors.password_confirmation && <div className="mt-2 text-sm text-red-500 flex items-center gap-1.5 font-medium"><AlertCircle className="w-4 h-4" /> {errors.password_confirmation}</div>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-brand text-white text-lg font-bold hover:bg-brand-dark transition-all hover:translate-y-[-2px] shadow-xl shadow-brand active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 mt-2"
                        >
                            {processing ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>Create Account <UserPlus className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700 text-center">
                        <p className="text-slate-500 text-sm">
                            Already have an account?{' '}
                            <Link
                                href={route('login')}
                                className="font-bold text-brand hover:text-brand-dark transition-colors"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}