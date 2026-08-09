import React, { useMemo } from 'react';
import { parseBlocks } from '../utils/richText';

// Renders what someone typed in the admin, in the site's own voice.
//
// Takes either a plain string (what the admin writes) or the block array the
// blog controller used to hand back, so the blog could move over without the
// article page having to know which it is getting.

// **like this** comes out bold. Split rather than substituted into HTML, so the
// strongest thing anyone can do by typing into the admin is embolden a word.
function inline(text) {
  const parts = String(text ?? '').split(/\*\*(.+?)\*\*/g);
  if (parts.length === 1) return text;
  // split() with one capture group alternates: plain, bold, plain, bold, …
  return parts.map((part, i) => (i % 2 ? <strong key={i} className="text-gold-300 font-semibold">{part}</strong> : part));
}

export function ContentBlock({ block }) {
  switch (block.type) {
    case 'h2':
      return <h2 className="text-xl font-serif text-gold-400 mt-8 mb-3">{block.text}</h2>;
    case 'h3':
      return <h3 className="text-lg font-serif text-gold-300 mt-6 mb-2">{block.text}</h3>;
    case 'p':
      return <p className="text-cosmic-200 leading-relaxed mb-4">{inline(block.text)}</p>;
    case 'ul':
      return (
        <ul className="space-y-2 mb-4 ml-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-cosmic-200 text-sm leading-relaxed">
              <span className="text-gold-500 mt-1 shrink-0">▸</span>
              <span>{inline(item)}</span>
            </li>
          ))}
        </ul>
      );
    case 'callout':
      return (
        <div className="my-5 p-4 rounded-xl border-l-4 border-gold-500 bg-gold-500/10 text-cosmic-200 text-sm leading-relaxed italic">
          {inline(block.text)}
        </div>
      );
    default:
      return null;
  }
}

export default function RichText({ content, className = '' }) {
  const blocks = useMemo(
    () => (Array.isArray(content) ? content : parseBlocks(content)),
    [content]
  );
  if (!blocks.length) return null;
  return <div className={className}>{blocks.map((b, i) => <ContentBlock key={i} block={b} />)}</div>;
}
