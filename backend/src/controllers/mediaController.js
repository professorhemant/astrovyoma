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
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) return cb(null, true);
    cb(new Error('Only image files can be uploaded'));
  },
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

exports.create = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image was received' });

    const image = sharp(req.file.buffer, { failOn: 'none' });
    const meta = await image.metadata();

    // withoutEnlargement keeps a small logo from being blown up and blurred.
    const buffer = await image
      .rotate()                                     // honour EXIF orientation
      .resize({ width: MAX_EDGE_PX, height: MAX_EDGE_PX, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const out = await sharp(buffer).metadata();

    const row = await Media.create({
      filename: (req.file.originalname || 'image').replace(/\.[^.]+$/, '') + '.webp',
      mime: 'image/webp',
      size: buffer.length,
      width: out.width,
      height: out.height,
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
      originalType: meta.format,
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
    res.json({ items: rows.map(r => ({ ...r.toJSON(), url: `/api/media/${r.id}` })) });
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
