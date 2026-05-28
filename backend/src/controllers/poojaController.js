const PAATHS = [
  {
    id: 'hanuman-chalisa-11',
    name: 'Hanuman Chalisa Paath',
    subtitle: '11 Times',
    deity: 'Lord Hanuman',
    icon: '🚩',
    gradient: ['#FF6B35', '#C0392B'],
    duration: '3–4 Hours',
    price: 1100,
    originalPrice: 2100,
    planet: 'Mars',
    description: 'Hanuman Chalisa recited 11 times by our experienced Pandit Ji with full Vedic rituals — flowers, incense, dhoop, and proper puja vidhi.',
    benefits: ['Removes obstacles and enemies', 'Bestows courage and physical strength', 'Protection from evil forces and black magic', 'Fulfils sincere wishes and desires'],
    occasion: 'Hanuman Jayanti, Tuesdays, Saturdays, Mangal Dosha remedies',
    includes: ['Hanuman Chalisa × 11', 'Hanuman Aarti', 'Sankalp in your name & gotra', 'WhatsApp video proof'],
    variants: null,
  },
  {
    id: 'ramayan-paath',
    name: 'Shri Ramayan Paath',
    subtitle: 'Sampurna (Complete)',
    deity: 'Lord Ram',
    icon: '🏹',
    gradient: ['#1565C0', '#283593'],
    duration: '7–9 Hours',
    price: 5100,
    originalPrice: 8100,
    planet: 'Sun',
    description: 'Complete Shri Ramayan Paath performed by our Pandit Ji as a divine offering — removes all doshas, brings peace, prosperity, and divine blessings of Lord Ram.',
    benefits: ['Removes all types of papa (sins) and doshas', 'Brings peace, prosperity, and happiness', 'Fulfils long-pending wishes and desires', 'Blesses with health, wealth, and harmony'],
    occasion: 'Ram Navami, Vivah, Griha Pravesh, General auspicious occasions',
    includes: ['Sampurna Ramayan recitation', 'Ram Aarti & Prasad', 'Sankalp in your name', 'WhatsApp video proof'],
    variants: null,
  },
  {
    id: 'sunderkand-paath',
    name: 'Sunderkand Paath',
    subtitle: '1 to 11 Times',
    deity: 'Lord Hanuman & Ram',
    icon: '🐒',
    gradient: ['#00897B', '#1B5E20'],
    duration: '1.5–16 Hours',
    price: 1100,
    originalPrice: 2100,
    planet: 'Mars',
    description: 'Sunderkand — the 5th chapter of Ramayan — is the most auspicious paath for removing obstacles, achieving victory, and receiving Hanuman ji\'s direct blessings.',
    benefits: ['Removes all obstacles from life', 'Brings victory in legal, career, and personal matters', 'Protects from enemies and negative forces', 'Bestows courage, faith, and divine protection'],
    occasion: 'Every Tuesday & Saturday, Hanuman Jayanti, Rahu/Ketu dosha remedies',
    includes: ['Sunderkand recitation (1–11 times)', 'Hanuman Aarti', 'Sankalp in your name', 'WhatsApp video proof'],
    variants: [
      { label: '1 Time',  price: 1100,  originalPrice: 2100,  duration: '1.5 Hours' },
      { label: '3 Times', price: 2500,  originalPrice: 4500,  duration: '4 Hours' },
      { label: '5 Times', price: 3500,  originalPrice: 6000,  duration: '7 Hours' },
      { label: '7 Times', price: 4500,  originalPrice: 7500,  duration: '10 Hours' },
      { label: '11 Times',price: 6100,  originalPrice: 10000, duration: '16 Hours' },
    ],
  },
  {
    id: 'maha-mrityunjaya-jaap',
    name: 'Maha Mrityunjaya Jaap',
    subtitle: '1,25,000 Jaap',
    deity: 'Lord Shiva (Mrityunjaya)',
    icon: '🔱',
    gradient: ['#6A1B9A', '#4527A0'],
    duration: '3–4 Days',
    price: 5100,
    originalPrice: 9100,
    planet: 'Saturn',
    description: 'Maha Mrityunjaya Jaap — 1,25,000 recitations of the powerful death-conquering mantra of Lord Shiva — performed for health, longevity, recovery from illness, and protection from untimely death.',
    benefits: ['Conquer serious illness and health challenges', 'Protect from accidents and untimely death', 'Remove fear, anxiety, and negative energy', 'Bestow long life, health, and vitality'],
    occasion: 'Sade Sati, illness, accident recovery, general protection',
    includes: ['1,25,000 Mahamrityunjaya Jaap', 'Havan/Homam', 'Sankalp in your name', 'WhatsApp video proof'],
    variants: null,
  },
  {
    id: 'satya-narayan-katha',
    name: 'Satya Narayan Katha',
    subtitle: 'Sampurna Paath',
    deity: 'Lord Vishnu (Satyanarayana)',
    icon: '✨',
    gradient: ['#F57F17', '#E65100'],
    duration: '3–4 Hours',
    price: 3100,
    originalPrice: 5100,
    planet: 'Jupiter',
    description: 'Satya Narayan Katha is the most beloved and widely performed puja for home, business, and personal prosperity — bestowing the blessings of Lord Satyanarayana Vishnu.',
    benefits: ['Brings prosperity and happiness to home & family', 'Removes obstacles from business and career', 'Fulfils all righteous wishes and desires', 'Ideal for griha pravesh, marriage, and new beginnings'],
    occasion: 'Purnima, Griha Pravesh, Marriage, New Business, Monthly puja',
    includes: ['Sampurna Satyanarayan Katha (5 Adhyayas)', 'Vishnu Aarti & Prasad', 'Sankalp in your name', 'WhatsApp video proof'],
    variants: null,
  },
  {
    id: 'aditya-hridaya-strot',
    name: 'Aditya Hridaya Strot Paath',
    subtitle: '11 Times',
    deity: 'Surya Devta (Sun God)',
    icon: '☀️',
    gradient: ['#FF8F00', '#FF6F00'],
    duration: '2–3 Hours',
    price: 1100,
    originalPrice: 2100,
    planet: 'Sun',
    description: 'Aditya Hridaya Strot — the divine hymn of the Sun God taught by Sage Agastya to Lord Ram — recited 11 times for success, health, confidence, and solar energy activation.',
    benefits: ['Boosts confidence, willpower, and leadership', 'Strengthens Sun in the horoscope', 'Removes eye and heart-related health issues', 'Brings victory, recognition, and government favour'],
    occasion: 'Sunday, Makar Sankranti, Surya Jayanti, Chhath Puja',
    includes: ['Aditya Hridaya Strot × 11', 'Surya Aarti', 'Sankalp in your name', 'WhatsApp video proof'],
    variants: null,
  },
  {
    id: 'shiv-mans-pooja',
    name: 'Shiv Mans Pooja Paath',
    subtitle: 'Sampurna',
    deity: 'Lord Shiva',
    icon: '🕉️',
    gradient: ['#1A237E', '#0D47A1'],
    duration: '2–3 Hours',
    price: 1500,
    originalPrice: 2500,
    planet: 'Saturn',
    description: 'Shiv Mans Pooja is a meditative mental worship of Lord Shiva — imagining and offering all 16 upachara (services) to Shiva in the mind, as described in the scriptures.',
    benefits: ['Deep spiritual connection with Lord Shiva', 'Removes all mental stress and anxiety', 'Enhances meditation and inner peace', 'Bestows liberation (moksha) energy and divine grace'],
    occasion: 'Shivratri, Mondays, Shravan Month, Pradosh Vrat',
    includes: ['Shiv Mans Pooja complete recitation', 'Shiva Aarti & Abhishek', 'Sankalp in your name', 'WhatsApp video proof'],
    variants: null,
  },
  {
    id: 'shiv-ashtak',
    name: 'Shiv Ashtak Paath',
    subtitle: '11 Times',
    deity: 'Lord Shiva',
    icon: '🌙',
    gradient: ['#00ACC1', '#006064'],
    duration: '2 Hours',
    price: 1100,
    originalPrice: 2000,
    planet: 'Saturn',
    description: 'Shiv Ashtak — eight beautiful Sanskrit shlokas in praise of Lord Shiva — recited 11 times to invoke Shiva\'s blessings for health, peace, and spiritual upliftment.',
    benefits: ['Invokes Lord Shiva\'s direct blessings', 'Removes Shani and Rahu-related problems', 'Bestows health and long life', 'Creates divine peace and positive energy in home'],
    occasion: 'Mondays, Shivratri, Shravan Month, Sade Sati',
    includes: ['Shiv Ashtak × 11', 'Shiva Aarti', 'Sankalp in your name', 'WhatsApp video proof'],
    variants: null,
  },
  {
    id: 'hanuman-ashtak',
    name: 'Hanuman Ashtak Paath',
    subtitle: '11 Times',
    deity: 'Lord Hanuman',
    icon: '💪',
    gradient: ['#D84315', '#BF360C'],
    duration: '2 Hours',
    price: 1100,
    originalPrice: 2000,
    planet: 'Mars',
    description: 'Hanuman Ashtak — the eight devotional verses of Lord Hanuman — recited 11 times for courage, protection, and removal of all problems and evil influences.',
    benefits: ['Instant protection from evil and enemies', 'Builds courage and confidence', 'Removes all types of fears', 'Bestows Hanuman ji\'s powerful protection shield'],
    occasion: 'Tuesdays, Saturdays, Hanuman Jayanti, Mangal Dosha',
    includes: ['Hanuman Ashtak × 11', 'Hanuman Aarti', 'Sankalp in your name', 'WhatsApp video proof'],
    variants: null,
  },
  {
    id: 'durga-saptashati',
    name: 'Durga Saptashati Paath',
    subtitle: 'Sampurna (700 Shlokas)',
    deity: 'Maa Durga (Chandika)',
    icon: '⚔️',
    gradient: ['#C2185B', '#880E4F'],
    duration: '6–8 Hours',
    price: 5100,
    originalPrice: 8500,
    planet: 'Mars',
    description: 'Durga Saptashati (Chandi Paath) — 700 sacred shlokas of Maa Durga — is the most powerful paath for removing all evils, winning over enemies, and receiving the divine mother\'s supreme blessings.',
    benefits: ['Destroys all negative energies and enemies', 'Removes witchcraft, black magic, and evil eye', 'Blesses with health, wealth, and happiness', 'Grants divine protection of the entire family'],
    occasion: 'Navratri, Durga Ashtami, Dussehra, Black magic removal',
    includes: ['Sampurna Durga Saptashati (700 shlokas)', 'Durga Aarti & Havan', 'Sankalp in your name', 'WhatsApp video proof'],
    variants: null,
  },
  {
    id: 'navgrah-pooja',
    name: 'Navgrah Pooja Paath',
    subtitle: 'All 9 Planets',
    deity: 'Nine Planets (Navgrah)',
    icon: '🌟',
    gradient: ['#4E342E', '#1B0000'],
    duration: '4–5 Hours',
    price: 3100,
    originalPrice: 5500,
    planet: 'All Planets',
    description: 'Navgrah Pooja — simultaneous worship and appeasement of all nine planets — performed for complete astrological balance, removal of planetary doshas, and harmonising all cosmic influences.',
    benefits: ['Pacifies all 9 planetary afflictions at once', 'Removes Sade Sati, Mangal, Rahu-Ketu doshas', 'Brings harmony between all planetary forces', 'Ideal before marriage, business launch, or house entry'],
    occasion: 'Before marriage/griha pravesh, Sade Sati, Janma Nakshatra, New Year',
    includes: ['Navgrah Stotra & Puja vidhi', 'Havan with 9 specific samagri', 'Sankalp in your name', 'WhatsApp video proof'],
    variants: null,
  },

  // ── Vastu Pooja (category: 'vastu') ──────────────────────────────────────
  {
    id: 'vastu-shanti-havan',
    name: 'Vastu Shanti Havan',
    subtitle: 'Complete Dosha Nivaran',
    deity: 'Vastu Purusha & Panch Devta',
    icon: '🏠',
    gradient: ['#B45309', '#78350F'],
    duration: '3–4 Hours',
    price: 5100,
    originalPrice: 9100,
    planet: 'All Planets',
    category: 'vastu',
    description: 'A complete Vastu Shanti Havan performed by our expert Pandit Ji to remove all Vastu doshas from your home or office. Includes Vastu Purusha Mandala mantras, Panch Devta worship, and full havan with Vedic samagri.',
    benefits: ['Removes all Vastu doshas from home or office', 'Brings peace, health, and financial prosperity', 'Neutralises all negative cosmic energies', 'Restores positive Prana flow through the space'],
    occasion: 'Shifting to new home, after major renovation, persistent family problems',
    includes: ['Vastu Purusha Mandala Puja', 'Panch Devta Havan', 'Vastu Stotra recitation', 'Sankalp in your name', 'WhatsApp video proof'],
    variants: null,
  },
  {
    id: 'griha-pravesh-puja',
    name: 'Griha Pravesh Puja',
    subtitle: 'Housewarming Ceremony',
    deity: 'Lord Ganesha & Vastu Devta',
    icon: '🚪',
    gradient: ['#7C3AED', '#4C1D95'],
    duration: '4–5 Hours',
    price: 7100,
    originalPrice: 12000,
    planet: 'Jupiter',
    category: 'vastu',
    description: 'Griha Pravesh is the sacred housewarming ceremony performed before entering a new home. Our Pandit Ji conducts the complete puja with Ganesha puja, Vastu Shanti, Navagraha worship, and Griha Devta Havan — ensuring divine blessings for the new home.',
    benefits: ['Invites divine blessings into the new home', 'Removes any construction-related doshas', 'Ensures harmony, health, and prosperity', 'Auspicious beginning for family life in new home'],
    occasion: 'Moving into a new house or apartment, after construction completion',
    includes: ['Ganesha Puja & Kalash Sthapana', 'Vastu Shanti Havan', 'Navagraha Worship', 'Griha Devta Puja', 'Sankalp in your name', 'WhatsApp video proof'],
    variants: null,
  },
  {
    id: 'bhoomi-puja',
    name: 'Bhoomi Puja',
    subtitle: 'Land Worship Before Construction',
    deity: 'Bhoomi Devi (Mother Earth)',
    icon: '🌍',
    gradient: ['#065F46', '#064E3B'],
    duration: '2–3 Hours',
    price: 3100,
    originalPrice: 5500,
    planet: 'Saturn',
    category: 'vastu',
    description: 'Bhoomi Puja is the sacred worship of Mother Earth (Bhoomi Devi) performed before the first brick is laid. It seeks divine permission from the earth and ensures a blessed, dosha-free construction from the very foundation.',
    benefits: ['Seeks divine permission from Mother Earth', 'Removes underground Vastu doshas', 'Ensures smooth construction without accidents', 'Blesses the land for health and prosperity of future occupants'],
    occasion: 'Before construction begins on any plot, house, or commercial building',
    includes: ['Bhoomi Devi Puja', 'Vastu Purusha Sthapana', 'Panch Tattva worship', 'Sankalp in your name', 'WhatsApp video proof'],
    variants: null,
  },
  {
    id: 'vastu-dosh-nivaran',
    name: 'Vastu Dosh Nivaran Puja',
    subtitle: 'Targeted Dosha Removal',
    deity: 'Vastu Purusha',
    icon: '⚡',
    gradient: ['#DC2626', '#991B1B'],
    duration: '2–3 Hours',
    price: 3100,
    originalPrice: 5500,
    planet: 'All Planets',
    category: 'vastu',
    description: 'Targeted Vastu Dosh Nivaran Puja for correcting specific Vastu defects — such as toilet in northeast, south-facing entrance, or kitchen in wrong direction — without any physical construction changes.',
    benefits: ['Corrects specific Vastu defects energetically', 'No demolition or construction required', 'Removes effects of toilet in NE, S entrance, etc.', 'Brings immediate relief from Vastu-related problems'],
    occasion: 'Specific Vastu dosha identified by expert, persistent problems in one area of life',
    includes: ['Vastu Dosh diagnosis mantras', 'Targeted remedy puja', 'Vastu Yantra energisation', 'Sankalp in your name', 'WhatsApp video proof'],
    variants: null,
  },
  {
    id: 'office-vastu-puja',
    name: 'Office / Shop Vastu Puja',
    subtitle: 'Business Vastu Harmony',
    deity: 'Lord Kubera & Vastu Devta',
    icon: '🏢',
    gradient: ['#1D4ED8', '#1E3A8A'],
    duration: '3–4 Hours',
    price: 5100,
    originalPrice: 9100,
    planet: 'Mercury',
    category: 'vastu',
    description: 'Office Vastu Puja aligns your business premises with cosmic energies to attract wealth, clients, and success. Our Pandit Ji performs Kubera Puja, Vastu Shanti, and Lakshmi worship for maximum business prosperity.',
    benefits: ['Attracts wealth, clients, and business growth', 'Removes obstacles in business and career', 'Improves employee harmony and productivity', 'Activates Kubera energy for financial abundance'],
    occasion: 'Opening a new office or shop, business facing losses, moving to new business premises',
    includes: ['Kubera Puja & Vastu Shanti', 'Lakshmi worship', 'Vastu Mandala consecration', 'Sankalp in your name', 'WhatsApp video proof'],
    variants: null,
  },
  {
    id: 'vastu-kalash-sthapana',
    name: 'Vastu Kalash Sthapana',
    subtitle: 'Home Energisation',
    deity: 'Vastu Devta & Panch Tattva',
    icon: '🪔',
    gradient: ['#D97706', '#B45309'],
    duration: '1–2 Hours',
    price: 1500,
    originalPrice: 2500,
    planet: 'Moon',
    category: 'vastu',
    description: 'Vastu Kalash Sthapana is a lighter, affordable Vastu puja to energise your home with positive cosmic vibrations. A copper Kalash is consecrated with Ganga Jal, herbs, and Vastu mantras and placed in the northeast corner.',
    benefits: ['Fills home with positive cosmic energy', 'Ideal affordable option for general Vastu correction', 'Activates the sacred northeast (Ishaan) corner', 'Quick and powerful — results felt immediately'],
    occasion: 'General Vastu improvement, new month / Navratri / Purnima, small home corrections',
    includes: ['Copper Kalash consecration', 'Vastu Mantra chanting', 'Panch Tattva puja', 'Sankalp in your name', 'WhatsApp video proof'],
    variants: null,
  },
  {
    id: 'plot-bhoomi-shanti',
    name: 'Plot / Zameen Puja',
    subtitle: 'Agricultural & Empty Land',
    deity: 'Bhoomi Devi & Vayu Devta',
    icon: '🌾',
    gradient: ['#166534', '#14532D'],
    duration: '2–3 Hours',
    price: 2100,
    originalPrice: 3500,
    planet: 'Saturn',
    category: 'vastu',
    description: 'Plot Puja (Zameen Puja or Bhoomi Shanti) is performed for agricultural land, empty plots, or inherited land to remove any negative energies, ancestral doshas, or underground Vastu defects — blessing the land for prosperity.',
    benefits: ['Removes ancestral or inherited land doshas', 'Clears negative history of the land', 'Blesses agricultural land for good harvest', 'Ideal before selling or building on inherited land'],
    occasion: 'Inherited land, agricultural land blessing, empty plot before sale or construction',
    includes: ['Bhoomi Shanti puja', 'Ancestral dosha removal mantras', 'Land energisation rituals', 'Sankalp in your name', 'WhatsApp video proof'],
    variants: null,
  },
];

