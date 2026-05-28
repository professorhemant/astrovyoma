import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Send, Sparkles, RefreshCw, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';
import SwastikBorder from '../components/SwastikBorder';
import ChatMessage from '../components/ChatMessage';
import { chatbot as chatbotApi, kundali as kundaliApi } from '../api';
import { useAuth } from '../context/AuthContext';

const SUGGESTED_QUESTIONS = [
  { hi: 'मेरा जीवन उद्देश्य क्या है?', en: 'Life Purpose' },
  { hi: 'मेरी कुण्डली में प्रेम का योग?', en: 'Love & Marriage' },
  { hi: 'मेरे लिए सर्वोत्तम करियर?', en: 'Career Path' },
  { hi: 'मेरा महादशा क्या बताती है?', en: 'Current Mahadasha' },
  { hi: 'मेरे नक्षत्र का प्रभाव?', en: 'My Nakshatra' },
  { hi: 'मेरी सबसे बड़ी शक्तियाँ?', en: 'Strengths' },
];

export default function ChatbotPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [kundali, setKundali] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (user) {
      kundaliApi.getMyKundali().then(res => setKundali(res.data)).catch(() => {});
    }
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `नमस्ते 🙏 मैं AstroVyoma AI हूँ — आपका व्यक्तिगत वैदिक ज्योतिष मार्गदर्शक।\n\n${user ? (kundali ? `मैं आपकी कुण्डली देख सकता हूँ — ${kundali?.lagna} लग्न, ${kundali?.moon_sign} में चंद्रमा, ${kundali?.nakshatra} नक्षत्र। आपकी जन्मपत्री में गहरा ज्ञान छिपा है।` : 'एक बार अपनी मुफ्त कुण्डली बनाएं — फिर मैं आपकी वास्तविक ग्रह स्थिति के आधार पर व्यक्तिगत मार्गदर्शन दे सकता हूँ।') : 'बेहतर अनुभव के लिए लॉगिन करें और अपनी कुण्डली बनाएं। मैं सामान्य ज्योतिष प्रश्नों का उत्तर भी दे सकता हूँ!'}\n\nआप क्या जानना चाहते हैं?`,
      created_at: new Date().toISOString()
    }]);
  }, [user]);

  async function handleSend(messageText) {
    const text = messageText || input.trim();
    if (!text) return;
    if (!user) { toast.error('Please login to chat with AstroVyoma AI'); navigate('/login'); return; }

    setInput('');
    const userMsg = { id: Date.now(), role: 'user', content: text, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);
    setLoading(true);

    try {
      const res = await chatbotApi.chat(text);
      const aiMsg = { id: Date.now() + 1, role: 'assistant', content: res.data.response, created_at: new Date().toISOString() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = { id: Date.now() + 1, role: 'assistant', content: 'I apologize — the cosmic signal was interrupted. Please try again. If your Anthropic API key is not configured, add it to the backend .env file.', created_at: new Date().toISOString() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setTyping(false);
      setLoading(false);
    }
  }

  async function clearChat() {
    try { await chatbotApi.clearHistory(); } catch {}
    setMessages([{
      id: 'welcome-new',
      role: 'assistant',
      content: 'Chat cleared. Ask me anything about your Vedic birth chart and cosmic path. 🙏',
      created_at: new Date().toISOString()
    }]);
  }

  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: '#0d0726' }}>
      <SwastikBorder />

      {/* Cosmic nebula background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse at 15% 25%, rgba(80,20,180,0.45) 0%, transparent 40%),
            radial-gradient(ellipse at 85% 70%, rgba(40,10,130,0.4) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 50%, rgba(60,5,110,0.2) 0%, transparent 55%)
          `
        }} />
      </div>

      <div className="relative z-10 flex flex-col h-screen pt-16">

        {/* ── Premium Header ── */}
        <div className="flex-shrink-0 px-4 md:px-8 py-4 border-b border-gold-600/15 backdrop-blur-md"
          style={{ background: 'linear-gradient(to right, rgba(45,14,98,0.85), rgba(18,9,60,0.9))' }}>
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Animated AI avatar */}
              <div className="relative w-11 h-11 flex-shrink-0">
                <div className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{ background: 'radial-gradient(circle at 35% 35%, rgba(201,168,76,0.35) 0%, rgba(60,10,120,0.8) 100%)', border: '2px solid rgba(201,168,76,0.6)' }}>
                  <motion.span className="text-gold-400 text-xl"
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>✦</motion.span>
                </div>
                {/* Online pulse */}
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-cosmic-900"
                  style={{ background: '#22c55e' }} />
              </div>

              <div>
                <div className="font-serif text-gold-400 text-base font-semibold leading-tight">AstroVyoma AI</div>
                <div className="text-xs flex items-center gap-1.5 mt-0.5">
                  <span className="text-green-400">● Online</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400">
                    {kundali ? `${kundali.lagna} लग्न • ${kundali.nakshatra} नक्षत्र` : 'Vedic AI • Claude powered'}
                  </span>
                </div>
              </div>
            </div>

            <button onClick={clearChat} title="Clear chat"
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gold-600/10 transition-colors text-gray-400 hover:text-gold-400">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Pandit Ji upgrade banner ── */}
        <Link to="/pandit"
          className="flex-shrink-0 flex items-center justify-between px-4 md:px-8 py-2.5 border-b transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(to right,rgba(100,35,5,0.5),rgba(50,15,2,0.6))', borderColor: 'rgba(201,168,76,0.15)' }}>
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🙏</span>
            <div>
              <span className="text-xs font-semibold" style={{ color: '#F5A623' }}>पंडित AI जी से बात करें</span>
              <span className="text-[10px] ml-2" style={{ color: '#9A7040' }}>— Live avatar • हिंदी voice • Vedic persona</span>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
            style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.35)', color: '#E8C547' }}>
            Try Now →
          </span>
        </Link>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map(msg => (
              <ChatMessage
                key={msg.id}
                message={{ content: msg.content }}
                isUser={msg.role === 'user'}
                senderName={msg.role === 'assistant' ? 'AstroVyoma AI' : null}
                avatarUrl={null}
              />
            ))}

            {typing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-cosmic-800/80 border border-gold-600/30 flex items-center justify-center text-gold-400 text-sm flex-shrink-0">✦</div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm"
                  style={{ background: 'rgba(45,14,98,0.6)', border: '1px solid rgba(201,168,76,0.15)' }}>
                  <div className="flex gap-1 items-center h-5">
                    {[0, 0.18, 0.36].map(delay => (
                      <motion.div key={delay}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 0.75, delay }}
                        className="w-2 h-2 rounded-full"
                        style={{ background: '#C9A84C', opacity: 0.7 }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ── Suggested Questions ── */}
        {messages.length <= 1 && (
          <div className="flex-shrink-0 px-4 md:px-8 pb-3">
            <div className="max-w-3xl mx-auto">
              <p className="text-gray-400 text-xs text-center mb-2.5">✦ त्वरित प्रश्न चुनें</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTED_QUESTIONS.map(q => (
                  <button key={q.en} onClick={() => handleSend(q.hi)}
                    className="flex flex-col items-center px-4 py-2 rounded-xl text-xs transition-all hover:scale-105"
                    style={{ background: 'rgba(45,14,98,0.7)', border: '1px solid rgba(201,168,76,0.3)', minWidth: '90px' }}>
                    <span className="text-gold-400 font-medium leading-tight">{q.en}</span>
                    <span className="text-gray-300 text-[10px] mt-0.5 leading-tight">{q.hi}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Input Bar ── */}
        <div className="flex-shrink-0 px-4 md:px-8 py-4 border-t border-gold-600/10 backdrop-blur-md"
          style={{ background: 'linear-gradient(to right, rgba(45,14,98,0.7), rgba(18,9,60,0.8))' }}>
          {!user && (
            <div className="text-center mb-3">
              <p className="text-gray-300 text-xs">
                <button onClick={() => navigate('/login')} className="text-gold-400 hover:text-gold-300 font-medium">Login करें</button>
                {' '} — व्यक्तिगत ज्योतिष मार्गदर्शन के लिए
              </p>
            </div>
          )}
          <div className="flex gap-2 max-w-3xl mx-auto">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder={user ? 'अपना प्रश्न पूछें — प्रेम, करियर, स्वास्थ्य, भविष्य...' : 'AstroVyoma AI से बात करने के लिए login करें'}
              disabled={!user || loading}
              className="flex-1 text-gray-200 text-sm focus:outline-none disabled:opacity-50 px-5 py-3 rounded-full"
              style={{ background: 'rgba(15,7,40,0.9)', border: '1px solid rgba(201,168,76,0.25)' }}
            />
            <button onClick={() => handleSend()} disabled={!user || loading || !input.trim()}
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all hover:scale-105"
              style={{ background: input.trim() && user ? 'linear-gradient(135deg,#C9A84C,#E8D060)' : 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)' }}>
              <Send className="w-4 h-4" style={{ color: input.trim() && user ? '#12093A' : '#C9A84C' }} />
            </button>
          </div>
          <p className="text-center text-gray-500 text-[10px] mt-2">
            Vedic wisdom • Powered by Claude AI • आपकी कुण्डली context में
          </p>
        </div>
      </div>
    </div>
  );
}
