import React, { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Loader, Monitor, Laptop, Smartphone, RefreshCw, Undo2, Check } from 'lucide-react';
import { admin as adminApi } from '../../api';
import EditorProperties from './EditorProperties';

// The admin half of the visual editor.
//
// The real homepage runs in an iframe with ?editor=1. It reports drags back by
// postMessage and this side does the writing — the page itself never writes, so
// editor mode in a public browser is inert.
//
// One rule holds for everything on this screen: a change goes live the moment
// you make it, and Undo takes it back. There used to be two rules — hero
// overlays queued behind a Save button while content rows saved on drop — and
// the same word "Save" meant different things in the toolbar and in the
// properties popup. Two ways to save one page is one too many for someone who
// just wants to move a wheel.

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
  mandalaLeft: 'zodiac wheel',
  mandalaTop: 'zodiac wheel',
  mandalaSize: 'zodiac wheel size',
  clockLeft: 'Vedic clock',
  clockBottom: 'Vedic clock',
  heroButtonBottom: 'hero buttons',
  heroButtonGap: 'hero buttons',
};

const UNDO_LIMIT = 25;

export default function VisualEditorTab() {
  const [device, setDevice] = useState('laptop');
  const [settings, setSettings] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('idle');   // idle | saving
  const [loading, setLoading] = useState(true);
  const [schema, setSchema] = useState(null);
  const [selection, setSelection] = useState(null);
  const [box, setBox] = useState({ w: 900, h: 700 });
  const frameRef = useRef(null);
  const boxRef = useRef(null);
  const reloadRef = useRef(null);
  const settingsRef = useRef(null);
  const schemaRef = useRef(null);

  // Drags fire a commit per drop and the arrow pad per press, so writes are
  // coalesced rather than sent one PUT per nudge.
  const queued = useRef({});
  const timer = useRef(null);

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
      .then(([v, sc]) => {
        settingsRef.current = v.data;
        schemaRef.current = sc.data;
        setSettings(v.data);
        setSchema(sc.data);
      })
      .catch(() => toast.error('Could not load the editor'))
      .finally(() => setLoading(false));
  }, []);

  const reloadFrame = useCallback(() => {
    if (frameRef.current) frameRef.current.src = frameRef.current.src;
  }, []);
  reloadRef.current = reloadFrame;

  const record = useCallback((entry) => {
    setHistory(h => [...h, entry].slice(-UNDO_LIMIT));
  }, []);

  // Send whatever has piled up. Called on the debounce, and again before an
  // undo so the two writes cannot land out of order.
  const flush = useCallback(async () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    const patch = queued.current;
    queued.current = {};
    if (!Object.keys(patch).length) return;
    setStatus('saving');
    try {
      const { data } = await adminApi.updateSettings(patch);
      settingsRef.current = data;
      setSettings(data);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not save that — the site is unchanged');
      reloadRef.current?.();
    } finally {
      setStatus('idle');
    }
  }, []);

  // A setting has no stored value until it is first written, so remembering
  // `undefined` as the previous value would make Undo a no-op. Fall back to the
  // schema default, which is what the site was actually showing.
  const previous = useCallback((keys) => {
    const fields = (schemaRef.current?.settingsGroups || []).flatMap(g => g.fields);
    const prev = {};
    for (const k of keys) {
      const cur = settingsRef.current?.[k];
      prev[k] = cur !== undefined && cur !== null ? cur : fields.find(f => f.key === k)?.default;
    }
    return prev;
  }, []);

  const applySettings = useCallback((patch) => {
    const keys = Object.keys(patch);
    if (!keys.length) return;
    record({ kind: 'settings', patch: previous(keys), label: FRIENDLY[keys[0]] || 'the layout' });
    const next = { ...settingsRef.current, ...patch };
    settingsRef.current = next;
    setSettings(next);
    queued.current = { ...queued.current, ...patch };
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 500);
  }, [record, previous, flush]);

  // Only accept messages from our own origin and our own frame — an iframe is a
  // door, and this one holds an admin session.
  useEffect(() => {
    async function onMessage(e) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.source !== 'astrovyoma-editor') return;
      if (frameRef.current && e.source !== frameRef.current.contentWindow) return;

      if (e.data.type === 'select') {
        setSelection(e.data.kind === 'none' ? null : e.data);
        return;
      }
      if (e.data.type === 'commit-item') {
        const { listKey, id, values } = e.data;
        setStatus('saving');
        try {
          // Read the row before overwriting it so the move can be taken back.
          const { data: list } = await adminApi.contentList(listKey);
          const before = list.items.find(i => String(i.row_id) === String(id));
          if (before) {
            const prev = {};
            for (const k of Object.keys(values)) prev[k] = before[k];
            record({ kind: 'item', listKey, id, patch: prev, label: 'that move' });
          }
          await adminApi.contentUpdate(listKey, id, values);
        } catch (err) {
          toast.error(err?.response?.data?.error || 'Could not save that move');
          reloadRef.current?.();
        } finally {
          setStatus('idle');
        }
        return;
      }
      if (e.data.type === 'commit-reorder') {
        const { listKey, ids } = e.data;
        setStatus('saving');
        try {
          const { data: list } = await adminApi.contentList(listKey);
          const full = list.items.map(i => String(i.row_id));
          // The page renders only what is visible, so a drag can only report
          // those ids. Renumbering from that list alone would strand hidden rows
          // at stale positions and let them resurface in the wrong place when
          // shown again. Keep the slots the visible rows occupied and refill
          // just those, in the new order.
          const moved = new Set(ids.map(String).filter(id => full.includes(id)));
          const queue = ids.map(String).filter(id => moved.has(id));
          const next = [...full];
          full.forEach((id, i) => { if (moved.has(id)) next[i] = queue.shift(); });
          record({ kind: 'reorder', listKey, ids: full, label: 'that move' });
          await adminApi.contentReorder(listKey, next);
        } catch (err) {
          toast.error(err?.response?.data?.error || 'Could not save that move');
        } finally {
          setStatus('idle');
          reloadRef.current?.();   // show the order the server actually has
        }
        return;
      }
      if (e.data.type !== 'commit') return;      // previews are cosmetic, only keep drops
      applySettings(e.data.values);
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [applySettings, record]);

  async function undo() {
    const entry = history[history.length - 1];
    if (!entry) return;
    setHistory(h => h.slice(0, -1));
    setStatus('saving');
    try {
      if (entry.kind === 'settings') {
        await flush();                       // land anything still queued first
        const { data } = await adminApi.updateSettings(entry.patch);
        settingsRef.current = data;
        setSettings(data);
      } else if (entry.kind === 'item') {
        await adminApi.contentUpdate(entry.listKey, entry.id, entry.patch);
      } else if (entry.kind === 'reorder') {
        await adminApi.contentReorder(entry.listKey, entry.ids);
      }
      reloadFrame();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not undo that');
      setHistory(h => [...h, entry].slice(-UNDO_LIMIT));   // it is still in place, so keep it undoable
    } finally {
      setStatus('idle');
    }
  }

  if (loading) {
    return <div className="flex justify-center py-16"><Loader className="w-6 h-6 text-gold-400 animate-spin" /></div>;
  }

  const dev = DEVICES.find(d => d.key === device) || DEVICES[1];
  const scale = Math.min(box.w / dev.width, box.h / dev.height, 1);
  const last = history[history.length - 1];

  return (
    <div>
      <h2 className="font-serif text-2xl text-gold-400 mb-1">Visual Editor</h2>
      <p className="text-gray-500 text-sm mb-4">
        This is your real homepage. Click anything outlined to edit it, or drag a
        card to move it along its row. Gold pieces drag anywhere; headings drag
        up, down and sideways. Everything you change here goes live straight
        away — use Undo if you change your mind.
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
          {/* Where the Save button used to be. Nothing waits to be published, so
              the toolbar reports rather than asks. */}
          <span className="text-[11px] flex items-center gap-1.5 px-2 py-1 rounded-full border border-gold-600/15">
            {status === 'saving'
              ? <><Loader className="w-3 h-3 animate-spin text-gold-400" /><span className="text-gold-300">Saving…</span></>
              : <><Check className="w-3 h-3 text-green-400" /><span className="text-gray-400">All changes are live</span></>}
          </span>
          <button onClick={undo} disabled={!last || status === 'saving'}
            title={last ? `Undo the last change to ${last.label}` : 'Nothing to undo yet'}
            className="btn-outline-gold px-4 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-40">
            <Undo2 className="w-3.5 h-3.5" />
            {last ? `Undo ${last.label}` : 'Undo'}
          </button>
        </div>
      </div>

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
          settings={settings}
          onSettingsChange={applySettings}
          onRecord={record}
          onAfterChange={reloadFrame}
          onClose={() => setSelection(null)}
        />
      </div>
      </div>

      <p className="text-[11px] text-gray-600 mt-2">
        Showing {dev.width}×{dev.height} at {Math.round(scale * 100)}%. Everything
        you do here — dragging, moving, editing text — is saved and live on the
        site immediately. Undo steps back through your recent changes.
      </p>
    </div>
  );
}
