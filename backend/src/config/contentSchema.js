// The registry that makes the admin dashboard self-describing.
//
// Everything the admin can edit is declared here — the fields, their types, the
// help text, and the defaults to seed on first boot. The admin UI reads this and
// renders its own forms, so making something editable is a schema entry rather
// than a new table, controller and screen.
//
// Field types the admin UI understands:
//   text      single line
//   textarea  multi-line
//   richtext  multi-line, rendered as paragraphs on the site
//   number    numeric input (min / max honoured)
//   boolean   on/off switch
//   select    fixed choices via `options`
//   image     upload or URL
//   url       link, validated loosely
//   color     colour picker

const { ARTICLES } = require('../data/blogArticles');
const { PRODUCTS, CATEGORY_META, PURPOSE_META, PHOTOGRAPHED } = require('../data/mallProducts');

// Long text is written as plain typing with four rules, not as HTML or JSON.
// The site parses it back into headings, paragraphs, bullets and callouts.
// Kept in step with frontend/src/utils/richText.js.
const BODY_HELP =
  'Start a line with ## for a heading, ### for a smaller one, - for a bullet, ' +
  'and > for a highlighted note. Wrap words in **two stars** to make them bold. ' +
  'Everything else becomes a paragraph — leave a blank line between them.';

function blocksToText(blocks) {
  return (blocks || []).map(b => {
    if (b.type === 'h2') return `## ${b.text}`;
    if (b.type === 'h3') return `### ${b.text}`;
    if (b.type === 'callout') return `> ${b.text}`;
    if (b.type === 'ul') return (b.items || []).map(i => `- ${i}`).join('\n');
    return b.text || '';
  }).join('\n\n');
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────
// Singletons. One value each, grouped for the Settings screen.

const SETTINGS_GROUPS = [
  {
    key: 'controls',
    public: true,
    label: 'Site Controls',
    help: 'Switches that affect the whole site immediately.',
    fields: [
      { key: 'maintenanceMode', label: 'Maintenance mode', type: 'boolean', default: false,
        help: 'Visitors see a maintenance page instead of the site. Admins are unaffected.' },
      { key: 'announcement', label: 'Announcement text', type: 'textarea', default: '',
        help: 'Shown as a banner across the top of every page.' },
      { key: 'announcementActive', label: 'Show announcement', type: 'boolean', default: false },
    ],
  },
  {
    key: 'business',
    label: 'Business Settings',
    help: 'Money and limits. These take effect on the next consultation or recharge.',
    fields: [
      { key: 'commissionPercent',  label: 'Platform commission (%)', type: 'number', default: 40, min: 0, max: 100,
        help: 'The share AstroVyoma keeps from each paid consultation — not the ' +
              'astrologer’s share. At 40 the astrologer receives 60, which is what ' +
              'the astrologer kit and the Join page both advertise. Change this and ' +
              'the headline figure in Astrologer Kit — Wording must change with it.' },
      { key: 'newUserFreeMinutes', label: 'Free minutes for new users', type: 'number', default: 5, min: 0, max: 120 },
      { key: 'minWalletRecharge',  label: 'Minimum wallet recharge (₹)', type: 'number', default: 100, min: 1 },
      { key: 'maxWalletRecharge',  label: 'Maximum wallet recharge (₹)', type: 'number', default: 10000, min: 1 },
    ],
  },
  {
    key: 'contact',
    public: true,
    label: 'Contact Details',
    help: 'Shown in the footer and on contact links.',
    fields: [
      { key: 'platformPhone',    label: 'Support phone',    type: 'text', default: '' },
      { key: 'platformEmail',    label: 'Support email',    type: 'text', default: '' },
      { key: 'platformWhatsApp', label: 'WhatsApp number',  type: 'text', default: '' },
    ],
  },
  {
    key: 'layout',
    public: true,
    label: 'Homepage Layout',
    help: 'Nudge things around without touching code. Values are in pixels — bigger numbers move things further.',
    fields: [
      { key: 'heroButtonGap', label: 'Gap under the banner, narrow windows (px)', type: 'number',
        default: 12, min: -40, max: 120,
        help: 'How far the hero buttons sit below the banner when the window is under 1280px wide. Was -10, which is why they touched the artwork.' },
      { key: 'heroButtonBottom', label: 'Button height above banner bottom, full screen (px)', type: 'number',
        default: 56, min: 0, max: 400,
        help: 'On screens 1280px and wider the buttons float over the artwork. Bigger numbers lift them higher up the banner.' },

      { key: 'mandalaLeft', label: 'Zodiac wheel — across (%)', type: 'number',
        default: 15, min: 0, max: 100,
        help: '0 is the far left of the banner, 100 the far right. This is the centre of the wheel.' },
      { key: 'mandalaTop', label: 'Zodiac wheel — down (%)', type: 'number',
        default: 44, min: 0, max: 100,
        help: '0 is the top of the banner, 100 the bottom. Applies from tablet width up; phones keep a fixed position so the wheel stays clear of the headline.' },
      { key: 'mandalaSize', label: 'Zodiac wheel — size (px)', type: 'number',
        default: 288, min: 60, max: 700,
        help: 'Width of the wheel on a full-size screen.' },

      { key: 'clockLeft', label: 'Vedic clock — across (%)', type: 'number',
        default: 15, min: 0, max: 100,
        help: '0 is the far left of the banner, 100 the far right. This is the centre of the clock.' },
      { key: 'clockBottom', label: 'Vedic clock — up from bottom (px)', type: 'number',
        default: 8, min: -50, max: 600,
        help: 'Distance from the bottom edge of the banner. Bigger numbers lift the clock higher.' },

      { key: 'heroMarqueeText', label: 'Banner scrolling line — the words', type: 'text',
        default: 'AstroVyoma: Decoding the cosmos with authentic Vedic calculations and predictive wisdom',
        help: 'Scrolls out of the sage\'s open right hand on the banner. Leave this empty to switch it off. Shown on phones too, at a smaller size to suit the smaller picture.' },
      { key: 'heroMarqueeLeft', label: 'Scrolling line — where it appears, across (%)', type: 'number',
        default: 63, min: 0, max: 100,
        help: 'The point the words come out of. 0 is the far left of the painting, 100 the far right. The sage\'s palm is about 63.' },
      { key: 'heroMarqueeTop', label: 'Scrolling line — where it appears, down (%)', type: 'number',
        default: 59, min: 0, max: 100,
        help: '0 is the top of the painting, 100 the bottom. The palm is about 63.' },
      { key: 'heroMarqueeWidth', label: 'Scrolling line — how far it travels (%)', type: 'number',
        default: 32, min: 10, max: 100,
        help: 'How much of the painting the words cross before fading out. Bigger numbers reach further left.' },
      { key: 'heroMarqueeSpeed', label: 'Scrolling line — seconds per pass', type: 'number',
        default: 26, min: 6, max: 120,
        help: 'How long the line takes to travel once. Bigger numbers are slower and calmer.' },
      { key: 'heroMarqueeSize', label: 'Scrolling line — text size (px)', type: 'number',
        default: 17, min: 9, max: 40,
        help: 'Size of the scrolling words on a full-size screen. Phones scale down from this automatically, so the picture there does not end up with oversized text across it.' },
    ],
  },
  {
    key: 'about',
    public: true,
    label: 'About Page — Wording',
    help: 'Every line of writing on the About page. The cards and figures on that ' +
          'page are lists of their own, further down this screen.',
    fields: [
      { key: 'aboutEyebrow',  label: 'Small line above the title', type: 'text', default: '✦ Our Story' },
      { key: 'aboutTitle',    label: 'Big title', type: 'text', default: 'Where Cosmic Wisdom' },
      { key: 'aboutTitleTwo', label: 'Second line of the title', type: 'text', default: 'Meets Digital Precision',
        help: 'Shown in white under the gold first line. Leave empty for a one-line title.' },
      { key: 'aboutIntro',    label: 'Opening paragraph', type: 'textarea',
        default: "India's premier digital sanctuary for authentic Vedic science, cosmic counseling, and astrological foresight — built by the finest astrological minds of the current era." },

      { key: 'aboutGenesisEyebrow', label: 'Genesis — small line', type: 'text', default: '✦ The Genesis' },
      { key: 'aboutGenesisHeading', label: 'Genesis — heading', type: 'text', default: 'The Genesis of a Cosmic Revolution' },
      { key: 'aboutGenesisOne',     label: 'Genesis — first paragraph', type: 'textarea',
        default: 'For centuries, the truest secrets of the cosmos were guarded in sacred lineages or lost in the noise of commercial, unverified predictions. AstroVyoma was born out of a collective realization among India’s top astrological minds: the modern world deserves clarity, not superstition.' },
      { key: 'aboutGenesisTwo',     label: 'Genesis — second paragraph', type: 'textarea',
        default: 'We realized that while technology can connect people, only genuine, deeply researched spiritual insight can guide them. By blending rigorous astronomical calculation with intuitive Vedic mastery, our founders built a bridge between the ancient Rishis and the 21st-century seeker.' },
      { key: 'aboutMissionLabel',   label: 'Mission — label', type: 'text', default: '🌟 Our Mission' },
      { key: 'aboutMission',        label: 'Mission — the sentence', type: 'textarea',
        default: 'To demystify ancient stellar wisdom and deliver it with absolute mathematical precision to the modern world.' },
      { key: 'aboutDreamTitle',     label: 'Side card — title', type: 'text', default: 'A Collaborative Dream' },
      { key: 'aboutDreamText',      label: 'Side card — text', type: 'textarea',
        default: 'For the first time in digital history, the stalwarts of Vedic Astrology, KP System, Numerology, Lal Kitab, and Vastu Shastra have united under one cosmic canopy.' },
      { key: 'aboutDreamTags',      label: 'Side card — tags', type: 'text',
        default: 'Vedic Astrology, KP System, Numerology, Lal Kitab, Vastu Shastra',
        help: 'Separated by commas.' },

      { key: 'aboutPillarsEyebrow', label: 'Pillars — small line', type: 'text', default: '✦ Our Foundation' },
      { key: 'aboutPillarsHeading', label: 'Pillars — heading', type: 'text', default: 'The AstroVyoma Pillars' },
      { key: 'aboutPillarsIntro',   label: 'Pillars — line underneath', type: 'textarea',
        default: 'Why our guild is unrivaled — when you step into the universe of AstroVyoma, you are not just getting a reading, you are consulting a powerhouse of cosmic knowledge.' },

      { key: 'aboutMasteryEyebrow', label: 'Mastery — small line', type: 'text', default: '✦ Our Mastery' },
      { key: 'aboutMasteryHeading', label: 'Mastery — heading', type: 'text', default: 'Meet the Architects of Your Destiny' },
      { key: 'aboutMasteryIntro',   label: 'Mastery — line underneath', type: 'textarea',
        default: 'Our core panel represents the gold standard of contemporary Indian astrology — each domain mastered with decades of practice and scholarship.' },

      { key: 'aboutQuote',      label: 'The big quote', type: 'textarea',
        default: 'The stars that govern the universe also reside within you. We do not predict your future; we empower you to co-create it with the cosmos.' },
      { key: 'aboutQuoteLabel', label: 'Under the quote', type: 'text', default: '✦ The AstroVyoma Promise ✦' },

      { key: 'aboutPromisesEyebrow', label: 'Promises — small line', type: 'text', default: '✦ Our Commitment' },
      { key: 'aboutPromisesHeading', label: 'Promises — heading', type: 'text', default: 'Our Sacred Promise to You' },
      { key: 'aboutPromisesIntro',   label: 'Promises — line underneath', type: 'textarea',
        default: 'We understand that seeking astrological guidance requires immense trust. We honor your journey with three unshakeable promises.' },

      { key: 'aboutCtaEyebrow', label: 'Closing — small line', type: 'text', default: '✦ Begin Your Journey' },
      { key: 'aboutCtaHeading', label: 'Closing — heading', type: 'text', default: 'Your Journey Beyond the Stars Begins Here' },
      { key: 'aboutCtaOne',     label: 'Closing — first paragraph', type: 'textarea',
        default: "You didn't arrive at AstroVyoma by accident. In the language of the cosmos, synchronization is everything." },
      { key: 'aboutCtaTwo',     label: 'Closing — second paragraph', type: 'textarea',
        default: "Whether you are standing at a crossroads in your career, searching for your soul's counterpart, or seeking profound inner peace — the finest minds of the current era are waiting to map your path." },
      { key: 'aboutBadges',     label: 'Closing — reassurance badges', type: 'textarea',
        default: '🔒 Data Secure\n🕉️ Vedic Authentic\n🤖 AI Enhanced\n⚡ Instant Results',
        help: 'One per line, emoji first then the words.' },
    ],
  },
  {
    key: 'onboarding',
    public: true,
    label: 'Astrologer Kit — Wording',
    help: 'Every line of writing on the astrologer onboarding kit, the page an ' +
          'astrologer reads before applying. The cards, steps and questions on ' +
          'that page are lists of their own, further down this screen.',
    fields: [
      { key: 'obEyebrow', label: 'Small line above the title', type: 'text', default: '✦ For Astrologers' },
      { key: 'obTitle',   label: 'Big title', type: 'text', default: 'The Astrologer’s Kit' },
      { key: 'obTitleTwo', label: 'Second line of the title', type: 'text', default: 'Everything Before You Join',
        help: 'Shown in white under the gold first line. Leave empty for a one-line title.' },
      { key: 'obIntro',   label: 'Opening paragraph', type: 'textarea',
        default: 'What we ask of you, what you get in return, and exactly how joining works — set out in full before you fill in a single form.' },

      { key: 'obEarnShare',   label: 'Headline earnings figure', type: 'text', default: '60%',
        help: 'Shown large at the top of the earnings section. Must match what the platform actually pays out — the split is set in Business Settings.' },
      { key: 'obEarnHeading', label: 'Earnings — heading', type: 'text', default: 'What You Earn' },
      { key: 'obEarnIntro',   label: 'Earnings — line underneath', type: 'textarea',
        default: 'Your share of every consultation, before anything else is taken.' },
      { key: 'obPayoutDay',   label: 'Earnings — when you are paid', type: 'text',
        default: 'Every Monday, for the week before',
        help: 'A promise to your astrologers. Change it here the moment it stops being true.' },
      { key: 'obPayoutMin',   label: 'Earnings — smallest payout', type: 'text', default: '₹500',
        help: 'Anything under this carries over to the following week.' },
      { key: 'obPayoutNote',  label: 'Earnings — the small print', type: 'textarea',
        default: 'Paid by bank transfer or UPI to the account you verified. Nothing is deducted beyond the platform share and whatever tax the law requires.' },

      { key: 'obCriteriaHeading', label: 'Who can join — heading', type: 'text', default: 'Who We Are Looking For' },
      { key: 'obCriteriaIntro',   label: 'Who can join — line underneath', type: 'textarea',
        default: 'Meet these and you should expect to be accepted. We would rather turn away a good astrologer than take one who trades on fear.' },

      { key: 'obDocsHeading', label: 'Papers — heading', type: 'text', default: 'Papers to Keep Ready' },
      { key: 'obDocsIntro',   label: 'Papers — line underneath', type: 'textarea',
        default: 'Nothing is asked for until after the conversation, but having these to hand shortens verification to a couple of days.' },

      { key: 'obStepsHeading', label: 'How it works — heading', type: 'text', default: 'How Joining Works' },
      { key: 'obStepsIntro',   label: 'How it works — line underneath', type: 'textarea',
        default: 'Six steps, about a fortnight end to end, and a person at every one of them.' },

      { key: 'obKitHeading', label: 'What you get — heading', type: 'text', default: 'What You Get on Day One' },
      { key: 'obKitIntro',   label: 'What you get — line underneath', type: 'textarea',
        default: 'The whole kit, handed over the moment your profile goes up. There is nothing further to buy.' },

      { key: 'obConductHeading', label: 'What we ask — heading', type: 'text', default: 'What We Ask of You' },
      { key: 'obConductIntro',   label: 'What we ask — line underneath', type: 'textarea',
        default: 'The code every astrologer on the panel agrees to. It is short, and it is the whole of it.' },

      { key: 'obFaqHeading', label: 'Questions — heading', type: 'text', default: 'Questions Astrologers Ask' },

      { key: 'obCtaHeading', label: 'Closing — heading', type: 'text', default: 'Ready to Join the Panel?' },
      { key: 'obCtaText',    label: 'Closing — paragraph', type: 'textarea',
        default: 'The application takes about fifteen minutes and commits you to nothing. If your practice fits AstroVyoma you will hear from a person within three working days.' },
      { key: 'obCtaButton',  label: 'Closing — button text', type: 'text', default: 'Apply to Join' },
      { key: 'obCtaHelp',    label: 'Closing — line under the button', type: 'textarea',
        default: 'Would rather ask something first? Write to us and an astrologer on the panel will answer, not a sales desk.' },
    ],
  },
  {
    key: 'brand',
    public: true,
    label: 'Branding & SEO',
    help: 'How the site presents itself and appears in search results.',
    fields: [
      { key: 'siteTagline',   label: 'Tagline', type: 'text',
        default: 'Ancient Wisdom, Modern Guidance. Your cosmic journey starts here.' },
      { key: 'metaTitle',       label: 'Search engine title', type: 'text',
        default: 'AstroVyoma — Vedic Astrology Platform' },
      { key: 'metaDescription', label: 'Search engine description', type: 'textarea', default: '',
        help: 'The grey text under your link on Google. Around 150 characters reads best.' },
    ],
  },
];

// ─── LISTS ───────────────────────────────────────────────────────────────────
// Repeatables. Add, delete, reorder, show/hide.

const LISTS = {
  testimonials: {
    label: 'Homepage — Why AstroVyoma',
    // These were three invented customers praising two astrologers who were not
    // on the platform, on a site that had never hosted a consultation. They are
    // now statements about what the site does, each one checkable.
    //
    // The card still renders a real testimonial properly: fill in a name and it
    // comes back with the photograph and the stars. Leave the name empty and it
    // renders as a plain statement, which is what an honest new site has.
    help: 'The three cards near the foot of the homepage. Leave "Name" empty ' +
          'for a plain statement about the service. Fill it in only for a real ' +
          'testimonial from a real person who has agreed to it — a name and ' +
          'stars against words nobody said is the one thing here that can get ' +
          'you into trouble.',
    itemLabel: (d) => d.name || d.heading || 'Card',
    fields: [
      { key: 'heading',  label: 'Small gold heading', type: 'text',
        help: 'Used when there is no name, e.g. "Calculated, not guessed".' },
      { key: 'text',     label: 'The words', type: 'textarea', required: true },
      { key: 'name',     label: 'Name', type: 'text',
        help: 'Only for a real, consented testimonial. Empty means this card is a plain statement.' },
      { key: 'location', label: 'City', type: 'text' },
      { key: 'rating',   label: 'Stars', type: 'number', default: 5, min: 1, max: 5 },
      { key: 'avatar',   label: 'Photo', type: 'image' },
    ],
    seed: [
      { heading: 'Calculated, not guessed',
        text: 'Charts are computed with the Swiss Ephemeris using the Lahiri ayanamsha and Whole Sign houses — the same standard professional astrologers work to.' },
      { heading: 'Free where it matters',
        text: 'Your full birth chart, planetary positions, dashas and nakshatra reading cost nothing, and no card is asked for.' },
      { heading: 'You decide what you spend',
        text: 'Consultations are charged by the minute from your wallet, only while you are talking, and you can stop at any moment.' },
    ],
  },

  faqs: {
    label: 'FAQs',
    help: 'Common questions. Shown on the homepage and support pages.',
    itemLabel: (d) => d.question || 'Question',
    fields: [
      { key: 'question', label: 'Question', type: 'text', required: true },
      { key: 'answer',   label: 'Answer',   type: 'richtext', required: true },
    ],
    seed: [
      { question: 'Is the Kundali really free?',
        answer: 'Yes. Your full birth chart, planetary positions, dashas and nakshatra reading are free, with no card required.' },
      { question: 'How accurate are the calculations?',
        answer: 'We use the Swiss Ephemeris with the Lahiri ayanamsha and Whole Sign houses — the same standard professional astrologers rely on.' },
      { question: 'How does paying an astrologer work?',
        answer: 'You add money to your wallet and are charged per minute only while you are talking. You can stop at any time.' },
      { question: 'What if I do not know my exact birth time?',
        answer: 'Enter your best estimate. The planets will be accurate; the lagna and house placements are the parts that shift with birth time.' },
    ],
  },

  section_headings: {
    label: 'Section Headings',
    help: 'The heading and the line under it for each block of the homepage. The Section id ties a row to its place on the page — leave it alone.',
    titleField: 'heading',
    fields: [
      { key: 'key',      label: 'Section id', type: 'text', required: true,
        help: 'Which section this belongs to. Changing it detaches the heading from its section.' },
      { key: 'eyebrow',  label: 'Small line above', type: 'text', help: 'Optional. Devanagari or a short kicker.' },
      { key: 'heading',  label: 'Heading', type: 'text', required: true },
      { key: 'subheading', label: 'Line underneath', type: 'textarea' },
      // A heading sits in the page flow with sections above and below it, so it
      // cannot be pinned to a pixel without breaking on a narrower screen.
      // Spacing and alignment are the honest equivalents of up/down/left/right
      // and they survive every width.
      { key: 'align', label: 'Left / right', type: 'select', default: 'center',
        options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Centre' }, { value: 'right', label: 'Right' }],
        help: 'Drag the heading sideways in the editor to switch this.' },
      { key: 'spaceAbove', label: 'Space above (px)', type: 'number', default: 0, min: -80, max: 200,
        help: 'Drag the heading up or down in the editor to change this.' },
      { key: 'spaceBelow', label: 'Space below (px)', type: 'number', default: 0, min: -80, max: 200 },
    ],
    seed: [
      { key: 'purpose',   eyebrow: 'किस चीज़ के लिए बने हो?', heading: 'What Were You Born For?',
        subheading: "Your birth chart reveals your soul's purpose, personality, and path" },
      { key: 'howitworks', eyebrow: '', heading: 'How It Works', subheading: '' },
      { key: 'about',     eyebrow: '', heading: 'Where Ancient Stars Meet Modern Lives', subheading: '' },
      { key: 'horoscope', eyebrow: '', heading: "Today's Cosmic Guidance", subheading: '' },
      { key: 'testimonials', eyebrow: '', heading: 'Why AstroVyoma', subheading: '' },
    ],
  },

  purpose_cards: {
    label: 'Purpose Cards',
    help: 'The three cards under "What Were You Born For?".',
    titleField: 'title',
    fields: [
      { key: 'icon',     label: 'Emoji',    type: 'text' },
      { key: 'subtitle', label: 'Small label above', type: 'text' },
      { key: 'title',    label: 'Title',    type: 'text', required: true },
      { key: 'desc',     label: 'Description', type: 'textarea' },
      { key: 'link',     label: 'Links to', type: 'text', help: 'A path on this site, e.g. /purpose' },
    ],
    seed: [
      { icon: '🌟', subtitle: 'Your Nature', title: 'Swabhav', link: '/purpose',
        desc: 'Discover your innate personality traits, strengths, and patterns written in the stars at the moment of your birth' },
      { icon: '☯',  subtitle: 'Your Life Purpose', title: 'Karma Path', link: '/purpose',
        desc: 'Understand your dharma — the unique contribution your soul came to make in this lifetime, guided by your Nakshatra' },
      { icon: '💠', subtitle: 'Sun, Moon & Lagna', title: 'Personality', link: '/kundali',
        desc: 'Your Sun, Moon, and Ascendant form a cosmic trinity. Uncover the layers of who you truly are' },
    ],
  },

  home_features: {
    label: 'Homepage Feature Cards',
    help: 'The free-tools grid on the homepage.',
    itemLabel: (d) => d.title || 'Feature',
    fields: [
      { key: 'icon',  label: 'Emoji',       type: 'text', help: 'A single emoji, e.g. 🪐' },
      { key: 'title', label: 'Title',       type: 'text', required: true },
      { key: 'desc',  label: 'Description', type: 'text' },
      { key: 'link',  label: 'Links to',    type: 'text', help: 'A path on this site, e.g. /kundali' },
    ],
    seed: [
      { icon: '🪐', title: 'Free Kundali',      desc: 'Complete birth chart with planetary positions', link: '/kundali' },
      { icon: '⭐', title: 'Daily Horoscope',   desc: 'Personalized cosmic guidance every day',        link: '/horoscope' },
      { icon: '💫', title: 'Kundali Matching',  desc: 'Find your soulmate compatibility',              link: '/matching' },
      { icon: '🔮', title: 'Nakshatra Reading', desc: 'Discover your birth star secrets',              link: '/nakshatra' },
      { icon: '🌙', title: 'Dasha Timeline',    desc: 'Your life periods mapped to the stars',         link: '/dasha' },
      { icon: '🧮', title: 'Panchang',          desc: 'Auspicious timings for every occasion',         link: '/panchang' },
    ],
  },

  how_it_works: {
    label: 'How It Works Steps',
    help: 'The numbered steps on the homepage.',
    itemLabel: (d) => d.title || 'Step',
    fields: [
      { key: 'step',  label: 'Step number', type: 'text', help: 'e.g. 01' },
      { key: 'title', label: 'Title',       type: 'text', required: true },
      { key: 'desc',  label: 'Description', type: 'textarea' },
    ],
    seed: [
      { step: '01', title: 'Enter Your Birth Details', desc: 'Name, date, time and place of birth. Auto-detects your location for quick fill.' },
      { step: '02', title: 'Get Your Free Kundali',    desc: 'Swiss Ephemeris precision calculates your complete birth chart in seconds.' },
      { step: '03', title: 'Talk to Your Astrologer',  desc: 'Matched to your exact concern — love, career, health, or spiritual guidance.' },
    ],
  },

  footer_links: {
    label: 'Footer Links',
    help: 'The "Platform" column in the footer.',
    itemLabel: (d) => d.label || 'Link',
    fields: [
      { key: 'label', label: 'Text', type: 'text', required: true },
      { key: 'to',    label: 'Links to', type: 'text', required: true, help: 'A path on this site, e.g. /about' },
    ],
    seed: [
      { label: 'Kundali',              to: '/kundali' },
      { label: 'Find Purpose',         to: '/purpose' },
      { label: 'Astrologers',          to: '/astrologers' },
      { label: 'Talk to AstroVyoma AI', to: '/chat' },
      { label: 'Blog',                 to: '/blog' },
      { label: 'About Us',             to: '/about' },
      { label: 'Join As Astrologer',   to: '/join-as-astrologer' },
    ],
  },

  plans: {
    label: 'Subscription Plans',
    titleField: 'name',
    help: 'Prices and features on the Plans page. Reorder to change the order they appear in.',
    itemLabel: (d) => d.name || 'Plan',
    fields: [
      { key: 'id',          label: 'Internal id', type: 'text', required: true,
        help: 'Lowercase, no spaces — free, silver, gold, platinum. Changing this on an existing plan will orphan current subscribers, so leave it alone unless you are adding a new plan.' },
      { key: 'name',        label: 'Plan name',   type: 'text', required: true },
      { key: 'price',       label: 'Monthly price (₹)', type: 'number', default: 0, min: 0 },
      { key: 'yearlyPrice', label: 'Yearly price (₹)',  type: 'number', default: 0, min: 0 },
      { key: 'icon',        label: 'Emoji',  type: 'text' },
      { key: 'color',       label: 'Colour', type: 'color', default: '#c9a84c' },
      { key: 'popular',     label: 'Mark as "Most Popular"', type: 'boolean', default: false },
      { key: 'features',    label: 'What is included', type: 'textarea',
        help: 'One per line.' },
      { key: 'notIncluded', label: 'What is not included', type: 'textarea',
        help: 'One per line. Leave empty if everything is included.' },
    ],
    seed: [
      { id: 'free', name: 'Free', price: 0, yearlyPrice: 0, color: '#6b7280', icon: '✨', popular: false,
        features: ['Kundali generation (birth chart)', 'Daily horoscope for all 12 signs', "Today's Panchang", 'Sade Sati calculator', 'Mangal Dosha checker', 'Basic Tarot reading', 'Vastu guide (static)', '5 AI chatbot messages/day'].join('\n'),
        notIncluded: ['PDF downloads', 'Extended horoscope', 'Consultations'].join('\n') },
      { id: 'silver', name: 'Silver', price: 99, yearlyPrice: 999, color: '#94a3b8', icon: '🌙', popular: false,
        features: ['All free tools (unlimited)', 'Extended horoscope — weekly, monthly, yearly', 'Nakshatra & Dasha analysis', 'Full Panchang calendar', 'Gochara (transit) reports', 'Guna Milan — full 36-point analysis', 'Lal Kitab & Vastu guide', 'Life Domain Reports', 'Festival & Planetary Calendar', '10 AI chatbot messages/day'].join('\n'),
        notIncluded: ['PDF downloads', 'Consultations', 'Priority support'].join('\n') },
      { id: 'gold', name: 'Gold', price: 299, yearlyPrice: 2999, color: '#e8c547', icon: '⭐', popular: true,
        features: ['Everything in Silver', 'Kundali PDF (English + Hindi)', 'Detailed birth chart PDF', '30-min consultation credit/month', 'Unlimited AI chatbot', 'Mangal Dosha + Sade Sati deep reports', 'Tarot reading (unlimited)', 'Numerology full report', 'Domain Reports with detailed remedies', 'Priority email support'].join('\n'),
        notIncluded: ['Unlimited consultations'].join('\n') },
      { id: 'platinum', name: 'Platinum', price: 599, yearlyPrice: 5999, color: '#a78bfa', icon: '💎', popular: false,
        features: ['Everything in Gold', 'Unlimited consultation minutes/month', 'Yearly + 5-year forecast PDF', 'KP Astrology report', 'Personalized remedy kit suggestions', 'Dedicated astrologer assignment', 'WhatsApp support', 'Early access to new features', 'Family plan — 2 kundali profiles'].join('\n'),
        notIncluded: '' },
    ],
  },

  nav_groups: {
    label: 'Menu — Dropdowns',
    help: 'The dropdown headings in the top menu bar. Reorder these to reorder the menu.',
    itemLabel: (d) => d.label || 'Menu',
    fields: [
      { key: 'label', label: 'Dropdown name', type: 'text', required: true,
        help: 'Must match the "Belongs to" value on its menu links exactly.' },
    ],
    seed: [
      { label: 'Kundali' }, { label: 'Horoscope' }, { label: 'Panchang' },
      { label: 'Tools' }, { label: 'Shop' },
    ],
  },

  nav_items: {
    label: 'Menu — Links',
    titleField: 'label',
    help: 'The links inside each dropdown. "Belongs to" decides which dropdown a link appears under.',
    itemLabel: (d) => d.label || 'Link',
    fields: [
      { key: 'group', label: 'Belongs to', type: 'text', required: true,
        help: 'The dropdown name, e.g. Kundali. Spelling must match.' },
      { key: 'icon',  label: 'Emoji', type: 'text' },
      { key: 'label', label: 'Link text', type: 'text', required: true },
      { key: 'to',    label: 'Links to', type: 'text', required: true, help: 'A path on this site, e.g. /kundali' },
    ],
    seed: [
      { group: 'Kundali',   icon: '🪐', label: 'Free Kundali',      to: '/kundali' },
      { group: 'Kundali',   icon: '💫', label: 'Kundali Matching',  to: '/matching' },
      { group: 'Kundali',   icon: '⭐', label: 'Nakshatra Reading', to: '/nakshatra' },
      { group: 'Kundali',   icon: '🌙', label: 'Dasha Timeline',    to: '/dasha' },
      { group: 'Kundali',   icon: '☯',  label: 'Find Your Purpose', to: '/purpose' },

      { group: 'Horoscope', icon: '⭐', label: 'Daily Horoscope',   to: '/horoscope' },
      { group: 'Horoscope', icon: '📅', label: 'Weekly & Extended', to: '/horoscope/extended' },
      { group: 'Horoscope', icon: '🪐', label: 'Sade Sati',         to: '/sade-sati' },
      { group: 'Horoscope', icon: '🔴', label: 'Mangal Dosha',      to: '/mangal-dosha' },
      { group: 'Horoscope', icon: '🙏', label: 'Remedies',          to: '/remedies' },

      { group: 'Panchang',  icon: '📅', label: 'Panchang Calendar',      to: '/panchang/calendar' },
      { group: 'Panchang',  icon: '🕉️', label: "Today's Panchang",       to: '/panchang' },
      { group: 'Panchang',  icon: '🌙', label: "Today's Tithi",          to: '/panchang/tithi' },
      { group: 'Panchang',  icon: '✨', label: "Today's Shubhamuhurat",  to: '/panchang/shubhamuhurat' },
      { group: 'Panchang',  icon: '⭐', label: "Today's Nakshatra",      to: '/panchang/nakshatra' },
      { group: 'Panchang',  icon: '⏰', label: "Today's Choghadiya",     to: '/panchang/choghadiya' },
      { group: 'Panchang',  icon: '🐉', label: "Today's Rahu Kaal",      to: '/panchang/rahukaal' },
      { group: 'Panchang',  icon: '🕐', label: 'Muhurta Calculator',     to: '/muhurta' },
      { group: 'Panchang',  icon: '🍀', label: "Today's Lucky Info",     to: '/lucky' },
      { group: 'Panchang',  icon: '🌍', label: 'Gochara (Transit)',      to: '/gochara' },

      { group: 'Tools',     icon: '🔢', label: 'Numerology',         to: '/numerology' },
      { group: 'Tools',     icon: '🔮', label: 'Tarot Reader',       to: '/tarot' },
      { group: 'Tools',     icon: '🏠', label: 'Vastu Shastra',      to: '/vastu' },
      { group: 'Tools',     icon: '🍼', label: 'Namkaran Tool',      to: '/namkaran' },
      { group: 'Tools',     icon: '🗓️', label: 'Festival Calendar',  to: '/festivals' },
      { group: 'Tools',     icon: '💎', label: 'Crystal & Gem Guide', to: '/crystals' },

      { group: 'Shop',      icon: '🛍️', label: 'Astro Mall',   to: '/mall' },
      { group: 'Shop',      icon: '🪔', label: 'Book Pooja',   to: '/book-pooja' },
      { group: 'Shop',      icon: '🏡', label: 'Vastu Pooja',  to: '/vastu-pooja' },
      { group: 'Shop',      icon: '💎', label: 'Plans',        to: '/plans' },
    ],
  },

  pages: {
    label: 'Pages',
    titleField: 'title',
    help: 'Whole pages of writing — Terms, Privacy, and any new page you want to add. ' +
          'The web address is made from the "Page address" below, so a page with terms ' +
          'in that box lives at /terms. Add a Footer Link pointing at the same address ' +
          'to give people a way to reach it.',
    itemLabel: (d) => d.title || 'Page',
    fields: [
      { key: 'slug',  label: 'Page address', type: 'text', required: true,
        help: 'Lowercase, no spaces — terms, privacy, refunds. This becomes the web address, so changing it breaks any link that already points here.' },
      { key: 'title', label: 'Page title', type: 'text', required: true },
      { key: 'intro', label: 'Line under the title', type: 'textarea',
        help: 'Optional. A sentence introducing the page.' },
      { key: 'icon',  label: 'Emoji', type: 'text', default: '📜' },
      { key: 'body',  label: 'The page itself', type: 'richtext', required: true, help: BODY_HELP },
      { key: 'updatedNote', label: 'Footnote', type: 'text',
        help: 'Optional. Shown small at the bottom, e.g. "Last updated August 2026".' },
    ],
    seed: [
      {
        slug: 'terms', title: 'Terms of Service', icon: '📜',
        intro: 'The agreement between you and AstroVyoma when you use this site.',
        updatedNote: 'Last updated August 2026',
        body: [
          '## Who we are',
          'AstroVyoma is an online platform for Vedic astrology. We provide free astrological calculations, paid consultations with independent astrologers, subscription plans, and a shop for related items. By using the site you agree to these terms.',
          '## What our readings are, and what they are not',
          'Astrological readings, reports, horoscopes and chatbot replies on this site are offered for guidance and reflection. They are not a substitute for professional medical, legal, financial or psychological advice.',
          '> Please do not delay seeking help from a qualified doctor, lawyer or financial adviser because of anything you read here.',
          'Decisions you take after a reading remain yours. We do not guarantee any particular outcome, and no prediction on this site should be treated as a certainty.',
          '## Your account',
          '- You must be 18 or older to create an account and to book a paid consultation.',
          '- Keep your login details to yourself. Anything done through your account is treated as done by you.',
          '- Give accurate birth details. A chart calculated from the wrong date, time or place will be wrong, and that is not a fault we can correct afterwards.',
          '- One person, one account. Accounts may not be shared, sold or transferred.',
          '## Astrologers on the platform',
          'Astrologers listed here are independent practitioners, not our employees. We check credentials before listing anyone, but the advice given in a consultation is theirs. Consultations are charged per minute from your wallet balance and stop when you end the session or the balance runs out.',
          '## Money',
          '- Wallet balance is added in advance and spent on consultations and reports.',
          '- Prices shown include applicable taxes unless stated otherwise.',
          '- Subscription plans renew for the period you chose until you cancel. Cancelling stops the next renewal; it does not refund the period already running.',
          '- Wallet balance is not transferable and cannot be withdrawn as cash.',
          '## Refunds',
          'If a consultation fails for a technical reason on our side, or an astrologer does not join, write to us and we will return those minutes to your wallet. Refunds are not given because you disagreed with a prediction. Requests should reach us within seven days of the session.',
          '## What you may not do',
          '- Use the site to harass, threaten or defraud anyone, including our astrologers.',
          '- Copy, scrape or resell reports, charts or written content from the site.',
          '- Try to break, overload or gain unauthorised access to any part of the platform.',
          '- Represent yourself as an AstroVyoma astrologer when you are not.',
          '## Content you post',
          'Reviews and messages you submit stay yours, but you give us permission to display them on the site. We may remove anything abusive, misleading or unlawful.',
          '## Where we stand if something goes wrong',
          'We work to keep the site accurate and available, but we cannot promise it will never be interrupted or never contain an error. To the extent the law allows, our liability for any claim connected to the site is limited to the amount you paid us in the three months before it arose.',
          '## Changes',
          'These terms may change as the platform changes. The current version is always the one on this page, and continuing to use the site after a change means you accept it.',
          '## Governing law',
          'These terms are governed by the laws of India, and the courts of Rajasthan have jurisdiction over any dispute.',
          '## Reaching us',
          'Questions about these terms can go to the support address shown in the footer of every page.',
        ].join('\n\n'),
      },
      {
        slug: 'privacy', title: 'Privacy Policy', icon: '🔐',
        intro: 'What we collect, why we collect it, and what you can ask us to do with it.',
        updatedNote: 'Last updated August 2026',
        body: [
          '## The short version',
          'We collect what we need to calculate your chart, run your account and take payment. We do not sell your data. Your birth details and consultation history are private to you and to the astrologer you consult.',
          '## What we collect',
          '- **Account details** — your name, mobile number and email address.',
          '- **Birth details** — date, time and place of birth. These are what the whole site runs on: without them there is no chart.',
          '- **Consultation records** — who you spoke to, when, for how long, and the chat messages exchanged.',
          '- **Payment records** — amounts, dates and the reference our payment provider gives us. We never see or store your card number.',
          '- **Technical data** — device, browser and approximate location from your IP address, used to keep the service working and secure.',
          '## Why we collect it',
          'To calculate your kundali and reports, to connect you with an astrologer, to take and record payment, to answer support requests, to detect fraud and abuse, and to meet legal obligations. We use your birth details for astrological calculation and nothing else.',
          '## Who else sees it',
          '- The astrologer you book, who sees your name, chart and question so they can advise you.',
          '- Our payment provider, to process a transaction.',
          '- Our hosting and communication providers, who store or transmit data on our behalf under contract.',
          '- Authorities, where the law requires it.',
          '> We do not sell your personal data, and we do not pass it to advertisers.',
          '## The AI assistant',
          'Questions you ask the AI chatbot are sent to our AI provider to generate a reply, together with your chart if you asked for a personalised answer. Do not type anything into it you would not want leaving your device.',
          '## How long we keep it',
          'Account and birth details are kept while your account exists. Consultation and payment records are kept for as long as tax and accounting rules require, usually eight years. Delete your account and we remove your personal details, keeping only what those rules oblige us to hold.',
          '## Keeping it safe',
          'Traffic is encrypted in transit, passwords are stored hashed rather than in plain text, and access to the database is limited to the people who run the platform. No system is perfectly secure, so we also tell you promptly if something goes wrong.',
          '## What you can ask for',
          '- A copy of the data we hold about you.',
          '- A correction, if something is wrong.',
          '- Deletion of your account and personal details.',
          '- To stop marketing messages, which you can also do from any message we send.',
          'Write to the support address in the footer and we will respond within thirty days.',
          '## Cookies',
          'We use cookies to keep you logged in and to remember your preferences. We do not use advertising cookies. Blocking cookies in your browser will stop you from staying signed in.',
          '## Children',
          'The site is not intended for anyone under 18, and we do not knowingly collect data from children. If you believe a child has given us their details, tell us and we will remove them.',
          '## Changes',
          'If this policy changes materially we will say so on the site. The date at the foot of this page is always the version in force.',
        ].join('\n\n'),
      },
    ],
  },

  blog_posts: {
    label: 'Blog Articles',
    titleField: 'title',
    help: 'Everything on the Blog page. Hide an article instead of deleting it if you might want it back.',
    itemLabel: (d) => d.title || 'Article',
    fields: [
      { key: 'title',    label: 'Headline', type: 'text', required: true },
      { key: 'slug',     label: 'Web address', type: 'text', required: true,
        help: 'Lowercase words joined by dashes — mercury-retrograde-2025. Changing it breaks links people have already shared.' },
      { key: 'category', label: 'Category', type: 'text',
        help: 'Articles are grouped and filtered by this on the blog page, so keep the spelling consistent.' },
      { key: 'icon',     label: 'Emoji', type: 'text', default: '✦' },
      { key: 'excerpt',  label: 'Summary', type: 'textarea',
        help: 'The couple of lines shown on the blog listing and under the headline.' },
      { key: 'author',   label: 'Written by', type: 'text', default: 'AstroVyoma Editorial' },
      { key: 'date',     label: 'Date', type: 'text', help: 'YYYY-MM-DD, e.g. 2026-08-09.' },
      { key: 'readTime', label: 'Minutes to read', type: 'number', default: 5, min: 1, max: 90 },
      { key: 'tags',     label: 'Tags', type: 'text', help: 'Separated by commas. Used for the related-articles list.' },
      { key: 'body',     label: 'The article', type: 'richtext', required: true, help: BODY_HELP },
    ],
    seed: ARTICLES.map(a => ({
      title: a.title, slug: a.slug, category: a.category, icon: a.icon,
      excerpt: a.excerpt, author: a.author, date: a.date, readTime: a.readTime,
      tags: (a.tags || []).join(', '),
      body: blocksToText(a.content),
    })),
  },

  about_stats: {
    label: 'About — Highlights',
    titleField: 'label',
    // These were counts — "12+ Expert Astrologers", "10,000+ Lives Guided" —
    // against 3 astrologers and no consultations. They say what the site does
    // instead, which is true on the first day as well as the thousandth.
    help: 'The four highlights across the About page. Keep them to what the ' +
          'site actually does — a count of users or readings has to be true ' +
          'the day somebody checks it.',
    itemLabel: (d) => d.label || 'Highlight',
    fields: [
      { key: 'icon',  label: 'Emoji',  type: 'text' },
      { key: 'value', label: 'Headline', type: 'text', required: true, help: 'The big word, e.g. Detailed' },
      { key: 'label', label: 'What it refers to', type: 'text', required: true, help: 'The line underneath, e.g. Kundli Analysis' },
    ],
    seed: [
      { icon: '🔭', value: 'Detailed',   label: 'Kundli Analysis' },
      { icon: '🌟', value: 'Actionable', label: 'Life Remedies' },
      { icon: '🔭', value: 'Real-Time',  label: 'Chart Generation' },
      { icon: '🌟', value: 'Daily',      label: 'Horoscope Updates' },
      // These two survived the cull of invented figures: one is a claim about
      // the tradition, the other about how we hold data. Neither counts users.
      { icon: '📜', value: '5,000+',     label: 'Years of Vedic Wisdom' },
      { icon: '🔐', value: '100%',       label: 'Confidential & Secure' },
    ],
  },

  about_pillars: {
    label: 'About — Pillars',
    titleField: 'title',
    help: 'The "AstroVyoma Pillars" cards on the About page.',
    itemLabel: (d) => d.title || 'Pillar',
    fields: [
      { key: 'emoji', label: 'Emoji', type: 'text' },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'desc',  label: 'Description', type: 'textarea' },
      { key: 'tone',  label: 'Colour', type: 'select', default: 'gold',
        options: [{ value: 'gold', label: 'Gold' }, { value: 'violet', label: 'Violet' },
                  { value: 'emerald', label: 'Green' }, { value: 'blue', label: 'Blue' }] },
    ],
    seed: [
      { emoji: '🏛️', tone: 'gold', title: 'The Elite Brain Trust',
        desc: "Our panel doesn't consist of hobbyists. It features celebrated authors, institutional scholars, and trusted advisors to industry captains, global tech leaders, and innovators." },
      { emoji: '🤝', tone: 'violet', title: 'Power of Collaboration',
        desc: 'Unlike standalone consultations, AstroVyoma operates as a collaborative guild. For complex life blueprints, our top experts cross-verify planetary transits and charts to deliver unprecedented accuracy.' },
      { emoji: '☮️', tone: 'emerald', title: 'No Fear-Mongering',
        desc: 'We strictly forbid regressive, fear-inducing predictions. Our astrologers view a birth chart not as a fixed script of doom, but as a cosmic roadmap filled with potential and possibility.' },
      { emoji: '🔬', tone: 'blue', title: 'Scientific Remedial Measures',
        desc: 'Our remedies are practical, energetic, and lifestyle-oriented — combining psychological grounding, gemstone science, sound frequencies (Mantras), and spatial alignment (Vastu).' },
    ],
  },

  about_expertise: {
    label: 'About — What We Practise',
    titleField: 'title',
    help: 'The disciplines listed on the About page.',
    itemLabel: (d) => d.title || 'Discipline',
    fields: [
      { key: 'icon',     label: 'Emoji', type: 'text' },
      { key: 'title',    label: 'Discipline', type: 'text', required: true },
      { key: 'approach', label: 'How we work with it', type: 'textarea' },
      { key: 'result',   label: 'What it gives you', type: 'text' },
      { key: 'tone',     label: 'Colour', type: 'select', default: 'gold',
        options: [{ value: 'gold', label: 'Gold' }, { value: 'violet', label: 'Violet' },
                  { value: 'emerald', label: 'Green' }, { value: 'blue', label: 'Blue' }] },
    ],
    seed: [
      { icon: '🪐', tone: 'gold', title: 'Traditional Vedic & KP Astrology',
        approach: 'Pinpoint timing of events using exact planetary degrees.',
        result: 'Clarity on Career, Finance & Relationships' },
      { icon: '🔢', tone: 'violet', title: 'Advanced Numerology',
        approach: 'Harmonizing your name and birth frequencies with cosmic vibrations.',
        result: 'Enhanced personal branding and luck alignment' },
      { icon: '🏠', tone: 'emerald', title: 'Scientific Vastu Shastra',
        approach: 'Aligning living and digital workspaces with elemental energies.',
        result: 'Accelerated growth, peace, and abundance' },
    ],
  },

  about_promises: {
    label: 'About — Our Promises',
    titleField: 'title',
    help: 'The three promises near the foot of the About page.',
    itemLabel: (d) => d.title || 'Promise',
    fields: [
      { key: 'emoji', label: 'Emoji', type: 'text' },
      { key: 'title', label: 'Promise', type: 'text', required: true },
      { key: 'desc',  label: 'Description', type: 'textarea' },
    ],
    seed: [
      { emoji: '🔐', title: 'Absolute Confidentiality',
        desc: 'Your birth data and life challenges are treated with the highest level of data security and spiritual privacy. What you share stays sacred.' },
      { emoji: '⚖️', title: 'Uncompromising Integrity',
        desc: 'If a chart shows a challenging period, we present it with honesty — immediately followed by the exact cosmic tools required to navigate it.' },
      { emoji: '📿', title: 'Authentic Lineage',
        desc: 'Every consultant on AstroVyoma is strictly vetted for credentialing, ethical standards, and predictive accuracy. No shortcuts, no imposters.' },
    ],
  },

  mall_categories: {
    label: 'Shop — Categories',
    titleField: 'label',
    help: 'The kinds of item the Astro Mall sells. The "Category id" is what ties a ' +
          'product to its category, so changing one here means changing it on every ' +
          'product that used it.',
    itemLabel: (d) => d.label || 'Category',
    fields: [
      { key: 'key',   label: 'Category id', type: 'text', required: true,
        help: 'Lowercase, no spaces — gemstones, rudraksha. Products refer to this exact word.' },
      { key: 'label', label: 'Shown as', type: 'text', required: true },
      { key: 'icon',  label: 'Emoji', type: 'text' },
      { key: 'color', label: 'Colour', type: 'color', default: '#c9a84c' },
      { key: 'desc',  label: 'One-line description', type: 'text' },
    ],
    seed: Object.entries(CATEGORY_META).map(([key, m]) => ({ key, ...m })),
  },

  mall_purposes: {
    label: 'Shop — Shop by Purpose',
    titleField: 'label',
    help: 'What people are shopping for — money, love, protection. A product can be ' +
          'listed under several of these.',
    itemLabel: (d) => d.label || 'Purpose',
    fields: [
      { key: 'key',   label: 'Purpose id', type: 'text', required: true,
        help: 'Lowercase, no spaces — money, love. Products refer to this exact word.' },
      { key: 'label', label: 'Shown as', type: 'text', required: true },
      { key: 'icon',  label: 'Emoji', type: 'text' },
      { key: 'color', label: 'Colour', type: 'color', default: '#c9a84c' },
      { key: 'desc',  label: 'One-line description', type: 'text' },
    ],
    seed: Object.entries(PURPOSE_META).map(([key, m]) => ({ key, ...m })),
  },

  mall_products: {
    label: 'Shop — Products',
    titleField: 'name',
    help: 'Everything on sale in the Astro Mall. To take something off sale without ' +
          'losing it, switch "In stock" off, or hide the row entirely.',
    itemLabel: (d) => d.name || 'Product',
    fields: [
      { key: 'name',  label: 'Product name', type: 'text', required: true },
      { key: 'id',    label: 'Product code', type: 'text', required: true,
        help: 'Lowercase words joined by dashes — blue-sapphire-5r. It is the product’s web address and how carts remember it, so changing it on a product people have already bought or bookmarked will break those links.' },
      { key: 'category', label: 'Category', type: 'select',
        options: Object.entries(CATEGORY_META).map(([value, m]) => ({ value, label: `${m.icon} ${m.label}` })),
        default: Object.keys(CATEGORY_META)[0] },
      { key: 'purposes', label: 'Shop-by-purpose', type: 'text',
        help: `Separated by commas. Use these words: ${Object.keys(PURPOSE_META).join(', ')}.` },
      { key: 'image', label: 'Photo', type: 'image',
        help: 'Optional. Without one the card shows the category emoji, as it does now.' },

      { key: 'price',         label: 'Price (₹)', type: 'number', default: 0, min: 0 },
      { key: 'originalPrice', label: 'Was (₹)', type: 'number', default: 0, min: 0,
        help: 'Shown struck through next to the price. Set it to 0 to show no discount.' },
      { key: 'isInStock',     label: 'In stock', type: 'boolean', default: true },
      { key: 'isBestseller',  label: 'Bestseller badge', type: 'boolean', default: false,
        help: 'Switch on only for something that genuinely sells well. Ten ' +
              'products shipped with this on before anything had ever been ' +
              'sold, which is a claim about sales that had not happened.' },
      { key: 'isFeatured',    label: 'Show on the shop front page', type: 'boolean', default: false },

      { key: 'shortDesc',   label: 'One-line description', type: 'textarea',
        help: 'The sentence under the name on the product card.' },
      { key: 'description', label: 'Full description', type: 'richtext', help: BODY_HELP },
      { key: 'benefits',    label: 'Benefits', type: 'textarea', help: 'One per line.' },
      { key: 'howToUse',    label: 'How to use it', type: 'textarea' },

      { key: 'planet',   label: 'Planet',  type: 'text' },
      { key: 'zodiac',   label: 'Suits which signs', type: 'text', help: 'Separated by commas, e.g. Capricorn, Aquarius.' },
      { key: 'bestDay',  label: 'Best day to wear it', type: 'text' },
      { key: 'bestTime', label: 'Best time', type: 'text' },

      { key: 'weight',        label: 'Weight / size', type: 'text' },
      { key: 'material',      label: 'Material', type: 'text' },
      { key: 'certification', label: 'Certification', type: 'text' },

      { key: 'rating',      label: 'Star rating', type: 'number', default: 5, min: 0, max: 5 },
      { key: 'reviewCount', label: 'Number of reviews', type: 'number', default: 0, min: 0 },
      { key: 'tags',        label: 'Tags', type: 'text', help: 'Separated by commas. Used by the search box.' },
    ],
    seed: PRODUCTS.map(p => ({
      ...p,
      purposes: (p.purposes || []).join(', '),
      zodiac:   (p.zodiac || []).join(', '),
      tags:     (p.tags || []).join(', '),
      benefits: (p.benefits || []).join('\n'),
      // A photograph where one exists, otherwise the drawn artwork. Both live
      // in frontend/public/products; either is replaceable from the admin.
      image: `/products/${p.id}.${PHOTOGRAPHED.includes(p.id) ? 'webp' : 'svg'}`,
    })),
  },

  hero_ctas: {
    label: 'Hero Buttons',
    help: 'The buttons floating over the homepage banner.',
    itemLabel: (d) => d.label || 'Button',
    fields: [
      { key: 'label', label: 'Button text', type: 'text', required: true },
      { key: 'to',    label: 'Links to',    type: 'text', required: true },
      { key: 'style', label: 'Style',       type: 'select', default: 'outline',
        options: [{ value: 'solid', label: 'Solid gold (main action)' },
                  { value: 'outline', label: 'Outlined (secondary)' }] },
    ],
    seed: [
      { label: 'Get Free Kundali',      to: '/kundali',     style: 'solid' },
      { label: 'Talk to Astrologer',    to: '/astrologers', style: 'outline' },
      { label: 'Talk to AstroVyoma AI', to: '/chat',        style: 'outline' },
    ],
  },

  // ── The astrologer onboarding kit ──────────────────────────────────────────
  // Everything an astrologer is told before and just after they join, in six
  // lists so each part can be changed on its own. These are terms people will
  // hold us to, so they are worded as commitments and kept editable — a payout
  // day or a commission share that changes must be changeable without a deploy.
  onboarding_criteria: {
    label: 'Joining — Who Can Join',
    titleField: 'title',
    help: 'What an astrologer must have before applying. Keep these honest — an ' +
          'applicant who meets every line here should expect to be accepted.',
    itemLabel: (d) => d.title || 'Requirement',
    fields: [
      { key: 'emoji', label: 'Emoji', type: 'text' },
      { key: 'title', label: 'Requirement', type: 'text', required: true },
      { key: 'desc',  label: 'What it means', type: 'textarea' },
    ],
    seed: [
      { emoji: '📿', title: 'At least 3 years of practice',
        desc: 'Consulting real people, not only study. Longer practice raises the per-minute rate you can ask for.' },
      { emoji: '🎓', title: 'A tradition you can name',
        desc: 'Vedic, KP, Nadi, Lal Kitab, numerology, Vastu, tarot — guru-shishya lineage counts as much as an institutional certificate.' },
      { emoji: '🗣️', title: 'Fluent in Hindi or English',
        desc: 'Any further language you speak widens the seekers matched to you and is shown on your profile.' },
      { emoji: '📱', title: 'A smartphone and steady internet',
        desc: 'Consultations run over chat and call in the browser. Nothing to install.' },
      { emoji: '☮️', title: 'No fear-based predictions',
        desc: 'A hard rule, not a preference. A difficult period is delivered with the remedy beside it, never as doom to be paid away.' },
    ],
  },

  onboarding_documents: {
    label: 'Joining — Papers to Keep Ready',
    titleField: 'title',
    help: 'What verification asks for. Anything marked not required can be left ' +
          'out without holding up the application.',
    itemLabel: (d) => d.title || 'Document',
    fields: [
      { key: 'title',    label: 'Document', type: 'text', required: true },
      { key: 'why',      label: 'Why it is needed', type: 'text' },
      { key: 'required', label: 'Required', type: 'boolean', default: true },
    ],
    seed: [
      { title: 'Photo ID (Aadhaar, PAN or passport)', required: true,
        why: 'Confirms you are who the profile says you are.' },
      { title: 'PAN card', required: true,
        why: 'Needed before any payout can be released.' },
      { title: 'Bank account details or UPI id', required: true,
        why: 'Where your earnings are sent.' },
      { title: 'Certificates or proof of lineage', required: false,
        why: 'Shown on your profile as credentials. Strengthens an application without being compulsory.' },
      { title: 'A clear photograph of yourself', required: true,
        why: 'Your profile picture. Seekers choose an astrologer they can see.' },
    ],
  },

  onboarding_steps: {
    label: 'Joining — How It Works',
    titleField: 'title',
    help: 'The steps from applying to taking your first consultation. The timing ' +
          'shown against each step is a promise to the applicant — change it here ' +
          'if it stops being true.',
    itemLabel: (d) => d.title || 'Step',
    fields: [
      { key: 'title',   label: 'Step', type: 'text', required: true },
      { key: 'desc',    label: 'What happens', type: 'textarea' },
      { key: 'timing',  label: 'How long it takes', type: 'text', help: 'e.g. Within 3 working days' },
    ],
    seed: [
      { title: 'Send the application', timing: '15 minutes',
        desc: 'The form on Join as Astrologer asks for your details, your practice and the per-minute rate you want. Nothing is charged and nothing is committed.' },
      { title: 'We read it', timing: 'Within 3 working days',
        desc: 'A person reads every application. If your practice fits AstroVyoma you are called; if not, you are told plainly rather than left waiting.' },
      { title: 'A conversation', timing: 'About 30 minutes',
        desc: 'A call with a senior astrologer on the panel. Part chart discussion, part how you handle a frightened client. It is not an examination.' },
      { title: 'Papers and verification', timing: '2 to 4 working days',
        desc: 'ID, PAN and bank details are checked. Certificates you supply are added to your profile as credentials.' },
      { title: 'Your profile goes up', timing: '1 working day',
        desc: 'Photo, biography, disciplines, languages and rate. You approve how it reads before it is published.' },
      { title: 'Go online and take your first consultation', timing: 'Same day',
        desc: 'Switch yourself online in the Pandit Portal and seekers can reach you. Go offline whenever you want; nobody is penalised for being unavailable.' },
    ],
  },

  onboarding_kit: {
    label: 'Joining — What You Get',
    titleField: 'title',
    help: 'The parts of the kit handed to an astrologer on joining — the tools, ' +
          'the page, the support. One card each.',
    itemLabel: (d) => d.title || 'Component',
    fields: [
      { key: 'emoji', label: 'Emoji', type: 'text' },
      { key: 'title', label: 'What it is', type: 'text', required: true },
      { key: 'desc',  label: 'Description', type: 'textarea' },
      { key: 'tone',  label: 'Colour', type: 'select', default: 'gold',
        options: [{ value: 'gold', label: 'Gold' }, { value: 'violet', label: 'Violet' },
                  { value: 'emerald', label: 'Green' }, { value: 'blue', label: 'Blue' }] },
    ],
    seed: [
      { emoji: '🪪', tone: 'gold', title: 'Your own profile page',
        desc: 'A page on AstroVyoma carrying your photograph, biography, disciplines, languages, credentials and rate — a link you can share anywhere as your own.' },
      { emoji: '🎛️', tone: 'violet', title: 'The Pandit Portal',
        desc: 'Your working screen. Switch online or offline in one tap, see who is waiting, and watch what you have earned build up through the day.' },
      { emoji: '💬', tone: 'blue', title: 'Chat and call consultations',
        desc: 'Both run in the browser with per-minute billing handled for you. Your personal number is never shown to a seeker.' },
      { emoji: '📅', tone: 'emerald', title: 'Appointments and pooja bookings',
        desc: 'Seekers can book a slot ahead of time or commission a pooja. Both arrive in your portal with the birth details already filled in.' },
      { emoji: '📊', tone: 'gold', title: 'An earnings record',
        desc: 'Every consultation listed with its minutes, what the seeker paid and what came to you. Nothing about your payout is hidden from you.' },
      { emoji: '🤝', tone: 'violet', title: 'The panel behind you',
        desc: 'A complex chart can be taken to the wider panel for a second reading. You are joined to a guild, not left alone with a queue.' },
    ],
  },

  onboarding_conduct: {
    label: 'Joining — What We Ask of You',
    titleField: 'title',
    help: 'The code every astrologer on the panel agrees to. Breaking one of these ' +
          'is the only thing that gets someone taken off the platform.',
    itemLabel: (d) => d.title || 'Rule',
    fields: [
      { key: 'title', label: 'Rule', type: 'text', required: true },
      { key: 'desc',  label: 'What it means in practice', type: 'textarea' },
    ],
    seed: [
      { title: 'Never trade on fear',
        desc: 'No predictions of death, no curses, no danger that can only be lifted by paying more. A hard period is named together with what can be done about it.' },
      { title: 'Never sell a remedy you profit from privately',
        desc: 'Gemstones and rudraksha are recommended on merit. If a seeker wants to buy, point them at the Astro Mall or anywhere they like — not at yourself.' },
      { title: 'Keep what you are told',
        desc: 'Birth details and what a seeker tells you stay between you and them. Not repeated, not reused, not discussed elsewhere.' },
      { title: 'Say when you do not know',
        desc: 'An honest "the chart does not show this clearly" is respected here. A confident invention is not.' },
      { title: 'Keep the hours you advertise',
        desc: 'Being offline is fine at any time. Showing yourself online and not answering is not — it costs the seeker their wait.' },
      { title: 'Consult off the platform and it ends',
        desc: 'Taking a seeker you met here to a private arrangement removes you from the panel. It is the one thing there is no second conversation about.' },
    ],
  },

  onboarding_faqs: {
    label: 'Joining — Questions Astrologers Ask',
    titleField: 'question',
    help: 'The questions that come up before someone applies.',
    itemLabel: (d) => d.question || 'Question',
    fields: [
      { key: 'question', label: 'Question', type: 'text', required: true },
      { key: 'answer',   label: 'Answer', type: 'textarea' },
    ],
    seed: [
      { question: 'Does it cost anything to join?',
        answer: 'No. There is no joining fee, no registration charge and no subscription. AstroVyoma earns only its share of a consultation you have actually given.' },
      { question: 'Do I have to work fixed hours?',
        answer: 'No. You are visible to seekers only while you have set yourself online, and you can go offline at any moment. There is no minimum.' },
      { question: 'Can I keep my own clients and my own practice?',
        answer: 'Yes. Your practice outside AstroVyoma is entirely yours. The one rule is that a seeker who came to you through the platform stays on the platform.' },
      { question: 'Who decides my rate?',
        answer: 'You propose a per-minute rate when you apply and it is agreed with you before your profile goes up. You can ask for it to be changed later as your reviews build.' },
      { question: 'What if a seeker disputes a consultation?',
        answer: 'It is read by a person, both sides are heard, and you are told the outcome. A refund is not taken out of your earnings without you being told why.' },
      { question: 'What happens if my application is turned down?',
        answer: 'You are told, and told why. You are welcome to apply again once the reason has been addressed — most often it is years of practice.' },
    ],
  },
};

// Flat map of setting key -> field definition, for validation and defaults.
const SETTING_FIELDS = {};
for (const group of SETTINGS_GROUPS) {
  for (const field of group.fields) SETTING_FIELDS[field.key] = field;
}

function defaultSettings() {
  const out = {};
  for (const [key, field] of Object.entries(SETTING_FIELDS)) out[key] = field.default;
  return out;
}

// itemLabel is a function, which will not survive JSON. Send the field key the
// UI should use as a row title instead.
function schemaForClient() {
  const lists = {};
  for (const [key, def] of Object.entries(LISTS)) {
    lists[key] = {
      key,
      label: def.label,
      help: def.help,
      titleField: def.titleField || def.fields.find(f => f.required)?.key || def.fields[0]?.key,
      fields: def.fields,
    };
  }
  return { settingsGroups: SETTINGS_GROUPS, lists };
}

module.exports = { SETTINGS_GROUPS, SETTING_FIELDS, LISTS, defaultSettings, schemaForClient };
