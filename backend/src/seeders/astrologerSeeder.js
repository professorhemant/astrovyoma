const { Astrologer } = require('../models');
const bcrypt = require('bcryptjs');

const DEMO_ASTROLOGERS = [
  {
    display_name: 'Pandit Raj Sharma',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RajSharma&backgroundColor=b6e3f4',
    bio: 'With over 22 years of deep immersion in Vedic astrology, Pandit Raj Sharma has guided over 15,000 seekers through life\'s most pivotal crossroads. Trained in Varanasi\'s ancient gurukul tradition, his readings combine classical Jyotish precision with compassionate life wisdom.',
    specialties: ['Kundali Reading', 'Marriage Compatibility', 'Career Guidance', 'Gemstone Prescription'],
    languages: ['Hindi', 'English', 'Sanskrit'],
    experience_years: 22,
    price_per_min: 45,
    rating: 4.9,
    total_reviews: 8420,
    completed_orders: 15240,
    response_rate: 98,
    is_available: true,
    is_online: true,
    concern_tags: ['marriage', 'career', 'finance', 'spiritual']
  },
  {
    display_name: 'Dr. Meera Joshi',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MeeraJoshi&backgroundColor=ffdfbf',
    bio: 'Dr. Meera Joshi holds a doctorate in Jyotish Shastra from BHU Varanasi and specializes in psychological astrology. She uniquely bridges ancient Nadi astrology with modern psychology to provide profound insights into personality, relationships, and healing paths.',
    specialties: ['Nadi Astrology', 'Psychological Astrology', 'Love & Relationships', 'Remedies'],
    languages: ['Hindi', 'English', 'Marathi'],
    experience_years: 18,
    price_per_min: 75,
    rating: 4.9,
    total_reviews: 6830,
    completed_orders: 12500,
    response_rate: 97,
    is_available: true,
    is_online: true,
    concern_tags: ['love', 'marriage', 'health', 'spiritual']
  },
  {
    display_name: 'Acharya Suresh Kumar',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SureshKumar&backgroundColor=c0aede',
    bio: 'Acharya Suresh Kumar is a third-generation Vedic astrologer from Rajasthan with mastery in Prashna (horary) astrology. His uncanny ability to answer specific life questions without a birth chart has made him legendary among seekers. Specializes in lost property, legal matters, and timing of events.',
    specialties: ['Prashna Astrology', 'Muhurta', 'Legal Matters', 'Business Timing'],
    languages: ['Hindi', 'Rajasthani', 'English'],
    experience_years: 25,
    price_per_min: 120,
    rating: 4.8,
    total_reviews: 5200,
    completed_orders: 9800,
    response_rate: 95,
    is_available: true,
    is_online: false,
    concern_tags: ['career', 'finance', 'spiritual']
  },
  {
    display_name: 'Jyotishi Priya Nair',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaNair&backgroundColor=d1d4f9',
    bio: 'Jyotishi Priya Nair from Kerala is a specialist in Kerala Jyotish and Ashtamangala Prashna, an ancient divination system using cowrie shells combined with astrology. Her readings have remarkable accuracy in predicting marriage timing and compatibility, drawing thousands of clients from across India.',
    specialties: ['Kerala Jyotish', 'Marriage Timing', 'Compatibility', 'Ashtamangala'],
    languages: ['Malayalam', 'Hindi', 'English', 'Tamil'],
    experience_years: 15,
    price_per_min: 60,
    rating: 4.8,
    total_reviews: 4100,
    completed_orders: 7600,
    response_rate: 99,
    is_available: true,
    is_online: true,
    concern_tags: ['love', 'marriage', 'career']
  },
  {
    display_name: 'Pt. Dhruv Malhotra',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DhruvMalhotra&backgroundColor=ffd5dc',
    bio: 'Pt. Dhruv Malhotra is Delhi\'s most sought-after financial astrologer, combining classical Jyotish with market timing analysis. His predictions about business cycles, investment timing, and career transitions have earned him a reputation as the astrologer for entrepreneurs and executives.',
    specialties: ['Financial Astrology', 'Business Timing', 'Career Change', 'Stock Market'],
    languages: ['Hindi', 'English', 'Punjabi'],
    experience_years: 14,
    price_per_min: 90,
    rating: 4.7,
    total_reviews: 3800,
    completed_orders: 6200,
    response_rate: 96,
    is_available: true,
    is_online: false,
    concern_tags: ['career', 'finance']
  },
  {
    display_name: 'Guruji Anand Shastri',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnandShastri&backgroundColor=b6e3f4',
    bio: 'Guruji Anand Shastri is a Himalayan-trained Jyotishi with 30 years of practice, specializing in spiritual astrology and past life karma. His readings focus on soul\'s journey, karmic lessons, and spiritual awakening. He also prescribes powerful Vedic remedies including mantras, yagnas, and gemstones.',
    specialties: ['Spiritual Astrology', 'Past Life Karma', 'Vedic Remedies', 'Moksha Path'],
    languages: ['Hindi', 'Sanskrit', 'English'],
    experience_years: 30,
    price_per_min: 100,
    rating: 4.9,
    total_reviews: 7200,
    completed_orders: 11000,
    response_rate: 94,
    is_available: true,
    is_online: true,
    concern_tags: ['spiritual', 'health', 'career']
  },
  {
    display_name: 'Astro Kavitha Reddy',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KavithaReddy&backgroundColor=ffdfbf',
    bio: 'Astro Kavitha Reddy from Hyderabad is a specialist in South Indian astrology and Krishnamurti Paddhati (KP system). Her precision-oriented approach to event timing and her warm counseling style have made her one of the most reviewed astrologers on the platform.',
    specialties: ['KP Astrology', 'Job & Education', 'Foreign Travel', 'Health Predictions'],
    languages: ['Telugu', 'Hindi', 'English', 'Kannada'],
    experience_years: 12,
    price_per_min: 40,
    rating: 4.7,
    total_reviews: 5600,
    completed_orders: 8900,
    response_rate: 98,
    is_available: true,
    is_online: true,
    concern_tags: ['career', 'health', 'love']
  },
  {
    display_name: 'Vaidic Rishi Agarwal',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RishiAgarwal&backgroundColor=c0aede',
    bio: 'Vaidic Rishi Agarwal is a young but remarkably gifted astrologer who studied under senior Jyotishis in Mathura. He specializes in Nakshatra-based predictions and has developed a unique system for career guidance using the 27 Nakshatras. His modern presentation of ancient knowledge resonates powerfully with younger seekers.',
    specialties: ['Nakshatra Analysis', 'Youth Guidance', 'Career Purpose', 'Dasha Predictions'],
    languages: ['Hindi', 'English'],
    experience_years: 8,
    price_per_min: 25,
    rating: 4.6,
    total_reviews: 2800,
    completed_orders: 4500,
    response_rate: 99,
    is_available: true,
    is_online: false,
    concern_tags: ['career', 'love', 'spiritual']
  },
  {
    display_name: 'Smt. Savitri Devi',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SavitriDevi&backgroundColor=d1d4f9',
    bio: 'Smt. Savitri Devi is a revered female astrologer from Benaras with 20 years of experience in Stree Jataka (women\'s astrology). She specializes in fertility, pregnancy timing, maternal health, and guiding women through life\'s major transitions with compassion rooted in ancient feminine wisdom traditions.',
    specialties: ['Women\'s Astrology', 'Fertility & Pregnancy', 'Motherhood Timing', 'Feminine Healing'],
    languages: ['Hindi', 'Sanskrit', 'Bhojpuri'],
    experience_years: 20,
    price_per_min: 50,
    rating: 4.8,
    total_reviews: 4900,
    completed_orders: 8200,
    response_rate: 97,
    is_available: true,
    is_online: true,
    concern_tags: ['health', 'marriage', 'love']
  },
  {
    display_name: 'Acharya Vivek Tripathi',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VivekTripathi&backgroundColor=ffd5dc',
    bio: 'Acharya Vivek Tripathi is an expert in Vastu Shastra combined with astrology, offering powerful house-correction remedies that transform living and working environments. His dual expertise allows him to identify both planetary and spatial influences and provide comprehensive remedial solutions.',
    specialties: ['Vastu + Astrology', 'Property Matters', 'Home Harmony', 'Business Success'],
    languages: ['Hindi', 'English', 'Gujarati'],
    experience_years: 16,
    price_per_min: 65,
    rating: 4.6,
    total_reviews: 3200,
    completed_orders: 5800,
    response_rate: 96,
    is_available: true,
    is_online: false,
    concern_tags: ['finance', 'career', 'health']
  },
  {
    display_name: 'Jyotish Arnav Bose',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArnavBose&backgroundColor=b6e3f4',
    bio: 'Jyotish Arnav Bose from Kolkata is a scholar of Bengali Jyotish tradition and specializes in Tajika (annual horoscope) predictions. His remarkable accuracy in annual predictions and monthly timing has made him sought after by business people and professionals planning major life decisions.',
    specialties: ['Annual Predictions', 'Monthly Forecasts', 'Bengali Jyotish', 'Auspicious Timing'],
    languages: ['Bengali', 'Hindi', 'English'],
    experience_years: 10,
    price_per_min: 35,
    rating: 4.5,
    total_reviews: 2100,
    completed_orders: 3800,
    response_rate: 98,
    is_available: true,
    is_online: true,
    concern_tags: ['career', 'finance', 'marriage']
  },
  {
    display_name: 'Pt. Gopal Das Vyas',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GopalDasVyas&backgroundColor=c0aede',
    bio: 'Pt. Gopal Das Vyas is a 5th-generation astrologer from Ujjain — the spiritual center of Vedic astrology — with over 25 years of practice. He specializes in Mahadasha analysis and long-term life planning, helping clients navigate major planetary periods with wisdom, clarity, and practical Vedic remedies.',
    specialties: ['Mahadasha Analysis', 'Life Planning', 'Remedial Astrology', 'Ujjain Tradition'],
    languages: ['Hindi', 'Malwi', 'English'],
    experience_years: 25,
    price_per_min: 80,
    rating: 4.8,
    total_reviews: 6100,
    completed_orders: 10200,
    response_rate: 95,
    is_available: true,
    is_online: false,
    concern_tags: ['spiritual', 'career', 'marriage', 'finance']
  }
];

