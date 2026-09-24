import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatRupiah } from '../utils/formatters';
import { StatCard } from '../components/common/StatCard';
import { QuickPOSWidget } from '../components/dashboard/QuickPOSWidget';
import { GuestSantriActivityWidget } from '../components/dashboard/GuestSantriActivityWidget';
import { TopSantriTable } from '../components/dashboard/TopSantriTable';
import { PrayerScheduleCard } from '../components/prayer/PrayerScheduleCard';
import { TransactionChart } from '../components/dashboard/TransactionChart';
import { CategoryPieChart } from '../components/dashboard/CategoryPieChart';
import { HeroCarousel } from '../components/dashboard/HeroCarousel';
import { Link } from 'react-router-dom';
import { getCardPaddingClass, getCardClass, getHeaderClass } from '../utils/themeUtils';
import {
  Users,
  Wallet,
  ShoppingCart,
  TrendingUp,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Clock,
  Sparkles,
  FileSpreadsheet,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import santriPengajianPhoto from '../assets/images/santri_pengajian_pesantren_1790234639868.jpg';
import pesantrenLogo from '../assets/images/sirajuddin_logo.jpg';

export const DashboardPage: React.FC = () => {
  const { stats, topSantri, transactions, topups, settings, students, isLoading, uiStyle } = useApp();
  const { user } = useAuth();
  
  const isGuest = user?.role === 'guest' || user?.role === 'viewer';
  const minBalanceAlert = settings.min_balance_alert || 10000;

  const debtStudents = (students || []).filter((s) => s.balance < 0);
  const warningStudents = (students || []).filter((s) => s.balance >= 0 && s.balance <= minBalanceAlert);
  const totalDebt = debtStudents.reduce((acc, s) => acc + Math.abs(s.balance), 0);

  const safeStats = stats || { total_students: 0, active_students: 0, total_balance_all: 0, today_transactions_count: 0, today_income: 0, today_expense: 0, yesterday_income: 0, yesterday_expense: 0, this_month_expense: 0, this_month_topup: 0 };
  
  const isNeo = uiStyle === 'neo-brutalism';

  // Helper for consistent local YMD
  const getLocalYMD = (d: Date | string): string => {
    const dt = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(dt.getTime())) return '';
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const now = new Date();
  const todayYMD = getLocalYMD(now);

  // Real-time Today Metrics
  const todayTrxs = useMemo(() => {
    return (transactions || []).filter((t) => getLocalYMD(t.created_at) === todayYMD);
  }, [transactions, todayYMD]);

  const todayTopUps = useMemo(() => {
    return (topups || []).filter((tp) => getLocalYMD(tp.created_at) === todayYMD);
  }, [topups, todayYMD]);

  const todayExpense = todayTrxs.length > 0
    ? todayTrxs.reduce((sum, t) => sum + (t.amount || 0), 0)
    : (safeStats.today_expense || 0);

  const todayIncome = todayTopUps.length > 0
    ? todayTopUps.reduce((sum, tp) => sum + (tp.amount || 0), 0)
    : (safeStats.today_income || 0);

  const todayTransactionsCount = todayTrxs.length > 0
    ? todayTrxs.length
    : (safeStats.today_transactions_count || 0);

  // This Week Jajan (Last 7 Days)
  const thisWeekExpense = useMemo(() => {
    const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const recent = (transactions || []).filter((t) => {
      const dt = new Date(t.created_at);
      return !isNaN(dt.getTime()) && dt >= sevenDaysAgo;
    });
    if (recent.length > 0) {
      return recent.reduce((sum, t) => sum + (t.amount || 0), 0);
    }
    return todayExpense;
  }, [transactions, todayExpense, now]);

  // This Month Jajan
  const thisMonthExpense = useMemo(() => {
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const monthTrxs = (transactions || []).filter((t) => {
      const dt = new Date(t.created_at);
      return !isNaN(dt.getTime()) && dt.getFullYear() === curYear && dt.getMonth() === curMonth;
    });
    if (monthTrxs.length > 0) {
      return monthTrxs.reduce((sum, t) => sum + (t.amount || 0), 0);
    }
    return safeStats.this_month_expense || thisWeekExpense || todayExpense;
  }, [transactions, safeStats.this_month_expense, thisWeekExpense, todayExpense, now]);

  const totalStudentsCount = students && students.length > 0 ? students.length : (safeStats.total_students || 0);
  const activeStudentsCount = students && students.length > 0 
    ? students.filter((s) => s.status === 'aktif').length 
    : (safeStats.active_students || totalStudentsCount);

  const totalBalanceAll = students && students.length > 0
    ? students.reduce((sum, s) => sum + (s.balance || 0), 0)
    : (safeStats.total_balance_all || 0);

  return (
    <div className={`space-y-6 pb-8 ${isNeo ? 'font-mono' : ''}`}>
      
      {/* HERO SECTION */}
      {isNeo ? (
        <div className="relative w-full rounded-3xl overflow-hidden border-2 border-amber-500/40 bg-gradient-to-br from-[#064e3b] via-[#043428] to-[#021f18] shadow-2xl p-6 sm:p-9 z-10 transition-all">
          {/* Subtle Islamic Arabesque Geometric Background Motif */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none" 
            style={{ 
              backgroundImage: 'radial-gradient(circle at 2px 2px, #f59e0b 1px, transparent 0)', 
              backgroundSize: '24px 24px' 
            }}
          />
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row gap-6 sm:gap-8 items-center justify-between">
            <div className="max-w-xl text-center sm:text-left">
              {/* Islamic Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-950/90 border border-amber-400/50 text-amber-300 font-semibold rounded-full text-xs sm:text-sm mb-3.5 shadow-sm">
                <span className="font-serif">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
                <span className="text-amber-400/50">·</span>
                <span>{isGuest ? 'Portal Amanah Wali Santri' : 'Sistem Keuangan Syariah'}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2.5">
                {isGuest ? 'PANTAU JAJAN & SALDO SANTRI' : 'TOP-UP & KASIR KOPERASI'}
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base font-medium text-emerald-100/90 mb-5 leading-relaxed">
                {isGuest 
                  ? 'Transparan, Barokah, dan Amanah dalam Memantau Keuangan Ananda.' 
                  : 'Layanan Keuangan Koperasi Pesantren Cepat, Aman, dan Akuntabel.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                {!isGuest ? (
                  <>
                    <Link 
                      to="/topup" 
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                    >
                      <Wallet className="w-4 h-4" />
                      Isi Saldo Santri
                    </Link>
                    <Link 
                      to="/kasir" 
                      className="px-5 py-2.5 bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm rounded-xl border border-emerald-500/40 shadow-md transition-all active:scale-95 flex items-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Kasir Transaksi (POS)
                    </Link>
                  </>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-200 text-xs sm:text-sm font-medium">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>{settings.pesantren_name || 'Pondok Pesantren Darul Mukhlasin'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Islamic Photo Frame */}
            <div className="shrink-0 relative">
              <div className="w-44 h-36 sm:w-52 sm:h-40 lg:w-60 lg:h-44 rounded-2xl bg-gradient-to-br from-emerald-950 to-slate-950 border-2 border-amber-400/50 shadow-2xl p-1 relative z-10 overflow-hidden ring-4 ring-amber-400/20">
                <img 
                  src={santriPengajianPhoto} 
                  alt="Suasana Pengajian Santri Pondok Pesantren" 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = settings.login_image_url || pesantrenLogo;
                  }}
                  className="w-full h-full object-cover rounded-xl shadow-inner transition-transform duration-300 hover:scale-105" 
                />
              </div>

              {/* Islamic Value Ribbon */}
              <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg shadow-md border border-amber-300 text-xs z-20 flex items-center gap-1">
                <span>Majlis Santri 📖</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <HeroCarousel />
      )}

      {/* Prayer Schedule */}
      <div className="mb-6">
        <PrayerScheduleCard />
      </div>

      {/* Debt & Low Balance Alert Notice (If Any) */}
      {!isGuest && (debtStudents.length > 0 || warningStudents.length > 0) && (
        <div className={isNeo 
          ? "p-4 bg-orange-400 border-[4px] border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse"
          : "p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 dark:from-rose-950/40 dark:via-amber-950/30 dark:to-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        }>
          <div className="flex items-start gap-3">
            <div className={isNeo ? "p-2 bg-red-600 border-[3px] border-black text-white shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "p-2 rounded-xl bg-rose-600 text-white shrink-0 mt-0.5 animate-pulse"}>
              <ShieldAlert className={isNeo ? "w-6 h-6" : "w-5 h-5"} />
            </div>
            <div>
              <h4 className={isNeo ? "font-black text-lg text-black uppercase tracking-tight" : "font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2"}>
                Warning: Monitoring Saldo
              </h4>
              <p className={isNeo ? "text-sm font-bold text-black mt-1" : "text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1"}>
                Terdapat {debtStudents.length} santri berhutang (total {formatRupiah(totalDebt)}) dan {warningStudents.length} santri saldo sekarat.
              </p>
            </div>
          </div>
          <Link
            to="/santri"
            className={isNeo 
              ? "shrink-0 px-4 py-2 bg-white border-[3px] border-black text-black font-black text-sm uppercase flex items-center gap-1.5 hover:bg-slate-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all"
              : "shrink-0 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
            }
          >
            Lihat Data
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Quick Operational Action Bar (from User's Design) */}
      {!isGuest && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0c1322] border border-slate-800/90 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00c48c] shadow-[0_0_8px_#00c48c]"></span>
            <span className="text-sm font-bold text-white tracking-wide">
              Aksi Cepat Operasional Koperasi:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/kasir"
              className="px-4 py-2 rounded-xl bg-[#00c48c] hover:bg-[#00ad7b] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Kasir POS (Jajan)</span>
            </Link>
            <Link
              to="/topup"
              className="px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>Isi Saldo Santri</span>
            </Link>
            <Link
              to="/santri"
              className="px-4 py-2 rounded-xl bg-[#9333ea] hover:bg-[#7e22ce] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Data Santri</span>
            </Link>
            <Link
              to="/laporan"
              className="px-4 py-2 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Cetak Laporan</span>
            </Link>
          </div>
        </div>
      )}

      {/* 6 Stat Cards Grid (from User's Reference Image) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <StatCard
          title="JUMLAH SANTRI SMP"
          value={`${totalStudentsCount} Santri`}
          subtitle={`${activeStudentsCount} Santri Aktif`}
          badgeText="Total Terdaftar"
          icon={Users}
          colorScheme="emerald"
        />
        <StatCard
          title="SALDO KESELURUHAN"
          value={formatRupiah(totalBalanceAll)}
          subtitle="Tabungan Seluruh Santri"
          badgeText="Simpanan Koperasi"
          icon={Wallet}
          colorScheme="blue"
        />
        <StatCard
          title="TRANSAKSI JAJAN HARI INI"
          value={`${todayTransactionsCount} Transaksi`}
          subtitle={`Total Jajan: ${formatRupiah(todayExpense)}`}
          badgeText="Kasir Aktif"
          icon={ShoppingCart}
          colorScheme="amber"
        />
        <StatCard
          title="ISI SALDO (TOPUP) HARI INI"
          value={formatRupiah(todayIncome)}
          subtitle="Pemasukan Kasir Hari Ini"
          badgeText="Saldo Masuk"
          icon={ArrowDownRight}
          colorScheme="teal"
        />
        <StatCard
          title="JAJAN MINGGU INI"
          value={formatRupiah(thisWeekExpense)}
          subtitle="Total Pengeluaran Minggu Ini"
          badgeText="Omset Mingguan"
          icon={ArrowUpRight}
          colorScheme="purple"
        />
        <StatCard
          title="JAJAN BULAN INI"
          value={formatRupiah(thisMonthExpense)}
          subtitle="Total Pengeluaran Bulan Ini"
          badgeText="Omset Bulanan"
          icon={TrendingUp}
          colorScheme="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {!isGuest ? (
            <div className={getCardPaddingClass(uiStyle, "p-6 overflow-hidden relative")}>
              <h2 className={isNeo ? "text-2xl font-black uppercase mb-6 flex items-center gap-2" : "text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"}>
                {isNeo && <span className="bg-purple-400 px-2 border-[2px] border-black -rotate-3">🚀 QUICK</span>}
                {!isNeo && <Zap className="w-5 h-5 text-emerald-500" />}
                POS KASIR CEPAT
              </h2>
              <QuickPOSWidget />
            </div>
          ) : (
            <GuestSantriActivityWidget />
          )}

          <div className={getCardPaddingClass(uiStyle, isNeo ? "p-0" : "p-6")}>
             <div className={getHeaderClass(uiStyle, "cyan-400")}>
              <h2 className="text-xl font-black uppercase">📈 Grafik Transaksi</h2>
             </div>
            {!isNeo && (
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  Grafik Transaksi
                </h2>
              </div>
            )}
            <div className={isNeo ? "p-6" : ""}>
              <TransactionChart />
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6 sm:space-y-8 pb-12 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={getCardPaddingClass(uiStyle, isNeo ? "p-0" : "p-6 space-y-6")}>
             <div className={getHeaderClass(uiStyle, "rose-400")}>
              <h2 className="text-lg font-black uppercase">🏆 Top Santri</h2>
             </div>
             <div className={isNeo ? "p-4" : ""}>
               <TopSantriTable topSantri={topSantri || []} />
             </div>
          </div>
          
          <div className={getCardPaddingClass(uiStyle, isNeo ? "p-0" : "p-6")}>
             <div className={getHeaderClass(uiStyle, "lime-400")}>
              <h2 className="text-lg font-black uppercase">📊 Kategori Jajan</h2>
             </div>
             <div className={isNeo ? "p-4" : ""}>
               <CategoryPieChart />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
