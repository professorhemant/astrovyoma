// Turns a plain block of typing into the pieces a page is made of.
//
// The blog already had headings, paragraphs, bullet lists and callouts — but
// only as hand-written JSON in a controller, which is not something you can put
// in front of someone who is not a programmer. A textarea with four rules is,
// and it produces exactly the same four blocks:
//
//   ## Heading            a section heading
//   ### Smaller heading   a sub-heading
//   - a bullet            consecutive lines become one list
//   > a callout           the highlighted quote box
//   anything else         a paragraph, blank lines separating them
//
// Nothing here is HTML, so nothing typed into the admin can inject markup into
// the page. The renderer puts every piece in as text.

export function parseBlocks(source) {
  const lines = String(source || '').replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let para = [];
  let list = null;

  const flushPara = () => {
    if (para.length) blocks.push({ type: 'p', text: para.join(' ').trim() });
    para = [];
  };
  const flushList = () => {
    if (list?.length) blocks.push({ type: 'ul', items: list });
    list = null;
  };
  const flush = () => { flushPara(); flushList(); };

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) { flush(); continue; }

    if (line.startsWith('###')) { flush(); blocks.push({ type: 'h3', text: line.replace(/^#+\s*/, '') }); continue; }
    if (line.startsWith('##'))  { flush(); blocks.push({ type: 'h2', text: line.replace(/^#+\s*/, '') }); continue; }
    if (line.startsWith('>'))   { flush(); blocks.push({ type: 'callout', text: line.replace(/^>\s*/, '') }); continue; }

    // A run of bullets is one list, so blank lines between them are not needed.
    if (/^[-*•]\s+/.test(line)) {
      flushPara();
      (list ||= []).push(line.replace(/^[-*•]\s+/, ''));
      continue;
    }

    flushList();
    para.push(line);
  }
  flush();
  return blocks;
}

// The reverse, for turning content that was written as blocks in code into
// something editable. Used once, to seed what the site already shipped with.
export function blocksToText(blocks) {
  return (blocks || []).map(b => {
    if (b.type === 'h2') return `## ${b.text}`;
    if (b.type === 'h3') return `### ${b.text}`;
    if (b.type === 'callout') return `> ${b.text}`;
    if (b.type === 'ul') return (b.items || []).map(i => `- ${i}`).join('\n');
    return b.text || '';
  }).join('\n\n');
}
