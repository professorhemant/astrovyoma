import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Loader, Save, Trash2, X, Upload, Plus } from 'lucide-react';
import { admin as adminApi } from '../../api';

// The properties panel for whatever is selected in the preview.
//
// Two kinds of selection arrive here:
//   item     — a row from a content list (a testimonial, a menu link). Every
//              field the list declares is editable, plus delete.
//   position — one of the draggable hero overlays. Its numbers are editable by
//              hand as well as by dragging, since typing 40 is easier than
//              dragging to exactly 40.

function Input({ field, value, onChange }) {
  const base = 'w-full bg-cosmic-900 border border-gold-600/20 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-gold-500';
  const [busy, setBusy] = useState(false);
  const fileRef = React.useRef(null);

  async function upload(file) {
    if (!file) return;
    setBusy(true);
    try {
      const { data } = await adminApi.uploadImage(file);
      onChange(data.url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Upload failed');
    } finally { setBusy(false); }
  }

  if (field.type === 'image') {
    return (
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); upload(e.dataTransfer.files?.[0]); }}
        className="space-y-1.5">
        {value && <img src={value} alt="" className="h-16 rounded border border-gold-600/20 object-cover" />}
        <div className="flex gap-1.5">
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => upload(e.target.files?.[0])} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}
            className="btn-outline-gold px-2 py-1 text-[11px] flex items-center gap-1 disabled:opacity-50">
            {busy ? <Loader className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            {value ? 'Replace' : 'Upload'}
          </button>
          {value && (
            <button type="button" onClick={() => onChange('')}
              className="px-2 py-1 text-[11px] text-red-300 hover:text-red-200 flex items-center gap-1">
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          )}
        </div>
        <input type="text" className={base} value={value ?? ''} placeholder="or paste a URL"
          onChange={e => onChange(e.target.value)} />
      </div>
    );
  }
  if (field.type === 'boolean') {
    return (
      <button type="button" onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full relative transition-colors ${value ? 'bg-gold-500' : 'bg-cosmic-700'}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? 'left-5' : 'left-0.5'}`} />
      </button>
    );
  }
  if (field.type === 'number') {
    return <input type="number" className={base} value={value ?? ''} min={field.min} max={field.max}
      onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))} />;
  }
  if (field.type === 'select') {
    return (
      <select className={base} value={value ?? ''} onChange={e => onChange(e.target.value)}>
        {(field.options || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  }
  if (field.type === 'color') {
    return (
      <div className="flex gap-1.5 items-center">
        <input type="color" value={value || '#c9a84c'} onChange={e => onChange(e.target.value)}
          className="w-8 h-7 rounded border border-gold-600/20 bg-cosmic-900" />
        <input type="text" className={base} value={value ?? ''} onChange={e => onChange(e.target.value)} />
      </div>
    );
  }
  if (field.type === 'textarea' || field.type === 'richtext') {
    return <textarea rows={4} className={`${base} resize-y`} value={value ?? ''}
      onChange={e => onChange(e.target.value)} />;
  }
  return <input type="text" className={base} value={value ?? ''} onChange={e => onChange(e.target.value)} />;
}

export default function EditorProperties({ selection, schema, settings, onSettingsChange, onAfterChange, onClose }) {
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);

  // Load the selected row. Settings selections need no fetch — the admin
  // already holds them.
  useEffect(() => {
    if (!selection) { setDraft(null); return; }
    if (selection.kind !== 'item') { setDraft(null); return; }
    let cancelled = false;
    adminApi.contentList(selection.listKey)
      .then(r => {
        if (cancelled) return;
        setDraft(r.data.items.find(i => i.id === selection.id) || null);
      })
      .catch(() => toast.error('Could not load that item'));
    return () => { cancelled = true; };
  }, [selection]);

  if (!selection || selection.kind === 'none') {
    return (
      <div className="text-xs text-gray-500 p-4 border border-dashed border-gold-600/20 rounded-xl">
        Click anything outlined in the preview to edit it.
        <br /><br />
        <span className="text-gold-500/70">Gold outline</span> — can be dragged to move.
        <br />
        <span className="text-blue-300/70">Blue outline</span> — click to edit its text, image and links.
      </div>
    );
  }

  // ── a draggable overlay ──
  if (selection.kind === 'position') {
    const group = (schema?.settingsGroups || []).find(g => g.key === 'layout');
    const prefix = { mandala: 'mandala', clock: 'clock', heroButtons: 'heroButton' }[selection.key] || '';
    const fields = (group?.fields || []).filter(f => f.key.startsWith(prefix));
    return (
      <Panel title={selection.label} onClose={onClose}>
        <p className="text-[11px] text-gray-500 mb-3">
          Drag it in the preview, or type exact numbers here.
        </p>
        {fields.map(f => (
          <div key={f.key} className="mb-3">
            <label className="block text-[11px] text-gold-400/80 mb-1">{f.label}</label>
            <Input field={f} value={settings?.[f.key]}
              onChange={v => onSettingsChange({ [f.key]: v })} />
            {f.help && <p className="text-[10px] text-gray-600 mt-1">{f.help}</p>}
          </div>
        ))}
        <p className="text-[10px] text-gray-600">
          Changes here join the pending list — press Save above to publish them.
        </p>
      </Panel>
    );
  }

  // ── a content row ──
  const def = schema?.lists?.[selection.listKey];
  if (!def) return <Panel title="Unknown item" onClose={onClose}>Nothing editable here.</Panel>;
  if (!draft) {
    return <Panel title={def.label} onClose={onClose}>
      <div className="flex justify-center py-6"><Loader className="w-5 h-5 text-gold-400 animate-spin" /></div>
    </Panel>;
  }

  async function save() {
    setBusy(true);
    try {
      await adminApi.contentUpdate(selection.listKey, selection.id, draft);
      toast.success('Saved — live on the site now');
      onAfterChange?.();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to save');
    } finally { setBusy(false); }
  }

  async function remove() {
    if (!window.confirm(`Delete this ${def.label.replace(/s$/, '').toLowerCase()}?\n\nIt disappears from the site immediately and cannot be undone.`)) return;
    setBusy(true);
    try {
      await adminApi.contentDelete(selection.listKey, selection.id);
      toast.success('Deleted');
      onAfterChange?.();
      onClose?.();
    } catch { toast.error('Failed to delete'); }
    finally { setBusy(false); }
  }

  async function addAnother() {
    setBusy(true);
    try {
      const blank = {};
      for (const f of def.fields) blank[f.key] = f.default ?? (f.type === 'number' ? 0 : f.type === 'boolean' ? false : '');
      // Seed the required fields so the server does not reject an empty row.
      for (const f of def.fields) if (f.required && !blank[f.key]) blank[f.key] = 'New ' + f.label.toLowerCase();
      await adminApi.contentCreate(selection.listKey, blank);
      toast.success('Added — scroll the preview to find it');
      onAfterChange?.();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to add');
    } finally { setBusy(false); }
  }

  return (
    <Panel title={def.label} onClose={onClose}>
      {def.fields.map(f => (
        <div key={f.key} className="mb-3">
          <label className="block text-[11px] text-gold-400/80 mb-1">
            {f.label}{f.required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
          <Input field={f} value={draft[f.key]} onChange={v => setDraft(d => ({ ...d, [f.key]: v }))} />
          {f.help && <p className="text-[10px] text-gray-600 mt-1">{f.help}</p>}
        </div>
      ))}

      <div className="flex gap-1.5 pt-2 border-t border-gold-600/10">
        <button onClick={save} disabled={busy} className="btn-gold px-3 py-1.5 text-[11px] flex items-center gap-1 disabled:opacity-40">
          {busy ? <Loader className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
        </button>
        <button onClick={addAnother} disabled={busy}
          className="btn-outline-gold px-3 py-1.5 text-[11px] flex items-center gap-1 disabled:opacity-40">
          <Plus className="w-3 h-3" /> Add another
        </button>
        <button onClick={remove} disabled={busy}
          className="ml-auto px-2 py-1.5 text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1">
          <Trash2 className="w-3 h-3" /> Delete
        </button>
      </div>
    </Panel>
  );
}

function Panel({ title, onClose, children }) {
  return (
    <div className="border border-gold-600/25 rounded-xl bg-cosmic-900/60 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gold-600/15 bg-cosmic-900">
        <span className="text-xs font-medium text-gold-400">{title}</span>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300"><X className="w-3.5 h-3.5" /></button>
      </div>
      <div className="p-3 max-h-[62vh] overflow-y-auto">{children}</div>
    </div>
  );
}
