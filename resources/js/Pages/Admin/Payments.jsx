import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Search, CreditCard, DollarSign, CheckCircle, Clock,
    AlertCircle, Download, XCircle, ArrowUp, ArrowDown,
    ArrowUpDown, CalendarDays, Inbox, X, RotateCcw
} from 'lucide-react';

export default function Payments({ payments, stats, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortDir, setSortDir] = useState(filters.sort_dir || 'desc');
    const [focusedRowId, setFocusedRowId] = useState(null);

    const push = (extra = {}) => {
        router.get(route('admin.payments.index'), {
            search: searchTerm,
            status: statusFilter,
            sort_by: sortBy,
            sort_dir: sortDir,
            page: 1,
            ...extra
        }, { preserveState: true });
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        push();
    };

    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        router.get(route('admin.payments.index'), {}, { preserveState: true });
    };

    const handleSort = (col) => {
        const dir = sortBy === col && sortDir === 'asc' ? 'desc' : 'asc';
        setSortBy(col);
        setSortDir(dir);
        push({ sort_by: col, sort_dir: dir });
    };

    const handleExport = () => {
        const p = new URLSearchParams({ search: searchTerm, status: statusFilter, sort_by: sortBy, sort_dir: sortDir });
        window.location.href = route('admin.payments.export') + '?' + p.toString();
    };

    const SortIcon = ({ col }) => {
        if (sortBy !== col) return <ArrowUpDown className="w-3 h-3 text-slate-400 dark:text-slate-500 opacity-60 inline-block ml-1" />;
        return sortDir === 'asc'
            ? <ArrowUp className="w-3.5 h-3.5 text-[#0e4a81] dark:text-[#5a9bd5] stroke-[2.5] inline-block ml-1" />
            : <ArrowDown className="w-3.5 h-3.5 text-[#0e4a81] dark:text-[#5a9bd5] stroke-[2.5] inline-block ml-1" />;
    };

    const totalRevenue = stats?.total_revenue ?? (payments.data?.filter(p => p.status === 'completed').reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0);
    const completedRevenue = stats?.completed_revenue ?? totalRevenue;
    const pendingCount = stats?.pending_count ?? (payments.data?.filter(p => p.status === 'pending').length || 0);
    const failedCount = stats?.failed_count ?? (payments.data?.filter(p => p.status === 'failed').length || 0);
    const totalPayments = stats?.total_count ?? (payments.total || 0);

    const statusConfig = {
        completed: { cls: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700', stripe: 'border-l-emerald-500', icon: CheckCircle, label: 'Completed' },
        pending:   { cls: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700',       stripe: 'border-l-amber-500',   icon: Clock,       label: 'Pending' },
        failed:    { cls: 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700',           stripe: 'border-l-rose-500',    icon: AlertCircle, label: 'Failed' },
    };
    const getStatus = (s) => statusConfig[s] || { cls: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300', stripe: 'border-l-slate-400', icon: AlertCircle, label: s || 'Unknown' };

    const STATUS_TABS = [
        { value: '', label: 'All Payments', count: totalPayments },
        { value: 'completed', label: 'Completed', count: stats?.completed_count },
        { value: 'pending', label: 'Pending', count: pendingCount },
        { value: 'failed', label: 'Failed', count: failedCount },
    ];

    const COLS = [
        { label: 'Transaction ID', col: 'id', w: 160 },
        { label: 'Applicant / Contact', col: null, w: 220 },
        { label: 'Amount', col: 'amount', w: 120 },
        { label: 'Status', col: 'status', w: 130 },
        { label: 'Date', col: 'created_at', w: 140 },
        { label: 'Receipt', col: null, w: 90 },
    ];

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-slate-50/70 dark:bg-slate-900 pb-12 transition-colors duration-200">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5">

                    {/* ── Header ── */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_3px_10px_rgba(14,74,129,0.25)]" style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}>
                                <CreditCard className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <h1 className="text-xl sm:text-[22px] font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                                        Payments & Transactions
                                    </h1>
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#e6eef7] text-[#0e4a81] border border-[#bcd3ec] dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800">
                                        {totalPayments.toLocaleString()} total
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Manage, verify, and track all screening fees and application transactions
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleExport}
                                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:border-[#0e4a81] hover:text-[#0e4a81] dark:hover:border-[#5a9bd5] dark:hover:text-[#5a9bd5] transition-all shadow-xs active:scale-95"
                            >
                                <Download className="w-4 h-4" /> Export CSV
                            </button>
                        </div>
                    </div>

                    {/* ── Sized-Up Stats Cards ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                        {[
                            { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: 'All completed revenue', icon: DollarSign, accent: '#0e4a81', borderAccent: 'border-t-[#0e4a81]', light: '#e6eef7' },
                            { label: 'Completed', value: `$${completedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: 'Verified payments', icon: CheckCircle, accent: '#059669', borderAccent: 'border-t-emerald-500', light: '#d1fae5' },
                            { label: 'Pending', value: pendingCount.toLocaleString(), sub: 'Transactions waiting', icon: Clock, accent: '#d97706', borderAccent: 'border-t-amber-500', light: '#fef3c7' },
                            { label: 'Failed', value: failedCount.toLocaleString(), sub: 'Failed attempts', icon: AlertCircle, accent: '#e11d48', borderAccent: 'border-t-rose-500', light: '#ffe4e6' },
                        ].map(({ label, value, sub, icon: Icon, accent, borderAccent, light }) => (
                            <div key={label} className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs px-4 py-3 flex items-center gap-3.5 border-t-[3.5px] ${borderAccent} hover:-translate-y-0.5 hover:shadow-sm transition-all duration-150`}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xs" style={{ background: light }}>
                                    <Icon className="w-5 h-5" style={{ color: accent }} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[20px] font-black text-slate-900 dark:text-slate-100 leading-tight tracking-tight">{value}</p>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">{label}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Search & Filter Bar ── */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs mb-3.5 overflow-hidden">
                        <div className="p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-3">
                            {/* Status Tabs */}
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/60 p-1.5 rounded-xl">
                                {STATUS_TABS.map(tab => (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        onClick={() => { setStatusFilter(tab.value); push({ status: tab.value }); }}
                                        className={`px-4 py-2 text-xs sm:text-[13px] font-bold rounded-lg transition-all flex items-center gap-2 ${statusFilter === tab.value
                                            ? 'bg-white dark:bg-slate-800 text-[#0e4a81] dark:text-[#5a9bd5] shadow-xs'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <span>{tab.label}</span>
                                        {tab.count !== undefined && tab.count !== null && (
                                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${statusFilter === tab.value
                                                ? 'bg-[#0e4a81] text-white'
                                                : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                                            }`}>
                                                {tab.count.toLocaleString()}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Search Form */}
                            <form onSubmit={handleSearch} className="flex-1 flex flex-wrap sm:flex-nowrap items-center justify-end gap-2.5 min-w-[280px]">
                                <div className="relative flex-1 min-w-[200px] max-w-md">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Search by Stripe ID, applicant name, or email…"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-[#0e4a81] focus:ring-2 focus:ring-[#0e4a81]/15 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 font-medium"
                                    />
                                    {searchTerm && (
                                        <button
                                            type="button"
                                            onClick={() => { setSearchTerm(''); push({ search: '' }); }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-xs hover:opacity-95 active:scale-95 transition-all whitespace-nowrap"
                                    style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}
                                >
                                    <Search className="w-4 h-4 flex-shrink-0 text-white" />
                                    <span>Search</span>
                                </button>

                                {(searchTerm || statusFilter) && (
                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        className="flex-shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-xl transition-colors whitespace-nowrap"
                                        title="Reset filters"
                                    >
                                        <RotateCcw className="w-4 h-4 flex-shrink-0" />
                                        <span>Reset</span>
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* ── Table Card ── */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">

                        {/* Table Meta Bar */}
                        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-700/50">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-[#0e4a81] to-[#1a6bb5]" />
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Showing <span className="text-[#0e4a81] dark:text-[#5a9bd5]">{payments.from || 0}–{payments.to || 0}</span> of <span className="text-[#0e4a81] dark:text-[#5a9bd5]">{(payments.total || 0).toLocaleString()}</span> payments
                                </span>
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                                <span className="inline-flex items-center gap-1.5 font-medium">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Completed
                                </span>
                                <span className="inline-flex items-center gap-1.5 font-medium">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-400"></span> Pending
                                </span>
                                <span className="inline-flex items-center gap-1.5 font-medium">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span> Failed
                                </span>
                                {focusedRowId && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                                        Row pinned
                                        <button onClick={() => setFocusedRowId(null)} className="ml-1 hover:text-blue-950 font-black">×</button>
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse" style={{ minWidth: 740 }}>
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                        {COLS.map(({ label, col, w }) => (
                                            <th
                                                key={label || 'act'}
                                                style={{ width: w, minWidth: w }}
                                                onClick={() => col && handleSort(col)}
                                                className={`px-4 py-3.5 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none ${col ? 'cursor-pointer hover:text-[#0e4a81] dark:hover:text-[#5a9bd5] transition-colors' : ''}`}
                                            >
                                                {label}{col && <SortIcon col={col} />}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.data?.map((payment, idx) => {
                                        const sc = getStatus(payment.status);
                                        const StatusIcon = sc.icon;
                                        const isPinned = focusedRowId === payment.id;
                                        const isEven = idx % 2 === 0;

                                        return (
                                            <tr
                                                key={payment.id}
                                                onClick={() => setFocusedRowId(isPinned ? null : payment.id)}
                                                className={`cursor-pointer transition-all duration-150 border-b border-slate-200/80 dark:border-slate-700 border-l-[5px] ${sc.stripe} ${
                                                    isPinned
                                                        ? 'bg-blue-100/90 dark:bg-blue-950/70 ring-2 ring-blue-500 ring-inset shadow-xs'
                                                        : isEven
                                                        ? 'bg-white dark:bg-slate-800 hover:bg-[#e4effb] dark:hover:bg-slate-700/60'
                                                        : 'bg-[#eef4fb] dark:bg-slate-800/60 hover:bg-[#dfeaf8] dark:hover:bg-slate-700/80'
                                                }`}
                                            >
                                                {/* Transaction */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xs ${sc.cls}`}>
                                                            <CreditCard className="w-4 h-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">#PAY-{payment.id}</p>
                                                            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                                                                {payment.stripe_payment_intent_id || '—'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Applicant */}
                                                <td className="px-4 py-3.5">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                                            {payment.applicant?.personal_information?.first_name} {payment.applicant?.personal_information?.last_name}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[190px]">
                                                            {payment.applicant?.email}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Amount */}
                                                <td className="px-4 py-3.5">
                                                    <span className="text-base font-black text-slate-900 dark:text-slate-100">
                                                        ${parseFloat(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border ${sc.cls}`}>
                                                        <StatusIcon className="w-3.5 h-3.5" />
                                                        {sc.label}
                                                    </span>
                                                </td>

                                                {/* Date */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                                        <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="text-xs font-semibold">
                                                            {payment.created_at ? new Date(payment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Receipt */}
                                                <td className="px-4 py-3.5 text-right">
                                                    {payment.status === 'completed' ? (
                                                        <a
                                                            href={route('payment.invoice', payment.id)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            onClick={e => e.stopPropagation()}
                                                            className="inline-flex items-center justify-center w-8 h-8 rounded-xl text-slate-600 dark:text-slate-300 hover:text-[#0e4a81] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-colors shadow-2xs"
                                                            title="Download Receipt PDF"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {(!payments.data || payments.data.length === 0) && (
                                        <tr>
                                            <td colSpan="6" className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#e6eef7] dark:bg-slate-800">
                                                        <Inbox className="w-7 h-7 text-[#0e4a81] dark:text-[#5a9bd5]" />
                                                    </div>
                                                    <p className="text-base font-bold text-slate-700 dark:text-slate-300">No payments found</p>
                                                    <p className="text-xs text-slate-400">Try adjusting your search criteria or filters</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Rounded Pagination ── */}
                        {payments.links && payments.links.length > 3 && payments.data?.length > 0 && (
                            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/60">
                                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                    Page <span className="font-bold text-[#0e4a81] dark:text-[#5a9bd5]">{payments.current_page}</span> of <span className="font-bold text-[#0e4a81] dark:text-[#5a9bd5]">{payments.last_page}</span>
                                    <span className="ml-2 text-slate-400">· {(payments.total || 0).toLocaleString()} records</span>
                                </p>
                                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                                    {payments.links.map((link, i) => {
                                        if (link.label === '...') return <span key={i} className="px-2 text-slate-400 font-bold text-xs">…</span>;
                                        const label = link.label
                                            .replace('&laquo; Previous', '← Prev')
                                            .replace('Next &raquo;', 'Next →');
                                        return (
                                            <Link
                                                key={i}
                                                href={link.url || '#'}
                                                className={`min-w-[34px] h-8 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                                                    link.active
                                                        ? 'bg-gradient-to-r from-[#0e4a81] to-[#1a6bb5] text-white shadow-xs'
                                                        : link.url
                                                        ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs'
                                                        : 'text-slate-300 dark:text-slate-600 cursor-not-allowed bg-transparent'
                                                }`}
                                            >
                                                {label}
                                            </Link>
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