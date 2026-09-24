import React, { useState, useEffect } from 'react';
import { Sunrise, Sunset, Moon, Star, Clock } from 'lucide-react';
import { panchang as panchangApi } from '../api';
import usePanchangPlace from '../hooks/usePanchangPlace';

function Item({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0 px-3 py-1">
      <Icon size={11} style={{ color: accent }} className="shrink-0" />
      <span className="text-[9px] uppercase tracking-wider text-gold-500/70">{label}</span>
      <span className="text-[11px] font-medium text-gold-300 ml-0.5">{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-4 bg-gold-700/30 shrink-0" />;
}

export default function PanchangBar() {
  const { params, placeKey } = usePanchangPlace();
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    panchangApi.get(params)
      .then(p => { if (active) setData(p.data); })
      .catch(() => {});
    return () => { active = false; };
  }, [placeKey]);

  if (!data) return null;

  const tithiLabel = data.tithiPaksha ? `${data.tithi} · ${data.tithiPaksha}` : data.tithi;

  return (
    <div
      className="fixed left-0 right-0 z-[39] overflow-x-auto scrollbar-none"
      style={{
        top: '64px',
        background: 'linear-gradient(90deg, rgba(6,4,18,0.97) 0%, rgba(12,7,35,0.95) 50%, rgba(6,4,18,0.97) 100%)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(201,168,76,0.2)',
      }}
    >
      <div className="flex items-center justify-center min-w-max mx-auto">
        <Item icon={Sunrise} label="Sunrise"   value={data.sunrise}   accent="#F5C242" />
        <Divider />
        <Item icon={Sunset}  label="Sunset"    value={data.sunset}    accent="#E5533A" />
        <Divider />
        <Item icon={Moon}    label="Tithi"     value={tithiLabel}     accent="#C9A84C" />
        <Divider />
        <Item icon={Star}    label="Nakshatra" value={data.nakshatra} accent="#8E6BC9" />
        <Divider />
        <Item icon={Clock}   label="Rahu Kaal" value={data.rahuKaal}  accent="#E5533A" />
        <Divider />
        <Item icon={Clock}   label="Abhijit"   value={data.abhijit}   accent="#4CAF7D" />
      </div>
    </div>
  );
}
