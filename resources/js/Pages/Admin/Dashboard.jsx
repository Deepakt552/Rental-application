import { useState, useEffect } from 'react';
import { router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    FileText,
    Eye,
    TrendingUp,
    TrendingDown,
    Calendar,
    ChevronRight,
    DollarSign,
    CreditCard,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ShieldCheck,
    ShieldAlert,
    Building2,
    Crown,
    ArrowUpRight,
    Activity,
    Layers,
    UserCheck,
    Mail,
    BellOff,
    Home
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

export default function Dashboard({ applicants, stats = {}, chartData = {}, recentPayments = [] }) {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('dark');
        }
        return false;
    });

    useEffect(() => {
        const handleTheme = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };
        window.addEventListener('theme-change', handleTheme);
        const observer = new MutationObserver(() => handleTheme());
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => {
            window.removeEventListener('theme-change', handleTheme);
            observer.disconnect();
        };
    }, []);

    const statusColors = {
        draft: isDark ? '#fbbf24' : '#f59e0b',     // Amber
        submitted: isDark ? '#38bdf8' : '#0ea5e9', // Sky blue
        approved: isDark ? '#34d399' : '#10b981',  // Emerald
        rejected: isDark ? '#f87171' : '#f43f5e'   // Rose
    };

    // Prepare pie chart data
    const pieData = Object.entries(chartData.status || {}).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        rawStatus: status,
        value: count,
        color: statusColors[status] || (isDark ? '#64748b' : '#94a3b8')
    }));

    // Prepare trend data for area chart
    const trendData = Object.entries(chartData.trend || {}).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        applications: count
    }));

    const totalApplications = stats.total_applications || 0;
    const submittedCount = stats.applications_submitted || 0;
    const totalRevenue = stats.total_revenue || 0;
    const recentRevenue = stats.recent_revenue || 0;
    const totalConsents = stats.total_consents || 0;
    const pendingConsents = stats.pending_consents || 0;
    const triumphCount = stats.triumph_total || 0;
    const excelCount = stats.excel_total || 0;

    // Top 4 Primary Executive Metrics Cards
    const primaryCards = [
        {
            title: 'Total Applications',
            value: totalApplications.toLocaleString(),
            subtitle: `${triumphCount} Triumph · ${excelCount} Excel`,
            change: stats.applications_growth,
            trend: (stats.applications_growth ?? 0) >= 0 ? 'up' : 'down',
            icon: FileText,
            accent: isDark ? '#38bdf8' : '#0e4a81',
            lightBg: 'bg-blue-50 dark:bg-sky-500/10',
            textColor: 'text-[#0e4a81] dark:text-sky-400',
            borderColor: 'border-t-[#0e4a81] dark:border-t-sky-400',
            glowCls: 'dark:border-sky-500/20 dark:hover:border-sky-500/50 dark:hover:shadow-[0_0_25px_rgba(56,189,248,0.15)]',
            href: route('admin.applications.index')
        },
        {
            title: 'Pending Review',
            value: submittedCount.toLocaleString(),
            subtitle: `${stats.submission_rate || 0}% submission rate`,
            badge: submittedCount > 0 ? 'Needs Attention' : 'All Clear',
            badgeCls: submittedCount > 0
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 dark:border dark:border-amber-500/30'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border dark:border-emerald-500/30',
            icon: Clock,
            accent: '#d97706',
            lightBg: 'bg-amber-50 dark:bg-amber-500/10',
            textColor: 'text-amber-600 dark:text-amber-400',
            borderColor: 'border-t-amber-500 dark:border-t-amber-400',
            glowCls: 'dark:border-amber-500/20 dark:hover:border-amber-500/50 dark:hover:shadow-[0_0_25px_rgba(245,158,11,0.15)]',
            href: route('admin.applications.index', { status: 'submitted' })
        },
        {
            title: 'Revenue Collected',
            value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
            subtitle: `$${recentRevenue.toLocaleString()} in last 30d`,
            change: stats.revenue_growth,
            trend: (stats.revenue_growth ?? 0) >= 0 ? 'up' : 'down',
            icon: DollarSign,
            accent: '#059669',
            lightBg: 'bg-emerald-50 dark:bg-emerald-500/10',
            textColor: 'text-emerald-600 dark:text-emerald-400',
            borderColor: 'border-t-emerald-500 dark:border-t-emerald-400',
            glowCls: 'dark:border-emerald-500/20 dark:hover:border-emerald-500/50 dark:hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]',
            href: route('admin.payments.index')
        },
        {
            title: 'Tenant Consents',
            value: totalConsents.toLocaleString(),
            subtitle: `${pendingConsents} pending consent`,
            badge: `${stats.consent_rate || 0}% Completed`,
            badgeCls: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border dark:border-indigo-500/30',
            icon: ShieldCheck,
            accent: '#6366f1',
            lightBg: 'bg-indigo-50 dark:bg-indigo-500/10',
            textColor: 'text-indigo-600 dark:text-indigo-400',
            borderColor: 'border-t-indigo-500 dark:border-t-indigo-400',
            glowCls: 'dark:border-indigo-500/20 dark:hover:border-indigo-500/50 dark:hover:shadow-[0_0_25px_rgba(99,102,241,0.15)]',
            href: route('admin.applications.index', { consent_status: 'completed' })
        }
    ];

    // Operational Quick Pipeline Strip
    const pipelineItems = [
        { label: 'Drafts in Progress', count: stats.applications_draft || 0, icon: FileText, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/25 dark:hover:border-amber-500/50', href: route('admin.applications.index', { status: 'draft' }) },
        { label: 'Pending Consents', count: pendingConsents, icon: ShieldAlert, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/25 dark:hover:border-rose-500/50', href: route('admin.applications.index', { consent_status: 'pending' }) },
        { label: 'Screening Paid', count: stats.paid_applicants_count || 0, icon: CreditCard, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/25 dark:hover:border-emerald-500/50', href: route('admin.applications.index', { payment_status: 'paid' }) },
        { label: 'Move-In Pending', count: stats.move_in_pending_count || 0, icon: Clock, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10', border: 'border-sky-200 dark:border-sky-500/25 dark:hover:border-sky-500/50', href: route('admin.applications.index', { move_in_status: 'pending' }) },
        { label: 'Moved In', count: stats.moved_in_count || 0, icon: Home, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-500/10', border: 'border-teal-200 dark:border-teal-500/25 dark:hover:border-teal-500/50', href: route('admin.applications.index', { move_in_status: 'moved_in' }) },
        { label: 'Reminder Opt-Outs', count: stats.opted_out_count || 0, icon: BellOff, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800/80', border: 'border-slate-200 dark:border-slate-700/80 dark:hover:border-slate-600', href: route('admin.applications.index') }
    ];

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen pb-12 transition-colors duration-200">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-5">

                    {/* ── Executive Header ── */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_4px_14px_rgba(14,74,129,0.25)] dark:shadow-[0_0_20px_rgba(56,189,248,0.25)]" style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}>
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                                        Admin Dashboard
                                    </h1>
                                </div>
                            </div>
                        </div>

                        {/* Top Quick Actions */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <Link
                                href={route('admin.applications.index')}
                                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold bg-white dark:bg-[#111827]/90 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:border-[#0e4a81] hover:text-[#0e4a81] dark:hover:border-sky-500/60 dark:hover:text-sky-400 transition-all shadow-xs dark:shadow-[0_4px_15px_rgba(0,0,0,0.3)] active:scale-95"
                            >
                                <FileText className="w-4 h-4 text-[#0e4a81] dark:text-sky-400" />
                                <span>Applications</span>
                                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 dark:border dark:border-slate-700">
                                    {totalApplications}
                                </span>
                            </Link>

                            <Link
                                href={route('admin.payments.index')}
                                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow-xs dark:shadow-[0_0_20px_rgba(14,74,129,0.4)] hover:opacity-95 active:scale-95 transition-all"
                                style={{ background: 'linear-gradient(135deg, #0e4a81, #1a6bb5)' }}
                            >
                                <CreditCard className="w-4 h-4" />
                                <span>Payments</span>
                            </Link>
                        </div>
                    </div>

                    {/* ── 4 Primary Executive Metrics Cards ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {primaryCards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <Link
                                    key={card.title}
                                    href={card.href}
                                    className={`bg-white dark:bg-[#111827]/90 dark:backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-xs p-4 sm:p-5 border-t-[4px] ${card.borderColor} ${card.glowCls} hover:-translate-y-1 hover:shadow-md transition-all duration-200 group block relative overflow-hidden dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                {card.title}
                                            </p>
                                            <h3 className="text-2xl sm:text-[28px] font-black text-slate-900 dark:text-white mt-1 tracking-tight leading-tight">
                                                {card.value}
                                            </h3>
                                        </div>
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${card.lightBg} group-hover:scale-105 transition-transform dark:border dark:border-white/5`}>
                                            <Icon className={`w-6 h-6 ${card.textColor}`} />
                                        </div>
                                    </div>

                                    <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between text-xs">
                                        <span className="text-slate-500 dark:text-slate-400 font-medium truncate">
                                            {card.subtitle}
                                        </span>
                                        {card.change !== undefined && (
                                            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-extrabold ${card.trend === 'up'
                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border dark:border-emerald-500/30'
                                                : 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 dark:border dark:border-rose-500/30'
                                                }`}>
                                                {card.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                {Math.abs(card.change)}%
                                            </span>
                                        )}
                                        {card.badge && (
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${card.badgeCls}`}>
                                                {card.badge}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* ── Quick Pipeline & Operational Strip ── */}
                    <div className="bg-white dark:bg-[#111827]/90 dark:backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-xs p-4 mb-6 dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-[#0e4a81] dark:text-sky-400" />
                                <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                                    Operational Pipeline & Status Counters
                                </h3>
                            </div>
                            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Click any status to view applications</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                            {pipelineItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={`p-3 rounded-xl border ${item.border} ${item.bg} hover:shadow-xs hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2.5`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg bg-white/80 dark:bg-slate-900/90 flex items-center justify-center flex-shrink-0 shadow-2xs dark:border dark:border-white/5 ${item.color}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate leading-tight">
                                                {item.label}
                                            </p>
                                            <p className="text-base font-black text-slate-900 dark:text-white leading-tight mt-0.5">
                                                {item.count}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Visual Analytics (Trend Chart + Status Donut) ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Area Chart: Applications Trend */}
                        <div className="lg:col-span-2 bg-white dark:bg-[#111827]/90 dark:backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-xs p-5 dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-[#0e4a81] dark:text-sky-400" />
                                        Application Submissions Trend
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Last 7 days inbound rental application volume
                                    </p>
                                </div>
                                <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 dark:border dark:border-slate-700/60">
                                    {stats.recent_applications || 0} this week
                                </div>
                            </div>

                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="appTrendGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={isDark ? '#38bdf8' : '#0e4a81'} stopOpacity={isDark ? 0.4 : 0.25} />
                                                <stop offset="95%" stopColor={isDark ? '#38bdf8' : '#0e4a81'} stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(148, 163, 184, 0.12)' : '#e2e8f0'} strokeOpacity={0.7} vertical={false} />
                                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={8} />
                                        <YAxis tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '14px',
                                                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1',
                                                boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.6)' : '0 4px 12px rgba(0,0,0,0.08)',
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                                                color: isDark ? '#f8fafc' : '#0f172a'
                                            }}
                                            itemStyle={{ color: isDark ? '#38bdf8' : '#0e4a81' }}
                                            formatter={(value) => [`${value} applications`, 'Volume']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="applications"
                                            stroke={isDark ? '#38bdf8' : '#0e4a81'}
                                            strokeWidth={3}
                                            fill="url(#appTrendGradient)"
                                            activeDot={{ r: 6, fill: isDark ? '#38bdf8' : '#0e4a81', stroke: isDark ? '#0b1120' : '#ffffff', strokeWidth: 3 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Donut Chart: Application Status Breakdown */}
                        <div className="bg-white dark:bg-[#111827]/90 dark:backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-xs p-5 flex flex-col justify-between dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        Status Distribution
                                    </h3>
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                        {totalApplications} total
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Current application pipeline status breakdown
                                </p>
                            </div>

                            <div className="h-[180px] relative flex items-center justify-center my-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={75}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                                                color: isDark ? '#f8fafc' : '#0f172a'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-xl font-black text-slate-900 dark:text-white leading-none">
                                        {totalApplications}
                                    </span>
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mt-0.5">
                                        Apps
                                    </span>
                                </div>
                            </div>

                            {/* Status Legend Pills */}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/70">
                                {pieData.map((entry) => (
                                    <Link
                                        key={entry.name}
                                        href={route('admin.applications.index', { status: entry.rawStatus })}
                                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/90 dark:border dark:border-slate-800 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                                                {entry.name}
                                            </span>
                                        </div>
                                        <span className="text-xs font-extrabold text-slate-900 dark:text-white ml-2">
                                            {entry.value}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Two-Column Operational Streams: Recent Applications & Recent Payments ── */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                        {/* Recent Applications Feed (Takes 2 Columns on xl) */}
                        <div className="xl:col-span-2 bg-white dark:bg-[#111827]/90 dark:backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-xs overflow-hidden dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
                            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white dark:from-[#0d1527] dark:to-[#111827]">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-6 bg-gradient-to-b from-[#0e4a81] to-[#1a6bb5] dark:from-sky-400 dark:to-blue-600 rounded-full"></div>
                                    <div>
                                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                                            Recent Applications
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                            Latest submissions requiring attention & verification
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href={route('admin.applications.index')}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0e4a81] dark:text-sky-400 bg-blue-50 dark:bg-sky-500/15 rounded-xl hover:bg-blue-100 dark:hover:bg-sky-500/25 transition-colors dark:border dark:border-sky-500/20"
                                >
                                    <span>View All</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/80 dark:bg-[#0d1527] border-b border-slate-200 dark:border-slate-800/80">
                                        <tr>
                                            <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Applicant</th>
                                            <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Property</th>
                                            <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                                            <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Consent</th>
                                            <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Payment</th>
                                            <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Date</th>
                                            <th className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-xs">
                                        {(applicants.data || []).map((applicant, idx) => {
                                            const name = applicant.personal_information
                                                ? `${applicant.personal_information.first_name || ''} ${applicant.personal_information.last_name || ''}`.trim()
                                                : 'Incomplete';
                                            const prop = applicant.property_name || applicant.property?.title || 'Not Selected';
                                            const isConsentDone = Boolean(applicant.consent_record?.status === 'completed' || applicant.consent_status === 'completed');
                                            const isPaid = applicant.payment_status === 'paid';
                                            const isOptedOut = Boolean(applicant.reminders_opted_out);

                                            return (
                                                <tr
                                                    key={applicant.id}
                                                    className={`hover:bg-blue-50/40 dark:hover:bg-slate-800/60 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/30 dark:bg-slate-900/30' : 'bg-white dark:bg-[#111827]'
                                                        }`}
                                                >
                                                    {/* Applicant */}
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-sky-500/15 border border-blue-200 dark:border-sky-500/30 text-[#0e4a81] dark:text-sky-300 flex items-center justify-center font-black text-xs flex-shrink-0 shadow-2xs">
                                                                {name.charAt(0) || 'A'}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-1.5">
                                                                    <p className="font-extrabold text-slate-900 dark:text-slate-100 truncate">
                                                                        {name}
                                                                    </p>
                                                                    {isOptedOut && (
                                                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 dark:border dark:border-rose-500/30" title="Tenant opted out of email reminders">
                                                                            Opted-Out
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                                                    {applicant.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Property */}
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[140px]">
                                                            {prop}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">
                                                            {applicant.type === 'admin' ? 'Triumph' : 'Excel'}
                                                        </span>
                                                    </td>

                                                    {/* Application Status */}
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${applicant.status === 'submitted'
                                                            ? 'bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30'
                                                            : applicant.status === 'approved'
                                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                                                                : applicant.status === 'rejected'
                                                                    ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30'
                                                                    : 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
                                                            }`}>
                                                            {applicant.status || 'Draft'}
                                                        </span>
                                                    </td>

                                                    {/* Consent */}
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        {isConsentDone ? (
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> Done
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                                                <Clock className="w-3.5 h-3.5" /> Pending
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Payment */}
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        {isPaid ? (
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 dark:bg-emerald-500/15 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/30">
                                                                Paid
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md dark:border dark:border-slate-700/60">
                                                                {applicant.payment_status || 'Unpaid'}
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Date */}
                                                    <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400 font-medium text-[11px]">
                                                        {new Date(applicant.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </td>

                                                    {/* Action */}
                                                    <td className="px-4 py-3 whitespace-nowrap text-right">
                                                        <Link
                                                            href={`/admin/applications/${applicant.id}`}
                                                            className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#0e4a81] hover:text-white dark:hover:bg-sky-500 dark:hover:text-white text-slate-600 dark:text-slate-300 dark:border dark:border-slate-700/70 transition-all shadow-2xs hover:shadow-xs active:scale-95"
                                                            title="View Application Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {(!applicants.data || applicants.data.length === 0) && (
                                            <tr>
                                                <td colSpan="7" className="text-center py-8 text-slate-400 font-medium">
                                                    No applications available yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Payments Feed (Takes 1 Column on xl) */}
                        <div className="bg-white dark:bg-[#111827]/90 dark:backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-xs overflow-hidden flex flex-col justify-between dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
                            <div>
                                <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 to-white dark:from-[#0d1527] dark:to-[#111827]">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                                        <div>
                                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                                                Recent Payments
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                Latest tenant fee transactions
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href={route('admin.payments.index')}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/25 transition-colors dark:border dark:border-emerald-500/20"
                                    >
                                        <span>All</span>
                                        <ChevronRight className="w-3 h-3" />
                                    </Link>
                                </div>

                                <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
                                    {recentPayments.map((p) => {
                                        const applicant = p.applicant;
                                        const payerName = applicant?.personal_information
                                            ? `${applicant.personal_information.first_name || ''} ${applicant.personal_information.last_name || ''}`.trim()
                                            : (applicant?.email || 'Applicant');
                                        const propName = applicant?.property_name || applicant?.property?.title || 'Rental Application';
                                        const isCompleted = p.status === 'completed';

                                        return (
                                            <div key={p.id} className="p-3.5 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-xs ${isCompleted ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30' : 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30'
                                                        }`}>
                                                        <DollarSign className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">
                                                            {payerName}
                                                        </p>
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                                            {propName}
                                                        </p>
                                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                                            {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="text-right flex-shrink-0">
                                                    <span className={`text-sm font-black block ${isCompleted ? 'text-emerald-600 dark:text-emerald-400 dark:drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'text-amber-600 dark:text-amber-400'
                                                        }`}>
                                                        +${Number(p.amount || 0).toFixed(2)}
                                                    </span>
                                                    <span className={`inline-block px-2 py-0.2 rounded text-[10px] font-extrabold uppercase tracking-wider ${isCompleted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border dark:border-emerald-500/30' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 dark:border dark:border-amber-500/30'
                                                        }`}>
                                                        {p.status}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {recentPayments.length === 0 && (
                                        <div className="p-8 text-center text-slate-400 text-xs font-medium">
                                            No recent transactions logged.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50/80 dark:bg-[#0d1527]/90 border-t border-slate-200 dark:border-slate-800/80 text-center">
                                <Link
                                    href={route('admin.payments.index')}
                                    className="text-xs font-bold text-[#0e4a81] dark:text-sky-400 hover:dark:text-sky-300 hover:underline"
                                >
                                    Reconcile & View All Payments →
                                </Link>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}