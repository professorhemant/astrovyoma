import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blog } from '../api';
import RichText from '../components/RichText';
import { parseBlocks } from '../utils/richText';

const CAT_COLORS = {
  'Vedic Astrology': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  'Planets':         'bg-blue-500/20   text-blue-300   border-blue-500/30',
  'Horoscope':       'bg-gold-500/20   text-gold-300   border-gold-500/30',
  'Relationships':   'bg-rose-500/20   text-rose-300   border-rose-500/30',
  'Career':          'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Spirituality':    'bg-indigo-500/20 text-indigo-300  border-indigo-500/30',
  'Vastu':           'bg-amber-500/20  text-amber-300   border-amber-500/30',
  'Remedies':        'bg-teal-500/20   text-teal-300    border-teal-500/30',
};

function RelatedCard({ article }) {
  return (
    <Link to={`/blog/${article.slug}`} className="card-cosmic p-4 flex gap-3 group hover:ring-1 hover:ring-gold-500/30 transition-all">
      {/* A thumbnail of the banner in the sidebar, cropped square so a row of
          related articles stays a tidy list rather than a stack of wide strips. */}
      {article.image
        ? <img src={article.image} alt="" loading="lazy" aria-hidden="true"
            className="w-14 h-14 rounded-lg object-cover shrink-0 border border-gold-500/20" />
        : <div className="text-2xl shrink-0">{article.icon}</div>}
      <div>
        <div className="text-xs text-cosmic-500 mb-1">{article.category}</div>
        <div className="text-sm text-cosmic-200 group-hover:text-gold-400 transition-colors font-medium leading-snug line-clamp-2">{article.title}</div>
        <div className="text-xs text-cosmic-600 mt-1">{article.readTime} min read</div>
      </div>
    </Link>
  );
}

export default function BlogArticlePage() {
  const { slug }              = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    blog.getArticle(slug)
      .then(r => { setArticle(r.data.article); setRelated(r.data.related || []); })
      .catch(() => setError('Article not found.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="relative z-10 min-h-screen pt-32 flex items-center justify-center">
      <div className="text-gold-400 animate-pulse font-serif text-xl">✦ Loading…</div>
    </div>
  );

  if (error || !article) return (
    <div className="relative z-10 min-h-screen pt-32 flex flex-col items-center justify-center gap-4">
      <div className="text-4xl">🔭</div>
      <p className="text-cosmic-400">{error || 'Article not found.'}</p>
      <Link to="/blog" className="btn-cosmic px-5 py-2 text-sm">← Back to Blog</Link>
    </div>
  );

  const catCls = CAT_COLORS[article.category] || 'bg-cosmic-700 text-cosmic-300 border-cosmic-600';
  // The table of contents is the article's own headings, read back out of
  // whatever the author typed.
  const headings = parseBlocks(article.body).filter(b => b.type === 'h2');

  return (
    <div className="relative z-10 min-h-screen pt-32 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-cosmic-500 mb-6">
          <Link to="/" className="hover:text-gold-400 transition-colors">Home</Link>
          <span>›</span>
          <Link to="/blog" className="hover:text-gold-400 transition-colors">Blog</Link>
          <span>›</span>
          <span className="text-cosmic-400 truncate">{article.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Main article */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="lg:col-span-3">

            {/* Hero */}
            <div className="card-cosmic mb-8 overflow-hidden">
            {article.image && (
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: '12 / 5' }}>
                <img src={article.image} alt="" aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover" />
                {/* Faded into the card so the banner reads as the top of the
                    article rather than a picture pasted above it. */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-cosmic-900 to-transparent" />
              </div>
            )}
            <div className="p-6 sm:p-8">
              {!article.image && <div className="text-5xl mb-4">{article.icon}</div>}
              <span className={`inline-block border rounded-full text-xs px-2.5 py-1 mb-4 font-medium ${catCls}`}>
                {article.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif text-gold-400 leading-snug mb-4">
                {article.title}
              </h1>
              <p className="text-cosmic-300 text-sm leading-relaxed mb-5 italic">{article.excerpt}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-cosmic-500 pt-4 border-t border-gold-500/10">
                <span>✦ {article.author}</span>
                <span>{new Date(article.date).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</span>
                <span>⏱ {article.readTime} min read</span>
              </div>
            </div>
            </div>

            {/* Content */}
            <div className="card-cosmic p-6 sm:p-8">
              <RichText content={article.body} />
            </div>

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {article.tags.map(t => (
                  <span key={t} className="text-xs px-3 py-1 rounded-full bg-cosmic-900 border border-cosmic-700 text-cosmic-400">
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Back */}
            <div className="mt-8">
              <Link to="/blog" className="text-sm text-gold-400 hover:text-gold-300 transition-colors">
                ← Back to all articles
              </Link>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1 }} className="lg:col-span-1 space-y-5">

            {/* Table of contents */}
            {headings.length > 0 && (
              <div className="card-cosmic p-4 sticky top-24">
                <h3 className="text-xs font-semibold text-gold-500 uppercase tracking-wider mb-3">In This Article</h3>
                <ul className="space-y-2">
                  {headings.map((h, i) => (
                    <li key={i} className="text-xs text-cosmic-400 hover:text-gold-400 transition-colors leading-snug cursor-default">
                      <span className="text-gold-600 mr-1">›</span>{h.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related articles */}
            {related.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gold-500 uppercase tracking-wider mb-3 px-1">Related Articles</h3>
                <div className="space-y-3">
                  {related.map(r => <RelatedCard key={r.id} article={r} />)}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="card-cosmic p-4 text-center">
              <div className="text-2xl mb-2">🔮</div>
              <p className="text-cosmic-300 text-xs mb-3">Get personalised insights from your birth chart</p>
              <Link to="/kundali" className="btn-cosmic w-full py-2 text-xs block">Generate Free Kundali</Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
