import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Send, Mic, MicOff, Video, VideoOff, PhoneOff, Clock, Wallet, Star } from 'lucide-react';
import ChatMessage from '../components/ChatMessage';
import { consultations as consultationsApi, reviews as reviewsApi, markConsultationConnected, getConsultationStatus } from '../api';
import { useAuth } from '../context/AuthContext';

// ASTROLOGER_REPLIES lived here — eight canned lines served as if the
// astrologer had written them. Gone with the chat panel.

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

  // The transcript opened with a fabricated greeting signed in the astrologer's
  // name, before he had said anything. It went with the chat panel.
  const [messages, setMessages] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [agoraConnected, setAgoraConnected] = useState(false);
  // Whether the astrologer has actually joined. Drives the meter and the notice.
  const [astrologerJoined, setAstrologerJoined] = useState(false);
  // What went wrong, if anything: 'mic' (no microphone or permission refused)
  // or 'connect' (the call itself could not be set up). Null while fine.
  const [failure, setFailure] = useState(null);
  const [ending, setEnding] = useState(false);
  // 'declined' | 'missed' | 'ended' — decided by the astrologer or the clock.
  const [outcome, setOutcome] = useState(null);
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

  // While waiting to be picked up, watch the consultation itself. The astrologer
  // declining, or letting it ring out, happens entirely server-side — without
  // this the seeker would sit on "Connecting…" with no way to learn otherwise.
  useEffect(() => {
    if (astrologerJoined || outcome) return;
    const t = setInterval(async () => {
      try {
        const { data } = await getConsultationStatus(id);
        if (data.status === 'declined') { setOutcome('declined'); clearInterval(t); }
        else if (data.status === 'missed') { setOutcome('missed'); clearInterval(t); }
        else if (data.status === 'completed') { setOutcome('ended'); clearInterval(t); }
      } catch { /* a dropped poll is not worth surfacing */ }
    }, 3000);
    return () => clearInterval(t);
  }, [id, astrologerJoined, outcome]);

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
      setFailure(null);
      toast.success(mode === 'video' ? 'Camera & mic ready' : 'Microphone ready');
    } catch (err) {
      setFailure('mic');
      toast.error(
        mode === 'video'
          ? 'AstroVyoma needs your camera and microphone. Allow them in your browser, then try again.'
          : 'AstroVyoma needs your microphone. Allow it in your browser, then try again.'
      );
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
        // The astrologer is really here. This is what starts the meter — the
        // seeker's own join does not, because joining an empty channel and
        // waiting is not a consultation. Server-side it is idempotent, so
        // firing again when a camera comes on cannot restart the clock.
        markConsultationConnected(id).catch(() => {});
        setAstrologerJoined(true);
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
      // A blocked microphone throws here too, and reporting it as a connection
      // failure sent the seeker off checking their internet. Name it correctly,
      // and do not say "demo mode" — there is no such thing as a demo on a call
      // somebody is paying for.
      const name = String(err?.name || '');
      const micProblem = /NotAllowedError|NotFoundError|NotReadableError|PermissionDenied/i.test(name);
      if (micProblem) {
        setFailure('mic');
        toast.error(
          mode === 'video'
            ? 'AstroVyoma needs your camera and microphone. Allow them in your browser, then try again.'
            : 'AstroVyoma needs your microphone. Allow it in your browser, then try again.'
        );
      } else {
        setFailure('connect');
        toast.error('Could not connect the call. You have not been charged.');
        startDemoMedia();
      }
    }
  }

  async function cleanupMedia() {
    clearInterval(timerRef.current);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }
    localTracksRef.current.forEach(t => { try { t.stop?.(); t.close?.(); } catch {} });
    if (agoraClientRef.current) {
      // leave() can sit forever when the join never completed — which is
      // precisely the state somebody is in when they give up on a call that
      // would not connect. handleEndSession awaited this, so a hung leave() made
      // the End button look dead. Race it and move on regardless: the tracks
      // above are already stopped, so the microphone is released either way.
      await Promise.race([
        agoraClientRef.current.leave().catch(() => {}),
        new Promise(resolve => setTimeout(resolve, 2000)),
      ]);
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
    if (ending) return;
    setEnding(true);
    clearInterval(timerRef.current);

    // Close the session on the server first. Tidying up the microphone and the
    // Agora client matters less than the seeker getting out of a call that is
    // going nowhere, and it must never be what stands between them and the exit.
    try { await consultationsApi.end(id); } catch {}
    setShowRating(true);
    cleanupMedia().catch(() => {});
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
            <button onClick={handleEndSession} disabled={ending}
              title={ending ? 'Ending…' : 'End call'}
              className="p-2.5 rounded-full bg-red-500/80 border border-red-500 text-white hover:bg-red-500 transition-all disabled:opacity-60">
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
          {failure && (
            <p className="text-center text-amber-300/90 text-xs mt-2 max-w-md mx-auto">
              {failure === 'mic'
                ? 'Your browser is blocking the camera or microphone. Look for the padlock in the address bar, allow them, then reload this page.'
                : 'The call could not be set up. Try again in a moment.'}
              {' '}You are not being charged.
            </p>
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
              <span className={`text-xs ${astrologerJoined ? 'text-green-400' : 'text-gray-300'}`}>
                {astrologerJoined ? 'Joined' : 'Waiting to join…'}
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <AudioWaveform active={astrologerJoined && demoMediaActive && !micMuted} />
              {/* This read "Live" in green as soon as the seeker's own mic
                  worked, while nobody was on the other end. It now reports the
                  call, not the microphone. */}
              <div className={`text-xs font-medium ${
                failure ? 'text-red-400' : astrologerJoined ? 'text-green-400' : 'text-gray-300'
              }`}>
                {failure === 'mic' ? 'No microphone'
                  : failure === 'connect' ? 'Not connected'
                  : astrologerJoined ? (micMuted ? 'Muted' : 'Live')
                  : 'Connecting…'}
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
            <button onClick={handleEndSession} disabled={ending}
              title={ending ? 'Ending…' : 'End call'}
              className="p-3 rounded-full bg-red-500 border-2 border-red-400 text-white hover:bg-red-600 transition-all disabled:opacity-60">
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
        {astrologerJoined ? (
          <p className="text-center text-gray-500 text-xs max-w-sm">
            You are connected to {astrologerName} by {mode === 'video' ? 'video' : 'voice'}.
            <br />
            ₹{pricePerMin}/min • charging from the moment they joined
          </p>
        ) : outcome ? (
          // Decided by the astrologer or the ring timer, not by anything on this
          // screen — so it has to be said here or the seeker never learns it.
          <div className="text-center max-w-sm">
            <p className="text-amber-300 text-sm font-medium">
              {outcome === 'declined'
                ? `${astrologerName} cannot take the call right now.`
                : outcome === 'missed'
                  ? `${astrologerName} did not pick up.`
                  : 'This consultation has ended.'}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              You have not been charged. Book a time instead and we will arrange it.
            </p>
            <button onClick={handleEndSession} disabled={ending}
              className="btn-gold px-5 py-2 rounded-full text-xs font-semibold mt-3 disabled:opacity-60">
              Close
            </button>
          </div>
        ) : failure === 'mic' ? (
          // Saying "waiting for them to join" here would be a second wrong
          // diagnosis: they may well be waiting, but the seeker's own device is
          // the thing standing in the way.
          <p className="text-center text-amber-300/80 text-xs max-w-sm">
            {mode === 'video' ? 'Camera and microphone are blocked.' : 'Your microphone is blocked.'}
            <br />
            <span className="text-gray-500">
              Nobody can hear you until your browser allows it — click the padlock
              in the address bar, allow it, then reload. You are not being charged.
            </span>
          </p>
        ) : (
          <p className="text-center text-amber-300/80 text-xs max-w-sm">
            Waiting for {astrologerName} to join.
            <br />
            <span className="text-gray-500">
              You are not being charged. Billing starts only when they join —
              hang up any time and this costs you nothing.
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
