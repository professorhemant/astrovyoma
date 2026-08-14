import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Crosshair, X } from 'lucide-react';
import { geocode } from '../api';
import { QUICK_PLACES } from '../hooks/usePanchangPlace';

/**
 * The city a panchang page is being read for.
 *
 * Collapsed it is one line naming the place, which is the part that matters:
 * a page that prints "Rahu Kaal 10:54 AM" without saying whose 10:54 is
 * inviting the reader to assume it is theirs. Opened it offers a search, a few
 * cities to tap, and the browser's own location.
 *
 * Props:
 *   place    – { label, lat, lon, tz, isDefault }
 *   onChange – called with the same shape, or null to go back to the default
 */
export default function PanchangPlacePicker({ place, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) { setResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await geocode.search(q);
        setResults(res.data || []);
      } catch {
        setError('Could not search for places just now. Pick a city below instead.');
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const choose = (p) => {
    onChange?.(p);
    setOpen(false);
    setQuery('');
    setResults([]);
    setError('');
  };

  // The browser gives coordinates and nothing else, so the timezone comes from
  // the device clock and the place is named plainly rather than guessed at.
  const useMyLocation = () => {
    if (!navigator.geolocation) { setError('This browser cannot share your location.'); return; }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        choose({
          label: 'Your current location',
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          tz: -new Date().getTimezoneOffset() / 60,
        });
      },
      () => {
        setLocating(false);
        setError('Location was not shared. Search for your city instead.');
      },
      { timeout: 10000, maximumAge: 600000 }
    );
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
        <MapPin className="w-4 h-4 text-gold-500" />
        <span className="text-gray-300">{place.label}</span>
        {place.isDefault && (
          <span className="text-gray-500 text-xs">— shown by default</span>
        )}
        <button type="button" onClick={() => setOpen(o => !o)}
          className="text-gold-400 hover:text-gold-300 underline underline-offset-2 text-xs transition-colors">
          {open ? 'Close' : 'Change'}
        </button>
      </div>

      {/* Said once, where it is needed, rather than in help nobody reads. */}
      {place.isDefault && (
        <p className="text-gray-500 text-xs text-center mt-1.5 max-w-md mx-auto leading-relaxed">
          These timings are measured from sunrise at Ujjain, the traditional
          reference for Indian astronomy. Set your own city to see yours — across
          India they differ by more than an hour.
        </p>
      )}

      {open && (
        <div className="mt-4 bg-cosmic-900/95 border border-gold-600/25 rounded-2xl p-4 max-w-lg mx-auto text-left shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gold-400 text-sm font-medium">Where are you?</p>
            <button type="button" onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-gray-300 transition-colors" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            className="input-cosmic w-full"
            placeholder="Type your city or town…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setError(''); }}
            autoComplete="off"
          />
          {searching && <p className="text-gold-500/70 text-xs mt-1.5">Searching…</p>}
          {error && <p className="text-amber-300/90 text-xs mt-1.5">{error}</p>}

          {results.length > 0 && (
            <div className="mt-2 border border-gold-600/15 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
              {results.map((p, i) => (
                <button key={i} type="button"
                  onClick={() => choose({ label: p.short_name || p.display_name.split(',').slice(0,3).join(','), lat: p.lat, lon: p.lng, tz: p.timezone })}
                  className="w-full text-left px-3 py-2 hover:bg-white/5 border-b border-gold-600/10 last:border-0 transition-colors">
                  <p className="text-sm text-gray-200">{p.short_name || p.display_name.split(',').slice(0,3).join(',')}</p>
                  <p className="text-xs text-gray-600 truncate">{p.display_name}</p>
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            {QUICK_PLACES.map(p => (
              <button key={p.label} type="button" onClick={() => choose(p)}
                className="text-xs px-3 py-1.5 rounded-full border border-gold-600/25 text-gray-300 hover:border-gold-500/60 hover:text-gold-300 transition-colors">
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-gold-600/15">
            <button type="button" onClick={useMyLocation} disabled={locating}
              className="flex items-center gap-1.5 text-xs text-gold-400 hover:text-gold-300 disabled:opacity-50 transition-colors">
              <Crosshair className="w-3.5 h-3.5" />
              {locating ? 'Finding you…' : 'Use my location'}
            </button>
            {!place.isDefault && (
              <button type="button" onClick={() => choose(null)}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                Back to Ujjain
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
