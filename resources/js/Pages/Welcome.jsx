import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import {
    Home,
    ArrowRight,
    UserPlus,
    LogIn,
    Clock,
    ShieldCheck,
    X,
    Building2,
    Search,
    CheckCircle2
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Welcome({ auth }) {

    const [showModal, setShowModal] = useState(false);

    const handleSelectCompany = (companyName) => {
        localStorage.removeItem('rental_application');
        localStorage.removeItem('applicant_id');
        if (companyName === 'Excel') {
            router.visit('/rental-application-excel');
        } else {
            router.visit('/rental-application');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col sm:justify-center items-center pt-6 sm:pt-0 font-sans px-4">

            <Head title="Welcome to Rental Application" />

            <div className="w-full sm:max-w-xl mt-6 px-8 py-10 bg-white shadow-2xl shadow-slate-200 sm:rounded-3xl border border-slate-100 relative overflow-hidden">

                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-light rounded-full -mr-16 -mt-16 -z-0"></div>

                <div className="relative z-10 text-center">

                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand">
                            <Home className="text-white w-8 h-8" />
                        </div>
                    </div>
                    

                    <h1 className="text-3xl font-black text-slate-900 mb-2">
                        Rental <span className="text-brand">Application</span>
                    </h1>

                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                        Your professional gateway to a new home.
                    </p>

                    <div className="grid grid-cols-1 gap-4 mb-10">

                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="w-full inline-flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-brand text-white text-lg font-bold"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="w-full inline-flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-brand text-white text-lg font-bold"
                                >
                                    Start New Application
                                    <ArrowRight className="w-5 h-5" />
                                </button>

                                <div className="grid grid-cols-2 gap-4">

                                    <Link
                                        href={route('login')}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-50 text-slate-900 font-bold border border-slate-200"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        Sign In
                                    </Link>

                                    <Link
                                        href={route('register')}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white text-brand font-bold border border-brand-light"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        Register
                                    </Link>

                                </div>
                            </>
                        )}

                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-100 text-left">

                        <div className="flex gap-3">
                            <Clock className="w-5 h-5 text-brand flex-shrink-0" />
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">
                                    Save & Resume
                                </h4>
                                <p className="text-xs text-slate-500">
                                    Pick up exactly where you left off.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">
                                    Secure Vault
                                </h4>
                                <p className="text-xs text-slate-500">
                                    Your data is encrypted & safe.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                     <Toaster position="top-right" />

                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    ></div>

                    <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">

                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-8">

                            <h2 className="text-3xl font-black text-slate-900 text-center mb-2">
                                Start New Application
                            </h2>

                            <p className="text-center text-slate-500">
                                Select company to start application
                            </p>

                        </div>

                        {/* Company Selection */}
                        <div className="grid grid-cols-1 gap-4 mb-6">

                            <button
                                onClick={() => handleSelectCompany('Excel')}
                                className="group flex items-center gap-4 p-6 rounded-2xl border-2 border-slate-100 hover:border-green-600 hover:bg-green-50 transition-all text-left"
                            >
                                <div className="w-14 h-14 rounded-xl bg-white border border-slate-100 flex items-center justify-center">
                                    <img
                                        src="/Excel Residential - Icon.png"
                                        className="w-full h-full object-contain p-2"
                                    />
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900">
                                        Excel Residential Services
                                    </h3>
                                </div>

                                <ArrowRight className="w-5 h-5 text-green-600" />
                            </button>

                            <button
                                onClick={() => handleSelectCompany('Triumph')}
                                className="group flex items-center gap-4 p-6 rounded-2xl border-2 border-slate-100 hover:border-brand hover:bg-brand-light transition-all text-left"
                            >
                                <div className="w-14 h-14 rounded-xl bg-white border border-slate-100 flex items-center justify-center">
                                    <img
                                        src="/Triumph Logo.png"
                                        className="w-full h-full object-contain p-2"
                                    />
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900">
                                        Triumph Residential Services
                                    </h3>
                                </div>

                                <ArrowRight className="w-5 h-5 text-brand" />
                            </button>

                        </div>

                    </div>

                </div>
            )}

            <p className="mt-8 text-slate-400 text-sm font-medium">
                © 2026 Rental Property Management.
            </p>

        </div>
    );
}