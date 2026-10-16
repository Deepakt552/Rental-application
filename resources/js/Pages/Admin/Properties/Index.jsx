import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PropertyModal from './PropertyModal';
import Swal from 'sweetalert2';
import {
    Building, Plus, Search, Filter, Edit, Trash2,
    Home, Store, Factory, Users, Calendar,
    Download, XCircle, Inbox, Briefcase,
    ArrowUp, ArrowDown, ArrowUpDown, Building2, Crown,
    X, RotateCcw, MapPin
} from 'lucide-react';

export default function Index({ properties, users, stats, filters = {} }) {
    const [showModal, setShowModal] = useState(false);
    const [editingProperty, setEditingProperty] = useState(null);
    const [modalMode, setModalMode] = useState('create');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [companyFilter, setCompanyFilter] = useState(filters.company || 'all');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortDir, setSortDir] = useState(filters.sort_dir || 'desc');
    const [focusedRowId, setFocusedRowId] = useState(null);
    const { auth } = usePage().props;

    const propertyStats = stats || {
        total: properties.total || properties.data?.length || 0,
        excel: properties.data?.filter(p => p.company_name === 'Excel').length || 0,
        triumph: properties.data?.filter(p => p.company_name === 'Triumph').length || 0,
    };

    const push = (extra = {}) => {
        router.get('/admin/properties', {
            search: searchTerm,
            type: typeFilter,
            company: companyFilter,
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

    const handleCreate = () => { setModalMode('create'); setEditingProperty(null); setShowModal(true); };
    const handleEdit = (p) => { setModalMode('edit'); setEditingProperty(p); setShowModal(true); };

    const handleDelete = (property) => {
        if (!property?.id) return;
        Swal.fire({
            title: 'Are you sure?',
            text: `Delete "${property.property_name}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(r => {
            if (r.isConfirmed) {
                router.delete(`/admin/properties/${property.id}`, {
                    preserveScroll: true,
                    onSuccess: () => Swal.fire('Deleted!', 'Property deleted successfully.', 'success'),
                    onError: () => Swal.fire('Error!', 'Failed to delete property.', 'error'),
                });
            }
        });
    };

    const handleSubmit = (formData) => {
        if (!formData?.property_name) return;
        const payload = { ...formData, added_by: auth.user.id };
        if (modalMode === 'create') {
            router.post('/admin/properties', payload, {
                onSuccess: () => { setShowModal(false); Swal.fire('Success!', 'Property created.', 'success'); },
                onError: () => Swal.fire('Error!', 'Check your input.', 'error'),
            });
        } else {
            if (!editingProperty?.id) return;
            router.put(`/admin/properties/${editingProperty.id}`, payload, {
                onSuccess: () => { setShowModal(false); Swal.fire('Success!', 'Property updated.', 'success'); },
                onError: () => Swal.fire('Error!', 'Check your input.', 'error'),
            });
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setTypeFilter('all');
        setCompanyFilter('all');
        router.get('/admin/properties');
    };

    const handleSort = (col) => {
        const dir = sortBy === col && sortDir === 'asc' ? 'desc' : 'asc';
        setSortBy(col);
        setSortDir(dir);
        push({ sort_by: col, sort_dir: dir });
    };

    const handleExport = () => {
        const p = new URLSearchParams({ search: searchTerm, type: typeFilter, company: companyFilter, sort_by: sortBy, sort_dir: sortDir });
        window.location.href = route('admin.properties.export') + '?' + p.toString();
    };

    const SortIcon = ({ col }) => {
        if (sortBy !== col) return <ArrowUpDown className="w-3 h-3 text-slate-400 dark:text-slate-500 opacity-60 inline-block ml-1" />;
        return sortDir === 'asc'
            ? <ArrowUp className="w-3.5 h-3.5 text-[#0e4a81] dark:text-[#5a9bd5] stroke-[2.5] inline-block ml-1" />
            : <ArrowDown className="w-3.5 h-3.5 text-[#0e4a81] dark:text-[#5a9bd5] stroke-[2.5] inline-block ml-1" />;
    };

    const typeColorMap = {
        Residential: { cls: 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800', icon: Home },
        Commercial:  { cls: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', icon: Store },
        Industrial:  { cls: 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800', icon: Factory },
        Land:        { cls: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800', icon: Building },
        Agricultural:{ cls: 'bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800', icon: Building },
    };
    const getTypeStyle = (t) => typeColorMap[t] || { cls: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200', icon: Building };

    const COMPANY_TABS = [
        { value: 'all', label: 'All Companies', count: propertyStats.total },
        { value: 'Triumph', label: 'Triumph', count: propertyStats.triumph },
        { value: 'Excel', label: 'Excel', count: propertyStats.excel },
    ];

    const COLS = [
        { label: 'ID', col: 'id', w: 70 },
        { label: 'Code', col: 'property_code', w: 100 },
        { label: 'Property Name', col: 'property_name', w: 220 },
        { label: 'Company', col: 'company_name', w: 130 },
        { label: 'Property Type', col: null, w: 190 },
        { label: 'Added By', col: null, w: 140 },
        { label: 'Address', col: 'address', w: 210 },
        { label: 'Date Added', col: 'created_at', w: 120 },
        { label: 'Actions', col: null, w: 90 },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Property Management" />

            <div className="min-h-screen bg-slate-50/70 dark:bg-slate-900 pb-12 transition-colors duration-200">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5">

                    {/* ── Header ── */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_3px_10px_rgba(14,74,129,0.25)]" style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}>
                                <Building className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <h1 className="text-xl sm:text-[22px] font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                                        Property Management
                                    </h1>
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#e6eef7] text-[#0e4a81] border border-[#bcd3ec] dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800">
                                        {(propertyStats.total || 0).toLocaleString()} properties
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Manage residential & commercial property portfolios across Triumph & Excel
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
                            <button
                                onClick={handleCreate}
                                className="inline-flex items-center gap-2 px-4.5 py-2 text-xs font-bold text-white rounded-xl shadow-xs hover:opacity-95 active:scale-95 transition-all"
                                style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}
                            >
                                <Plus className="w-4 h-4" /> Add Property
                            </button>
                        </div>
                    </div>

                    {/* ── Sized-Up Stats Cards ── */}
                    {(() => {
                        const propStatsCards = [
                            { label: companyFilter === 'Excel' ? 'Excel Properties' : (companyFilter === 'Triumph' ? 'Triumph Properties' : 'Total Properties'), value: propertyStats.total, sub: 'Filtered property listings', icon: Building, accent: '#0e4a81', borderAccent: 'border-t-[#0e4a81]', light: '#e6eef7' },
                            ...(companyFilter !== 'Triumph' ? [
                                { label: 'Excel Properties', value: propertyStats.excel, sub: 'Excel company portfolio', icon: Crown, accent: '#7c3aed', borderAccent: 'border-t-purple-500', light: '#ede9fe' }
                            ] : []),
                            ...(companyFilter !== 'Excel' ? [
                                { label: 'Triumph Properties', value: propertyStats.triumph, sub: 'Triumph company portfolio', icon: Building2, accent: '#059669', borderAccent: 'border-t-emerald-500', light: '#d1fae5' }
                            ] : []),
                        ];

                        return (
                            <div className={`grid gap-3 mb-4 ${propStatsCards.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
                                {propStatsCards.map(({ label, value, sub, icon: Icon, accent, borderAccent, light }) => (
                                    <div key={label} className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs px-4 py-3 flex items-center gap-3.5 border-t-[3.5px] ${borderAccent} hover:-translate-y-0.5 hover:shadow-sm transition-all duration-150`}>
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xs" style={{ background: light }}>
                                            <Icon className="w-5 h-5" style={{ color: accent }} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[20px] font-black text-slate-900 dark:text-slate-100 leading-tight tracking-tight">{(value || 0).toLocaleString()}</p>
                                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">{label}</p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}

                    {/* ── Search & Filter Bar ── */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs mb-3.5 overflow-hidden">
                        <div className="p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-3">
                            {/* Company Tabs */}
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/60 p-1.5 rounded-xl">
                                {COMPANY_TABS.map(tab => (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        onClick={() => { setCompanyFilter(tab.value); push({ company: tab.value }); }}
                                        className={`px-4 py-2 text-xs sm:text-[13px] font-bold rounded-lg transition-all flex items-center gap-2 ${companyFilter === tab.value
                                            ? 'bg-white dark:bg-slate-800 text-[#0e4a81] dark:text-[#5a9bd5] shadow-xs'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <span>{tab.label}</span>
                                        {tab.count !== undefined && (
                                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${companyFilter === tab.value
                                                ? 'bg-[#0e4a81] text-white'
                                                : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                                            }`}>
                                                {tab.count}
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
                                        placeholder="Search by property name, code, or address…"
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

                                {(searchTerm || companyFilter !== 'all' || typeFilter !== 'all') && (
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
                                    Showing <span className="text-[#0e4a81] dark:text-[#5a9bd5]">{properties.from || 0}–{properties.to || 0}</span> of <span className="text-[#0e4a81] dark:text-[#5a9bd5]">{(properties.total || 0).toLocaleString()}</span> properties
                                </span>
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                                <span className="inline-flex items-center gap-1.5 font-medium">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-[#0e4a81]"></span> Triumph
                                </span>
                                <span className="inline-flex items-center gap-1.5 font-medium">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-purple-500"></span> Excel
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
                            <table className="w-full text-left border-collapse" style={{ minWidth: 880 }}>
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
                                    {properties.data?.map((property, idx) => {
                                        const isEven = idx % 2 === 0;
                                        const isTriumph = property.company_name === 'Triumph';
                                        const isPinned = focusedRowId === property.id;
                                        const stripeCls = isTriumph ? 'border-l-[#0e4a81]' : 'border-l-purple-500';

                                        return (
                                            <tr
                                                key={property.id}
                                                onClick={() => setFocusedRowId(isPinned ? null : property.id)}
                                                className={`cursor-pointer transition-all duration-150 border-b border-slate-200/80 dark:border-slate-700 border-l-[5px] ${stripeCls} ${
                                                    isPinned
                                                        ? 'bg-blue-100/90 dark:bg-blue-950/70 ring-2 ring-blue-500 ring-inset shadow-xs'
                                                        : isEven
                                                        ? 'bg-white dark:bg-slate-800 hover:bg-[#e4effb] dark:hover:bg-slate-700/60'
                                                        : 'bg-[#eef4fb] dark:bg-slate-800/60 hover:bg-[#dfeaf8] dark:hover:bg-slate-700/80'
                                                }`}
                                            >
                                                {/* ID */}
                                                <td className="px-4 py-3.5">
                                                    <span className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500">#{property.id}</span>
                                                </td>

                                                {/* Property Code */}
                                                <td className="px-4 py-3.5">
                                                    <span className="text-[11px] font-mono font-extrabold text-slate-800 dark:text-slate-200 bg-slate-200/70 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                                                        {property.property_code || '—'}
                                                    </span>
                                                </td>

                                                {/* Property Name */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div
                                                            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 shadow-2xs text-white"
                                                            style={{ background: isTriumph ? 'linear-gradient(135deg, #0e4a81, #1a6bb5)' : 'linear-gradient(135deg, #7c3aed, #9333ea)' }}
                                                        >
                                                            {property.property_name?.charAt(0).toUpperCase() || 'P'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate max-w-[170px]">
                                                                {property.property_name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Company */}
                                                <td className="px-4 py-3.5">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${isTriumph
                                                            ? 'bg-[#e6eef7] dark:bg-[#0e4a81]/25 text-[#0e4a81] dark:text-[#5a9bd5] border border-blue-200 dark:border-blue-800'
                                                            : 'bg-[#ede9fe] dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                                        }`}
                                                    >
                                                        {isTriumph ? <Building2 className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
                                                        {property.company_name || '—'}
                                                    </span>
                                                </td>

                                                {/* Type */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex flex-wrap gap-1">
                                                        {property.property_type?.map((type, i) => {
                                                            const ts = getTypeStyle(type);
                                                            const TIcon = ts.icon;
                                                            return (
                                                                <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${ts.cls}`}>
                                                                    <TIcon className="w-2.5 h-2.5" />
                                                                    {type}
                                                                </span>
                                                            );
                                                        })}
                                                        {(!property.property_type || property.property_type.length === 0) && (
                                                            <span className="text-xs text-slate-400">—</span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Added By */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white bg-[#0e4a81] flex-shrink-0 shadow-2xs">
                                                            {property.user?.name?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[110px]">
                                                            {property.user?.name || '—'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Address */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 truncate max-w-[190px]" title={property.address}>
                                                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                        <span className="truncate">{property.address || '—'}</span>
                                                    </div>
                                                </td>

                                                {/* Date Added */}
                                                <td className="px-4 py-3.5">
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold whitespace-nowrap">
                                                        {property.created_at ? new Date(property.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => handleEdit(property)}
                                                            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#0e4a81] dark:hover:text-[#5a9bd5] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-colors shadow-2xs"
                                                            title="Edit Property"
                                                        >
                                                            <Edit className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(property)}
                                                            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-600 transition-colors shadow-2xs"
                                                            title="Delete Property"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {(!properties.data || properties.data.length === 0) && (
                                        <tr>
                                            <td colSpan="9" className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#e6eef7] dark:bg-slate-800">
                                                        <Inbox className="w-7 h-7 text-[#0e4a81] dark:text-[#5a9bd5]" />
                                                    </div>
                                                    <p className="text-base font-bold text-slate-700 dark:text-slate-300">No properties found</p>
                                                    <p className="text-xs text-slate-400">Try adjusting your search criteria or company filters</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Rounded Pagination ── */}
                        {properties.links && properties.links.length > 3 && properties.data?.length > 0 && (
                            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/60">
                                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                    Page <span className="font-bold text-[#0e4a81] dark:text-[#5a9bd5]">{properties.current_page}</span> of <span className="font-bold text-[#0e4a81] dark:text-[#5a9bd5]">{properties.last_page}</span>
                                    <span className="ml-2 text-slate-400">· {(properties.total || 0).toLocaleString()} records</span>
                                </p>
                                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                                    {properties.links.map((link, i) => {
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

            <PropertyModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmit}
                mode={modalMode}
                property={editingProperty}
                users={users}
            />
        </AuthenticatedLayout>
    );
}