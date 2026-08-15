import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Loader, Save, Trash2, Upload, Plus, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { admin as adminApi } from '../../api';

// The properties panel for whatever is selected in the preview.
//
// Two kinds of selection arrive here:
//   item     — a row from a content list (a testimonial, a menu link). Every
//              field the list declares is editable, plus delete.
//   position — one of the draggable hero overlays. Its numbers are editable by
//              hand as well as by dragging, since typing 40 is easier than
//              dragging to exactly 40.
//
// Everything saved from here is live immediately, matching the rest of the
// editor. The one button called Save is the one below, and it names the thing
// it saves — there is no second Save in the toolbar to confuse it with.

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

// A setting that writes as soon as you are done with it.
//
// Applying every keystroke would send "4" on the way to "40" and put the wheel
// somewhere it was never asked to go, so typed fields hold a local value and
// commit when they lose focus or you press Enter. Switches, pickers and dropdowns
// have no half-typed state, so they commit at once.
function LiveField({ field, value, onCommit }) {
  const typed = !['boolean', 'select', 'color', 'image'].includes(field.type);
  const [local, setLocal] = useState(value);

  // Follow the stored value when it moves underneath us — dragging the same
  // element in the preview should update the number shown here.
  useEffect(() => { setLocal(value); }, [value]);

  if (!typed) return <Input field={field} value={value} onChange={onCommit} />;

  const commit = () => {
    if (local === '' || local === undefined || local === value) { setLocal(value); return; }
    onCommit(local);
  };
  return (
    <span onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commit(); } }}>
      <Input field={field} value={local} onChange={setLocal} />
    </span>
  );
}

// A four-way move control on every selection.
//
// What the arrows do depends on what the thing is, because "move left" cannot
// mean the same for something floating over the banner as for a card in a row:
//   positioned  nudge its coordinates
//   heading     up/down changes the space above it, left/right its alignment
//   list row    move it earlier or later among its siblings
// Same control, honest behaviour underneath.
function MoveControls({ hint, onMove, busy }) {
  const btn = 'w-8 h-8 rounded-lg border border-gold-600/25 text-gold-300 hover:bg-gold-500/15 disabled:opacity-30 flex items-center justify-center';
  return (
    <div className="mb-3 pb-3 border-b border-gold-600/10">
      <label className="block text-[11px] text-gold-400/80 mb-1.5">Move</label>
      <div className="flex items-center gap-3">
        <div className="grid grid-cols-3 gap-1 w-[104px]">
          <span />
          <button disabled={busy} onClick={() => onMove('up')} className={btn} title="Up"><ChevronUp className="w-4 h-4" /></button>
          <span />
          <button disabled={busy} onClick={() => onMove('left')} className={btn} title="Left"><ChevronLeft className="w-4 h-4" /></button>
          <span />
          <button disabled={busy} onClick={() => onMove('right')} className={btn} title="Right"><ChevronRight className="w-4 h-4" /></button>
          <span />
          <button disabled={busy} onClick={() => onMove('down')} className={btn} title="Down"><ChevronDown className="w-4 h-4" /></button>
          <span />
        </div>
        <p className="text-[10px] text-gray-500 flex-1">{hint}</p>
      </div>
    </div>
  );
}

