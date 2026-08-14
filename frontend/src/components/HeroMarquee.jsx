import React from 'react';

/**
 * A line of text that streams out of the rishi's open right palm in the hero
 * artwork.
 *
 * The scrolling is the easy half. The hard half is staying on the hand.
 *
 * The banner is `object-cover`, so the artwork is cropped by a different amount
 * at every window shape — the palm lands at about 69% of the window's width on
 * a 1440x900 screen and about 96% on a 1440x600 one. A percentage measured
 * against the window slides off the hand the moment anyone resizes, which is
 * exactly how hero overlays have gone wrong here before.
 *
 * So this measures against the *artwork* instead. The ArtSpace box below
 * reproduces what object-cover does to the 2200x933 banner: an aspect-ratio plus
 * min-width and min-height resolve to the smallest box that covers the parent
 * while keeping the ratio, which is cover's definition. Percentages inside that
 * box are percentages of the painting, and the palm never moves within the
 * painting.
 *
 * Shown at every width. On a phone the artwork is cropped hard — the palm lands
 * around x=286 of a 390px screen and the band is only ~240px wide — so the type
 * scales down with the viewport rather than keeping its desktop size, which at
 * 17px would fit about sixteen characters. The far end of the band, where the
 * clock and wheel sit, is already faded to nothing by the mask.
 */

const BANNER_W = 2200;
const BANNER_H = 933;

// Fades in over the last stretch before the palm and out again at the far end,
// so the text has no hard edge at either end — it reads as appearing at the
// hand rather than sliding in from a box.
const FADE = 'linear-gradient(to right, transparent 0%, #000 26%, #000 88%, transparent 100%)';

export default function HeroMarquee({
  text,
  left  = 63,   // % across the artwork — the palm
  top   = 59,   // % down the artwork
  width = 32,   // % of the artwork the text travels across before it fades
  speed = 26,   // seconds for one full pass
  size  = 17,   // px
}) {
  if (!text || !text.trim()) return null;

  const type = {
    fontFamily: 'Cormorant Garamond, serif',
    // The admin's size is the ceiling, reached from tablet width up. Narrower
    // screens scale down with the viewport so the line keeps roughly the same
    // proportion to the artwork it is crossing.
    fontSize: `clamp(${Math.max(9, Math.round(size * 0.62))}px, 2.6vw, ${size}px)`,
    letterSpacing: '0.08em',
    color: '#F3D98B',
    textShadow: '0 0 18px rgba(243,217,139,0.55), 0 2px 10px rgba(0,0,0,0.85)',
  };

  // Two copies, translated -50% — the standard seamless loop. The second is
  // hidden from screen readers so the tagline is announced once, not twice.
  const copy = (hidden) => (
    <span aria-hidden={hidden || undefined} className="whitespace-nowrap pr-10 md:pr-16" style={type}>
      {text}
    </span>
  );

  // Tablet and up only.
  //
  // The band it travels along is a percentage of the artwork, and the artwork is
  // cropped hardest on a phone: at 390px the band is about 240px wide and lands
  // across the globe and the lamp, so the tagline arrived mid-word, unreadable,
  // and read as a rendering fault rather than as writing. The same words are
  // shown under the headline instead, where a phone has room for them — see
  // HomePage's hero.
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block" style={{ zIndex: 9 }}>
      {/* ArtSpace — the same box object-cover gives the banner image. */}
      <div
        className="absolute top-1/2 left-1/2"
        style={{
          transform: 'translate(-50%, -50%)',
          aspectRatio: `${BANNER_W} / ${BANNER_H}`,
          minWidth: '100%',
          minHeight: '100%',
        }}
      >
        <div
          data-edit="heroMarquee" data-edit-label="Hero marquee"
          className="absolute overflow-hidden"
          style={{
            top: `${top}%`,
            right: `${100 - left}%`,
            width: `${width}%`,
            maskImage: FADE,
            WebkitMaskImage: FADE,
          }}
        >
          <div
            className="flex w-max motion-reduce:animate-none"
            style={{ animation: `marqueeRTL ${speed}s linear infinite`, willChange: 'transform' }}
          >
            {copy(false)}
            {copy(true)}
          </div>
        </div>
      </div>
    </div>
  );
}
