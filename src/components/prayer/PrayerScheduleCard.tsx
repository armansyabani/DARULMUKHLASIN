import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchPrayerTimes, getTodayPrayer } from '../../lib/prayer/prayer-api';
import { 
  getPrayerStatuses, 
  checkAndTriggerNotifications, 
  PrayerStatus,
  getCurrentTimeInJakarta,
  capitalize
} from '../../lib/prayer/prayer-notification';
import { PrayerSchedule } from '../../types';
import { Clock, MapPin, Bell, BellOff, RefreshCw } from 'lucide-react';

export const PrayerScheduleCard: React.FC = () => {
  const { settings } = useApp();
  const [schedule, setSchedule] = useState<PrayerSchedule | null>(null);
  const [statuses, setStatuses] = useState<PrayerStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Realtime countdown state
  const [now, setNow] = useState(getCurrentTimeInJakarta());
  
  // Load Schedule
  const loadSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const today = getCurrentTimeInJakarta();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      
      const provinsi = settings.prayer_provinsi || 'Jawa Tengah';
      const kabkota = settings.prayer_kabkota || 'Kab. Banjarnegara';
      
      const schedules = await fetchPrayerTimes(provinsi, kabkota, month, year);
      const todaySchedule = getTodayPrayer(schedules, today);
      
      if (todaySchedule) {
        setSchedule(todaySchedule);
        setStatuses(getPrayerStatuses(todaySchedule));
      } else {
        setError('Jadwal hari ini tidak tersedia');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat jadwal shalat');
    } finally {
      setLoading(false);
    }
  };

  // Initial load & day change detection
  useEffect(() => {
    loadSchedule();
  }, [settings.prayer_provinsi, settings.prayer_kabkota]);

  // Clock tick & notification trigger
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = getCurrentTimeInJakarta();
      setNow(currentTime);
      
      // Auto refresh on day change (00:00)
      if (schedule && schedule.tanggal_lengkap) {
        // currentTime is already a Date object constructed to reflect Jakarta time in its local methods
        const year = currentTime.getFullYear();
        const month = String(currentTime.getMonth() + 1).padStart(2, '0');
        const day = String(currentTime.getDate()).padStart(2, '0');
        const targetDate = `${year}-${month}-${day}`;
        
        if (targetDate !== schedule.tanggal_lengkap) {
          loadSchedule();
        } else {
          // Update statuses and check notifications
          setStatuses(getPrayerStatuses(schedule));
          checkAndTriggerNotifications(schedule, settings);
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [schedule, settings]);

  const nextPrayer = statuses.find(s => s.isNext);
  
  // Format Countdown
  const countdownText = useMemo(() => {
    if (!nextPrayer) return 'Selesai untuk hari ini';
    
    const diffMs = nextPrayer.dateObj.getTime() - now.getTime();
    if (diffMs <= 0) return 'Waktu Shalat';
    
    const hours = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [nextPrayer, now]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center justify-center min-h-[250px]">
        <div className="flex flex-col items-center gap-2 text-emerald-600">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <p className="text-sm font-bold">Memuat jadwal shalat...</p>
        </div>
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col items-center justify-center min-h-[250px] gap-4">
        <p className="text-sm font-medium text-slate-500">{error || 'Jadwal shalat belum tersedia.'}</p>
        <button 
          onClick={loadSchedule}
          className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold text-xs transition-colors"
        >
          Muat Ulang
        </button>
      </div>
    );
  }

  const isNotifEnabled = settings.prayer_enable_reminder || settings.prayer_enable_adzan_notif;

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl relative overflow-hidden flex flex-col h-full">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Clock className="w-32 h-32 text-emerald-500" />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div>
          <h2 className="text-white font-black uppercase tracking-wider text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Jadwal Shalat Hari Ini
          </h2>
          <div className="flex items-center gap-1.5 mt-1.5 text-slate-400 text-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            <span>{settings.prayer_kabkota || 'Kab. Banjarnegara'}, {settings.prayer_provinsi || 'Jawa Tengah'}</span>
            {settings.prayer_auto_location && (
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded-md font-mono">
                GPS
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">{schedule.hari}, {schedule.tanggal_lengkap}</p>
        </div>
        <div title={isNotifEnabled ? "Notifikasi Aktif" : "Notifikasi Nonaktif"}>
          {isNotifEnabled ? (
            <Bell className="w-5 h-5 text-emerald-500" />
          ) : (
            <BellOff className="w-5 h-5 text-slate-600" />
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 relative z-10 flex-1">
        {/* Next Prayer Highlight */}
        <div className="flex-1 bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 flex flex-col items-center justify-center text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Shalat Berikutnya</p>
          {nextPrayer ? (
            <>
              <h3 className="text-3xl font-black text-emerald-400">{capitalize(nextPrayer.name)}</h3>
              <p className="text-lg font-bold text-white mt-1">{nextPrayer.time}</p>
              <div className="mt-4 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm font-mono font-bold text-emerald-400">
                  {countdownText}
                </p>
              </div>
            </>
          ) : (
            <div className="py-4">
              <h3 className="text-xl font-bold text-slate-300">Waktu Isya Selesai</h3>
              <p className="text-sm text-slate-500 mt-2">Menunggu jadwal besok</p>
            </div>
          )}
        </div>

        {/* Schedule List */}
        <div className="flex-1 flex flex-col justify-center gap-3">
          {statuses.map(s => {
            const active = s.isNext;
            return (
              <div 
                key={s.name}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all ${
                  active 
                    ? 'bg-emerald-500/20 border border-emerald-500/30' 
                    : s.passed 
                      ? 'opacity-50' 
                      : 'bg-slate-800/30 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    active 
                      ? 'bg-emerald-500 text-white' 
                      : s.passed 
                        ? 'bg-emerald-900/50 text-emerald-500' 
                        : 'bg-slate-700 text-slate-400'
                  }`}>
                    {s.passed ? '✓' : active ? '→' : '○'}
                  </div>
                  <span className={`font-bold text-sm ${active ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {capitalize(s.name)}
                  </span>
                </div>
                <span className={`font-mono text-sm font-bold ${active ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {s.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
