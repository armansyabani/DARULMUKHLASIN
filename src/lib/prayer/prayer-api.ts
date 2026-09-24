import { PrayerSchedule } from '../../types';

const CACHE_KEY_PREFIX = 'koperasi_prayer_cache_';

export interface PrayerAPIResponse {
  code: number;
  message: string;
  data: {
    provinsi: string;
    kabkota: string;
    bulan: number;
    tahun: number;
    jadwal: PrayerSchedule[];
  };
}

export const INDONESIAN_PROVINCES: string[] = [
  'Aceh',
  'Bali',
  'Banten',
  'Bengkulu',
  'D.I. Yogyakarta',
  'DKI Jakarta',
  'Gorontalo',
  'Jambi',
  'Jawa Barat',
  'Jawa Tengah',
  'Jawa Timur',
  'Kalimantan Barat',
  'Kalimantan Selatan',
  'Kalimantan Tengah',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Kepulauan Bangka Belitung',
  'Kepulauan Riau',
  'Lampung',
  'Maluku',
  'Maluku Utara',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Papua',
  'Papua Barat',
  'Papua Barat Daya',
  'Papua Pegunungan',
  'Papua Selatan',
  'Papua Tengah',
  'Riau',
  'Sulawesi Barat',
  'Sulawesi Selatan',
  'Sulawesi Tengah',
  'Sulawesi Tenggara',
  'Sulawesi Utara',
  'Sumatera Barat',
  'Sumatera Selatan',
  'Sumatera Utara',
];

// Popular cities / regencies coordinates for fast, reliable nearest-location matching
export interface CityCoordinate {
  provinsi: string;
  kabkota: string;
  lat: number;
  lon: number;
}

export const CITY_COORDINATES: CityCoordinate[] = [
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Banjarnegara', lat: -7.3987, lon: 109.6974 },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Banyumas', lat: -7.4550, lon: 109.2818 },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Purbalingga', lat: -7.3888, lon: 109.3639 },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Cilacap', lat: -7.7180, lon: 109.0159 },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Kebumen', lat: -7.6710, lon: 109.6548 },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Wonosobo', lat: -7.3636, lon: 109.9000 },
  { provinsi: 'Jawa Tengah', kabkota: 'Kota Semarang', lat: -6.9666, lon: 110.4166 },
  { provinsi: 'Jawa Tengah', kabkota: 'Kota Surakarta', lat: -7.5755, lon: 110.8243 },
  { provinsi: 'Jawa Tengah', kabkota: 'Kota Magelang', lat: -7.4705, lon: 110.2178 },
  { provinsi: 'Jawa Tengah', kabkota: 'Kota Tegal', lat: -6.8694, lon: 109.1402 },
  { provinsi: 'Jawa Tengah', kabkota: 'Kota Pekalongan', lat: -6.8886, lon: 109.6753 },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Brebes', lat: -6.8706, lon: 109.0435 },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Pemalang', lat: -6.8913, lon: 109.3807 },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Batang', lat: -6.9080, lon: 109.7347 },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Kendal', lat: -6.9248, lon: 110.2038 },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Demak', lat: -6.8944, lon: 110.6386 },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Kudus', lat: -6.8048, lon: 110.8405 },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Jepara', lat: -6.5888, lon: 110.6684 },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Pati', lat: -6.7562, lon: 111.0379 },
  { provinsi: 'DKI Jakarta', kabkota: 'Kota Jakarta', lat: -6.2088, lon: 106.8456 },
  { provinsi: 'D.I. Yogyakarta', kabkota: 'Kota Yogyakarta', lat: -7.7956, lon: 110.3695 },
  { provinsi: 'D.I. Yogyakarta', kabkota: 'Kab. Sleman', lat: -7.7161, lon: 110.3556 },
  { provinsi: 'D.I. Yogyakarta', kabkota: 'Kab. Bantul', lat: -7.8927, lon: 110.3289 },
  { provinsi: 'Jawa Barat', kabkota: 'Kota Bandung', lat: -6.9175, lon: 107.6191 },
  { provinsi: 'Jawa Barat', kabkota: 'Kota Bogor', lat: -6.5971, lon: 106.8060 },
  { provinsi: 'Jawa Barat', kabkota: 'Kota Bekasi', lat: -6.2383, lon: 106.9756 },
  { provinsi: 'Jawa Barat', kabkota: 'Kota Depok', lat: -6.4025, lon: 106.7942 },
  { provinsi: 'Jawa Barat', kabkota: 'Kota Cirebon', lat: -6.7320, lon: 108.5523 },
  { provinsi: 'Jawa Barat', kabkota: 'Kota Sukabumi', lat: -6.9277, lon: 106.9300 },
  { provinsi: 'Jawa Barat', kabkota: 'Kota Tasikmalaya', lat: -7.3274, lon: 108.2207 },
  { provinsi: 'Banten', kabkota: 'Kota Tangerang', lat: -6.1783, lon: 106.6319 },
  { provinsi: 'Banten', kabkota: 'Kota Tangerang Selatan', lat: -6.2888, lon: 106.7179 },
  { provinsi: 'Banten', kabkota: 'Kota Serang', lat: -6.1104, lon: 106.1640 },
  { provinsi: 'Jawa Timur', kabkota: 'Kota Surabaya', lat: -7.2575, lon: 112.7521 },
  { provinsi: 'Jawa Timur', kabkota: 'Kota Malang', lat: -7.9666, lon: 112.6326 },
  { provinsi: 'Jawa Timur', kabkota: 'Kota Kediri', lat: -7.8480, lon: 112.0178 },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Sidoarjo', lat: -7.4478, lon: 112.7183 },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Jember', lat: -8.1845, lon: 113.6681 },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Banyuwangi', lat: -8.2192, lon: 114.3692 },
  { provinsi: 'Bali', kabkota: 'Kota Denpasar', lat: -8.6705, lon: 115.2126 },
  { provinsi: 'Nusa Tenggara Barat', kabkota: 'Kota Mataram', lat: -8.5833, lon: 116.1167 },
  { provinsi: 'Sumatera Utara', kabkota: 'Kota Medan', lat: 3.5952, lon: 98.6722 },
  { provinsi: 'Sumatera Barat', kabkota: 'Kota Padang', lat: -0.9471, lon: 100.4172 },
  { provinsi: 'Sumatera Selatan', kabkota: 'Kota Palembang', lat: -2.9761, lon: 104.7754 },
  { provinsi: 'Riau', kabkota: 'Kota Pekanbaru', lat: 0.5071, lon: 101.4478 },
  { provinsi: 'Lampung', kabkota: 'Kota Bandar Lampung', lat: -5.4292, lon: 105.2611 },
  { provinsi: 'Kalimantan Timur', kabkota: 'Kota Samarinda', lat: -0.5016, lon: 117.1265 },
  { provinsi: 'Kalimantan Timur', kabkota: 'Kota Balikpapan', lat: -1.2379, lon: 116.8289 },
  { provinsi: 'Kalimantan Barat', kabkota: 'Kota Pontianak', lat: -0.0263, lon: 109.3425 },
  { provinsi: 'Kalimantan Selatan', kabkota: 'Kota Banjarmasin', lat: -3.3167, lon: 114.5901 },
  { provinsi: 'Sulawesi Selatan', kabkota: 'Kota Makassar', lat: -5.1477, lon: 119.4327 },
  { provinsi: 'Sulawesi Utara', kabkota: 'Kota Manado', lat: 1.4748, lon: 124.8428 },
];

