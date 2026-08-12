import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import AstrologerCard from './AstrologerCard';
import { astrologers as astrologersApi } from '../api';

/**
 * The "Connect with Your Cosmic Guide" band that used to sit on the homepage
 * between "How It Works" and the tarot section. Lifted out whole so it can go
 * on any page later — it fetches its own astrologers, so there is nothing to
 * wire up.
 *
 *   import FeaturedAstrologers from '../components/FeaturedAstrologers';
 *   <FeaturedAstrologers />
 *
 * Overridable:
 *   <FeaturedAstrologers limit={3} heading="Talk to a Jyotishi" showAllLink={false} />
 *
 * It renders nothing at all until astrologers come back, so a page that carries
 * it never shows an empty band or a "Loading…" line to a visitor who did not ask
 * for one.
 */
export default function FeaturedAstrologers({
  limit       = 6,
  heading     = '✦ Connect with Your Cosmic Guide',
  subheading  = 'Expert Vedic astrologers, available now',
  showAllLink = true,
  className   = 'py-16 px-4 md:px-8 lg:px-16 relative z-10',
}) {
  const [list, setList] = useState([]);

  useEffect(() => {
    let alive = true;
    astrologersApi.getAll({ limit })
      .then(r => { if (alive) setList(r.data.astrologers || []); })
      .catch(() => {});
    return () => { alive = false; };
  }, [limit]);

  if (list.length === 0) return null;

  return (
    <section className={className}>
      <div className="max-w-7xl mx-auto">
        {(heading || subheading) && (
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-12">
            {heading && <h2 className="font-serif text-4xl md:text-5xl text-gold-400 mb-3">{heading}</h2>}
            {subheading && <p className="text-gray-300">{subheading}</p>}
          </motion.div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {list.map((a, i) => (
            <motion.div key={a.id}
              initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
              transition={{delay:i*0.1}}>
              <AstrologerCard astrologer={a} />
            </motion.div>
          ))}
        </div>
        {showAllLink && (
          <div className="text-center">
            <Link to="/astrologers" className="btn-outline-gold px-8 py-3 text-sm inline-flex items-center gap-2">
              View All Astrologers <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
