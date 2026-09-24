import { AppSettings, PrayerSchedule } from '../../types';

export const PRAYER_EVENT = 'koperasi:prayer_notif';
export const PRAYER_BANNER_EVENT = 'koperasi:prayer_banner';

export interface PrayerEventDetail {
  title: string;
  message: string;
}

export interface PrayerBannerDetail {
  type: 'prep' | 'adzan';
  prayerName: string;
  time: string;
  title: string;
  message: string;
  location: string;
}

export const PRAYER_NAMES = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'] as const;
export type PrayerName = typeof PRAYER_NAMES[number];

const NOTIFIED_KEY = 'koperasi_prayer_notified';

export interface PrayerStatus {
  name: PrayerName;
  time: string; // HH:mm
  passed: boolean;
  isNext: boolean;
  dateObj: Date;
}

export function getCurrentTimeInJakarta(): Date {
  const str = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
  return new Date(str);
}

export function parsePrayerTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split('-');
  const [hours, minutes] = timeStr.split(':');

  const date = getCurrentTimeInJakarta();
  date.setFullYear(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  return date;
}

export function getPrayerStatuses(schedule: PrayerSchedule): PrayerStatus[] {
  const now = getCurrentTimeInJakarta();

  const statuses: PrayerStatus[] = PRAYER_NAMES.map((name) => {
    const timeStr = schedule[name];
    const dateObj = parsePrayerTime(schedule.tanggal_lengkap, timeStr);
    return {
      name,
      time: timeStr,
      passed: now.getTime() >= dateObj.getTime(),
      isNext: false,
      dateObj,
    };
  });

  // Find the next one
  const nextPrayerIndex = statuses.findIndex((s) => !s.passed);
  if (nextPrayerIndex !== -1) {
    statuses[nextPrayerIndex].isNext = true;
  }

  return statuses;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;

  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch (e) {
    console.warn('Could not request notification permission:', e);
    return false;
  }
}

function hasBeenNotified(identifier: string): boolean {
  try {
    const records = JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '{}');
    return !!records[identifier];
  } catch {
    return false;
  }
}

function markAsNotified(identifier: string) {
  try {
    const records = JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '{}');
    records[identifier] = true;

    // Cleanup old records (keep last 50)
    const keys = Object.keys(records);
    if (keys.length > 50) {
      const toDelete = keys.slice(0, keys.length - 50);
      toDelete.forEach((k) => delete records[k]);
    }

    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(records));
  } catch (e) {
    console.error(e);
  }
}

/**
 * Web Audio API synthesizer for guaranteed melodic Islamic prayer chime.
 * Works without external assets, guaranteed to play without 404.
 */
export function playSynthesizedAdzanChime(volume: number = 80) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const masterGain = ctx.createGain();
    const gainVal = Math.max(0.05, Math.min(1, (volume / 100) * 0.5));
    masterGain.gain.setValueAtTime(gainVal, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Harmonic pentatonic adzan chord sequence (Hz)
    // D4 (293.66), F4 (349.23), G4 (392.00), A4 (440.00), C5 (523.25), D5 (587.33)
    const notes = [
      { freq: 293.66, time: 0.0, duration: 1.2 },
      { freq: 392.00, time: 0.6, duration: 1.4 },
      { freq: 440.00, time: 1.2, duration: 1.5 },
      { freq: 523.25, time: 1.8, duration: 2.2 },
      { freq: 587.33, time: 2.4, duration: 3.0 },
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      noteGain.gain.setValueAtTime(0.001, ctx.currentTime + time);
      noteGain.gain.exponentialRampToValueAtTime(0.8, ctx.currentTime + time + 0.08);
      noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + duration);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + duration);
    });
  } catch (err) {
    console.warn('Web Audio adzan chime failed:', err);
  }
}