// These are fictional profiles: invented names, biographies, experience, and
// review/order counts, answered at runtime by an LLM. They are demo fixtures
// for local development, not people. Seeding them into production presents
// fabricated credentials and social proof alongside real per-minute billing, so
// this now requires an explicit opt-in.
//
// The previous guard was `count > 0`, which meant that emptying the astrologers
// table for any reason silently repopulated all eleven.
async function seedAstrologers() {
  if (process.env.SEED_DEMO_ASTROLOGERS !== 'true') return;

  const count = await Astrologer.count();
  if (count > 0) return;

  for (const data of DEMO_ASTROLOGERS) {
    await Astrologer.create(data);
  }
  console.log(`Seeded ${DEMO_ASTROLOGERS.length} demo astrologers (SEED_DEMO_ASTROLOGERS=true)`);
}

const REAL_ASTROLOGERS = [
  {
    display_name: 'Pt. Pramod Kumar Asopa',
    phone: '+919460307786',
    photo_url: '/pandits/pramod-kumar-asopa.png',
    bio: 'Pt. Pramod Kumar Asopa is a highly revered Vedic Pandit from Rajasthan with over 40 years of dedicated practice in Jyotish Shastra. At 64, his deep mastery of Sanskrit scriptures and traditional Vedic methods brings unparalleled clarity and accuracy to every consultation. He specializes in Kundali analysis, Vedic remedies, and sacred rituals, offering guidance rooted in the timeless wisdom of Sanatan Dharma.',
    specialties: ['Vedic Astrology', 'Kundali Reading', 'Vedic Remedies', 'Pooja & Rituals', 'Muhurta'],
    languages: ['Hindi', 'Sanskrit'],
    experience_years: 40,
    price_per_min: 50,
    free_minutes: 2,
    rating: 5.0,
    total_reviews: 0,
    completed_orders: 0,
    response_rate: 100,
    is_available: true,
    is_online: true,
    is_verified: true,
    concern_tags: ['spiritual', 'marriage', 'career', 'health', 'finance'],
  },
];

