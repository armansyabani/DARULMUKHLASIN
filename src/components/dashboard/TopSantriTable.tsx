import React from 'react';
import { TopSantriStat } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { Award, Trophy, User } from 'lucide-react';
import { useNavigate } from 'react-router';
import { StudentAvatar } from '../common/StudentAvatar';

interface TopSantriTableProps {
  topSantri: TopSantriStat[];
}

export const TopSantriTable: React.FC<TopSantriTableProps> = ({ topSantri }) => {
  const navigate = useNavigate();

  if (!topSantri || topSantri.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center text-slate-400 text-xs">
        Belum ada data transaksi santri
      </div>
    );
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-black text-xs flex items-center justify-center shadow-xs">1</div>;
    if (rank === 2) return <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center shadow-xs">2</div>;
    if (rank === 3) return <div className="w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-xs">3</div>;
    return <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-xs flex items-center justify-center">{rank}</div>;
  };

  return (
    <div className="">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Top 10 Santri Paling Sering Jajan</h3>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Statistik Koperasi</span>
      </div>

      <div className="space-y-1">
        {topSantri.slice(0, 10).map((s, idx) => (
          <div
            key={s.student_id ? `top-santri-${s.student_id}-${idx}` : `top-santri-rank-${idx}`}
            onClick={() => navigate(`/santri/${s.student_id}`)}
            className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex-shrink-0">{getRankBadge(idx + 1)}</div>
              <StudentAvatar
                src={s.avatar_url}
                name={s.student_name}
                className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-slate-100 dark:ring-slate-800"
              />
              <div className="min-w-0">
                <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                  {s.student_name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-medium text-slate-500 truncate">{s.class_name}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0"></span>
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">{s.transaction_count}x jajan</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end shrink-0 pl-3">
              <span className="font-black text-xs sm:text-sm text-rose-600 dark:text-rose-400">
                {formatRupiah(s.total_spent)}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 mt-0.5">
                Sisa: {formatRupiah(s.current_balance)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
