import { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { ArrowRight, LogIn, FileText, X, Building2, Home } from 'lucide-react';

export default function GuestLayout({ children }) {
    const { auth } = usePage().props || {};
    const pageUrl = usePage().url;
    const isLoginPage = pageUrl === '/login' || pageUrl?.startsWith('/login');
    const [showCompanyModal, setShowCompanyModal] = useState(false);

    const handleSelectCompany = (companyName) => {
        localStorage.removeItem('rental_application');
        localStorage.removeItem('applicant_id');
        setShowCompanyModal(false);
        if (companyName === 'Excel') {
            router.visit('/rental-application-excel');
        } else {
            router.visit('/rental-application');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-between font-sans selection:bg-[#0e4a81]/20 selection:text-[#0e4a81]">
            {/* Top Navigation Header for Guest Pages */}
            <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                    {/* Brand Bold Attractive Name */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                            Rental <span className="bg-gradient-to-r from-[#0e4a81] via-[#1a5c9e] to-[#2563eb] bg-clip-text text-transparent">Application</span>
                        </span>
                    </Link>

                    {/* Actions: Apply Now Button & Contextual Log In */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowCompanyModal(true)}
                            className="px-5 py-2.5 bg-[#0e4a81] hover:bg-[#0c3f6e] text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-[#0e4a81]/25 flex items-center gap-2 active:scale-95 uppercase tracking-wider"
                        >
                            <FileText className="w-4 h-4" /> Apply Now
                        </button>

                        {(!auth || !auth.user) && !isLoginPage && (
                            <Link
                                href={route('login')}
                                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 active:scale-95 border border-slate-200/80 dark:border-slate-700"
                            >
                                <LogIn className="w-4 h-4 text-[#0e4a81] dark:text-blue-400" /> Log In
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Area - Centered Card */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-md my-auto">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="py-3 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800">
                © {new Date().getFullYear()} Rental Application Portal. All rights reserved.
            </footer>

            {/* ── Start New Application Company Selection Modal ── */}
            {showCompanyModal && (
                <div className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 transition-all overflow-hidden">
                        {/* Accent Top Line */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0e4a81] via-[#1a5c9e] to-[#2563eb]"></div>

                        {/* Close button */}
                        <button
                            onClick={() => setShowCompanyModal(false)}
                            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Modal Header */}
                        <div className="text-center mb-6 pt-2">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0e4a81]/15 to-[#2563eb]/15 dark:bg-blue-950/60 text-[#0e4a81] dark:text-blue-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                                <Building2 className="w-7 h-7 text-[#0e4a81] dark:text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                Start New Application
                            </h2>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                                Select company to start application
                            </p>
                        </div>

                        {/* Company Selection Cards */}
                        <div className="space-y-4">
                            {/* Triumph Option */}
                            <button
                                onClick={() => handleSelectCompany('Triumph')}
                                className="w-full group flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-[#0e4a81] dark:hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition-all text-left shadow-sm"
                            >
                                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden p-1.5 shadow-sm">
                                    <img
                                        src="/Triumph Logo.png"
                                        alt="Triumph Residential"
                                        className="w-full h-full object-contain"
                                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                    />
                                    <div className="hidden w-full h-full items-center justify-center text-[#0e4a81] font-black text-sm">TR</div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-[#0e4a81] dark:group-hover:text-blue-400 transition-colors">
                                        Triumph Residential Services
                                    </h3>
                                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                        Standard Tenant Application Form
                                    </p>
                                </div>

                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-[#0e4a81] group-hover:text-white dark:group-hover:bg-blue-500 flex items-center justify-center transition-all shrink-0">
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </button>

                            {/* Excel Option */}
                            <button
                                onClick={() => handleSelectCompany('Excel')}
                                className="w-full group flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-all text-left shadow-sm"
                            >
                                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden p-1.5 shadow-sm">
                                    <img
                                        src="/Excel Residential - Icon.png"
                                        alt="Excel Residential"
                                        className="w-full h-full object-contain"
                                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                    />
                                    <div className="hidden w-full h-full items-center justify-center text-emerald-600 font-black text-sm">EX</div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                        Excel Residential Services
                                    </h3>
                                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                        Excel Tenant Application Form
                                    </p>
                                </div>

                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-all shrink-0">
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