const crypto  = require('crypto');
const Razorpay = require('razorpay');

// ── Bookings (in-memory for now) ──────────────────────────────────────────
const bookings = [];
let bookingCounter = 1000;

function getRazorpay() {
  const key_id     = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret || key_id === 'your_razorpay_key') {
    throw new Error('Razorpay credentials not configured');
  }
  return new Razorpay({ key_id, key_secret });
}

function resolvePrice(paath, variant) {
  if (paath.variants && variant) {
    const v = paath.variants.find(v => v.label === variant);
    if (v) return v.price;
  }
  return paath.price;
}

function getPaaths(req, res) {
  const { category } = req.query;
  const paaths = category
    ? PAATHS.filter(p => p.category === category)
    : PAATHS.filter(p => !p.category); // default: return only generic paaths
  res.json({ paaths });
}

// Step 1 — create a Razorpay order (called when user submits the booking form)
async function createOrder(req, res) {
  try {
    const { paathId, name, mobile, date, variant } = req.body;
    if (!paathId || !name || !mobile || !date) {
      return res.status(400).json({ error: 'paathId, name, mobile, and date are required' });
    }
    const paath = PAATHS.find(p => p.id === paathId);
    if (!paath) return res.status(404).json({ error: 'Paath not found' });

    const price = resolvePrice(paath, variant);
    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount:   price * 100,
      currency: 'INR',
      receipt:  `pooja_${Date.now()}`,
      notes:    { paathId, name, mobile },
    });

    res.json({
      order_id: order.id,
      amount:   order.amount,
      currency: order.currency,
      key:      process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    if (err.message === 'Razorpay credentials not configured') {
      return res.status(503).json({ error: 'Payment gateway not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env' });
    }
    console.error('createOrder error:', err);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
}

// Step 2 — verify Razorpay payment and confirm the booking
function verifyAndBook(req, res) {
  try {
    const {
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
      paathId, name, mobile, date, timeSlot, gotra, intention, variant,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Payment details missing' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret || secret === 'your_razorpay_secret') {
      return res.status(503).json({ error: 'Payment gateway not configured' });
    }

    // Verify HMAC signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = hmac.digest('hex');
    if (digest !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed — invalid signature' });
    }

    const paath = PAATHS.find(p => p.id === paathId);
    if (!paath) return res.status(404).json({ error: 'Paath not found' });

    const price = resolvePrice(paath, variant);
    const refId = `AVP${++bookingCounter}`;

    const booking = {
      refId, paathId, paathName: paath.name, variant: variant || null,
      name, mobile, date, timeSlot: timeSlot || 'Morning (5:30 – 8:00 AM)',
      gotra: gotra || '', intention: intention || '',
      price, status: 'Confirmed',
      razorpay_order_id, razorpay_payment_id,
      createdAt: new Date().toISOString(),
    };
    bookings.push(booking);

    console.log(`[PoojaBooking] Payment confirmed — ${refId} | ${paath.name} | ${name} (${mobile}) | ₹${price}`);

    res.json({ success: true, refId, booking });
  } catch (err) {
    console.error('verifyAndBook error:', err);
    res.status(500).json({ error: 'Booking failed after payment' });
  }
}

module.exports = { getPaaths, createOrder, verifyAndBook };
