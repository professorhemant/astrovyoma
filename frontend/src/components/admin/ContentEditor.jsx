import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Loader, Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff,
  RotateCcw, Save, X, GripVertical, Upload,
} from 'lucide-react';
import { admin as adminApi } from '../../api';

// One editor for every list on the site. It renders itself from the schema the
// server sends, so a new editable list needs no new screen here — the fields,
// their labels and their help text all arrive as data.

// ─── image field ─────────────────────────────────────────────────────────────
// Upload from the machine, or paste a URL if the image already lives somewhere.
// Uploads are resized and converted to WebP server-side, so a photo straight off
// a phone is fine.
function ImageField({ value, onChange, inputClass }) {
  const [busy, setBusy] = useState(false);
  const [hover, setHover] = useState(false);
  const inputRef = React.useRef(null);

  async function send(file) {
    if (!file) return;
    if (!/^image\//.test(file.type)) { toast.error('That is not an image file'); return; }
    setBusy(true);
    try {
      const { data } = await adminApi.uploadImage(file);
      onChange(data.url);
      const kb = (n) => `${Math.round(n / 1024)} KB`;
      toast.success(`Uploaded — ${kb(data.originalSize)} shrunk to ${kb(data.size)}`);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Upload failed');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';   // allow re-picking the same file
    }
  }

  const pick = (e) => send(e.target.files?.[0]);

  return (
    <div
      // Drop a picture straight from the desktop onto the field.
      onDragOver={e => { e.preventDefault(); setHover(true); }}
      onDragLeave={() => setHover(false)}
      onDrop={e => { e.preventDefault(); setHover(false); send(e.dataTransfer.files?.[0]); }}
      className={`space-y-2 rounded-lg transition-colors ${hover ? 'ring-2 ring-gold-400 ring-offset-2 ring-offset-cosmic-950' : ''}`}>
      {hover && <p className="text-[11px] text-gold-300">Drop the image here to upload</p>}
      <div className="flex items-center gap-2">
        <input ref={inputRef} type="file" accept="image/*" onChange={pick} className="hidden" />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}
          className="btn-outline-gold px-3 py-1.5 text-xs flex items-center gap-1.5 shrink-0 disabled:opacity-50">
          {busy ? <Loader className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
          {busy ? 'Uploading…' : 'Upload'}
        </button>
        <input type="text" className={inputClass} value={value ?? ''} placeholder="…or paste an image URL"
          onChange={e => onChange(e.target.value)} />
        {value && (
          <button type="button" onClick={() => onChange('')} title="Remove image"
            className="p-1.5 text-gray-500 hover:text-red-300 shrink-0"><X className="w-4 h-4" /></button>
        )}
      </div>
      {value && <img src={value} alt="" className="h-20 rounded-lg border border-gold-600/20 object-cover" />}
    </div>
  );
}

// ─── one field ───────────────────────────────────────────────────────────────

function Field({ field, value, onChange }) {
  const base = 'w-full bg-cosmic-900 border border-gold-600/20 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-gold-500 transition-colors';

  const control = () => {
    switch (field.type) {
      case 'boolean':
        return (
          <button type="button" onClick={() => onChange(!value)}
            className={`w-11 h-6 rounded-full transition-colors relative ${value ? 'bg-gold-500' : 'bg-cosmic-700'}`}>
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value ? 'left-6' : 'left-1'}`} />
          </button>
        );
      case 'number':
        return (
          <input type="number" className={base} value={value ?? ''}
            min={field.min} max={field.max}
            onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))} />
        );
      case 'textarea':
      case 'richtext':
        return <textarea rows={field.type === 'richtext' ? 5 : 3} className={`${base} resize-y`}
          value={value ?? ''} onChange={e => onChange(e.target.value)} />;
      case 'select':
        return (
          <select className={base} value={value ?? ''} onChange={e => onChange(e.target.value)}>
            {(field.options || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        );
      case 'image':
        return <ImageField value={value} onChange={onChange} inputClass={base} />;
      case 'color':
        return (
          <div className="flex items-center gap-2">
            <input type="color" value={value || '#c9a84c'} onChange={e => onChange(e.target.value)}
              className="w-10 h-9 rounded border border-gold-600/20 bg-cosmic-900 cursor-pointer" />
            <input type="text" className={base} value={value ?? ''} onChange={e => onChange(e.target.value)} />
          </div>
        );
      default:
        return <input type="text" className={base} value={value ?? ''} onChange={e => onChange(e.target.value)} />;
    }
  };

  return (
    <div>
      <label className="block text-xs text-gold-400/80 mb-1">
        {field.label}{field.required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {control()}
      {field.help && <p className="text-[11px] text-gray-500 mt-1">{field.help}</p>}
    </div>
  );
}

// ─── one row ─────────────────────────────────────────────────────────────────

function Row({ item, def, index, count, onSave, onDelete, onMove, onToggle, drag }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(item);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setDraft(item); }, [item]);

  const dirty = def.fields.some(f => (draft[f.key] ?? '') !== (item[f.key] ?? ''));
  const title = draft[def.titleField] || '(untitled)';

  async function save() {
    setSaving(true);
    const ok = await onSave(item.id, draft);
    setSaving(false);
    if (ok) setOpen(false);
  }

  return (
    <div
      // Only the handle starts a drag, so selecting text in an open row does
      // not turn into a drag. The row itself still has to accept the drop.
      draggable={drag.dragging}
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; drag.onStart(index); }}
      onDragEnd={drag.onEnd}
      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; drag.onOver(index); }}
      onDrop={e => { e.preventDefault(); drag.onDrop(index); }}
      className={`border rounded-xl mb-2 transition-all
        ${item.is_active ? 'border-gold-600/20 bg-cosmic-900/40' : 'border-cosmic-700 bg-cosmic-900/20'}
        ${drag.fromIndex === index ? 'opacity-40' : ''}
        ${drag.overIndex === index && drag.fromIndex !== null && drag.fromIndex !== index
          ? 'border-gold-400 ring-1 ring-gold-400/40' : ''}`}>
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          title="Drag to reorder"
          onMouseDown={() => drag.setDragging(true)}
          onMouseUp={() => drag.setDragging(false)}
          onTouchStart={() => drag.setDragging(true)}
          onTouchEnd={() => drag.setDragging(false)}
          className="cursor-grab active:cursor-grabbing text-gray-600 hover:text-gold-400 shrink-0 touch-none">
          <GripVertical className="w-4 h-4" />
        </button>

        <button onClick={() => setOpen(o => !o)} className="flex-1 text-left min-w-0">
          <span className={`text-sm truncate block ${item.is_active ? 'text-gray-200' : 'text-gray-500 line-through'}`}>
            {title}
          </span>
        </button>

        {dirty && <span className="text-[10px] text-yellow-300 shrink-0">unsaved</span>}

        {/* Move up / down — the "shift" control. */}
        <button onClick={() => onMove(index, -1)} disabled={index === 0} title="Move up"
          className="p-1 text-gray-400 hover:text-gold-400 disabled:opacity-25 disabled:hover:text-gray-400">
          <ChevronUp className="w-4 h-4" />
        </button>
        <button onClick={() => onMove(index, 1)} disabled={index === count - 1} title="Move down"
          className="p-1 text-gray-400 hover:text-gold-400 disabled:opacity-25 disabled:hover:text-gray-400">
          <ChevronDown className="w-4 h-4" />
        </button>

        <button onClick={() => onToggle(item)} title={item.is_active ? 'Hide from site' : 'Show on site'}
          className="p-1 text-gray-400 hover:text-gold-400">
          {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        <button onClick={() => onDelete(item, title)} title="Delete"
          className="p-1 text-red-400 hover:text-red-300">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {open && (
        <div className="px-3 pb-3 pt-1 border-t border-gold-600/10 space-y-3">
          {def.fields.map(f => (
            <Field key={f.key} field={f} value={draft[f.key]}
              onChange={v => setDraft(d => ({ ...d, [f.key]: v }))} />
          ))}
          <div className="flex gap-2 pt-1">
            <button onClick={save} disabled={saving || !dirty}
              className="btn-gold px-4 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-40">
              {saving ? <Loader className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
            </button>
            <button onClick={() => { setDraft(item); setOpen(false); }}
              className="px-4 py-1.5 text-xs text-gray-400 hover:text-gray-200">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── the list ────────────────────────────────────────────────────────────────

export default function ContentEditor({ listKey, def }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null);
  const [fromIndex, setFromIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const [dragArmed, setDragArmed] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminApi.contentList(listKey)
      .then(r => setItems(r.data.items))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [listKey]);

  useEffect(() => { load(); }, [load]);

  async function handleSave(id, draft) {
    try {
      const { data } = await adminApi.contentUpdate(listKey, id, draft);
      setItems(list => list.map(i => (i.id === id ? data : i)));
      toast.success('Saved — live on the site now');
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to save');
      return false;
    }
  }

  async function handleDelete(item, title) {
    if (!window.confirm(`Delete "${title}"?\n\nThis removes it from the site immediately and cannot be undone.`)) return;
    try {
      await adminApi.contentDelete(listKey, item.id);
      setItems(list => list.filter(i => i.id !== item.id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  }

  async function handleToggle(item) {
    try {
      const { data } = await adminApi.contentUpdate(listKey, item.id, { is_active: !item.is_active });
      setItems(list => list.map(i => (i.id === item.id ? data : i)));
      toast.success(data.is_active ? 'Now showing on the site' : 'Hidden from the site');
    } catch { toast.error('Failed'); }
  }

  // Optimistic: the row moves under the cursor, then the order is persisted.
  // On failure the server's order is reloaded rather than left guessed at.
  async function persistOrder(next) {
    setItems(next);
    try {
      await adminApi.contentReorder(listKey, next.map(i => i.id));
    } catch {
      toast.error('Could not save the new order');
      load();
    }
  }

  async function handleMove(index, delta) {
    const next = [...items];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    await persistOrder(next);
  }

  // Drag to reorder. The ▲▼ buttons stay — they are easier on a touchscreen and
  // are the only way to move a row when the list is long enough to scroll.
  const drag = {
    dragging: dragArmed,
    setDragging: setDragArmed,
    fromIndex,
    overIndex,
    onStart: (i) => setFromIndex(i),
    onOver:  (i) => setOverIndex(i),
    onEnd:   () => { setFromIndex(null); setOverIndex(null); setDragArmed(false); },
    onDrop:  async (to) => {
      const from = fromIndex;
      setFromIndex(null); setOverIndex(null); setDragArmed(false);
      if (from === null || from === to) return;
      const next = [...items];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      await persistOrder(next);
    },
  };

  async function handleAdd(e) {
    e.preventDefault();
    try {
      const { data } = await adminApi.contentCreate(listKey, adding);
      setItems(list => [...list, data]);
      setAdding(null);
      toast.success('Added — live on the site now');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to add');
    }
  }

  async function handleReset() {
    if (!window.confirm(
      `Reset "${def.label}" to the original content?\n\n` +
      'Everything you have added or edited in this list is discarded. This cannot be undone.'
    )) return;
    try {
      const { data } = await adminApi.contentReset(listKey);
      setItems(data.items);
      toast.success('Reset to defaults');
    } catch { toast.error('Failed to reset'); }
  }

  const blank = () => {
    const o = {};
    for (const f of def.fields) o[f.key] = f.default ?? (f.type === 'number' ? 0 : f.type === 'boolean' ? false : '');
    return o;
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-1 gap-4">
        <div>
          <h3 className="font-serif text-xl text-gold-400">{def.label}</h3>
          {def.help && <p className="text-gray-500 text-xs mt-0.5">{def.help}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleReset} title="Restore the original content"
            className="p-2 text-gray-500 hover:text-red-300"><RotateCcw className="w-4 h-4" /></button>
          <button onClick={() => setAdding(blank())} className="btn-gold px-3 py-1.5 text-xs flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>

      <p className="text-[11px] text-gray-600 mb-4">
        Click a row to edit it, or drag the ⠿ handle to reorder. Changes go live
        the moment you save — no deploy needed.
      </p>

      {loading ? (
        <div className="flex justify-center py-10"><Loader className="w-6 h-6 text-gold-400 animate-spin" /></div>
      ) : (
        <>
          {items.map((item, i) => (
            <Row key={item.id} item={item} def={def} index={i} count={items.length}
              onSave={handleSave} onDelete={handleDelete} onMove={handleMove} onToggle={handleToggle}
              drag={drag} />
          ))}
          {items.length === 0 && (
            <p className="text-gray-500 text-sm py-8 text-center">
              Nothing here yet — use Add to create the first one.
            </p>
          )}
        </>
      )}

      {adding && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAdd} className="card-cosmic p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="font-serif text-gold-400">Add to {def.label}</h3>
              <button type="button" onClick={() => setAdding(null)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              {def.fields.map(f => (
                <Field key={f.key} field={f} value={adding[f.key]}
                  onChange={v => setAdding(a => ({ ...a, [f.key]: v }))} />
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button type="submit" className="btn-gold px-5 py-2 text-sm flex-1">Add</button>
              <button type="button" onClick={() => setAdding(null)}
                className="px-5 py-2 text-sm text-gray-400 hover:text-gray-200">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
