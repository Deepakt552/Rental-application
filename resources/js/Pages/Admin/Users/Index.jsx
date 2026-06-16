import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Users, UserPlus, Search, Filter, Edit, Trash2,
    Shield, User as UserIcon, Mail, Calendar,
    MoreVertical, Inbox, Download, XCircle,
    ArrowUp, ArrowDown, ArrowUpDown, Crown, Activity
} from 'lucide-react';

export default function Index({ users, stats, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortDir, setSortDir] = useState(filters.sort_dir || 'desc');
    const [showMenu, setShowMenu] = useState(null);

    const push = (extra = {}) => {
        router.get('/admin/users', {
            search: searchTerm,
            role: roleFilter,
            sort_by: sortBy,
            sort_dir: sortDir,
            ...extra
        }, { preserveState: true });
    };

    const resetFilters = () => {
        setSearchTerm(''); setRoleFilter('');
        router.get('/admin/users', {}, { preserveState: true });
    };

    const handleSort = (col) => {
        const dir = sortBy === col && sortDir === 'asc' ? 'desc' : 'asc';
        setSortBy(col); setSortDir(dir);
        push({ sort_by: col, sort_dir: dir });
    };

    const handleExport = () => {
        const p = new URLSearchParams({ search: searchTerm, role: roleFilter, sort_by: sortBy, sort_dir: sortDir });
        window.location.href = '/admin/users/export?' + p.toString();
    };

    const handleDelete = (id, name) => {
        if (confirm(`Delete user "${name}"?`)) router.delete(`/admin/users/${id}`);
    };

    const handleRoleChange = (id, newRole) => {
        if (confirm(`Change role to ${newRole.toUpperCase()}?`)) {
            router.patch(`/admin/users/${id}/role`, { role: newRole });
        }
    };

    const SortIcon = ({ col }) => {
        if (sortBy !== col) return <ArrowUpDown className="w-3 h-3 inline-block ml-1 opacity-25 dark:opacity-40" />;
        return sortDir === 'asc'
            ? <ArrowUp className="w-3 h-3 inline-block ml-1 text-[#0e4a81] dark:text-[#5a9bd5]" />
            : <ArrowDown className="w-3 h-3 inline-block ml-1 text-[#0e4a81] dark:text-[#5a9bd5]" />;
    };

    const roleConfig = {
        admin:      { cls: 'bg-[#e6eef7] dark:bg-[#0e4a81]/20 text-[#0e4a81] dark:text-[#5a9bd5]',   icon: Shield,    label: 'Admin' },
        superadmin: { cls: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400',   icon: Crown,     label: 'Super Admin' },
        user:       { cls: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400', icon: UserIcon,  label: 'User' },
    };
    const getRole = (r) => roleConfig[r] || { cls: 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400', icon: UserIcon, label: r || 'User' };

    const ROLE_TABS = [
        { value: '', label: 'All Users' },
        { value: 'admin', label: 'Admins' },
        { value: 'superadmin', label: 'Super Admins' },
        { value: 'user', label: 'Users' },
    ];

    const COLS = [
        { label: 'ID',           col: 'id',         w: 60  },
        { label: 'User',         col: 'name',        w: 200 },
        { label: 'Email',        col: 'email',       w: 220 },
        { label: 'Role',         col: 'role',        w: 120 },
        { label: 'Member Since', col: 'created_at',  w: 130 },
        { label: '',             col: null,          w: 90  },
    ];

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-7">

                    {/* ── Header ── */}
                    <div className="flex items-start justify-between mb-7">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}>
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-[22px] font-bold text-slate-800 dark:text-slate-100 leading-tight tracking-tight">User Management</h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage system users and their roles</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleExport}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:border-[#0e4a81] dark:hover:border-[#5a9bd5] hover:text-[#0e4a81] dark:hover:text-[#5a9bd5] transition-all shadow-sm"
                            >
                                <Download className="w-4 h-4" /> Export
                            </button>
                            <Link
                                href="/admin/users/create"
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all shadow-sm hover:opacity-90 active:scale-95"
                                style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}
                            >
                                <UserPlus className="w-4 h-4" /> Add User
                            </Link>
                        </div>
                    </div>

                    {/* ── Stats ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {[
                            { label: 'Total Users',   value: stats.total      || 0, sub: 'All accounts',      icon: Users,    accent: '#0e4a81', light: '#e6eef7' },
                            { label: 'Admins',        value: stats.admins     || 0, sub: 'Admin access',      icon: Shield,   accent: '#1a6bb5', light: '#dbeafe' },
                            { label: 'Super Admins',  value: stats.superadmin || 0, sub: 'Full access',       icon: Crown,    accent: '#7c3aed', light: '#ede9fe' },
                            { label: 'Regular Users', value: stats.users      || 0, sub: 'Standard accounts', icon: UserIcon, accent: '#059669', light: '#d1fae5' },
                        ].map(({ label, value, sub, icon: Icon, accent, light }) => (
                            <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-5 py-4 flex items-center gap-4 hover:shadow-md dark:hover:shadow-slate-900/50 transition-all">
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

                        {/* Role tab strip */}
                        <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto px-1 pt-1">
                            {ROLE_TABS.map(tab => (
                                <button
                                    key={tab.value}
                                    onClick={() => { setRoleFilter(tab.value); push({ role: tab.value }); }}
                                    className={`relative px-5 py-2.5 text-xs font-semibold whitespace-nowrap transition-all rounded-t-lg mr-0.5 ${
                                        roleFilter === tab.value 
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
                                    placeholder="Search by name or email…"
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
                                {(searchTerm || roleFilter) && (
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
                                    Showing <span className="text-[#0e4a81] dark:text-[#5a9bd5]">{users.from}–{users.to}</span> of <span className="text-[#0e4a81] dark:text-[#5a9bd5]">{(users.total || 0).toLocaleString()}</span> users
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left" style={{ minWidth: 700 }}>
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
                                    {users.data?.map((user, idx) => {
                                        const rc = getRole(user.role);
                                        const RoleIcon = rc.icon;
                                        const isEven = idx % 2 === 0;
                                        return (
                                            <tr 
                                                key={user.id}
                                                className={`border-b border-slate-200 dark:border-slate-700 transition-all duration-150 hover:bg-blue-50/40 dark:hover:bg-slate-700/50 ${
                                                    isEven ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-800/60'
                                                }`}
                                            >
                                                {/* ID */}
                                                <td className="px-4 py-3.5">
                                                    <span className="text-[11px] font-mono font-semibold text-slate-400 dark:text-slate-500">#{user.id}</span>
                                                </td>

                                                {/* User */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div
                                                            className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0 shadow-sm text-white"
                                                            style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}
                                                        >
                                                            {user.name?.charAt(0).toUpperCase() || '?'}
                                                        </div>
                                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                                                    </div>
                                                </td>

                                                {/* Email */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail className="w-3 h-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                                                        <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[200px]">{user.email}</span>
                                                    </div>
                                                </td>

                                                {/* Role */}
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${rc.cls}`}>
                                                        <RoleIcon className="w-2.5 h-2.5" />
                                                        {rc.label}
                                                    </span>
                                                </td>

                                                {/* Member Since */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                            {user.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={`/admin/users/${user.id}/edit`}
                                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-[#0e4a81] dark:hover:text-[#5a9bd5] transition-colors bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-3.5 h-3.5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(user.id, user.name)}
                                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <div className="relative">
                                                            <button
                                                                onClick={() => setShowMenu(showMenu === user.id ? null : user.id)}
                                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                                                                title="More"
                                                            >
                                                                <MoreVertical className="w-3.5 h-3.5" />
                                                            </button>
                                                            {showMenu === user.id && (
                                                                <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 z-10 overflow-hidden shadow-lg dark:shadow-slate-900/50">
                                                                    <button
                                                                        onClick={() => {
                                                                            const newRole = user.role === 'admin' ? 'user' : user.role === 'superadmin' ? 'admin' : 'admin';
                                                                            handleRoleChange(user.id, newRole);
                                                                            setShowMenu(null);
                                                                        }}
                                                                        className="block w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                                                    >
                                                                        Make {user.role === 'admin' ? 'Regular User' : user.role === 'superadmin' ? 'Admin' : 'Admin'}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {(!users.data || users.data.length === 0) && (
                                        <tr>
                                            <td colSpan="6" className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-slate-700">
                                                        <Inbox className="w-7 h-7 text-[#0e4a81] dark:text-[#5a9bd5]" />
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No users found</p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500">Try adjusting your search or filters</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Pagination ── */}
                        {users.links && users.links.length > 3 && users.data?.length > 0 && (
                            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-700/30">
                                <p className="text-xs text-slate-500 dark:text-slate-400 order-2 sm:order-1">
                                    Page <span className="font-bold text-slate-700 dark:text-slate-300">{users.current_page}</span> of <span className="font-bold text-slate-700 dark:text-slate-300">{users.last_page}</span>
                                    <span className="ml-2 text-slate-400 dark:text-slate-500">· {(users.total || 0).toLocaleString()} total</span>
                                </p>
                                <div className="flex items-center gap-1 order-1 sm:order-2 flex-wrap justify-center">
                                    {users.links.map((link, i) => {
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