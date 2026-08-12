import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Star, Globe, Clock, Award, Calendar, Phone, Video } from 'lucide-react';
import { astrologers as astrologersApi, consultations as consultationsApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function AstrologerDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [astrologer, setAstrologer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  async function handleConsult(mode) {
    if (!user) { toast.error('Please login to start a consultation'); navigate('/login'); return; }
    // Stop before the call screen rather than after it. The server refuses too —
    // this is only so the seeker hears it sooner and in plainer words.
    if (!astrologer.is_online) {
      toast.error(`${astrologer.display_name} is offline right now. Book a time instead.`);
      return;
    }
    setStarting(true);
    try {
      const res = await consultationsApi.start({ astrologer_id: id, mode });
      const params = new URLSearchParams({
        astrologer: astrologer.display_name,
        astrologerId: id,
        price: astrologer.price_per_min,
        specialties: JSON.stringify(astrologer.specialties || []),
        mode,
        channel: res.data.agora.channel,
        token: res.data.agora.token,
        appId: res.data.agora.appId,
      });
      navigate(`/consult/${res.data.consultation.id}?${params.toString()}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not start the call');
    } finally {
      setStarting(false);
    }
  }

  if (loading) return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="flex items-center justify-center h-screen">
        <div className="text-gold-400 font-serif text-xl animate-pulse">✦ Loading profile...</div>
      </div>
    </div>
  );

  if (!astrologer) return null;

  const reviews = astrologer.reviews || [];

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-32 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-cosmic p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="relative">
                <img
                  src={astrologer.photo_url}
                  alt={astrologer.display_name}
                  className="w-28 h-28 rounded-full border-4 border-gold-600/40"
                  onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${astrologer.display_name}`; }}
                />
                <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-cosmic-800 ${astrologer.is_online ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
              </div>
              <div className={`text-sm font-medium ${astrologer.is_online ? 'text-green-400' : 'text-gray-400'}`}>
                {astrologer.is_online ? '● Online now' : '○ Currently offline'}
              </div>
            </div>

            <div className="flex-1">
              <h1 className="font-serif text-3xl text-gold-400 mb-1">{astrologer.display_name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-200 mb-3">
                {/* Rating and consultation count appear once they have been
                    earned. Experience and languages are stated by the
                    astrologer and stand on their own. */}
                {astrologer.total_reviews > 0 && (
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-gold-400 text-gold-400" />{parseFloat(astrologer.rating).toFixed(1)} ({astrologer.total_reviews.toLocaleString()} reviews)</span>
                )}
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{astrologer.experience_years} years experience</span>
                {astrologer.completed_orders > 0 && (
                  <span className="flex items-center gap-1"><Award className="w-4 h-4" />{astrologer.completed_orders.toLocaleString()} consultations</span>
                )}
                <span className="flex items-center gap-1"><Globe className="w-4 h-4" />{(astrologer.languages || []).join(', ')}</span>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed mb-4">{astrologer.bio}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {(astrologer.specialties || []).map(s => (
                  <span key={s} className="px-3 py-1 rounded-full text-xs bg-gold-600/10 text-gold-400 border border-gold-600/20">{s}</span>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-200 mb-6">
                <span className="text-gold-400 font-semibold text-lg">₹{astrologer.price_per_min}/min</span>
                <span>•</span>
                <span>Est. 10 min: ₹{(parseFloat(astrologer.price_per_min) * 10).toFixed(0)}</span>
                {user && <span>• Wallet: ₹{parseFloat(user.wallet_balance || 0).toFixed(0)}</span>}
              </div>

              {/* Audio and video followed Chat off this page. All three needed an
                  astrologer on the other end, and the Pandit Portal has no
                  screen that can take any of them — a seeker who pressed Call
                  waited on "Connecting…" until they gave up. Booking a time is
                  the one thing here that can actually be honoured. */}
              <div className="flex flex-wrap gap-3">
                <button onClick={() => handleConsult('audio')} disabled={starting || !astrologer.is_online}
                  className="btn-gold px-6 py-3 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  <Phone className="w-4 h-4" /> Audio Call
                </button>
                <button onClick={() => handleConsult('video')} disabled={starting || !astrologer.is_online}
                  className="btn-outline-gold px-6 py-3 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  <Video className="w-4 h-4" /> Video Call
                </button>
                <Link to={`/book-appointment/${id}`}
                  className="border border-violet-500/50 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors">
                  <Calendar className="w-4 h-4" /> Book a time
                </Link>
              </div>

              <p className="mt-3 text-xs text-gray-500 max-w-md">
                {astrologer.is_online
                  ? `${astrologer.display_name.split(' ')[0]} is online — the call rings in her portal and she can answer or decline. You are charged only from the moment she joins.`
                  : `${astrologer.display_name.split(' ')[0]} is offline, so a call would not reach her. Book a time instead.`}
              </p>

              <p className="mt-4 text-sm text-gray-400">
                Would rather type than talk?{' '}
                <Link to="/chat" className="text-gold-400 hover:text-gold-300 underline underline-offset-2">
                  Ask AstroVyoma AI
                </Link>{' '}
                — free, and answered by AI rather than by {astrologer.display_name}.
              </p>
            </div>
          </div>
        </motion.div>

        {reviews.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-cosmic p-6">
            <h2 className="font-serif text-gold-400 text-xl mb-4">Recent Reviews</h2>
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="border-b border-gold-600/10 pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />)}
                  </div>
                  <p className="text-gray-300 text-sm">{r.comment}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
