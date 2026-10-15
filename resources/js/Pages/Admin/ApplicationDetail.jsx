import { useState, useEffect } from 'react';
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
    Send,
    Edit,
    Trash2,
    UploadCloud,
    Search,
    X,
    MessageSquare,
    Smartphone,
    Check
} from 'lucide-react';


const LEAD_SOURCES = [
    'Craigslist',
    'Facebook Marketplace',
    'Zillow',
    'AffordableHousing.com',
    'Social Media',
    'TurboTenant',
    'Website',
    'Banner',
    'Other'
];

export default function ApplicationDetail({ applicant }) {
    const [activeTab, setActiveTab] = useState('property');
    const [comment, setComment] = useState(applicant.admin_comment || '');
    const [saving, setSaving] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    // Property Edit Modal states
    const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
    const [propertyFormData, setPropertyFormData] = useState({
        property_id: applicant.property_id || '',
        property_code: applicant.property?.property_code || applicant.property_code || '',
        property_name: applicant.property_name || '',
        property_type: applicant.property_type || '',
        desired_move_date: applicant.desired_move_date ? (applicant.desired_move_date.includes('T') ? applicant.desired_move_date.split('T')[0] : applicant.desired_move_date) : '',
        source: applicant.source || '',
        source_other: applicant.source_other || '',
    });
    const [propertySearchQuery, setPropertySearchQuery] = useState(applicant.property_name || '');
    const [propertySearchResults, setPropertySearchResults] = useState([]);
    const [propertySearchLoading, setPropertySearchLoading] = useState(false);
    const [availablePropertyTypes, setAvailablePropertyTypes] = useState(
        applicant.property?.property_type ? (Array.isArray(applicant.property.property_type) ? applicant.property.property_type : [applicant.property.property_type]) : []
    );
    const [savingProperty, setSavingProperty] = useState(false);

    const companyName = applicant.company_name || (applicant.type === 'superadmin' ? 'Excel' : 'Triumph');

    useEffect(() => {
        if (!propertySearchQuery || propertySearchQuery.trim().length < 2) {
            setPropertySearchResults([]);
            return;
        }

        const timer = setTimeout(() => {
            setPropertySearchLoading(true);
            fetch(`/properties/search?company_name=${encodeURIComponent(companyName)}&search=${encodeURIComponent(propertySearchQuery.trim())}`)
                .then(res => res.json())
                .then(data => {
                    setPropertySearchResults(data.data || []);
                })
                .catch(err => console.error(err))
                .finally(() => setPropertySearchLoading(false));
        }, 300);

        return () => clearTimeout(timer);
    }, [propertySearchQuery, companyName]);

    const handleSelectProperty = (property) => {
        const types = Array.isArray(property.property_type) ? property.property_type : (property.property_type ? [property.property_type] : []);
        setAvailablePropertyTypes(types);
        setPropertyFormData(prev => ({
            ...prev,
            property_id: property.id ? String(property.id) : prev.property_id,
            property_code: property.property_code ? String(property.property_code) : prev.property_code,
            property_name: property.property_name,
            property_type: types.length > 0 ? types[0] : prev.property_type
        }));
        setPropertySearchQuery(property.property_name);
        setPropertySearchResults([]);
    };

    const handleOpenPropertyModal = () => {
        const initialDate = applicant.desired_move_date
            ? (applicant.desired_move_date.includes('T') ? applicant.desired_move_date.split('T')[0] : applicant.desired_move_date)
            : '';
        setPropertyFormData({
            property_id: applicant.property_id ? String(applicant.property_id) : '',
            property_code: applicant.property?.property_code ? String(applicant.property.property_code) : (applicant.property_code ? String(applicant.property_code) : ''),
            property_name: applicant.property_name || '',
            property_type: applicant.property_type || '',
            desired_move_date: initialDate,
            source: applicant.source || '',
            source_other: applicant.source_other || '',
        });
        setPropertySearchQuery(applicant.property_name || '');
        setPropertySearchResults([]);
        setIsPropertyModalOpen(true);
    };

    const handleSavePropertyDetails = (e) => {
        if (e) e.preventDefault();
        if (!propertyFormData.property_name?.trim()) {
            toast.error('Property Name is required');
            return;
        }
        if (propertyFormData.property_code && !/^\d+$/.test(String(propertyFormData.property_code).trim())) {
            toast.error('Property Code must contain only numbers');
            return;
        }
        if (propertyFormData.source === 'Other' && !propertyFormData.source_other?.trim()) {
            toast.error('Please specify where you heard about us');
            return;
        }

        setSavingProperty(true);
        router.put(route('admin.applications.property-details', applicant.id), propertyFormData, {
            preserveScroll: true,
            onSuccess: () => {
                setSavingProperty(false);
                setIsPropertyModalOpen(false);
                toast.success('Property details updated successfully!');
            },
            onError: (errs) => {
                setSavingProperty(false);
                const msg = errs ? Object.values(errs).flat()[0] : 'Failed to update property details';
                toast.error(msg);
            }
        });
    };



    const [uploadType, setUploadType] = useState('driving_license');
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadDescription, setUploadDescription] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleUploadDocument = (e) => {
        e.preventDefault();
        if (!uploadFile) {
            toast.error('Please select a file to upload.');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('document_type', uploadType);
        formData.append('file', uploadFile);
        formData.append('description', uploadDescription);

        router.post(route('admin.applications.upload-document', applicant.id), formData, {
            onSuccess: () => {
                toast.success('Document uploaded successfully');
                setUploadFile(null);
                setUploadDescription('');
                setUploading(false);
                e.target.reset();
            },
            onError: (errors) => {
                toast.error('Failed to upload document: ' + (errors.message || 'Validation error'));
                setUploading(false);
            }
        });
    };

    const handleDeleteDocument = (docId) => {
        if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
            router.delete(route('admin.applications.delete-document', { id: applicant.id, documentId: docId }), {
                onSuccess: () => toast.success('Document deleted successfully'),
                onError: (errors) => toast.error('Failed to delete document: ' + (errors.message || 'Unknown error'))
            });
        }
    };

    const handleBack = () => {
        const savedUrl = typeof window !== 'undefined' ? sessionStorage.getItem('last_applications_url') : null;
        if (savedUrl && savedUrl.includes('/admin/applications')) {
            router.get(savedUrl);
        } else if (typeof window !== 'undefined' && window.history.length > 1 && document.referrer && document.referrer.includes('/admin/applications')) {
            window.history.back();
        } else {
            const fallbackType = applicant.type === 'superadmin' ? 'superadmin' : 'admin';
            router.get(`/admin/applications?type=${fallbackType}`);
        }
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

    // Incomplete status checks
    const isConsentIncomplete = !applicant.is_consent_completed;
    const isPaymentIncomplete = applicant.payment_status !== 'paid' && applicant.payment_status !== 'completed';
    const isApplicationIncomplete = applicant.status !== 'submitted' && applicant.status !== 'approved';
    const showSmsButton = isConsentIncomplete || isPaymentIncomplete || isApplicationIncomplete;

    // SMS Modal states
    const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
    const [smsPhone, setSmsPhone] = useState(applicant.personal_information?.phone || '');
    const [smsMessage, setSmsMessage] = useState('');
    const [sendingSms, setSendingSms] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('smart');

    const getDefaultSmsMessage = (type = 'smart') => {
        const firstName = applicant.personal_information?.first_name || 'Tenant';
        const propName = applicant.property_name || 'the property';
        const compName = applicant.company_name || (applicant.type === 'superadmin' ? 'Excel' : 'Triumph');

        if (type === 'appointment') {
            return 'sms_appointment_reminders';
        }

        if (type === 'consent') {
            return `Hi ${firstName}, reminder from ${compName}: Please complete your Tenant Consent Form for ${propName} so we can proceed with screening.`;
        }

        if (type === 'payment') {
            return `Hi ${firstName}, reminder from ${compName}: Please complete your application fee payment for ${propName} to finalize processing.`;
        }

        if (type === 'application') {
            return `Hi ${firstName}, reminder from ${compName}: Your rental application for ${propName} is still incomplete. Please finish submitting all required information.`;
        }

        // Smart multi-item message
        const missing = [];
        if (isConsentIncomplete) missing.push('Consent Form');
        if (isPaymentIncomplete) missing.push('Payment');
        if (isApplicationIncomplete) missing.push('Application Details');

        const missingText = missing.length > 0 ? missing.join(' & ') : 'required items';
        return `Hi ${firstName}, reminder from ${compName}: Your rental application for ${propName} is missing: ${missingText}. Please complete this as soon as possible.`;
    };

    const handleOpenSmsModal = (templateType = 'smart') => {
        setSmsPhone(applicant.personal_information?.phone || '');
        setSelectedTemplate(templateType);
        setSmsMessage(getDefaultSmsMessage(templateType));
        setIsSmsModalOpen(true);
    };

    const handleApplyTemplate = (type) => {
        setSelectedTemplate(type);
        setSmsMessage(getDefaultSmsMessage(type));
    };

    const handleSendSms = (e) => {
        if (e) e.preventDefault();
        if (!smsPhone?.trim()) {
            toast.error('Recipient phone number is required.');
            return;
        }
        if (!smsMessage?.trim()) {
            toast.error('SMS message body is required.');
            return;
        }

        setSendingSms(true);
        router.post(route('admin.applications.send-sms', applicant.id), {
            phone: smsPhone.trim(),
            message: smsMessage.trim(),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSendingSms(false);
                setIsSmsModalOpen(false);
                toast.success('SMS reminder sent successfully via Twilio!');
            },
            onError: (errors) => {
                setSendingSms(false);
                const errorMsg = errors.sms_error || errors.phone || errors.message || 'Failed to send SMS reminder.';
                toast.error(errorMsg);
            }
        });
    };

    // Email Reminder Modal states
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailRecipient, setEmailRecipient] = useState(applicant.personal_information?.email || '');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);
    const [selectedEmailTemplate, setSelectedEmailTemplate] = useState('smart');

    const getDefaultEmailSubject = (type = 'smart') => {
        const propName = applicant.property_name || 'Your Selected Property';

        if (type === 'consent') {
            return `Action Required: Please Complete Your Tenant Consent Form - ${propName}`;
        }
        if (type === 'payment') {
            return `Payment Reminder: Rental Application Fee Pending - ${propName}`;
        }
        if (type === 'application') {
            return `Follow-up: Incomplete Rental Application for ${propName}`;
        }
        return `Action Required: Complete Your Rental Application Requirements - ${propName}`;
    };

    const getDefaultEmailMessage = (type = 'smart') => {
        const firstName = applicant.personal_information?.first_name || 'Applicant';
        const propName = applicant.property_name || 'the selected property';
        const compName = applicant.company_name || (applicant.type === 'superadmin' ? 'Excel Residential' : 'Triumph Residential');

        if (type === 'consent') {
            return `Dear ${firstName},\n\nWe noticed that your Tenant Consent Form for ${propName} has not been completed yet.\n\nCompleting the consent form is required for us to conduct background and credit screening. Please review and sign your consent form as soon as possible so we can proceed with your application.`;
        }

        if (type === 'payment') {
            return `Dear ${firstName},\n\nThank you for applying for ${propName}. Our records indicate that your rental application fee is still pending payment.\n\nTo ensure your application is reviewed without delay, please complete your application fee payment using the secure link.`;
        }

        if (type === 'application') {
            return `Dear ${firstName},\n\nThank you for your interest in ${propName}. Your rental application is currently incomplete.\n\nPlease log back in and finalize submitting your information and required documents so our leasing team can process your request promptly.`;
        }

        // Smart multi-item message
        const missing = [];
        if (isConsentIncomplete) missing.push('Tenant Consent Form');
        if (isPaymentIncomplete) missing.push('Application Fee Payment');
        if (isApplicationIncomplete) missing.push('Application Details & Documents');

        const missingText = missing.length > 0 ? missing.map(m => `• ${m}`).join('\n') : '• Required application items';
        return `Dear ${firstName},\n\nThank you for applying for residency at ${propName} with ${compName}.\n\nTo continue processing your application, the following required items are currently pending:\n\n${missingText}\n\nPlease complete the remaining steps as soon as possible so we can finalize your review.`;
    };

    const handleOpenEmailModal = (templateType = 'smart') => {
        setEmailRecipient(applicant.personal_information?.email || '');
        setSelectedEmailTemplate(templateType);
        setEmailSubject(getDefaultEmailSubject(templateType));
        setEmailMessage(getDefaultEmailMessage(templateType));
        setIsEmailModalOpen(true);
    };

    const handleApplyEmailTemplate = (type) => {
        setSelectedEmailTemplate(type);
        setEmailSubject(getDefaultEmailSubject(type));
        setEmailMessage(getDefaultEmailMessage(type));
    };

    const handleSendEmailReminder = (e) => {
        if (e) e.preventDefault();
        if (!emailRecipient?.trim()) {
            toast.error('Recipient email address is required.');
            return;
        }
        if (!emailSubject?.trim()) {
            toast.error('Email subject is required.');
            return;
        }
        if (!emailMessage?.trim()) {
            toast.error('Email message body is required.');
            return;
        }

        setSendingEmail(true);
        router.post(route('admin.applications.send-email-reminder', applicant.id), {
            email: emailRecipient.trim(),
            subject: emailSubject.trim(),
            message: emailMessage.trim(),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSendingEmail(false);
                setIsEmailModalOpen(false);
                toast.success('Email reminder sent successfully to ' + emailRecipient.trim() + '!');
            },
            onError: (errors) => {
                setSendingEmail(false);
                const errorMsg = errors.email_error || errors.email || errors.subject || errors.message || 'Failed to send email reminder.';
                toast.error(errorMsg);
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
                                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1 flex items-center gap-2 flex-wrap">
                                            <span>Application ID: #{applicant.id}</span>
                                            <span>•</span>
                                            <span>Created: {new Date(applicant.created_at).toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles', month: 'short', day: '2-digit', year: 'numeric' })} at {new Date(applicant.created_at).toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <div className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center gap-2">
                                        <ShieldCheck className={`w-4 h-4 ${applicant.is_consent_completed ? 'text-green-500' : 'text-slate-400'}`} />
                                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Consent: {applicant.is_consent_completed ? 'Completed' : 'Pending'}</span>
                                    </div>
                                    <div className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center gap-2">
                                        <CreditCard className={`w-4 h-4 ${(applicant.payment_status === 'paid' || applicant.payment_status === 'completed') ? 'text-green-500' : 'text-slate-400'}`} />
                                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                            Payment: {(applicant.payment_status === 'paid' || applicant.payment_status === 'completed') ? 'Paid' : (applicant.payment_status === 'unpaid' ? 'Unpaid' : (applicant.payment_status ? applicant.payment_status.charAt(0).toUpperCase() + applicant.payment_status.slice(1) : 'Pending'))}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleOpenPropertyModal}
                                        className="px-4 py-2 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95 cursor-pointer"
                                    >
                                        <Building className="w-4 h-4 text-[#0e4a81] dark:text-[#5a9bd5]" />
                                        Edit Property
                                    </button>
                                    <a
                                        href={applicant.type === 'superadmin' ? `/rental-application-excel?applicant_id=${applicant.id}` : `/rental-application?applicant_id=${applicant.id}`}
                                        className="px-4 py-2 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95"
                                    >
                                        <Edit className="w-4 h-4 text-amber-500" />
                                        Edit Details
                                    </a>
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
                                    {/* {showSmsButton && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEmailModal('smart')}
                                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
                                                title="Send Email reminder to tenant for incomplete application / consent / payment"
                                            >
                                                <Mail className="w-4 h-4" />
                                                <span>Send Email</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleOpenSmsModal('smart')}
                                                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
                                                title="Send SMS reminder to tenant for incomplete application / consent / payment"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                <span>Send SMS</span>
                                            </button>
                                        </div>
                                    )} */}
                                </div>
                            </div>

                            {/* Incomplete Reminder Alert Banner */}
                            {showSmsButton && (
                                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in shadow-sm w-full">
                                    <div className="flex items-start sm:items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                            <AlertCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-extrabold text-amber-900 dark:text-amber-200 flex items-center gap-2 flex-wrap">
                                                <span>Incomplete Application Items</span>
                                                <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                                                    Action Required
                                                </span>
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                {isConsentIncomplete && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 px-2.5 py-0.5 rounded-lg">
                                                        • Consent Form Incomplete
                                                    </span>
                                                )}
                                                {isPaymentIncomplete && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800/50 px-2.5 py-0.5 rounded-lg">
                                                        • Payment Incomplete ({applicant.payment_status || 'Unpaid'})
                                                    </span>
                                                )}
                                                {isApplicationIncomplete && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-800 dark:text-orange-300 bg-orange-100/70 dark:bg-orange-900/40 border border-orange-200 dark:border-orange-800/50 px-2.5 py-0.5 rounded-lg">
                                                        • Application Draft ({applicant.status || 'Draft'})
                                                    </span>
                                                )}
                                                {applicant.reminder_sent_count > 0 && (
                                                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 ml-1">
                                                        (Reminder sent {applicant.reminder_sent_count} time{applicant.reminder_sent_count > 1 ? 's' : ''}{applicant.last_reminder_sent_at ? ` • Last: ${new Date(applicant.last_reminder_sent_at).toLocaleDateString()}` : ''})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEmailModal('smart')}
                                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
                                        >
                                            <Mail className="w-4 h-4" />
                                            <span>Send Email Reminder</span>
                                        </button>
                                        {/* <button
                                            type="button"
                                            onClick={() => handleOpenSmsModal('smart')}
                                            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            <span>Send SMS to Tenant</span>
                                        </button> */}
                                    </div>
                                </div>
                            )}

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
                                        <span className={`text-xs font-bold mt-1 block ${(applicant.screening?.evicted || applicant.screening?.felony || applicant.screening?.legal_case)
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
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                                        <SectionHeader title="Property Information" icon={Building} />
                                        <button
                                            type="button"
                                            onClick={handleOpenPropertyModal}
                                            className="mb-6 px-4 py-2.5 bg-gradient-to-r from-[#0e4a81] to-[#1a5c9e] hover:opacity-95 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-[#0e4a81]/20 active:scale-95 self-start sm:self-auto cursor-pointer"
                                        >
                                            <Edit className="w-4 h-4" />
                                            <span>Edit Property & Move-In</span>
                                        </button>
                                    </div>
                                    <DataGrid items={[
                                        { label: 'Property Code', value: applicant.property?.property_code || applicant.property_code || 'N/A', icon: Hash },
                                        { label: 'Property Name', value: applicant.property_name, icon: Home },

                                        { label: 'Property Type', value: applicant.property_type, icon: Info },
                                        { label: 'Desired Move Date', value: applicant.desired_move_date ? new Date(applicant.desired_move_date).toLocaleDateString() : null, icon: Calendar },
                                        {
                                            label: 'Source',
                                            value: applicant.source === 'Other' && applicant.source_other
                                                ? `Other: ${applicant.source_other}`
                                                : applicant.source,
                                            icon: Globe
                                        },
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
                                                        <div className="flex gap-2">
                                                            <a
                                                                href={doc.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-100 text-slate-600 dark:text-slate-400 text-[10px] font-bold hover:bg-brand hover:text-white transition-all"
                                                            >
                                                                <Eye className="w-3 h-3" /> View
                                                            </a>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteDocument(doc.id)}
                                                                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-500 text-red-600 hover:text-white text-[10px] font-bold transition-all active:scale-95"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" /> Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-400 font-medium text-center py-6">No documents uploaded by user.</p>
                                        )}
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700/60">
                                        <SectionHeader title="Upload Document on behalf of User" icon={UploadCloud} />
                                        <form onSubmit={handleUploadDocument} className="bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-4 max-w-xl mt-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Document Type</label>
                                                    <select
                                                        value={uploadType}
                                                        onChange={(e) => setUploadType(e.target.value)}
                                                        className="w-full bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 outline-none focus:border-brand"
                                                    >
                                                        <option value="driving_license">Driving License</option>
                                                        <option value="pay_check">Pay Check</option>
                                                        <option value="bank_statement">Bank Statement</option>
                                                        <option value="social_security_card">SSN Card</option>
                                                        <option value="other_source_of_income">Other Source of Income</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Select File</label>
                                                    <input
                                                        type="file"
                                                        onChange={(e) => setUploadFile(e.target.files[0])}
                                                        className="w-full text-xs font-bold text-slate-500 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 outline-none"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {(uploadType === 'other' || uploadType === 'other_source_of_income') && (
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Description</label>
                                                    <input
                                                        type="text"
                                                        value={uploadDescription}
                                                        onChange={(e) => setUploadDescription(e.target.value)}
                                                        placeholder="Enter a description for this document..."
                                                        className="w-full bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 outline-none focus:border-brand"
                                                        required
                                                    />
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={uploading}
                                                className="px-5 py-2.5 bg-[#0e4a81] hover:bg-[#1a5c9e] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
                                            >
                                                <UploadCloud className="w-4 h-4" />
                                                {uploading ? 'Uploading...' : 'Upload Document'}
                                            </button>
                                        </form>
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

            {/* Edit Property Details Modal */}
            {isPropertyModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-lg w-full overflow-hidden animate-scale-up">
                        <div className="bg-gradient-to-r from-[#0e4a81] to-[#1a5c9e] dark:from-[#1a5c9e] dark:to-[#0e4a81] px-6 py-4 flex items-center justify-between">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Building className="w-5 h-5 text-white" />
                                Edit Property & Move-In Details
                            </h3>
                            <button
                                onClick={() => setIsPropertyModalOpen(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSavePropertyDetails} className="p-6 space-y-4">
                            {/* Property Search / Name */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Property Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={propertySearchQuery}
                                        onChange={(e) => {
                                            setPropertySearchQuery(e.target.value);
                                            setPropertyFormData(prev => ({
                                                ...prev,
                                                property_name: e.target.value
                                            }));
                                        }}
                                        placeholder={propertySearchLoading ? "Searching properties..." : "Search or enter property name..."}
                                        className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 pl-10 pr-3 text-xs focus:ring-2 focus:ring-[#0e4a81]/20 focus:border-[#0e4a81] bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none"
                                        required
                                    />
                                </div>

                                {/* Results dropdown */}
                                {propertySearchResults.length > 0 && (
                                    <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                                        {propertySearchResults.map((prop) => (
                                            <button
                                                key={prop.id}
                                                type="button"
                                                onClick={() => handleSelectProperty(prop)}
                                                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 flex flex-col transition-colors"
                                            >
                                                <span className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                                    <span>{prop.property_name}</span>
                                                    {prop.property_code && (
                                                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                                            Code: {prop.property_code}
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="text-[10px] text-slate-400 mt-0.5">
                                                    {Array.isArray(prop.property_type) ? prop.property_type.join(', ') : (prop.property_type || 'Residential')}
                                                    {prop.address ? ` • ${prop.address}` : ''}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Property Code */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Property Code
                                    </label>
                                    <span className="text-[10px] text-slate-400 font-medium">Numbers only</span>
                                </div>
                                <div className="relative">
                                    <Hash className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={propertyFormData.property_code || ''}
                                        onChange={(e) => {
                                            const numericOnly = e.target.value.replace(/\D/g, '');
                                            setPropertyFormData(prev => ({
                                                ...prev,
                                                property_code: numericOnly
                                            }));
                                        }}
                                        placeholder="e.g. 101"
                                        className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 pl-10 pr-3 text-xs focus:ring-2 focus:ring-[#0e4a81]/20 focus:border-[#0e4a81] bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                                    Numeric identifier only. Auto-filled on property selection or can be entered manually.
                                </p>
                            </div>


                            {/* Property Type */}
                            <div>

                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Property Type
                                </label>
                                {availablePropertyTypes.length > 0 ? (
                                    <select
                                        value={propertyFormData.property_type}
                                        onChange={(e) => setPropertyFormData(prev => ({ ...prev, property_type: e.target.value }))}
                                        className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 px-3 text-xs focus:ring-2 focus:ring-[#0e4a81]/20 focus:border-[#0e4a81] bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none"
                                    >
                                        <option value="">Select Property Type</option>
                                        {availablePropertyTypes.map((type, idx) => (
                                            <option key={idx} value={type}>{type}</option>
                                        ))}
                                        {propertyFormData.property_type && !availablePropertyTypes.includes(propertyFormData.property_type) && (
                                            <option value={propertyFormData.property_type}>{propertyFormData.property_type}</option>
                                        )}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        value={propertyFormData.property_type}
                                        onChange={(e) => setPropertyFormData(prev => ({ ...prev, property_type: e.target.value }))}
                                        placeholder="e.g. 1 Bedroom, 2 Bedroom, Studio"
                                        className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 px-3 text-xs focus:ring-2 focus:ring-[#0e4a81]/20 focus:border-[#0e4a81] bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none"
                                    />
                                )}
                            </div>

                            {/* Desired Move Date */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Desired Move-In Date
                                </label>
                                <input
                                    type="date"
                                    value={propertyFormData.desired_move_date}
                                    onChange={(e) => setPropertyFormData(prev => ({ ...prev, desired_move_date: e.target.value }))}
                                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 px-3 text-xs focus:ring-2 focus:ring-[#0e4a81]/20 focus:border-[#0e4a81] bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none"
                                />
                            </div>

                            {/* Source */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Source
                                </label>
                                <select
                                    value={propertyFormData.source}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setPropertyFormData(prev => ({
                                            ...prev,
                                            source: val,
                                            source_other: val !== 'Other' ? '' : prev.source_other
                                        }));
                                    }}
                                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 px-3 text-xs focus:ring-2 focus:ring-[#0e4a81]/20 focus:border-[#0e4a81] bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none"
                                >
                                    <option value="">Select where applicant heard about us</option>
                                    {LEAD_SOURCES.map((src, index) => (
                                        <option key={index} value={src}>{src}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Other Source */}
                            {propertyFormData.source === 'Other' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Where did you hear about us? <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={propertyFormData.source_other}
                                        onChange={(e) => setPropertyFormData(prev => ({ ...prev, source_other: e.target.value }))}
                                        placeholder="Please specify lead source..."
                                        className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 px-3 text-xs focus:ring-2 focus:ring-[#0e4a81]/20 focus:border-[#0e4a81] bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none"
                                        required
                                    />
                                </div>
                            )}

                            {/* Modal Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => setIsPropertyModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingProperty}
                                    className="px-4 py-2 bg-gradient-to-r from-[#0e4a81] to-[#1a5c9e] hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
                                >
                                    <Save className="w-4 h-4" />
                                    {savingProperty ? 'Saving...' : 'Save Changes'}
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

            {/* Twilio SMS Reminder Modal */}
            {isSmsModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-lg w-full overflow-hidden animate-scale-up">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-4 flex items-center justify-between text-white">
                            <h3 className="text-base font-bold flex items-center gap-2.5">
                                <MessageSquare className="w-5 h-5 text-emerald-100" />
                                <span>Send SMS Reminder to Tenant</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsSmsModalOpen(false)}
                                className="text-white/80 hover:text-white transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSendSms} className="p-6 space-y-5">
                            {/* Tenant Info Card */}
                            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
                                <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recipient</p>
                                        <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{fullName || 'Unknown Applicant'}</p>
                                    </div>
                                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                        App #{applicant.id}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-200/60 dark:border-slate-800">
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${applicant.is_consent_completed
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                        }`}>
                                        Consent: {applicant.is_consent_completed ? 'Completed' : 'Incomplete'}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${(applicant.payment_status === 'paid' || applicant.payment_status === 'completed')
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                        }`}>
                                        Payment: {applicant.payment_status || 'Unpaid'}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${(applicant.status === 'submitted' || applicant.status === 'approved')
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                        : 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300'
                                        }`}>
                                        App: {applicant.status || 'Draft'}
                                    </span>
                                </div>
                            </div>

                            {/* Phone Number Input */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Recipient Phone Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Smartphone className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <input
                                        type="tel"
                                        value={smsPhone}
                                        onChange={(e) => setSmsPhone(e.target.value)}
                                        placeholder="+12133269036 or (213) 326-9036"
                                        className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none"
                                        required
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                                    Sent via Twilio (+17372324091). Standard 10-digit US numbers are auto-formatted with +1.
                                </p>
                            </div>

                            {/* Message Templates Quick Select */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Quick Message Templates
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleApplyTemplate('smart')}
                                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all truncate text-left ${selectedTemplate === 'smart'
                                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                            }`}
                                    >
                                        ✨ Smart Reminder
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleApplyTemplate('consent')}
                                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all truncate text-left ${selectedTemplate === 'consent'
                                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                            }`}
                                    >
                                        📋 Consent Form
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleApplyTemplate('payment')}
                                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all truncate text-left ${selectedTemplate === 'payment'
                                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                            }`}
                                    >
                                        💳 Payment Unpaid
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleApplyTemplate('appointment')}
                                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all truncate text-left ${selectedTemplate === 'appointment'
                                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                            }`}
                                    >
                                        🔔 Twilio Sample
                                    </button>
                                </div>
                            </div>

                            {/* Message Textarea */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Message Body <span className="text-red-500">*</span>
                                    </label>
                                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                                        {smsMessage.length} characters ({Math.ceil(smsMessage.length / 160) || 1} SMS segment)
                                    </span>
                                </div>
                                <textarea
                                    rows="4"
                                    value={smsMessage}
                                    onChange={(e) => {
                                        setSmsMessage(e.target.value);
                                        setSelectedTemplate('custom');
                                    }}
                                    placeholder="Type your SMS message here..."
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none resize-none leading-relaxed"
                                    required
                                />
                            </div>

                            {/* Twilio Info Footer */}
                            <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 p-3 rounded-xl flex items-center justify-between text-[11px] text-emerald-900 dark:text-emerald-200">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="font-semibold">Twilio Sender: <code className="font-mono font-bold">+17372324091</code></span>
                                </div>
                                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
                                    {applicant.reminder_sent_count > 0 ? `Sent ${applicant.reminder_sent_count} time(s)` : 'No SMS sent yet'}
                                </span>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => setIsSmsModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={sendingSms || !smsPhone.trim() || !smsMessage.trim()}
                                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer active:scale-95"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>{sendingSms ? 'Sending SMS...' : 'Send SMS Reminder'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Email Reminder Modal */}
            {isEmailModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-lg w-full overflow-hidden animate-scale-up">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-6 py-4 flex items-center justify-between text-white">
                            <h3 className="text-base font-bold flex items-center gap-2.5">
                                <Mail className="w-5 h-5 text-blue-100" />
                                <span>Send Email Reminder to Tenant</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsEmailModalOpen(false)}
                                className="text-white/80 hover:text-white transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSendEmailReminder} className="p-6 space-y-4">
                            {/* Tenant Info Card */}
                            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
                                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recipient</p>
                                        <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{fullName || 'Unknown Applicant'}</p>
                                    </div>
                                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                        App #{applicant.id}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-200/60 dark:border-slate-800">
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${applicant.is_consent_completed
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                        }`}>
                                        Consent: {applicant.is_consent_completed ? 'Completed' : 'Incomplete'}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${(applicant.payment_status === 'paid' || applicant.payment_status === 'completed')
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                        }`}>
                                        Payment: {applicant.payment_status || 'Unpaid'}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${(applicant.status === 'submitted' || applicant.status === 'approved')
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                        : 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300'
                                        }`}>
                                        App: {applicant.status || 'Draft'}
                                    </span>
                                </div>
                            </div>

                            {/* Recipient Email Input */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Recipient Email Address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Mail className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <input
                                        type="email"
                                        value={emailRecipient}
                                        onChange={(e) => setEmailRecipient(e.target.value)}
                                        placeholder="tenant@example.com"
                                        className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Subject Line Input */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Email Subject <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={emailSubject}
                                    onChange={(e) => {
                                        setEmailSubject(e.target.value);
                                        setSelectedEmailTemplate('custom');
                                    }}
                                    placeholder="Enter subject line..."
                                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none"
                                    required
                                />
                            </div>

                            {/* Templates Quick Select */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Quick Email Templates
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleApplyEmailTemplate('smart')}
                                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all truncate text-left cursor-pointer ${selectedEmailTemplate === 'smart'
                                            ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300 font-extrabold'
                                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                            }`}
                                    >
                                        ✨ Smart Reminder
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleApplyEmailTemplate('consent')}
                                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all truncate text-left cursor-pointer ${selectedEmailTemplate === 'consent'
                                            ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300 font-extrabold'
                                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                            }`}
                                    >
                                        📋 Consent Form
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleApplyEmailTemplate('payment')}
                                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all truncate text-left cursor-pointer ${selectedEmailTemplate === 'payment'
                                            ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300 font-extrabold'
                                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                            }`}
                                    >
                                        💳 Payment Unpaid
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleApplyEmailTemplate('application')}
                                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all truncate text-left cursor-pointer ${selectedEmailTemplate === 'application'
                                            ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300 font-extrabold'
                                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                            }`}
                                    >
                                        📝 Incomplete Form
                                    </button>
                                </div>
                            </div>

                            {/* Message Textarea */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Email Message Body <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows="5"
                                    value={emailMessage}
                                    onChange={(e) => {
                                        setEmailMessage(e.target.value);
                                        setSelectedEmailTemplate('custom');
                                    }}
                                    placeholder="Type your email message here..."
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none resize-none leading-relaxed"
                                    required
                                />
                            </div>

                            {/* Email info banner */}
                            <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 p-3 rounded-xl flex items-center justify-between text-[11px] text-blue-900 dark:text-blue-200">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                    <span className="font-semibold">Branded email with direct action button will be sent to the tenant.</span>
                                </div>
                                <span className="text-[10px] text-blue-700 dark:text-blue-300 font-medium">
                                    Logged to Email Logs
                                </span>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => setIsEmailModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={sendingEmail || !emailRecipient.trim() || !emailSubject.trim() || !emailMessage.trim()}
                                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer active:scale-95"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>{sendingEmail ? 'Sending Email...' : 'Send Email Reminder'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            <style dangerouslySetInnerHTML={{
                __html: `
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