import React, { useEffect, useRef, useState } from 'react';

// The site half of the visual editor.
//
// When the homepage is loaded with ?editor=1 inside the admin's iframe, this
// makes the hero overlays draggable and reports every move to the parent
// window. It never saves anything itself — the admin holds the token and does
// the writing, so turning on editor mode in a public browser lets someone drag
// things around their own screen and change nothing.
//
// Elements opt in with data-edit="<key>"; the geometry each one needs differs,
// so the maths lives in HANDLERS rather than being generalised prematurely.

const ORIGIN = window.location.origin;

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

// Dragging is by delta, not by absolute pointer position.
//
// Mapping the pointer straight onto the setting made the element jump so its
// anchor sat under the cursor the moment you grabbed it — a 200px drag moved
// the clock 274px. Reading where the element starts and applying the movement
// from there means it stays under your finger.

// Where an element sits right now, in the units its settings use.
const READ = {
  mandala: (el, hero) => {
    const r = el.getBoundingClientRect();
    return {
      mandalaLeft: (r.left + r.width / 2 - hero.left) / hero.width * 100,
      mandalaTop:  (r.top + r.height / 2 - hero.top) / hero.height * 100,
    };
  },
  clock: (el, hero) => {
    const r = el.getBoundingClientRect();
    return {
      clockLeft:   (r.left + r.width / 2 - hero.left) / hero.width * 100,
      clockBottom: hero.bottom - r.bottom,
    };
  },
  heroButtons: (el, hero) => {
    const r = el.getBoundingClientRect();
    return getComputedStyle(el).position === 'absolute'
      ? { heroButtonBottom: hero.bottom - r.bottom }
      : { heroButtonGap: parseFloat(getComputedStyle(el).marginTop) || 0 };
  },
};

// Apply a pointer movement to those starting values.
const MOVE = {
  mandala: (start, d, hero) => ({
    mandalaLeft: Math.round(clamp(start.mandalaLeft + d.x / hero.width * 100, 0, 100)),
    mandalaTop:  Math.round(clamp(start.mandalaTop + d.y / hero.height * 100, 0, 100)),
  }),
  clock: (start, d, hero) => ({
    clockLeft:   Math.round(clamp(start.clockLeft + d.x / hero.width * 100, 0, 100)),
    clockBottom: Math.round(clamp(start.clockBottom - d.y, -50, 600)),
  }),
  heroButtons: (start, d) => (
    start.heroButtonBottom !== undefined
      ? { heroButtonBottom: Math.round(clamp(start.heroButtonBottom - d.y, 0, 400)) }
      : { heroButtonGap: Math.round(clamp(start.heroButtonGap + d.y, -40, 120)) }
  ),
};

