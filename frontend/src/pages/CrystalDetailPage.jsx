import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { crystals as crystalsApi } from '../api';
import { useLanguage } from '../context/LanguageContext';

const TYPE_LABELS = {
  navagraha: { label:'Navagraha Gemstone', color:'bg-gold-500/20 text-gold-400 border-gold-500/40' },
  healing:   { label:'Healing Crystal',    color:'bg-violet-500/20 text-violet-300 border-violet-500/40' },
};

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start gap-2 py-2.5 border-b border-gold-500/10 last:border-0">
      <span className="text-xs text-cosmic-500 w-28 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-cosmic-200">{value}</span>
    </div>
  );
}

export default function CrystalDetailPage() {
  const { slug } = useParams();
  const [crystal, setCrystal] = useState(null);
  const { lang } = useLanguage();
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [activeTab, setActiveTab] = useState('benefits');

  useEffect(() => {
    setLoading(true); setError('');
    crystalsApi.getCrystal(slug)
      .then(r => { setCrystal(r.data.crystal); setRelated(r.data.related || []); setActiveTab('benefits'); })
      .catch(() => setError('Crystal not found.'))
      .finally(() => setLoading(false));
  }, [lang, slug]);

  if (loading) return (
    <div className="relative z-10 min-h-screen pt-32 flex items-center justify-center">
      <div className="text-gold-400 animate-pulse font-serif text-xl">✦ Loading…</div>
    </div>
  );
  if (error || !crystal) return (
    <div className="relative z-10 min-h-screen pt-32 flex flex-col items-center justify-center gap-4">
      <div className="text-4xl">💎</div>
      <p className="text-cosmic-400">{error}</p>
      <Link to="/crystals" className="btn-cosmic px-5 py-2 text-sm">← Back to Crystal Guide</Link>
    </div>
  );

  const typeMeta = TYPE_LABELS[crystal.type] || TYPE_LABELS.healing;
  const tabs = crystal.type === 'navagraha'
    ? [{ k:'benefits', l:'Benefits' }, { k:'howToWear', l:'How to Wear' }, { k:'cautions', l:'Cautions' }]
    : [{ k:'benefits', l:'Benefits' }, { k:'howToUse', l:'How to Use' }, { k:'cautions', l:'Cautions' }];

  return (
    <div className="relative z-10 min-h-screen pt-32 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-cosmic-500 mb-6">
          <Link to="/crystals" className="hover:text-gold-400 transition-colors">Crystal Guide</Link>
          <span>›</span>
          <span className="text-cosmic-400">{crystal.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main */}
          <div className="lg:col-span-2 space-y-5">

            {/* Hero card */}
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              className="card-cosmic p-6 sm:p-8"
              style={{ borderColor: crystal.color + '50' }}>
              {/* A photograph gets a panel; an emoji gets a swatch.
                  The two are not interchangeable at one size. An emoji is a
                  glyph — legible at 48px, and no better for being drawn at 250 —
                  while a photograph of a stone is detail, and detail shown at
                  48px is speckle. So the picture, where there is one, is given
                  the room a picture needs, and the layout changes shape around
                  it rather than dropping it into a slot built for a symbol. */}
              <div className={crystal.image
                ? 'flex flex-col sm:flex-row items-start gap-6'
                : 'flex items-start gap-5'}>
                {crystal.image ? (
                  <div className="w-full sm:w-56 shrink-0 aspect-square rounded-2xl overflow-hidden"
                    style={{ background: crystal.color + '15', border: `2px solid ${crystal.color}50` }}>
                    <img src={crystal.image} alt={crystal.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0"
                    style={{ background: crystal.color + '20', border: `2px solid ${crystal.color}50` }}>
                    {crystal.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${typeMeta.color}`}>{typeMeta.label}</span>
                    {crystal.mallProductId && (
                      <span className="text-xs px-2.5 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-medium">✦ In Stock</span>
                    )}
                  </div>
                  <h1 className="text-2xl font-serif text-gold-400 mb-0.5">{crystal.name}</h1>
                  <p className="text-cosmic-400 text-sm italic mb-3">{crystal.hindiName}</p>
                  <p className="text-cosmic-300 text-sm leading-relaxed">{crystal.shortDesc}</p>
                </div>
              </div>
            </motion.div>

            {/* Quick stats */}
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
              className="card-cosmic p-5">
              <InfoRow label="Ruling Planet" value={crystal.planet} />
              <InfoRow label="Zodiac Signs" value={crystal.signs?.length ? crystal.signs.join(', ') : 'Universal'} />
              <InfoRow label="Element"       value={crystal.element} />
              <InfoRow label="Chakra"        value={crystal.chakra} />
              <InfoRow label="Color"         value={crystal.colorName} />
              <InfoRow label="Hardness"      value={crystal.hardness} />
              <InfoRow label="Price Range"   value={crystal.priceRange} />
              {crystal.uparatna && <InfoRow label="Substitute"   value={crystal.uparatna} />}
              {crystal.dayToActivate && <InfoRow label="Activate On"  value={crystal.dayToActivate} />}
            </motion.div>

            {/* Mantra */}
            {crystal.mantra && (
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
                className="card-cosmic p-5 border-l-4 border-gold-500/60">
                <div className="text-xs text-gold-500 font-semibold uppercase tracking-wider mb-2">Mantra</div>
                <p className="text-cosmic-200 text-sm font-medium italic">{crystal.mantra}</p>
              </motion.div>
            )}

            {/* Tabs */}
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
              className="card-cosmic">
              <div className="flex border-b border-gold-500/10">
                {tabs.map(t => (
                  <button key={t.k} onClick={() => setActiveTab(t.k)}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === t.k ? 'text-gold-400 border-b-2 border-gold-500 -mb-px' : 'text-cosmic-500 hover:text-cosmic-300'}`}>
                    {t.l}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {activeTab === 'benefits' && (
                  <ul className="space-y-2.5">
                    {crystal.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-cosmic-200">
                        <span className="text-gold-500 mt-0.5 shrink-0">✦</span>{b}
                      </li>
                    ))}
                  </ul>
                )}
                {(activeTab === 'howToWear' || activeTab === 'howToUse') && (
                  <p className="text-cosmic-200 text-sm leading-relaxed">
                    {crystal.howToWear || crystal.howToUse}
                  </p>
                )}
                {activeTab === 'cautions' && (
                  <ul className="space-y-2.5">
                    {crystal.cautions.map((c, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-amber-300">
                        <span className="text-amber-500 mt-0.5 shrink-0">⚠</span>{c}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.15 }}
            className="space-y-5">

            {/* Mall CTA */}
            {crystal.mallProductId ? (
              <div className="card-cosmic p-5 text-center border border-gold-500/30">
                <div className="text-2xl mb-2">🛍️</div>
                <h3 className="text-gold-400 font-serif text-sm mb-1">Available in Astro Mall</h3>
                <p className="text-cosmic-400 text-xs mb-4">Lab-certified, astrologer-charged gemstone ready to ship.</p>
                <Link to={`/mall/product/${crystal.mallProductId}`} className="btn-cosmic w-full py-2.5 text-sm block text-center">
                  Buy Now →
                </Link>
              </div>
            ) : (
              <div className="card-cosmic p-5 text-center">
                <div className="text-2xl mb-2">🛍️</div>
                <h3 className="text-cosmic-300 font-serif text-sm mb-1">Shop Related Items</h3>
                <p className="text-cosmic-500 text-xs mb-4">Browse our full collection of gemstones and healing crystals.</p>
                <Link to="/mall" className="w-full py-2.5 text-sm block text-center border border-cosmic-700 text-cosmic-300 rounded-xl hover:bg-white/5 transition-colors">
                  View Mall →
                </Link>
              </div>
            )}

            {/* Kundali CTA */}
            <div className="card-cosmic p-5 text-center">
              <div className="text-2xl mb-2">🔮</div>
              <p className="text-cosmic-400 text-xs mb-3">Get a personalised gemstone recommendation based on your birth chart.</p>
              <Link to="/kundali" className="w-full py-2.5 text-sm block text-center border border-gold-500/30 text-gold-400 rounded-xl hover:bg-gold-500/10 transition-colors">
                Check My Chart
              </Link>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gold-500 uppercase tracking-wider mb-3 px-1">Related Stones</h3>
                <div className="space-y-2">
                  {related.map(r => (
                    <Link key={r.slug} to={`/crystals/${r.slug}`}
                      className="card-cosmic p-3 flex items-center gap-3 group hover:ring-1 hover:ring-gold-500/30 transition-all">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0"
                        style={{ background: r.color + '20', border:`1px solid ${r.color}40` }}>
                        {r.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-cosmic-200 group-hover:text-gold-400 transition-colors font-medium">{r.name}</div>
                        <div className="text-xs text-cosmic-500">{r.planet}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
