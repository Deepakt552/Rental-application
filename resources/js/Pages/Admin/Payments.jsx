import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Search, CreditCard, DollarSign, CheckCircle, Clock,
    AlertCircle, Download, XCircle, ArrowUp, ArrowDown,
    ArrowUpDown, CalendarDays, Inbox
} from 'lucide-react';

export default function Payments({ payments, stats, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortDir, setSortDir] = useState(filters.sort_dir || 'desc');

    const push = (extra = {}) => {
        router.get(route('admin.payments.index'), {
            search: searchTerm,
            status: statusFilter,
            sort_by: sortBy,
            sort_dir: sortDir,
            ...extra
        }, { preserveState: true });
    };

    const resetFilters = () => {
        setSearchTerm(''); setStatusFilter('');
        router.get(route('admin.payments.index'), {}, { preserveState: true });
    };

    const handleSort = (col) => {
        const dir = sortBy === col && sortDir === 'asc' ? 'desc' : 'asc';
        setSortBy(col); setSortDir(dir);
        push({ sort_by: col, sort_dir: dir });
    };

    const handleExport = () => {
        const p = new URLSearchParams({ search: searchTerm, status: statusFilter, sort_by: sortBy, sort_dir: sortDir });
        window.location.href = route('admin.payments.export') + '?' + p.toString();
    };

    const SortIcon = ({ col }) => {
        if (sortBy !== col) return <ArrowUpDown className="w-3 h-3 inline-block ml-1 opacity-25 dark:opacity-40" />;
        return sortDir === 'asc'
            ? <ArrowUp className="w-3 h-3 inline-block ml-1 text-[#0e4a81] dark:text-[#5a9bd5]" />
            : <ArrowDown className="w-3 h-3 inline-block ml-1 text-[#0e4a81] dark:text-[#5a9bd5]" />;
    };

    // Calculate from full backend stats if provided, otherwise compute from dataset completed payments only
    const completedRevenue = stats?.completed_revenue ?? (payments.data?.filter(p => p.status === 'completed').reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0);
    const totalRevenue = stats?.total_revenue ?? completedRevenue; // Only count succeeded/completed payments towards revenue
    const pendingCount = stats?.pending_count ?? (payments.data?.filter(p => p.status === 'pending').length || 0);
    const failedCount = stats?.failed_count ?? (payments.data?.filter(p => p.status === 'failed').length || 0);

    const statusConfig = {
        completed: { cls: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400', icon: CheckCircle, label: 'Completed' },
        pending: { cls: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400', icon: Clock, label: 'Pending' },
        failed: { cls: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400', icon: AlertCircle, label: 'Failed' },
    };
    const getStatus = (s) => statusConfig[s] || { cls: 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400', icon: AlertCircle, label: s || 'Unknown' };

    const STATUS_TABS = [
        { value: '', label: 'All Payments', count: stats?.total_count },
        { value: 'completed', label: 'Completed', count: stats?.completed_count },
        { value: 'pending', label: 'Pending', count: stats?.pending_count },
        { value: 'failed', label: 'Failed', count: stats?.failed_count },
    ];

    const COLS = [
        { label: 'Transaction', col: 'id', w: 140 },
        { label: 'Applicant', col: null, w: 220 },
        { label: 'Amount', col: 'amount', w: 100 },
        { label: 'Status', col: 'status', w: 120 },
        { label: 'Date', col: 'created_at', w: 130 },
        { label: 'Receipt', col: null, w: 90 },
    ];

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen dark:bg-slate-900">
                <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-7">

                    {/* ── Header ── */}
                    <div className="flex items-start justify-between mb-7">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}>
                                <CreditCard className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-[22px] font-bold text-slate-800 dark:text-slate-100 leading-tight tracking-tight">Payments</h1>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Manage and track all transaction activities</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleExport}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:border-[#0e4a81] dark:hover:border-[#5a9bd5] hover:text-[#0e4a81] dark:hover:text-[#5a9bd5] transition-all shadow-sm"
                            >
                                <Download className="w-4 h-4" /> Export
                            </button>
                        </div>
                    </div>

                    {/* ── Stats ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {[
                            { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: 'Successful payments total', icon: DollarSign, accent: '#0e4a81', light: '#e6eef7' },
                            { label: 'Completed', value: `$${completedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: 'Successful payments', icon: CheckCircle, accent: '#059669', light: '#d1fae5' },
                            { label: 'Pending', value: pendingCount.toLocaleString(), sub: 'Transactions waiting', icon: Clock, accent: '#d97706', light: '#fef3c7' },
                            { label: 'Failed', value: failedCount.toLocaleString(), sub: 'Failed transactions', icon: AlertCircle, accent: '#e11d48', light: '#ffe4e6' },
                        ].map(({ label, value, sub, icon: Icon, accent, light }) => (
                            <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 px-5 py-4 flex items-center gap-4 hover:shadow-md dark:hover:shadow-slate-900/50 transition-all">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 dark:bg-opacity-20" style={{ background: light }}>
                                    <Icon className="w-5 h-5" style={{ color: accent }} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[22px] font-bold text-slate-800 dark:text-slate-100 leading-none">{value}</p>
                                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">{label}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Filter card ── */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mb-5 overflow-hidden">

                        {/* Status tab strip */}
                        <div className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto px-1 pt-1">
                            {STATUS_TABS.map(tab => (
                                <button
                                    key={tab.value}
                                    onClick={() => { setStatusFilter(tab.value); push({ status: tab.value }); }}
                                    className={statusFilter === tab.value 
                                        ? 'relative px-5 py-2.5 text-xs font-semibold whitespace-nowrap transition-all rounded-t-lg mr-0.5 text-[#0e4a81] dark:text-[#5a9bd5] border-b-2 border-[#0e4a81] dark:border-[#5a9bd5] bg-gradient-to-b from-[#e6eef7] to-[#f0f5fb] dark:from-slate-800 dark:to-slate-800/80'
                                        : 'relative px-5 py-2.5 text-xs font-semibold whitespace-nowrap transition-all rounded-t-lg mr-0.5 text-slate-400 dark:text-slate-500'}
                                >
                                    {tab.label}
                                    {tab.count !== undefined && tab.count !== null && (
                                        <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                                            statusFilter === tab.value 
                                                ? 'bg-[#0e4a81] dark:bg-[#5a9bd5] text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                        }`}>
                                            {tab.count.toLocaleString()}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Search row */}
                        <div className="flex flex-col sm:flex-row gap-3 p-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search by Stripe ID, applicant name, or email..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && push()}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0e4a81] dark:focus:border-[#5a9bd5] focus:ring-2 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => push()}
                                    className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl flex items-center gap-2 transition-all hover:opacity-90 active:scale-95 shadow-sm"
                                    style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}
                                >
                                    <Search className="w-3.5 h-3.5" /> Search
                                </button>
                                {(searchTerm || statusFilter) && (
                                    <button
                                        onClick={resetFilters}
                                        className="px-4 py-2.5 text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                                    >
                                        <XCircle className="w-3.5 h-3.5" /> Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Table card ── */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">

                        {/* Table meta */}
                        <div className="px-5 py-3 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#f8fafd] to-[#f0f5fb] dark:from-slate-800 dark:to-slate-800/50">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #0e4a81, #1a6bb5)' }} />
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                    Showing <span className="text-[#0e4a81] dark:text-[#5a9bd5]">{payments.from}–{payments.to}</span> of <span className="text-[#0e4a81] dark:text-[#5a9bd5]">{(payments.total || 0).toLocaleString()}</span> payments
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left" style={{ minWidth: 700 }}>
                                <thead>
                                    <tr className="bg-[#f8fafd] dark:bg-slate-800/50">
                                        {COLS.map(({ label, col, w }) => (
                                            <th
                                                key={label || 'act'}
                                                style={{ width: w, minWidth: w }}
                                                onClick={() => col && handleSort(col)}
                                                className={`px-4 py-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap select-none border-b border-slate-100 dark:border-slate-800 ${col ? 'cursor-pointer hover:text-[#0e4a81] dark:hover:text-[#5a9bd5] transition-colors' : ''}`}
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
                                        const isEven = idx % 2 === 0;
                                        return (
                                            <tr
                                                key={payment.id}
                                                className={isEven ? 'group border-b border-slate-50 dark:border-slate-800 transition-all duration-150 hover:bg-blue-50/40 dark:hover:bg-slate-800/30 bg-white dark:bg-slate-900' : 'group border-b border-slate-50 dark:border-slate-800 transition-all duration-150 hover:bg-blue-50/40 dark:hover:bg-slate-800/30 bg-[#fafbfd] dark:bg-slate-800/50'}
                                            >
                                                {/* Transaction */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div
                                                            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${payment.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}
                                                        >
                                                            <CreditCard className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">#PAY-{payment.id}</p>
                                                            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate max-w-[120px]">{payment.stripe_payment_intent_id || '—'}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Applicant */}
                                                <td className="px-4 py-3.5">
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                            {payment.applicant?.personal_information?.first_name} {payment.applicant?.personal_information?.last_name}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                                                            {payment.applicant?.email}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Amount */}
                                                <td className="px-4 py-3.5">
                                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                                        ${parseFloat(payment.amount).toLocaleString()}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${sc.cls}`}>
                                                        <StatusIcon className="w-2.5 h-2.5" />
                                                        {sc.label}
                                                    </span>
                                                </td>

                                                {/* Date */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <CalendarDays className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                            {payment.created_at ? new Date(payment.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Receipt */}
                                                <td className="px-4 py-3.5 text-right">
                                                    {payment.status === 'completed' ? (
                                                        <a
                                                            href={route('payment.invoice', payment.id)}
                                                            target="_blank"
                                                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 dark:text-slate-500 hover:text-[#0e4a81] dark:hover:text-[#5a9bd5] transition-colors bg-slate-100 dark:bg-slate-800"
                                                            title="Download Receipt"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-[11px] font-medium text-slate-300 dark:text-slate-600 mr-2">—</span>
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
                                                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No payments found</p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500">Try adjusting your search or filters</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Pagination ── */}
                        {payments.links && payments.links.length > 3 && payments.data?.length > 0 && (
                            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#f8fafd] dark:bg-slate-800/30">
                                <p className="text-xs text-slate-500 dark:text-slate-400 order-2 sm:order-1">
                                    Page <span className="font-bold text-slate-700 dark:text-slate-300">{payments.current_page}</span> of <span className="font-bold text-slate-700 dark:text-slate-300">{payments.last_page}</span>
                                    <span className="ml-2 text-slate-400 dark:text-slate-500">· {(payments.total || 0).toLocaleString()} total</span>
                                </p>
                                <div className="flex items-center gap-1 order-1 sm:order-2 flex-wrap justify-center">
                                    {payments.links.map((link, i) => {
                                        if (link.label === '...') return <span key={i} className="px-2 text-slate-300 dark:text-slate-600 text-xs">…</span>;
                                        const label = link.label
                                            .replace('&laquo; Previous', '←')
                                            .replace('Next &raquo;', '→');
                                        return (
                                            <Link
                                                key={i}
                                                href={link.url || '#'}
                                                className={link.active
                                                    ? 'min-w-[32px] h-8 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center bg-gradient-to-r from-[#0e4a81] to-[#1a6bb5] text-white shadow-md dark:shadow-slate-900/30'
                                                    : link.url
                                                    ? 'min-w-[32px] h-8 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                    : 'min-w-[32px] h-8 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center text-slate-300 dark:text-slate-600 cursor-not-allowed bg-white dark:bg-slate-800'
                                                }
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