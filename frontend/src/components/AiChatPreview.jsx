import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Sparkles } from 'lucide-react';

/**
 * The "Talk to AstroVyoma AI" band that used to sit on the homepage. Lifted out
 * whole so it can go on any page later:
 *
 *   import AiChatPreview from '../components/AiChatPreview';
 *   <AiChatPreview />
 *
 * Worth knowing before it goes anywhere: this is a mock-up, not the chat. The
 * three messages are fixed text, and the only live thing is the button, which
 * goes to /chat — the real page, which works. So it sells the feature, it does
 * not deliver it, and it should never sit somewhere a visitor might mistake it
 * for a working chat box.
 */
export default function AiChatPreview({
  heading    = 'Talk to AstroVyoma AI ✦',
  subheading = 'Powered by Vedic wisdom + AI — Your birth chart as context',
  ctaLabel   = 'Start Chatting Free →',
  ctaTo      = '/chat',
  className  = 'py-16 px-4 md:px-8 lg:px-16 relative z-10',
}) {
  return (
    <section className={className}>
      <div className="max-w-4xl mx-auto">
        {(heading || subheading) && (
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-10">
            {heading && <h2 className="font-serif text-4xl md:text-5xl text-gold-400 mb-3">{heading}</h2>}
            {subheading && <p className="text-gray-400 text-sm">{subheading}</p>}
          </motion.div>
        )}
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="card-cosmic p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gold-600/10">
            <div className="w-10 h-10 rounded-full bg-cosmic-800 border border-gold-600/40 flex items-center justify-center text-gold-400">✦</div>
            <div>
              <div className="text-gold-400 font-medium text-sm">AstroVyoma AI</div>
              <div className="text-green-400 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Online
              </div>
            </div>
          </div>
          <div className="space-y-4 mb-6">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-cosmic-800 border border-gold-600/30 flex items-center justify-center text-gold-400 text-xs flex-shrink-0">✦</div>
              <div className="bg-cosmic-800/80 border border-gold-600/15 rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm">
                <p className="text-gray-300 text-sm">Namaste 🙏 I am AstroVyoma AI, your personal Vedic astrology guide. With your birth chart as my guide, I can reveal your Nakshatra, current Dasha, life purpose, and cosmic timing. What would you like to know?</p>
              </div>
            </div>
            <div className="flex gap-3 flex-row-reverse">
              <div className="bg-gold-600/20 border border-gold-600/30 rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs">
                <p className="text-gray-200 text-sm">What does my current Mahadasha mean for my career?</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-cosmic-800 border border-gold-600/30 flex items-center justify-center text-gold-400 text-xs flex-shrink-0">✦</div>
              <div className="bg-cosmic-800/80 border border-gold-600/15 rounded-2xl rounded-tl-sm px-4 py-3 max-w-lg">
                <p className="text-gray-300 text-sm">Your current Jupiter Mahadasha (Brihaspati Dasha) is a period of great expansion. Jupiter is activating your 10th house of career and public recognition...</p>
                <p className="text-gold-500 text-xs mt-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Personalized with your Kundali</p>
              </div>
            </div>
          </div>
          <Link to={ctaTo} className="btn-gold w-full py-3 text-sm flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" /> {ctaLabel}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
