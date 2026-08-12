import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Send, Mic, MicOff, Video, VideoOff, PhoneOff, Clock, Wallet, Star } from 'lucide-react';
import ChatMessage from '../components/ChatMessage';
import { consultations as consultationsApi, reviews as reviewsApi } from '../api';
import { useAuth } from '../context/AuthContext';

const ASTROLOGER_REPLIES = [
  "I can see this clearly in your chart. The planetary configuration at your birth strongly suggests a period of transformation ahead.",
  "Your question touches a deep area of your chart. Saturn's position indicates discipline is the key to unlocking this area of your life.",
  "The Nakshatra energy you carry gives me insight here. Your current Dasha period is deeply relevant — the cosmos is speaking to you.",
  "Jupiter's transit over your natal Moon brings expansion and opportunity. This is a favorable time for the matter you've asked about.",
  "The Lagna lord's placement shows clearly that your inner strength is your greatest resource right now. Trust it.",
  "I sense the weight of this question. Your Rahu-Ketu axis shows exactly where the karmic tension in this matter lies.",
  "Looking at your 7th house and Venus placement, the answer your heart already knows is the correct one.",
  "The cosmic timing here is significant. Your Mahadasha lord is giving you exactly the experience needed for your soul's growth.",
];

function AudioWaveform({ active }) {
  const bars = [4, 7, 5, 9, 6, 8, 4, 10, 7, 5, 9, 6];
  return (
    <div className="flex gap-0.5 items-end h-8">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          animate={active ? { height: [h, h * 2.5, h] } : { height: 3 }}
          transition={{ repeat: Infinity, duration: 0.5 + i * 0.03, delay: i * 0.05, ease: 'easeInOut' }}
          className="w-1.5 bg-gold-400 rounded-full"
          style={{ height: h }}
        />
      ))}
    </div>
  );
}

