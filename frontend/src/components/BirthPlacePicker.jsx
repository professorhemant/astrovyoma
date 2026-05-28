import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Clock } from 'lucide-react';
import { geocode } from '../api';

/**
 * Reusable birth place picker with auto-search, lat/lng, and timezone auto-detection.
 *
 * Props:
 *   value        – current place name string
 *   onChange     – called with { place, lat, lng, timezone, timezone_id, timezone_abbr }
 *   label        – field label (default: "Birth Place")
 *   required     – show * on label
 *   placeholder  – input placeholder
 */
export default function BirthPlacePicker({ value = '', onChange, label = 'Birth Place', required = false, placeholder = 'Type city or town name…' }) {
  const [query, setQuery]         = useState(value);
  const [results, setResults]     = useState([]);
  const [searching, setSearching] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [meta, setMeta]           = useState({ lat: '', lng: '', timezone: '', timezone_id: '', timezone_abbr: '' });
  const debounceRef = useRef(null);

  // Sync if parent resets value to ''
  useEffect(() => {
    if (!value) { setQuery(''); setConfirmed(false); setMeta({ lat:'', lng:'', timezone:'', timezone_id:'', timezone_abbr:'' }); setResults([]); }
  }, [value]);

  useEffect(() => {
    if (confirmed) return;
    const q = query.trim();
    if (q.length < 3) { setResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await geocode.search(q);
        setResults(res.data || []);
      } catch { /* silent */ }
      finally { setSearching(false); }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, confirmed]);

  const select = (p) => {
    const placeName = p.short_name || p.display_name;
    setQuery(placeName);
    setConfirmed(true);
    setResults([]);
    const m = { lat: p.lat, lng: p.lng, timezone: p.timezone, timezone_id: p.timezone_id || '', timezone_abbr: p.timezone_abbr || '' };
    setMeta(m);
    onChange?.({ place: placeName, ...m });
  };

  const clear = () => {
    setQuery('');
    setConfirmed(false);
    setResults([]);
    setMeta({ lat:'', lng:'', timezone:'', timezone_id:'', timezone_abbr:'' });
    onChange?.({ place: '', lat: '', lng: '', timezone: '', timezone_id: '', timezone_abbr: '' });
  };

  const handleChange = (e) => {
    setConfirmed(false);
    setQuery(e.target.value);
    onChange?.({ place: e.target.value, lat: '', lng: '', timezone: '', timezone_id: '', timezone_abbr: '' });
  };

  return (
    <div>
      {label && (
        <label className="text-xs text-cosmic-400 mb-1 block">
          {label}{required && ' *'}
          {confirmed && meta.timezone_id && (
            <span className="ml-2 text-gold-500/70">auto-detected from place</span>
          )}
        </label>
      )}

      <div className="relative">
        <input
          className="input-cosmic w-full pr-8"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          autoComplete="off"
        />
        {searching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-400 text-xs animate-pulse">…</span>
        )}
        {confirmed && (
          <button type="button" onClick={clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-cosmic-500 hover:text-red-400 text-xs transition-colors">✕</button>
        )}
      </div>

      {/* Dropdown */}
      {results.length > 0 && (
        <div className="mt-1 bg-cosmic-900 border border-gold-600/20 rounded-xl overflow-hidden shadow-xl z-20 relative">
          {results.slice(0, 6).map((p, i) => (
            <button key={i} type="button" onClick={() => select(p)}
              className="w-full text-left px-4 py-2.5 hover:bg-white/5 border-b border-gold-600/10 last:border-0 transition-colors">
              <p className="text-sm text-cosmic-200">{p.short_name || p.display_name.split(',').slice(0, 3).join(',')}</p>
              <p className="text-xs text-cosmic-600 truncate">{p.display_name}</p>
            </button>
          ))}
        </div>
      )}

      {/* Confirmation badges */}
      {confirmed && meta.lat && (
        <div className="mt-2 flex flex-wrap gap-3">
          <span className="flex items-center gap-1.5 text-xs bg-cosmic-900/60 border border-gold-600/15 rounded-full px-3 py-1 text-cosmic-300">
            <MapPin className="w-3 h-3 text-gold-500" />
            {parseFloat(meta.lat).toFixed(4)}°N, {parseFloat(meta.lng).toFixed(4)}°E
          </span>
          <span className="flex items-center gap-1.5 text-xs bg-cosmic-900/60 border border-gold-600/15 rounded-full px-3 py-1 text-cosmic-300">
            <Clock className="w-3 h-3 text-gold-500" />
            {meta.timezone_abbr && `${meta.timezone_abbr} · `}UTC {parseFloat(meta.timezone) >= 0 ? '+' : ''}{meta.timezone}
          </span>
        </div>
      )}
    </div>
  );
}