export default function VisualEditor() {
  const [active, setActive] = useState(null);   // key currently being dragged
  const [hint, setHint] = useState(null);       // {key, label, x, y}
  const dragRef = useRef(null);

  useEffect(() => {
    const heroOf = (el) => {
      const img = document.querySelector('img[src*="hero-banner"]');
      return img?.parentElement?.getBoundingClientRect() || null;
    };

    const post = (key, values, committed) => {
      window.parent?.postMessage(
        { source: 'astrovyoma-editor', type: committed ? 'commit' : 'preview', key, values },
        ORIGIN
      );
    };

    // Clicking anything editable selects it and asks the admin to open its
    // properties. Dragging is only offered by the positionable overlays; a
    // testimonial card cannot be moved to an arbitrary spot without breaking
    // the layout on a narrower screen, so those are select-and-edit only.
    function onClick(e) {
      const item = e.target.closest('[data-edit-item]');
      const pos  = e.target.closest('[data-edit]');
      // Half these targets are links. While editing, a click picks the element
      // rather than following it — otherwise selecting a footer link navigates
      // the preview away from the page being edited.
      if (item || pos || e.target.closest('a')) { e.preventDefault(); e.stopPropagation(); }
      if (item) {
        const [listKey, id] = (item.dataset.editItem || '').split(':');
        if (listKey && id) {
          window.parent?.postMessage(
            { source: 'astrovyoma-editor', type: 'select', kind: 'item', listKey, id }, ORIGIN);
        }
      } else if (pos) {
        window.parent?.postMessage(
          { source: 'astrovyoma-editor', type: 'select', kind: 'position',
            key: pos.dataset.edit, label: pos.dataset.editLabel || pos.dataset.edit }, ORIGIN);
      } else {
        window.parent?.postMessage({ source: 'astrovyoma-editor', type: 'select', kind: 'none' }, ORIGIN);
      }
    }

    // Cards, steps, testimonials and footer links drag into position among
    // their own siblings.
    //
    // Not to a pixel — a card pinned to a coordinate lands on its neighbour the
    // moment the grid drops from six columns to two. What moves is its place in
    // the row, which is the thing that actually survives every screen width, and
    // it is reached by dragging rather than by pressing an arrow to swap.
    //
    // Every measurement is taken once, at grab time, and never re-read. Reading
    // live rects while the cards are already shifting is what makes home-made
    // drag lists oscillate: the card moves, the layout moves under it, the hit
    // test flips back, and it flickers between two slots for as long as you hold
    // it. Frozen rects cannot chase themselves.
    function onCardDown(e) {
      const el = e.target.closest('[data-edit-item]');
      // Headings drag as flow; anything inside a positioned overlay is dragged
      // by the overlay itself.
      if (!el || el.matches('[data-edit-flow]') || el.closest('[data-edit]')) return false;
      const [listKey, id] = (el.dataset.editItem || '').split(':');
      if (!listKey || !id) return false;

      const parent = el.parentElement;
      if (!parent) return false;
      const peers = Array.from(parent.children)
        .filter(c => (c.dataset?.editItem || '').startsWith(`${listKey}:`));
      if (peers.length < 2 || !peers.includes(el)) return false;

      const at = peers.indexOf(el);
      // No preventDefault here. A grab that never turns into a drag has to stay
      // a click, or clicking a card to edit it would stop working.
      dragRef.current = {
        card: true, el, listKey, parent, peers,
        ids: peers.map(p => p.dataset.editItem.split(':')[1]),
        rects: peers.map(p => p.getBoundingClientRect()),
        origin: { x: e.clientX, y: e.clientY },
        from: at, to: at, moved: false,
      };
      return true;
    }

    function beginCardDrag(d, e) {
      d.moved = true;
      d.el.style.zIndex = '60';
      d.el.style.position = 'relative';
      d.el.style.opacity = '0.92';
      for (const p of d.peers) if (p !== d.el) p.style.transition = 'transform .18s ease';
      // Keep receiving moves even if the cursor runs off the card or out of the
      // frame, so letting go outside still drops it where it was headed. The
      // document listeners work without it, so a browser that refuses the
      // capture costs nothing.
      try { d.el.setPointerCapture?.(e.pointerId); } catch { /* not a live pointer */ }
      setActive('card');
    }

    function layoutCards(d, dx, dy) {
      const order = [...d.ids];
      order.splice(d.to, 0, ...order.splice(d.from, 1));
      d.order = order;
      d.peers.forEach((p, i) => {
        if (p === d.el) return;
        const to = d.rects[order.indexOf(d.ids[i])];
        p.style.transform = `translate(${to.left - d.rects[i].left}px, ${to.top - d.rects[i].top}px)`;
      });
      d.el.style.transform = `translate(${dx}px, ${dy}px)`;
    }

    function clearCards(d) {
      for (const p of d.peers) {
        p.style.transform = '';
        p.style.transition = '';
        p.style.zIndex = '';
        p.style.position = '';
        p.style.opacity = '';
      }
    }

    function resolveCard(d, e) {
      const dx = e.clientX - d.origin.x;
      const dy = e.clientY - d.origin.y;
      // A few pixels of slop, so a slightly shaky click is still a click.
      if (!d.moved && Math.hypot(dx, dy) < 6) return;
      if (!d.moved) beginCardDrag(d, e);
      const hit = d.rects.findIndex(r =>
        e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom);
      if (hit >= 0) d.to = hit;
      layoutCards(d, dx, dy);
    }

    // Flow elements — headings — drag too, but into spacing and alignment
    // rather than coordinates. Pinning a heading to a pixel would put it on top
    // of the section above it as soon as the screen narrows; nudging its margin
    // and switching its alignment mean the same thing to the eye and survive
    // every width.
    function onFlowDown(e) {
      const el = e.target.closest('[data-edit-flow]');
      if (!el) return false;
      const [listKey, id] = (el.dataset.editItem || '').split(':');
      if (!listKey || !id) return false;
      e.preventDefault();
      const cs = getComputedStyle(el);
      dragRef.current = {
        flow: true, el, listKey, id,
        origin: { x: e.clientX, y: e.clientY },
        start: {
          spaceAbove: parseFloat(el.style.marginTop) || 0,
          align: cs.textAlign === 'start' ? 'left' : cs.textAlign,
        },
      };
      setActive('flow');
      el.setPointerCapture?.(e.pointerId);
      return true;
    }

    function resolveFlow(d, e) {
      const dy = e.clientY - d.origin.y;
      const dx = e.clientX - d.origin.x;
      const values = { spaceAbove: Math.round(clamp(d.start.spaceAbove + dy, -80, 200)) };
      // Sideways is a three-way switch, not a continuum — snap once the drag is
      // deliberate rather than drifting on every wobble.
      if (Math.abs(dx) > 60) {
        const order = ['left', 'center', 'right'];
        const at = Math.max(0, order.indexOf(d.start.align || 'center'));
        values.align = order[clamp(at + (dx > 0 ? 1 : -1), 0, 2)];
      }
      return values;
    }

    function onPointerDown(e) {
      if (onFlowDown(e)) return;
      if (onCardDown(e)) return;
      const el = e.target.closest('[data-edit]');
      if (!el) return;
      const key = el.dataset.edit;
      if (!MOVE[key]) return;
      const hero = heroOf(el);
      if (!hero) return;
      e.preventDefault();
      dragRef.current = {
        key, el,
        origin: { x: e.clientX, y: e.clientY },
        start: READ[key](el, hero),
      };
      setActive(key);
      el.setPointerCapture?.(e.pointerId);
    }

    function resolve(d, e) {
      if (d.flow) return resolveFlow(d, e);
      const hero = heroOf(d.el);
      if (!hero) return null;
      const delta = { x: e.clientX - d.origin.x, y: e.clientY - d.origin.y };
      return MOVE[d.key](d.start, delta, hero);
    }

    function onPointerMove(e) {
      const d = dragRef.current;
      if (!d) {
        // Not dragging — just show what is under the cursor.
        const el = e.target.closest?.('[data-edit]');
        setHint(el ? { key: el.dataset.edit, label: el.dataset.editLabel || el.dataset.edit } : null);
        return;
      }
      if (d.card) { resolveCard(d, e); return; }
      const values = resolve(d, e);
      if (!values) return;
      if (d.flow) { applyFlow(d.el, values); return; }
      applyLocally(d.key, values);
      post(d.key, values, false);
    }

    function onPointerUp(e) {
      const d = dragRef.current;
      if (!d) return;
      if (d.card) {
        // Put the cards back where the DOM says they are and let the reload
        // that follows the save show the real new order. Animating them into
        // place here would only be undone a moment later.
        clearCards(d);
        if (d.moved && d.to !== d.from) {
          window.parent?.postMessage(
            { source: 'astrovyoma-editor', type: 'commit-reorder',
              listKey: d.listKey, ids: d.order }, ORIGIN);
        }
        // A grab that never became a drag falls through to the click handler,
        // which selects the card as it always did.
        dragRef.current = null;
        setActive(null);
        return;
      }
      const values = resolve(d, e);
      if (values && d.flow) {
        applyFlow(d.el, values);
        // Content rows save through the admin's API rather than the settings
        // batch, so they commit on drop instead of joining the pending list.
        window.parent?.postMessage(
          { source: 'astrovyoma-editor', type: 'commit-item',
            listKey: d.listKey, id: d.id, values }, ORIGIN);
      } else if (values) {
        applyLocally(d.key, values);
        post(d.key, values, true);
      }
      dragRef.current = null;
      setActive(null);
    }

    function applyFlow(el, v) {
      if (v.spaceAbove !== undefined) el.style.marginTop = `${v.spaceAbove}px`;
      if (v.align) el.style.textAlign = v.align;
    }

    // Move the element as the pointer moves, so dragging feels direct rather
    // than waiting for a save round-trip.
    function applyLocally(key, v) {
      const wrap = document.querySelector('img[src*="hero-banner"]')?.parentElement;
      if (!wrap) return;
      if (key === 'mandala') {
        const el = document.querySelector('[data-edit="mandala"]');
        el.style.left = `${v.mandalaLeft}%`;
        el.style.setProperty('--mandala-top', `${v.mandalaTop}%`);
        el.style.top = `${v.mandalaTop}%`;
      } else if (key === 'clock') {
        const el = document.querySelector('[data-edit="clock"]');
        el.style.left = `${v.clockLeft}%`;
        el.style.bottom = `${v.clockBottom}px`;
      } else if (key === 'heroButtons') {
        const el = document.querySelector('[data-edit="heroButtons"]');
        if (v.heroButtonBottom !== undefined) el.style.bottom = `${v.heroButtonBottom}px`;
        if (v.heroButtonGap !== undefined) el.style.marginTop = `${v.heroButtonGap}px`;
      }
    }

    document.addEventListener('click', onClick, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('pointermove', onPointerMove, true);
    document.addEventListener('pointerup', onPointerUp, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('pointermove', onPointerMove, true);
      document.removeEventListener('pointerup', onPointerUp, true);
    };
  }, []);

  // Editor-only styling: make the targets grabbable and outline them on hover.
  // Injected rather than put in the stylesheet so none of it ships to visitors.
  return (
    <style>{`
      [data-edit-item] {
        outline: 1px dashed rgba(120,180,255,0.45);
        outline-offset: 3px;
        border-radius: 6px;
        cursor: grab;
      }
      [data-edit-item]:hover { outline: 2px solid rgba(120,180,255,0.95); }
      [data-edit-flow] { cursor: grab; }
      [data-edit-flow]:active { cursor: grabbing; }
      ${active === 'card' ? `
        [data-edit-item] { cursor: grabbing !important; }
        [data-edit-item]:hover { outline: 1px dashed rgba(120,180,255,0.45); }
      ` : ''}
      [data-edit] {
        pointer-events: auto !important;
        cursor: grab;
        outline: 2px dashed rgba(232,197,71,0.55);
        outline-offset: 6px;
        border-radius: 8px;
        transition: outline-color .15s;
      }
      [data-edit]:hover { outline-color: rgba(232,197,71,1); }
      [data-edit] * { pointer-events: none !important; }
      ${active ? `[data-edit="${active}"] { cursor: grabbing; outline-color: #fff; }` : ''}
      body { user-select: none; }
    `}</style>
  );
}
