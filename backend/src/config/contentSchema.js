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

  plans: {
    label: 'Subscription Plans',
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
