import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  fetchPrayerTimes, 
  getTodayPrayer, 
  reverseGeocodeGPS 
} from '../../lib/prayer/prayer-api';
import { 
  checkAndTriggerNotifications, 
  getCurrentTimeInJakarta 
} from '../../lib/prayer/prayer-notification';
import { PrayerSchedule } from '../../types';

export const GlobalPrayerWatcher: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [schedule, setSchedule] = useState<PrayerSchedule | null>(null);
  const isDetectingRef = useRef(false);

  // Auto-detect GPS location if enabled in settings and coords not yet set
  useEffect(() => {
    if (settings.prayer_auto_location && 'geolocation' in navigator && !isDetectingRef.current) {
      isDetectingRef.current = true;
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Only update if coords shifted or city differs
            const loc = await reverseGeocodeGPS(latitude, longitude);
            if (loc.provinsi !== settings.prayer_provinsi || loc.kabkota !== settings.prayer_kabkota) {
              await updateSettings({
                ...settings,
                prayer_provinsi: loc.provinsi,
                prayer_kabkota: loc.kabkota,
                prayer_lat: latitude,
                prayer_lon: longitude,
                prayer_location_name: loc.locationName,
              });
            }
          } catch (e) {
            console.warn('Auto GPS prayer detection error:', e);
          } finally {
            isDetectingRef.current = false;
          }
        },
        (err) => {
          console.warn('Geolocation permission not granted or timeout:', err.message);
          isDetectingRef.current = false;
        },
        { timeout: 8000, enableHighAccuracy: false }
      );
    }
  }, [settings.prayer_auto_location]);

  // Load prayer schedule whenever province or kabkota changes
  const loadSchedule = async () => {
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
      }
    } catch (err) {
      console.warn('Failed to load global prayer schedule:', err);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [settings.prayer_provinsi, settings.prayer_kabkota]);

  // Every second check prayer notifications & handle date rollover at 00:00 midnight
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = getCurrentTimeInJakarta();

      if (schedule && schedule.tanggal_lengkap) {
        const year = currentTime.getFullYear();
        const month = String(currentTime.getMonth() + 1).padStart(2, '0');
        const day = String(currentTime.getDate()).padStart(2, '0');
        const targetDate = `${year}-${month}-${day}`;

        if (targetDate !== schedule.tanggal_lengkap) {
          // Date rolled over (past 00:00:00 midnight)! Reload schedule!
          loadSchedule();
        } else {
          checkAndTriggerNotifications(schedule, settings);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [schedule, settings]);

  return null;
};
