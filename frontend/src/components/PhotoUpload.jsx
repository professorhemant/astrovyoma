import React, { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import toast from 'react-hot-toast';

const MAX_INPUT_BYTES = 8 * 1024 * 1024; // 8 MB file limit
const TARGET_PX = 320;                   // resize long edge to 320px
const JPEG_QUALITY = 0.82;

function resizeToBase64(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const { naturalWidth: w, naturalHeight: h } = img;
      const scale = Math.min(1, TARGET_PX / Math.max(w, h));
      const tw = Math.round(w * scale);
      const th = Math.round(h * scale);
      const canvas = document.createElement('canvas');
      canvas.width  = tw;
      canvas.height = th;
      canvas.getContext('2d').drawImage(img, 0, 0, tw, th);
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('load failed')); };
    img.src = objectUrl;
  });
}

// value   — current photo_url (base64 data URI or https:// URL or '')
// onChange — called with new base64 string (or '' to clear)
// name    — used for the dicebear fallback avatar seed
// size    — diameter in px (default 112)
export default function PhotoUpload({ value, onChange, name = '', size = 112 }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const fallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'pandit')}`;
  const src = value || fallback;
  const hasCustom = Boolean(value);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_INPUT_BYTES) {
      toast.error('Photo must be under 8 MB');
      return;
    }
    setBusy(true);
    try {
      const b64 = await resizeToBase64(file);
      onChange(b64);
    } catch {
      toast.error('Could not process image. Try a different file.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Main circle */}
        <button
          type="button"
          onClick={() => !busy && inputRef.current?.click()}
          className="w-full h-full rounded-full overflow-hidden border-2 border-dashed border-gold-600/40 hover:border-gold-500 transition-all bg-cosmic-900 group"
          style={{ boxShadow: hasCustom ? '0 0 18px rgba(201,168,76,0.25)' : undefined }}
          title="Upload photo"
        >
          {busy ? (
            <div className="w-full h-full flex items-center justify-center bg-cosmic-900">
              <div className="w-7 h-7 rounded-full border-2 border-gold-400/30 border-t-gold-400 animate-spin" />
            </div>
          ) : (
            <>
              <img
                src={src}
                alt={name || 'Profile'}
                className="w-full h-full object-cover"
                onError={e => { e.target.onerror = null; e.target.src = fallback; }}
              />
              <div className="absolute inset-0 rounded-full bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white drop-shadow" />
              </div>
            </>
          )}
        </button>

        {/* Remove badge — only shown when there is a custom photo */}
        {hasCustom && !busy && (
          <button
            type="button"
            onClick={() => onChange('')}
            title="Remove photo"
            className="absolute top-0 right-0 w-6 h-6 rounded-full bg-red-500 border-2 border-cosmic-900 flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />

      <p className="text-gray-600 text-[11px] text-center leading-relaxed">
        {busy ? 'Processing…' : 'Click to upload · JPG PNG WEBP · Max 8 MB'}
      </p>
    </div>
  );
}
