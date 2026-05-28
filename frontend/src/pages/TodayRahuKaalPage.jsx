import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { panchang as panchangApi } from '../api';

const VARA_COLOR = { Sunday:'#FF9F43', Monday:'#74B9FF', Tuesday:'#FF6B6B', Wednesday:'#6BCB77', Thursday:'#FFD93D', Friday:'#FD79A8', Saturday:'#6C5CE7' };

const INAUSPICIOUS_THINGS = [
  'Starting new business or job',
  'Signing important contracts',
  'Beginning travel or journeys',
  'Marriage or engagement ceremonies',
  'Purchasing property or vehicles',
  'Medical surgeries or treatments',
  'Financial investments',
  'Filing important documents',
];

const YAMAGANDA_INFO = 'Named after Yama, god of death. Equally inauspicious for starting new endeavors � avoid during Yamaganda for best results.';
const GULIKA_INFO = 'Gulika Kaal is the period of Saturn\'s son Gulika (Manda). Consider it moderately inauspicious; avoid important beginnings.';

export default function TodayRahuKaalPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    panchangApi.rahuKaal()
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const varaColor = VARA_COLOR[data?.vara] || '#C9A84C';

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 pt-32 pb-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-10">
            <p className="text-gold-500/60 text-sm tracking-widest uppercase mb-3">⚠️ Inauspicious Period</p>
            <h1 className="font-serif text-3xl md:text-5xl text-red-400 mb-3" style={{ textShadow:'0 0 30px rgba(239,68,68,0.4)' }}>Today's Rahu Kaal</h1>
            <p className="text-gray-200 text-sm">The inauspicious period governed by shadow planet Rahu � avoid new beginnings</p>
          </motion.div>

          {loading ? (
            <div className="text-center py-20 text-gold-400 font-serif text-xl animate-pulse">✦ Calculating Rahu Kaal...</div>
          ) : !data ? (
            <div className="text-center py-20 text-red-400">Failed to load. Please try again.</div>
          ) : (
            <>
              {/* Main Rahu Kaal Card */}
              <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                className="bg-gradient-to-br from-red-900/30 to-cosmic-900/80 border border-red-500/55 rounded-3xl p-8 mb-6 text-center"
                style={{ boxShadow:'0 0 60px rgba(239,68,68,0.15)' }}>
                <div className="text-5xl mb-3">🐉</div>
                <p className="text-gray-200 text-sm uppercase tracking-widest mb-2">{data.date}</p>
                <h2 className="font-serif text-2xl text-red-300 mb-2">Rahu Kaal</h2>
                <p className="font-serif text-4xl text-red-400 font-bold mb-2" style={{ textShadow:'0 0 20px rgba(239,68,68,0.5)' }}>{data.rahuKaal}</p>
                {data.isRahuActive && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-red-500/20 border border-red-500/40 text-red-300 px-5 py-2 rounded-full text-sm animate-pulse">
                    ⚠️ Rahu Kaal is Active Right Now
                  </div>
                )}
                <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-200">
                  <span>🌅 Sunrise {data.sunrise}</span>
                  <span>🌇 Sunset {data.sunset}</span>
                </div>
              </motion.div>

              {/* Three Periods */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
                  className="bg-red-500/10 border border-red-500/50 rounded-2xl p-5 text-center">
                  <div className="text-3xl mb-2">🐉</div>
                  <p className="text-gray-200 text-xs uppercase tracking-wider mb-1">Rahu Kaal</p>
                  <p className="font-serif text-lg text-red-400 font-semibold">{data.rahuKaal}</p>
                  <p className="text-gray-200 text-sm mt-2">Most inauspicious � avoid all new starts</p>
                </motion.div>
                <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
                  className="bg-orange-500/10 border border-orange-500/25 rounded-2xl p-5 text-center">
                  <div className="text-3xl mb-2">⚠️</div>
                  <p className="text-gray-200 text-xs uppercase tracking-wider mb-1">Yamaganda Kaal</p>
                  <p className="font-serif text-lg text-orange-400 font-semibold">{data.yamaganda}</p>
                  <p className="text-gray-200 text-sm mt-2">Yama's period � avoid new ventures</p>
                </motion.div>
                <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
                  className="bg-yellow-500/10 border border-yellow-500/25 rounded-2xl p-5 text-center">
                  <div className="text-3xl mb-2">🪐</div>
                  <p className="text-gray-200 text-xs uppercase tracking-wider mb-1">Gulika Kaal</p>
                  <p className="font-serif text-lg text-yellow-400 font-semibold">{data.gulika}</p>
                  <p className="text-gray-200 text-sm mt-2">Saturn's shadow � moderately avoid</p>
                </motion.div>
              </div>

              {/* What to avoid */}
              <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
                className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6 mb-6">
                <h3 className="text-red-400 font-semibold text-lg mb-4 flex items-center gap-2">🚫 Avoid During Rahu Kaal</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {INAUSPICIOUS_THINGS.map(item => (
                    <div key={item} className="flex items-center gap-2 text-white text-sm">
                      <span className="text-red-400 flex-shrink-0">✗</span>{item}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* About Rahu Kaal */}
              <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
                className="bg-cosmic-800/40 border border-gold-500/40 rounded-2xl p-6 mb-6">
                <h3 className="text-gold-400 font-serif font-semibold text-lg mb-3">About Rahu Kaal</h3>
                <p className="text-gray-200 text-sm leading-relaxed mb-3">
                  Rahu Kaal (???? ???) is a time period of approximately 1.5 hours that occurs every day, governed by
                  the shadow planet Rahu. The day (sunrise to sunset) is divided into 8 equal parts, and Rahu
                  rules one part determined by the day of the week.
                </p>
                <p className="text-gray-200 text-sm leading-relaxed mb-3">
                  Today is <span style={{ color: varaColor }} className="font-semibold">{data.vara}</span>, ruled by {data.varaLord}.
                  Rahu Kaal falls in part {data.rahuPart} of today's daytime.
                </p>
                <div className="bg-cosmic-900/50 rounded-xl p-4 text-sm text-gray-200">
                  <p className="mb-1.5"><span className="text-orange-300 font-medium">Yamaganda:</span> {YAMAGANDA_INFO}</p>
                  <p><span className="text-yellow-300 font-medium">Gulika Kaal:</span> {GULIKA_INFO}</p>
                </div>
              </motion.div>

              {/* Safe times today */}
              <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
                className="bg-green-500/10 border border-green-500/50 rounded-2xl p-5 mb-8 text-center">
                <h3 className="text-green-400 font-semibold mb-2">✅ Best Time Today</h3>
                <p className="text-white text-sm">The Abhijit Muhurta (midday) is always auspicious � 11:48 AM to 12:36 PM IST</p>
              </motion.div>

              <div className="text-center flex flex-wrap gap-3 justify-center">
                <Link to="/panchang/shubhamuhurat" className="inline-block bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-semibold rounded-full px-8 py-3 hover:opacity-90 transition-opacity text-sm">Find Auspicious Times</Link>
                <Link to="/panchang/choghadiya" className="inline-block border border-gold-500/40 text-gold-400 rounded-full px-8 py-3 hover:bg-gold-500/10 transition-colors text-sm">Choghadiya</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
