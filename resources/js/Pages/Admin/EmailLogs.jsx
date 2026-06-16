import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Mail, CheckCircle, XCircle, Search, Filter, Eye,
    Trash2, Send, Users, Shield, Clock, Inbox, Activity,
    AlertCircle, Calendar as CalendarIcon, Download,
    ArrowUp, ArrowDown, ArrowUpDown, XCircle as CloseCircle
} from 'lucide-react';

export default function EmailLogs({ emailLogs, stats, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortDir, setSortDir] = useState(filters.sort_dir || 'desc');

    const push = (extra = {}) => {
        router.get('/admin/email-logs', {
            search: searchTerm,
            type: typeFilter,
            status: statusFilter,
            sort_by: sortBy,
            sort_dir: sortDir,
            ...extra
        }, { preserveState: true });
    };

    const resetFilters = () => {
        setSearchTerm(''); setTypeFilter(''); setStatusFilter('');
        router.get('/admin/email-logs', {}, { preserveState: true });
    };

    const handleSort = (col) => {
        const dir = sortBy === col && sortDir === 'asc' ? 'desc' : 'asc';
        setSortBy(col); setSortDir(dir);
        push({ sort_by: col, sort_dir: dir });
    };

    const handleExport = () => {
        const p = new URLSearchParams({ search: searchTerm, type: typeFilter, status: statusFilter, sort_by: sortBy, sort_dir: sortDir });
        window.location.href = '/admin/email-logs/export?' + p.toString();
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this email log?')) {
            router.delete(`/admin/email-logs/${id}`);
        }
    };

    const handleResend = (id) => {
        if (confirm('Resend this email?')) {
            router.post(`/admin/email-logs/${id}/resend`);
        }
    };

    const SortIcon = ({ col }) => {
        if (sortBy !== col) return <ArrowUpDown className="w-3 h-3 inline-block ml-1 opacity-25 dark:opacity-40" />;
        return sortDir === 'asc'
            ? <ArrowUp className="w-3 h-3 inline-block ml-1 text-[#0e4a81] dark:text-[#5a9bd5]" />
            : <ArrowDown className="w-3 h-3 inline-block ml-1 text-[#0e4a81] dark:text-[#5a9bd5]" />;
    };

    const successRate = stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0;

    const statusConfig = {
        sent: { cls: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400', icon: CheckCircle, label: 'Sent' },
        pending: { cls: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400', icon: Clock, label: 'Pending' },
        failed: { cls: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400', icon: AlertCircle, label: 'Failed' },
    };
    const getStatus = (s) => statusConfig[s] || { cls: 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400', icon: AlertCircle, label: s || 'Unknown' };

    const typeConfig = {
        admin: { cls: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400', icon: Shield, label: 'Admin' },
        superadmin: { cls: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400', icon: Shield, label: 'Super Admin' },
        user: { cls: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400', icon: Users, label: 'User' },
    };
    const getType = (t) => typeConfig[t] || { cls: 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400', icon: Mail, label: t || 'Unknown' };

    const STATUS_TABS = [
        { value: '', label: 'All Logs' },
        { value: 'sent', label: 'Sent' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' },
    ];

    const COLS = [
        { label: 'Recipient', col: 'recipient_email', w: 220 },
        { label: 'Type', col: null, w: 120 },
        { label: 'Subject', col: 'subject', w: 300 },
        { label: 'Status', col: 'status', w: 100 },
        { label: 'Sent At', col: 'created_at', w: 130 },
        { label: '', col: null, w: 120 },
    ];

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-7">

                    {/* ── Header ── */}
                    <div className="flex items-start justify-between mb-7">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}>
                                <Mail className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-[22px] font-bold text-slate-800 dark:text-slate-100 leading-tight tracking-tight">Email Logs</h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Monitor all email communications and delivery status</p>
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
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                        {[
                            { label: 'Total Emails', value: stats.total || 0, sub: 'All communications', icon: Mail, accent: '#0e4a81', light: '#e6eef7' },
                            { label: 'Admin Emails', value: stats.admin_emails || 0, sub: 'Internal alerts', icon: Shield, accent: '#8b5cf6', light: '#f3e8ff' },
                            { label: 'User Emails', value: stats.user_emails || 0, sub: 'Customer comms', icon: Users, accent: '#06b6d4', light: '#cffafe' },
                            { label: 'Success Rate', value: `${successRate}%`, sub: 'Delivery rate', icon: CheckCircle, accent: '#059669', light: '#d1fae5' },
                            { label: 'Failed', value: stats.failed || 0, sub: 'Delivery errors', icon: XCircle, accent: '#e11d48', light: '#ffe4e6' },
                        ].map(({ label, value, sub, icon: Icon, accent, light }) => (
                            <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-5 py-4 flex items-center gap-4 hover:shadow-md dark:hover:shadow-slate-900/50 transition-all">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: light }}>
                                    <Icon className="w-5 h-5" style={{ color: accent }} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[22px] font-bold text-slate-800 dark:text-slate-100 leading-none">{typeof value === 'number' ? value.toLocaleString() : value}</p>
                                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">{label}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Filter card ── */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-5 overflow-hidden">

                        {/* Status tab strip */}
                        <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto px-1 pt-1">
                            {STATUS_TABS.map(tab => (
                                <button
                                    key={tab.value}
                                    onClick={() => { setStatusFilter(tab.value); push({ status: tab.value }); }}
                                    className={`relative px-5 py-2.5 text-xs font-semibold whitespace-nowrap transition-all rounded-t-lg mr-0.5 ${
                                        statusFilter === tab.value 
                                            ? 'text-[#0e4a81] dark:text-[#5a9bd5] border-b-2 border-[#0e4a81] dark:border-[#5a9bd5] bg-gradient-to-b from-[#e6eef7] to-[#f0f5fb] dark:from-slate-700 dark:to-slate-700/80'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Search row */}
                        <div className="flex flex-col sm:flex-row gap-3 p-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search by email, name or subject..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && push()}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-[#0e4a81] dark:focus:border-[#5a9bd5] focus:ring-2 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                                />
                            </div>

                            <div className="w-full sm:w-48 relative">
                                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                <select
                                    value={typeFilter}
                                    onChange={(e) => { setTypeFilter(e.target.value); push({ type: e.target.value }); }}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-[#0e4a81] dark:focus:border-[#5a9bd5] focus:ring-2 text-slate-700 dark:text-slate-300 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">All Account Types</option>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="superadmin">Super Admin</option>
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => push()}
                                    className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl flex items-center gap-2 transition-all hover:opacity-90 active:scale-95 shadow-sm"
                                    style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}
                                >
                                    <Search className="w-3.5 h-3.5" /> Search
                                </button>
                                {(searchTerm || statusFilter || typeFilter) && (
                                    <button
                                        onClick={resetFilters}
                                        className="px-4 py-2.5 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5"
                                    >
                                        <CloseCircle className="w-3.5 h-3.5" /> Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Table card ── */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">

                        {/* Table meta */}
                        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-700/50">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-[#0e4a81] to-[#1a6bb5]" />
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Showing <span className="text-[#0e4a81] dark:text-[#5a9bd5]">{emailLogs.from}–{emailLogs.to}</span> of <span className="text-[#0e4a81] dark:text-[#5a9bd5]">{(emailLogs.total || 0).toLocaleString()}</span> logs
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left" style={{ minWidth: 800 }}>
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-700/50">
                                        {COLS.map(({ label, col, w }) => (
                                            <th
                                                key={label || 'act'}
                                                style={{ width: w, minWidth: w }}
                                                onClick={() => col && handleSort(col)}
                                                className={`px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap select-none border-b border-slate-200 dark:border-slate-700 ${col ? 'cursor-pointer hover:text-[#0e4a81] dark:hover:text-[#5a9bd5] transition-colors' : ''}`}
                                            >
                                                {label}{col && <SortIcon col={col} />}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {emailLogs.data?.map((log, idx) => {
                                        const sc = getStatus(log.status);
                                        const tc = getType(log.recipient_type);
                                        const StatusIcon = sc.icon;
                                        const TypeIcon = tc.icon;
                                        const isEven = idx % 2 === 0;

                                        return (
                                            <tr
                                                key={log.id}
                                                className={`border-b border-slate-200 dark:border-slate-700 transition-all duration-150 hover:bg-blue-50/40 dark:hover:bg-slate-700/50 ${
                                                    isEven ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-800/60'
                                                }`}
                                            >
                                                {/* Recipient */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div
                                                            className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0 shadow-sm text-white"
                                                            style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}
                                                        >
                                                            {log.recipient_name?.charAt(0).toUpperCase() || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{log.recipient_name}</p>
                                                            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[180px]">{log.recipient_email}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Type */}
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${tc.cls}`}>
                                                        <TypeIcon className="w-2.5 h-2.5" />
                                                        {tc.label}
                                                    </span>
                                                </td>

                                                {/* Subject */}
                                                <td className="px-4 py-3.5">
                                                    <p className="text-sm text-slate-700 dark:text-slate-300 max-w-[280px] truncate" title={log.subject}>
                                                        {log.subject}
                                                    </p>
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
                                                        <CalendarIcon className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                            {log.sent_at ? new Date(log.sent_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={`/admin/email-logs/${log.id}`}
                                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-[#0e4a81] dark:hover:text-[#5a9bd5] transition-colors bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </Link>
                                                        {log.status === 'failed' && (
                                                            <button
                                                                onClick={() => handleResend(log.id)}
                                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                                                                title="Resend"
                                                            >
                                                                <Send className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(log.id)}
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

                                    {(!emailLogs.data || emailLogs.data.length === 0) && (
                                        <tr>
                                            <td colSpan="6" className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-slate-700">
                                                        <Inbox className="w-7 h-7 text-[#0e4a81] dark:text-[#5a9bd5]" />
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No email logs found</p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500">Try adjusting your search or filters</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Pagination ── */}
                        {emailLogs.links && emailLogs.links.length > 3 && emailLogs.data?.length > 0 && (
                            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-700/30">
                                <p className="text-xs text-slate-500 dark:text-slate-400 order-2 sm:order-1">
                                    Page <span className="font-bold text-slate-700 dark:text-slate-300">{emailLogs.current_page}</span> of <span className="font-bold text-slate-700 dark:text-slate-300">{emailLogs.last_page}</span>
                                    <span className="ml-2 text-slate-400 dark:text-slate-500">· {(emailLogs.total || 0).toLocaleString()} total</span>
                                </p>
                                <div className="flex items-center gap-1 order-1 sm:order-2 flex-wrap justify-center">
                                    {emailLogs.links.map((link, i) => {
                                        if (link.label === '...') return <span key={i} className="px-2 text-slate-300 dark:text-slate-500 text-xs">…</span>;
                                        const label = link.label
                                            .replace('&laquo; Previous', '←')
                                            .replace('Next &raquo;', '→');
                                        return (
                                            <Link
                                                key={i}
                                                href={link.url || '#'}
                                                className={`min-w-[32px] h-8 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center ${
                                                    link.active
                                                        ? 'bg-gradient-to-r from-[#0e4a81] to-[#1a6bb5] text-white shadow-md dark:shadow-slate-900/30'
                                                        : link.url
                                                        ? 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                                                        : 'text-slate-300 dark:text-slate-600 cursor-not-allowed bg-white dark:bg-slate-700'
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