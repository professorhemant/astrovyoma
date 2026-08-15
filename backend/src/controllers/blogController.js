// The blog, served from the blog_posts content list.
//
// Articles used to be a 300-line array in this file, which meant publishing
// meant a deploy. They are now rows like everything else the admin edits, seeded
// on first boot with the eight the site shipped with, so the admin can write and
// publish without anyone touching code.

const { ContentItem } = require('../models');
const { applyLang, langFrom } = require('../services/langOverlay');

// The body is stored as the plain text the admin typed. The site parses it into
// headings, paragraphs, bullets and callouts; the server has no reason to.
function parse(row, lang) {
  let data = {};
  try { data = JSON.parse(row.data); } catch { /* corrupt row — skip its fields */ }
  data = applyLang(data, lang);
  return {
    id: row.id,
    slug: data.slug || '',
    title: data.title || '',
    category: data.category || 'Astrology',
    tags: String(data.tags || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
    author: data.author || 'AstroVyoma Editorial',
    date: data.date || '',
    readTime: Number(data.readTime) || 5,
    icon: data.icon || '✦',
    // Empty rather than absent when unset, so the card can fall back to the
    // emoji instead of rendering a broken image.
    image: data.image || '',
    excerpt: data.excerpt || '',
    body: data.body || '',
  };
}

async function allPosts(lang) {
  const rows = await ContentItem.findAll({
    where: { list_key: 'blog_posts', is_active: true },
    order: [['sort_order', 'ASC'], ['created_at', 'ASC']],
  });
  return rows.map(r => parse(r, lang)).filter(a => a.slug);
}

// The listing never needs the article text, only the card.
function summarise(a) {
  const { body, ...card } = a;
  return card;
}

exports.listArticles = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 9 } = req.query;
    const posts = await allPosts(langFrom(req));
    let results = posts;

    if (category && category !== 'all') {
      results = results.filter(a => a.category.toLowerCase() === String(category).toLowerCase());
    }
    if (search) {
      const q = String(search).toLowerCase();
      results = results.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some(t => t.includes(q))
      );
    }

    const total  = results.length;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const items  = results.slice(offset, offset + parseInt(limit)).map(summarise);
    const categories = [...new Set(posts.map(a => a.category))];

    res.json({ articles: items, total, page: parseInt(page), limit: parseInt(limit), categories });
  } catch (err) {
    console.error('[blog] listArticles', err);
    res.status(500).json({ error: 'Failed to load articles' });
  }
};

exports.getArticle = async (req, res) => {
  try {
    const posts = await allPosts(langFrom(req));
    const article = posts.find(a => a.slug === req.params.slug);
    if (!article) return res.status(404).json({ error: 'Article not found' });

    const related = posts
      .filter(a => a.id !== article.id && (a.category === article.category || a.tags.some(t => article.tags.includes(t))))
      .slice(0, 3)
      .map(a => ({ id: a.id, slug: a.slug, title: a.title, category: a.category,
                   icon: a.icon, image: a.image, readTime: a.readTime, excerpt: a.excerpt }));

    res.json({ article, related });
  } catch (err) {
    console.error('[blog] getArticle', err);
    res.status(500).json({ error: 'Failed to load article' });
  }
};
