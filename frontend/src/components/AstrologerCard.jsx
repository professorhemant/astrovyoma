import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { MessageCircle, Calendar, Star, BadgeCheck } from 'lucide-react';

export default function AstrologerCard({ astrologer }) {
  const navigate = useNavigate();

  const isRealPhoto = astrologer.photo_url && !astrologer.photo_url.includes('dicebear');

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 0 30px rgba(201,168,76,0.2)' }}
      transition={{ duration: 0.2 }}
      className="card-cosmic p-5 flex flex-col gap-3 cursor-pointer group relative overflow-hidden"
      onClick={() => navigate(`/astrologers/${astrologer.id}`)}
    >
      {/* Verified glow strip at top */}
      {astrologer.is_verified && (
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(to right, transparent, #C9A84C, transparent)' }} />
      )}

      {/* Free minutes badge */}
      {astrologer.free_minutes > 0 && (
        <div className="absolute top-3 right-3 z-10">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', boxShadow: '0 0 8px rgba(22,163,74,0.5)' }}>
            {astrologer.free_minutes} Min Free
          </span>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Photo */}
        <div className="relative flex-shrink-0">
          <div className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${astrologer.is_verified ? 'border-gold-400/70' : 'border-gold-600/40 group-hover:border-gold-400/70'}`}
            style={astrologer.is_verified ? { boxShadow: '0 0 12px rgba(201,168,76,0.35)' } : {}}>
            <img
              src={astrologer.photo_url}
              alt={astrologer.display_name}
              className="w-full h-full object-cover"
              onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${astrologer.display_name}`; }}
            />
          </div>
          {/* The pulsing green dot and the "Live" label below both said "reach
              me now". Nothing on this card can do that while the astrologer
              has no screen to answer on, so neither is shown. Both come back
              with the call feature. */}
        </div>

        {/* Name + stats */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1 flex-wrap">
            <h3 className="font-serif text-gold-400 text-sm font-semibold truncate group-hover:text-gold-300 transition-colors leading-tight">
              {astrologer.display_name}
            </h3>
            {astrologer.is_verified && (
              <BadgeCheck className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
            )}
          </div>
          {/* A rating needs reviews behind it. Every astrologer starts on the
              model's default of 5.0, so showing the star before anyone has
              rated them advertises a perfect score nobody gave. The count
              below already says "New" until there are consultations. */}
          {astrologer.total_reviews > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
              <span className="text-gold-400 text-xs font-medium">{parseFloat(astrologer.rating).toFixed(1)}</span>
              <span className="text-gray-400 text-xs">
                ({astrologer.total_reviews >= 1000
                  ? `${(astrologer.total_reviews / 1000).toFixed(1)}k`
                  : astrologer.total_reviews})
              </span>
            </div>
          )}
          <p className="text-gray-400 text-xs mt-0.5">
            {astrologer.experience_years} yrs exp •{' '}
            {astrologer.completed_orders >= 1000
              ? `${(astrologer.completed_orders / 1000).toFixed(1)}k consults`
              : astrologer.completed_orders > 0
                ? `${astrologer.completed_orders} consults`
                : 'New'}
          </p>
        </div>

        {/* Price */}
        <div className="text-right flex-shrink-0">
          <div className="text-gold-400 font-semibold text-sm">₹{astrologer.price_per_min}/min</div>
          <div className="text-xs mt-0.5 text-gray-500">by appointment</div>
        </div>
      </div>

      {/* Specialties */}
      <div className="flex flex-wrap gap-1">
        {(astrologer.specialties || []).slice(0, 3).map(s => (
          <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-gold-600/10 text-gold-400 border border-gold-600/20">
            {s}
          </span>
        ))}
      </div>

      {/* Languages */}
      <div className="text-xs text-gray-400">
        {(astrologer.languages || []).join(' • ')}
      </div>

      {/* Action buttons */}
      {/* Call went the way Chat did, and for the same reason: nothing on the
          astrologer's side could take it. Going online puts this card in front
          of people; it does not give her a screen that can answer. A seeker
          calling an "online" astrologer sat on "Connecting…" until they gave up.
          Booking a time is a promise that can actually be kept. */}
      <div className="flex flex-col gap-2 mt-1" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => navigate(`/book-appointment/${astrologer.id}`)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-full btn-gold text-xs font-semibold"
        >
          <Calendar className="w-3.5 h-3.5" />
          Book a time
        </button>
        <Link
          to="/chat"
          className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 hover:text-gold-400 transition-colors"
        >
          <MessageCircle className="w-3 h-3" />
          Prefer typing? Ask AstroVyoma AI — free
        </Link>
      </div>
    </motion.div>
  );
}
