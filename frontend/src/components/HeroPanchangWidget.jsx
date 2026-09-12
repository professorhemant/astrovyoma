import React, { useState, useEffect } from 'react';
import { Sunrise, Sunset, Moon, Star, Clock } from 'lucide-react';
import { panchang as panchangApi } from '../api';
import usePanchangPlace from '../hooks/usePanchangPlace';
import { useLanguage } from '../context/LanguageContext';

function PanchangRow({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="rounded-xl border border-white/25 px-2 py-1.5 flex items-start gap-1.5 min-w-0">
      <Icon size={13} className="shrink-0 mt-0.5" style={{ color: accent }} />
      <div className="min-w-0">
        <p className="text-[8px] uppercase tracking-wider text-gold-500 leading-tight">{label}</p>
        <p className="text-[11px] font-medium text-gold-300 leading-snug">{value}</p>
        {sub && <p className="text-[9px] text-gold-500 leading-snug truncate">{sub}</p>}
      </div>
    </div>
  );
}

// Panchang summary card for the hero section. Reads from the same
// usePanchangPlace hook as the full panchang pages, so city choice is shared.
// overlay=true skips the outer container (used when the parent positions it).
export default function HeroPanchangWidget({ overlay = false }) {
  const { params, placeKey, place } = usePanchangPlace();
  const [data, setData] = useState(null);
  const { isHindi } = useLanguage();
  const locale = isHindi ? 'hi-IN' : 'en-IN';

  useEffect(() => {
    let active = true;
    panchangApi.get(params)
      .then(p => { if (active) setData(p.data); })
      .catch(() => {});
    return () => { active = false; };
  }, [placeKey]);

  if (!data) return null;

  const dateStr = new Date().toLocaleDateString(locale, {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  // Gradient border via mask technique — avoids a real border-image which
  // can't have border-radius in CSS.
  const gradientBorderStyle = {
    background: 'linear-gradient(135deg, #C9A84C 0%, #E8C547 45%, #A07832 100%)',
    padding: '1.5px',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
  };

  const card = (
    <div className="relative rounded-2xl">
      <div className="absolute inset-0 rounded-2xl pointer-events-none" style={gradientBorderStyle} />
      <div className="relative px-3 py-2.5"
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.7)' }}>
        <div className="flex items-baseline justify-between mb-2 gap-2">
          <h3 className="font-serif text-sm text-gold-400 shrink-0">Today's Panchang</h3>
          <span className="text-[10px] text-gold-500 capitalize truncate">{dateStr}</span>
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          <PanchangRow icon={Sunrise}  label="Sunrise"         value={data.sunrise}    accent="#F5C242" />
          <PanchangRow icon={Sunset}   label="Sunset"          value={data.sunset}     accent="#E5533A" />
          <PanchangRow icon={Moon}     label="Tithi"           value={data.tithi}      sub={data.tithiPaksha} accent="#C9A84C" />
          <PanchangRow icon={Star}     label="Nakshatra"       value={data.nakshatra}  accent="#8E6BC9" />
          <PanchangRow icon={Clock}    label="Rahu Kaal"       value={data.rahuKaal}   accent="#E5533A" />
          <PanchangRow icon={Clock}    label="Abhijit Muhurta" value={data.abhijit}    accent="#4CAF7D" />
        </div>
        <p className="text-[8px] text-gold-500 mt-1.5 text-right">
          Place: {((data.place?.label) || place.label).split(',')[0]}
        </p>
      </div>
    </div>
  );

  return overlay
    ? card
    : <div className="max-w-5xl mx-auto px-4 md:px-8 mb-6">{card}</div>;
}
