// Where each editable list belongs, and how it should look.
//
// The server sends 26 lists as one flat object. Painted straight out that was 26
// chips in a row: "Shop — Products" sat between "Menu — Links" and "About —
// Pillars", and finding the shop meant reading all of them. The names carry the
// grouping already — everything before the em dash is the part of the site it
// belongs to — so this file makes that grouping real instead of typographic.
//
// Nothing here is required for a list to work. A list nobody has placed still
// appears, under "More", with columns worked out from its own fields. That
// matters because the whole point of the schema is that making something
// editable is a server-side change.

import {
  ShoppingBag, Newspaper, FileText, Home, Info, UserPlus,
  Menu as MenuIcon, CreditCard, Boxes,
} from 'lucide-react';

export const SECTIONS = [
  {
    key: 'shop', label: 'Shop', icon: ShoppingBag,
    lists: ['mall_products', 'mall_categories', 'mall_purposes'],
  },
  {
    key: 'blog', label: 'Blog', icon: Newspaper,
    lists: ['blog_posts'],
  },
  {
    key: 'pages', label: 'Pages', icon: FileText,
    lists: ['pages'],
  },
  {
    key: 'home', label: 'Homepage', icon: Home,
    lists: ['section_headings', 'hero_ctas', 'home_features', 'purpose_cards', 'how_it_works', 'testimonials'],
  },
  {
    key: 'about', label: 'About page', icon: Info,
    lists: ['about_stats', 'about_pillars', 'about_expertise', 'about_promises'],
  },
  {
    key: 'joining', label: 'Astrologer joining', icon: UserPlus,
    lists: ['onboarding_criteria', 'onboarding_documents', 'onboarding_steps',
            'onboarding_kit', 'onboarding_conduct', 'onboarding_faqs'],
  },
  {
    key: 'navigation', label: 'Navigation', icon: MenuIcon,
    lists: ['nav_groups', 'nav_items', 'footer_links'],
  },
  {
    key: 'selling', label: 'Plans & FAQs', icon: CreditCard,
    lists: ['plans', 'faqs'],
  },
];

// The list name repeats its section — "Shop — Products" under Shop — so the nav
// shows only the part that distinguishes it.
export function shortLabel(label = '') {
  const cut = label.split('—');
  return (cut.length > 1 ? cut.slice(1).join('—') : label).trim() || label;
}

// Sections, with any list the map above has not placed collected into "More" so
// a newly editable list is never invisible.
export function sectionsFor(lists) {
  const keys = Object.keys(lists || {});
  const placed = new Set();
  const out = [];

  for (const section of SECTIONS) {
    const mine = section.lists.filter(k => keys.includes(k));
    if (!mine.length) continue;
    mine.forEach(k => placed.add(k));
    out.push({ ...section, lists: mine });
  }

  const rest = keys.filter(k => !placed.has(k));
  if (rest.length) out.push({ key: 'more', label: 'More', icon: Boxes, lists: rest });
  return out;
}

// ─── reading a row ───────────────────────────────────────────────────────────

const isImage = f => f.type === 'image';

export function titleFieldOf(def) {
  if (def.titleField) return def.titleField;
  const required = def.fields.find(f => f.required && (f.type === 'text' || f.type === 'textarea'));
  if (required) return required.key;
  const text = def.fields.find(f => f.type === 'text' || f.type === 'textarea');
  return text ? text.key : def.fields[0]?.key;
}

export function titleOf(item, def) {
  const raw = item?.[titleFieldOf(def)];
  const text = String(raw ?? '').trim();
  if (!text) return '';
  // Some lists are titled by their body — an FAQ answer, a testimonial — and a
  // whole paragraph in the title column pushes every other column off screen.
  return text.length > 90 ? `${text.slice(0, 90)}…` : text;
}

export function thumbOf(item, def) {
  const field = def.fields.find(isImage);
  const url = field && item?.[field.key];
  return typeof url === 'string' && url.trim() ? url : null;
}

