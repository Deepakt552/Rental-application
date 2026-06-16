import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, ArrowRight, Download, FileText } from 'lucide-react';

export default function Success({ auth, applicant, payment }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Payment Successful</h2>}
        >
            <Head title="Payment Successful" />

            <div className="py-12 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-64px)]">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 p-12 text-center animate-fade-in-up">
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                        
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Thank You!</h1>
                        <p className="text-xl text-slate-500 dark:text-slate-400 mb-8">
                            Your application fee has been successfully processed. Your application is now being reviewed by our team.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                            <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-600 text-left">
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Applicant</p>
                                <p className="font-bold text-slate-900 dark:text-white">{applicant.email}</p>
                            </div>
                            <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-600 text-left">
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Amount Paid</p>
                                <p className="font-bold text-slate-900 dark:text-white">${payment?.amount || '0.00'} USD</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand text-white font-bold rounded-2xl hover:bg-brand-dark transition-all shadow-lg shadow-brand/20"
                            >
                                Back to Dashboard <ArrowRight className="w-5 h-5" />
                            </Link>
                            <a 
                                href={payment ? route('payment.invoice', payment.id) : '#'} 
                                target="_blank"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                            >
                                <Download className="w-5 h-5" /> View Receipt
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
