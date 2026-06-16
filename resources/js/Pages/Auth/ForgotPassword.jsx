import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, ArrowLeft, Home, AlertCircle, CheckCircle, Send } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col sm:justify-center items-center pt-6 sm:pt-0 font-sans selection:bg-brand-light selection:text-brand px-4">
            <Head title="Forgot Password" />

            <div className="w-full sm:max-w-md mt-6 px-8 py-10 bg-white dark:bg-slate-800 shadow-2xl shadow-slate-200 sm:rounded-3xl border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-light rounded-full -mr-16 -mt-16 -z-0"></div>
                
                <div className="relative z-10">
                    <Link href={route('login')} className="inline-flex items-center gap-2 text-slate-400 hover:text-brand transition-colors mb-8 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Login</span>
                    </Link>

                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand">
                            <Home className="text-white w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Reset Password</h1>
                            <p className="text-slate-500 text-sm">We'll email you a reset link</p>
                        </div>
                    </div>

                    <div className="mb-8 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        Forgot your password? No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one.
                    </div>

                    {status && (
                        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm font-medium flex items-center gap-2 animate-fade-in-up">
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
                                    autoFocus
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </div>
                            {errors.email && <div className="mt-2 text-sm text-red-500 flex items-center gap-1.5 font-medium"><AlertCircle className="w-4 h-4" /> {errors.email}</div>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-brand text-white text-lg font-bold hover:bg-brand-dark transition-all hover:translate-y-[-2px] shadow-xl shadow-brand active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
                        >
                            {processing ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>Email Reset Link <Send className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
