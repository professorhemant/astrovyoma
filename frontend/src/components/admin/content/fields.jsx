import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader, Upload, X, Bold, Heading2, Heading3, List, Quote, Eye, Pencil } from 'lucide-react';
import { admin as adminApi } from '../../../api';
import RichText from '../../RichText';

// The inputs the content admin is built from.
//
// One rule runs through all of them: what you type is what the site stores.
// There is no HTML anywhere — the article format is the four marks the site's
// own renderer understands (## heading, ### sub-heading, - bullet, > callout,
// **bold**) — so the worst thing anyone can do from this screen is misspell
// something. The toolbar below writes those marks for you, which is the only
// part of a word processor most people actually want.

export const inputClass =
  'w-full bg-cosmic-950 border border-gold-600/25 rounded-lg px-3 py-2 text-sm text-gray-100 ' +
  'placeholder:text-gray-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/40 transition';

// ─── pictures ────────────────────────────────────────────────────────────────

export function ImageField({ value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [hover, setHover] = useState(false);
  const [pasted, setPasted] = useState('');
  const inputRef = useRef(null);

  async function send(file) {
    if (!file) return;
    if (!/^image\//.test(file.type)) { toast.error('That is not an image file'); return; }
    setBusy(true);
    try {
      const { data } = await adminApi.uploadImage(file);
      onChange(data.url);
      const kb = n => `${Math.round(n / 1024)} KB`;
      toast.success(`Uploaded — ${kb(data.originalSize)} shrunk to ${kb(data.size)}`);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Upload failed');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';   // let the same file be picked again
    }
  }

  if (value) {
    return (
      <div className="flex items-start gap-3">
        <img src={value} alt="" className="w-24 h-24 rounded-lg border border-gold-600/20 object-cover bg-cosmic-950 shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <input type="text" className={inputClass} value={value} onChange={e => onChange(e.target.value)} />
          <div className="flex gap-2">
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={e => send(e.target.files?.[0])} />
            <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}
              className="px-3 py-1.5 text-xs rounded-lg border border-gold-600/25 text-gray-300 hover:text-gold-300 hover:border-gold-500/50 disabled:opacity-50">
              {busy ? 'Uploading…' : 'Replace'}
            </button>
            <button type="button" onClick={() => onChange('')}
              className="px-3 py-1.5 text-xs rounded-lg text-red-300/80 hover:text-red-300 hover:bg-red-500/10">
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setHover(true); }}
      onDragLeave={() => setHover(false)}
      onDrop={e => { e.preventDefault(); setHover(false); send(e.dataTransfer.files?.[0]); }}
      onClick={() => inputRef.current?.click()}
      className={`rounded-xl border border-dashed px-4 py-7 text-center cursor-pointer transition ${
        hover ? 'border-gold-400 bg-gold-500/10' : 'border-gold-600/30 hover:border-gold-500/60 hover:bg-cosmic-900/40'}`}>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => send(e.target.files?.[0])} />
      {busy
        ? <Loader className="w-5 h-5 text-gold-400 animate-spin mx-auto" />
        : <Upload className="w-5 h-5 text-gold-500/70 mx-auto" />}
      <p className="text-xs text-gray-300 mt-2">{busy ? 'Uploading…' : 'Drop an image here, or click to choose one'}</p>
      <p className="text-[11px] text-gray-600 mt-0.5">Anything off a phone is fine — it is resized and converted for you</p>
      {/* Typed into rather than uploaded, so it is held locally and handed over
          on Enter — writing straight through would swap this whole dropzone for
          the filled state on the first keystroke and take the cursor with it. */}
      <input type="text" placeholder="…or paste an image address, then press Enter" value={pasted}
        onClick={e => e.stopPropagation()}
        onChange={e => setPasted(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (pasted.trim()) onChange(pasted.trim()); } }}
        onBlur={() => { if (pasted.trim()) onChange(pasted.trim()); }}
        className={`${inputClass} mt-3 text-center`} />
    </div>
  );
}

// ─── writing ─────────────────────────────────────────────────────────────────

function ToolButton({ title, onClick, children }) {
  return (
    <button type="button" title={title} onMouseDown={e => e.preventDefault()} onClick={onClick}
      className="p-1.5 rounded-md text-gray-400 hover:text-gold-300 hover:bg-cosmic-800 transition-colors">
      {children}
    </button>
  );
}

