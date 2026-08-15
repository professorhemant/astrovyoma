// Image uploads for the admin dashboard.
//
// Everything is re-encoded to WebP and capped at 1600px on the long edge before
// it is stored, so an admin can upload straight off a phone without thinking
// about file size, and the database does not fill up with 6 MB originals.

const multer = require('multer');
const sharp = require('sharp');
const { Media } = require('../models');

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;   // generous — sharp shrinks it after
const MAX_EDGE_PX = 1600;

// Memory storage: the buffer goes to sharp and then to the database, so it never
// needs to touch a filesystem that would not survive a redeploy anyway.
// No filter on the declared type. It is the browser's guess from the file's
// name and the OS's tables, and it is wrong often enough to matter: a WebP and
// a TIFF both arrive as application/octet-stream from some clients, and were
// refused with "Only image files can be uploaded" for files this site reads
// perfectly well. What the bytes are is decided in create(), by trying to
// decode them — which is the only test that cannot be fooled by a name — and a
// file that is not an image gets a clear answer there. The size limit still
// applies, so nothing large gets read on the strength of this.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
});

exports.uploadMiddleware = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (!err) return next();
    // Multer's own message ("File too large") is not much help on its own.
    const msg = err.code === 'LIMIT_FILE_SIZE'
      ? `That image is larger than ${MAX_UPLOAD_BYTES / 1024 / 1024} MB. Please pick a smaller one.`
      : err.message || 'Upload failed';
    res.status(400).json({ error: msg });
  });
};

