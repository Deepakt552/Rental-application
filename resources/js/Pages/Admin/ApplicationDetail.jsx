import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import toast, { Toaster } from 'react-hot-toast';
import {
    ArrowLeft,
    User,
    Home,
    Briefcase,
    Shield,
    PawPrint,
    Car,
    PhoneCall,
    Mail,
    Calendar,
    MapPin,
    DollarSign,
    FileText,
    Eye,
    ShieldCheck,
    AlertCircle,
    Heart,
    Users,
    Clock,
    Award,
    CreditCard,
    Globe,
    Fingerprint,
    Key,
    CheckCircle,
    XCircle,
    Info,
    Phone,
    Building,
    AlertTriangle,
    ChevronRight,
    BadgeCheck,
    Download,
    Hash,
    History,
    Save,
    Send
} from 'lucide-react';

export default function ApplicationDetail({ applicant }) {
    const [activeTab, setActiveTab] = useState('property');
    const [comment, setComment] = useState(applicant.admin_comment || '');
    const [saving, setSaving] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const handleBack = () => {
        router.get('/admin/applications');
    };

    const handleSaveComment = (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        router.post(route('admin.applications.comment', applicant.id), {
            admin_comment: comment
        }, {
            onSuccess: () => {
                setSaving(false);
                setIsNoteModalOpen(false);
                toast.success('Comment saved successfully!');
            },
            onError: () => {
                setSaving(false);
                toast.error('Failed to save comment.');
            }
        });
    };

    const [resending, setResending] = useState(false);

    const handleResend = () => {
        setIsConfirmModalOpen(false);
        setResending(true);
        router.post(route('admin.applications.resend', applicant.id), {}, {
            onSuccess: () => {
                setResending(false);
                toast.success('Application notification resent successfully!');
            },
            onError: () => {
                setResending(false);
                toast.error('Failed to resend application notification.');
            }
        });
    };

    const tabs = [
        { id: 'property', label: 'Property', icon: Building },
        { id: 'personal', label: 'Personal Info', icon: User },
        { id: 'address', label: 'Addresses', icon: Home },
        { id: 'employment', label: 'Employment', icon: Briefcase },
        { id: 'screening', label: 'Screening', icon: Shield },
        { id: 'petsVehicles', label: 'Pets & Vehicles', icon: PawPrint },
        { id: 'emergency', label: 'Emergency Contact', icon: PhoneCall },
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'notes', label: 'Admin Notes', icon: History },
    ];

    const fullName = `${applicant.personal_information?.first_name || ''} ${applicant.personal_information?.middle_name || ''} ${applicant.personal_information?.last_name || ''}`.trim();

    // Helper component for data rows
    const DataGrid = ({ items }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => {
                if (!item.value) return null;
                return (
                    <div key={index} className="bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-white dark:bg-slate-800 hover:shadow-lg hover:shadow-slate-100/50 transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            {item.icon && <item.icon className="w-4 h-4 text-slate-400" />}
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 break-words">{item.value}</p>
                    </div>
                );
            })}
        </div>
    );

    // Helper component for section headers
    const SectionHeader = ({ title, icon: Icon }) => (
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Icon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">{title}</h2>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <div className="py-8 bg-slate-50/50 dark:bg-slate-900/50 min-h-[calc(100vh-64px)]">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 mb-8">
                        <div className="flex flex-col justify-between gap-6">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 w-full">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={handleBack}
                                        className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-[#0e4a81] hover:text-white flex items-center justify-center transition-all shadow-sm active:scale-95"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{fullName || 'N/A'}</h1>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${applicant.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    applicant.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                        'bg-blue-50 text-blue-700 border-blue-100'
                                                }`}>
                                                {applicant.status || 'Draft'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1 flex items-center gap-2">
                                            <span>Application ID: #{applicant.id}</span>
                                            <span>•</span>
                                            <span>Submitted: {new Date(applicant.created_at).toLocaleDateString()}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <div className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center gap-2">
                                        <ShieldCheck className={`w-4 h-4 ${applicant.is_consent_completed ? 'text-green-500' : 'text-slate-400'}`} />
                                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Consent: {applicant.is_consent_completed ? 'Completed' : 'Pending'}</span>
                                    </div>
                                    <div className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center gap-2">
                                        <CreditCard className={`w-4 h-4 ${applicant.payment_status === 'completed' ? 'text-green-500' : 'text-slate-400'}`} />
                                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Payment: {applicant.payment_status || 'Pending'}</span>
                                    </div>
                                    <button
                                        onClick={() => setIsNoteModalOpen(true)}
                                        className="px-4 py-2 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95"
                                    >
                                        <FileText className="w-4 h-4 text-[#0e4a81] dark:text-[#5a9bd5]" />
                                        Add Note
                                    </button>
                                    <button
                                        onClick={() => setIsConfirmModalOpen(true)}
                                        disabled={resending}
                                        className="px-4 py-2 bg-gradient-to-r from-[#0e4a81] to-[#1a5c9e] hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md disabled:opacity-50 active:scale-95"
                                    >
                                        <Send className="w-4 h-4" />
                                        {resending ? 'Resending...' : 'Resend Notification'}
                                    </button>
                                </div>
                            </div>

                            {/* Extra Metadata Row */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2 pt-6 border-t border-slate-100 dark:border-slate-700/60 w-full">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-400">
                                        <Mail className="w-4 h-4 text-[#0e4a81] dark:text-[#5a9bd5]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Email Address</p>
                                        <a href={`mailto:${applicant.personal_information?.email}`} className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#0e4a81] truncate block mt-1">
                                            {applicant.personal_information?.email || 'N/A'}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-400">
                                        <Phone className="w-4 h-4 text-[#0e4a81] dark:text-[#5a9bd5]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Phone Number</p>
                                        <a href={`tel:${applicant.personal_information?.phone}`} className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#0e4a81] truncate block mt-1">
                                            {applicant.personal_information?.phone || 'N/A'}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-400">
                                        <Home className="w-4 h-4 text-[#0e4a81] dark:text-[#5a9bd5]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Property Name</p>
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate block mt-1">
                                            {applicant.property_name || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-400">
                                        <Shield className="w-4 h-4 text-[#0e4a81] dark:text-[#5a9bd5]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Background Screening</p>
                                        <span className={`text-xs font-bold mt-1 block ${
                                            (applicant.screening?.evicted || applicant.screening?.felony || applicant.screening?.legal_case) 
                                                ? 'text-rose-500 font-extrabold' 
                                                : 'text-emerald-600'
                                        }`}>
                                            {(applicant.screening?.evicted || applicant.screening?.felony || applicant.screening?.legal_case) 
                                                ? 'Flags Detected' 
                                                : 'No Flags'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Toaster position="top-right" />
                    
                    <div className="space-y-8">
                        {/* Navigation Tabs */}
                        <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 overflow-x-auto">
                            <div className="flex gap-1.5">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 whitespace-nowrap select-none border border-transparent ${isActive
                                                    ? 'bg-gradient-to-r from-[#0e4a81] to-[#1a5c9e] text-white shadow-md shadow-[#0e4a81]/15 font-extrabold'
                                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 hover:text-slate-800 dark:hover:bg-slate-900/50 dark:hover:text-slate-205 border-slate-100/10'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4 shrink-0" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                    {/* Content Area */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700">

                        {/* Property Info */}
                        {activeTab === 'property' && (
                            <div>
                                <SectionHeader title="Property Information" icon={Building} />
                                <DataGrid items={[
                                    // { label: 'Company Name', value: applicant.company_name, icon: Building },
                                    // { label: 'Property ID', value: applicant.property_id, icon: Hash },
                                    { label: 'Property Name', value: applicant.property_name, icon: Home },
                                    { label: 'Property Type', value: applicant.property_type, icon: Info },
                                    { label: 'Desired Move Date', value: applicant.desired_move_date ? new Date(applicant.desired_move_date).toLocaleDateString() : null, icon: Calendar },
                                ]} />
                            </div>
                        )}

                        {/* Personal Info */}
                        {activeTab === 'personal' && (
                            <div>
                                <SectionHeader title="Personal Information" icon={User} />
                                <DataGrid items={[
                                    { label: 'First Name', value: applicant.personal_information?.first_name, icon: User },
                                    { label: 'Middle Name', value: applicant.personal_information?.middle_name, icon: User },
                                    { label: 'Last Name', value: applicant.personal_information?.last_name, icon: User },
                                    // { label: 'Preferred Name', value: applicant.personal_information?.preferred_name, icon: Heart },
                                    { label: 'Email', value: applicant.personal_information?.email, icon: Mail },
                                    { label: 'Phone', value: applicant.personal_information?.phone, icon: Phone },
                                    { label: 'Marital Status', value: applicant.personal_information?.marital_status, icon: Users },
                                    { label: 'Date of Birth', value: applicant.screening?.date_of_birth ? new Date(applicant.screening.date_of_birth).toLocaleDateString() : null, icon: Calendar },
                                ]} />
                            </div>
                        )}

                        {/* Addresses */}
                        {activeTab === 'address' && (
                            <div className="space-y-8">
                                <div>
                                    <SectionHeader title="Current Address" icon={Home} />
                                    <DataGrid items={[
                                        { label: 'Address Line 1', value: applicant.current_address?.address_line_1, icon: MapPin },
                                        { label: 'Address Line 2', value: applicant.current_address?.address_line_2, icon: MapPin },
                                        { label: 'City', value: applicant.current_address?.city, icon: MapPin },
                                        { label: 'State', value: applicant.current_address?.state, icon: MapPin },
                                        { label: 'ZIP Code', value: applicant.current_address?.zip_code, icon: Hash },
                                        { label: 'Country', value: applicant.current_address?.country, icon: Globe },
                                        { label: 'Community', value: applicant.current_address?.apartment_community, icon: Building },
                                        { label: 'Monthly Rent', value: applicant.current_address?.monthly_rent ? `$${applicant.current_address.monthly_rent}` : null, icon: DollarSign },
                                        { label: 'From Date', value: applicant.current_address?.residency_from_date, icon: Calendar },
                                        { label: 'Reason for Moving', value: applicant.current_address?.reason_for_moving, icon: Info },
                                    ]} />
                                </div>

                                {applicant.previous_address?.previous_address_line_1 && (
                                    <div>
                                        <SectionHeader title="Previous Address" icon={History} />
                                        <DataGrid items={[
                                            { label: 'Address Line 1', value: applicant.previous_address?.previous_address_line_1, icon: MapPin },
                                            { label: 'Address Line 2', value: applicant.previous_address?.previous_address_line_2, icon: MapPin },
                                            { label: 'City', value: applicant.previous_address?.previous_city, icon: MapPin },
                                            { label: 'State', value: applicant.previous_address?.previous_state, icon: MapPin },
                                            { label: 'ZIP Code', value: applicant.previous_address?.previous_zip_code, icon: Hash },
                                            { label: 'Country', value: applicant.previous_address?.previous_country, icon: Globe },
                                            { label: 'Community', value: applicant.previous_address?.previous_apartment, icon: Building },
                                            { label: 'Monthly Rent', value: applicant.previous_address?.previous_rent ? `$${applicant.previous_address.previous_rent}` : null, icon: DollarSign },
                                            { label: 'From Date', value: applicant.previous_address?.previous_from_date, icon: Calendar },
                                            { label: 'To Date', value: applicant.previous_address?.previous_to_date, icon: Calendar },
                                            { label: 'Reason for Moving', value: applicant.previous_address?.previous_reason, icon: Info },
                                        ]} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Employment */}
                        {activeTab === 'employment' && (
                            <div className="space-y-8">
                                <div>
                                    <SectionHeader title="Current Employment" icon={Briefcase} />
                                    <DataGrid items={[
                                        { label: 'Employer', value: applicant.employment?.employer_name, icon: Building },
                                        { label: 'Job Title', value: applicant.employment?.job_title, icon: Briefcase },
                                        { label: 'Status', value: applicant.employment?.employment_status, icon: Info },
                                        { label: 'Employed Since', value: applicant.employment?.employed_since, icon: Calendar },
                                        { label: 'Monthly Income', value: applicant.employment?.monthly_income ? `$${applicant.employment.monthly_income.toLocaleString()}` : null, icon: DollarSign },
                                        { label: 'Supervisor', value: applicant.employment?.supervisor_name, icon: User },
                                        { label: 'Supervisor Phone', value: applicant.employment?.employer_phone, icon: Phone },
                                        { label: 'Additional Income', value: applicant.employment?.additional_income ? `$${applicant.employment.additional_income.toLocaleString()}` : null, icon: DollarSign },
                                        { label: 'Income Source', value: applicant.employment?.additional_income_source, icon: Info },
                                        { label: 'Address', value: `${applicant.employment?.employer_address_1 || ''}, ${applicant.employment?.employer_city || ''}, ${applicant.employment?.employer_state || ''} ${applicant.employment?.employer_zip || ''}`, icon: MapPin },
                                    ]} />
                                </div>

                                {applicant.previous_employment?.previous_employer_name && (
                                    <div>
                                        <SectionHeader title="Previous Employment" icon={History} />
                                        <DataGrid items={[
                                            { label: 'Employer', value: applicant.previous_employment?.previous_employer_name, icon: Building },
                                            { label: 'Job Title', value: applicant.previous_employment?.previous_job_title, icon: Briefcase },
                                            { label: 'Status', value: applicant.previous_employment?.previous_employment_status, icon: Info },
                                            { label: 'Start Date', value: applicant.previous_employment?.previous_start_date, icon: Calendar },
                                            { label: 'End Date', value: applicant.previous_employment?.previous_end_date, icon: Calendar },
                                            { label: 'Monthly Income', value: applicant.previous_employment?.previous_monthly_income ? `$${applicant.previous_employment.previous_monthly_income.toLocaleString()}` : null, icon: DollarSign },
                                            { label: 'Supervisor', value: applicant.previous_employment?.previous_supervisor_name, icon: User },
                                            { label: 'Supervisor Phone', value: applicant.previous_employment?.previous_employer_phone, icon: Phone },
                                        ]} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Screening */}
                        {activeTab === 'screening' && (
                            <div>
                                <SectionHeader title="Screening & Background" icon={Shield} />
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Fingerprint className="w-5 h-5 text-blue-600" />
                                                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">Identity</h3>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
                                                    <span className="text-xs font-bold text-slate-400 uppercase">Country</span>
                                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{applicant.screening?.screening_country || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
                                                    <span className="text-xs font-bold text-slate-400 uppercase">Gov ID Type</span>
                                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{applicant.screening?.government_id || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
                                                    <span className="text-xs font-bold text-slate-400 uppercase">Issuing Entity</span>
                                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{applicant.screening?.issuing_entity || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2">
                                                    <span className="text-xs font-bold text-slate-400 uppercase">SSN Provided</span>
                                                    <span className={`text-sm font-bold ${applicant.screening?.has_ssn ? 'text-green-600' : 'text-red-500'}`}>
                                                        {applicant.screening?.has_ssn ? 'Yes' : 'No'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            <div className="flex items-center gap-3 mb-4">
                                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                                                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">Legal History</h3>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
                                                    <span className="text-xs font-bold text-slate-400 uppercase">Eviction History</span>
                                                    <span className={`text-sm font-bold ${applicant.screening?.evicted ? 'text-red-500' : 'text-green-600'}`}>
                                                        {applicant.screening?.evicted ? 'Yes - Flagged' : 'Clear'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
                                                    <span className="text-xs font-bold text-slate-400 uppercase">Felony Conviction</span>
                                                    <span className={`text-sm font-bold ${applicant.screening?.felony ? 'text-red-500' : 'text-green-600'}`}>
                                                        {applicant.screening?.felony ? 'Yes - Flagged' : 'Clear'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center py-2">
                                                    <span className="text-xs font-bold text-slate-400 uppercase">Active Cases</span>
                                                    <span className={`text-sm font-bold ${applicant.screening?.legal_case ? 'text-amber-500' : 'text-green-600'}`}>
                                                        {applicant.screening?.legal_case ? 'Yes - Review' : 'None'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {(applicant.screening?.eviction_reason || applicant.screening?.felony_reason || applicant.screening?.legal_case_details) && (
                                        <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                                            <div className="flex items-center gap-3 mb-4">
                                                <AlertCircle className="w-5 h-5 text-red-600" />
                                                <h3 className="text-sm font-black text-red-700 uppercase tracking-widest">Details on Flagged Items</h3>
                                            </div>
                                            <div className="space-y-4">
                                                {applicant.screening?.eviction_reason && (
                                                    <div>
                                                        <p className="text-xs font-bold text-red-400 uppercase">Eviction Details</p>
                                                        <p className="text-sm font-medium text-red-700 mt-1">{applicant.screening.eviction_reason}</p>
                                                    </div>
                                                )}
                                                {applicant.screening?.felony_reason && (
                                                    <div>
                                                        <p className="text-xs font-bold text-red-400 uppercase">Felony Details</p>
                                                        <p className="text-sm font-medium text-red-700 mt-1">{applicant.screening.felony_reason}</p>
                                                    </div>
                                                )}
                                                {applicant.screening?.legal_case_details && (
                                                    <div>
                                                        <p className="text-xs font-bold text-red-400 uppercase">Case Details</p>
                                                        <p className="text-sm font-medium text-red-700 mt-1">{applicant.screening.legal_case_details}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Pets & Vehicles */}
                        {activeTab === 'petsVehicles' && (
                            <div className="space-y-8">
                                <div>
                                    <SectionHeader title="Pets" icon={PawPrint} />
                                    {applicant.pets && applicant.pets.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {applicant.pets.map((pet, index) => (
                                                <div key={index} className="bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                                                <PawPrint className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{pet.pet_name || 'Unnamed Pet'}</p>
                                                                <p className="text-xs text-slate-400 font-bold uppercase">{pet.pet_type}</p>
                                                            </div>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${pet.vaccinated ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                            {pet.vaccinated ? 'Vaccinated' : 'Not Vaccinated'}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                                        <div><span className="font-bold text-slate-400 uppercase">Breed:</span> <span className="font-bold text-slate-700 dark:text-slate-300">{pet.breed || 'N/A'}</span></div>
                                                        <div><span className="font-bold text-slate-400 uppercase">Age:</span> <span className="font-bold text-slate-700 dark:text-slate-300">{pet.age ? `${pet.age} yrs` : 'N/A'}</span></div>
                                                        <div><span className="font-bold text-slate-400 uppercase">Weight:</span> <span className="font-bold text-slate-700 dark:text-slate-300">{pet.weight ? `${pet.weight} lbs` : 'N/A'}</span></div>
                                                        <div><span className="font-bold text-slate-400 uppercase">Color:</span> <span className="font-bold text-slate-700 dark:text-slate-300">{pet.color || 'N/A'}</span></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 font-medium text-center py-6">No pets registered.</p>
                                    )}
                                </div>

                                <div>
                                    <SectionHeader title="Vehicles" icon={Car} />
                                    {applicant.vehicles && applicant.vehicles.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {applicant.vehicles.map((vehicle, index) => (
                                                <div key={index} className="bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                                            <Car className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{vehicle.model || 'N/A'}</p>
                                                            <p className="text-xs text-slate-400 font-bold uppercase">{vehicle.vehicle_type}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-bold text-slate-400 uppercase">License Plate</span>
                                                        <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg font-mono font-bold text-slate-700 dark:text-slate-300">{vehicle.plate_number || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 font-medium text-center py-6">No vehicles registered.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Emergency Contact */}
                        {activeTab === 'emergency' && (
                            <div>
                                <SectionHeader title="Emergency Contact" icon={PhoneCall} />
                                <DataGrid items={[
                                    { label: 'Full Name', value: applicant.emergency_contact?.full_name, icon: User },
                                    { label: 'Relationship', value: applicant.emergency_contact?.relationship, icon: Heart },
                                    { label: 'Phone', value: applicant.emergency_contact?.phone, icon: Phone },
                                    { label: 'Email', value: applicant.emergency_contact?.email, icon: Mail },
                                    { label: 'Country', value: applicant.emergency_contact?.country, icon: Globe },
                                    { label: 'Address Line 1', value: applicant.emergency_contact?.address_line_1, icon: MapPin },
                                    { label: 'City', value: applicant.emergency_contact?.city, icon: MapPin },
                                    { label: 'State & ZIP', value: applicant.emergency_contact?.state ? `${applicant.emergency_contact.state}, ${applicant.emergency_contact.zip_code || ''}` : null, icon: Hash },
                                ]} />
                            </div>
                        )}

                        {/* Documents */}
                        {activeTab === 'documents' && (
                            <div className="space-y-8">
                                <div>
                                    <SectionHeader title="System Generated Documents" icon={ShieldCheck} />
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="group p-5 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:bg-slate-800 hover:shadow-xl transition-all flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate uppercase">Full Merged Application PDF</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Includes Application, Consents, & Documents</p>
                                            </div>
                                            <a
                                                href={route('application.pdf', applicant.id)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-xs font-bold hover:bg-brand-dark transition-all shadow-md hover:shadow-lg"
                                            >
                                                <Eye className="w-4 h-4" /> View
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <SectionHeader title="User Uploaded Documents" icon={FileText} />
                                    {applicant.documents && applicant.documents.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {applicant.documents.map((doc, index) => (
                                                <div key={index} className="group p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:bg-slate-800 hover:shadow-xl transition-all">
                                                    <div className="flex items-center gap-4 mb-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                                                            <FileText className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate uppercase">{doc.document_type?.replace(/_/g, ' ') || 'Document'}</p>
                                                            <p className="text-[9px] text-slate-400 font-bold">{(doc.original_filename?.split('.').pop() || 'FILE').toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={doc.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-100 text-slate-600 dark:text-slate-400 text-[10px] font-bold hover:bg-brand hover:text-white transition-all"
                                                    >
                                                        <Eye className="w-3 h-3" /> View Document
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 font-medium text-center py-6">No documents uploaded by user.</p>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* Admin Notes Tab Content */}
                        {activeTab === 'notes' && (
                            <div className="space-y-6 animate-fade-in">
                                <SectionHeader title="Admin Comments & Follow-up Notes" icon={History} />
                                
                                <div className="bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Active Notes</h3>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Administrative comments visible only to staff</p>
                                        </div>
                                        <button
                                            onClick={() => setIsNoteModalOpen(true)}
                                            className="px-3.5 py-1.5 bg-[#0e4a81]/10 hover:bg-[#0e4a81]/25 text-[#0e4a81] dark:text-[#5a9bd5] text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 border border-[#0e4a81]/20 shadow-sm"
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            Update Notes
                                        </button>
                                    </div>
                                    
                                    {comment ? (
                                        <div className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
                                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{comment}</p>
                                        </div>
                                    ) : (
                                        <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 font-medium bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
                                            No comments or administrative notes have been logged for this application yet.
                                        </div>
                                    )}
                                </div>

                                <div className="bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Notification Status Summary</h3>
                                    
                                    {applicant.is_consent_completed ? (
                                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                            <div className="text-xs font-medium leading-relaxed">
                                                <p className="font-bold text-emerald-900 dark:text-emerald-200">Automated Reminders Deactivated</p>
                                                <p className="text-[11px] opacity-90 mt-1">Applicant completed the consent form. No further reminder runs will execute.</p>
                                            </div>
                                        </div>
                                    ) : comment ? (
                                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                            <div className="text-xs font-medium leading-relaxed">
                                                <p className="font-bold text-emerald-900 dark:text-emerald-200">Automated Reminders Muted</p>
                                                <p className="text-[11px] opacity-90 mt-1">Muted because an administrative comment exists. This allows manual follow-ups without system interference.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                            <div className="text-xs font-medium leading-relaxed">
                                                <p className="font-bold text-amber-900 dark:text-amber-200">Automated Consent Follow-up: Active</p>
                                                <p className="text-[11px] opacity-90 mt-1">The system will periodically send consent reminders until the form is completed or notes are logged.</p>
                                                <div className="mt-3 text-xs font-bold border-t border-amber-250/50 pt-2.5 space-y-1">
                                                    <p>• Reminder Email Delivery Count: {applicant.reminder_sent_count || 0} / 3</p>
                                                    {applicant.last_reminder_sent_at && (
                                                        <p>• Last Scheduled Delivery: {new Date(applicant.last_reminder_sent_at).toLocaleString()}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div> {/* Close Content Area div */}
                </div> {/* Close space-y-8 div */}
            </div> {/* Close max-w-8xl div */}
        </div> {/* Close py-8 div */}

            {/* Note Editor Modal */}
            {isNoteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-lg w-full overflow-hidden animate-scale-up">
                        <div className="bg-gradient-to-r from-[#0e4a81] to-[#1a5c9e] dark:from-[#1a5c9e] dark:to-[#0e4a81] px-6 py-4 flex items-center justify-between">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-white" />
                                Update Admin Notes
                            </h3>
                            <button 
                                onClick={() => setIsNoteModalOpen(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveComment} className="p-6 space-y-4">
                            <div>
                                <label htmlFor="modal_admin_comment" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Comment / Follow-up Notes
                                </label>
                                <textarea
                                    id="modal_admin_comment"
                                    rows="6"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Write comments here (e.g. tenant not interested, called on date, etc.)"
                                    className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-[#0e4a81] focus:border-[#0e4a81] text-sm text-slate-700 dark:text-slate-300 resize-none leading-relaxed"
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => setIsNoteModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-gradient-to-r from-[#0e4a81] to-[#1a5c9e] dark:from-[#1a5c9e] dark:to-[#0e4a81] hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? 'Saving...' : 'Save Notes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Resend Confirmation Modal */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
                        <div className="bg-gradient-to-r from-[#0e4a81] to-[#1a5c9e] dark:from-[#1a5c9e] dark:to-[#0e4a81] px-6 py-4 flex items-center justify-between">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-white" />
                                Confirm Action
                            </h3>
                            <button 
                                onClick={() => setIsConfirmModalOpen(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 dark:bg-slate-900 rounded-xl text-[#0e4a81] dark:text-[#5a9bd5] shrink-0">
                                    <Send className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200">Resend Notification Email?</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                        Are you sure you want to resend this application notification email to the configured administrator(s)?
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => setIsConfirmModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resending}
                                    className="px-4 py-2 bg-gradient-to-r from-[#0e4a81] to-[#1a5c9e] dark:from-[#1a5c9e] dark:to-[#0e4a81] hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                    {resending ? 'Resending...' : 'Confirm & Send'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes scale-up {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                .animate-scale-up {
                    animation: scale-up 0.2s ease-out;
                }
            ` }} />
        </AuthenticatedLayout>
    );
}