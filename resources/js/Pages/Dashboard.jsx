import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Clock, CheckCircle, ArrowRight,
    FileText, PlusCircle, LayoutDashboard,
    AlertCircle, X, Table, CreditCard,
    Bell, Download, Eye, ChevronRight,
    ShieldCheck, DollarSign, Upload,
    User, MapPin, Briefcase, Calendar,
    ExternalLink, Activity
} from 'lucide-react';

export default function Dashboard({ auth, applicant, notifications, paymentSettings }) {
    const [activeTab, setActiveTab] = useState('overview');
    const { post, processing } = useForm();

    const handlePayment = () => {
        post(route('payment.checkout', { applicant: applicant.id }));
    };

    const isComplete = applicant?.current_step >= 10;
    const isPaid = applicant?.payment_status === 'paid';

    // Calculate progress percentage
    const progress = applicant ? Math.round((applicant.current_step / 10) * 100) : 0;

    return (
        <AuthenticatedLayout
            user={auth.user}
        >
            <Head title="Dashboard" />

            <div className="py-8 bg-slate-50/50 dark:bg-slate-800/50 min-h-[calc(100vh-64px)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="mb-6"></div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Application Status</p>
                                    <p className="font-bold text-slate-900 dark:text-white capitalize">{applicant?.status || 'No Active Form'}</p>
                                </div>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-50 dark:bg-blue-900/200 h-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Documents</p>
                                    <p className="font-bold text-slate-900 dark:text-white">{applicant?.documents?.length || 0} Files Uploaded</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPaid ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600'}`}>
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Payment Status</p>
                                    <p className={`font-bold capitalize ${isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                                        {applicant?.payment_status || 'Pending'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Last Updated</p>
                                    <p className="font-bold text-slate-900 dark:text-white">{applicant?.updated_at || 'Just now'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content Area */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Urgent Actions Section */}
                            {applicant && (!isComplete || !applicant.is_consent_completed || !isPaid) && (
                                <div className={`p-8 rounded-2xl border-2 flex flex-col md:flex-row items-center justify-between gap-8 ${!isComplete ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/30' :
                                    (!applicant.is_consent_completed ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30' : 'bg-brand/5 border-brand/10')
                                    }`}>
                                    <div className="flex items-start gap-5">
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${!isComplete ? 'bg-orange-50 dark:bg-orange-900/200 text-white shadow-orange-500/30' :
                                            (!applicant.is_consent_completed ? 'bg-amber-50 dark:bg-amber-900/200 text-white shadow-amber-500/30' : 'bg-brand text-white shadow-brand/30')
                                            }`}>
                                            {!isComplete ? <AlertCircle className="w-7 h-7" /> :
                                                (!applicant.is_consent_completed ? <ShieldCheck className="w-7 h-7" /> : <CreditCard className="w-7 h-7" />)}
                                        </div>
                                        <div>
                                            <h3 className={`text-xl font-black mb-2 ${!isComplete ? 'text-orange-900 dark:text-orange-100' :
                                                (!applicant.is_consent_completed ? 'text-amber-900 dark:text-amber-100' : 'text-brand-dark')
                                                }`}>
                                                {!isComplete ? 'Resume Your Application' :
                                                    (!applicant.is_consent_completed ? 'Legal Consent Required' : 'Final Step: Pay Application Fee')}
                                            </h3>
                                            <p className={`text-sm font-medium leading-relaxed max-w-md ${!isComplete ? 'text-orange-700/80 dark:text-orange-200/80' :
                                                (!applicant.is_consent_completed ? 'text-amber-700/80 dark:text-amber-200/80' : 'text-slate-600 dark:text-slate-300')
                                                }`}>
                                                {!isComplete ? 'You left off at Step ' + applicant.current_step + '. Complete the remaining steps to get your home sooner.' :
                                                    (!applicant.is_consent_completed ? 'Please complete and sign your legal consent forms to proceed with your application.' :
                                                        paymentSettings?.enable_holding_deposit
                                                            ? 'Your application is ready! Pay the screening fee and holding deposit to send it to our review team.'
                                                            : 'Your application is ready! Pay the screening fee to send it to our review team.')}
                                            </p>
                                        </div>
                                    </div>

                                    {!isComplete ? (
                                        <Link href="/rental-application" className="w-full md:w-auto px-8 py-4 bg-orange-50 dark:bg-orange-900/200 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 active:scale-95">
                                            Continue Form <ArrowRight className="w-5 h-5" />
                                        </Link>
                                    ) : (!applicant.is_consent_completed ? (
                                        <Link href="/consent" className="w-full md:w-auto px-8 py-4 bg-amber-50 dark:bg-amber-900/200 text-white font-bold rounded-xl hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95">
                                            Complete Consent <ArrowRight className="w-5 h-5" />
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={handlePayment}
                                            disabled={processing}
                                            className="w-full md:w-auto px-10 py-4 bg-brand text-white font-bold rounded-xl hover:bg-brand-dark transition-all shadow-xl shadow-brand/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                                        >
                                            {processing
                                                ? 'Processing...'
                                                : (paymentSettings?.enable_holding_deposit ? 'Pay Fee & Deposit Now' : 'Pay Fee Now')} <ChevronRight className="w-5 h-5" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Main Interactive Portal */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
                                {/* Navigation Tabs */}
                                <div className="px-8 pt-8 border-b border-slate-50 dark:border-slate-800/50">
                                    <div className="flex items-center gap-8">
                                        {[
                                            { id: 'overview', label: 'Summary', icon: LayoutDashboard },
                                            { id: 'documents', label: 'Documents', icon: FileText },
                                            { id: 'payments', label: 'Payments', icon: CreditCard }
                                        ].map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`pb-6 text-sm font-bold flex items-center gap-2 transition-all relative ${activeTab === tab.id
                                                    ? 'text-brand'
                                                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300'
                                                    }`}
                                            >
                                                <tab.icon className="w-4 h-4" />
                                                {tab.label}
                                                {activeTab === tab.id && (
                                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand rounded-full animate-fade-in"></div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-8">
                                    {/* Tab Content: Overview */}
                                    {activeTab === 'overview' && (
                                        <div className="animate-fade-in space-y-8">
                                            {applicant ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-6">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                                                                <User className="w-5 h-5" />
                                                            </div>
                                                            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Personal Profile</h4>
                                                        </div>
                                                        <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-6 space-y-4">
                                                            <div className="flex justify-between">
                                                                <span className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Full Name</span>
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{applicant.summary.personal_info.first_name} {applicant.summary.personal_info.last_name}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Primary Email</span>
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{applicant.summary.personal_info.email}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Contact Phone</span>
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{applicant.summary.personal_info.phone}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center">
                                                                <MapPin className="w-5 h-5" />
                                                            </div>
                                                            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Residence Info</h4>
                                                        </div>
                                                        <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-6 space-y-4">
                                                            <div className="flex justify-between">
                                                                <span className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Current State</span>
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{applicant.summary.current_address.state}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Monthly Rent</span>
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white">${applicant.summary.current_address.monthly_rent || '0.00'}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Reason for Moving</span>
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{applicant.summary.current_address.reason_for_moving || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="md:col-span-2 space-y-6 mt-4">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center">
                                                                <FileText className="w-5 h-5" />
                                                            </div>
                                                            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Documents & Forms</h4>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            <a
                                                                href={route('application.pdf', applicant.id)}
                                                                target="_blank"
                                                                className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-brand hover:shadow-lg transition-all group"
                                                            >
                                                                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                                    <FileText className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Application</p>
                                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">View PDF</p>
                                                                </div>
                                                            </a>

                                                            {applicant.is_consent_completed && (
                                                                <a
                                                                    href={route('application.consent.pdf', applicant.id)}
                                                                    target="_blank"
                                                                    className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-brand hover:shadow-lg transition-all group"
                                                                >
                                                                    <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                                                        <ShieldCheck className="w-5 h-5" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Consent Form</p>
                                                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">View Signed</p>
                                                                    </div>
                                                                </a>
                                                            )}

                                                            <button
                                                                onClick={() => setActiveTab('documents')}
                                                                className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-600 hover:bg-white dark:bg-slate-800 hover:border-brand hover:shadow-lg transition-all group text-left"
                                                            >
                                                                <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 flex items-center justify-center group-hover:text-brand transition-colors">
                                                                    <PlusCircle className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">View All Files</p>
                                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{applicant.documents?.length || 0} Uploads</p>
                                                                </div>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-20 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-700">
                                                    <PlusCircle className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                                    <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold text-xl mb-2">No active application</p>
                                                    <p className="text-slate-400 dark:text-slate-500 max-w-sm mx-auto mb-8">Start your journey today and find your perfect home with Rental Application.</p>
                                                    <Link href="/rental-application" className="inline-flex items-center gap-2 px-8 py-3 bg-brand text-white font-bold rounded-lg hover:bg-brand-dark transition-all">
                                                        Get Started <ArrowRight className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Tab Content: Documents */}
                                    {activeTab === 'documents' && (
                                        <div className="animate-fade-in">
                                            {applicant?.documents?.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {applicant.documents.map((doc) => (
                                                        <div key={doc.id} className="group p-5 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:bg-slate-800 hover:shadow-2xl hover:shadow-slate-200/50 dark:shadow-none transition-all flex items-center gap-5">
                                                            <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center text-brand group-hover:scale-110 transition-transform">
                                                                <FileText className="w-7 h-7" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight mb-0.5">{doc.type.replace(/_/g, ' ')}</p>
                                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold truncate tracking-wider uppercase">{(doc.name?.split('.').pop() || 'FILE')} FILE • {new Date().toLocaleDateString()}</p>
                                                            </div>
                                                            <a href={doc.url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-brand hover:border-brand flex items-center justify-center transition-all">
                                                                <Eye className="w-5 h-5" />
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-20 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-700">
                                                    <Upload className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                                    <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold text-xl">No documents uploaded</p>
                                                    <p className="text-slate-400 dark:text-slate-500">Complete your application steps to upload files.</p>
                                                </div>
                                            )}

                                            {/* Generated Forms Section */}
                                            {applicant && (
                                                <div className="mt-10">
                                                    <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                        <ShieldCheck className="w-4 h-4 text-brand" /> Generated Application Forms
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* Application PDF */}
                                                        <div className="group p-5 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-2xl hover:shadow-slate-200/50 dark:shadow-none transition-all flex items-center gap-5">
                                                            <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                                <FileText className="w-7 h-7" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight mb-0.5">Application Form</p>
                                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold truncate tracking-wider uppercase">Official PDF Summary</p>
                                                            </div>
                                                            <a
                                                                href={route('application.pdf', applicant.id)}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all"
                                                            >
                                                                <Eye className="w-3 h-3" /> View PDF
                                                            </a>
                                                        </div>

                                                        {/* Consent PDF */}
                                                        {applicant.is_consent_completed && (
                                                            <div className="group p-5 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-2xl hover:shadow-slate-200/50 dark:shadow-none transition-all flex items-center gap-5">
                                                                <div className="w-14 h-14 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                                    <ShieldCheck className="w-7 h-7" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight mb-0.5">Legal Consent Form</p>
                                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold truncate tracking-wider uppercase">Signed Legal Document</p>
                                                                </div>
                                                                <a
                                                                    href={route('application.consent.pdf', applicant.id)}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 text-[10px] font-black hover:bg-amber-600 hover:text-white transition-all"
                                                                >
                                                                    <Eye className="w-3 h-3" /> View PDF
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Tab Content: Payments */}
                                    {activeTab === 'payments' && (
                                        <div className="animate-fade-in">
                                            {applicant?.payments?.length > 0 ? (
                                                <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-700">
                                                    <table className="w-full text-left">
                                                        <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                                                            <tr>
                                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Transaction</th>
                                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Date</th>
                                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Amount</th>
                                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Receipt</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-50">
                                                            {applicant.payments.map((p) => (
                                                                <tr key={p.id} className="group hover:bg-slate-50 dark:bg-slate-800/30 transition-colors">
                                                                    <td className="px-6 py-5">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                                                                                <CreditCard className="w-4 h-4" />
                                                                            </div>
                                                                            <span className="text-xs font-bold text-slate-900 dark:text-white">#PAY-{p.id}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-5 text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500">{p.created_at}</td>
                                                                    <td className="px-6 py-5 text-xs font-black text-slate-900 dark:text-white">${p.amount}</td>
                                                                    <td className="px-6 py-5 text-right">
                                                                        {p.status === 'completed' ? (
                                                                            <a
                                                                                href={route('payment.invoice', p.id)}
                                                                                target="_blank"
                                                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold hover:bg-brand hover:text-white transition-all group-hover:scale-105"
                                                                            >
                                                                                <Download className="w-3 h-3" /> Invoice
                                                                            </a>
                                                                        ) : (
                                                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{p.status}</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="text-center py-20 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-700">
                                                    <DollarSign className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                                    <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold text-xl">No transactions found</p>
                                                    <p className="text-slate-400 dark:text-slate-500">Complete your application fee to see history.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">

                            {/* Notifications Panel */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
                                <div className="p-8 border-b border-slate-50 dark:border-slate-800/50 flex items-center justify-between bg-slate-50 dark:bg-slate-800/30">
                                    <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
                                        <Bell className="w-4 h-4 text-brand" /> Notifications
                                    </h3>
                                    {notifications?.length > 0 && (
                                        <div className="px-2 py-0.5 bg-brand text-white text-[10px] font-black rounded-full shadow-lg shadow-brand/30">
                                            {notifications.length}
                                        </div>
                                    )}
                                </div>
                                <div className="max-h-[450px] overflow-y-auto no-scrollbar">
                                    {notifications?.length > 0 ? (
                                        <div className="divide-y divide-slate-50">
                                            {notifications.map((n) => (
                                                <div key={n.id} className="p-6 hover:bg-slate-50 dark:bg-slate-800 transition-all cursor-pointer group border-l-4 border-transparent hover:border-brand">
                                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 group-hover:text-brand transition-colors leading-relaxed">
                                                        {n.data.message || 'Payment Successful'}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1.5">
                                                        <Clock className="w-3 h-3" /> {new Date(n.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center">
                                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Bell className="w-8 h-8 text-slate-200" />
                                            </div>
                                            <p className="text-sm text-slate-400 dark:text-slate-500 font-bold">You're all caught up!</p>
                                        </div>
                                    )}
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
