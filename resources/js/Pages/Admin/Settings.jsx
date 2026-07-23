import { useState, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Save, Settings as SettingsIcon, DollarSign, CheckCircle2, Building, Check, ChevronDown, Search, Users, Clock } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

function MultiSelectDropdown({ options, selectedValues, onChange, placeholder = "Select users..." }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (value) => {
        const updated = selectedValues.includes(value)
            ? selectedValues.filter(v => v !== value)
            : [...selectedValues, value];
        onChange(updated);
    };

    const selectedOptions = options.filter(opt => selectedValues.includes(opt.value));
    const filteredOptions = options.filter(opt => 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (opt.sublabel && opt.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all text-xs font-semibold text-slate-700 dark:text-slate-300 text-left min-h-[38px] shadow-sm select-none"
            >
                <div className="flex flex-wrap gap-1 flex-1">
                    {selectedOptions.length === 0 ? (
                        <span className="text-slate-400 dark:text-slate-500 font-medium">{placeholder}</span>
                    ) : (
                        selectedOptions.map(opt => (
                            <span
                                key={opt.value}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-[#0e4a81] to-[#1a6bb5] text-white text-[10px] font-bold rounded-lg leading-tight"
                            >
                                {opt.label}
                            </span>
                        ))
                    )}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute left-0 right-0 mt-1.5 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-hidden flex flex-col">
                    {/* Search Field */}
                    <div className="p-2 border-b border-slate-100 dark:border-slate-700 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search user..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#0e4a81] dark:focus:border-[#5a9bd5] text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                    </div>

                    {/* Options List */}
                    <div className="overflow-y-auto flex-1 py-1 max-h-40">
                        {filteredOptions.map(opt => {
                            const isChecked = selectedValues.includes(opt.value);
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => toggleOption(opt.value)}
                                    className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                                >
                                    <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                                        isChecked 
                                            ? 'bg-gradient-to-r from-[#0e4a81] to-[#1a6bb5] border-transparent text-white' 
                                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                                    }`}>
                                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3px]" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate leading-tight">{opt.label}</p>
                                        {opt.sublabel && (
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5 leading-none">{opt.sublabel}</p>
                                        )}
                                    </div>
                                </button>
                            );
                        })}

                        {filteredOptions.length === 0 && (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center py-4">No users found</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Settings({ adultApplicationFee, enableHoldingDeposit, holdingDepositAmount, enableEmailNotifications = true, enableConsentReminders, enablePaymentReminders, properties = [], admins = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        adult_application_fee: adultApplicationFee,
        enable_holding_deposit: enableHoldingDeposit,
        holding_deposit_amount: holdingDepositAmount,
        enable_email_notifications: enableEmailNotifications,
        enable_consent_reminders: enableConsentReminders,
        enable_payment_reminders: enablePaymentReminders,
        property_settings: properties.map(p => ({
            id: p.id,
            app_notification_recipients: p.app_notification_recipients || [],
            reminder_notification_recipients: p.reminder_notification_recipients || []
        }))
    });

    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [activeTab, setActiveTab] = useState('fees');

    const tabs = [
        { id: 'fees', name: 'Fees & Deposits', icon: DollarSign, description: 'Manage fee amounts and deposit settings' },
        { id: 'reminders', name: 'Email Reminders', icon: Clock, description: 'Toggle automated consent and payment reminders' },
        { id: 'routing', name: 'Notification Routing', icon: Building, description: 'Map properties to recipient admin accounts' }
    ];

    const handlePropertyRecipientsChange = (propertyId, field, selectedUserIds) => {
        setData('property_settings', data.property_settings.map(item => {
            if (item.id === propertyId) {
                return {
                    ...item,
                    [field]: selectedUserIds
                };
            }
            return item;
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            onSuccess: () => {
                setShowSuccessAlert(true);
                toast.success('Settings updated successfully!');
                setTimeout(() => setShowSuccessAlert(false), 5000);
            },
            onError: () => {
                toast.error('Failed to update settings. Please check the fields.');
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Toaster position="top-right" />
            <div className="bg-gradient-to-br from-slate-50/40 via-white to-slate-50/40 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-[calc(100vh-64px)]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
                    
                    {/* Header */}
                    <div className="mb-10">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-3">
                                    <SettingsIcon className="h-8 w-8 text-[#0e4a81] dark:text-[#5a9bd5]" />
                                    System Settings
                                </h1>
                                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
                                    Configure global application variables and notification routing rules
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Success Alert Card */}
                    {showSuccessAlert && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 shadow-sm animate-fade-in">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <div>
                                <span className="font-semibold">Success!</span> System settings have been updated and are active immediately.
                            </div>
                        </div>
                    )}

                    {/* Settings Form Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-lg overflow-visible transition-all duration-300">
                        
                        {/* Dynamic Card Header */}
                        <div className="bg-gradient-to-r from-[#0e4a81] to-[#1a5c9e] dark:from-[#1a5c9e] dark:to-[#0e4a81] px-6 py-4 flex items-center justify-between border-b border-slate-200/20 dark:border-slate-700/20 rounded-t-2xl">
                            <div className="flex items-center gap-2.5">
                                <SettingsIcon className="h-5 w-5 text-white animate-pulse" />
                                <h2 className="text-base font-bold text-white tracking-wide">System Settings Console</h2>
                            </div>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-100/70 bg-white/10 px-2 py-0.5 rounded-md">
                                Live Database
                            </span>
                        </div>

                        {/* Tab Navigation Strip */}
                        <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/10">
                            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-slate-700/80">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-start gap-3.5 px-6 py-4 text-left transition-all duration-200 select-none outline-none relative ${
                                                isActive 
                                                    ? 'bg-white dark:bg-slate-800' 
                                                    : 'hover:bg-slate-100/30 dark:hover:bg-slate-800/10 bg-slate-50/30 dark:bg-slate-900/5'
                                            }`}
                                        >
                                            <div className={`p-2 rounded-xl shrink-0 transition-all duration-300 ${
                                                isActive 
                                                    ? 'bg-[#0e4a81]/10 dark:bg-[#5a9bd5]/15 text-[#0e4a81] dark:text-[#5a9bd5] scale-105' 
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                                            }`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <span className={`block text-xs font-extrabold tracking-wide uppercase transition-colors duration-200 ${
                                                    isActive ? 'text-[#0e4a81] dark:text-[#5a9bd5]' : 'text-slate-500 dark:text-slate-400'
                                                }`}>
                                                    {tab.name}
                                                </span>
                                                <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-normal">
                                                    {tab.description}
                                                </span>
                                            </div>
                                            {isActive && (
                                                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0e4a81] dark:bg-[#5a9bd5] animate-fade-in" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-8">
                            
                            {activeTab === 'fees' && (
                                <div className="space-y-8 animate-fade-in">
                                    {/* Fee per Adult */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                        <div className="md:col-span-1">
                                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Adult Application Fee</h3>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                                                The application screening fee charged per adult member. This amount is used during the Stripe checkout session.
                                            </p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                                Amount per Adult (USD)
                                            </label>
                                            <div className="relative max-w-xs">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                    <span className="text-slate-400 dark:text-slate-500 font-bold">$</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.adult_application_fee}
                                                    onChange={(e) => setData('adult_application_fee', e.target.value)}
                                                    className="block w-full pl-8 pr-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600 focus:border-slate-300 dark:focus:border-slate-600 transition-all text-sm font-bold text-slate-700 dark:text-slate-300"
                                                    required
                                                />
                                            </div>
                                            {errors.adult_application_fee && (
                                                <p className="mt-2 text-sm text-red-500 dark:text-red-400 font-medium">{errors.adult_application_fee}</p>
                                            )}
                                        </div>
                                    </div>

                                    <hr className="border-slate-200 dark:border-slate-700" />

                                    {/* Holding Deposit */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                        <div className="md:col-span-1">
                                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Holding Deposit</h3>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                                                Configure whether a unit holding deposit is required during application checkout, and the deposit amount.
                                            </p>
                                        </div>
                                        <div className="md:col-span-2 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    id="enable_holding_deposit"
                                                    checked={data.enable_holding_deposit}
                                                    onChange={(e) => setData('enable_holding_deposit', e.target.checked)}
                                                    className="h-4.5 w-4.5 rounded text-[#0e4a81] dark:text-[#5a9bd5] border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-[#0e4a81] dark:focus:ring-[#5a9bd5] transition-all cursor-pointer"
                                                />
                                                <label htmlFor="enable_holding_deposit" className="text-sm font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                                                    Enable Holding Deposit Payment
                                                </label>
                                            </div>
                                            {errors.enable_holding_deposit && (
                                                <p className="mt-2 text-sm text-red-500 dark:text-red-400 font-medium">{errors.enable_holding_deposit}</p>
                                            )}

                                            {data.enable_holding_deposit && (
                                                <div className="space-y-2 animate-fade-in">
                                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                        Deposit Amount (USD)
                                                    </label>
                                                    <div className="relative max-w-xs">
                                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                            <span className="text-slate-400 dark:text-slate-500 font-bold">$</span>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={data.holding_deposit_amount}
                                                            onChange={(e) => setData('holding_deposit_amount', e.target.value)}
                                                            className="block w-full pl-8 pr-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600 focus:border-slate-300 dark:focus:border-slate-600 transition-all text-sm font-bold text-slate-700 dark:text-slate-300"
                                                            required={data.enable_holding_deposit}
                                                        />
                                                    </div>
                                                    {errors.holding_deposit_amount && (
                                                        <p className="mt-2 text-sm text-red-500 dark:text-red-400 font-medium">{errors.holding_deposit_amount}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'reminders' && (
                                <div className="space-y-8 animate-fade-in">
                                    {/* Global Email Notifications Switch */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pb-6 border-b border-slate-200 dark:border-slate-700">
                                        <div className="md:col-span-1">
                                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Global Email Notifications</h3>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                                                Master switch to enable or disable all outgoing email notifications across the system.
                                            </p>
                                        </div>
                                        <div className="md:col-span-2 space-y-4">
                                            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                                                <input
                                                    type="checkbox"
                                                    id="enable_email_notifications"
                                                    checked={data.enable_email_notifications}
                                                    onChange={(e) => setData('enable_email_notifications', e.target.checked)}
                                                    className="h-5 w-5 rounded text-[#0e4a81] dark:text-[#5a9bd5] border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-[#0e4a81] dark:focus:ring-[#5a9bd5] transition-all cursor-pointer"
                                                />
                                                <label htmlFor="enable_email_notifications" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                                                    Enable All Outgoing Email Notifications
                                                </label>
                                            </div>
                                            {errors.enable_email_notifications && (
                                                <p className="mt-2 text-sm text-red-500 dark:text-red-400 font-medium">{errors.enable_email_notifications}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Email Reminders */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                        <div className="md:col-span-1">
                                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Reminders</h3>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                                                Configure automatic email reminders to admins and superadmins for incomplete applications and payments.
                                            </p>
                                        </div>
                                        <div className="md:col-span-2 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    id="enable_consent_reminders"
                                                    checked={data.enable_consent_reminders}
                                                    onChange={(e) => setData('enable_consent_reminders', e.target.checked)}
                                                    className="h-4.5 w-4.5 rounded text-[#0e4a81] dark:text-[#5a9bd5] border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-[#0e4a81] dark:focus:ring-[#5a9bd5] transition-all cursor-pointer"
                                                />
                                                <label htmlFor="enable_consent_reminders" className="text-sm font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                                                    Enable Consent Form Reminders (to Triumph and Excel admins)
                                                </label>
                                            </div>
                                            {errors.enable_consent_reminders && (
                                                <p className="mt-2 text-sm text-red-500 dark:text-red-400 font-medium">{errors.enable_consent_reminders}</p>
                                            )}

                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    id="enable_payment_reminders"
                                                    checked={data.enable_payment_reminders}
                                                    onChange={(e) => setData('enable_payment_reminders', e.target.checked)}
                                                    className="h-4.5 w-4.5 rounded text-[#0e4a81] dark:text-[#5a9bd5] border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-[#0e4a81] dark:focus:ring-[#5a9bd5] transition-all cursor-pointer"
                                                />
                                                <label htmlFor="enable_payment_reminders" className="text-sm font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                                                    Enable Payment Reminders (Optional)
                                                </label>
                                            </div>
                                            {errors.enable_payment_reminders && (
                                                <p className="mt-2 text-sm text-red-500 dark:text-red-400 font-medium">{errors.enable_payment_reminders}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'routing' && (
                                <div className="space-y-6 animate-fade-in">
                                    {/* Property Notification Routing */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <Building className="w-5 h-5 text-[#0e4a81] dark:text-[#5a9bd5]" />
                                            Property Notification Routing
                                        </h3>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                                            Assign specific administrators to receive notifications for each property. Recipients configured here will receive emails instead of all administrators. If no recipients are selected, the system will fall back to notifying all administrators.
                                        </p>
                                    </div>

                                    <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-visible shadow-sm bg-slate-50/20 dark:bg-slate-900/10">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-100 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
                                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/3 rounded-tl-2xl">Property</th>
                                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/3">New Application Recipients</th>
                                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/3 rounded-tr-2xl">Consent Reminder Recipients</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                                                {properties.map(prop => {
                                                    const propSetting = data.property_settings?.find(item => item.id === prop.id) || {
                                                        app_notification_recipients: [],
                                                        reminder_notification_recipients: []
                                                    };
                                                    const isExcel = prop.company_name?.toLowerCase() === 'excel';
                                                    
                                                    const adminOptions = admins.map(admin => ({
                                                        value: admin.id,
                                                        label: admin.name,
                                                        sublabel: admin.email
                                                    }));

                                                    return (
                                                        <tr key={prop.id} className="hover:bg-slate-50/55 dark:hover:bg-slate-700/20 transition-all">
                                                            <td className="px-4 py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{prop.property_name}</span>
                                                                    <span className={`w-fit mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${
                                                                        isExcel 
                                                                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900' 
                                                                            : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900'
                                                                    }`}>
                                                                        {prop.company_name}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <MultiSelectDropdown
                                                                    options={adminOptions}
                                                                    selectedValues={propSetting.app_notification_recipients}
                                                                    onChange={(selected) => handlePropertyRecipientsChange(prop.id, 'app_notification_recipients', selected)}
                                                                    placeholder="All Admins (Fallback)"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <MultiSelectDropdown
                                                                    options={adminOptions}
                                                                    selectedValues={propSetting.reminder_notification_recipients}
                                                                    onChange={(selected) => handlePropertyRecipientsChange(prop.id, 'reminder_notification_recipients', selected)}
                                                                    placeholder="All Admins (Fallback)"
                                                                />
                                                            </td>
                                                        </tr>
                                                    );
                                                })}

                                                {properties.length === 0 && (
                                                    <tr>
                                                        <td colSpan="3" className="px-4 py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                                                            No properties configured in the system.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Save Button */}
                            <div className="flex justify-end pt-6 border-t border-slate-200/80 dark:border-slate-700/80">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2.5 bg-gradient-to-r from-[#0e4a81] to-[#1a5c9e] dark:from-[#1a5c9e] dark:to-[#0e4a81] hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md disabled:opacity-50 active:scale-95 select-none"
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>

                        </form>
                    </div>

                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            ` }} />
        </AuthenticatedLayout>
    );
}