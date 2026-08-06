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

// ─── SETTINGS ────────────────────────────────────────────────────────────────
// Singletons. One value each, grouped for the Settings screen.

const SETTINGS_GROUPS = [
  {
    key: 'controls',
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
      { key: 'commissionPercent',  label: 'Platform commission (%)', type: 'number', default: 20, min: 0, max: 100,
        help: 'Share the platform keeps from each paid consultation.' },
      { key: 'newUserFreeMinutes', label: 'Free minutes for new users', type: 'number', default: 5, min: 0, max: 120 },
      { key: 'minWalletRecharge',  label: 'Minimum wallet recharge (₹)', type: 'number', default: 100, min: 1 },
      { key: 'maxWalletRecharge',  label: 'Maximum wallet recharge (₹)', type: 'number', default: 10000, min: 1 },
    ],
  },
  {
    key: 'contact',
    label: 'Contact Details',
    help: 'Shown in the footer and on contact links.',
    fields: [
      { key: 'platformPhone',    label: 'Support phone',    type: 'text', default: '' },
      { key: 'platformEmail',    label: 'Support email',    type: 'text', default: '' },
      { key: 'platformWhatsApp', label: 'WhatsApp number',  type: 'text', default: '' },
    ],
  },
  {
    key: 'brand',
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
    label: 'Testimonials',
    help: 'The "Lives Transformed by the Stars" cards on the homepage.',
    itemLabel: (d) => d.name || 'Testimonial',
    fields: [
      { key: 'name',     label: 'Name',        type: 'text', required: true },
      { key: 'location', label: 'City',        type: 'text' },
      { key: 'rating',   label: 'Stars',       type: 'number', default: 5, min: 1, max: 5 },
      { key: 'text',     label: 'What they said', type: 'textarea', required: true },
      { key: 'avatar',   label: 'Photo',       type: 'image' },
    ],
    seed: [
      { name: 'Priyanka Mehta', location: 'Mumbai', rating: 5,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priyanka&backgroundColor=ffdfbf',
        text: 'AstroVyoma changed my life. Pandit Raj Sharma predicted my job change 6 months before it happened. His accuracy left me speechless. I now consult him for every major decision.' },
      { name: 'Arjun Singh', location: 'Delhi', rating: 5,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun&backgroundColor=b6e3f4',
        text: "Dr. Meera Joshi's reading of my relationship challenges was uncannily accurate. Her remedies actually worked. My marriage transformed within 3 months. Eternally grateful." },
      { name: 'Kavya Nair', location: 'Bangalore', rating: 5,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kavya&backgroundColor=d1d4f9',
        text: "The free Kundali reading opened my eyes to patterns I'd never understood. The AI chat answered my questions at 2 AM when I was anxious. Incredible platform." },
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
      titleField: def.fields.find(f => f.required)?.key || def.fields[0]?.key,
      fields: def.fields,
    };
  }
  return { settingsGroups: SETTINGS_GROUPS, lists };
}

module.exports = { SETTINGS_GROUPS, SETTING_FIELDS, LISTS, defaultSettings, schemaForClient };
