import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Swal from 'sweetalert2';
import {
    Search, Eye, Trash2, Filter, FileText, CheckCircle,
    Clock, X, Users, Building2, Crown, Download,
    ArrowUp, ArrowDown, ArrowUpDown, Shield, DollarSign,
    TrendingUp
} from 'lucide-react';

export default function Applications({ applicants, filters, total_admin, total_superadmin, submitted_count }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortDir, setSortDir] = useState(filters.sort_dir || 'desc');

    const currentType = filters.type || null;

    const push = (extra = {}) => {
        const params = { search: searchTerm, status: statusFilter, sort_by: sortBy, sort_dir: sortDir, page: 1, ...extra };
        if (currentType) params.type = currentType;
        router.get(route('admin.applications.index'), params, { preserveState: true });
    };

    const handleSearch = (e) => { e.preventDefault(); push(); };
    const handleStatusChange = (status) => { setStatusFilter(status); push({ status, page: 1 }); };
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
        const params = { page, search: searchTerm, status: statusFilter, sort_by: sortBy, sort_dir: sortDir };
        if (currentType) params.type = currentType;
        router.get(route('admin.applications.index'), params, { preserveState: true });
    };

    const handleSort = (col) => {
        const dir = sortBy === col && sortDir === 'asc' ? 'desc' : 'asc';
        setSortBy(col); setSortDir(dir);
        push({ sort_by: col, sort_dir: dir, page: 1 });
    };

    const handleExport = () => {
        const p = new URLSearchParams({ search: searchTerm, status: statusFilter, sort_by: sortBy, sort_dir: sortDir });
        if (currentType) p.append('type', currentType);
        window.location.href = route('admin.applications.export') + '?' + p.toString();
    };

    const SortIcon = ({ col }) => {
        if (sortBy !== col) return <ArrowUpDown className="w-3 h-3 inline-block ml-1 opacity-25 dark:opacity-40" />;
        return sortDir === 'asc'
            ? <ArrowUp className="w-3 h-3 inline-block ml-1 text-[#0e4a81] dark:text-[#5a9bd5]" />
            : <ArrowDown className="w-3 h-3 inline-block ml-1 text-[#0e4a81] dark:text-[#5a9bd5]" />;
    };

    const statusConfig = {
        approved: { cls: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500', glow: 'shadow-emerald-100' },
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

    const STATUS_TABS = [
        { value: '', label: 'All', count: total },
        { value: 'submitted', label: 'Submitted' },
        { value: 'approved',  label: 'Approved' },
        { value: 'draft',     label: 'Draft' },
    ];

    const COLS = [
        { label: 'ID',        col: 'id',         w: 60  },
        { label: 'Applicant', col: 'id',          w: 190 },
        { label: 'Contact',   col: 'email',       w: 210 },
        { label: 'Property',  col: null,          w: 95  },
        { label: 'Status',    col: 'status',      w: 105 },
        { label: 'Consent',   col: null,          w: 95  },
        { label: 'Payment',   col: null,          w: 95  },
        { label: 'Date',      col: 'created_at',  w: 110 },
        { label: '',          col: null,          w: 70  },
    ];

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
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {[
                            {
                                label: 'Total Applications',
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
                            {
                                label: 'Triumph',
                                value: triumphCount,
                                sub: 'Triumph type',
                                icon: Building2,
                                accent: '#1a6bb5',
                                light: '#dbeafe',
                            },
                            {
                                label: 'Excel',
                                value: excelCount,
                                sub: 'Excel type',
                                icon: Crown,
                                accent: '#7c3aed',
                                light: '#ede9fe',
                            },
                        ].map(({ label, value, sub, icon: Icon, accent, light }) => (
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

                    {/* ── Filter card ── */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-5 overflow-hidden">

                        {/* Tab strip */}
                        <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto px-1 pt-1">
                            {STATUS_TABS.map(tab => (
                                <button
                                    key={tab.value}
                                    onClick={() => handleStatusChange(tab.value)}
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

                        {/* Search row */}
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 p-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or phone number…"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-[#0e4a81] dark:focus:border-[#5a9bd5] focus:ring-2 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl flex items-center gap-2 transition-all hover:opacity-90 active:scale-95 shadow-sm"
                                    style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}
                                >
                                    <Search className="w-3.5 h-3.5" /> Search
                                </button>
                                {(searchTerm || statusFilter) && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchTerm(''); setStatusFilter('');
                                            const params = {};
                                            if (currentType) params.type = currentType;
                                            router.get(route('admin.applications.index'), params, { preserveState: true });
                                        }}
                                        className="px-4 py-2.5 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5"
                                    >
                                        <X className="w-3.5 h-3.5" /> Clear
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* ── Table card ── */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">

                        {/* Table meta row */}
                        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-700/50">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-[#0e4a81] to-[#1a6bb5]" />
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Showing <span className="text-[#0e4a81] dark:text-[#5a9bd5]">{applicants.from}–{applicants.to}</span> of <span className="text-[#0e4a81] dark:text-[#5a9bd5]">{total.toLocaleString()}</span> records
                                </span>
                                {currentType && (
                                    <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-[#0e4a81]">
                                        {currentType === 'admin' ? 'Triumph' : 'Excel'}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left" style={{ minWidth: 860 }}>
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
                                    {applicants.data?.map((a, idx) => {
                                        const sc = getStatus(a.status);
                                        const initials = [a.personal_information?.first_name?.[0], a.personal_information?.last_name?.[0]].filter(Boolean).join('') || '?';
                                        const isTriumph = a.type === 'admin';
                                        const isEven = idx % 2 === 0;
                                        return (
                                            <tr
                                                key={a.id}
                                                className={`border-b border-slate-200 dark:border-slate-700 transition-all duration-150 hover:bg-blue-50/40 dark:hover:bg-slate-700/50 ${
                                                    isEven ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-800/60'
                                                }`}
                                            >
                                                {/* ID */}
                                                <td className="px-4 py-3.5">
                                                    <span className="text-[11px] font-mono font-semibold text-slate-400 dark:text-slate-500">#{a.id}</span>
                                                </td>

                                                {/* Applicant */}
                                                <td className="px-4 py-3.5">
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
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                                                                {a.personal_information?.first_name} {a.personal_information?.last_name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Contact */}
                                                <td className="px-4 py-3.5">
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[195px]">{a.email || '—'}</p>
                                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{a.personal_information?.phone || '—'}</p>
                                                </td>

                                                {/* Property type */}
                                                <td className="px-4 py-3.5">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                                                            isTriumph
                                                                ? 'bg-[#e6eef7] dark:bg-[#0e4a81]/20 text-[#0e4a81] dark:text-[#5a9bd5]'
                                                                : 'bg-[#ede9fe] dark:bg-purple-950/50 text-purple-700 dark:text-purple-400'
                                                        }`}
                                                    >
                                                        {isTriumph ? <Building2 className="w-2.5 h-2.5" /> : <Crown className="w-2.5 h-2.5" />}
                                                        {isTriumph ? 'Triumph' : 'Excel'}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wide ${sc.cls}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dot}`} />
                                                        {a.status || 'Draft'}
                                                    </span>
                                                </td>

                                                {/* Consent */}
                                                <td className="px-4 py-3.5">
                                                    {a.consent_record?.status === 'completed' ? (
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
                                                <td className="px-4 py-3.5">
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

                                                {/* Date */}
                                                <td className="px-4 py-3.5">
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
                                                <td className="px-4 py-3.5">
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
                                            <td colSpan="9" className="py-20 text-center">
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