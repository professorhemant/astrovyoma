import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Star, Globe, Clock, Award, Calendar } from 'lucide-react';
import { astrologers as astrologersApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function AstrologerDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [astrologer, setAstrologer] = useState(null);
  const [loading, setLoading] = useState(true);
  // handleConsult and the ?mode= auto-start went with the call buttons. Both
  // existed to open a live consultation, and the server refuses every live mode
  // now, so a stale ?mode=audio link starts nothing rather than a call that
  // cannot connect.

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
              </div>
              <div className="text-sm font-medium text-gray-400">Available by appointment</div>
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
                <Link to={`/book-appointment/${id}`}
                  className="btn-gold px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-medium">
                  <Calendar className="w-4 h-4" /> Book a time with {astrologer.display_name.split(' ')[0]}
                </Link>
              </div>

              <p className="mt-3 text-xs text-gray-500 max-w-md">
                Live calls are paused while we finish the astrologer side. Pick a
                time and we will arrange it with {astrologer.display_name.split(' ')[0]} directly.
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
