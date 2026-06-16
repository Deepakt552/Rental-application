// resources/js/Pages/Admin/Properties/Index.jsx

import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PropertyModal from './PropertyModal';
import Swal from 'sweetalert2';
import {
    Building, Plus, Search, Filter, Edit, Trash2,
    Home, Store, Factory, Users, Calendar,
    Download, XCircle, Inbox, Briefcase,
    ArrowUp, ArrowDown, ArrowUpDown, Building2, Crown
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
    const { auth } = usePage().props;

    const propertyStats = stats || {
        total: properties.total || properties.data?.length || 0,
        excel: properties.data?.filter(p => p.company_name === 'Excel').length || 0,
        triumph: properties.data?.filter(p => p.company_name === 'Triumph').length || 0,
    };

    const push = (extra = {}) => {
        router.get('/admin/properties', {
            search: searchTerm, type: typeFilter, company: companyFilter,
            sort_by: sortBy, sort_dir: sortDir, ...extra
        }, { preserveState: true });
    };

    const handleCreate = () => { setModalMode('create'); setEditingProperty(null); setShowModal(true); };
    const handleEdit = (p) => { setModalMode('edit'); setEditingProperty(p); setShowModal(true); };

    const handleDelete = (property) => {
        if (!property?.id) return;
        Swal.fire({
            title: 'Are you sure?',
            text: `Delete "${property.property_name}"?`,
            icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#d33', confirmButtonText: 'Yes, delete it!'
        }).then(r => {
            if (r.isConfirmed) {
                router.delete(`/admin/properties/${property.id}`, {
                    preserveScroll: true,
                    onSuccess: () => Swal.fire('Deleted!', 'Property deleted.', 'success'),
                    onError: () => Swal.fire('Error!', 'Failed to delete.', 'error'),
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
        setSearchTerm(''); setTypeFilter('all'); setCompanyFilter('all');
        router.get('/admin/properties');
    };

    const handleSort = (col) => {
        const dir = sortBy === col && sortDir === 'asc' ? 'desc' : 'asc';
        setSortBy(col); setSortDir(dir);
        push({ sort_by: col, sort_dir: dir });
    };

    const handleExport = () => {
        const p = new URLSearchParams({ search: searchTerm, type: typeFilter, company: companyFilter, sort_by: sortBy, sort_dir: sortDir });
        window.location.href = route('admin.properties.export') + '?' + p.toString();
    };

    const SortIcon = ({ col }) => {
        if (sortBy !== col) return <ArrowUpDown className="w-3 h-3 inline-block ml-1 opacity-25 dark:opacity-40" />;
        return sortDir === 'asc'
            ? <ArrowUp className="w-3 h-3 inline-block ml-1 text-[#0e4a81] dark:text-[#5a9bd5]" />
            : <ArrowDown className="w-3 h-3 inline-block ml-1 text-[#0e4a81] dark:text-[#5a9bd5]" />;
    };

    const typeColorMap = {
        Residential: { cls: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400', icon: Home },
        Commercial: { cls: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400', icon: Store },
        Industrial: { cls: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400', icon: Factory },
        Land: { cls: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400', icon: Building },
        Agricultural: { cls: 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400', icon: Building },
    };
    const getTypeStyle = (t) => typeColorMap[t] || { cls: 'bg-[#e6eef7] dark:bg-[#0e4a81]/20 text-[#0e4a81] dark:text-[#5a9bd5]', icon: Building };

    const COMPANY_TABS = [
        { value: 'all', label: 'All Companies' },
        { value: 'Triumph', label: 'Triumph' },
        { value: 'Excel', label: 'Excel' },
    ];

    const COLS = [
        { label: 'ID', col: 'id', w: 60 },
        { label: 'Property', col: 'property_name', w: 200 },
        { label: 'Company', col: 'company_name', w: 120 },
        { label: 'Type', col: null, w: 200 },
        { label: 'Added By', col: null, w: 140 },
        { label: 'Address', col: 'address', w: 200 },

        { label: 'Created', col: 'created_at', w: 120 },

        { label: '', col: null, w: 80 },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Property Management" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-7">

                    {/* ── Header ── */}
                    <div className="flex items-start justify-between mb-7">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}>
                                <Building className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-[22px] font-bold text-slate-800 dark:text-slate-100 leading-tight tracking-tight">Property Management</h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage all properties, track types and ownership</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleExport}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:border-[#0e4a81] dark:hover:border-[#5a9bd5] hover:text-[#0e4a81] dark:hover:text-[#5a9bd5] transition-all shadow-sm"
                            >
                                <Download className="w-4 h-4" /> Export
                            </button>
                            <button
                                onClick={handleCreate}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all shadow-sm hover:opacity-90 active:scale-95"
                                style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}
                            >
                                <Plus className="w-4 h-4" /> Add Property
                            </button>
                        </div>
                    </div>

                    {/* ── Stats ── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {[
                            { label: 'Total Properties', value: propertyStats.total, sub: 'All listings', icon: Building, accent: '#0e4a81', light: '#e6eef7' },
                            { label: 'Excel Properties', value: propertyStats.excel, sub: 'Excel company', icon: Crown, accent: '#7c3aed', light: '#ede9fe' },
                            { label: 'Triumph Properties', value: propertyStats.triumph, sub: 'Triumph company', icon: Building2, accent: '#059669', light: '#d1fae5' },
                        ].map(({ label, value, sub, icon: Icon, accent, light }) => (
                            <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-5 py-4 flex items-center gap-4 hover:shadow-md dark:hover:shadow-slate-900/50 transition-all">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: light }}>
                                    <Icon className="w-5 h-5" style={{ color: accent }} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[22px] font-bold text-slate-800 dark:text-slate-100 leading-none">{(value || 0).toLocaleString()}</p>
                                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">{label}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Filter card ── */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-5 overflow-hidden">

                        {/* Company tab strip */}
                        <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto px-1 pt-1">
                            {COMPANY_TABS.map(tab => (
                                <button
                                    key={tab.value}
                                    onClick={() => { setCompanyFilter(tab.value); push({ company: tab.value }); }}
                                    className={`relative px-5 py-2.5 text-xs font-semibold whitespace-nowrap transition-all rounded-t-lg mr-0.5 ${companyFilter === tab.value
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
                                    placeholder="Search by property name or company…"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && push()}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-[#0e4a81] dark:focus:border-[#5a9bd5] focus:ring-2 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
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
                                {(searchTerm || companyFilter !== 'all' || typeFilter !== 'all') && (
                                    <button
                                        onClick={resetFilters}
                                        className="px-4 py-2.5 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5"
                                    >
                                        <XCircle className="w-3.5 h-3.5" /> Clear
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
                                    Showing <span className="text-[#0e4a81] dark:text-[#5a9bd5]">{properties.from}–{properties.to}</span> of <span className="text-[#0e4a81] dark:text-[#5a9bd5]">{(properties.total || 0).toLocaleString()}</span> properties
                                </span>
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
                                    {properties.data?.map((property, idx) => {
                                        const isEven = idx % 2 === 0;
                                        const isTriumph = property.company_name === 'Triumph';
                                        return (
                                            <tr
                                                key={property.id}
                                                className={`border-b border-slate-200 dark:border-slate-700 transition-all duration-150 hover:bg-blue-50/40 dark:hover:bg-slate-700/50 ${isEven ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-800/60'
                                                    }`}
                                            >
                                                {/* ID */}
                                                <td className="px-4 py-3.5">
                                                    <span className="text-[11px] font-mono font-semibold text-slate-400 dark:text-slate-500">#{property.id}</span>
                                                </td>

                                                {/* Property */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div
                                                            className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0 shadow-sm text-white"
                                                            style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}
                                                        >
                                                            {property.property_name?.charAt(0).toUpperCase() || '?'}
                                                        </div>
                                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">{property.property_name}</p>
                                                    </div>
                                                </td>

                                                {/* Company */}
                                                <td className="px-4 py-3.5">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${isTriumph
                                                            ? 'bg-[#e6eef7] dark:bg-[#0e4a81]/20 text-[#0e4a81] dark:text-[#5a9bd5]'
                                                            : 'bg-[#ede9fe] dark:bg-purple-950/50 text-purple-700 dark:text-purple-400'
                                                            }`}
                                                    >
                                                        {isTriumph ? <Building2 className="w-2.5 h-2.5" /> : <Crown className="w-2.5 h-2.5" />}
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
                                                                <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${ts.cls}`}>
                                                                    <TIcon className="w-2.5 h-2.5" />
                                                                    {type}
                                                                </span>
                                                            );
                                                        })}
                                                        {(!property.property_type || property.property_type.length === 0) && (
                                                            <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                                                        )}
                                                    </div>
                                                </td>


                                                {/* Added By */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0" style={{ background: '#0e4a81' }}>
                                                            {property.user?.name?.charAt(0).toUpperCase() || '?'}
                                                        </div>
                                                        <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[100px]">{property.user?.name || '—'}</span>
                                                    </div>
                                                </td>



                                                {/* Address */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex flex-wrap gap-1">
                                                        {property.address?.split(',').map((addressPart, i) => (
                                                            <span key={i} className="text-xs text-slate-600 dark:text-slate-400">
                                                                {addressPart.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>


                                                {/* Created At */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                            {property.created_at ? new Date(property.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                        </span>
                                                    </div>
                                                </td>






                                                {/* Actions */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => handleEdit(property)}
                                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-[#0e4a81] dark:hover:text-[#5a9bd5] transition-colors bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(property)}
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

                                    {(!properties.data || properties.data.length === 0) && (
                                        <tr>
                                            <td colSpan="7" className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-slate-700">
                                                        <Inbox className="w-7 h-7 text-[#0e4a81] dark:text-[#5a9bd5]" />
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No properties found</p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500">Try adjusting your search or filters</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Pagination ── */}
                        {properties.links && properties.links.length > 3 && properties.data?.length > 0 && (
                            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-700/30">
                                <p className="text-xs text-slate-500 dark:text-slate-400 order-2 sm:order-1">
                                    Page <span className="font-bold text-slate-700 dark:text-slate-300">{properties.current_page}</span> of <span className="font-bold text-slate-700 dark:text-slate-300">{properties.last_page}</span>
                                    <span className="ml-2 text-slate-400 dark:text-slate-500">· {(properties.total || 0).toLocaleString()} total</span>
                                </p>
                                <div className="flex items-center gap-1 order-1 sm:order-2 flex-wrap justify-center">
                                    {properties.links.map((link, i) => {
                                        if (link.label === '...') return <span key={i} className="px-2 text-slate-300 dark:text-slate-500 text-xs">…</span>;
                                        const label = link.label
                                            .replace('&laquo; Previous', '←')
                                            .replace('Next &raquo;', '→');
                                        return (
                                            <Link
                                                key={i}
                                                href={link.url || '#'}
                                                className={`min-w-[32px] h-8 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center ${link.active
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