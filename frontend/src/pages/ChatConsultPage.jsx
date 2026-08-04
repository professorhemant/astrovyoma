import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { consultations as consultationsApi, wallet as walletApi } from '../api';
import { useAuth } from '../context/AuthContext';

const SUGGESTIONS = [
  'What does my Kundali say about my career?',
  'When will I get married according to my chart?',
  'What is my current Mahadasha and what does it mean?',
  'Are there any doshas in my Kundali?',
  'What are the remedies for my challenges?',
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-sm shrink-0">🔮</div>
      <div className="bg-cosmic-800 border border-gold-500/20 rounded-2xl rounded-bl-none px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-gold-400"
              animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, astrologerName }) {
  const isUser = msg.sender_type === 'user';
  const time   = new Date(msg.created_at || Date.now()).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${isUser ? 'bg-blue-500/20 text-blue-300' : 'bg-gold-500/20 text-gold-400'}`}>
        {isUser ? '👤' : '🔮'}
      </div>
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`text-[10px] text-cosmic-500 ${isUser ? 'text-right' : ''}`}>
          {isUser ? 'You' : astrologerName}
        </div>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-600/30 border border-blue-500/30 text-blue-100 rounded-br-none'
            : 'bg-cosmic-800 border border-gold-500/20 text-cosmic-100 rounded-bl-none'
        }`}>
          {msg.content}
        </div>
        <div className={`text-[10px] text-cosmic-600 ${isUser ? 'text-right' : ''}`}>{time}</div>
      </div>
    </motion.div>
  );
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function ChatConsultPage() {
  const { id: consultationId } = useParams();
  const [searchParams]         = useSearchParams();
  const navigate               = useNavigate();
  const { user }               = useAuth();

  const astrologerName  = searchParams.get('astrologer')   || 'Astrologer';
  const pricePerMin     = parseFloat(searchParams.get('price') || '30');
  const specialties     = JSON.parse(searchParams.get('specialties') || '[]');

  const [messages,   setMessages]   = useState([]);
  const [input,      setInput]      = useState('');
  const [typing,     setTyping]     = useState(false);
  const [sending,    setSending]    = useState(false);
  const [elapsed,    setElapsed]    = useState(0);
  const [balance,    setBalance]    = useState(parseFloat(user?.wallet_balance || 0));
  const [ended,      setEnded]      = useState(false);
  const [endSummary, setEndSummary] = useState(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const timerRef    = useRef(null);
  const pollRef     = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Timer
  useEffect(() => {
    if (ended) return;
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [ended]);

  // Poll messages every 4s (catch any out-of-sync state).
  // The server is the source of truth for persisted messages, but a naive
  // setMessages(data) clobbered local state: it wiped the client-only greeting
  // and, when an in-flight poll resolved just after a freshly-sent message or
  // AI reply was appended, it overwrote them with a staler list — so the reply
  // would blink in and then vanish until the next poll. Merge instead: take the
  // server rows (they carry stable UUID ids) and keep any optimistic messages
  // (numeric ids) that haven't shown up server-side yet. Return the previous
  // array unchanged when nothing differs, so we don't re-render / auto-scroll
  // every 4s while the user is reading.
  useEffect(() => {
    if (ended) return;
    const poll = async () => {
      try {
        const { data } = await consultationsApi.getMessages(consultationId);
        if (!Array.isArray(data)) return;
        setMessages(prev => {
          const serverKeys = new Set(data.map(m => `${m.sender_type}|${m.content}`));
          const pending = prev.filter(
            m => typeof m.id === 'number' && !serverKeys.has(`${m.sender_type}|${m.content}`)
          );
          const next = [...data, ...pending];
          const same = next.length === prev.length
            && next.every((m, i) => prev[i] && prev[i].id === m.id && prev[i].content === m.content);
          return same ? prev : next;
        });
      } catch {}
    };
    poll();
    pollRef.current = setInterval(poll, 4000);
    return () => clearInterval(pollRef.current);
  }, [consultationId, ended]);

  // Load wallet balance
  useEffect(() => {
    walletApi.getBalance().then(r => setBalance(parseFloat(r.data.balance))).catch(() => {});
  }, []);

  // Opening greeting from the astrologer. It is not persisted server-side, so
  // it is rendered as a static bubble (below) rather than stored in `messages`
  // — otherwise the 4s poll, which mirrors the server, would erase it.
  const greeting = useMemo(() => ({
    id:          'greeting',
    sender_type: 'astrologer',
    content:     `Namaste! I am ${astrologerName}${specialties.length ? `, specialising in ${specialties.slice(0, 2).join(' & ')}` : ''}. How may I guide you today? Please feel free to share your question — I'm here to help.`,
    created_at:  new Date().toISOString()
  }), [astrologerName, specialties]);

  const minsRemaining = balance / pricePerMin;

  const sendMessage = useCallback(async (text) => {
    const content = (text || input).trim();
    if (!content || sending || ended) return;
    setSending(true);
    setInput('');
    setShowSuggestions(false);

    // Optimistic user message
    const userMsg = { id: Date.now(), sender_type: 'user', content, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);

    try {
      // Persist user message
      await consultationsApi.sendMessage(consultationId, { content });

      // Show typing indicator and get AI reply
      setTyping(true);
      const { data } = await consultationsApi.aiReply(consultationId, {
        message: content,
        astrologer_name: astrologerName,
        astrologer_specialties: specialties,
      });

      const astroMsg = {
        id:          Date.now() + 1,
        sender_type: 'astrologer',
        content:     data.reply,
        created_at:  new Date().toISOString()
      };
      setMessages(prev => [...prev, astroMsg]);
    } catch (err) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setTyping(false);
      setSending(false);
      inputRef.current?.focus();
    }
  }, [input, sending, ended, consultationId, astrologerName, specialties]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleEndSession = async () => {
    setShowEndModal(false);
    clearInterval(timerRef.current);
    clearInterval(pollRef.current);
    try {
      const { data } = await consultationsApi.end(consultationId);
      setEnded(true);
      setEndSummary(data);
    } catch {
      toast.error('Failed to end session properly.');
      setEnded(true);
    }
  };

  if (ended && endSummary) {
    const cost = parseFloat(endSummary.total_cost || 0).toFixed(2);
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="card-cosmic p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✦</div>
          <h2 className="text-gold-400 font-serif text-2xl mb-2">Session Complete</h2>
          <p className="text-cosmic-300 text-sm mb-6">Your consultation with {astrologerName} has ended.</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card-cosmic p-3">
              <div className="text-xs text-cosmic-500 mb-1">Duration</div>
              <div className="text-gold-400 font-semibold">{formatTime(elapsed)}</div>
            </div>
            <div className="card-cosmic p-3">
              <div className="text-xs text-cosmic-500 mb-1">Amount Deducted</div>
              <div className="text-gold-400 font-semibold">₹{cost}</div>
            </div>
          </div>
          <p className="text-cosmic-400 text-xs mb-6 italic">
            "The stars illuminated your path today. May cosmic wisdom guide you forward."
          </p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/astrologers')} className="flex-1 btn-cosmic py-2.5 text-sm">
              More Astrologers
            </button>
            <button onClick={() => navigate('/history')} className="flex-1 py-2.5 text-sm border border-gold-500/30 text-gold-400 rounded-xl hover:bg-gold-500/10 transition-colors">
              View History
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ paddingTop: 0 }}>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-cosmic-950/95 backdrop-blur-xl border-b border-gold-500/20 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => setShowEndModal(true)} className="text-cosmic-400 hover:text-red-400 transition-colors text-sm p-1">
            ✕
          </button>
          <div className="w-9 h-9 rounded-full bg-gold-500/20 flex items-center justify-center text-lg shrink-0">🔮</div>
          <div className="flex-1 min-w-0">
            <div className="text-cosmic-100 font-medium text-sm truncate">{astrologerName}</div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <span className="text-xs text-emerald-400">Online</span>
              {specialties.slice(0, 2).map(s => (
                <span key={s} className="text-xs text-cosmic-500 hidden sm:inline">{s}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 text-right">
            <div className="hidden sm:block">
              <div className="text-xs text-cosmic-500">Balance</div>
              <div className={`text-sm font-semibold ${minsRemaining < 5 ? 'text-red-400' : 'text-gold-400'}`}>
                ₹{balance.toFixed(0)}
              </div>
            </div>
            <div>
              <div className="text-xs text-cosmic-500">Time</div>
              <div className="text-sm font-mono font-semibold text-cosmic-200">{formatTime(elapsed)}</div>
            </div>
            <div className="hidden sm:block">
              <div className="text-xs text-cosmic-500">Rate</div>
              <div className="text-xs text-cosmic-300">₹{pricePerMin}/min</div>
            </div>
          </div>
        </div>
      </div>

      {/* Low balance warning */}
      <AnimatePresence>
        {minsRemaining < 5 && minsRemaining > 0 && (
          <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="fixed top-[62px] left-0 right-0 z-40 bg-amber-500/20 border-b border-amber-500/30 text-amber-300 text-xs text-center py-2 px-4">
            ⚠ Less than {Math.ceil(minsRemaining)} minute{minsRemaining < 2 ? '' : 's'} of balance remaining.{' '}
            <button onClick={() => navigate('/wallet')} className="underline font-medium">Recharge now</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-28" style={{ paddingTop:'80px' }}>
        <div className="max-w-2xl mx-auto py-4">

          {/* Rate info chip */}
          <div className="text-center mb-4">
            <span className="text-xs text-cosmic-600 bg-cosmic-900 px-3 py-1 rounded-full border border-cosmic-800">
              ₹{pricePerMin}/min · Chat with {astrologerName}
            </span>
          </div>

          <MessageBubble key="greeting" msg={greeting} astrologerName={astrologerName} />

          {messages.map((msg, i) => (
            <MessageBubble key={msg.id || i} msg={msg} astrologerName={astrologerName} />
          ))}

          {typing && <TypingIndicator />}

          {/* Suggestion chips — shown only before first user message */}
          {showSuggestions && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-cosmic-500 text-center mb-2">Quick questions to get started:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i}
                    onClick={() => sendMessage(s)}
                    disabled={sending}
                    className="text-xs px-3 py-2 rounded-xl border border-gold-500/30 text-gold-400 bg-gold-500/5 hover:bg-gold-500/15 transition-all disabled:opacity-50">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-cosmic-950/95 backdrop-blur-xl border-t border-gold-500/20 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending || ended}
                placeholder="Ask your question… (Enter to send)"
                rows={1}
                className="w-full bg-cosmic-900 border border-gold-500/20 rounded-2xl px-4 py-3 text-sm text-cosmic-100 placeholder-cosmic-600 resize-none focus:outline-none focus:border-gold-500/50 transition-colors"
                style={{ minHeight:'44px', maxHeight:'120px' }}
                onInput={e => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || sending || ended}
              className="w-11 h-11 rounded-full bg-gold-500 hover:bg-gold-400 text-cosmic-950 flex items-center justify-center text-lg font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
              {sending ? (
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease:'linear' }} className="block text-sm">✦</motion.span>
              ) : '↑'}
            </button>
            <button
              onClick={() => setShowEndModal(true)}
              className="px-4 h-11 rounded-xl border border-red-500/40 text-red-400 text-xs hover:bg-red-500/10 transition-all shrink-0">
              End
            </button>
          </div>
        </div>
      </div>

      {/* End Session Modal */}
      <AnimatePresence>
        {showEndModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }}
              className="card-cosmic p-6 max-w-sm w-full text-center">
              <div className="text-3xl mb-3">⏸</div>
              <h3 className="text-gold-400 font-serif text-lg mb-2">End this session?</h3>
              <p className="text-cosmic-400 text-sm mb-2">
                Duration so far: <span className="text-cosmic-200 font-medium">{formatTime(elapsed)}</span>
              </p>
              <p className="text-cosmic-400 text-sm mb-6">
                Estimated cost: <span className="text-gold-400 font-medium">₹{(Math.ceil(elapsed / 60) * pricePerMin).toFixed(0)}</span>
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowEndModal(false)} className="flex-1 py-2.5 text-sm border border-cosmic-700 text-cosmic-300 rounded-xl hover:bg-white/5 transition-colors">
                  Continue
                </button>
                <button onClick={handleEndSession} className="flex-1 py-2.5 text-sm bg-red-600/80 hover:bg-red-600 text-white rounded-xl transition-colors">
                  End Session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
