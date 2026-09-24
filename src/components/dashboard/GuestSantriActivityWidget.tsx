import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { formatRupiah, formatDateTime } from '../../utils/formatters';
import {
  User,
  Search,
  Wallet,
  ShoppingBag,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  BadgeCheck,
  ChevronRight,
  Phone,
  Layers,
} from 'lucide-react';
import { StudentAvatar } from '../common/StudentAvatar';
import waliSantriAvatar from '../../assets/images/wali_santri_avatar_habibi_1790235608369.jpg';

export const GuestSantriActivityWidget: React.FC = () => {
  const { students, transactions, topups, settings, uiStyle } = useApp();
  const isNeo = uiStyle === 'neo-brutalism';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'jajan' | 'topup'>('all');

  const minBalanceAlert = settings.min_balance_alert || 10000;

  // Filter active students by search
  const filteredStudents = useMemo(() => {
    return (students || []).filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.nis.toLowerCase().includes(q) ||
        s.class_name.toLowerCase().includes(q)
      );
    });
  }, [students, searchQuery]);

  // The currently selected student
  const selectedStudent = useMemo(() => {
    if (selectedStudentId) {
      return students.find((s) => s.id === selectedStudentId) || null;
    }
    return null;
  }, [students, selectedStudentId]);

  // Stats for the selected student
  const studentStats = useMemo(() => {
    if (!selectedStudent) return null;

    const todayStr = new Date().toISOString().slice(0, 10);
    const thisMonthStr = new Date().toISOString().slice(0, 7);

    const studentTransactions = (transactions || []).filter(
      (t) => t.student_id === selectedStudent.id
    );
    const studentTopups = (topups || []).filter(
      (tp) => tp.student_id === selectedStudent.id
    );

    const todaySpent = studentTransactions
      .filter((t) => t.created_at.slice(0, 10) === todayStr)
      .reduce((sum, t) => sum + t.amount, 0);

    const thisMonthSpent = studentTransactions
      .filter((t) => t.created_at.slice(0, 7) === thisMonthStr)
      .reduce((sum, t) => sum + t.amount, 0);

    const thisMonthTopUp = studentTopups
      .filter((tp) => tp.created_at.slice(0, 7) === thisMonthStr)
      .reduce((sum, tp) => sum + tp.amount, 0);

    return {
      totalSpentAll: studentTransactions.reduce((sum, t) => sum + t.amount, 0),
      todaySpent,
      thisMonthSpent,
      thisMonthTopUp,
      transactionCount: studentTransactions.length,
      topUpCount: studentTopups.length,
    };
  }, [selectedStudent, transactions, topups]);

  // Combined timeline of transactions & topups for the selected student
  const studentTimeline = useMemo(() => {
    if (!selectedStudent) return [];

    const items: Array<{
      id: string;
      type: 'jajan' | 'topup';
      code: string;
      amount: number;
      label: string;
      notes?: string;
      created_at: string;
    }> = [];

    if (activeTab === 'all' || activeTab === 'jajan') {
      (transactions || [])
        .filter((t) => t.student_id === selectedStudent.id)
        .forEach((t) => {
          items.push({
            id: t.id,
            type: 'jajan',
            code: t.code,
            amount: t.amount,
            label: t.category,
            notes: t.notes,
            created_at: t.created_at,
          });
        });
    }

    if (activeTab === 'all' || activeTab === 'topup') {
      (topups || [])
        .filter((tp) => tp.student_id === selectedStudent.id)
        .forEach((tp) => {
          items.push({
            id: tp.id,
            type: 'topup',
            code: tp.code,
            amount: tp.amount,
            label: tp.payment_method || 'Isi Saldo',
            notes: tp.notes,
            created_at: tp.created_at,
          });
        });
    }

    return items.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [selectedStudent, transactions, topups, activeTab]);

  // Overall recent transactions (when no student selected)
  const recentGlobalTransactions = useMemo(() => {
    return (transactions || [])
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
  }, [transactions]);

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-3xl border ${
        isNeo
          ? 'border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
          : 'border-slate-200 dark:border-slate-800 shadow-sm'
      } p-4 sm:p-6 overflow-hidden`}
    >
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Aktivitas Jajan & Saldo Santri
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Portal Wali Santri: Pantau rincian uang jajan, sisa tabungan santri, dan riwayat belanja harian secara transparan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <img
            src={waliSantriAvatar}
            alt="Wali Santri"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/40 shadow-xs shrink-0"
          />
          <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold inline-flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-800">
            <BadgeCheck className="w-3.5 h-3.5" />
            Mode Monitoring Wali
          </span>
        </div>
      </div>

      {/* Santri Selector / Search */}
      <div className="mt-5 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Pilih atau Cari Nama Santri (Putra / Putri):
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik nama santri atau NIS (contoh: Ahmad, Fatimah, 2024001)..."
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border ${
                isNeo
                  ? 'border-2 border-black font-mono'
                  : 'border-slate-200 dark:border-slate-700'
              } rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Quick Santri Chips if no student selected or filtering */}
        {!selectedStudent && (
          <div>
            <div className="text-[11px] font-semibold text-slate-400 mb-2">
              Daftar Santri Terdaftar ({filteredStudents.length} Santri):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedStudentId(s.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all ${
                      isNeo
                        ? 'border-2 border-black hover:bg-amber-100 dark:hover:bg-slate-800'
                        : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20'
                    }`}
                  >
                    <StudentAvatar
                      src={s.avatar_url}
                      name={s.name}
                      className="w-9 h-9 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {s.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {s.class_name} • NIS: {s.nis}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-black ${
                          s.balance < 0
                            ? 'text-rose-600'
                            : s.balance <= minBalanceAlert
                            ? 'text-amber-600'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {formatRupiah(s.balance)}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="col-span-full py-6 text-center text-xs text-slate-400">
                  Tidak ditemukan santri dengan nama &quot;{searchQuery}&quot;.
                </div>
              )}
            </div>
          </div>
        )}

        {/* SELECTED STUDENT VIEW */}
        {selectedStudent && (
          <div className="space-y-5 pt-2">
            {/* Student Info Card */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border ${
                isNeo
                  ? 'border-3 border-black bg-yellow-50 dark:bg-slate-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'border-emerald-200/80 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/50 via-white to-slate-50 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <StudentAvatar
                    src={selectedStudent.avatar_url}
                    name={selectedStudent.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-emerald-500/30 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {selectedStudent.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                        Aktif
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      NIS: <strong className="text-slate-800 dark:text-slate-200">{selectedStudent.nis}</strong> • Kelas: {selectedStudent.class_name} • Asrama: {selectedStudent.dormitory}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                      <User className="w-3 h-3 text-slate-400" />
                      Wali: <span className="font-semibold text-slate-600 dark:text-slate-300">{selectedStudent.parent_name || '-'}</span>
                      {selectedStudent.parent_phone && (
                        <span className="text-slate-400">({selectedStudent.parent_phone})</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentId('')}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    Ganti Santri
                  </button>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        selectedStudent.balance < 0
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : selectedStudent.balance <= minBalanceAlert
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {selectedStudent.balance < 0 ? (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" /> Ada Bon/Hutang
                        </>
                      ) : selectedStudent.balance <= minBalanceAlert ? (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" /> Saldo Menipis
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Saldo Aman
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Balance & Spending Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Sisa Saldo Tabungan
                  </span>
                  <div
                    className={`text-base sm:text-xl font-black mt-0.5 ${
                      selectedStudent.balance < 0
                        ? 'text-rose-600'
                        : selectedStudent.balance <= minBalanceAlert
                        ? 'text-amber-600'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {formatRupiah(selectedStudent.balance)}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Jajan Hari Ini
                  </span>
                  <div className="text-base sm:text-xl font-black text-slate-800 dark:text-slate-100 mt-0.5">
                    {formatRupiah(studentStats?.todaySpent || 0)}
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Jajan Bulan Ini
                  </span>
                  <div className="text-base sm:text-xl font-black text-slate-800 dark:text-slate-100 mt-0.5">
                    {formatRupiah(studentStats?.thisMonthSpent || 0)}
                  </div>
                </div>
              </div>
            </div>

            {/* Student Spending Timeline */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Histori Jajan & Tabungan Santri
                  </h4>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      activeTab === 'all'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('jajan')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      activeTab === 'jajan'
                        ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Jajan
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('topup')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      activeTab === 'topup'
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Top-Up
                  </button>
                </div>
              </div>

              {/* Transactions list */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {studentTimeline.length > 0 ? (
                  studentTimeline.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            item.type === 'topup'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {item.type === 'topup' ? (
                            <ArrowDownRight className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                              {item.type === 'topup' ? 'Isi Saldo' : item.label}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {item.code}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {formatDateTime(item.created_at)}
                            {item.notes ? ` • ${item.notes}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`font-black text-xs sm:text-sm ${
                            item.type === 'topup'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {item.type === 'topup' ? '+' : '-'}
                          {formatRupiah(item.amount)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Belum ada catatan transaksi untuk kategori ini.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* If no student selected, show live general activity feed */}
        {!selectedStudent && (
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Aktivitas Jajan Koperasi Terkini (Real-time Feed)
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">10 Transaksi Terbaru</span>
            </div>

            <div className="space-y-1.5">
              {recentGlobalTransactions.length > 0 ? (
                recentGlobalTransactions.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedStudentId(t.student_id)}
                    className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 shrink-0">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {t.student_name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {t.category} • {formatDateTime(t.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-black text-xs text-rose-600 dark:text-rose-400">
                        -{formatRupiah(t.amount)}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Belum ada riwayat transaksi hari ini.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