// The emoji lists use a text field called `icon`, which is the nearest thing
// they have to a picture.
export function emojiOf(item, def) {
  const field = def.fields.find(f => f.key === 'icon' && f.type === 'text');
  const v = field && item?.[field.key];
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

// ─── index columns ───────────────────────────────────────────────────────────

// Hand-picked where the list is big enough that the right columns matter.
const COLUMNS = {
  mall_products:  ['category', 'price', 'isInStock'],
  mall_categories:['key', 'icon'],
  mall_purposes:  ['key', 'icon'],
  blog_posts:     ['category', 'author', 'readTime'],
  pages:          ['slug', 'icon'],
  plans:          ['id', 'price', 'popular'],
  nav_items:      ['group', 'to'],
  nav_groups:     [],
  footer_links:   ['to'],
  testimonials:   ['name', 'location', 'rating'],
  section_headings: ['key', 'align'],
};

const SKIP_IN_COLUMNS = new Set(['richtext', 'image', 'textarea', 'color']);

// Two supporting columns, chosen from what the list actually declares. Long text
// and pictures are left out: one belongs in the row title, the other is already
// the thumbnail.
export function columnsFor(key, def) {
  const chosen = COLUMNS[key];
  const title = titleFieldOf(def);
  const pick = (chosen ?? def.fields
    .filter(f => f.key !== title && !SKIP_IN_COLUMNS.has(f.type))
    .slice(0, 2)
    .map(f => f.key));

  return pick
    .map(k => def.fields.find(f => f.key === k))
    .filter(Boolean)
    .slice(0, 3);
}

// ─── the detail page ─────────────────────────────────────────────────────────

const PRICE = /price/i;
const ORGANISE = new Set(['tags', 'purposes', 'group', 'section']);

// Buckets every field into the cards it should appear in, the way a Shopify
// product page splits title, media, pricing and organisation rather than
// stacking 24 inputs in one column. Derived from the schema — the field types
// and a couple of key names — so a new list is laid out without being listed.
export function layoutFor(def) {
  const title = titleFieldOf(def);
  const main = { basics: [], pricing: [], media: [], content: [], details: [] };
  const side = { options: [], organise: [] };

  for (const f of def.fields) {
    if (f.key === title)                       main.basics.push(f);
    else if (f.type === 'image')               main.media.push(f);
    else if (f.type === 'richtext')            main.content.push(f);
    else if (f.type === 'boolean')             side.options.push(f);
    else if (f.type === 'select' || ORGANISE.has(f.key)) side.organise.push(f);
    else if (f.type === 'number' && PRICE.test(f.key)) main.pricing.push(f);
    else if (f.key === 'slug' || f.type === 'textarea') main.basics.push(f);
    else                                       main.details.push(f);
  }

  const cards = [
    { key: 'basics',  title: def.label, fields: main.basics },
    { key: 'pricing', title: 'Pricing', fields: main.pricing },
    { key: 'media',   title: 'Media',   fields: main.media },
    { key: 'content', title: 'Content', fields: main.content },
    { key: 'details', title: 'Details', fields: main.details },
  ].filter(c => c.fields.length);

  const aside = [
    { key: 'options',  title: 'Options',      fields: side.options },
    { key: 'organise', title: 'Organisation', fields: side.organise },
  ].filter(c => c.fields.length);

  return { cards, aside };
}

// Where a row can be seen on the live site, when that is a thing we can work out
// from the row itself. Shopify calls it "Preview", and it is the difference
// between editing content and editing a database.
export function previewHref(key, item) {
  if (!item) return null;
  switch (key) {
    case 'blog_posts':    return item.slug ? `/blog/${item.slug}` : '/blog';
    case 'pages':         return item.slug ? `/${String(item.slug).replace(/^\/+/, '')}` : null;
    case 'mall_products': return item.id ? `/mall/product/${item.id}` : '/mall';
    case 'mall_categories':
    case 'mall_purposes': return '/mall';
    case 'plans':         return '/plans';
    case 'faqs':          return '/';
    default:              return null;
  }
}
