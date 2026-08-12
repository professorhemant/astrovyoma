import React from 'react';
import { motion } from 'framer-motion';

/**
 * The video section that used to sit on the homepage between "How It Works" and
 * "Connect with Your Cosmic Guide". Lifted out whole so it can be dropped onto
 * any other page later — nothing here depends on the homepage.
 *
 * It was taken off the homepage because /astro.mp4 is 6 MB and every visitor
 * downloaded it before they had asked for anything. Wherever it goes next,
 * prefer a page people choose to open, and compress the file first.
 *
 * Drop it in with:
 *   import VideoShowcase from '../components/VideoShowcase';
 *   <VideoShowcase />
 *
 * Everything is overridable:
 *   <VideoShowcase src="/tour.mp4" heading="A tour of your kundali" autoPlay={false} />
 */
export default function VideoShowcase({
  src        = '/astro.mp4',
  eyebrow    = 'Experience',
  heading    = 'See AstroVyoma in Action',
  subheading = 'Ancient wisdom, beautifully decoded',
  autoPlay   = true,
  className  = 'py-16 px-4 md:px-8 lg:px-16 relative z-10',
}) {
  return (
    <section className={className}>
      <div className="max-w-5xl mx-auto">
        {(eyebrow || heading || subheading) && (
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-10">
            {eyebrow && <p className="text-gold-600 text-xs uppercase tracking-widest mb-2">{eyebrow}</p>}
            {heading && <h2 className="font-serif text-4xl md:text-5xl text-gold-400 mb-3">{heading}</h2>}
            {subheading && <p className="text-gray-400 text-sm">{subheading}</p>}
          </motion.div>
        )}
        <motion.div initial={{opacity:0,scale:0.97}} whileInView={{opacity:1,scale:1}} viewport={{once:true}}
          transition={{duration:0.6}}
          className="relative rounded-2xl overflow-hidden border border-gold-600/20 shadow-[0_0_60px_rgba(201,168,76,0.12)]">
          {/* preload="none" so the file is only fetched once someone presses play */}
          <video src={src} autoPlay={autoPlay} muted loop playsInline controls
            preload={autoPlay ? 'auto' : 'none'} className="w-full block" />
          <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-inset ring-gold-600/10" />
        </motion.div>
      </div>
    </section>
  );
}