// The address an uploaded image is reachable at, spelled out in full.
//
// It used to be returned as the relative `/api/media/<id>`, and that path only
// resolves for somebody already talking to the backend. The site is served from
// a different host — the frontend reaches the API through VITE_API_URL, and its
// own server has no /api route at all — so `<img src="/api/media/…">` asked the
// frontend for a path it does not have, got index.html back with a 200 (an SPA
// falls back rather than 404s, which is why nothing looked like an error), and
// rendered a broken image. Every picture uploaded from the admin would have
// been broken on the live site.
//
// Derived from the request rather than configured, so it stays correct in
// development, on Railway, and behind any domain put in front of it later.
// `trust proxy` is set in server.js, so req.protocol is the scheme the browser
// actually used and not the one inside the container.
function publicUrl(req, id) {
  const base = (process.env.MEDIA_BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
  return `${base}/api/media/${id}`;
}

// What the bytes actually are, which is not what the name says they are.
//
// A file called .svg arrived that was a PNG screenshot, and a phone will happily
// hand over a .jpg that is really HEIC. Nothing here trusts the extension or the
// browser's declared type: sharp sniffs the content, and the one case sharp
// cannot be asked about safely — SVG, which is text — is sniffed here.
const SVG_START = /^\s*(?:<\?xml[^>]*\?>\s*|<!--[\s\S]*?-->\s*|<!DOCTYPE[^>]*>\s*)*<svg[\s>]/i;

function looksLikeSvg(buffer) {
  return SVG_START.test(buffer.subarray(0, 2048).toString('utf8'));
}

// An SVG is a document, not a picture, and a document served from our own origin
// can carry script. An <img> tag will not run it, but anyone opening the address
// directly would. Executable parts are removed and the response is served under
// a locked-down CSP (see serve), so both doors are shut rather than one.
function sanitiseSvg(text) {
  return text
    .replace(/<script[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject\s*>/gi, '')
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(?:href|xlink:href)\s*=\s*(["'])\s*javascript:[^"']*\1/gi, '');
}

const FRIENDLY_FORMAT = {
  jpeg: 'JPEG', png: 'PNG', webp: 'WebP', gif: 'GIF', tiff: 'TIFF',
  heif: 'HEIC', avif: 'AVIF', svg: 'SVG',
};

exports.create = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image was received' });

    const original = req.file.buffer;
    const stem = (req.file.originalname || 'image').replace(/\.[^.]+$/, '');

    // ── vector stays vector ──────────────────────────────────────────────
    // Rasterising an SVG throws away the one thing it is good for. sharp draws
    // it at whatever intrinsic size it declares — often a couple of hundred
    // pixels — and the result is a small bitmap that goes soft the moment it is
    // shown larger. The site's own product artwork is SVG, so replacing a
    // drawing with a better drawing has to stay sharp at any size.
    if (looksLikeSvg(original)) {
      const cleaned = Buffer.from(sanitiseSvg(original.toString('utf8')), 'utf8');
      let dims = {};
      try {
        const meta = await sharp(cleaned).metadata();
        dims = { width: meta.width, height: meta.height };
      } catch { /* a viewBox-only SVG has no intrinsic size; it scales anyway */ }

      const row = await Media.create({
        filename: `${stem}.svg`,
        mime: 'image/svg+xml',
        size: cleaned.length,
        ...dims,
        data: cleaned,
      });

      return res.status(201).json({
        id: row.id,
        url: publicUrl(req, row.id),
        filename: row.filename,
        width: row.width,
        height: row.height,
        size: row.size,
        originalSize: req.file.size,
        originalType: 'svg',
      });
    }

    // ── everything else becomes WebP ─────────────────────────────────────
    let meta;
    try {
      meta = await sharp(original).metadata();
    } catch {
      return res.status(400).json({
        error: 'That file is not an image this site can read. PNG, JPEG, WebP, GIF, HEIC and SVG all work.',
      });
    }

    // An animated GIF flattened to its first frame is a bug report waiting to
    // happen, so multi-page input is carried through as an animation.
    const animated = (meta.pages || 1) > 1;
    const image = sharp(original, { failOn: 'none', animated });

    const buffer = await image
      .rotate()                                     // honour EXIF orientation
      // withoutEnlargement keeps a small logo from being blown up and blurred.
      .resize({ width: MAX_EDGE_PX, height: MAX_EDGE_PX, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const out = await sharp(buffer).metadata();

    const row = await Media.create({
      filename: `${stem}.webp`,
      mime: 'image/webp',
      size: buffer.length,
      width: out.width,
      // An animation's reported height is every frame stacked, so the height of
      // one frame is what the page will actually lay out around.
      height: animated && out.pages ? Math.round(out.height / out.pages) : out.height,
      data: buffer,
    });

    res.status(201).json({
      id: row.id,
      url: publicUrl(req, row.id),
      filename: row.filename,
      width: row.width,
      height: row.height,
      size: row.size,
      originalSize: req.file.size,
      originalType: FRIENDLY_FORMAT[meta.format] || meta.format,
    });
  } catch (err) {
    console.error('[media] create', err);
    res.status(500).json({ error: 'Could not process that image' });
  }
};

// Public. Immutable — the id changes when the image does, so it can be cached
// hard rather than revalidated on every page view.
exports.serve = async (req, res) => {
  try {
    const row = await Media.findByPk(req.params.id);
    if (!row) return res.status(404).end();
    res.set('Content-Type', row.mime);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    // Never let a browser decide these bytes are something more interesting
    // than the type they were stored as.
    res.set('X-Content-Type-Options', 'nosniff');
    // The site is a different origin from this API, and helmet's default
    // Cross-Origin-Resource-Policy: same-origin makes the browser refuse to
    // draw the image — ERR_BLOCKED_BY_RESPONSE.NotSameOrigin, with an empty
    // frame and alt text where the picture should be. These bytes are a public
    // picture meant to be embedded anywhere the shop is served from, which is
    // exactly what this header is for. It is set per-response rather than by
    // relaxing helmet globally, so nothing else on the API loosens with it.
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    // An SVG opened directly is a document on this origin. It has already been
    // stripped of anything executable on the way in; this is the second lock.
    if (row.mime === 'image/svg+xml') {
      res.set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
    }
    res.send(row.data);
  } catch (err) {
    console.error('[media] serve', err);
    res.status(500).end();
  }
};

exports.list = async (req, res) => {
  try {
    const rows = await Media.findAll({
      attributes: ['id', 'filename', 'mime', 'size', 'width', 'height', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 200,
    });
    res.json({ items: rows.map(r => ({ ...r.toJSON(), url: publicUrl(req, r.id) })) });
  } catch (err) {
    console.error('[media] list', err);
    res.status(500).json({ error: 'Failed to list images' });
  }
};

exports.remove = async (req, res) => {
  try {
    const n = await Media.destroy({ where: { id: req.params.id } });
    if (!n) return res.status(404).json({ error: 'Image not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('[media] remove', err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
};
