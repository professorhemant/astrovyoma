import React, { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Loader, Save, RotateCcw, Monitor, Laptop, Smartphone, RefreshCw, Undo2 } from 'lucide-react';
import { admin as adminApi } from '../../api';
import EditorProperties from './EditorProperties';

// The admin half of the visual editor.
//
// The real homepage runs in an iframe with ?editor=1. It reports drags back by
// postMessage and this side holds the pending changes and does the saving — the
// page itself never writes, so editor mode in a public browser is inert.

// Real pixel sizes, then scaled to fit. The first version put a 900px-tall
// frame in a 70vh box and let it scroll, which quietly broke dragging: lifting
// the clock towards the wheel takes the cursor out of the visible slice, the
// frame stops receiving pointer moves, and the drag commits wherever it was
// when the cursor left. A 450px move landed as 73px.
const DEVICES = [
  { key: 'full',   label: 'Full screen', icon: Monitor,    width: 1920, height: 1000 },
  { key: 'laptop', label: 'Laptop',      icon: Laptop,     width: 1512, height: 900 },
  { key: 'phone',  label: 'Phone',       icon: Smartphone, width: 390,  height: 844 },
];

const FRIENDLY = {
  mandalaLeft: 'Zodiac wheel — across',
  mandalaTop: 'Zodiac wheel — down',
  clockLeft: 'Vedic clock — across',
  clockBottom: 'Vedic clock — height',
  heroButtonBottom: 'Hero buttons — height',
  heroButtonGap: 'Hero buttons — gap',
};

