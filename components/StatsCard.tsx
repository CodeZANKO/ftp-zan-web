import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  subtext?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, subtext }) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        <div className={`p-2 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-white">{value}</span>
        {subtext && <span className="text-xs text-slate-500 mt-1">{subtext}</span>}
      </div>
    </div>
  );
};

export default StatsCard;
