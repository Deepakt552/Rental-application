import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Clock, CheckCircle, ArrowRight,
    FileText, PlusCircle, LayoutDashboard,
    AlertCircle, CreditCard,
    Bell, Download, Eye, ChevronRight,
    ShieldCheck, DollarSign, Upload,
    User, MapPin, ExternalLink, Activity,
    Sparkles, ArrowUpRight
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Dashboard({ auth, applicant, notifications, paymentSettings, flash }) {
    const [activeTab, setActiveTab] = useState('overview');
    const { post, processing } = useForm();

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.message) {
            toast.success(flash.message);
        }
    }, [flash]);

    const handlePayment = () => {
        post(route('payment.checkout', { applicant: applicant.id }));
    };

    const isComplete = applicant?.current_step >= 11;
    const isPaid = applicant?.payment_status === 'paid';

    // Calculate progress percentage
    const progress = applicant ? Math.min(100, Math.round(((applicant.current_step - 1) / 10) * 100)) : 0;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Tenant Dashboard" />
            <Toaster position="top-right" />

            <div className="pt-2 pb-1 transition-colors duration-300">
                <div className="max-w-7xl mx-auto w-full space-y-4">

                    {/* ── Compact & Professional Welcome Header ── */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/70 shadow-sm transition-all relative overflow-hidden">
                        {/* Soft Brand Accent Line */}
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0e4a81] dark:bg-blue-500 rounded-l-2xl"></div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-2">
                            {/* Left: Greeting & Property Info */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                                        Welcome back, {auth.user?.name || 'Applicant'}! 👋
                                    </h1>

                                </div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    {applicant ? (
                                        <>Applying for <span className="font-bold text-slate-700 dark:text-slate-200">{applicant.property_name || applicant.company_name || 'Selected Property'}</span></>
                                    ) : (
                                        <>Start your rental application today.</>
                                    )}
                                </p>
                            </div>

                            {/* Right: Progress & Action Shortcut */}
                            {applicant && (
                                <div className="flex items-center gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-700/60">
                                    {/* Progress indicator */}
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Application</span>
                                            <span className="text-xs font-extrabold text-[#0e4a81] dark:text-blue-400">{progress}% Done</span>
                                        </div>
                                        <div className="w-20 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                            <div className="bg-[#0e4a81] dark:bg-blue-500 h-full rounded-full transition-all duration-700" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>

                                    {!isPaid && (
                                        <Link
                                            href={!isComplete ? "/rental-application" : (!applicant.is_consent_completed ? "/consent" : "#")}
                                            onClick={isComplete && applicant.is_consent_completed ? handlePayment : undefined}
                                            className="px-4 py-2 bg-[#0e4a81] hover:bg-[#0c3f6e] text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5 active:scale-95 shrink-0"
                                        >
                                            {!isComplete ? (
                                                <>Continue <ArrowRight className="w-3.5 h-3.5" /></>
                                            ) : (!applicant.is_consent_completed ? (
                                                <>Sign Consent <ArrowRight className="w-3.5 h-3.5" /></>
                                            ) : (
                                                <>{processing ? 'Processing...' : 'Pay Fee'} <ChevronRight className="w-3.5 h-3.5" /></>
                                            ))}
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Top Priority Action Callout Banner ── */}
                    {applicant && !isPaid && (
                        <div className={`p-4 sm:p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md transition-all ${!isComplete
                            ? 'bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5 border-amber-400/50 dark:border-amber-500/40'
                            : (!applicant.is_consent_completed
                                ? 'bg-gradient-to-r from-purple-500/15 via-purple-500/10 to-purple-500/5 border-purple-400/50 dark:border-purple-500/40'
                                : 'bg-gradient-to-r from-blue-500/15 via-blue-500/10 to-blue-500/5 border-blue-400/50 dark:border-blue-500/40')
                            }`}>
                            <div className="flex items-center gap-3.5">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md shrink-0 ${!isComplete
                                    ? 'bg-amber-500 text-white shadow-amber-500/30'
                                    : (!applicant.is_consent_completed
                                        ? 'bg-purple-600 text-white shadow-purple-600/30'
                                        : 'bg-[#0e4a81] text-white shadow-[#0e4a81]/30')
                                    }`}>
                                    {!isComplete ? <AlertCircle className="w-6 h-6" /> :
                                        (!applicant.is_consent_completed ? <ShieldCheck className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />)}
                                </div>
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                                            {!isComplete ? 'Resume Your Rental Application' :
                                                (!applicant.is_consent_completed ? 'Legal Consent Form Signature Required' : 'Final Action: Complete Screening Fee Payment')}
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                                            Action Required
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-normal">
                                        {!isComplete
                                            ? `You are currently at Step ${applicant.current_step} of 10. Click the button to continue your form without losing any details.`
                                            : (!applicant.is_consent_completed
                                                ? 'Your application details are saved. Please sign your background screening consent form to proceed.'
                                                : 'Application form & consent signed! Pay your screening fee to send your file to review.')}
                                    </p>
                                </div>
                            </div>

                            {!isComplete ? (
                                <Link
                                    href="/rental-application"
                                    className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl transition-all shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 text-xs uppercase tracking-wider shrink-0 active:scale-95"
                                >
                                    Resume Application <ArrowRight className="w-4 h-4" />
                                </Link>
                            ) : (!applicant.is_consent_completed ? (
                                <Link
                                    href="/consent"
                                    className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 text-xs uppercase tracking-wider shrink-0 active:scale-95"
                                >
                                    Sign Consent Form <ArrowRight className="w-4 h-4" />
                                </Link>
                            ) : (
                                <button
                                    onClick={handlePayment}
                                    disabled={processing}
                                    className="w-full sm:w-auto px-5 py-2.5 bg-[#0e4a81] hover:bg-[#0c3f6e] text-white font-extrabold rounded-xl transition-all shadow-md shadow-[#0e4a81]/25 flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50 shrink-0 active:scale-95"
                                >
                                    {processing ? 'Processing...' : 'Pay Screening Fee'}
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ── Key Metrics Overview ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Application Status Card */}
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</span>
                                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Activity className="w-4 h-4" />
                                </div>
                            </div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white capitalize tracking-tight">
                                {applicant?.status || 'No Active Form'}
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                {applicant ? `Step ${applicant.current_step || 1} of 10` : 'Click below to begin'}
                            </p>
                        </div>

                        {/* Documents Uploaded Card */}
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Documents</span>
                                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <FileText className="w-4 h-4" />
                                </div>
                            </div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                                {applicant?.documents?.length || 0} Files Uploaded
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                Paystub, ID & Proof of Income
                            </p>
                        </div>

                        {/* Payment Status Card */}
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Screening Fee</span>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform ${isPaid ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'}`}>
                                    <DollarSign className="w-4 h-4" />
                                </div>
                            </div>
                            <h3 className={`text-base font-black capitalize tracking-tight ${isPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                {applicant?.payment_status || 'Unpaid'}
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                {isPaid ? 'Payment Received' : 'Fee Pending Checkout'}
                            </p>
                        </div>

                        {/* Last Activity Card */}
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Last Activity</span>
                                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Clock className="w-4 h-4" />
                                </div>
                            </div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight truncate">
                                {applicant?.updated_at ? new Date(applicant.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                System Auto-saved
                            </p>
                        </div>
                    </div>

                    {/* ── Main Full-Width Content Section ── */}



                            {/* Interactive Data Tabs Section */}
                            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
                                {/* Navigation Segmented Tabs */}
                                <div className="px-6 sm:px-8 pt-6 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50">
                                    <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
                                        {[
                                            { id: 'overview', label: 'Summary', icon: LayoutDashboard },
                                            { id: 'documents', label: 'Documents', icon: FileText, count: applicant?.documents?.length || 0 },
                                            { id: 'payments', label: 'Payments', icon: CreditCard, count: applicant?.payments?.length || 0 }
                                        ].map((tab) => {
                                            const Icon = tab.icon;
                                            const isActive = activeTab === tab.id;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id)}
                                                    className={`pb-4 text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all relative whitespace-nowrap ${isActive
                                                        ? 'text-[#0e4a81] dark:text-blue-400'
                                                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                                        }`}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    <span>{tab.label}</span>
                                                    {tab.count > 0 && (
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-blue-100 text-[#0e4a81] dark:bg-blue-900/60 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                                            {tab.count}
                                                        </span>
                                                    )}
                                                    {isActive && (
                                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0e4a81] dark:bg-blue-400 rounded-full"></div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="p-6 sm:p-8">
                                    {/* Overview Tab Content */}
                                    {activeTab === 'overview' && (
                                        <div className="space-y-8 animate-in fade-in duration-300">
                                            {applicant ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                                    {/* Personal Profile Summary */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                                                <User className="w-4 h-4" />
                                                            </div>
                                                            <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">Personal Profile</h4>
                                                        </div>
                                                        <div className="bg-slate-50/70 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/60 space-y-3.5">
                                                            <div className="flex justify-between items-center text-xs">
                                                                <span className="text-slate-500 dark:text-slate-400 font-medium">Full Name</span>
                                                                <span className="font-bold text-slate-900 dark:text-white">{applicant.summary?.personal_info?.first_name} {applicant.summary?.personal_info?.last_name}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-xs">
                                                                <span className="text-slate-500 dark:text-slate-400 font-medium">Primary Email</span>
                                                                <span className="font-bold text-slate-900 dark:text-white">{applicant.summary?.personal_info?.email || applicant.email}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-xs">
                                                                <span className="text-slate-500 dark:text-slate-400 font-medium">Phone</span>
                                                                <span className="font-bold text-slate-900 dark:text-white">{applicant.summary?.personal_info?.phone || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Residence Info Summary */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
                                                                <MapPin className="w-4 h-4" />
                                                            </div>
                                                            <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">Residence Info</h4>
                                                        </div>
                                                        <div className="bg-slate-50/70 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/60 space-y-3.5">
                                                            <div className="flex justify-between items-center text-xs">
                                                                <span className="text-slate-500 dark:text-slate-400 font-medium">Applying Property</span>
                                                                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[160px]">{applicant.property_name || applicant.company_name || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-xs">
                                                                <span className="text-slate-500 dark:text-slate-400 font-medium">Current State</span>
                                                                <span className="font-bold text-slate-900 dark:text-white">{applicant.summary?.current_address?.state || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-xs">
                                                                <span className="text-slate-500 dark:text-slate-400 font-medium">Monthly Rent</span>
                                                                <span className="font-bold text-slate-900 dark:text-white">${applicant.summary?.current_address?.monthly_rent || '0.00'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Documents & Download Shortcuts */}
                                                    <div className="md:col-span-2 space-y-4 pt-2">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                                                                <ShieldCheck className="w-4 h-4" />
                                                            </div>
                                                            <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">Generated Official Forms</h4>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {/* Application PDF Card */}
                                                            <div className="bg-slate-50/70 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 flex flex-col justify-between gap-3 hover:shadow-lg transition-all">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                                                        <FileText className="w-5 h-5" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-xs font-black text-slate-800 dark:text-white tracking-tight">Application Summary</p>
                                                                        <a
                                                                            href={route('application.pdf', applicant.id)}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="text-[10px] text-[#0e4a81] dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1 mt-0.5"
                                                                        >
                                                                            View PDF <ExternalLink className="w-3 h-3" />
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                                {!isPaid && (
                                                                    <Link
                                                                        href={`/rental-application?applicant_id=${applicant.id}`}
                                                                        className="w-full py-2 bg-[#0e4a81]/10 hover:bg-[#0e4a81] text-[#0e4a81] hover:text-white text-center text-xs font-bold rounded-xl transition-all"
                                                                    >
                                                                        Edit Application
                                                                    </Link>
                                                                )}
                                                            </div>

                                                            {/* Consent PDF Card */}
                                                            {applicant.is_consent_completed ? (
                                                                <div className="bg-slate-50/70 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 flex flex-col justify-between gap-3 hover:shadow-lg transition-all">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                                                            <ShieldCheck className="w-5 h-5" />
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <p className="text-xs font-black text-slate-800 dark:text-white tracking-tight">Legal Consent Form</p>
                                                                            <a
                                                                                href={route('application.consent.pdf', applicant.id)}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1 mt-0.5"
                                                                            >
                                                                                View Signed PDF <ExternalLink className="w-3 h-3" />
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                    {!isPaid && isComplete && (
                                                                        <Link
                                                                            href="/consent"
                                                                            className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-700 hover:text-white text-center text-xs font-bold rounded-xl transition-all"
                                                                        >
                                                                            Edit Consent
                                                                        </Link>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                !isPaid && isComplete && (
                                                                    <div className="bg-slate-50/70 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 flex flex-col justify-between gap-3">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                                                                <ShieldCheck className="w-5 h-5" />
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-xs font-black text-slate-800 dark:text-white tracking-tight">Legal Consent</p>
                                                                                <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase">Pending Signature</p>
                                                                            </div>
                                                                        </div>
                                                                        <Link
                                                                            href="/consent"
                                                                            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-center text-xs font-bold rounded-xl transition-all shadow-md shadow-purple-600/20"
                                                                        >
                                                                            Sign Consent Form
                                                                        </Link>
                                                                    </div>
                                                                )
                                                            )}

                                                            {/* All Files Shortcut */}
                                                            <button
                                                                onClick={() => setActiveTab('documents')}
                                                                className="bg-slate-50/70 dark:bg-slate-800/60 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center gap-3 hover:bg-white dark:hover:bg-slate-700 transition-all text-left group"
                                                            >
                                                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-400 group-hover:text-[#0e4a81] dark:group-hover:text-blue-400 flex items-center justify-center shrink-0 transition-colors">
                                                                    <PlusCircle className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-black text-slate-800 dark:text-white tracking-tight">View Uploaded Files</p>
                                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{applicant.documents?.length || 0} Total Attachments</p>
                                                                </div>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                                    <PlusCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                                    <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-1">No Active Application</h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">Start your rental application today to find your new home.</p>
                                                    <Link
                                                        href="/rental-application"
                                                        className="px-6 py-2.5 bg-[#0e4a81] hover:bg-[#0c3f6e] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#0e4a81]/20 inline-flex items-center gap-2"
                                                    >
                                                        Start Application <ArrowRight className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Documents Tab Content */}
                                    {activeTab === 'documents' && (
                                        <div className="space-y-6 animate-in fade-in duration-300">
                                            {applicant?.documents?.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {applicant.documents.map((doc) => (
                                                        <div key={doc.id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl transition-all flex items-center justify-between gap-4 group">
                                                            <div className="flex items-center gap-3.5 min-w-0">
                                                                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[#0e4a81] dark:text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                                                                    <FileText className="w-6 h-6" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-xs font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{doc.type?.replace(/_/g, ' ')}</p>
                                                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{doc.name?.split('.').pop() || 'FILE'} • Attached</p>
                                                                </div>
                                                            </div>
                                                            <a
                                                                href={doc.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-[#0e4a81] hover:border-[#0e4a81] dark:hover:text-blue-400 transition-all shrink-0"
                                                                title="Preview Document"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                                    <Upload className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                                    <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-1">No Documents Uploaded</h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Complete your application steps to attach paystubs, ID & bank statements.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Payments Tab Content */}
                                    {activeTab === 'payments' && (
                                        <div className="space-y-6 animate-in fade-in duration-300">
                                            {applicant?.payments?.length > 0 ? (
                                                <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-700">
                                                    <table className="w-full text-left">
                                                        <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-700">
                                                            <tr>
                                                                <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction</th>
                                                                <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                                                <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                                                <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Receipt</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                                            {applicant.payments.map((p) => (
                                                                <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                                                    <td className="px-5 py-4">
                                                                        <div className="flex items-center gap-2.5">
                                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                                                <CreditCard className="w-4 h-4" />
                                                                            </div>
                                                                            <span className="text-xs font-extrabold text-slate-800 dark:text-white font-mono">#PAY-{p.id}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-5 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                                        {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                    </td>
                                                                    <td className="px-5 py-4 text-xs font-black text-slate-900 dark:text-white">${p.amount}</td>
                                                                    <td className="px-5 py-4 text-right">
                                                                        {p.status === 'completed' ? (
                                                                            <a
                                                                                href={route('payment.invoice', p.id)}
                                                                                target="_blank"
                                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold hover:bg-[#0e4a81] hover:text-white transition-all"
                                                                            >
                                                                                <Download className="w-3 h-3" /> Invoice
                                                                            </a>
                                                                        ) : (
                                                                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">{p.status}</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                                    <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                                    <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-1">No Transactions Yet</h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Transaction history will appear here once screening fee payment is completed.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                    {/* ── Compact Dashboard Footer ── */}
                    <footer className="mt-4 pt-3 pb-1 border-t border-slate-200/60 dark:border-slate-800/60 text-center text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                        © {new Date().getFullYear()} <span className="font-extrabold text-slate-700 dark:text-slate-300">Rental Application Portal</span>. All rights reserved.
                    </footer>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
