import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function Cancel({ auth, applicant }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Payment Cancelled</h2>}
        >
            <Head title="Payment Cancelled" />

            <div className="py-12 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-64px)]">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 p-12 text-center animate-fade-in-up">
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <XCircle className="w-12 h-12 text-red-500" />
                        </div>
                        
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Payment Cancelled</h1>
                        <p className="text-xl text-slate-500 dark:text-slate-400 mb-12">
                            The payment process was not completed. Your application is still saved, but we cannot begin the screening process until the fee is paid.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                            >
                                <ArrowLeft className="w-5 h-5" /> Return to Dashboard
                            </Link>
                            <button 
                                onClick={() => window.history.back()}
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand text-white font-bold rounded-2xl hover:bg-brand-dark transition-all shadow-lg shadow-brand/20"
                            >
                                <RefreshCw className="w-5 h-5" /> Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
