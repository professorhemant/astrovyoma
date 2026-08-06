import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Loader, Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff,
  RotateCcw, Save, X, GripVertical,
} from 'lucide-react';
import { admin as adminApi } from '../../api';

// One editor for every list on the site. It renders itself from the schema the
// server sends, so a new editable list needs no new screen here — the fields,
// their labels and their help text all arrive as data.

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
        return (
          <div className="space-y-2">
            <input type="text" className={base} value={value ?? ''} placeholder="Image URL"
              onChange={e => onChange(e.target.value)} />
            {value && <img src={value} alt="" className="h-16 rounded-lg border border-gold-600/20 object-cover" />}
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

function Row({ item, def, index, count, onSave, onDelete, onMove, onToggle }) {
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
    <div className={`border rounded-xl mb-2 transition-colors ${item.is_active ? 'border-gold-600/20 bg-cosmic-900/40' : 'border-cosmic-700 bg-cosmic-900/20'}`}>
      <div className="flex items-center gap-2 px-3 py-2.5">
        <GripVertical className="w-4 h-4 text-gray-600 shrink-0" />

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
  async function handleMove(index, delta) {
    const next = [...items];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    try {
      await adminApi.contentReorder(listKey, next.map(i => i.id));
    } catch {
      toast.error('Could not save the new order');
      load();
    }
  }

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
        Click a row to edit it. Changes go live the moment you save — no deploy needed.
      </p>

      {loading ? (
        <div className="flex justify-center py-10"><Loader className="w-6 h-6 text-gold-400 animate-spin" /></div>
      ) : (
        <>
          {items.map((item, i) => (
            <Row key={item.id} item={item} def={def} index={i} count={items.length}
              onSave={handleSave} onDelete={handleDelete} onMove={handleMove} onToggle={handleToggle} />
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