export default function EditorProperties({ selection, schema, settings, onSettingsChange, onRecord, onAfterChange, onClose }) {
  const [draft, setDraft] = useState(null);
  const [siblings, setSiblings] = useState([]);
  const [busy, setBusy] = useState(false);
  const original = React.useRef(null);   // the row as loaded, so Undo has something to restore

  // Load the selected row. Settings selections need no fetch — the admin
  // already holds them.
  useEffect(() => {
    if (!selection) { setDraft(null); return; }
    if (selection.kind !== 'item') { setDraft(null); return; }
    let cancelled = false;
    adminApi.contentList(selection.listKey)
      .then(r => {
        if (cancelled) return;
        const row = r.data.items.find(i => i.row_id === selection.id) || null;
        setSiblings(r.data.items);
        setDraft(row);
        original.current = row ? { ...row } : null;
      })
      .catch(() => toast.error('Could not load that item'));
    return () => { cancelled = true; };
  }, [selection]);

  if (!selection || selection.kind === 'none') {
    return (
      <div className="text-xs text-gray-500 p-4 border border-dashed border-gold-600/20 rounded-xl">
        Click anything outlined in the preview to edit it.
        <br /><br />
        <span className="text-gold-500/70">Gold outline</span> — drag it anywhere over the banner.
        <br />
        <span className="text-blue-300/70">Blue outline</span> — click to edit its text, images and
        links, or drag it into a different place in its row.
      </div>
    );
  }

  // ── a draggable overlay ──
  if (selection.kind === 'position') {
    const group = (schema?.settingsGroups || []).find(g => g.key === 'layout');
    const prefix = {
      mandala: 'mandala', clock: 'clock', heroButtons: 'heroButton', marquee: 'heroMarquee',
    }[selection.key] || '';
    const fields = (group?.fields || []).filter(f => f.key.startsWith(prefix));
    // 1% sideways, 8px vertically — a visible nudge without overshooting.
    const nudge = (dir) => {
      const cur = (k, d) => (Number.isFinite(settings?.[k]) ? settings[k] : d);
      if (selection.key === 'mandala') {
        if (dir === 'left')  return onSettingsChange({ mandalaLeft: Math.max(0, cur('mandalaLeft', 15) - 1) });
        if (dir === 'right') return onSettingsChange({ mandalaLeft: Math.min(100, cur('mandalaLeft', 15) + 1) });
        if (dir === 'up')    return onSettingsChange({ mandalaTop: Math.max(0, cur('mandalaTop', 44) - 1) });
        return onSettingsChange({ mandalaTop: Math.min(100, cur('mandalaTop', 44) + 1) });
      }
      if (selection.key === 'clock') {
        if (dir === 'left')  return onSettingsChange({ clockLeft: Math.max(0, cur('clockLeft', 15) - 1) });
        if (dir === 'right') return onSettingsChange({ clockLeft: Math.min(100, cur('clockLeft', 15) + 1) });
        if (dir === 'up')    return onSettingsChange({ clockBottom: cur('clockBottom', 8) + 8 });
        return onSettingsChange({ clockBottom: Math.max(-50, cur('clockBottom', 8) - 8) });
      }
      // The scrolling line is placed as a percentage of the banner both ways,
      // and unlike the wheel and the clock it cannot be dragged in the preview —
      // it is moving, so there is nothing still to take hold of. These arrows
      // are the only way to place it, which is why they nudge it rather than
      // leaving it to the number boxes below.
      if (selection.key === 'marquee') {
        if (dir === 'left')  return onSettingsChange({ heroMarqueeLeft: Math.max(0, cur('heroMarqueeLeft', 63) - 1) });
        if (dir === 'right') return onSettingsChange({ heroMarqueeLeft: Math.min(100, cur('heroMarqueeLeft', 63) + 1) });
        if (dir === 'up')    return onSettingsChange({ heroMarqueeTop: Math.max(0, cur('heroMarqueeTop', 59) - 1) });
        return onSettingsChange({ heroMarqueeTop: Math.min(100, cur('heroMarqueeTop', 59) + 1) });
      }
      // The hero buttons are centred, so only their height is adjustable.
      if (dir === 'up')   return onSettingsChange({ heroButtonBottom: cur('heroButtonBottom', 56) + 8 });
      if (dir === 'down') return onSettingsChange({ heroButtonBottom: Math.max(0, cur('heroButtonBottom', 56) - 8) });
    };

    return (
      <Panel title={selection.label} onClose={onClose}>
        <MoveControls
          onMove={nudge}
          hint={{
            heroButtons: 'Up and down change the height over the banner. These buttons stay centred.',
            marquee: 'Moves it 1% at a time. The words are always moving, so there is nothing still to take hold of in the preview — these arrows and the boxes below are how it is placed.',
          }[selection.key] || 'Nudges it 1% sideways or 8px up and down. Dragging in the preview is faster for big moves.'}
        />
        <p className="text-[11px] text-gray-500 mb-3">
          {selection.key === 'marquee'
            ? 'Type exact numbers here and press Enter, or use the arrows above.'
            : 'Drag it in the preview, or type exact numbers here and press Enter.'}
        </p>
        {fields.map(f => (
          <div key={f.key} className="mb-3">
            <label className="block text-[11px] text-gold-400/80 mb-1">{f.label}</label>
            <LiveField field={f} value={settings?.[f.key]}
              onCommit={v => onSettingsChange({ [f.key]: v })} />
            {f.help && <p className="text-[10px] text-gray-600 mt-1">{f.help}</p>}
          </div>
        ))}
        <p className="text-[10px] text-gray-600">
          Saved to the live site as soon as you change them. Undo above takes
          back the last change.
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
      if (original.current) {
        onRecord?.({ kind: 'item', listKey: selection.listKey, id: selection.id,
          patch: original.current, label: 'that edit' });
      }
      toast.success('Saved — live on the site now');
      onAfterChange?.();
      // Close on success. Leaving it open over a preview that is reloading
      // underneath reads as though the save had not taken.
      onClose?.();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to save');
    } finally { setBusy(false); }
  }

  async function remove() {
    if (!window.confirm(`Delete this from "${def.label}"?\n\nIt disappears from the site immediately and cannot be undone.`)) return;
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

  // Headings move by spacing and alignment; everything else moves by changing
  // places with the sibling before or after it.
  const isHeading = selection.listKey === 'section_headings';
  const index = siblings.findIndex(i => i.row_id === selection.id);

  async function move(dir) {
    if (isHeading) {
      const next = { ...draft };
      const order = ['left', 'center', 'right'];
      if (dir === 'up')    next.spaceAbove = Math.max(-80, (Number(next.spaceAbove) || 0) - 8);
      if (dir === 'down')  next.spaceAbove = Math.min(200, (Number(next.spaceAbove) || 0) + 8);
      if (dir === 'left' || dir === 'right') {
        const at = Math.max(0, order.indexOf(next.align || 'center'));
        next.align = order[Math.max(0, Math.min(2, at + (dir === 'right' ? 1 : -1)))];
      }
      const before = { spaceAbove: draft.spaceAbove, align: draft.align };
      setDraft(next);
      setBusy(true);
      try {
        await adminApi.contentUpdate(selection.listKey, selection.id, next);
        onRecord?.({ kind: 'item', listKey: selection.listKey, id: selection.id,
          patch: before, label: 'that move' });
        onAfterChange?.();
      } catch { toast.error('Could not move that'); }
      finally { setBusy(false); }
      return;
    }

    const delta = (dir === 'left' || dir === 'up') ? -1 : 1;
    const to = index + delta;
    if (index < 0 || to < 0 || to >= siblings.length) return;
    const was = siblings.map(i => i.row_id);
    const ids = [...was];
    [ids[index], ids[to]] = [ids[to], ids[index]];
    setBusy(true);
    try {
      const { data } = await adminApi.contentReorder(selection.listKey, ids);
      setSiblings(data.items);
      onRecord?.({ kind: 'reorder', listKey: selection.listKey, ids: was, label: 'that move' });
      onAfterChange?.();
    } catch { toast.error('Could not move that'); }
    finally { setBusy(false); }
  }

  return (
    <Panel title={def.label} onClose={onClose}>
      <MoveControls
        busy={busy}
        onMove={move}
        hint={isHeading
          ? 'Up and down change the space above. Left and right change its alignment.'
          : `Swaps places with the one before or after it — or just drag it in the preview. Currently ${index + 1} of ${siblings.length}.`}
      />
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
        <button onClick={save} disabled={busy} className="btn-gold px-3 py-1.5 text-[11px] flex items-center gap-1 disabled:opacity-40"
          title={`Save the text and images of this row of ${def.label}`}>
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

// The panel lives in the column beside the preview, so leaving it means going
// back to the list of everything on the page rather than closing a window. A
// back arrow says that; an X said the settings were being dismissed.
function Panel({ title, onClose, children }) {
  return (
    <div>
      <button onClick={onClose}
        className="flex items-center gap-1.5 mb-3 text-xs text-gray-400 hover:text-gold-300 transition-colors">
        <ChevronLeft className="w-3.5 h-3.5" /> All sections
      </button>
      <p className="text-xs font-medium text-gold-300 mb-3">{title}</p>
      {children}
    </div>
  );
}
