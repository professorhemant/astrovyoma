import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  ChevronRight, Loader, Plus, Eye, EyeOff, Move, Type, LayoutGrid,
  PanelTop, PanelBottom, Sparkles,
} from 'lucide-react';
import { admin as adminApi } from '../../../api';
import { titleOf } from '../content/registry';

// What the homepage is made of, listed.
//
// The editor could already do a great deal — drag the wheel, drag a card into a
// different place in its row, click a testimonial and rewrite it — but only if
// you knew it could. The only way in was to click the right pixels in the
// preview, so anything below the fold, or too small to hit, or simply not
// noticed, may as well not have been editable at all.
//
// This is the index that was missing. Everything the page is built from is on
// the left, grouped the way the page reads from top to bottom; clicking an entry
// selects it exactly as clicking it in the preview does, and the same properties
// panel opens either way.

const AREAS = [
  {
    key: 'banner', label: 'Banner', icon: Sparkles,
    entries: [
      { kind: 'position', key: 'mandala',     label: 'Zodiac wheel' },
      { kind: 'position', key: 'clock',       label: 'Vedic clock' },
      { kind: 'position', key: 'heroButtons', label: 'Buttons — where they sit' },
      { kind: 'position', key: 'marquee',     label: 'Scrolling line' },
      { kind: 'list',     listKey: 'hero_ctas' },
    ],
  },
  {
    key: 'header', label: 'Menu', icon: PanelTop,
    entries: [
      { kind: 'list', listKey: 'nav_groups' },
      { kind: 'list', listKey: 'nav_items' },
    ],
  },
  {
    key: 'sections', label: 'Page sections', icon: LayoutGrid,
    entries: [
      { kind: 'list', listKey: 'section_headings' },
      { kind: 'list', listKey: 'home_features' },
      { kind: 'list', listKey: 'purpose_cards' },
      { kind: 'list', listKey: 'how_it_works' },
      { kind: 'list', listKey: 'testimonials' },
      { kind: 'list', listKey: 'faqs' },
    ],
  },
  {
    key: 'footer', label: 'Footer', icon: PanelBottom,
    entries: [{ kind: 'list', listKey: 'footer_links' }],
  },
];

const POSITION_ICON = { position: Move, list: Type };

