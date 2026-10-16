import { useState, useEffect } from 'react';
import { router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Swal from 'sweetalert2';
import {
    Search, Eye, Trash2, Filter, FileText, CheckCircle,
    Clock, X, Users, Building2, Crown, Download,
    ArrowUp, ArrowDown, ArrowUpDown, Shield, DollarSign,
    Calendar, RotateCcw, Home, ChevronDown
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

export default function Applications({ applicants, filters, total_admin, total_superadmin, submitted_count }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');
    const [paymentStatus, setPaymentStatus] = useState(filters.payment_status || '');
    const [consentStatus, setConsentStatus] = useState(filters.consent_status || '');
    const [sourceFilter, setSourceFilter] = useState(filters.source || '');
    const [moveInStatusFilter, setMoveInStatusFilter] = useState(filters.move_in_status || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortDir, setSortDir] = useState(filters.sort_dir || 'desc');
    const [updatingMoveInId, setUpdatingMoveInId] = useState(null);
    const [focusedRowId, setFocusedRowId] = useState(null);

    const currentType = filters.type || null;

    // Cache current applications URL to ensure back button from detail page restores exact page and filters
    useEffect(() => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('last_applications_url', window.location.href);
        }
    }, [applicants.current_page, filters]);

    const push = (extra = {}) => {
        const params = {
            search: searchTerm,
            status: statusFilter,
            from_date: fromDate,
            to_date: toDate,
            payment_status: paymentStatus,
            consent_status: consentStatus,
            source: sourceFilter,
            move_in_status: moveInStatusFilter,
            sort_by: sortBy,
            sort_dir: sortDir,
            page: 1,
            ...extra
        };

        // Remove empty filters
        Object.keys(params).forEach(k => {
            if (params[k] === '' || params[k] === null || params[k] === undefined) {
                delete params[k];
            }
        });

        if (currentType) params.type = currentType;
        router.get(route('admin.applications.index'), params, { preserveState: true });
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        push();
    };

    const handleStatusTabChange = (status) => {
        setStatusFilter(status);
        push({ status, page: 1 });
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setFromDate('');
        setToDate('');
        setPaymentStatus('');
        setConsentStatus('');
        setSourceFilter('');
        setMoveInStatusFilter('');
        const params = {};
        if (currentType) params.type = currentType;
        router.get(route('admin.applications.index'), params, { preserveState: true });
    };

    const handleMoveInStatusChange = (applicantId, newStatus) => {
        setUpdatingMoveInId(applicantId);
        router.patch(route('admin.applications.move-in-status', applicantId), {
            move_in_status: newStatus
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setUpdatingMoveInId(null);
                const readable = newStatus === 'moved_in' ? 'Moved In' : (newStatus === 'denied' ? 'Denied' : 'Pending');
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `Move-in status set to: ${readable}`,
                    showConfirmButton: false,
                    timer: 2000
                });
            },
            onError: () => {
                setUpdatingMoveInId(null);
                Swal.fire('Error', 'Failed to update move-in status.', 'error');
            }
        });
    };

    const handleDelete = (id, applicantName) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Delete the application for "${applicantName}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/applications/${id}`, {
                    onSuccess: () => Swal.fire('Deleted!', 'The application has been deleted.', 'success'),
                    onError: () => Swal.fire('Error!', 'Failed to delete the application.', 'error')
                });
            }
        });
    };

    const handlePageChange = (pageUrl) => {
        if (!pageUrl) return;
        const url = new URL(pageUrl, window.location.origin);
        const page = url.searchParams.get('page');
        const params = {
            page,
            search: searchTerm,
            status: statusFilter,
            from_date: fromDate,
            to_date: toDate,
            payment_status: paymentStatus,
            consent_status: consentStatus,
            source: sourceFilter,
            move_in_status: moveInStatusFilter,
            sort_by: sortBy,
            sort_dir: sortDir
        };
        Object.keys(params).forEach(k => {
            if (params[k] === '' || params[k] === null || params[k] === undefined) {
                delete params[k];
            }
        });
        if (currentType) params.type = currentType;
        router.get(route('admin.applications.index'), params, { preserveState: true });
    };

    const handleSort = (col) => {
        const dir = sortBy === col && sortDir === 'asc' ? 'desc' : 'asc';
        setSortBy(col);
        setSortDir(dir);
        push({ sort_by: col, sort_dir: dir, page: 1 });
    };

    const handleExport = () => {
        const p = new URLSearchParams();
        if (searchTerm) p.append('search', searchTerm);
        if (statusFilter) p.append('status', statusFilter);
        if (fromDate) p.append('from_date', fromDate);
        if (toDate) p.append('to_date', toDate);
        if (paymentStatus) p.append('payment_status', paymentStatus);
        if (consentStatus) p.append('consent_status', consentStatus);
        if (sourceFilter) p.append('source', sourceFilter);
        if (moveInStatusFilter) p.append('move_in_status', moveInStatusFilter);
        if (sortBy) p.append('sort_by', sortBy);
        if (sortDir) p.append('sort_dir', sortDir);
        if (currentType) p.append('type', currentType);
        window.location.href = route('admin.applications.export') + '?' + p.toString();
    };

    const SortIcon = ({ col }) => {
        if (sortBy !== col) return <ArrowUpDown className="w-3 h-3 text-slate-400 dark:text-slate-500 opacity-60" />;
        return sortDir === 'asc'
            ? <ArrowUp className="w-3.5 h-3.5 text-[#0e4a81] dark:text-[#5a9bd5] stroke-[2.5]" />
            : <ArrowDown className="w-3.5 h-3.5 text-[#0e4a81] dark:text-[#5a9bd5] stroke-[2.5]" />;
    };

    const statusConfig = {
        approved: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30', dot: 'bg-emerald-500', glow: 'shadow-emerald-500/20' },
        rejected: { cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30', dot: 'bg-rose-500', glow: 'shadow-rose-500/20' },
        submitted: { cls: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30', dot: 'bg-sky-500', glow: 'shadow-sky-500/20' },
        draft: { cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30', dot: 'bg-amber-500', glow: '' },
    };
    const getStatus = (s) => statusConfig[s] || statusConfig.draft;

    const total = applicants.total || 0;
    const submitted = submitted_count ?? (applicants.data?.filter(a => a.status === 'submitted').length || 0);
    const triumphCount = total_admin ?? (applicants.data?.filter(a => a.type === 'admin').length || 0);
    const excelCount = total_superadmin ?? (applicants.data?.filter(a => a.type === 'superadmin').length || 0);

    const pageTitle = currentType === 'admin' ? 'Triumph Applications'
        : currentType === 'superadmin' ? 'Excel Applications'
            : 'All Applications';

    // "Approved" tab removed per user request
    const STATUS_TABS = [
        { value: '', label: 'All', count: total },
        { value: 'submitted', label: 'Submitted' },
        { value: 'draft', label: 'Draft' },
    ];

    const COLS = [
        { label: 'ID', col: 'id', w: 55 },
        { label: 'Applicant', col: 'applicant', w: 165 },
        { label: 'Contact', col: 'email', w: 175 },
        { label: 'Property Name', col: 'property_name', w: 170 },
        { label: 'Source', col: 'source', w: 110 },
        { label: 'Status', col: 'status', w: 95 },
        { label: 'Consent', col: 'consent_status', w: 85 },
        { label: 'Payment', col: 'payment_status', w: 85 },
        { label: 'Move In Status', col: 'move_in_status', w: 140 },
        { label: 'Date', col: 'created_at', w: 105 },
        { label: 'Actions', col: null, w: 70 },
    ];

    const hasActiveFilters = Boolean(
        searchTerm || statusFilter || fromDate || toDate || paymentStatus || consentStatus || sourceFilter || moveInStatusFilter
    );

    const detailedFilterCount = [fromDate, toDate, paymentStatus, consentStatus, sourceFilter, moveInStatusFilter].filter(Boolean).length;
    const [showDetailedFilters, setShowDetailedFilters] = useState(detailedFilterCount > 0);

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-slate-50/70 dark:bg-[#0B0F17] relative">
                {/* Subtle ambient glow in dark mode */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none hidden dark:block" />
                <div className="absolute top-64 left-1/3 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none hidden dark:block" />

                <div className="relative w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5">

                    {/* ── Header ── */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_3px_12px_rgba(14,74,129,0.3)] dark:shadow-[0_0_15px_rgba(56,189,248,0.25)]" style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}>
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <h1 className="text-xl sm:text-[22px] font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-none">{pageTitle}</h1>
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#e6eef7] text-[#0e4a81] border border-[#bcd3ec] dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30 dark:shadow-[0_0_10px_rgba(56,189,248,0.15)]">
                                        {total.toLocaleString()} total
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {currentType === 'admin' ? 'Triumph rental applications' :
                                        currentType === 'superadmin' ? 'Excel residential applications' :
                                            'All applications across Triumph & Excel'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleExport}
                                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-white dark:bg-[#111827]/90 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:border-[#0e4a81] hover:text-[#0e4a81] dark:hover:border-sky-500/50 dark:hover:text-sky-300 dark:hover:bg-slate-800/80 transition-all shadow-xs active:scale-95 cursor-pointer"
                            >
                                <Download className="w-4 h-4" /> Export CSV
                            </button>
                        </div>
                    </div>

                    {/* ── Stats Cards (Enhanced Size & Clarity) ── */}
                    {(() => {
                        const statsCards = [
                            {
                                label: currentType === 'admin' ? 'Triumph Apps' : (currentType === 'superadmin' ? 'Excel Apps' : 'Total Applications'),
                                value: total,
                                icon: FileText,
                                accent: '#0e4a81',
                                borderAccent: 'border-t-[#0e4a81] dark:border-t-sky-500',
                                lightBg: '#e6eef7',
                                darkIconStyle: 'dark:bg-sky-500/20 dark:text-sky-400 dark:border dark:border-sky-500/30',
                            },
                            {
                                label: 'Pending Review',
                                value: submitted,
                                icon: Clock,
                                accent: '#d97706',
                                borderAccent: 'border-t-amber-500 dark:border-t-amber-400',
                                lightBg: '#fef3c7',
                                darkIconStyle: 'dark:bg-amber-500/20 dark:text-amber-400 dark:border dark:border-amber-500/30',
                            },
                            ...(currentType !== 'superadmin' ? [{
                                label: 'Triumph Total',
                                value: triumphCount,
                                icon: Building2,
                                accent: '#1a6bb5',
                                borderAccent: 'border-t-blue-500 dark:border-t-blue-400',
                                lightBg: '#dbeafe',
                                darkIconStyle: 'dark:bg-blue-500/20 dark:text-blue-400 dark:border dark:border-blue-500/30',
                            }] : []),
                            ...(currentType !== 'admin' ? [{
                                label: 'Excel Total',
                                value: excelCount,
                                icon: Crown,
                                accent: '#7c3aed',
                                borderAccent: 'border-t-purple-500 dark:border-t-purple-400',
                                lightBg: '#ede9fe',
                                darkIconStyle: 'dark:bg-purple-500/20 dark:text-purple-400 dark:border dark:border-purple-500/30',
                            }] : []),
                        ];

                        return (
                            <div className={`grid gap-3 mb-4 ${statsCards.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
                                {statsCards.map(({ label, value, icon: Icon, accent, borderAccent, lightBg, darkIconStyle }) => (
                                    <div key={label} className={`bg-white dark:bg-[#111827]/90 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] px-4 py-3 flex items-center gap-3.5 border-t-[3.5px] ${borderAccent} hover:-translate-y-0.5 hover:shadow-sm dark:hover:border-slate-700 transition-all duration-150`}>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xs ${darkIconStyle}`} style={{ background: undefined }}>
                                            <Icon className="w-5 h-5 dark:hidden" style={{ color: accent }} />
                                            <Icon className="w-5 h-5 hidden dark:block" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[20px] font-black text-slate-900 dark:text-slate-100 leading-tight tracking-tight">{value.toLocaleString()}</p>
                                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">{label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}

                    {/* ── Filter & Search Bar (Sized Up & User-Friendly) ── */}
                    <div className="bg-white dark:bg-[#111827]/90 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] mb-3.5 overflow-hidden">
                        {/* Unified Search, Status Tabs & Actions Bar */}
                        <div className="p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-3">
                            {/* Status tabs */}
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/90 border border-transparent dark:border-slate-800/80 p-1.5 rounded-xl">
                                {STATUS_TABS.map(tab => (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        onClick={() => handleStatusTabChange(tab.value)}
                                        className={`px-4 py-2 text-xs sm:text-[13px] font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${statusFilter === tab.value
                                            ? 'bg-white dark:bg-gradient-to-r dark:from-sky-600 dark:to-blue-600 text-[#0e4a81] dark:text-white shadow-xs dark:shadow-md dark:shadow-sky-500/20'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:hover:bg-slate-800/60'
                                            }`}
                                    >
                                        <span>{tab.label}</span>
                                        {tab.count !== undefined && (
                                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${statusFilter === tab.value
                                                ? 'bg-[#0e4a81] text-white dark:bg-white/20 dark:text-white'
                                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                                }`}>
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Search Form + Filter Toggle Button */}
                            <form onSubmit={handleSearch} className="flex-1 flex flex-wrap sm:flex-nowrap items-center justify-end gap-2.5 min-w-[280px]">
                                <div className="relative flex-1 min-w-[220px] max-w-md">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Search applicant, email, phone, property…"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:border-[#0e4a81] focus:ring-2 focus:ring-[#0e4a81]/15 dark:focus:border-sky-500 dark:focus:ring-sky-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium shadow-2xs"
                                    />
                                    {searchTerm && (
                                        <button
                                            type="button"
                                            onClick={() => { setSearchTerm(''); push({ search: '' }); }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-0.5 cursor-pointer"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-xs dark:shadow-[0_0_15px_rgba(56,189,248,0.25)] hover:opacity-95 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                                    style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}
                                >
                                    <Search className="w-4 h-4 flex-shrink-0 text-white" />
                                    <span className="font-bold text-white">Search</span>
                                </button>

                                {/* Filters Toggle */}
                                <button
                                    type="button"
                                    onClick={() => setShowDetailedFilters(!showDetailedFilters)}
                                    className={`flex-shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl border transition-colors whitespace-nowrap cursor-pointer ${showDetailedFilters || detailedFilterCount > 0
                                        ? 'bg-blue-50 text-[#0e4a81] border-[#0e4a81] dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/40 dark:shadow-[0_0_12px_rgba(56,189,248,0.15)]'
                                        : 'bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                    title="Toggle additional filter options"
                                >
                                    <Filter className="w-4 h-4 flex-shrink-0" />
                                    <span>Filters</span>
                                    {detailedFilterCount > 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-[#0e4a81] text-white dark:bg-sky-500 dark:text-slate-950 text-[11px] font-extrabold">
                                            {detailedFilterCount}
                                        </span>
                                    )}
                                    <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${showDetailedFilters ? 'rotate-180' : ''}`} />
                                </button>

                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={handleResetFilters}
                                        className="flex-shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700 rounded-xl border border-transparent dark:border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
                                        title="Reset all filters"
                                    >
                                        <RotateCcw className="w-4 h-4 flex-shrink-0" />
                                        <span>Reset</span>
                                    </button>
                                )}
                            </form>
                        </div>

                        {/* Collapsible Detailed Filters (Sized Up & Readable) */}
                        {showDetailedFilters && (
                            <div className="p-4 sm:p-5 bg-slate-50/90 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-3.5">
                                    {/* From Date */}
                                    <div>
                                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                                            From Date
                                        </label>
                                        <input
                                            type="date"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0e4a81] focus:ring-2 focus:ring-[#0e4a81]/15 dark:focus:border-sky-500 dark:focus:ring-sky-500/20 shadow-2xs transition-all"
                                        />
                                    </div>

                                    {/* To Date */}
                                    <div>
                                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                                            To Date
                                        </label>
                                        <input
                                            type="date"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                            className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0e4a81] focus:ring-2 focus:ring-[#0e4a81]/15 dark:focus:border-sky-500 dark:focus:ring-sky-500/20 shadow-2xs transition-all"
                                        />
                                    </div>

                                    {/* Payment Status */}
                                    <div>
                                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                                            Payment
                                        </label>
                                        <select
                                            value={paymentStatus}
                                            onChange={(e) => setPaymentStatus(e.target.value)}
                                            className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0e4a81] focus:ring-2 focus:ring-[#0e4a81]/15 dark:focus:border-sky-500 dark:focus:ring-sky-500/20 shadow-2xs transition-all cursor-pointer"
                                        >
                                            <option value="">All Payments</option>
                                            <option value="paid">Paid</option>
                                            <option value="unpaid">Unpaid</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                    </div>

                                    {/* Consent Status */}
                                    <div>
                                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                                            Consent
                                        </label>
                                        <select
                                            value={consentStatus}
                                            onChange={(e) => setConsentStatus(e.target.value)}
                                            className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0e4a81] focus:ring-2 focus:ring-[#0e4a81]/15 dark:focus:border-sky-500 dark:focus:ring-sky-500/20 shadow-2xs transition-all cursor-pointer"
                                        >
                                            <option value="">All Consents</option>
                                            <option value="completed">Done / Completed</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                    </div>

                                    {/* Application Status */}
                                    <div>
                                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                                            Status
                                        </label>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0e4a81] focus:ring-2 focus:ring-[#0e4a81]/15 dark:focus:border-sky-500 dark:focus:ring-sky-500/20 shadow-2xs transition-all cursor-pointer"
                                        >
                                            <option value="">All Statuses</option>
                                            <option value="submitted">Submitted</option>
                                            <option value="draft">Draft</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>

                                    {/* Move-In Status */}
                                    <div>
                                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                                            Move-In
                                        </label>
                                        <select
                                            value={moveInStatusFilter}
                                            onChange={(e) => setMoveInStatusFilter(e.target.value)}
                                            className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0e4a81] focus:ring-2 focus:ring-[#0e4a81]/15 dark:focus:border-sky-500 dark:focus:ring-sky-500/20 shadow-2xs transition-all cursor-pointer"
                                        >
                                            <option value="">All Move-In</option>
                                            <option value="pending">Pending</option>
                                            <option value="moved_in">Moved In</option>
                                            <option value="denied">Denied</option>
                                        </select>
                                    </div>

                                    {/* Source */}
                                    <div>
                                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                                            Source
                                        </label>
                                        <select
                                            value={sourceFilter}
                                            onChange={(e) => setSourceFilter(e.target.value)}
                                            className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0e4a81] focus:ring-2 focus:ring-[#0e4a81]/15 dark:focus:border-sky-500 dark:focus:ring-sky-500/20 shadow-2xs transition-all cursor-pointer"
                                        >
                                            <option value="">All Sources</option>
                                            {LEAD_SOURCES.map(src => (
                                                <option key={src} value={src}>{src}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-3 mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800">
                                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        {detailedFilterCount > 0 ? (
                                            <span className="inline-flex items-center gap-1.5 text-[#0e4a81] dark:text-sky-400 font-bold">
                                                <span className="w-2 h-2 rounded-full bg-[#0e4a81] dark:bg-sky-400 animate-pulse"></span>
                                                {detailedFilterCount} filter{detailedFilterCount > 1 ? 's' : ''} applied
                                            </span>
                                        ) : (
                                            <span>No extra filters applied</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        {detailedFilterCount > 0 && (
                                            <button
                                                type="button"
                                                onClick={handleResetFilters}
                                                className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-200/90 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl border border-transparent dark:border-slate-700 transition-all cursor-pointer"
                                            >
                                                Clear Filters
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => push()}
                                            className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl transition-all flex items-center gap-2 shadow-xs dark:shadow-[0_0_15px_rgba(56,189,248,0.25)] active:scale-95 hover:opacity-95 cursor-pointer"
                                            style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}
                                        >
                                            <Filter className="w-4 h-4" /> Apply Filters
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Table card ── */}
                    <div className="bg-white dark:bg-[#111827]/90 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">

                        {/* Table meta row */}
                        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-[#0d1527] dark:to-[#111827]">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-[#0e4a81] to-[#1a6bb5] dark:from-sky-400 dark:to-blue-600" />
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Showing <span className="text-[#0e4a81] dark:text-sky-400 font-bold">{applicants.from || 0}–{applicants.to || 0}</span> of <span className="text-[#0e4a81] dark:text-sky-400 font-bold">{total.toLocaleString()}</span> records
                                </span>
                                {currentType && (
                                    <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-[#0e4a81] dark:bg-sky-600">
                                        {currentType === 'admin' ? 'Triumph' : 'Excel'}
                                    </span>
                                )}
                            </div>

                            {/* Status Color Guide & Row Focus Indicator */}
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                                <span className="hidden md:inline-flex items-center gap-1.5 font-medium">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 dark:shadow-[0_0_8px_rgba(56,189,248,0.5)]"></span> Submitted
                                </span>
                                <span className="hidden md:inline-flex items-center gap-1.5 font-medium">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 dark:shadow-[0_0_8px_rgba(251,191,36,0.5)]"></span> Draft
                                </span>
                                <span className="hidden md:inline-flex items-center gap-1.5 font-medium">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 dark:shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span> Opted Out
                                </span>
                                {focusedRowId ? (
                                    <div className="flex items-center gap-2 pl-2 border-l border-slate-300 dark:border-slate-700">
                                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-blue-100 text-blue-800 dark:bg-sky-500/20 dark:text-sky-300 shadow-sm border border-blue-200 dark:border-sky-500/30">
                                            Row #{focusedRowId} focused
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setFocusedRowId(null)}
                                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline cursor-pointer"
                                        >
                                            Clear focus
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 italic hidden sm:inline">
                                        (Click any row to pin focus)
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left" style={{ minWidth: 1050 }}>
                                <thead>
                                    <tr className="bg-slate-100/90 dark:bg-[#0d1527] border-b-2 border-slate-300 dark:border-slate-800">
                                        {COLS.map(({ label, col, w }) => (
                                            <th
                                                key={label || 'act'}
                                                style={{ width: w, minWidth: w }}
                                                onClick={() => col && handleSort(col)}
                                                className={`px-3.5 py-3.5 text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap select-none border-b border-slate-300 dark:border-slate-800 ${col ? 'cursor-pointer hover:text-[#0e4a81] dark:hover:text-sky-400 transition-colors' : ''}`}
                                            >
                                                <div className={`inline-flex items-center gap-1.5 ${label === 'Actions' ? 'justify-end w-full' : ''}`}>
                                                    <span>{label}</span>
                                                    {col && <SortIcon col={col} />}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {applicants.data?.map((a, idx) => {
                                        const sc = getStatus(a.status);
                                        const initials = [a.personal_information?.first_name?.[0], a.personal_information?.last_name?.[0]].filter(Boolean).join('') || '?';
                                        const isTriumph = a.type === 'admin';
                                        const isEven = idx % 2 === 0;
                                        const isOptedOut = Boolean(a.reminders_opted_out);
                                        const isFocused = focusedRowId === a.id;
                                        const isSubmitted = a.status === 'submitted';

                                        // Prominent Left Status Stripe
                                        let borderAccent = 'border-l-[5px] ';
                                        if (isFocused) {
                                            borderAccent += 'border-l-blue-600 dark:border-l-sky-400 ';
                                        } else if (isOptedOut) {
                                            borderAccent += 'border-l-rose-500 dark:border-l-rose-400 ';
                                        } else if (isSubmitted) {
                                            borderAccent += 'border-l-sky-500 dark:border-l-sky-400 ';
                                        } else if (a.status === 'approved') {
                                            borderAccent += 'border-l-emerald-500 dark:border-l-emerald-400 ';
                                        } else if (a.status === 'rejected') {
                                            borderAccent += 'border-l-rose-500 dark:border-l-rose-400 ';
                                        } else {
                                            borderAccent += 'border-l-amber-500 dark:border-l-amber-400 ';
                                        }

                                        // High-clarity alternating row striping:
                                        // Light: Row A (White), Row B (#eef4fb)
                                        // Dark: Row A (#111827), Row B (#141d2d/60)
                                        let rowBg = '';
                                        if (isFocused) {
                                            rowBg = 'bg-[#dbeafe] dark:bg-sky-950/80 ring-2 ring-inset ring-blue-500 dark:ring-sky-400 shadow-sm !opacity-100';
                                        } else if (isOptedOut) {
                                            rowBg = isEven
                                                ? 'bg-white dark:bg-[#111827] opacity-60 hover:opacity-100 grayscale-[25%] hover:grayscale-0 hover:bg-[#dbeafe]/70 dark:hover:bg-slate-800/70'
                                                : 'bg-[#eef4fb] dark:bg-[#141d2d]/60 opacity-60 hover:opacity-100 grayscale-[25%] hover:grayscale-0 hover:bg-[#dbeafe]/70 dark:hover:bg-slate-800/70';
                                        } else {
                                            rowBg = isEven
                                                ? 'bg-white dark:bg-[#111827] hover:bg-[#dbeafe]/70 dark:hover:bg-slate-800/70'
                                                : 'bg-[#eef4fb] dark:bg-[#141d2d]/60 hover:bg-[#dbeafe]/70 dark:hover:bg-slate-800/70';
                                        }

                                        // Resolve Property Name chosen by applicant
                                        const chosenPropertyName = a.property_name || a.property?.property_name || '—';
                                        const resolvedPropertyCode = a.property?.property_code || a.property_code;

                                        // Resolve Lead Source
                                        const resolvedSource = a.source === 'Other' && a.source_other
                                            ? a.source_other
                                            : (a.source || '—');

                                        // Move In Status styling
                                        const moveInVal = a.move_in_status || '';

                                        return (
                                            <tr
                                                key={a.id}
                                                onClick={(e) => {
                                                    if (e.target.closest('button, a, select, input')) return;
                                                    setFocusedRowId(prev => prev === a.id ? null : a.id);
                                                }}
                                                title="Click anywhere on row to pin focus highlight"
                                                className={`group border-b border-slate-200 dark:border-slate-800/70 cursor-pointer transition-all duration-150 ${borderAccent} ${rowBg}`}
                                            >
                                                {/* ID */}
                                                <td className="px-3.5 py-3.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">#{a.id}</span>
                                                        {isFocused && (
                                                            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-sky-400 animate-pulse shadow-sm" title="Row focused" />
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Applicant */}
                                                <td className="px-3.5 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div
                                                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0 shadow-xs ring-1 ring-black/10 dark:ring-white/10 group-hover:scale-105 transition-transform duration-150 ${
                                                                isTriumph
                                                                    ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 dark:from-sky-950/90 dark:to-blue-900/80 dark:text-sky-300 dark:ring-sky-500/30'
                                                                    : 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 dark:from-purple-950/90 dark:to-indigo-900/80 dark:text-purple-300 dark:ring-purple-500/30'
                                                            }`}
                                                        >
                                                            {initials}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[145px]">
                                                                {a.personal_information?.first_name} {a.personal_information?.last_name}
                                                            </p>
                                                            {isOptedOut && (
                                                                <span
                                                                    className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30 whitespace-nowrap"
                                                                    title="Tenant has deactivated automated email reminders"
                                                                >
                                                                    Reminders Opted Out
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Contact */}
                                                <td className="px-3.5 py-3.5">
                                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px]" title={a.email || ''}>{a.email || '—'}</p>
                                                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">{a.personal_information?.phone || '—'}</p>
                                                </td>

                                                {/* Property Name */}
                                                <td className="px-3.5 py-3.5">
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[165px]" title={chosenPropertyName}>
                                                            {chosenPropertyName}
                                                        </span>
                                                        {resolvedPropertyCode && (
                                                            <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                                                                Code: {resolvedPropertyCode}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Source */}
                                                <td className="px-3.5 py-3.5">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/70 dark:border-slate-700 truncate max-w-[110px]" title={resolvedSource}>
                                                        {resolvedSource}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-3.5 py-3.5">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wide ${sc.cls}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dot}`} />
                                                        {a.status || 'Draft'}
                                                    </span>
                                                </td>

                                                {/* Consent */}
                                                <td className="px-3.5 py-3.5">
                                                    {a.consent_record?.status === 'completed' || a.consent_status === 'completed' ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                                                            <Shield className="w-3 h-3" /> Done
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                                                            <Shield className="w-3 h-3" /> Pending
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Payment */}
                                                <td className="px-3.5 py-3.5">
                                                    {a.payment_status === 'paid' ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                                                            <DollarSign className="w-3 h-3" /> Paid
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
                                                            <DollarSign className="w-3 h-3" /> Unpaid
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Move In Status Dropdown */}
                                                <td className="px-3.5 py-3.5">
                                                    <div className="relative">
                                                        <select
                                                            value={moveInVal}
                                                            disabled={updatingMoveInId === a.id}
                                                            onChange={(e) => handleMoveInStatusChange(a.id, e.target.value)}
                                                            className={`text-[11px] font-bold py-1 px-2 rounded-lg border focus:outline-none transition-colors cursor-pointer w-[125px] ${moveInVal === 'moved_in'
                                                                ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/40'
                                                                : moveInVal === 'denied'
                                                                    ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/40'
                                                                    : 'bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                                                                }`}
                                                        >
                                                            <option value="">-- Pending --</option>
                                                            <option value="moved_in">Moved In</option>
                                                            <option value="denied">Denied</option>
                                                        </select>
                                                        {updatingMoveInId === a.id && (
                                                            <div className="absolute right-2 top-2 w-2.5 h-2.5 rounded-full border-2 border-current border-t-transparent animate-spin text-slate-400" />
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Date */}
                                                <td className="px-3.5 py-3.5">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                                                            {new Date(a.created_at).toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles', month: 'short', day: '2-digit', year: 'numeric' })}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono mt-0.5">
                                                            {new Date(a.created_at).toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit', hour12: true })}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-3.5 py-3.5">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={`/admin/applications/${a.id}`}
                                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-white hover:bg-[#0e4a81] dark:hover:bg-sky-600 border border-slate-300/80 dark:border-slate-700 transition-colors bg-white dark:bg-slate-800/90 shadow-2xs cursor-pointer"
                                                            title="View"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => {
                                                                const fullName = [a.personal_information?.first_name, a.personal_information?.last_name].filter(Boolean).join(' ') || 'Unknown Applicant';
                                                                handleDelete(a.id, fullName);
                                                            }}
                                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-white hover:bg-rose-600 border border-slate-300/80 dark:border-slate-700 transition-colors bg-white dark:bg-slate-800/90 shadow-2xs cursor-pointer"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {(!applicants.data || applicants.data.length === 0) && (
                                        <tr>
                                            <td colSpan="11" className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700">
                                                        <Users className="w-7 h-7 text-[#0e4a81] dark:text-sky-400" />
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No applications found</p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500">Try adjusting your search or filters</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Pagination ── */}
                        {applicants.links && applicants.links.length > 3 && applicants.data?.length > 0 && (
                            <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80 dark:bg-[#0d1527]/90">
                                <p className="text-xs text-slate-500 dark:text-slate-400 order-2 sm:order-1 font-medium">
                                    Page <span className="font-bold text-slate-800 dark:text-slate-200">{applicants.current_page}</span> of <span className="font-bold text-slate-800 dark:text-slate-200">{applicants.last_page}</span>
                                    <span className="ml-2 text-slate-400 dark:text-slate-500">· {total.toLocaleString()} total applications</span>
                                </p>
                                <div className="flex items-center gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
                                    {applicants.links.map((link, i) => {
                                        if (link.label === '...') return <span key={i} className="px-2 text-slate-300 dark:text-slate-500 text-xs">…</span>;
                                        let label = link.label
                                            .replace('&laquo; Previous', '← Prev')
                                            .replace('Next &raquo;', 'Next →');
                                        let pageUrl = link.url;
                                        if (pageUrl && currentType) {
                                            const u = new URL(pageUrl, window.location.origin);
                                            u.searchParams.set('type', currentType);
                                            pageUrl = u.toString();
                                        }
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => handlePageChange(pageUrl)}
                                                disabled={!link.url}
                                                className={`min-w-[32px] h-8 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${link.active
                                                    ? 'bg-gradient-to-r from-[#0e4a81] to-[#1a6bb5] dark:from-sky-500 dark:to-blue-600 text-white shadow-xs dark:shadow-md dark:shadow-sky-500/20'
                                                    : link.url
                                                        ? 'bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#0e4a81] hover:text-[#0e4a81] hover:bg-slate-50 dark:hover:bg-slate-700 dark:hover:text-white dark:hover:border-slate-600 shadow-2xs'
                                                        : 'text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-50 dark:bg-slate-900/50'
                                                    }`}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}