export function playAdzanAudio(volume: number = 80) {
  // 1. Play synthesized chime immediately
  playSynthesizedAdzanChime(volume);

  // 2. Also try audio element with online CDN backup
  try {
    const audio = new Audio('/audio/adhan.mp3');
    audio.volume = Math.max(0, Math.min(100, volume)) / 100;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback to online short adzan if local file not found
        try {
          const fallbackAudio = new Audio(
            'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3'
          );
          fallbackAudio.volume = Math.max(0, Math.min(100, volume)) / 100;
          fallbackAudio.play().catch(() => {});
        } catch {}
      });
    }
  } catch (e) {
    console.warn('Audio element error:', e);
  }
}

export function checkAndTriggerNotifications(
  schedule: PrayerSchedule,
  settings: AppSettings
) {
  const now = getCurrentTimeInJakarta();
  const statuses = getPrayerStatuses(schedule);
  const nextPrayer = statuses.find((s) => s.isNext);

  if (!nextPrayer) return; // All prayers passed today

  const diffMs = nextPrayer.dateObj.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  const dateStr = schedule.tanggal_lengkap;
  const prepId = `${dateStr}-${nextPrayer.name}-prep`;
  const adzanId = `${dateStr}-${nextPrayer.name}-adzan`;
  const locationLabel = `${settings.prayer_kabkota || 'Kab. Banjarnegara'}, ${settings.prayer_provinsi || 'Jawa Tengah'}`;

  const canShowBrowserNotif = 'Notification' in window && Notification.permission === 'granted';

  // 1. Check preparation notification (15 minutes before)
  if (settings.prayer_enable_reminder && diffMinutes <= 15 && diffMinutes > 0) {
    if (!hasBeenNotified(prepId)) {
      const title = `🕌 Persiapan Shalat ${capitalize(nextPrayer.name)}`;
      const msg = `15 menit lagi menuju waktu ${capitalize(nextPrayer.name)} (${nextPrayer.time} WIB). Silakan bersiap mengambil wudhu.`;

      if (canShowBrowserNotif) {
        try {
          new Notification(title, {
            body: msg,
            icon: '/favicon.ico',
            tag: prepId,
          });
        } catch {}
      }

      window.dispatchEvent(
        new CustomEvent(PRAYER_EVENT, { detail: { title, message: msg } })
      );

      window.dispatchEvent(
        new CustomEvent<PrayerBannerDetail>(PRAYER_BANNER_EVENT, {
          detail: {
            type: 'prep',
            prayerName: capitalize(nextPrayer.name),
            time: nextPrayer.time,
            title,
            message: msg,
            location: locationLabel,
          },
        })
      );

      markAsNotified(prepId);
    }
  }

  // 2. Check adzan notification (exact time or up to 2 mins passed)
  if (diffMinutes <= 0 && diffMinutes > -2) {
    if (!hasBeenNotified(adzanId)) {
      const titleAdzan = `🔔 Waktu Shalat ${capitalize(nextPrayer.name)} Telah Tiba!`;
      const msgAdzan = `Telah masuk waktu shalat ${capitalize(nextPrayer.name)} pukul ${nextPrayer.time} WIB untuk wilayah ${locationLabel}.`;

      if (settings.prayer_enable_adzan_notif) {
        if (canShowBrowserNotif) {
          try {
            new Notification(titleAdzan, {
              body: msgAdzan,
              icon: '/favicon.ico',
              tag: adzanId,
            });
          } catch {}
        }

        window.dispatchEvent(
          new CustomEvent(PRAYER_EVENT, {
            detail: { title: titleAdzan, message: msgAdzan },
          })
        );

        window.dispatchEvent(
          new CustomEvent<PrayerBannerDetail>(PRAYER_BANNER_EVENT, {
            detail: {
              type: 'adzan',
              prayerName: capitalize(nextPrayer.name),
              time: nextPrayer.time,
              title: titleAdzan,
              message: msgAdzan,
              location: locationLabel,
            },
          })
        );
      }

      if (settings.prayer_enable_adzan_audio) {
        playAdzanAudio(settings.prayer_adzan_volume || 80);
      }

      markAsNotified(adzanId);
    }
  }
}

export function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}
