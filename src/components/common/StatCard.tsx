import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme?: 'emerald' | 'blue' | 'amber' | 'purple' | 'rose' | 'teal';
  customIconBg?: string;
  badgeText?: string;
  badgeDotColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'emerald',
  customIconBg,
  badgeText,
  badgeDotColor = '#00c48c',
}) => {
  const colorMap: Record<string, string> = {
    emerald: 'bg-[#00c48c] text-white shadow-[#00c48c]/30',
    teal: 'bg-[#00c48c] text-white shadow-[#00c48c]/30',
    blue: 'bg-[#2563eb] text-white shadow-[#2563eb]/30',
    amber: 'bg-[#f59e0b] text-white shadow-[#f59e0b]/30',
    purple: 'bg-[#a855f7] text-white shadow-[#a855f7]/30',
    rose: 'bg-[#e11d48] text-white shadow-[#e11d48]/30',
  };

  const iconClass = customIconBg || colorMap[colorScheme] || colorMap.emerald;

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#0c1427] dark:bg-[#0c1427] border border-slate-800/90 shadow-md flex items-start justify-between gap-4 transition-all hover:border-slate-700 hover:shadow-lg hover:-translate-y-0.5">
      <div className="flex-1 min-w-0">
        <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
          {title}
        </p>
        <h3 className="text-2xl sm:text-3xl font-black text-white mt-1.5 tracking-tight truncate">
          {value}
        </h3>
        {subtitle && (
          <p className="text-xs font-medium text-slate-400 mt-1 truncate">
            {subtitle}
          </p>
        )}
        {badgeText && (
          <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#141e33] text-slate-300 border border-slate-700/60">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: badgeDotColor, boxShadow: `0 0 6px ${badgeDotColor}` }}
            />
            <span>{badgeText}</span>
          </div>
        )}
      </div>

      {/* Colored Icon Container */}
      <div
        className={`w-12 h-12 flex items-center justify-center rounded-2xl shadow-md shrink-0 ${iconClass}`}
      >
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
export default StatCard;
