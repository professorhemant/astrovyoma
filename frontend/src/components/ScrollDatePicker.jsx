import React, { useRef, useEffect, useCallback, useState } from 'react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const ITEM_H = 44;

function buildYears(minYear, maxYear) {
  const arr = [];
  for (let y = maxYear; y >= minYear; y--) arr.push(y);
  return arr;
}

function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

function buildDays(month, year) {
  const n = daysInMonth(month, year);
  return Array.from({ length: n }, (_, i) => i + 1);
}

function parseYMD(str) {
  if (!str) return null;
  const parts = str.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return { y: parts[0], m: parts[1], d: parts[2] };
}

function toYMD(y, m, d) {
  return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

// ── Drum column ────────────────────────────────────────────────────────────────
function Drum({ items, value, onChange, fmt }) {
  const ref = useRef(null);
  const debounce = useRef(null);
  const snapping = useRef(false);
  const lastEmitted = useRef(value);

  const scrollTo = useCallback((idx, smooth = false) => {
    ref.current?.scrollTo({ top: idx * ITEM_H, behavior: smooth ? 'smooth' : 'instant' });
  }, []);

  // Jump to value when it changes (externally or on mount)
  useEffect(() => {
    const idx = items.indexOf(value);
    if (idx >= 0) scrollTo(idx, false);
  }, [value, items, scrollTo]);

  const handleScroll = useCallback(() => {
    if (snapping.current) return;
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      if (!ref.current) return;
      const idx = Math.max(0, Math.min(items.length - 1, Math.round(ref.current.scrollTop / ITEM_H)));
      snapping.current = true;
      scrollTo(idx, true);
      setTimeout(() => { snapping.current = false; }, 300);
      if (items[idx] !== lastEmitted.current) {
        lastEmitted.current = items[idx];
        onChange(items[idx]);
      }
    }, 80);
  }, [items, onChange, scrollTo]);

  return (
    <div className="relative flex-1 overflow-hidden" style={{ height: ITEM_H * 3 }}>
      {/* top fade */}
      <div className="absolute inset-x-0 top-0 z-10 pointer-events-none"
        style={{ height: ITEM_H, background: 'linear-gradient(to bottom,rgba(10,8,30,0.92) 0%,rgba(10,8,30,0.3) 60%,transparent 100%)' }} />
      {/* bottom fade */}
      <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{ height: ITEM_H, background: 'linear-gradient(to top,rgba(10,8,30,0.92) 0%,rgba(10,8,30,0.3) 60%,transparent 100%)' }} />
      {/* selection band */}
      <div className="absolute inset-x-3 z-10 pointer-events-none"
        style={{ top: ITEM_H, height: ITEM_H,
          borderTop: '1px solid rgba(201,168,76,0.45)',
          borderBottom: '1px solid rgba(201,168,76,0.45)',
          background: 'rgba(201,168,76,0.04)' }} />

      <div ref={ref} onScroll={handleScroll}
        className="h-full overflow-y-scroll"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div style={{ height: ITEM_H }} />
        {items.map((item) => (
          <div key={item}
            style={{ height: ITEM_H }}
            className={`flex items-center justify-center select-none transition-all duration-150 cursor-pointer ${
              item === value ? 'text-gold-400 font-bold text-[15px]' : 'text-gray-500 text-[13px]'
            }`}
            onClick={() => {
              const idx = items.indexOf(item);
              scrollTo(idx, true);
              if (item !== lastEmitted.current) { lastEmitted.current = item; onChange(item); }
            }}>
            {fmt ? fmt(item) : item}
          </div>
        ))}
        <div style={{ height: ITEM_H }} />
      </div>
    </div>
  );
}

// ── Public component ───────────────────────────────────────────────────────────
export default function ScrollDatePicker({ value, onChange, min, max, className = '' }) {
  const today = new Date();
  const maxYear = max ? parseInt(max.split('-')[0]) : today.getFullYear();
  const minYear = min ? parseInt(min.split('-')[0]) : 1920;

  const defaultDate = parseYMD(value) || { y: 1990, m: 1, d: 1 };

  const [year,  setYear]  = useState(defaultDate.y);
  const [month, setMonth] = useState(defaultDate.m);
  const [day,   setDay]   = useState(defaultDate.d);

  const years = buildYears(minYear, maxYear);
  const days  = buildDays(month, year);

  // Sync from controlled value prop
  const prevVal = useRef(value);
  useEffect(() => {
    if (value && value !== prevVal.current) {
      const p = parseYMD(value);
      if (p) { setYear(p.y); setMonth(p.m); setDay(p.d); }
    }
    prevVal.current = value;
  }, [value]);

  // Clamp day when month/year changes
  useEffect(() => {
    const max = daysInMonth(month, year);
    if (day > max) setDay(max);
  }, [month, year]);

  // Emit whenever internal state changes
  const emitting = useRef(false);
  useEffect(() => {
    if (emitting.current) return;
    emitting.current = true;
    const safeDay = Math.min(day, daysInMonth(month, year));
    const str = toYMD(year, month, safeDay);
    onChange(str);
    setTimeout(() => { emitting.current = false; }, 0);
  }, [year, month, day]);

  const divider = <div className="w-px self-stretch bg-gold-600/20" />;

  return (
    <div className={`bg-cosmic-900 border border-gold-600/20 rounded-xl overflow-hidden ${className}`}>
      <div className="flex" style={{ height: ITEM_H * 3 }}>
        <Drum items={Array.from({length:12},(_,i)=>i+1)} value={month}
          onChange={setMonth} fmt={m => MONTHS[m-1]} />
        {divider}
        <Drum items={days} value={Math.min(day, days.length)} onChange={setDay} />
        {divider}
        <Drum items={years} value={year} onChange={setYear} />
      </div>
    </div>
  );
}
