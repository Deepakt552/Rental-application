import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    FileText,
    Eye,
    TrendingUp,
    Calendar,
    ChevronRight,
    DollarSign,
    CreditCard,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    MoreHorizontal,
    Home,
    ShieldCheck,
    FolderOpen,
    Car,
    Users as UsersIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

export default function Dashboard({ applicants, stats, chartData, recentPayments = [], recentApplicationsList = [] }) {
    const statusColors = {
        draft: '#94a3b8',
        submitted: '#0ea5e9', // Sky blue
        approved: '#10b981', // Emerald
        rejected: '#f43f5e'  // Rose
    };

    // Prepare pie chart data
    const pieData = Object.entries(chartData.status).map(([status, count]) => ({
        name: status,
        value: count,
        color: statusColors[status] || '#94a3b8'
    }));

    // Prepare trend data for line chart
    const trendData = Object.entries(chartData.trend).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        applications: count
    }));

    const statsCards = [
        {
            title: 'Total Applications',
            value: stats.total_applications,
            change: stats.applications_growth,
            trend: stats.applications_growth >= 0 ? 'up' : 'down',
            icon: FileText,
            color: 'blue'
        },
        {
            title: 'Last 7 Days',
            value: stats.recent_applications,
            change: stats.recent_applications_growth,
            trend: stats.recent_applications_growth >= 0 ? 'up' : 'down',
            icon: Calendar,
            color: 'purple'
        },
        {
            title: 'Total Revenue',
            value: `$${(stats.total_revenue || 0).toLocaleString()}`,
            change: stats.revenue_growth,
            trend: stats.revenue_growth >= 0 ? 'up' : 'down',
            icon: DollarSign,
            color: 'green'
        },
        {
            title: 'Last 30 Days',
            value: `$${(stats.recent_revenue || 0).toLocaleString()}`,
            change: stats.recent_revenue_growth,
            trend: stats.recent_revenue_growth >= 0 ? 'up' : 'down',
            icon: CreditCard,
            color: 'orange'
        }
    ];

    return (
        <AuthenticatedLayout>
            <div className="py-8 bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] dark:from-slate-900 dark:to-slate-800 min-h-screen transition-colors duration-300">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                                    Dashboard Overview
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
                                    Monitor your application metrics and recent activities.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href={route('admin.applications.index')}
                                    className="px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-950/50 hover:text-blue-700 dark:hover:text-blue-400 transition-all text-xs flex items-center gap-2 shadow-sm"
                                >
                                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" /> 
                                    View Applications
                                </Link>
                                <Link
                                    href={route('admin.payments.index')}
                                    className="px-4 py-2.5 bg-gradient-to-r from-[#0e4a81] to-[#1a5c9e] dark:from-[#1a5c9e] dark:to-[#0e4a81] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#0e4a81]/20 dark:hover:shadow-[#0e4a81]/30 transition-all text-xs flex items-center gap-2 shadow-md"
                                >
                                    <CreditCard className="w-4 h-4" /> 
                                    View Payments
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Compact Modern Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                        {statsCards.map((card, index) => {
                            const Icon = card.icon;
                            const colorClasses = {
                                blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50',
                                purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50',
                                green: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50',
                                orange: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50'
                            };
                            const accentColors = {
                                blue: 'bg-blue-500 dark:bg-blue-600',
                                purple: 'bg-purple-500 dark:bg-purple-600',
                                green: 'bg-emerald-500 dark:bg-emerald-600',
                                orange: 'bg-orange-500 dark:bg-orange-600'
                            };
                            
                            return (
                                <motion.div
                                    key={card.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -4, scale: 1.01 }}
                                    className="relative bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800 overflow-hidden group transition-all duration-300"
                                >
                                    <div className={`absolute top-0 left-0 w-full h-1 opacity-80 ${accentColors[card.color]}`}></div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                                                {card.title}
                                            </p>
                                            <h4 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                                                {card.value}
                                            </h4>
                                        </div>
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-300 ${colorClasses[card.color]}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                            card.trend === 'up' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                                        }`}>
                                            {card.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 transform rotate-180" />} 
                                            {Math.abs(card.change)}%
                                        </span>
                                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">vs last period</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Quick System Info */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">System Data Overview</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {[
                                { title: 'Users', value: stats.total_users, icon: UsersIcon, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
                                { title: 'Consents', value: stats.total_consents, icon: ShieldCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
                                { title: 'Documents', value: stats.total_documents, icon: FolderOpen, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/50' },
                                { title: 'Submitted Apps', value: stats.applications_submitted, icon: FileText, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/30' },
                                { title: 'Pending Consents', value: stats.pending_consents, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
                                { title: 'Pending Payments', value: stats.pending_payments, icon: DollarSign, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30' }
                            ].map((item, idx) => (
                                <motion.div
                                    key={item.title}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 + (idx * 0.05) }}
                                    className="bg-white dark:bg-slate-900 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-3 hover:shadow-md dark:hover:shadow-slate-900/50 transition-shadow"
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.bg} ${item.color}`}>
                                        <item.icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{item.title}</p>
                                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{item.value}</h4>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Line Chart: Application Trend (Takes up 2 columns on lg) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-5 lg:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800 lg:col-span-2"
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base">Applications Trend</h3>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1">Last 7 days activity</p>
                                </div>
                                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0e4a81" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#0e4a81" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" strokeOpacity={0.5} vertical={false} />
                                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontSize: '12px', fontWeight: 600, backgroundColor: '#ffffff', color: '#0f172a' }}
                                            itemStyle={{ color: '#0e4a81' }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="applications" 
                                            stroke="#0e4a81" 
                                            strokeWidth={3} 
                                            fill="url(#trendGradient)" 
                                            activeDot={{ r: 6, strokeWidth: 0, fill: '#0e4a81' }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Pie Chart: Status Breakdown */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.25 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-5 lg:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800"
                        >
                            <div className="mb-2 flex items-center justify-between">
                                <div>
                                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base">Status</h3>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1">Real-time distribution</p>
                                </div>
                                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500">
                                    <PieChart className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="h-[250px] flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={65}
                                            outerRadius={85}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontSize: '12px', fontWeight: 600, backgroundColor: '#ffffff', color: '#0f172a' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                {pieData.map((entry, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{entry.name}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Refined Modern Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800 overflow-hidden mb-8"
                    >
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-6 bg-gradient-to-b from-[#0e4a81] to-[#1a5c9e] rounded-full"></div>
                                <div>
                                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base">Recent Applications</h3>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Latest submissions requiring attention</p>
                                </div>
                            </div>
                            <Link href={route('admin.applications.index')} className="text-[11px] font-bold px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-[#0e4a81] dark:hover:text-[#5a9bd5] hover:bg-[#0e4a81]/5 dark:hover:bg-[#0e4a81]/10 rounded-lg flex items-center gap-1 transition-all border border-slate-100 dark:border-slate-700">
                                View All <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#f8fafc] dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-3.5 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">Applicant Detail</th>
                                        <th className="px-6 py-3.5 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">Application Status</th>
                                        <th className="px-6 py-3.5 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">Date Submitted</th>
                                        <th className="px-6 py-3.5 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {applicants.data.map((applicant, idx) => (
                                        <motion.tr
                                            key={applicant.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors duration-200"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-xs shadow-sm group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:border-blue-200 dark:group-hover:border-blue-800 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all">
                                                        {applicant.personal_information?.first_name?.charAt(0) || '-'}
                                                        {applicant.personal_information?.last_name?.charAt(0) || ''}
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200">
                                                            {applicant.personal_information?.first_name} {applicant.personal_information?.last_name}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{applicant.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wide uppercase shadow-sm border ${
                                                    applicant.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' :
                                                    applicant.status === 'rejected' ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800' :
                                                    applicant.status === 'submitted' ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-800' :
                                                    'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        applicant.status === 'approved' ? 'bg-emerald-500' :
                                                        applicant.status === 'rejected' ? 'bg-rose-500' :
                                                        applicant.status === 'submitted' ? 'bg-sky-500' :
                                                        'bg-slate-400'
                                                    }`}></span>
                                                    {applicant.status || 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col text-slate-600 dark:text-slate-300">
                                                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                                                        <Calendar className="w-3.5 h-3.5 opacity-70" />
                                                        <span className="text-[12px] font-semibold">{new Date(applicant.created_at).toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono pl-5">
                                                        {new Date(applicant.created_at).toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit', hour12: true })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <Link
                                                    href={`/admin/applications/${applicant.id}`}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-[#0e4a81] dark:hover:text-[#5a9bd5] hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all shadow-sm group/btn"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                                </Link>
                                            </td>
                                        </motion.tr>
                                    ))}
                                    {applicants.data.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-16 text-center">
                                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 mb-4">
                                                    <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                                                </div>
                                                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">No Applications Found</h4>
                                                <p className="text-slate-400 dark:text-slate-500 text-xs font-medium max-w-sm mx-auto">There are no applications available to display at this moment. New applications will appear here.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        {applicants.last_page > 1 && (
                            <div className="px-6 py-4 bg-[#f8fafc] dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                    Showing <span className="font-bold text-slate-700 dark:text-slate-300">{applicants.from || 0}</span> to <span className="font-bold text-slate-700 dark:text-slate-300">{applicants.to || 0}</span> of <span className="font-bold text-slate-700 dark:text-slate-300">{applicants.total}</span> entries
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {Array.from({ length: Math.min(5, applicants.last_page) }, (_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => router.get(route('admin.applications.index', { page: i + 1 }))}
                                            className={`w-8 h-8 rounded-lg text-[12px] font-bold transition-all border ${
                                                applicants.current_page === i + 1
                                                    ? 'bg-[#0e4a81] dark:bg-[#1a5c9e] text-white border-[#0e4a81] dark:border-[#1a5c9e] shadow-md shadow-[#0e4a81]/20 dark:shadow-[#1a5c9e]/20'
                                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-300 shadow-sm'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}