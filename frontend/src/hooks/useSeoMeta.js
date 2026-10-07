import { useEffect } from 'react';

const SITE = 'https://astrovyoma.com';
const DEFAULT_IMAGE = `${SITE}/og-default.jpg`;

// Updates document.title and <meta> OG/Twitter tags.
// Restores on unmount so navigating back to a generic page doesn't keep
// the previous page's title in the browser tab or clipboard.
export function useSeoMeta({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  ogType = 'website',
} = {}) {
  useEffect(() => {
    if (!title && !description && !ogImage) return;

    const prevTitle = document.title;
    if (title) document.title = title;

    const pairs = [
      ['name',     'description',       description],
      ['property', 'og:type',           ogType],
      ['property', 'og:title',          ogTitle || title],
      ['property', 'og:description',    ogDescription || description],
      ['property', 'og:image',          ogImage || DEFAULT_IMAGE],
      ['property', 'og:url',            ogUrl],
      ['property', 'og:site_name',      'AstroVyoma'],
      ['name',     'twitter:card',      'summary_large_image'],
      ['name',     'twitter:title',     ogTitle || title],
      ['name',     'twitter:description', ogDescription || description],
      ['name',     'twitter:image',     ogImage || DEFAULT_IMAGE],
    ].filter(([, , v]) => Boolean(v));

    const prevValues = new Map();
    for (const [attr, key, value] of pairs) {
      const el = document.querySelector(`meta[${attr}="${key}"]`);
      if (el) {
        prevValues.set(`${attr}::${key}`, el.getAttribute('content'));
        el.setAttribute('content', value);
      } else {
        const tag = document.createElement('meta');
        tag.setAttribute(attr, key);
        tag.setAttribute('content', value);
        tag.dataset.dynamicMeta = '1';
        document.head.appendChild(tag);
      }
    }

    return () => {
      if (title) document.title = prevTitle;
      // Remove tags we created; restore tags we overwrote.
      document.querySelectorAll('meta[data-dynamic-meta]').forEach(el => el.remove());
      for (const [attrKey, prev] of prevValues) {
        const [attr, key] = attrKey.split('::');
        const el = document.querySelector(`meta[${attr}="${key}"]`);
        if (el) el.setAttribute('content', prev);
      }
    };
  }, [title, description, ogTitle, ogDescription, ogImage, ogUrl, ogType]);
}