export default function ConsultationPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const mode = searchParams.get('mode') || 'chat';
  const channel = searchParams.get('channel');
  const agoraToken = searchParams.get('token');
  const appId = searchParams.get('appId');
  const astrologerName = searchParams.get('astrologer') || 'Astrologer';
  const astrologerId = searchParams.get('astrologerId') || null;
  const astrologerSpecialties = searchParams.get('specialties') ? JSON.parse(searchParams.get('specialties')) : [];
  const pricePerMin = parseFloat(searchParams.get('price') || '30');

  const [messages, setMessages] = useState([{
    id: 'welcome',
    sender_type: 'astrologer',
    content: `Namaste 🙏 I am ${astrologerName}. The cosmos has guided you here for a reason. Please share what is on your mind and heart — I am fully present with you.`,
    created_at: new Date().toISOString()
  }]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [agoraConnected, setAgoraConnected] = useState(false);
  const [demoMediaActive, setDemoMediaActive] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [rating, setRating] = useState(0);
  const [showRating, setShowRating] = useState(false);

  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const agoraClientRef = useRef(null);
  const localTracksRef = useRef([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Start media on mount for audio/video modes
  useEffect(() => {
    if (mode === 'video' || mode === 'audio') {
      const hasRealAgora = appId && appId !== 'dev-app-id' && channel;
      if (hasRealAgora) {
        initAgora();
      } else {
        startDemoMedia();
      }
    }
    return () => {
      cleanupMedia();
    };
  }, []);

  async function startDemoMedia() {
    try {
      const constraints = mode === 'video'
        ? { video: true, audio: true }
        : { audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      if (localVideoRef.current && mode === 'video') {
        localVideoRef.current.srcObject = stream;
      }
      setDemoMediaActive(true);
      toast.success(mode === 'video' ? 'Camera & mic ready' : 'Microphone ready');
    } catch (err) {
      toast.error('Could not access ' + (mode === 'video' ? 'camera/mic' : 'microphone') + '. Check browser permissions.');
    }
  }

  async function initAgora() {
    try {
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      agoraClientRef.current = client;

      client.on('user-published', async (remoteUser, mediaType) => {
        await client.subscribe(remoteUser, mediaType);
        if (mediaType === 'video') remoteUser.videoTrack?.play('remote-video-container');
        if (mediaType === 'audio') remoteUser.audioTrack?.play();
      });

      await client.join(appId, channel, agoraToken === 'null' ? null : agoraToken, null);
      const tracks = [];

      if (mode === 'audio' || mode === 'video') {
        const mic = await AgoraRTC.createMicrophoneAudioTrack();
        tracks.push(mic);
      }
      if (mode === 'video') {
        const cam = await AgoraRTC.createCameraVideoTrack();
        tracks.push(cam);
        cam.play('local-video-container');
      }

      await client.publish(tracks);
      localTracksRef.current = tracks;
      setAgoraConnected(true);
      setDemoMediaActive(true);
      toast.success('Connected to live session!');
    } catch (err) {
      console.error('Agora error:', err);
      toast.error('Live connection failed. Starting demo mode.');
      startDemoMedia();
    }
  }

  async function cleanupMedia() {
    clearInterval(timerRef.current);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }
    localTracksRef.current.forEach(t => { t.stop?.(); t.close?.(); });
    if (agoraClientRef.current) {
      await agoraClientRef.current.leave().catch(() => {});
    }
  }

  async function toggleMic() {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = micMuted; });
    }
    if (localTracksRef.current[0]) {
      micMuted ? await localTracksRef.current[0].setMuted(false) : await localTracksRef.current[0].setMuted(true);
    }
    setMicMuted(!micMuted);
    toast(micMuted ? 'Mic on' : 'Mic muted', { icon: micMuted ? '🎙️' : '🔇', duration: 1500 });
  }

  async function toggleCam() {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = camOff; });
    }
    const camTrack = localTracksRef.current.find(t => t.trackMediaType === 'video');
    if (camTrack) { camOff ? await camTrack.setMuted(false) : await camTrack.setMuted(true); }
    setCamOff(!camOff);
    toast(camOff ? 'Camera on' : 'Camera off', { icon: camOff ? '📷' : '🚫', duration: 1500 });
  }

  async function handleEndSession() {
    clearInterval(timerRef.current);
    await cleanupMedia();
    try { await consultationsApi.end(id); } catch {}
    setShowRating(true);
  }

  // handleSend is gone with the text panel below. It sent the seeker's question
  // to a language model prompted to answer as the astrologer by name, stored the
  // reply as if he had written it, and showed "<his name> is typing..." while it
  // generated. On a call screen, the conversation is the call.

  const formatTime = s => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const estimatedCost = (elapsed / 60 * pricePerMin).toFixed(2);

  if (showRating) {
    return (
      <div className="min-h-screen bg-cosmic-950 flex items-center justify-center px-4" style={{ background: 'radial-gradient(ellipse at top, #1a1060 0%, #0A0E2A 40%, #04051A 100%)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-cosmic-800/80 border border-gold-600/20 rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">🙏</div>
          <h2 className="font-serif text-2xl text-gold-400 mb-2">Session Complete</h2>
          <p className="text-gray-200 text-sm mb-1">Duration: {formatTime(elapsed)}</p>
          <p className="text-gray-200 text-sm mb-6">Consultation cost: ₹{estimatedCost}</p>
          <p className="text-gray-300 text-sm mb-4">Rate your experience with {astrologerName}</p>
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} onClick={() => setRating(s)} className="transition-transform hover:scale-110">
                <Star className={`w-8 h-8 ${s <= rating ? 'fill-gold-400 text-gold-400' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>
          <button onClick={async () => {
            if (rating > 0 && astrologerId) {
              try {
                await reviewsApi.submit({ consultation_id: id, astrologer_id: astrologerId, rating });
                toast.success('Thank you for your feedback!');
              } catch {}
            }
            navigate('/astrologers');
          }} className="w-full bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-semibold rounded-full py-3 hover:opacity-90 transition-opacity">
            {rating > 0 ? 'Submit & Continue' : 'Skip & Continue'}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-cosmic-950 flex flex-col" style={{ background: 'radial-gradient(ellipse at top, #1a1060 0%, #0A0E2A 40%, #04051A 100%)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gold-600/10 bg-cosmic-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-600/30 to-gold-400/10 border border-gold-600/40 flex items-center justify-center text-gold-400">✦</div>
          <div>
            <div className="text-gold-400 text-sm font-semibold">{astrologerName}</div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              <span className="text-green-400">{mode.charAt(0).toUpperCase() + mode.slice(1)} • Live</span>
              {agoraConnected && <span className="text-gold-500/60">• Agora</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1 text-gold-400 bg-gold-400/10 rounded-full px-3 py-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono font-medium">{formatTime(elapsed)}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-200">
            <Wallet className="w-3.5 h-3.5" />
            <span className="text-xs">₹{estimatedCost}</span>
          </div>
          <button onClick={handleEndSession}
            className="bg-red-500/20 border border-red-500/40 text-red-400 rounded-full px-3 py-1.5 text-xs hover:bg-red-500/30 transition-colors flex items-center gap-1">
            <PhoneOff className="w-3.5 h-3.5" /> End
          </button>
        </div>
      </div>

      {/* VIDEO MODE */}
      {mode === 'video' && (
        <div className="bg-black/40 border-b border-gold-600/10 p-3">
          <div className="flex gap-3 justify-center items-end">
            {/* Remote (astrologer) video */}
            <div id="remote-video-container" className="relative w-72 h-44 bg-cosmic-900 rounded-xl border border-gold-600/20 overflow-hidden flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-2">🔮</div>
                <p className="text-gray-300 text-xs px-4">Waiting for {astrologerName} to join...</p>
              </div>
              <div className="absolute top-2 left-2 text-xs bg-black/60 text-gray-300 px-2 py-0.5 rounded-full">{astrologerName}</div>
            </div>
            {/* Local (user) video */}
            <div className="relative w-28 h-20 bg-cosmic-900 rounded-xl border border-gold-500/30 overflow-hidden">
              {camOff ? (
                <div className="w-full h-full flex items-center justify-center bg-cosmic-800">
                  <VideoOff className="w-5 h-5 text-gray-300" />
                </div>
              ) : (
                <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
              )}
              <div className="absolute bottom-1 left-1 text-xs bg-black/60 text-gray-300 px-1.5 py-0.5 rounded-full">You</div>
            </div>
          </div>
          {/* Controls */}
          <div className="flex justify-center gap-3 mt-3">
            <button onClick={toggleMic}
              className={`p-2.5 rounded-full border transition-all ${micMuted ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'border-gold-600/30 text-gold-400 hover:bg-gold-400/10'}`}>
              {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button onClick={toggleCam}
              className={`p-2.5 rounded-full border transition-all ${camOff ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'border-gold-600/30 text-gold-400 hover:bg-gold-400/10'}`}>
              {camOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </button>
            <button onClick={handleEndSession}
              className="p-2.5 rounded-full bg-red-500/80 border border-red-500 text-white hover:bg-red-500 transition-all">
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
          {!demoMediaActive && (
            <p className="text-center text-gray-300 text-xs mt-2">Allow camera & mic access in your browser</p>
          )}
        </div>
      )}

      {/* AUDIO MODE */}
      {mode === 'audio' && (
        <div className="bg-black/30 border-b border-gold-600/10 py-5 px-4">
          <div className="flex items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-cosmic-800 border-2 border-gold-600/40 flex items-center justify-center text-3xl shadow-lg shadow-gold-500/10">🔮</div>
              <span className="text-gold-400 text-xs font-medium">{astrologerName}</span>
              <span className="text-gray-300 text-xs">Waiting to join...</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <AudioWaveform active={demoMediaActive && !micMuted} />
              <div className={`text-xs font-medium ${demoMediaActive ? 'text-green-400' : 'text-gray-300'}`}>
                {demoMediaActive ? (micMuted ? 'Muted' : 'Live') : 'Connecting...'}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-cosmic-800 border-2 border-gold-500/60 flex items-center justify-center text-3xl shadow-lg shadow-gold-500/10">👤</div>
              <span className="text-gray-300 text-xs font-medium">You</span>
              <span className={`text-xs ${micMuted ? 'text-red-400' : 'text-green-400'}`}>{micMuted ? '🔇 Muted' : '🎙️ Speaking'}</span>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <button onClick={toggleMic}
              className={`p-3 rounded-full border-2 transition-all ${micMuted ? 'bg-red-500/20 border-red-500 text-red-400' : 'border-gold-500/50 text-gold-400 hover:bg-gold-400/10'}`}>
              {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button onClick={handleEndSession}
              className="p-3 rounded-full bg-red-500 border-2 border-red-400 text-white hover:bg-red-600 transition-all">
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* The text panel that sat here — messages, a send box, and a
          "<astrologer> is typing..." indicator — was answered by a language
          model writing in his name. It is gone rather than fixed: on a voice or
          video call the conversation happens on the call. */}
      <div className="flex-1 flex items-end justify-center p-4">
        <p className="text-center text-gray-500 text-xs max-w-sm">
          You are connected to {astrologerName} by {mode === 'video' ? 'video' : 'voice'}.
          <br />
          ₹{pricePerMin}/min • Session active
        </p>
      </div>
    </div>
  );
}