export default function VisualEditorTab() {
  const [device, setDevice] = useState('laptop');
  const [pending, setPending] = useState({});   // setting key -> new value
  const [saved, setSaved] = useState(null);     // values as last persisted
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [schema, setSchema] = useState(null);
  const [selection, setSelection] = useState(null);
  const [box, setBox] = useState({ w: 900, h: 700 });
  const frameRef = useRef(null);
  const boxRef = useRef(null);
  const reloadRef = useRef(null);

  // Fit the preview to whatever room the admin column has, so the whole page is
  // reachable without scrolling mid-drag.
  useEffect(() => {
    const measure = () => {
      const el = boxRef.current;
      if (!el) return;
      setBox({ w: el.clientWidth - 16, h: Math.max(320, window.innerHeight - el.getBoundingClientRect().top - 90) });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [device, loading]);

  useEffect(() => {
    Promise.all([adminApi.getSettings(), adminApi.contentSchema()])
      .then(([v, sc]) => { setSaved(v.data); setSchema(sc.data); })
      .catch(() => toast.error('Could not load the editor'))
      .finally(() => setLoading(false));
  }, []);

  // Only accept messages from our own origin and our own frame — an iframe is a
  // door, and this one holds an admin session.
  useEffect(() => {
    function onMessage(e) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.source !== 'astrovyoma-editor') return;
      if (frameRef.current && e.source !== frameRef.current.contentWindow) return;
      if (e.data.type === 'select') {
        setSelection(e.data.kind === 'none' ? null : e.data);
        return;
      }
      // Content rows are not part of the settings batch — they save on drop.
      if (e.data.type === 'commit-item') {
        adminApi.contentUpdate(e.data.listKey, e.data.id, e.data.values)
          .then(() => toast.success('Moved — live on the site now'))
          .catch(err => {
            toast.error(err?.response?.data?.error || 'Could not save that move');
            reloadRef.current?.();
          });
        return;
      }
      if (e.data.type !== 'commit') return;      // previews are cosmetic, only keep drops
      setPending(p => ({ ...p, ...e.data.values }));
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const dirty = Object.keys(pending).length > 0;

  const reloadFrame = useCallback(() => {
    if (frameRef.current) frameRef.current.src = frameRef.current.src;
  }, []);
  reloadRef.current = reloadFrame;

  async function save() {
    setSaving(true);
    try {
      const { data } = await adminApi.updateSettings(pending);
      setSaved(data);
      setPending({});
      toast.success('Saved — live on the site now');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    setPending({});
    reloadFrame();          // snap the preview back to what is actually stored
  }

  if (loading) {
    return <div className="flex justify-center py-16"><Loader className="w-6 h-6 text-gold-400 animate-spin" /></div>;
  }

  const dev = DEVICES.find(d => d.key === device) || DEVICES[1];
  const scale = Math.min(box.w / dev.width, box.h / dev.height, 1);

  return (
    <div>
      <h2 className="font-serif text-2xl text-gold-400 mb-1">Visual Editor</h2>
      <p className="text-gray-500 text-sm mb-4">
        This is your real homepage. Click anything outlined to edit it. Gold
        pieces drag anywhere; headings drag up, down and sideways.
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        {DEVICES.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setDevice(key)}
            className={`px-3 py-1.5 rounded-xl text-xs border flex items-center gap-1.5 transition-colors ${
              device === key ? 'border-gold-500 text-gold-400 bg-gold-500/10' : 'border-gold-600/20 text-gray-400 hover:text-gray-200'}`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}

        <div className="w-px h-5 bg-gold-600/20 mx-1" />

        <button onClick={reloadFrame} title="Reload the preview"
          className="px-3 py-1.5 rounded-xl text-xs border border-gold-600/20 text-gray-400 hover:text-gray-200 flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Reload
        </button>

        <div className="ml-auto flex items-center gap-2">
          {dirty && (
            <button onClick={discard}
              className="px-3 py-1.5 rounded-xl text-xs border border-gold-600/20 text-gray-400 hover:text-red-300 flex items-center gap-1.5">
              <Undo2 className="w-3.5 h-3.5" /> Discard
            </button>
          )}
          <button onClick={save} disabled={!dirty || saving}
            className="btn-gold px-4 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-40">
            {saving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {dirty ? `Save ${Object.keys(pending).length} change${Object.keys(pending).length > 1 ? 's' : ''}` : 'No changes'}
          </button>
        </div>
      </div>

      {dirty && (
        <div className="mb-3 flex flex-wrap gap-2">
          {Object.entries(pending).map(([k, v]) => (
            <span key={k} className="text-[11px] px-2 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-200">
              {FRIENDLY[k] || k}: {saved?.[k]} → {v}
            </span>
          ))}
        </div>
      )}

      {/* The frame is the site itself, so what you drag is what visitors see.
          Scaled to fit rather than scrolled, so a drag never runs off the edge.
          Pointer coordinates are mapped into the frame's own space by the
          browser, so the scale does not disturb the drag maths inside it. */}
      <div className="relative">
      <div ref={boxRef} className="rounded-2xl border border-gold-600/20 overflow-hidden bg-cosmic-950 flex justify-center p-2">
        <div style={{ width: dev.width * scale, height: dev.height * scale }}>
          <iframe
            ref={frameRef}
            src="/?editor=1"
            title="Homepage preview"
            style={{
              width: dev.width, height: dev.height, border: 0, display: 'block',
              transform: `scale(${scale})`, transformOrigin: 'top left',
            }}
          />
        </div>
      </div>

      {/* Floats over the preview so the page keeps its full width. */}
      <div className={`absolute top-3 right-3 w-72 z-20 transition-opacity ${selection ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <EditorProperties
          selection={selection}
          schema={schema}
          settings={{ ...saved, ...pending }}
          onSettingsChange={(patch) => setPending(p => ({ ...p, ...patch }))}
          onAfterChange={reloadFrame}
          onClose={() => setSelection(null)}
        />
      </div>
      </div>

      <p className="text-[11px] text-gray-600 mt-2">
        Showing {dev.width}×{dev.height} at {Math.round(scale * 100)}%. Dragging moves
        things immediately in this preview, but nothing reaches the live site until
        you press Save. Discard puts the preview back.
      </p>
    </div>
  );
}
