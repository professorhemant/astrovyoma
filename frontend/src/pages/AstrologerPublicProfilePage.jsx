import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Star, Globe, Clock, Award, Phone, Video, Calendar, Share2, BadgeCheck, ChevronLeft } from 'lucide-react';
import { astrologers as astrologersApi, consultations as consultationsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useSeoMeta } from '../hooks/useSeoMeta';

export default function AstrologerPublicProfilePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [astrologer, setAstrologer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(null);

  // OG image must be an https:// URL — base64 data URIs are rejected by all social crawlers
  const ogImage = astrologer?.photo_url?.startsWith('https://') ? astrologer.photo_url : undefined;
  const specsSnippet = (astrologer?.specialties || []).slice(0, 3).join(', ');
  const bioSnippet = astrologer?.bio?.slice(0, 160) || (specsSnippet ? `Expert in ${specsSnippet}` : '');

  useSeoMeta(astrologer ? {
    title:         `${astrologer.display_name} — Vedic Astrologer | AstroVyoma`,
    description:   `${bioSnippet}${bioSnippet && astrologer.price_per_min ? ` · ₹${astrologer.price_per_min}/min` : ''}`,
    ogTitle:       `${astrologer.display_name} | AstroVyoma`,
    ogDescription: bioSnippet || `Consult ${astrologer.display_name} on AstroVyoma · ₹${astrologer.price_per_min}/min`,
    ogImage,
    ogUrl:         `https://astrovyoma.com/astrologer/${slug}`,
    ogType:        'profile',
  } : {});

  useEffect(() => {
    let alive = true;
    astrologersApi.getBySlug(slug)
      .then(res => { if (alive) setAstrologer(res.data); })
      .catch(() => { if (alive) { toast.error('Astrologer not found'); navigate('/astrologers'); } })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [slug]);

  async function handleConsult(mode) {
    if (!user) {
      toast('Please login to start a consultation', { icon: '🔐' });
      navigate(`/login?redirect=/astrologer/${slug}`);
      return;
    }
    if (!astrologer.is_online) {
      toast.error(`${astrologer.display_name} is offline. Book an appointment instead.`);
      return;
    }
    setStarting(mode);
    try {
      const res = await consultationsApi.start({ astrologer_id: astrologer.id, mode });
      const params = new URLSearchParams({
        astrologer: astrologer.display_name,
        astrologerId: astrologer.id,
        astrologerSlug: astrologer.slug || '',
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
      setStarting(null);
    }
  }

  function handleShare() {
    const url = `${window.location.origin}/astrologer/${slug}`;
    if (navigator.share) {
      navigator.share({ title: `${astrologer.display_name} — AstroVyoma`, url })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url)
        .then(() => toast.success('Profile link copied!'))
        .catch(() => toast.error('Could not copy link'));
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-cosmic-950 flex items-center justify-center">
      <div className="text-gold-400 font-serif text-xl animate-pulse">✦ Loading profile…</div>
    </div>
  );

  if (!astrologer) return null;

  const reviews  = astrologer.reviews || [];
  const hasPhoto = astrologer.photo_url && !astrologer.photo_url.includes('dicebear');
  const initials = (astrologer.display_name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const specs    = astrologer.specialties || [];
  const langs    = astrologer.languages   || [];

  return (
    <div className="min-h-screen bg-cosmic-950">

      {/* ── Hero banner ── */}
      <div className="relative pt-20 pb-10 px-4"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 60%), #0d0820' }}>

        <div className="max-w-3xl mx-auto">
          {/* Back + share row */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-gray-400 hover:text-gold-400 text-sm transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={handleShare}
              className="flex items-center gap-1.5 text-gray-400 hover:text-gold-400 text-sm transition-colors">
              <Share2 className="w-4 h-4" /> Share Profile
            </button>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-6 items-start">

            {/* Avatar */}
            <div className="relative flex-shrink-0 mx-auto sm:mx-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-gold-400/60"
                style={{ boxShadow: '0 0 30px rgba(201,168,76,0.25)' }}>
                {hasPhoto ? (
                  <img src={astrologer.photo_url} alt={astrologer.display_name}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none'; }} />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center font-serif text-3xl font-semibold ${hasPhoto ? 'hidden' : 'flex'}`}
                  style={{ background: 'linear-gradient(135deg,#1e1040,#2a1860)', color: '#E8C547' }}>
                  {initials}
                </div>
              </div>
              <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-cosmic-950 ${astrologer.is_online ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
            </div>

            {/* Name + bio */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl text-gold-400">{astrologer.display_name}</h1>
                {astrologer.is_verified && (
                  <span className="flex items-center gap-1 text-xs text-gold-300 bg-gold-500/10 border border-gold-500/30 px-2 py-0.5 rounded-full">
                    <BadgeCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
              </div>

              <div className={`text-xs mt-1.5 font-medium ${astrologer.is_online ? 'text-green-400' : 'text-gray-500'}`}>
                {astrologer.is_online ? '● Available Now' : '○ Currently Offline'}
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-4 mt-3 justify-center sm:justify-start text-xs text-gray-400">
                {astrologer.total_reviews > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                    <span className="text-gold-400 font-semibold">{parseFloat(astrologer.rating).toFixed(1)}</span>
                    <span>({astrologer.total_reviews} reviews)</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-purple-400" />
                  {astrologer.experience_years} yrs experience
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  {astrologer.completed_orders > 0 ? `${astrologer.completed_orders} consultations` : 'New astrologer'}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  {langs.join(', ')}
                </span>
              </div>

              {/* Rate */}
              <div className="mt-3 text-lg font-semibold text-gold-400">
                ₹{astrologer.price_per_min}<span className="text-sm text-gray-400 font-normal">/min</span>
                {astrologer.free_minutes > 0 && (
                  <span className="ml-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                    First {astrologer.free_minutes} min free
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* CTA buttons */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="flex gap-3 mt-6 flex-wrap">
            <button
              onClick={() => handleConsult('audio')}
              disabled={!astrologer.is_online || starting === 'audio'}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-all ${
                astrologer.is_online
                  ? 'btn-gold shadow-lg shadow-gold-500/20'
                  : 'bg-cosmic-800 border border-gold-600/15 text-gray-500 cursor-not-allowed'
              }`}>
              {starting === 'audio'
                ? <span className="w-4 h-4 border-2 border-cosmic-950/50 border-t-cosmic-950 rounded-full animate-spin" />
                : <Phone className="w-4 h-4" />}
              {astrologer.is_online ? 'Call Now' : 'Offline'}
            </button>
            <button
              onClick={() => handleConsult('video')}
              disabled={!astrologer.is_online || starting === 'video'}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold border transition-all ${
                astrologer.is_online
                  ? 'border-gold-500/50 text-gold-400 hover:bg-gold-500/10'
                  : 'border-gold-600/15 text-gray-500 cursor-not-allowed'
              }`}>
              {starting === 'video'
                ? <span className="w-4 h-4 border-2 border-gold-400/50 border-t-gold-400 rounded-full animate-spin" />
                : <Video className="w-4 h-4" />}
              Video Call
            </button>
            <Link
              to={`/book-appointment/${astrologer.id}`}
              className="flex-1 min-w-[130px] flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 transition-all">
              <Calendar className="w-4 h-4" />
              Book Slot
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── Profile body ── */}
      <div className="max-w-3xl mx-auto px-4 pb-24 space-y-6 mt-6">

        {/* Bio */}
        {astrologer.bio && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="card-cosmic p-6">
            <h2 className="text-gold-500 text-xs uppercase tracking-widest mb-3">About</h2>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{astrologer.bio}</p>
          </motion.div>
        )}

        {/* Specialties */}
        {specs.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="card-cosmic p-6">
            <h2 className="text-gold-500 text-xs uppercase tracking-widest mb-3">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {specs.map(s => (
                <span key={s} className="text-xs px-3 py-1.5 rounded-full bg-gold-600/10 text-gold-400 border border-gold-600/20">
                  {s}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="card-cosmic p-6">
            <h2 className="text-gold-500 text-xs uppercase tracking-widest mb-4">
              Reviews
              <span className="ml-2 text-gray-500 normal-case tracking-normal font-normal">
                ({astrologer.total_reviews})
              </span>
            </h2>
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="border-b border-gold-600/10 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`w-3 h-3 ${i <= r.rating ? 'fill-gold-400 text-gold-400' : 'text-gray-700'}`} />
                      ))}
                    </div>
                    <span className="text-gray-500 text-xs">
                      {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {r.comment && <p className="text-gray-300 text-sm">{r.comment}</p>}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Share CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="rounded-2xl border border-gold-600/20 bg-gold-600/5 p-5 text-center">
          <p className="text-gray-400 text-sm mb-3">Share this profile with friends and family</p>
          <button onClick={handleShare}
            className="btn-gold px-6 py-2.5 text-sm font-semibold inline-flex items-center gap-2">
            <Share2 className="w-4 h-4" /> Copy Profile Link
          </button>
          <p className="text-gray-600 text-xs mt-2 break-all">
            {window.location.origin}/astrologer/{slug}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
