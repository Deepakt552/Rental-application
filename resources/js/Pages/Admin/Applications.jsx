import { useState, useEffect } from 'react';
import { router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Swal from 'sweetalert2';
import {
    Search, Eye, Trash2, Filter, FileText, CheckCircle,
    Clock, X, Users, Building2, Crown, Download,
    ArrowUp, ArrowDown, ArrowUpDown, Shield, DollarSign,
    Calendar, RotateCcw, Home
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
        approved:  { cls: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500', glow: 'shadow-emerald-100' },
        rejected:  { cls: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',         dot: 'bg-rose-500',    glow: 'shadow-rose-100' },
        submitted: { cls: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800',            dot: 'bg-sky-500',     glow: 'shadow-sky-100' },
        draft:     { cls: 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700',       dot: 'bg-slate-400',   glow: '' },
    };
    const getStatus = (s) => statusConfig[s] || statusConfig.draft;

    const total     = applicants.total || 0;
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
        { value: 'draft',     label: 'Draft' },
    ];

    const COLS = [
        { label: 'ID',             col: 'id',            w: 55  },
        { label: 'Applicant',      col: 'applicant',     w: 165 },
        { label: 'Contact',        col: 'email',         w: 175 },
        { label: 'Property Name',  col: 'property_name', w: 170 },
        { label: 'Source',         col: 'source',        w: 110 },
        { label: 'Status',         col: 'status',        w: 95  },
        { label: 'Consent',        col: 'consent_status',w: 85  },
        { label: 'Payment',        col: 'payment_status',w: 85  },
        { label: 'Move In Status', col: 'move_in_status',w: 140 },
        { label: 'Date',           col: 'created_at',    w: 105 },
        { label: 'Actions',        col: null,            w: 70  },
    ];

    const hasActiveFilters = Boolean(
        searchTerm || statusFilter || fromDate || toDate || paymentStatus || consentStatus || sourceFilter || moveInStatusFilter
    );

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-7">

                    {/* ── Header ── */}
                    <div className="flex items-start justify-between mb-7">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}>
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-[22px] font-bold text-slate-800 dark:text-slate-100 leading-tight tracking-tight">{pageTitle}</h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {currentType === 'admin' ? 'Triumph rental applications' :
                                     currentType === 'superadmin' ? 'Excel residential applications' :
                                     'All applications across Triumph & Excel'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:border-[#0e4a81] dark:hover:border-[#5a9bd5] hover:text-[#0e4a81] dark:hover:text-[#5a9bd5] transition-all shadow-sm"
                        >
                            <Download className="w-4 h-4" /> Export
                        </button>
                    </div>

                    {/* ── Stats ── */}
                    {(() => {
                        const statsCards = [
                            {
                                label: currentType === 'admin' ? 'Triumph Applications' : (currentType === 'superadmin' ? 'Excel Applications' : 'Total Applications'),
                                value: total,
                                sub: `Page ${applicants.current_page} of ${applicants.last_page}`,
                                icon: FileText,
                                accent: '#0e4a81',
                                light: '#e6eef7',
                            },
                            {
                                label: 'Pending Review',
                                value: submitted,
                                sub: 'Awaiting action',
                                icon: Clock,
                                accent: '#d97706',
                                light: '#fef3c7',
                            },
                            ...(currentType !== 'superadmin' ? [{
                                label: 'Triumph Total',
                                value: triumphCount,
                                sub: 'Triumph type',
                                icon: Building2,
                                accent: '#1a6bb5',
                                light: '#dbeafe',
                            }] : []),
                            ...(currentType !== 'admin' ? [{
                                label: 'Excel Total',
                                value: excelCount,
                                sub: 'Excel type',
                                icon: Crown,
                                accent: '#7c3aed',
                                light: '#ede9fe',
                            }] : []),
                        ];

                        return (
                            <div className={`grid gap-4 mb-6 ${statsCards.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`}>
                                {statsCards.map(({ label, value, sub, icon: Icon, accent, light }) => (
                                    <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm px-5 py-4 flex items-center gap-4 hover:shadow-md dark:hover:shadow-slate-900/50 transition-all">
                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: light }}>
                                            <Icon className="w-5 h-5" style={{ color: accent }} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[22px] font-bold text-slate-800 dark:text-slate-100 leading-none">{value.toLocaleString()}</p>
                                            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">{label}</p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}

                    {/* ── Filter card ── */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-5 overflow-hidden">

                        {/* Status Tabs (All, Submitted, Draft) */}
                        <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto px-1 pt-1">
                            {STATUS_TABS.map(tab => (
                                <button
                                    key={tab.value}
                                    onClick={() => handleStatusTabChange(tab.value)}
                                    className={`relative px-5 py-2.5 text-xs font-semibold whitespace-nowrap transition-all rounded-t-lg mr-0.5 ${
                                        statusFilter === tab.value 
                                            ? 'text-[#0e4a81] dark:text-[#5a9bd5] border-b-2 border-[#0e4a81] dark:border-[#5a9bd5] bg-gradient-to-b from-[#e6eef7] to-[#f0f5fb] dark:from-slate-700 dark:to-slate-700/80'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                                >
                                    {tab.label}
                                    {tab.count !== undefined && (
                                        <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                                            statusFilter === tab.value 
                                                ? 'bg-[#0e4a81] dark:bg-[#5a9bd5] text-white'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Search & Comprehensive Filters Bar */}
                        <div className="p-4 space-y-3.5">
                            {/* Search row */}
                            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, phone, or property name/code…"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-[#0e4a81] dark:focus:border-[#5a9bd5] focus:ring-2 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="px-5 py-2 text-sm font-semibold text-white rounded-xl flex items-center gap-2 transition-all hover:opacity-90 active:scale-95 shadow-sm"
                                        style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}
                                    >
                                        <Search className="w-3.5 h-3.5" /> Search
                                    </button>
                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={handleResetFilters}
                                            className="px-4 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" /> Reset
                                        </button>
                                    )}
                                </div>
                            </form>

                            {/* Detailed Filter Selectors */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
                                {/* From Date */}
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                        From Date
                                    </label>
                                    <input
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#0e4a81]"
                                    />
                                </div>

                                {/* To Date */}
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                        To Date
                                    </label>
                                    <input
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#0e4a81]"
                                    />
                                </div>

                                {/* Payment Status */}
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                        Payment Status
                                    </label>
                                    <select
                                        value={paymentStatus}
                                        onChange={(e) => setPaymentStatus(e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#0e4a81]"
                                    >
                                        <option value="">All Payments</option>
                                        <option value="paid">Paid</option>
                                        <option value="unpaid">Unpaid</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>

                                {/* Consent Status */}
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                        Consent Status
                                    </label>
                                    <select
                                        value={consentStatus}
                                        onChange={(e) => setConsentStatus(e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#0e4a81]"
                                    >
                                        <option value="">All Consents</option>
                                        <option value="completed">Done / Completed</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>

                                {/* Application Status */}
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                        Application Status
                                    </label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#0e4a81]"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="submitted">Submitted</option>
                                        <option value="draft">Draft</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>

                                {/* Source */}
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                        Source
                                    </label>
                                    <select
                                        value={sourceFilter}
                                        onChange={(e) => setSourceFilter(e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#0e4a81]"
                                    >
                                        <option value="">All Sources</option>
                                        {LEAD_SOURCES.map(src => (
                                            <option key={src} value={src}>{src}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Filter Action Buttons */}
                            <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => push()}
                                    className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0e4a81] hover:bg-[#1a5c9e] rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                                >
                                    <Filter className="w-3.5 h-3.5" /> Apply Filters
                                </button>
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={handleResetFilters}
                                        className="px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700/60 rounded-lg transition-colors"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Table card ── */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">

                        {/* Table meta row */}
                        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-700/50">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-[#0e4a81] to-[#1a6bb5]" />
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Showing <span className="text-[#0e4a81] dark:text-[#5a9bd5]">{applicants.from || 0}–{applicants.to || 0}</span> of <span className="text-[#0e4a81] dark:text-[#5a9bd5]">{total.toLocaleString()}</span> records
                                </span>
                                {currentType && (
                                    <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-[#0e4a81]">
                                        {currentType === 'admin' ? 'Triumph' : 'Excel'}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left" style={{ minWidth: 1050 }}>
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-700/50">
                                        {COLS.map(({ label, col, w }) => (
                                            <th
                                                key={label || 'act'}
                                                style={{ width: w, minWidth: w }}
                                                onClick={() => col && handleSort(col)}
                                                className={`px-3.5 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap select-none border-b border-slate-200 dark:border-slate-700 ${col ? 'cursor-pointer hover:text-[#0e4a81] dark:hover:text-[#5a9bd5] transition-colors' : ''}`}
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
                                                className={`border-b border-slate-200 dark:border-slate-700 transition-all duration-150 hover:bg-blue-50/40 dark:hover:bg-slate-700/50 ${
                                                    isEven ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-800/60'
                                                }`}
                                            >
                                                {/* ID */}
                                                <td className="px-3.5 py-3.5">
                                                    <span className="text-[11px] font-mono font-semibold text-slate-400 dark:text-slate-500">#{a.id}</span>
                                                </td>

                                                {/* Applicant */}
                                                <td className="px-3.5 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div
                                                            className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0 shadow-sm"
                                                            style={isTriumph
                                                                ? { background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', color: '#1d4ed8' }
                                                                : { background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', color: '#6d28d9' }
                                                            }
                                                        >
                                                            {initials}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[140px]">
                                                                {a.personal_information?.first_name} {a.personal_information?.last_name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Contact */}
                                                <td className="px-3.5 py-3.5">
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[170px]" title={a.email || ''}>{a.email || '—'}</p>
                                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{a.personal_information?.phone || '—'}</p>
                                                </td>

                                                {/* Property Name (Chosen by applicant - Not Triumph/Excel badge) */}
                                                <td className="px-3.5 py-3.5">
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[165px]" title={chosenPropertyName}>
                                                            {chosenPropertyName}
                                                        </span>
                                                        {resolvedPropertyCode && (
                                                            <span className="text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                                                                Code: {resolvedPropertyCode}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Source */}
                                                <td className="px-3.5 py-3.5">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 truncate max-w-[110px]" title={resolvedSource}>
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
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                                                            <Shield className="w-3 h-3" /> Done
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
                                                            <Shield className="w-3 h-3" /> Pending
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Payment */}
                                                <td className="px-3.5 py-3.5">
                                                    {a.payment_status === 'paid' ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                                                            <DollarSign className="w-3 h-3" /> Paid
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
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
                                                            className={`text-[11px] font-bold py-1 px-2 rounded-lg border focus:outline-none transition-colors cursor-pointer w-[125px] ${
                                                                moveInVal === 'moved_in'
                                                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                                                                    : moveInVal === 'denied'
                                                                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-700'
                                                                    : 'bg-slate-50 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
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
                                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                                                            {new Date(a.created_at).toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles', month: 'short', day: '2-digit', year: 'numeric' })}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap font-mono mt-0.5">
                                                            {new Date(a.created_at).toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit', hour12: true })}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-3.5 py-3.5">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={`/admin/applications/${a.id}`}
                                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-[#0e4a81] dark:hover:text-[#5a9bd5] transition-colors bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                                                            title="View"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => {
                                                                const fullName = [a.personal_information?.first_name, a.personal_information?.last_name].filter(Boolean).join(' ') || 'Unknown Applicant';
                                                                handleDelete(a.id, fullName);
                                                            }}
                                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
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
                                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-slate-700">
                                                        <Users className="w-7 h-7 text-[#0e4a81] dark:text-[#5a9bd5]" />
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No applications found</p>
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
                            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-700/30">
                                <p className="text-xs text-slate-500 dark:text-slate-400 order-2 sm:order-1">
                                    Page <span className="font-bold text-slate-700 dark:text-slate-300">{applicants.current_page}</span> of <span className="font-bold text-slate-700 dark:text-slate-300">{applicants.last_page}</span>
                                    <span className="ml-2 text-slate-400 dark:text-slate-500">· {total.toLocaleString()} total</span>
                                </p>
                                <div className="flex items-center gap-1 order-1 sm:order-2 flex-wrap justify-center">
                                    {applicants.links.map((link, i) => {
                                        if (link.label === '...') return <span key={i} className="px-2 text-slate-300 dark:text-slate-500 text-xs">…</span>;
                                        let label = link.label
                                            .replace('&laquo; Previous', '←')
                                            .replace('Next &raquo;', '→');
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
                                                className={`min-w-[32px] h-8 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center ${
                                                    link.active
                                                        ? 'bg-gradient-to-r from-[#0e4a81] to-[#1a6bb5] text-white shadow-md dark:shadow-slate-900/30'
                                                        : link.url
                                                        ? 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                                                        : 'text-slate-300 dark:text-slate-600 cursor-not-allowed bg-white dark:bg-slate-700'
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