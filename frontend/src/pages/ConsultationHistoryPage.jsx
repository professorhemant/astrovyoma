import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, MessageCircle, Phone, Video, Clock, Calendar, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { consultations as consultationsApi, reportHistory as historyApi } from '../api';
import toast from 'react-hot-toast';

const MODE_ICON  = { chat: MessageCircle, audio: Phone, video: Video };
const MODE_LABEL = { chat: 'Chat', audio: 'Audio Call', video: 'Video Call' };
const STATUS_COLOR = { completed: 'text-green-400', active: 'text-gold-400', pending: 'text-yellow-400', cancelled: 'text-gray-300' };

const TYPE_LABEL = {
  kundali:    'Kundali Chart',
  kp:         'KP Astrology',
  muhurta:    'Muhurta',
  namkaran:   'Namkaran',
  yoga:       'Yoga Finder',
  lal_kitab:  'Lal Kitab',
  domain:     'Domain Report',
  guna_milan: 'Kundali Matching',
  gochara:    'Gochara Transits',
};

const TYPE_COLOR = {
  kundali:    'border-gold-500/40 bg-gold-500/5',
  kp:         'border-purple-500/40 bg-purple-500/5',
  muhurta:    'border-emerald-500/40 bg-emerald-500/5',
  namkaran:   'border-sky-500/40 bg-sky-500/5',
  yoga:       'border-teal-500/40 bg-teal-500/5',
  lal_kitab:  'border-red-500/40 bg-red-500/5',
  domain:     'border-blue-500/40 bg-blue-500/5',
  guna_milan: 'border-pink-500/40 bg-pink-500/5',
  gochara:    'border-violet-500/40 bg-violet-500/5',
};

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'fill-gold-400 text-gold-400' : 'text-gray-300'}`} />
      ))}
    </div>
  );
}

function ReportCard({ report, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(report.created_at);
  const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const meta = report.meta || {};
  const colorClass = TYPE_COLOR[report.type] || 'border-gold-500/20 bg-cosmic-900/40';

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-5 ${colorClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="text-3xl flex-shrink-0 mt-0.5">{report.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-cosmic-400">
                {TYPE_LABEL[report.type] || report.type}
              </span>
              <span className="text-xs text-cosmic-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {dateStr}
              </span>
            </div>
            <h3 className="font-serif text-gold-400 text-base truncate">{report.title}</h3>

            {/* Summary pills */}
            <div className="flex flex-wrap gap-2 mt-2">
              {meta.lagna && (
                <span className="text-xs bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5 text-cosmic-300">
                  Lagna: {meta.lagna}
                </span>
              )}
              {meta.moon_sign && (
                <span className="text-xs bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5 text-cosmic-300">
                  Moon: {meta.moon_sign}
                </span>
              )}
              {meta.nakshatra && (
                <span className="text-xs bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5 text-cosmic-300">
                  Nakshatra: {meta.nakshatra}
                </span>
              )}
              {meta.dob && (
                <span className="text-xs bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5 text-cosmic-300">
                  DOB: {meta.dob}
                </span>
              )}
              {meta.score !== undefined && (
                <span className={`text-xs rounded-full px-2.5 py-0.5 font-medium border ${
                  meta.score >= 70 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                  meta.score >= 55 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                  'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  Score: {meta.score}/100
                </span>
              )}
              {meta.verdict && (
                <span className="text-xs bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5 text-cosmic-300">
                  {meta.verdict}
                </span>
              )}
              {meta.event_type && (
                <span className="text-xs bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5 text-cosmic-300">
                  {meta.event_type}
                </span>
              )}
              {meta.birth_place && (
                <span className="text-xs bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5 text-cosmic-300 truncate max-w-[180px]">
                  📍 {meta.birth_place}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {meta && Object.keys(meta).length > 0 && (
            <button onClick={() => setExpanded(e => !e)}
              className="text-cosmic-500 hover:text-cosmic-300 transition-colors p-1">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
          {!report.is_kundali && (
            <button onClick={() => onDelete(report.id)}
              className="text-cosmic-600 hover:text-red-400 transition-colors p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {report.is_kundali && (
            <Link to="/kundali" className="text-xs text-gold-500/70 hover:text-gold-400 transition-colors border border-gold-600/20 rounded-full px-3 py-1 whitespace-nowrap">
              View Chart
            </Link>
          )}
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && meta && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(meta).map(([k, v]) => v ? (
                <div key={k} className="text-xs">
                  <span className="text-cosmic-500 capitalize">{k.replace(/_/g, ' ')}: </span>
                  <span className="text-cosmic-200">{String(v)}</span>
                </div>
              ) : null)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ConsultationCard({ c, i }) {
  const ModeIcon = MODE_ICON[c.mode] || MessageCircle;
  const astrologer = c.astrologer || {};
  const review = c.review;
  const date = new Date(c.created_at);
  const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }} className="card-cosmic p-5">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-start gap-4 flex-1">
          <img src={astrologer.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${astrologer.display_name}`}
            alt={astrologer.display_name} className="w-12 h-12 rounded-full border-2 border-gold-600/30 flex-shrink-0"
            onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${astrologer.display_name}`; }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-serif text-gold-400">{astrologer.display_name || 'Astrologer'}</h3>
              <span className={`text-xs font-medium capitalize ${STATUS_COLOR[c.status] || 'text-gray-200'}`}>● {c.status}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-300">
              <span className="flex items-center gap-1"><ModeIcon className="w-3.5 h-3.5" /> {MODE_LABEL[c.mode] || c.mode}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {dateStr} at {timeStr}</span>
              {c.duration_mins > 0 && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {c.duration_mins} min</span>}
              {parseFloat(c.total_cost) > 0 && <span className="text-gold-500">₹{parseFloat(c.total_cost).toFixed(0)}</span>}
            </div>
          </div>
        </div>
        <div className="sm:text-right flex-shrink-0">
          {review ? (
            <div>
              <StarRating rating={review.rating} />
              {review.comment && <p className="text-gray-300 text-xs mt-1 max-w-[200px] sm:ml-auto line-clamp-2">{review.comment}</p>}
            </div>
          ) : c.status === 'completed' ? (
            <Link to={`/astrologers/${c.astrologer_id}`}
              className="text-xs text-gold-500/60 hover:text-gold-400 transition-colors border border-gold-600/20 rounded-full px-3 py-1">
              + Leave Review
            </Link>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

export default function ConsultationHistoryPage() {
  const [reports, setReports]       = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState('reports');

  useEffect(() => {
    Promise.allSettled([
      historyApi.getAll(),
      consultationsApi.getMy(),
    ]).then(([rRes, cRes]) => {
      setReports(rRes.status === 'fulfilled' ? (rRes.value.data || []) : []);
      setConsultations(cRes.status === 'fulfilled' ? (cRes.value.data || []) : []);
    }).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this report from history?')) return;
    try {
      await historyApi.delete(id);
      setReports(r => r.filter(x => x.id !== id));
      toast.success('Report removed from history');
    } catch {
      toast.error('Failed to remove report');
    }
  };

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-32 pb-24">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="text-gold-500/60 text-sm tracking-widest uppercase mb-3">✦ Your Journey</p>
          <h1 className="font-serif text-3xl md:text-4xl text-gold-400 mb-2">My History</h1>
          <p className="text-gray-300 text-sm">All your saved reports and consultation sessions</p>
        </motion.div>

        {/* Tab switch */}
        <div className="flex gap-1 bg-cosmic-900 rounded-xl p-1 border border-gold-500/10 mb-6 max-w-xs mx-auto">
          <button onClick={() => setActiveTab('reports')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'reports' ? 'bg-gold-500/20 text-gold-400' : 'text-cosmic-500 hover:text-cosmic-300'}`}>
            📋 Reports {reports.length > 0 && <span className="ml-1 text-xs opacity-70">({reports.length})</span>}
          </button>
          <button onClick={() => setActiveTab('consultations')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'consultations' ? 'bg-gold-500/20 text-gold-400' : 'text-cosmic-500 hover:text-cosmic-300'}`}>
            🔮 Sessions {consultations.length > 0 && <span className="ml-1 text-xs opacity-70">({consultations.length})</span>}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gold-400 font-serif text-xl animate-pulse">✦ Loading your history...</div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'reports' && (
              <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {reports.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-6">📋</div>
                    <p className="text-gray-200 text-lg font-serif mb-2">No saved reports yet</p>
                    <p className="text-gray-400 text-sm mb-8">Generate a Kundali, KP chart, or Muhurta and save it here</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Link to="/kundali" className="btn-gold px-6 py-2.5 text-sm">Generate Kundali</Link>
                      <Link to="/kp-astrology" className="btn-outline-gold px-6 py-2.5 text-sm">KP Astrology</Link>
                      <Link to="/muhurta-calculator" className="btn-outline-gold px-6 py-2.5 text-sm">Muhurta</Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((r, i) => (
                      <motion.div key={r.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                        <ReportCard report={r} onDelete={handleDelete} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'consultations' && (
              <motion.div key="consultations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {consultations.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-6">🔮</div>
                    <p className="text-gray-200 text-lg font-serif mb-2">No consultations yet</p>
                    <p className="text-gray-400 text-sm mb-8">Book a session with one of our Vedic astrologers</p>
                    <Link to="/astrologers" className="btn-gold px-8 py-3">Meet Our Astrologers</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {consultations.map((c, i) => <ConsultationCard key={c.id} c={c} i={i} />)}
                  </div>
                )}
                {consultations.length > 0 && (
                  <div className="text-center mt-10">
                    <Link to="/astrologers" className="btn-outline-gold px-8 py-3">Book Another Session</Link>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