/**
 * Calculate distance between two coordinates in kilometers using Haversine formula
 */
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find nearest Indonesian city from GPS latitude and longitude
 */
export function findNearestCityFromCoords(lat: number, lon: number): CityCoordinate {
  let minDistance = Infinity;
  let nearest = CITY_COORDINATES[0];

  for (const city of CITY_COORDINATES) {
    const dist = getDistanceKm(lat, lon, city.lat, city.lon);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = city;
    }
  }

  return nearest;
}

/**
 * Attempt reverse geocoding from free API or fallback to closest coordinate
 */
export async function reverseGeocodeGPS(
  lat: number,
  lon: number
): Promise<{ provinsi: string; kabkota: string; locationName: string }> {
  // First check nearest from known coordinate table
  const nearest = findNearestCityFromCoords(lat, lon);

  try {
    // Attempt BigDataCloud or OpenStreetMap reverse geocode
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision;
      const state = data.principalSubdivision;

      // Match province if found
      const matchedProv = INDONESIAN_PROVINCES.find(
        (p) => state && state.toLowerCase().includes(p.toLowerCase())
      );

      if (matchedProv) {
        return {
          provinsi: matchedProv,
          kabkota: nearest.kabkota,
          locationName: `${city || nearest.kabkota}, ${matchedProv}`,
        };
      }
    }
  } catch {
    // Fallback to nearest pre-mapped city
  }

  return {
    provinsi: nearest.provinsi,
    kabkota: nearest.kabkota,
    locationName: `${nearest.kabkota}, ${nearest.provinsi}`,
  };
}

/**
 * Fetch list of kabkota for a given province from equran.id
 */
export async function fetchCitiesForProvince(provinsi: string): Promise<string[]> {
  const cacheKey = `koperasi_cities_${provinsi}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.error(e);
  }

  try {
    const res = await fetch('https://equran.id/api/v2/shalat/kabkota', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provinsi }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.code === 200 && Array.isArray(json.data) && json.data.length > 0) {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(json.data));
        } catch {
          // ignore storage error
        }
        return json.data;
      }
    }
  } catch (e) {
    console.warn('Could not fetch cities from API, falling back to predefined list:', e);
  }

  // Fallback: extract from CITY_COORDINATES
  const matching = CITY_COORDINATES.filter(
    (c) => c.provinsi.toLowerCase() === provinsi.toLowerCase()
  ).map((c) => c.kabkota);

  return matching.length > 0 ? Array.from(new Set(matching)) : [provinsi];
}

/**
 * Fetch monthly prayer times
 */
export async function fetchPrayerTimes(
  provinsi: string,
  kabkota: string,
  bulan: number,
  tahun: number
): Promise<PrayerSchedule[]> {
  const cacheKey = `${CACHE_KEY_PREFIX}${provinsi}_${kabkota}_${bulan}_${tahun}`;

  // Check cache first
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return parsed as PrayerSchedule[];
    }
  } catch (e) {
    console.error('Error reading prayer cache:', e);
  }

  // Fetch from API
  const response = await fetch('https://equran.id/api/v2/shalat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provinsi,
      kabkota,
      bulan,
      tahun,
    }),
  });

  if (!response.ok) {
    throw new Error(`API returned ${response.status} ${response.statusText}`);
  }

  const json: PrayerAPIResponse = await response.json();

  if (json.code !== 200 || !json.data || !json.data.jadwal) {
    throw new Error(json.message || 'Gagal mengambil jadwal shalat');
  }

  // Save to cache
  try {
    localStorage.setItem(cacheKey, JSON.stringify(json.data.jadwal));
  } catch (e) {
    console.error('Error saving prayer cache:', e);
  }

  return json.data.jadwal;
}

export function getTodayPrayer(jadwalBulanan: PrayerSchedule[], date: Date): PrayerSchedule | null {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const targetDate = `${year}-${month}-${day}`;

  return jadwalBulanan.find((j) => j.tanggal_lengkap === targetDate) || null;
}
