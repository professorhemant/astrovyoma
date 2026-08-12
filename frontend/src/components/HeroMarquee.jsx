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
 * Hidden below `md`. On a phone the hero is 320px tall and already carries the
 * headline, the wheel and the clock; a scrolling line there is unreadable.
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
  top   = 63,   // % down the artwork
  width = 52,   // % of the artwork the text travels across before it fades
  speed = 26,   // seconds for one full pass
  size  = 15,   // px
}) {
  if (!text || !text.trim()) return null;

  const type = {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: `${size}px`,
    letterSpacing: '0.08em',
    color: '#F3D98B',
    textShadow: '0 0 18px rgba(243,217,139,0.55), 0 2px 10px rgba(0,0,0,0.85)',
  };

  // Two copies, translated -50% — the standard seamless loop. The second is
  // hidden from screen readers so the tagline is announced once, not twice.
  const copy = (hidden) => (
    <span aria-hidden={hidden || undefined} className="whitespace-nowrap pr-16" style={type}>
      {text}
    </span>
  );

  return (
    <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 9 }}>
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