export default function PageSections({ schema, selection, onSelect, onToggleRow, onAdded }) {
  const [openList, setOpenList] = useState(null);
  const [rows, setRows] = useState({});        // listKey → items
  const [loading, setLoading] = useState(null);
  const [busy, setBusy] = useState(null);

  const lists = schema?.lists || {};

  const fetchRows = useCallback((key) => {
    setLoading(key);
    adminApi.contentList(key)
      .then(r => setRows(prev => ({ ...prev, [key]: r.data.items })))
      .catch(() => toast.error('Could not load that section'))
      .finally(() => setLoading(null));
  }, []);

  // Reopening a section should show what is there now, not what was there when
  // it was last looked at — rows get edited, added and deleted from this very
  // panel while it is open.
  function toggleList(key) {
    if (openList === key) { setOpenList(null); return; }
    setOpenList(key);
    fetchRows(key);
  }

  // The preview can select something too. When it does, the list it belongs to
  // opens here, so the panel and the page never disagree about where you are.
  useEffect(() => {
    if (selection?.kind !== 'item') return;
    setOpenList(selection.listKey);
    fetchRows(selection.listKey);
  }, [selection?.kind, selection?.listKey, fetchRows]);

  async function addRow(listKey) {
    const def = lists[listKey];
    if (!def) return;
    setBusy(listKey);
    try {
      const blank = {};
      for (const f of def.fields) blank[f.key] = f.default ?? (f.type === 'number' ? 0 : f.type === 'boolean' ? false : '');
      // A row the server would reject for being empty is no use to anybody, so
      // required fields start with something you can see and then rename.
      for (const f of def.fields) if (f.required && !blank[f.key]) blank[f.key] = `New ${f.label.toLowerCase()}`;
      const { data } = await adminApi.contentCreate(listKey, blank);
      setRows(prev => ({ ...prev, [listKey]: [...(prev[listKey] || []), data] }));
      onAdded?.();
      onSelect({ kind: 'item', listKey, id: data.row_id });
      toast.success('Added — it is on the page now, ready to be written');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not add that');
    } finally {
      setBusy(null);
    }
  }

  async function toggle(listKey, item) {
    const updated = await onToggleRow(listKey, item);
    if (updated) setRows(prev => ({
      ...prev,
      [listKey]: (prev[listKey] || []).map(i => (i.row_id === updated.row_id ? updated : i)),
    }));
  }

  return (
    <div className="space-y-4">
      {AREAS.map(area => {
        const AreaIcon = area.icon;
        const entries = area.entries.filter(e => e.kind !== 'list' || lists[e.listKey]);
        if (!entries.length) return null;

        return (
          <div key={area.key}>
            <p className="flex items-center gap-1.5 px-1 mb-1.5 text-[11px] uppercase tracking-wider text-gray-500">
              <AreaIcon className="w-3 h-3 text-gold-600" /> {area.label}
            </p>

            <div className="space-y-0.5">
              {entries.map(entry => {
                if (entry.kind === 'position') {
                  const chosen = selection?.kind === 'position' && selection.key === entry.key;
                  const Icon = POSITION_ICON.position;
                  return (
                    <button key={entry.key}
                      onClick={() => onSelect({ kind: 'position', key: entry.key, label: entry.label })}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                        chosen ? 'bg-gold-500/15 text-gold-300' : 'text-gray-300 hover:bg-cosmic-800'}`}>
                      <Icon className="w-3.5 h-3.5 text-gold-600/70 shrink-0" />
                      <span className="truncate">{entry.label}</span>
                    </button>
                  );
                }

                const def = lists[entry.listKey];
                const expanded = openList === entry.listKey;
                const items = rows[entry.listKey] || [];

                return (
                  <div key={entry.listKey}>
                    <button onClick={() => toggleList(entry.listKey)}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                        expanded ? 'text-gold-300 bg-cosmic-800/60' : 'text-gray-300 hover:bg-cosmic-800'}`}>
                      <ChevronRight className={`w-3.5 h-3.5 text-gray-600 transition-transform shrink-0 ${expanded ? 'rotate-90' : ''}`} />
                      <span className="truncate">{def.label.replace(/^.*—\s*/, '')}</span>
                      {loading === entry.listKey && <Loader className="w-3 h-3 animate-spin text-gold-500 ml-auto" />}
                    </button>

                    {expanded && (
                      <div className="ml-3 pl-3 border-l border-gold-600/15 py-0.5 space-y-0.5">
                        {items.map(item => {
                          const chosen = selection?.kind === 'item'
                            && selection.listKey === entry.listKey
                            && String(selection.id) === String(item.row_id);
                          return (
                            <div key={item.row_id}
                              className={`flex items-center gap-1 rounded-lg group ${chosen ? 'bg-gold-500/15' : 'hover:bg-cosmic-800'}`}>
                              <button
                                onClick={() => onSelect({ kind: 'item', listKey: entry.listKey, id: item.row_id })}
                                className={`flex-1 min-w-0 text-left px-2.5 py-1.5 text-[11px] truncate ${
                                  chosen ? 'text-gold-300' : item.is_active ? 'text-gray-400' : 'text-gray-600 line-through'}`}>
                                {titleOf(item, def) || 'Untitled'}
                              </button>
                              <button onClick={() => toggle(entry.listKey, item)}
                                title={item.is_active ? 'Hide this from the page' : 'Show this on the page'}
                                className="p-1.5 text-gray-600 hover:text-gold-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                {item.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              </button>
                            </div>
                          );
                        })}

                        {!items.length && loading !== entry.listKey && (
                          <p className="px-2.5 py-1.5 text-[11px] text-gray-600">Nothing here yet.</p>
                        )}

                        <button onClick={() => addRow(entry.listKey)} disabled={busy === entry.listKey}
                          className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] text-gold-500/80 hover:text-gold-300 hover:bg-cosmic-800 disabled:opacity-40">
                          {busy === entry.listKey
                            ? <Loader className="w-3 h-3 animate-spin" />
                            : <Plus className="w-3 h-3" />}
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