export function RichTextField({ value, onChange, rows = 18 }) {
  const ref = useRef(null);
  const [preview, setPreview] = useState(false);
  const text = value ?? '';

  // Every toolbar button edits the selection and puts the cursor back where the
  // writer expects it. Without the restore, typing continues from the top of
  // the box after each click, which makes the toolbar worse than not having one.
  function apply(fn) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? start;
    const { next, cursor } = fn(text, start, end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor[0], cursor[1]);
    });
  }

  // Marks whole lines — headings, bullets and callouts are line-level things, so
  // a selection that starts mid-word still marks the line it is in.
  const linePrefix = mark => apply((src, start, end) => {
    const from = src.lastIndexOf('\n', start - 1) + 1;
    const toEnd = src.indexOf('\n', end);
    const to = toEnd === -1 ? src.length : toEnd;
    const lines = src.slice(from, to).split('\n').map(line => {
      const bare = line.replace(/^(#{2,3}\s+|[-*•]\s+|>\s+)/, '');
      return line.startsWith(mark) ? bare : `${mark}${bare}`;
    });
    const block = lines.join('\n');
    return { next: src.slice(0, from) + block + src.slice(to), cursor: [from, from + block.length] };
  });

  const bold = () => apply((src, start, end) => {
    if (start === end) {
      const next = `${src.slice(0, start)}**bold**${src.slice(end)}`;
      return { next, cursor: [start + 2, start + 6] };
    }
    const chosen = src.slice(start, end);
    const already = chosen.startsWith('**') && chosen.endsWith('**');
    const swapped = already ? chosen.slice(2, -2) : `**${chosen}**`;
    return {
      next: src.slice(0, start) + swapped + src.slice(end),
      cursor: [start, start + swapped.length],
    };
  });

  return (
    <div className="rounded-xl border border-gold-600/25 overflow-hidden bg-cosmic-950">
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gold-600/15 bg-cosmic-900/60">
        <ToolButton title="Bold" onClick={bold}><Bold className="w-3.5 h-3.5" /></ToolButton>
        <ToolButton title="Heading" onClick={() => linePrefix('## ')}><Heading2 className="w-3.5 h-3.5" /></ToolButton>
        <ToolButton title="Sub-heading" onClick={() => linePrefix('### ')}><Heading3 className="w-3.5 h-3.5" /></ToolButton>
        <ToolButton title="Bulleted list" onClick={() => linePrefix('- ')}><List className="w-3.5 h-3.5" /></ToolButton>
        <ToolButton title="Highlighted box" onClick={() => linePrefix('> ')}><Quote className="w-3.5 h-3.5" /></ToolButton>
        <div className="ml-auto">
          <button type="button" onClick={() => setPreview(p => !p)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] text-gray-400 hover:text-gold-300 hover:bg-cosmic-800 transition-colors">
            {preview ? <><Pencil className="w-3 h-3" /> Write</> : <><Eye className="w-3 h-3" /> Preview</>}
          </button>
        </div>
      </div>

      {preview ? (
        <div className="px-4 py-3 min-h-[12rem] max-h-[32rem] overflow-y-auto">
          {text.trim()
            ? <RichText content={text} />
            : <p className="text-gray-600 text-sm italic">Nothing written yet.</p>}
        </div>
      ) : (
        <textarea
          ref={ref} rows={rows} value={text} onChange={e => onChange(e.target.value)}
          placeholder={'Write here.\n\n## A heading\n- a bullet\n> a highlighted line'}
          className="w-full bg-transparent px-4 py-3 text-sm text-gray-100 leading-relaxed resize-y focus:outline-none placeholder:text-gray-700"
        />
      )}
    </div>
  );
}

// ─── one field ───────────────────────────────────────────────────────────────

export function Toggle({ checked, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={!!checked} onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 mt-0.5 ${checked ? 'bg-gold-500' : 'bg-cosmic-700'}`}>
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  );
}

const MONEY = /price/i;

export function Field({ field, value, onChange, autoFocus }) {
  // A switch reads as a setting, not as a form field: the label belongs beside
  // it rather than above it.
  if (field.type === 'boolean') {
    return (
      <div className="flex items-start gap-3 py-1">
        <Toggle checked={!!value} onChange={onChange} />
        <div className="min-w-0">
          <p className="text-sm text-gray-200 leading-tight">{field.label}</p>
          {field.help && <p className="text-[11px] text-gray-500 mt-0.5">{field.help}</p>}
        </div>
      </div>
    );
  }

  const control = () => {
    switch (field.type) {
      case 'number':
        return (
          <div className="relative">
            {MONEY.test(field.key) && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">₹</span>
            )}
            <input type="number" autoFocus={autoFocus} min={field.min} max={field.max} value={value ?? ''}
              onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
              className={`${inputClass} ${MONEY.test(field.key) ? 'pl-7' : ''}`} />
          </div>
        );
      case 'textarea':
        return <textarea rows={3} value={value ?? ''} onChange={e => onChange(e.target.value)}
          className={`${inputClass} resize-y leading-relaxed`} />;
      case 'richtext':
        return <RichTextField value={value} onChange={onChange} />;
      case 'select':
        return (
          <select value={value ?? ''} onChange={e => onChange(e.target.value)} className={inputClass}>
            {(field.options || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        );
      case 'image':
        return <ImageField value={value} onChange={onChange} />;
      case 'color':
        return (
          <div className="flex items-center gap-2">
            <input type="color" value={value || '#c9a84c'} onChange={e => onChange(e.target.value)}
              className="w-10 h-9 rounded border border-gold-600/25 bg-cosmic-950 cursor-pointer shrink-0" />
            <input type="text" value={value ?? ''} onChange={e => onChange(e.target.value)} className={inputClass} />
          </div>
        );
      default:
        return <input type="text" autoFocus={autoFocus} value={value ?? ''}
          onChange={e => onChange(e.target.value)} className={inputClass} />;
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-300 mb-1.5">
        {field.label}{field.required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {control()}
      {field.help && field.type !== 'boolean' && (
        <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">{field.help}</p>
      )}
    </div>
  );
}
