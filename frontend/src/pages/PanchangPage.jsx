import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { panchang as panchangApi } from '../api';
import usePanchangPlace from '../hooks/usePanchangPlace';
import PanchangPlacePicker from '../components/PanchangPlacePicker';
import SwastikBorder from '../components/SwastikBorder';

const VARA_COLOR = { Sunday:'#FF9F43', Monday:'#74B9FF', Tuesday:'#FF6B6B', Wednesday:'#6BCB77', Thursday:'#FFD93D', Friday:'#FD79A8', Saturday:'#6C5CE7' };

function Card({ icon, label, value, sub, color, ends, next }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-cosmic-800/60 border border-gold-500/40 rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <p className="text-gray-200 text-xs uppercase tracking-wider mb-1">{label}</p>
          <p className="font-serif text-lg font-semibold" style={{ color: color || '#C9A84C' }}>{value}</p>
          {sub && <p className="text-gray-200 text-sm mt-1 leading-relaxed">{sub}</p>}
          {ends && (
            <p className="text-gray-300 text-sm mt-1.5">
              Ends {ends.time}{ends.day === 'Tomorrow' && <span className="text-yellow-400/80 ml-0.5">(Tomorrow)</span>}
              {next && <> ◆ Next: <span className="text-gold-400">{next}</span></>}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function PanchangPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { place, setPlace, params, placeKey } = usePanchangPlace();

  useEffect(() => {
    setLoading(true);
    panchangApi.get({ date: selectedDate, ...params })
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
    // params is rebuilt every render; placeKey is the stable form of it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, placeKey]);

  const vara = data?.vara || '';
  const varColor = VARA_COLOR[vara] || '#C9A84C';

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <SwastikBorder />
      <div className="relative z-10 pt-32 pb-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-5xl mx-auto">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <p className="text-gold-500/60 text-sm tracking-widest uppercase mb-3">🕉️ Hindu Almanac</p>
            <h1 className="font-serif text-3xl md:text-5xl text-gold-400 mb-3" style={{ textShadow: '0 0 30px rgba(201,168,76,0.4)' }}>Daily Panchang</h1>
            <p className="text-gray-200 text-sm">The sacred Vedic calendar — five limbs of time guiding auspicious living</p>
          </motion.div>

          {/* Which city these timings belong to */}
          <div className="mb-6">
            <PanchangPlacePicker place={place} onChange={setPlace} />
          </div>

          {/* Date picker */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="flex items-center bg-cosmic-800 border border-gold-500/45 rounded-full focus-within:border-gold-500/50 transition-colors px-1">
              <span className="pl-4 pr-2 text-gold-500 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </span>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                className="bg-transparent py-2.5 pr-5 text-gold-400 text-sm focus:outline-none cursor-pointer [color-scheme:dark]" />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gold-400 font-serif text-xl animate-pulse">✦ Calculating Panchang...</div>
          ) : !data ? (
            <div className="text-center py-20 text-red-400">Failed to load Panchang. Please try again.</div>
          ) : (
            <>
              {/* Date header */}
              <div className="bg-gradient-to-r from-cosmic-800/80 to-cosmic-900/80 border border-gold-500/45 rounded-3xl p-6 mb-6 text-center"
                style={{ boxShadow: `0 0 60px ${varColor}15` }}>
                <p className="font-serif text-3xl mb-1" style={{ color: varColor }}>{data.date}</p>
                <div className="flex items-center justify-center gap-3 flex-wrap mt-2">
                  <span className="text-sm bg-cosmic-900/80 border px-3 py-1 rounded-full" style={{ borderColor: varColor + '40', color: varColor }}>
                    {vara} ◆ Lord: {data.varaLord}
                  </span>
                  {data.tithiPaksha && (
                    <span className="text-sm bg-cosmic-900/80 border border-gold-600/30 text-gold-400 px-3 py-1 rounded-full">
                      {data.tithiPaksha}
                    </span>
                  )}
                </div>
                {data.moonDegree && (
                  <p className="text-gray-200 text-sm mt-3">
                    Sun: {data.sunDegree}° &nbsp;|&nbsp; Moon: {data.moonDegree}°
                  </p>
                )}
              </div>

              {/* Pancha Angas (Five Limbs) */}
              <h2 className="font-serif text-gold-400 text-xl mb-4">Pancha Anga ◆ Five Sacred Limbs</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <Card icon="🌙" label="Tithi (Lunar Day)" value={data.tithi} sub={data.tithiMeaning} color="#C9A84C"
                  ends={data.tithiEnds} next={data.nextTithi} />
                <Card icon="⭐" label="Nakshatra (Moon Star)"
                  value={`${data.nakshatra}${data.nakshatraPada ? ` ◆ Pada ${data.nakshatraPada}` : ''}`}
                  sub="Moon's position among the 27 lunar mansions" color="#A29BFE"
                  ends={data.nakshatraEnds} next={data.nextNakshatra} />
                <Card icon="☀️" label="Yoga (Luni-Solar)" value={data.yoga} sub="The combined Sun-Moon angle governs the day's energy" color="#6BCB77"
                  ends={data.yogaEnds} next={data.nextYoga} />
                <Card icon="⏰" label="Karana (Half-Tithi)" value={data.karana} sub="Half-day division for muhurta decisions" color="#FFD93D"
                  ends={data.karanaEnds} next={data.nextKarana} />
                <Card icon="📅" label="Vara (Weekday)" value={`${vara} ◆ ${data.varaLord}`} sub={`Ruled by ${data.varaLord}`} color={varColor} />
                {/* "Approximate timings for IST" named the timezone, which is
                    2,000 km wide and the one thing these times are not shared
                    across. Name the city they were computed for instead. */}
                <Card icon="🌅" label="Sunrise / Sunset" value={`${data.sunrise} / ${data.sunset}`} sub={`At ${data.place?.label || place.label}`} color="#FF9F43" />
              </div>

              {/* Auspicious & Inauspicious timings */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6">
                  <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">⚠️ Rahu Kaal</h3>
                  <p className="text-2xl font-serif text-red-400 font-bold mb-2">{data.rahuKaal}</p>
                  <p className="text-gray-200 text-sm">Inauspicious period governed by Rahu. Avoid starting new ventures, signing contracts, or important meetings during this time.</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/50 rounded-2xl p-6">
                  <h3 className="text-green-400 font-semibold mb-2 flex items-center gap-2">✨ Abhijit Muhurta</h3>
                  <p className="text-2xl font-serif text-green-400 font-bold mb-2">{data.abhijit}</p>
                  <p className="text-gray-200 text-sm">The most auspicious time of the day — the midday muhurta. Ideal for starting important work, signing agreements, and beginning journeys.</p>
                  {/* Abhijit straddles solar midday and Rahu Kaal is one of the
                      eight parts of the day, so on Fridays and Wednesdays the
                      two genuinely overlap. Saying so beats leaving the reader
                      to notice that the auspicious card and the inauspicious
                      one name the same minutes. */}
                  {data.abhijitNote && (
                    <p className="text-amber-300/90 text-xs mt-3 pt-3 border-t border-green-500/25 leading-relaxed">
                      {data.abhijitNote}
                    </p>
                  )}
                </div>
              </div>

              {/* Lucky elements & Good for */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <Card icon="🎨" label="Lucky Color" value={data.luckyColor} color={varColor} />
                <Card icon="🍀" label="Lucky Numbers" value={data.luckyNumber} color={varColor} />
                <Card icon="✅" label="Good for Today" value="" sub={data.goodFor} color="#6BCB77" />
              </div>

              {/* Five elements info box */}
              <div className="bg-cosmic-800/40 border border-gold-500/40 rounded-2xl p-6 text-center mb-6">
                <p className="text-gold-500/60 text-xs uppercase tracking-widest mb-2">The Five Limbs of Panchang</p>
                <div className="flex justify-center gap-6 flex-wrap text-sm">
                  {[['Tithi','Lunar Day — Moon & Sun angle'],['Vara','Weekday — planetary ruler'],['Nakshatra','Moon\'s star — birth star energy'],['Yoga','Combined solar-lunar force'],['Karana','Half-day — half of Tithi']].map(([n,d]) => (
                    <div key={n} className="text-center">
                      <div className="text-gold-400 font-serif font-semibold">{n}</div>
                      <div className="text-gray-300 text-sm max-w-[120px]">{d}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="text-center">
            <p className="text-gray-300 text-sm mb-4">Need an auspicious time for marriage, business launch, or travel? Consult our Muhurta specialists</p>
            <Link to="/astrologers" className="inline-block bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-semibold rounded-full px-10 py-3 hover:opacity-90 transition-opacity">
              Find Auspicious Timing →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