// Identity is the phone number, not the display name. Matching on display_name
// meant that renaming a pandit in the admin panel made the next deploy fail to
// find them and create a duplicate — and because panditLogin resolves the
// account by phone, a duplicate verified row can lock the real pandit out of
// their own portal. Phone is what they actually log in with, so it is the
// stable key. Compared on the last 10 digits, matching panditLogin's own
// normalisation, so +91 prefixes and formatting differences don't cause a
// spurious insert.
const last10 = (v) => String(v || '').replace(/\D/g, '').slice(-10);

async function seedRealAstrologers() {
  const existingAll = await Astrologer.findAll({ attributes: ['id', 'display_name', 'phone', 'pin_hash'] });

  for (const data of REAL_ASTROLOGERS) {
    const key = last10(data.phone);
    const existing = existingAll.find(a => key && last10(a.phone) === key)
      || existingAll.find(a => a.display_name === data.display_name);

    if (!existing) {
      const pin_hash = await bcrypt.hash('7786', 10);
      await Astrologer.create({ ...data, pin_hash });
      console.log(`Registered pandit: ${data.display_name}`);
    } else if (!existing.pin_hash) {
      const pin_hash = await bcrypt.hash('7786', 10);
      await existing.update({ pin_hash });
      console.log(`PIN set for: ${data.display_name}`);
    }
  }
}

// Exported so the admin cleanup can target exactly the seeded fixtures by name
// and never touch a genuine astrologer.
const DEMO_ASTROLOGER_NAMES = DEMO_ASTROLOGERS.map(a => a.display_name);

module.exports = { seedAstrologers, seedRealAstrologers, DEMO_ASTROLOGER_NAMES };
