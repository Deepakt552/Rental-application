// Components/DashboardCards.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';

interface CardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange';
  prefix?: string;
  suffix?: string;
}

interface DashboardCardsProps {
  cards: CardProps[];
  isLoading: boolean;
}

const colorStyles = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
  green: { bg: 'bg-green-50', text: 'text-green-600', iconBg: 'bg-green-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', iconBg: 'bg-orange-100' },
};

const DashboardCards: React.FC<DashboardCardsProps> = ({ cards, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6 lg:mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="h-3 bg-slate-200 rounded w-24"></div>
                <div className="h-8 bg-slate-200 rounded w-32"></div>
                <div className="h-3 bg-slate-200 rounded w-28"></div>
              </div>
              <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6 lg:mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="group bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60 border border-slate-100 transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {card.title}
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-slate-900 mt-2 tracking-tight">
                {card.prefix}{card.value}{card.suffix}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl ${colorStyles[card.color].iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <card.icon className={`w-6 h-6 ${colorStyles[card.color].text}`} />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-0.5 px-2 py-1 rounded-full text-xs font-semibold ${
              card.trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {card.trend === 'up' ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              <span>{Math.abs(card.change)}%</span>
            </div>
            <span className="text-xs text-slate-500">Since last month</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardCards;