import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, ExternalLink, Trash2, Loader, AlertTriangle } from 'lucide-react';
import { Field, Toggle } from './fields';
import { layoutFor, titleFieldOf, previewHref, shortLabel } from './registry';

// One row, on its own screen.
//
// The rule this page is built around is the one Shopify's admin never breaks:
// nothing you type is anywhere until you press Save, and while there is
// something unsaved the page says so and will not let you leave quietly. The
// list behind it is the opposite — hiding a row or dragging it takes effect at
// once, because there is nothing to get wrong and nothing to review.

function Card({ title, children }) {
  return (
    <section className="rounded-2xl border border-gold-600/15 bg-cosmic-900/40">
      {title && (
        <header className="px-4 py-3 border-b border-gold-600/10">
          <h3 className="text-sm font-medium text-gray-200">{title}</h3>
        </header>
      )}
      <div className="p-4 space-y-4">{children}</div>
    </section>
  );
}

export default function ResourceDetail({ listKey, def, item, onBack, onSave, onDelete, onDirtyChange }) {
  const isNew = !item;
  const titleField = titleFieldOf(def);
  const noun = (def.noun || shortLabel(def.label).replace(/s$/, '')).toLowerCase();

  const blank = useCallback(() => {
    const o = { is_active: true };
    for (const f of def.fields) {
      o[f.key] = f.default ?? (f.type === 'number' ? 0 : f.type === 'boolean' ? false : '');
    }
    return o;
  }, [def]);

  const original = useMemo(() => (item ? { ...item } : blank()), [item, blank]);
  const [draft, setDraft] = useState(original);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => { setDraft(original); setShowErrors(false); }, [original]);

  const set = (key, value) => setDraft(d => ({ ...d, [key]: value }));

  const dirty = isNew
    ? def.fields.some(f => String(draft[f.key] ?? '') !== String(original[f.key] ?? ''))
    : def.fields.some(f => String(draft[f.key] ?? '') !== String(original[f.key] ?? ''))
      || !!draft.is_active !== !!original.is_active;

  const missing = def.fields.filter(f => f.required && String(draft[f.key] ?? '').trim() === '');

  const save = useCallback(async () => {
    if (saving) return;
    if (missing.length) { setShowErrors(true); return; }
    setSaving(true);
    await onSave(draft);
    setSaving(false);
  }, [saving, missing.length, onSave, draft]);

  // The shell asks before it lets you walk away from this, so it has to know.
  // Cleared on the way out, or leaving by saving would leave the warning armed.
  useEffect(() => {
    onDirtyChange?.(dirty);
    return () => onDirtyChange?.(false);
  }, [dirty, onDirtyChange]);

  // ⌘S / Ctrl+S. Someone who writes a page of terms in here reaches for it
  // without thinking, and the browser's own "save this page" dialog is a
  // confusing thing to be handed in the middle of writing.
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (dirty) save();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dirty, save]);

  // Closing the tab mid-edit is the one exit this page cannot intercept itself.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = e => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const { cards, aside } = useMemo(() => layoutFor(def), [def]);
  const heading = isNew
    ? `Add ${noun}`
    : (String(draft[titleField] ?? '').trim() || 'Untitled');
  const href = isNew ? null : previewHref(listKey, item);

  return (
    <div>
      {/* ── the save bar ───────────────────────────────────────────────── */}
      {/* Sticky, and it replaces nothing: the page keeps its own header, so
          where you are does not change just because something is unsaved. */}
      <div className={`sticky top-0 z-20 -mx-6 md:-mx-8 px-6 md:px-8 mb-4 transition-all ${
        dirty ? 'py-3 bg-cosmic-900 border-b border-gold-500/30 shadow-lg shadow-black/30' : 'h-0 overflow-hidden'}`}>
        {dirty && (
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-gold-400 shrink-0" />
            <span className="text-sm text-gray-200">Unsaved changes</span>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => { setDraft(original); setShowErrors(false); }}
                className="px-3 py-1.5 text-xs rounded-lg border border-gold-600/25 text-gray-300 hover:text-gray-100 hover:border-gold-500/50">
                Discard
              </button>
              <button onClick={save} disabled={saving}
                className="btn-gold px-4 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-50">
                {saving && <Loader className="w-3 h-3 animate-spin" />} Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 mb-5">
        <button onClick={onBack} title={`Back to ${def.label}`}
          className="p-2 rounded-lg text-gray-400 hover:text-gold-300 hover:bg-cosmic-800 mt-0.5 shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-2xl text-gold-300 truncate">{heading}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{def.label}</p>
        </div>
        {href && (
          <a href={href} target="_blank" rel="noreferrer"
            className="px-3 py-2 rounded-lg text-xs border border-gold-600/25 text-gray-300 hover:text-gold-300 hover:border-gold-500/50 flex items-center gap-1.5 shrink-0">
            <ExternalLink className="w-3.5 h-3.5" /> View on site
          </a>
        )}
      </div>

      {showErrors && missing.length > 0 && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-200">
            {missing.length === 1 ? 'One thing is still needed:' : 'A few things are still needed:'}{' '}
            {missing.map(f => f.label).join(', ')}.
          </p>
        </div>
      )}

      {/* ── the two columns ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start pb-8">
        <div className="lg:col-span-2 space-y-5">
          {cards.map(card => (
            <Card key={card.key} title={card.key === 'basics' ? null : card.title}>
              {card.fields.map(f => (
                <div key={f.key} className={showErrors && f.required && String(draft[f.key] ?? '').trim() === ''
                  ? 'rounded-lg ring-1 ring-red-500/40 p-2 -m-2' : ''}>
                  <Field field={f} value={draft[f.key]} onChange={v => set(f.key, v)}
                    autoFocus={isNew && f.key === titleField} />
                </div>
              ))}
            </Card>
          ))}
        </div>

        <div className="space-y-5">
          <Card title="Status">
            <div className="flex items-start gap-3">
              <Toggle checked={draft.is_active !== false} onChange={v => set('is_active', v)} />
              <div>
                <p className="text-sm text-gray-200 leading-tight">
                  {draft.is_active !== false ? 'Live on the site' : 'Hidden'}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {draft.is_active !== false
                    ? 'Visitors can see this.'
                    : 'Kept here, but nobody on the site sees it.'}
                </p>
              </div>
            </div>
          </Card>

          {aside.map(card => (
            <Card key={card.key} title={card.title}>
              {card.fields.map(f => (
                <Field key={f.key} field={f} value={draft[f.key]} onChange={v => set(f.key, v)} />
              ))}
            </Card>
          ))}

          {!isNew && (
            <button onClick={() => onDelete(item)}
              className="w-full px-4 py-2.5 rounded-xl border border-red-500/25 text-red-300 text-sm hover:bg-red-500/10 hover:border-red-500/50 flex items-center justify-center gap-2 transition-colors">
              <Trash2 className="w-4 h-4" /> Delete this {noun}
            </button>
          )}
        </div>
      </div>

      {/* A new row has nothing to be unsaved against until something is typed,
          so it needs a Save of its own rather than only the bar above. */}
      {isNew && !dirty && (
        <div className="flex justify-end pb-8">
          <button onClick={save} disabled={saving} className="btn-gold px-5 py-2 text-sm">
            Save {noun}
          </button>
        </div>
      )}
    </div>
  );
}
