// Components/ChartsSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ChartsSectionProps {
  analytics: {
    revenue: Array<{ date: string; amount: number }>;
    orders: Array<{ date: string; count: number }>;
    weekly: Array<{ day: string; sales: number; orders: number }>;
    growth: Array<{ month: string; revenue: number; orders: number }>;
    products: Array<{ name: string; sales: number; revenue: number }>;
  };
  isLoading: boolean;
}

const CustomTooltip = ({ active, payload, label, type }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-3">
        <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
        {payload.map((item: any, idx: number) => (
          <p key={idx} className="text-sm font-bold" style={{ color: item.color }}>
            {type === 'currency' ? '$' : ''}{item.value.toLocaleString()} {item.name === 'orders' ? 'orders' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ChartSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-slate-100 rounded-xl"></div>
  </div>
);

const ChartsSection: React.FC<ChartsSectionProps> = ({ analytics, isLoading }) => {
  const COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#06B6D4', '#10B981'];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 lg:mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
            <ChartSkeleton />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 lg:mb-8">
      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-5 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-xl transition-shadow"
      >
        <div className="mb-4">
          <h3 className="font-bold text-slate-900">Revenue Analytics</h3>
          <p className="text-xs text-slate-500 mt-0.5">Daily revenue performance</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analytics.revenue}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
            <Tooltip content={<CustomTooltip type="currency" />} cursor={{ stroke: '#CBD5E1', strokeWidth: 1 }} />
            <Area type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} fill="url(#revenueGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Orders Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl p-5 shadow-xl shadow-slate-200/50 border border-slate-100"
      >
        <div className="mb-4">
          <h3 className="font-bold text-slate-900">Orders Analytics</h3>
          <p className="text-xs text-slate-500 mt-0.5">Daily order volume</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.orders}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1F5F9' }} />
            <Bar dataKey="count" fill="#6366F1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Weekly Performance */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-5 shadow-xl shadow-slate-200/50 border border-slate-100"
      >
        <div className="mb-4">
          <h3 className="font-bold text-slate-900">Weekly Performance</h3>
          <p className="text-xs text-slate-500 mt-0.5">Sales vs Orders comparison</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.weekly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} />
            <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Product Performance Pie Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl p-5 shadow-xl shadow-slate-200/50 border border-slate-100"
      >
        <div className="mb-4">
          <h3 className="font-bold text-slate-900">Product Performance</h3>
          <p className="text-xs text-slate-500 mt-0.5">Sales distribution by product</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={analytics.products}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="sales"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: '#CBD5E1', strokeWidth: 1 }}
            >
              {analytics.products.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default ChartsSection;