import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { Loader, Search, ChevronDown, X } from 'lucide-react';
import { admin as adminApi } from '../../api';
import { sectionsFor, shortLabel } from './content/registry';
import ResourceList from './content/ResourceList';
import ResourceDetail from './content/ResourceDetail';

// Everything on the site that can be edited without a deploy, arranged the way
// somebody looking for it would arrange it.
//
// The lists themselves still arrive from the server — 26 of them today — so
// making something new editable remains a schema change and nothing here has to
// know about it. What this screen adds is a place for each one to live: a
// grouped column on the left, a proper index in the middle, and one row on its
// own page when you open it.

export default function ContentTab() {
  const [schema, setSchema] = useState(null);
  const [active, setActive] = useState(null);
  const [open, setOpen] = useState(() => new Set());     // which sections are expanded
  const [navQuery, setNavQuery] = useState('');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);          // null | 'new' | row_id
  const dirtyRef = useRef(false);

  // ─── the schema ────────────────────────────────────────────────────────
  useEffect(() => {
    adminApi.contentSchema()
      .then(r => {
        setSchema(r.data);
        const sections = sectionsFor(r.data.lists || {});
        const first = sections[0];
        if (first) {
          setActive(first.lists[0]);
          setOpen(new Set([first.key]));
        }
      })
      .catch(() => toast.error('Could not load the list of editable content'));
  }, []);

  const lists = schema?.lists || {};
  const def = active ? lists[active] : null;
  const sections = useMemo(() => sectionsFor(lists), [lists]);

  // Typing in the nav searches the names of the lists, not their contents — it
  // is for "where do I change the footer", which is the question this column
  // exists to answer.
  const visibleSections = useMemo(() => {
    const q = navQuery.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map(s => ({ ...s, lists: s.lists.filter(k => (lists[k]?.label || k).toLowerCase().includes(q)) }))
      .filter(s => s.lists.length);
  }, [sections, navQuery, lists]);

  // ─── the rows of the open list ─────────────────────────────────────────
  const load = useCallback((key) => {
    if (!key) return;
    setLoading(true);
    adminApi.contentList(key)
      .then(r => setItems(r.data.items))
      .catch(() => toast.error('Could not load that list'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setEditing(null); setItems([]); load(active); }, [active, load]);

  // Leaving a half-written row is the one thing on this screen that can lose
  // work, so it is the one thing that asks.
  const leaveGuard = useCallback(() => {
    if (!dirtyRef.current) return true;
    const ok = window.confirm('You have changes that are not saved yet.\n\nLeave without saving?');
    if (ok) dirtyRef.current = false;
    return ok;
  }, []);

  function chooseList(key) {
    if (key === active) return;
    if (!leaveGuard()) return;
    setActive(key);
  }

  // ─── writing ───────────────────────────────────────────────────────────
  async function handleSave(draft) {
    const creating = editing === 'new';
    try {
      const { data } = creating
        ? await adminApi.contentCreate(active, draft)
        : await adminApi.contentUpdate(active, editing, draft);

      setItems(list => (creating ? [...list, data] : list.map(i => (i.row_id === data.row_id ? data : i))));
      dirtyRef.current = false;
      setEditing(null);
      toast.success(creating ? 'Added — live on the site now' : 'Saved — live on the site now');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not save that');
    }
  }

  async function handleDelete(item) {
    const title = item?.[def.titleField] || 'this item';
    if (!window.confirm(`Delete "${title}"?\n\nIt comes off the site straight away, and this cannot be undone.`)) return;
    try {
      await adminApi.contentDelete(active, item.row_id);
      setItems(list => list.filter(i => i.row_id !== item.row_id));
      dirtyRef.current = false;
      setEditing(null);
      toast.success('Deleted');
    } catch {
      toast.error('Could not delete that');
    }
  }

  async function handleToggle(item) {
    try {
      const { data } = await adminApi.contentUpdate(active, item.row_id, { is_active: !item.is_active });
      setItems(list => list.map(i => (i.row_id === data.row_id ? data : i)));
      toast.success(data.is_active ? 'Now showing on the site' : 'Hidden from the site');
    } catch {
      toast.error('Could not change that');
    }
  }

  // Optimistic: the row lands where it was dropped, then the order is written.
  // If the write fails the server's own order is fetched back rather than left
  // to be guessed at from the screen.
  async function handleReorder(next) {
    setItems(next);
    try {
      await adminApi.contentReorder(active, next.map(i => i.row_id));
    } catch {
      toast.error('Could not save the new order');
      load(active);
    }
  }

  async function handleBulk(action, ids) {
    if (action === 'delete' && !window.confirm(
      `Delete ${ids.length} ${ids.length === 1 ? 'item' : 'items'}?\n\nThey come off the site straight away, and this cannot be undone.`
    )) return false;

    try {
      if (action === 'delete') {
        await Promise.all(ids.map(id => adminApi.contentDelete(active, id)));
        setItems(list => list.filter(i => !ids.includes(i.row_id)));
        toast.success(`Deleted ${ids.length}`);
      } else {
        const is_active = action === 'show';
        const saved = await Promise.all(ids.map(id => adminApi.contentUpdate(active, id, { is_active })));
        const byId = new Map(saved.map(r => [r.data.row_id, r.data]));
        setItems(list => list.map(i => byId.get(i.row_id) || i));
        toast.success(is_active ? `${ids.length} now showing` : `${ids.length} hidden`);
      }
      return true;
    } catch {
      toast.error('Some of those could not be changed');
      load(active);
      return false;
    }
  }

  async function handleReset() {
    if (!window.confirm(
      `Put "${def.label}" back to the content the site shipped with?\n\n` +
      'Everything you have added or edited in this list is discarded. This cannot be undone.'
    )) return;
    try {
      const { data } = await adminApi.contentReset(active);
      setItems(data.items);
      setEditing(null);
      toast.success('Back to the original content');
    } catch {
      toast.error('Could not reset that list');
    }
  }

  // ─── render ────────────────────────────────────────────────────────────
  if (!schema) {
    return <div className="flex justify-center py-20"><Loader className="w-6 h-6 text-gold-400 animate-spin" /></div>;
  }

  const editingItem = editing && editing !== 'new' ? items.find(i => i.row_id === editing) : null;

  return (
    <div className="flex gap-6 items-start">
      {/* ── the column of lists ──────────────────────────────────────── */}
      <aside className="w-56 shrink-0 hidden md:block sticky top-4">
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={navQuery} onChange={e => setNavQuery(e.target.value)} placeholder="Find a list"
            className="w-full bg-cosmic-950 border border-gold-600/20 rounded-lg pl-8 pr-8 py-1.5 text-xs text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-gold-500/60" />
          {navQuery && (
            <button onClick={() => setNavQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <nav className="space-y-1">
          {visibleSections.map(section => {
            const Icon = section.icon;
            const expanded = navQuery.trim() ? true : open.has(section.key) || section.lists.includes(active);
            return (
              <div key={section.key}>
                <button
                  onClick={() => setOpen(prev => {
                    const next = new Set(prev);
                    if (next.has(section.key)) next.delete(section.key); else next.add(section.key);
                    return next;
                  })}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-gray-300 hover:bg-cosmic-800 transition-colors">
                  <Icon className="w-3.5 h-3.5 text-gold-500/70 shrink-0" />
                  <span className="font-medium">{section.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 ml-auto text-gray-600 transition-transform ${expanded ? '' : '-rotate-90'}`} />
                </button>

                {expanded && (
                  <div className="ml-3 pl-3 border-l border-gold-600/15 space-y-0.5 py-0.5">
                    {section.lists.map(key => (
                      <button key={key} onClick={() => chooseList(key)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors truncate ${
                          active === key
                            ? 'bg-gold-500/15 text-gold-300'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-cosmic-800'}`}>
                        {shortLabel(lists[key]?.label || key)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {visibleSections.length === 0 && (
            <p className="text-xs text-gray-600 px-2.5 py-3">Nothing matches “{navQuery}”.</p>
          )}
        </nav>
      </aside>

      {/* ── the list, or one row of it ──────────────────────────────── */}
      <div className="flex-1 min-w-0">
        {/* Narrow screens get the same lists as a plain picker rather than a
            column that would eat half the width. */}
        <div className="md:hidden mb-4">
          <select value={active || ''} onChange={e => chooseList(e.target.value)}
            className="w-full bg-cosmic-950 border border-gold-600/25 rounded-lg px-3 py-2 text-sm text-gray-200">
            {sections.map(s => (
              <optgroup key={s.key} label={s.label}>
                {s.lists.map(k => <option key={k} value={k}>{shortLabel(lists[k]?.label || k)}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        {!def ? (
          <p className="text-gray-500 text-sm">Pick something on the left to edit.</p>
        ) : editing ? (
          <ResourceDetail
            key={`${active}:${editing}`}
            listKey={active}
            def={def}
            item={editingItem}
            onDirtyChange={v => { dirtyRef.current = v; }}
            onBack={() => { if (leaveGuard()) setEditing(null); }}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        ) : (
          <ResourceList
            listKey={active}
            def={def}
            items={items}
            loading={loading}
            onOpen={item => setEditing(item.row_id)}
            onCreate={() => setEditing('new')}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onReorder={handleReorder}
            onReset={handleReset}
            onBulk={handleBulk}
          />
        )}
      </div>
    </div>
  );
}
