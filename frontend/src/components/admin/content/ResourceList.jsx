import React, { useMemo, useState, useEffect } from 'react';
import {
  Plus, Search, Trash2, Eye, EyeOff, GripVertical, ChevronLeft, ChevronRight,
  RotateCcw, ImageIcon, X,
} from 'lucide-react';
import { columnsFor, titleOf, thumbOf, emojiOf, shortLabel } from './registry';

// The index page for one list: search it, filter it, reorder it, act on several
// rows at once, and click one to open it.
//
// The screen this replaces showed every row as an accordion — click to expand,
// twenty-four fields in one column, and no way to find anything except reading
// down. That is workable for the eight rows a list had when it was written and
// it is not workable for the shop.

const PER_PAGE = 25;

// ─── small pieces ────────────────────────────────────────────────────────────

function Badge({ tone = 'neutral', children }) {
  const tones = {
    live:    'bg-green-500/15 text-green-300 border-green-500/30',
    hidden:  'bg-cosmic-800 text-gray-400 border-gold-600/15',
    neutral: 'bg-cosmic-800 text-gray-300 border-gold-600/15',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border whitespace-nowrap ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Checkbox({ checked, indeterminate, onChange, label }) {
  const ref = React.useRef(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = !!indeterminate; }, [indeterminate]);
  return (
    <input ref={ref} type="checkbox" checked={!!checked} onChange={onChange} aria-label={label}
      onClick={e => e.stopPropagation()}
      className="w-4 h-4 rounded border-gold-600/40 bg-cosmic-950 text-gold-500 focus:ring-gold-500/40 cursor-pointer accent-gold-500" />
  );
}

function Thumb({ item, def }) {
  const src = thumbOf(item, def);
  const emoji = emojiOf(item, def);
  if (src) return <img src={src} alt="" className="w-10 h-10 rounded-lg object-cover border border-gold-600/20 bg-cosmic-950 shrink-0" />;
  return (
    <div className="w-10 h-10 rounded-lg border border-gold-600/15 bg-cosmic-950 flex items-center justify-center shrink-0">
      {emoji
        ? <span className="text-lg leading-none">{emoji}</span>
        : <ImageIcon className="w-4 h-4 text-gray-700" />}
    </div>
  );
}

// What a supporting column shows. Numbers that are prices get a rupee sign,
// switches read as words rather than "true", and a select shows the label the
// admin picked rather than the value stored under it.
function cellValue(field, item) {
  const v = item?.[field.key];
  if (field.type === 'boolean') return v ? 'Yes' : 'No';
  if (field.type === 'select') {
    const opt = (field.options || []).find(o => String(o.value) === String(v));
    return opt ? opt.label : (v ?? '—');
  }
  if (v === undefined || v === null || String(v).trim() === '') return '—';
  if (field.type === 'number' && /price/i.test(field.key)) return `₹${Number(v).toLocaleString('en-IN')}`;
  const s = String(v);
  return s.length > 28 ? `${s.slice(0, 28)}…` : s;
}

// ─── the list ────────────────────────────────────────────────────────────────

export default function ResourceList({
  listKey, def, items, loading,
  onOpen, onCreate, onToggle, onDelete, onReorder, onReset, onBulk,
}) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');       // all | active | hidden
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());
  const [fromIndex, setFromIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const [dragArmed, setDragArmed] = useState(false);

  const columns = useMemo(() => columnsFor(listKey, def), [listKey, def]);
  // A list may name its own singular; otherwise drop a trailing "s" and hope.
  const noun = def.noun || shortLabel(def.label).replace(/s$/, '');

  // A filtered view and a hand-sorted list cannot both be true at once: dropping
  // row 3 onto row 5 of a search result means nothing about where it sits in the
  // list itself. So reordering is offered only on the unfiltered first page,
  // which is also the only time it is any use.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(item => {
      if (status === 'active' && !item.is_active) return false;
      if (status === 'hidden' && item.is_active) return false;
      if (!q) return true;
      return def.fields.some(f => {
        if (f.type === 'image' || f.type === 'boolean') return false;
        return String(item[f.key] ?? '').toLowerCase().includes(q);
      });
    });
  }, [items, query, status, def]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  useEffect(() => { setPage(1); }, [query, status, listKey]);
  useEffect(() => { setSelected(new Set()); }, [listKey]);

  const start = (Math.min(page, pages) - 1) * PER_PAGE;
  const shown = filtered.slice(start, start + PER_PAGE);
  // Row positions on screen are positions in the list itself only while nothing
  // is filtered out, and a drop is meaningless otherwise. Paging is fine — the
  // indices stay absolute — so only search and the status tabs turn it off.
  const reorderable = !query.trim() && status === 'all';

  const counts = useMemo(() => ({
    all: items.length,
    active: items.filter(i => i.is_active).length,
    hidden: items.filter(i => !i.is_active).length,
  }), [items]);

  const allShownSelected = shown.length > 0 && shown.every(i => selected.has(i.row_id));
  const someShownSelected = shown.some(i => selected.has(i.row_id));

  function toggleOne(id) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function toggleAllShown() {
    setSelected(prev => {
      const next = new Set(prev);
      if (allShownSelected) shown.forEach(i => next.delete(i.row_id));
      else shown.forEach(i => next.add(i.row_id));
      return next;
    });
  }

  async function runBulk(action) {
    const ids = [...selected];
    if (!ids.length) return;
    const ok = await onBulk(action, ids);
    if (ok) setSelected(new Set());
  }

  // Drag to reorder. Positions are the real ones because reordering is only
  // possible when nothing is filtered out.
  const drag = {
    onStart: i => setFromIndex(i),
    onOver:  i => setOverIndex(i),
    onEnd:   () => { setFromIndex(null); setOverIndex(null); setDragArmed(false); },
    onDrop:  async to => {
      const from = fromIndex;
      setFromIndex(null); setOverIndex(null); setDragArmed(false);
      if (from === null || from === to) return;
      const next = [...items];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      await onReorder(next);
    },
  };

  const TABS = [
    { key: 'all',    label: 'All' },
    { key: 'active', label: 'Live' },
    { key: 'hidden', label: 'Hidden' },
  ];

  return (
    <div>
      {/* ── header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="min-w-0">
          <h2 className="font-serif text-2xl text-gold-300">{def.label}</h2>
          {def.help && <p className="text-gray-500 text-sm mt-1 max-w-2xl leading-relaxed">{def.help}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onReset} title="Put this list back to the content the site shipped with"
            className="p-2 rounded-lg text-gray-500 hover:text-red-300 hover:bg-red-500/10 transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={onCreate} className="btn-gold px-4 py-2 text-sm flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add {noun.toLowerCase()}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gold-600/15 bg-cosmic-900/40 overflow-hidden">
        {/* ── filters ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 border-b border-gold-600/10">
          <div className="flex gap-1">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setStatus(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  status === t.key
                    ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-cosmic-800 border border-transparent'}`}>
                {t.label} <span className="text-gray-600 ml-0.5">{counts[t.key]}</span>
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[12rem] max-w-sm ml-auto">
            <Search className="w-3.5 h-3.5 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder={`Search ${shortLabel(def.label).toLowerCase()}`}
              className="w-full bg-cosmic-950 border border-gold-600/20 rounded-lg pl-8 pr-8 py-1.5 text-xs text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-gold-500/60" />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── bulk bar ─────────────────────────────────────────────────── */}
        {selected.size > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gold-500/10 border-b border-gold-500/20">
            <span className="text-xs text-gold-200">{selected.size} selected</span>
            <div className="w-px h-4 bg-gold-500/20 mx-1" />
            <button onClick={() => runBulk('show')} className="px-2.5 py-1 rounded-md text-xs text-gray-200 hover:bg-cosmic-800 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Show on site
            </button>
            <button onClick={() => runBulk('hide')} className="px-2.5 py-1 rounded-md text-xs text-gray-200 hover:bg-cosmic-800 flex items-center gap-1.5">
              <EyeOff className="w-3.5 h-3.5" /> Hide
            </button>
            <button onClick={() => runBulk('delete')} className="px-2.5 py-1 rounded-md text-xs text-red-300 hover:bg-red-500/10 flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
            <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-gray-400 hover:text-gray-200">Clear</button>
          </div>
        )}

        {/* ── column heads ─────────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-3 px-3 py-2 border-b border-gold-600/10 text-[11px] uppercase tracking-wider text-gray-500">
          <span className="w-4 shrink-0"><Checkbox checked={allShownSelected} indeterminate={!allShownSelected && someShownSelected}
            onChange={toggleAllShown} label="Select all on this page" /></span>
          <span className="w-4 shrink-0" />
          <span className="w-10 shrink-0" />
          <span className="flex-1 min-w-[7rem]">{def.titleField ? 'Name' : 'Item'}</span>
          {columns.map(c => <span key={c.key} className="w-24 shrink-0 hidden xl:block truncate">{c.label}</span>)}
          <span className="w-16 shrink-0">Status</span>
          <span className="w-16 shrink-0 text-right">Actions</span>
        </div>

        {/* ── rows ─────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="divide-y divide-gold-600/5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3 animate-pulse">
                <span className="w-4" /><span className="w-4" />
                <span className="w-10 h-10 rounded-lg bg-cosmic-800 shrink-0" />
                <span className="h-3 bg-cosmic-800 rounded flex-1 max-w-xs" />
                <span className="h-3 w-16 bg-cosmic-800 rounded" />
              </div>
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="py-16 text-center px-6">
            <p className="text-gray-300 text-sm">
              {items.length === 0
                ? `No ${shortLabel(def.label).toLowerCase()} yet.`
                : 'Nothing matches that.'}
            </p>
            <p className="text-gray-600 text-xs mt-1">
              {items.length === 0
                ? 'Whatever you add here appears on the live site straight away.'
                : 'Try a different word, or switch back to All.'}
            </p>
            {items.length === 0 && (
              <button onClick={onCreate} className="btn-gold px-4 py-2 text-sm mt-4 inline-flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add {noun.toLowerCase()}
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gold-600/5">
            {shown.map((item, i) => {
              const index = start + i;
              const title = titleOf(item, def);
              return (
                <div key={item.row_id}
                  draggable={dragArmed && reorderable}
                  onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; drag.onStart(index); }}
                  onDragEnd={drag.onEnd}
                  onDragOver={e => { if (!reorderable) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; drag.onOver(index); }}
                  onDrop={e => { if (!reorderable) return; e.preventDefault(); drag.onDrop(index); }}
                  onClick={() => onOpen(item)}
                  className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors group
                    ${selected.has(item.row_id) ? 'bg-gold-500/5' : 'hover:bg-cosmic-800/50'}
                    ${fromIndex === index ? 'opacity-40' : ''}
                    ${overIndex === index && fromIndex !== null && fromIndex !== index ? 'ring-1 ring-inset ring-gold-400/50' : ''}`}>

                  <span className="w-4 shrink-0">
                    <Checkbox checked={selected.has(item.row_id)} onChange={() => toggleOne(item.row_id)} label={`Select ${title}`} />
                  </span>

                  <span className="w-4 shrink-0">
                    {reorderable && (
                      <button title="Drag to reorder" onClick={e => e.stopPropagation()}
                        onMouseDown={() => setDragArmed(true)} onMouseUp={() => setDragArmed(false)}
                        onTouchStart={() => setDragArmed(true)} onTouchEnd={() => setDragArmed(false)}
                        className="cursor-grab active:cursor-grabbing text-gray-700 hover:text-gold-400 touch-none">
                        <GripVertical className="w-4 h-4" />
                      </button>
                    )}
                  </span>

                  <Thumb item={item} def={def} />

                  <span className="flex-1 min-w-[7rem]">
                    <span className={`block text-sm truncate ${item.is_active ? 'text-gray-100' : 'text-gray-500'}`}>
                      {title || <span className="italic text-gray-600">Untitled</span>}
                    </span>
                    {columns.length > 0 && (
                      <span className="block xl:hidden text-[11px] text-gray-600 truncate">
                        {columns.map(c => cellValue(c, item)).filter(v => v !== '—').join(' · ')}
                      </span>
                    )}
                  </span>

                  {columns.map(c => (
                    <span key={c.key} className="w-24 shrink-0 hidden xl:block text-xs text-gray-400 truncate">
                      {cellValue(c, item)}
                    </span>
                  ))}

                  <span className="w-16 shrink-0">
                    <Badge tone={item.is_active ? 'live' : 'hidden'}>{item.is_active ? 'Live' : 'Hidden'}</Badge>
                  </span>

                  <span className="w-16 shrink-0 flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button onClick={e => { e.stopPropagation(); onToggle(item); }}
                      title={item.is_active ? 'Hide from the site' : 'Show on the site'}
                      className="p-1.5 rounded-md text-gray-400 hover:text-gold-300 hover:bg-cosmic-800">
                      {item.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={e => { e.stopPropagation(); onDelete(item); }} title="Delete"
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-300 hover:bg-red-500/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── footer ───────────────────────────────────────────────────── */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-3 py-2 border-t border-gold-600/10 text-[11px] text-gray-500">
            <span>
              {filtered.length === items.length
                ? `${items.length} in this list`
                : `${filtered.length} of ${items.length}`}
              {items.length > 1 && (reorderable
                ? ' · drag the handle to reorder'
                : ' · clear the search and filters to reorder')}
            </span>
            {pages > 1 && (
              <span className="flex items-center gap-2">
                Page {Math.min(page, pages)} of {pages}
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                  className="p-1 hover:text-gold-400 disabled:opacity-30"><ChevronLeft className="w-3.5 h-3.5" /></button>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages}
                  className="p-1 hover:text-gold-400 disabled:opacity-30"><ChevronRight className="w-3.5 h-3.5" /></button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
