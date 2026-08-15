import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { content } from '../api';
import RichText from '../components/RichText';
import NotFoundPage from './NotFoundPage';
import { useLanguage } from '../context/LanguageContext';

// Any page written from the admin — Terms, Privacy, and whatever gets added
// next.
//
// This route sits last, after every page the app declares for itself, so an
// address only reaches here when nothing else claimed it. That is what lets
// someone add a page called "refunds" in the admin and have /refunds work
// without a deploy.

export default function ContentPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setPage(null);
    content.list('pages')
      .then(r => setPage((r.data.items || []).find(p => p.slug === slug) || null))
      .catch(() => setPage(null))
      .finally(() => setLoading(false));
  }, [lang, slug]);

  if (loading) return (
    <div className="relative z-10 min-h-screen pt-32 flex items-center justify-center">
      <div className="text-gold-400 animate-pulse font-serif text-xl">✦ Loading…</div>
    </div>
  );

  // No page by that name is genuinely a wrong address, so say so the same way
  // the rest of the site does.
  if (!page) return <NotFoundPage />;

  return (
    <div className="relative z-10 min-h-screen pt-32 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-xs text-cosmic-500 mb-6">
          <Link to="/" className="hover:text-gold-400 transition-colors">Home</Link>
          <span>›</span>
          <span className="text-cosmic-400">{page.title}</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card-cosmic p-6 sm:p-10">
            {page.icon && <div className="text-5xl mb-4">{page.icon}</div>}
            <h1 className="text-3xl sm:text-4xl font-serif text-gold-400 leading-snug mb-3">
              {page.title}
            </h1>
            {page.intro && (
              <p className="text-cosmic-300 text-sm leading-relaxed italic border-b border-gold-500/10 pb-6 mb-2">
                {page.intro}
              </p>
            )}

            <RichText content={page.body} />

            {page.updatedNote && (
              <p className="text-xs text-cosmic-600 mt-10 pt-5 border-t border-gold-500/10">
                {page.updatedNote}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
