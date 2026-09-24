import React, { useState, useEffect } from 'react';
import { 
  PRAYER_BANNER_EVENT, 
  PrayerBannerDetail, 
  playAdzanAudio 
} from '../../lib/prayer/prayer-notification';
import { useApp } from '../../context/AppContext';
import { Bell, Volume2, X, MapPin, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PrayerNotificationBanner: React.FC = () => {
  const { settings } = useApp();
  const [activeBanner, setActiveBanner] = useState<PrayerBannerDetail | null>(null);

  useEffect(() => {
    const handleBanner = (event: Event) => {
      const custom = event as CustomEvent<PrayerBannerDetail>;
      if (custom.detail) {
        setActiveBanner(custom.detail);
      }
    };

    window.addEventListener(PRAYER_BANNER_EVENT, handleBanner as EventListener);
    return () => {
      window.removeEventListener(PRAYER_BANNER_EVENT, handleBanner as EventListener);
    };
  }, []);

  if (!activeBanner) return null;

  const isAdzan = activeBanner.type === 'adzan';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 pointer-events-auto"
      >
        <div className={`p-4 sm:p-5 rounded-3xl shadow-2xl border backdrop-blur-xl ${
          isAdzan 
            ? 'bg-emerald-950/95 border-emerald-500/50 text-white shadow-emerald-950/50' 
            : 'bg-slate-900/95 border-amber-500/50 text-white shadow-slate-950/50'
        }`}>
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-2xl shrink-0 ${
              isAdzan 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 animate-bounce' 
                : 'bg-amber-500 text-slate-900'
            }`}>
              <Bell className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isAdzan ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {isAdzan ? '🕌 Waktu Shalat' : '⏳ Pengingat 15 Menit'}
                </span>
                <span className="text-xs font-mono text-slate-400 font-bold">{activeBanner.time} WIB</span>
              </div>

              <h4 className="text-base font-black mt-1 text-white leading-snug">
                {activeBanner.title}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {activeBanner.message}
              </p>

              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{activeBanner.location}</span>
              </div>

              <div className="flex items-center gap-2 mt-3.5 pt-2 border-t border-white/10">
                <button
                  onClick={() => playAdzanAudio(settings.prayer_adzan_volume || 80)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Putar Nada Adzan
                </button>
                <button
                  onClick={() => setActiveBanner(null)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors ml-auto"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mengerti
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveBanner(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
