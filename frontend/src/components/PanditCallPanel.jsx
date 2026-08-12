import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Loader } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * The astrologer's half of a call — the piece that did not exist.
 *
 * Until now the Pandit Portal was a login, an online toggle and an earnings
 * panel. Going online put an astrologer's card in front of seekers but gave her
 * nowhere to answer, so a seeker who pressed Call sat on "Connecting…" while
 * this side of the app had no idea a call existed.
 *
 * Signalling is a poll rather than a socket. The app has no socket layer, and
 * introducing an always-on transport to ring a phone is a bigger change than the
 * feature justifies; a few seconds before the ring appears is acceptable, and
 * the server closes anything that rings out so nobody waits forever.
 *
 * The meter is deliberately not started here. Accepting only fetches a token —
 * connected_at is still stamped by the *seeker's* browser when it sees this
 * astrologer publish audio, so accepting a call and then failing to open a
 * microphone starts nobody's billing.
 */

const POLL_MS = 3000;

export default function PanditCallPanel({ token, isOnline, displayName }) {
  const [incoming, setIncoming] = useState([]);
  const [call, setCall] = useState(null);       // the accepted call, once joined
  const [joining, setJoining] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [seekerHere, setSeekerHere] = useState(false);
  const [error, setError] = useState('');

  const clientRef = useRef(null);
  const tracksRef = useRef([]);
  const timerRef = useRef(null);
  const headers = { Authorization: `Bearer ${token}` };

  // ── Ring polling ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token || !isOnline || call) return;
    let alive = true;
    const tick = async () => {
      try {
        const { data } = await axios.get(`${API}/pandit/calls`, { headers });
        if (alive) setIncoming(data.incoming || []);
      } catch { /* a dropped poll is not worth surfacing */ }
    };
    tick();
    const t = setInterval(tick, POLL_MS);
    return () => { alive = false; clearInterval(t); };
  }, [token, isOnline, call]);

  // Ringing is easy to miss on a phone in a pocket. A short tone on each new
  // call, built with the Web Audio API so there is no asset to ship.
  const lastRungRef = useRef(null);
  useEffect(() => {
    const first = incoming[0];
    if (!first || lastRungRef.current === first.id) return;
    lastRungRef.current = first.id;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 660;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
      osc.start(); osc.stop(ctx.currentTime + 0.85);
    } catch { /* a browser that will not make a sound is not an error */ }
  }, [incoming]);

  useEffect(() => {
    if (!call) { clearInterval(timerRef.current); setElapsed(0); return; }
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [call]);

  const teardown = useCallback(async () => {
    tracksRef.current.forEach(t => { try { t.stop?.(); t.close?.(); } catch {} });
    tracksRef.current = [];
    if (clientRef.current) {
      // leave() can hang when a join never completed. Race it — the tracks are
      // already stopped, so the microphone is released either way.
      await Promise.race([
        clientRef.current.leave().catch(() => {}),
        new Promise(r => setTimeout(r, 2000)),
      ]);
      clientRef.current = null;
    }
  }, []);

  useEffect(() => () => { teardown(); }, [teardown]);

  async function accept(c) {
    if (joining) return;
    setJoining(true);
    setError('');
    try {
      const { data } = await axios.post(`${API}/pandit/calls/${c.id}/accept`, {}, { headers });

      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      client.on('user-published', async (remote, mediaType) => {
        await client.subscribe(remote, mediaType);
        if (mediaType === 'audio') remote.audioTrack?.play();
        if (mediaType === 'video') remote.videoTrack?.play('pandit-remote-video');
        setSeekerHere(true);
      });
      client.on('user-left', () => setSeekerHere(false));

      await client.join(data.agora.appId, data.agora.channel, data.agora.token || null, null);

      const tracks = [];
      tracks.push(await AgoraRTC.createMicrophoneAudioTrack());
      if (data.mode === 'video') {
        const cam = await AgoraRTC.createCameraVideoTrack();
        cam.play('pandit-local-video');
        tracks.push(cam);
      }
      await client.publish(tracks);
      tracksRef.current = tracks;

      setCall({ id: c.id, mode: data.mode, seeker: data.seeker_name });
      setIncoming([]);
    } catch (err) {
      const name = String(err?.name || '');
      if (/NotAllowedError|NotFoundError|NotReadableError|PermissionDenied/i.test(name)) {
        setError('Your microphone is blocked. Allow it in the browser, then answer again.');
      } else {
        setError(err?.response?.data?.error || 'Could not join the call.');
      }
      await teardown();
    } finally {
      setJoining(false);
    }
  }

  async function decline(c) {
    try { await axios.post(`${API}/pandit/calls/${c.id}/decline`, {}, { headers }); } catch {}
    setIncoming(list => list.filter(x => x.id !== c.id));
  }

  async function hangUp() {
    const id = call?.id;
    setCall(null);
    setSeekerHere(false);
    // Close the session first; tidying the microphone must never be what stands
    // between the astrologer and the end of a call.
    if (id) { try { await axios.post(`${API}/pandit/calls/${id}/end`, {}, { headers }); } catch {} }
    teardown();
  }

  async function toggleMic() {
    const mic = tracksRef.current[0];
    if (!mic) return;
    await mic.setMuted(!micMuted);
    setMicMuted(m => !m);
  }

  async function toggleCam() {
    const cam = tracksRef.current.find(t => t.trackMediaType === 'video');
    if (!cam) return;
    await cam.setMuted(!camOff);
    setCamOff(c => !c);
  }

  const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // ── In a call ──────────────────────────────────────────────────────────────
  if (call) {
    return (
      <div className="border border-green-500/30 bg-green-900/10 rounded-2xl p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-green-300 text-sm font-semibold">
              {call.mode === 'video' ? 'Video call' : 'Voice call'} with {call.seeker}
            </p>
            <p className="text-gray-400 text-xs">
              {seekerHere ? 'Connected' : 'Waiting for them to reconnect…'} · {mmss(elapsed)}
            </p>
          </div>
          <span className="text-green-400 text-xs">● Live</span>
        </div>

        {call.mode === 'video' && (
          <div className="relative rounded-xl overflow-hidden bg-black/50 mb-3" style={{ height: 180 }}>
            <div id="pandit-remote-video" className="absolute inset-0" />
            <div id="pandit-local-video" className="absolute bottom-2 right-2 w-20 h-28 rounded-lg overflow-hidden border border-gold-600/40" />
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <button onClick={toggleMic}
            className={`p-3 rounded-full border transition-all ${micMuted ? 'bg-red-500/20 border-red-500/50 text-red-300' : 'border-gold-600/30 text-gold-400'}`}>
            {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          {call.mode === 'video' && (
            <button onClick={toggleCam}
              className={`p-3 rounded-full border transition-all ${camOff ? 'bg-red-500/20 border-red-500/50 text-red-300' : 'border-gold-600/30 text-gold-400'}`}>
              {camOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </button>
          )}
          <button onClick={hangUp}
            className="p-3 rounded-full bg-red-500 border-2 border-red-400 text-white hover:bg-red-600 transition-all">
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Ringing ────────────────────────────────────────────────────────────────
  return (
    <>
      {error && (
        <p className="text-amber-300 text-xs bg-amber-900/20 border border-amber-500/30 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <AnimatePresence>
        {incoming.map(c => (
          <motion.div key={c.id}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="border border-green-400/40 bg-green-900/15 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}
                className="w-2 h-2 rounded-full bg-green-400" />
              <p className="text-green-300 text-sm font-semibold">
                Incoming {c.mode === 'video' ? 'video' : 'voice'} call
              </p>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              {c.seeker_name}
              {c.concern_category && c.concern_category !== 'general' && (
                <span className="text-gray-500"> · {c.concern_category}</span>
              )}
            </p>
            <div className="flex gap-2">
              <button onClick={() => accept(c)} disabled={joining}
                className="flex-1 btn-gold py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60">
                {joining ? <><Loader className="w-4 h-4 animate-spin" /> Joining…</> : <><Phone className="w-4 h-4" /> Answer</>}
              </button>
              <button onClick={() => decline(c)} disabled={joining}
                className="px-4 py-2.5 rounded-full text-sm border border-red-500/40 text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-60">
                Decline
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {isOnline && incoming.length === 0 && (
        <p className="text-gray-500 text-xs text-center mb-4">
          Listening for calls. Keep this page open — {displayName?.split(' ')[0] || 'you'} will
          see them here the moment they come in.
        </p>
      )}
    </>
  );
}
