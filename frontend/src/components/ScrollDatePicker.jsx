import React, { useRef, useEffect, useCallback, useState } from 'react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const ITEM_H = 44;
const PAD = 2; // rows above/below selection

function range(lo, hi) {
  const arr = [];
  for (let i = lo; i <= hi; i++) arr.push(i);
  return arr;
}

function buildYears(minYear, maxYear) {
  const arr = [];
  for (let y = maxYear; y >= minYear; y--) arr.push(y);
  return arr;
}

function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
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

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

// ── Drum column ────────────────────────────────────────────────────────────────
function Drum({ items, value, onChange, fmt, active = true }) {
  const ref = useRef(null);
  const debounce = useRef(null);
  const lastEmitted = useRef(value);

  const scrollTo = useCallback((idx, smooth = false) => {
    ref.current?.scrollTo({ top: idx * ITEM_H, behavior: smooth ? 'smooth' : 'instant' });
  }, []);

  useEffect(() => {
    // Track the value we were given, so a clamp from a neighbouring drum
    // isn't mistaken for a stale emit next time this one is scrolled.
    lastEmitted.current = value;
    const idx = items.indexOf(value);
    if (idx >= 0) scrollTo(idx, false);
  }, [value, items, scrollTo]);

  const handleScroll = useCallback(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      if (!ref.current) return;
      const idx = Math.max(0, Math.min(items.length - 1, Math.round(ref.current.scrollTop / ITEM_H)));
      if (items[idx] !== lastEmitted.current) {
        lastEmitted.current = items[idx];
        onChange(items[idx]);
      }
    }, 80);
  }, [items, onChange]);

  const totalH = ITEM_H * (PAD * 2 + 1);

  return (
    <div className="relative flex-1 overflow-hidden" style={{ height: totalH }}>
      {/* top fade — only clips outermost rows */}
      <div className="absolute inset-x-0 top-0 z-10 pointer-events-none"
        style={{ height: ITEM_H * PAD,
          background: 'linear-gradient(to bottom,rgba(10,8,30,0.88) 0%,rgba(10,8,30,0.2) 70%,transparent 100%)' }} />
      {/* bottom fade */}
      <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{ height: ITEM_H * PAD,
          background: 'linear-gradient(to top,rgba(10,8,30,0.88) 0%,rgba(10,8,30,0.2) 70%,transparent 100%)' }} />
      {/* selection band */}
      <div className="absolute inset-x-3 z-10 pointer-events-none"
        style={{ top: ITEM_H * PAD, height: ITEM_H,
          borderTop: '1px solid rgba(201,168,76,0.5)',
          borderBottom: '1px solid rgba(201,168,76,0.5)',
          background: 'rgba(201,168,76,0.06)' }} />

      <div
        ref={ref}
        onScroll={handleScroll}
        style={{
          height: '100%',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div style={{ height: ITEM_H * PAD }} />
        {items.map((item) => (
          <div
            key={item}
            style={{ height: ITEM_H, scrollSnapAlign: 'center' }}
            className={`flex items-center justify-center select-none cursor-pointer transition-all duration-150 ${
              item === value && active ? 'text-gold-400 font-bold text-[16px]' : 'text-white/60 font-normal text-[14px]'
            }`}
            onClick={() => {
              const idx = items.indexOf(item);
              scrollTo(idx, true);
              // Always emit: tapping the row already under the band is still
              // the user choosing it, which is what lifts the untouched state.
              lastEmitted.current = item;
              onChange(item);
            }}
          >
            {fmt ? fmt(item) : item}
          </div>
        ))}
        <div style={{ height: ITEM_H * PAD }} />
      </div>
    </div>
  );
}

// ── Public component ───────────────────────────────────────────────────────────
export default function ScrollDatePicker({ value, onChange, min, max, className = '' }) {
  const today = new Date();
  // Every field using this picker is a date of birth, so the future is never
  // valid. A caller's `max` narrows that further (e.g. the 18-year age gate).
  const todayYMD = { y: today.getFullYear(), m: today.getMonth() + 1, d: today.getDate() };
  const maxD = parseYMD(max) || todayYMD;
  const minD = parseYMD(min) || { y: 1920, m: 1, d: 1 };

  const parsed = parseYMD(value);
  const defaultDate = parsed || { y: 1990, m: 1, d: 1 };

  const [year,  setYear]  = useState(defaultDate.y);
  const [month, setMonth] = useState(defaultDate.m);
  const [day,   setDay]   = useState(defaultDate.d);
  // A date nobody picked is not an answer. Until the user actually chooses,
  // emit nothing and highlight nothing, so the caller's own "date of birth is
  // required" check can still fire.
  const [touched, setTouched] = useState(!!parsed);

  const years = buildYears(minD.y, maxD.y);

  // Bound month and day too, not just the year — otherwise `max` of 2026-08-20
  // still lets Dec 31 2026 through.
  const monthLo = year === minD.y ? minD.m : 1;
  const monthHi = year === maxD.y ? maxD.m : 12;
  const months  = range(monthLo, monthHi);

  const dayLo = (year === minD.y && month === minD.m) ? minD.d : 1;
  const dayHi = (year === maxD.y && month === maxD.m)
    ? Math.min(maxD.d, daysInMonth(month, year))
    : daysInMonth(month, year);
  const days = range(dayLo, dayHi);

  const prevVal = useRef(value);
  useEffect(() => {
    if (value && value !== prevVal.current) {
      const p = parseYMD(value);
      if (p) { setYear(p.y); setMonth(p.m); setDay(p.d); setTouched(true); }
    }
    prevVal.current = value;
  }, [value]);

  // Pull the selection back in range when a neighbouring drum moves under it.
  useEffect(() => {
    const m = clamp(month, monthLo, monthHi);
    if (m !== month) { setMonth(m); return; }
    const d = clamp(day, dayLo, dayHi);
    if (d !== day) setDay(d);
  }, [year, month, day, monthLo, monthHi, dayLo, dayHi]);

  const emitting = useRef(false);
  useEffect(() => {
    if (!touched) return;
    if (emitting.current) return;
    emitting.current = true;
    const safeDay = clamp(day, dayLo, dayHi);
    const safeMonth = clamp(month, monthLo, monthHi);
    onChange(toYMD(year, safeMonth, safeDay));
    setTimeout(() => { emitting.current = false; }, 0);
  }, [year, month, day, touched]);

  const chooseMonth = useCallback(v => { setTouched(true); setMonth(v); }, []);
  const chooseDay   = useCallback(v => { setTouched(true); setDay(v); },   []);
  const chooseYear  = useCallback(v => { setTouched(true); setYear(v); },  []);

  const totalH = ITEM_H * (PAD * 2 + 1);
  const divider = <div className="w-px self-stretch bg-gold-600/20" />;

  return (
    <div className={`bg-cosmic-900 border border-gold-600/20 rounded-xl overflow-hidden ${className}`}>
      <div className="flex" style={{ height: totalH }}>
        <Drum items={months} value={clamp(month, monthLo, monthHi)}
          onChange={chooseMonth} fmt={m => MONTHS[m-1]} active={touched} />
        {divider}
        <Drum items={days} value={clamp(day, dayLo, dayHi)}
          onChange={chooseDay} active={touched} />
        {divider}
        <Drum items={years} value={year} onChange={chooseYear} active={touched} />
      </div>
    </div>
  );
}
