import { useState, useEffect, useCallback } from 'react';

// Where the panchang is being read for.
//
// Every timing on these pages — Rahu Kaal, Choghadiya, the muhurtas, the five
// limbs themselves — is measured from the local sunrise, so all of them move
// with the city. The choice is kept in localStorage and shared by every
// panchang page, because having to say where you are once per page would be
// worse than the single hardcoded city we started with.
//
// Ujjain is the fallback, and is deliberately the same fallback the server
// uses: the traditional zero meridian of Indian astronomy. The pages say so
// rather than letting a reader assume the times are theirs.

const STORAGE_KEY = 'astrovyoma.panchangPlace';

export const DEFAULT_PLACE = {
  label: 'Ujjain, Madhya Pradesh, India',
  lat: 23.1765,
  lon: 75.7885,
  tz: 5.5,
  isDefault: true,
};

// A few to pick without typing. Chosen to span the country east to west,
// which is exactly the axis the timings move along.
export const QUICK_PLACES = [
  { label: 'New Delhi',  lat: 28.6139, lon: 77.2090, tz: 5.5 },
  { label: 'Mumbai',     lat: 19.0760, lon: 72.8777, tz: 5.5 },
  { label: 'Kolkata',    lat: 22.5726, lon: 88.3639, tz: 5.5 },
  { label: 'Chennai',    lat: 13.0827, lon: 80.2707, tz: 5.5 },
  { label: 'Bengaluru',  lat: 12.9716, lon: 77.5946, tz: 5.5 },
  { label: 'Jaipur',     lat: 26.9124, lon: 75.7873, tz: 5.5 },
  { label: 'Varanasi',   lat: 25.3176, lon: 82.9739, tz: 5.5 },
  { label: 'Ahmedabad',  lat: 23.0225, lon: 72.5714, tz: 5.5 },
];

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PLACE;
    const p = JSON.parse(raw);
    // A stored value that has lost its coordinates would silently send the
    // reader back to Ujjain without saying so, so check before trusting it.
    if (!Number.isFinite(p?.lat) || !Number.isFinite(p?.lon)) return DEFAULT_PLACE;
    return { ...p, isDefault: false };
  } catch {
    return DEFAULT_PLACE;
  }
}

export default function usePanchangPlace() {
  const [place, setPlaceState] = useState(read);

  // Two panchang pages open in two tabs should not disagree about where you
  // are. `storage` fires in the *other* tabs when one of them writes.
  useEffect(() => {
    const onStorage = (e) => { if (e.key === STORAGE_KEY) setPlaceState(read()); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setPlace = useCallback((next) => {
    if (!next) {
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* private mode */ }
      setPlaceState(DEFAULT_PLACE);
      return;
    }
    const clean = {
      label: String(next.label || '').slice(0, 120),
      lat: Number(next.lat),
      lon: Number(next.lon),
      tz: Number.isFinite(Number(next.tz)) ? Number(next.tz) : 5.5,
      isDefault: false,
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(clean)); } catch { /* private mode */ }
    setPlaceState(clean);
  }, []);

  // What to spread into a panchang API call. The default place sends nothing,
  // so the server's own default answers and the two cannot drift apart.
  const params = place.isDefault
    ? {}
    : { lat: place.lat, lon: place.lon, tz: place.tz, place: place.label };

  // A stable string for effect dependencies — `params` is a fresh object each
  // render and would re-fetch forever if depended on directly.
  const placeKey = place.isDefault ? 'default' : `${place.lat},${place.lon},${place.tz}`;

  return { place, setPlace, params, placeKey };
}
