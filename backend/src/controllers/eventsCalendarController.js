// Static Hindu festivals + planetary events for 2025-2026
const ALL_EVENTS = [
  // ── January 2025 ──
  { date:'2025-01-13', title:'Paush Purnima',          type:'purnima',          desc:'Holy full moon — bathing in sacred rivers is highly auspicious.' },
  { date:'2025-01-14', title:'Makar Sankranti',         type:'festival',         desc:'Sun enters Capricorn. Harvest festival celebrated across India with kite-flying, til-gur, and holy dips.' },
  { date:'2025-01-14', title:'Uttarayana Begins',       type:'transit',          planet:'Sun', desc:'Sun begins its northward journey; considered highly auspicious for all spiritual activities.' },
  { date:'2025-01-26', title:'Republic Day',            type:'festival',         desc:'National holiday marking India\'s Constitution coming into force in 1950.' },
  { date:'2025-01-29', title:'Mauni Amavasya',          type:'amavasya',         desc:'Observe silence (maun) and offer tarpan to ancestors. Extremely auspicious for ancestral rites.' },

  // ── February 2025 ──
  { date:'2025-02-02', title:'Vasant Panchami',         type:'festival',         desc:'Saraswati Puja — worship of the goddess of learning, arts, and wisdom. Spring begins.' },
  { date:'2025-02-12', title:'Magh Purnima',            type:'purnima',          desc:'Auspicious full moon — bathing at Triveni Sangam is highly meritorious.' },
  { date:'2025-02-24', title:'Mars Direct',             type:'retrograde-end',   planet:'Mars',    desc:'Mars resumes direct motion — energy, initiative, and drive return to normal flow.' },
  { date:'2025-02-26', title:'Maha Shivratri',          type:'festival',         desc:'Great night of Lord Shiva — all-night vigil, fasting, and Shiva puja. One of the holiest nights of the year.' },
  { date:'2025-02-28', title:'Phalguna Amavasya',       type:'amavasya',         desc:'New moon of Phalguna month — ancestral rites, charity, and fasting recommended.' },

  // ── March 2025 ──
  { date:'2025-03-12', title:'Jupiter Direct',          type:'retrograde-end',   planet:'Jupiter', desc:'Jupiter resumes direct motion in Gemini — expansion, wisdom, and good fortune resume.' },
  { date:'2025-03-13', title:'Holika Dahan',            type:'festival',         desc:'Bonfire ritual on the eve of Holi — burning of demoness Holika symbolises triumph of devotion over evil.' },
  { date:'2025-03-14', title:'Holi',                    type:'festival',         desc:'Festival of Colors on Phalguna Purnima — celebrate spring, love, and the victory of good over evil.' },
  { date:'2025-03-14', title:'Phalguna Purnima',        type:'purnima',          desc:'Full moon of Phalguna — Holi is celebrated on this night.' },
  { date:'2025-03-14', title:'Total Lunar Eclipse',     type:'eclipse',          desc:'Total Lunar Eclipse — Chandra Grahan on Purnima. Avoid eating during eclipse; perform puja afterward.' },
  { date:'2025-03-15', title:'Mercury Retrograde',      type:'retrograde-start', planet:'Mercury', desc:'Mercury turns retrograde in Pisces — avoid signing contracts, travel disruptions possible, back up data.' },
  { date:'2025-03-29', title:'Chaitra Amavasya',        type:'amavasya',         desc:'New moon of Chaitra. Start of New Year preparations.' },
  { date:'2025-03-29', title:'Partial Solar Eclipse',   type:'eclipse',          desc:'Partial Solar Eclipse — Surya Grahan on Chaitra Amavasya. Visible in parts of Europe and North Africa.' },
  { date:'2025-03-30', title:'Gudi Padwa / Ugadi',      type:'festival',         desc:'Hindu New Year for Maharashtra, Karnataka, Andhra Pradesh. Chaitra Shukla Pratipada.' },
  { date:'2025-03-30', title:'Chaitra Navratri Begins', type:'festival',         desc:'Nine sacred nights of Goddess Durga in the spring season. Fasting and Devi puja recommended.' },

  // ── April 2025 ──
  { date:'2025-04-06', title:'Ram Navami',              type:'festival',         desc:'Birth anniversary of Lord Ram — Chaitra Shukla Navami. Recite Ramayana and fast on this day.' },
  { date:'2025-04-07', title:'Mercury Direct',          type:'retrograde-end',   planet:'Mercury', desc:'Mercury stations direct — communication, travel, and tech projects can safely resume.' },
  { date:'2025-04-10', title:'Mahavir Jayanti',         type:'festival',         desc:'Birth anniversary of Bhagwan Mahavira, 24th Tirthankara of Jainism.' },
  { date:'2025-04-12', title:'Hanuman Jayanti',         type:'festival',         desc:'Birth anniversary of Lord Hanuman on Chaitra Purnima. Visit temples and recite Hanuman Chalisa.' },
  { date:'2025-04-12', title:'Chaitra Purnima',         type:'purnima',          desc:'Full moon of Chaitra — Hanuman Jayanti is observed on this day.' },
  { date:'2025-04-14', title:'Baisakhi',                type:'festival',         desc:'Harvest festival and Sikh New Year — marking the founding of the Khalsa in 1699.' },
  { date:'2025-04-18', title:'Good Friday',             type:'festival',         desc:'Solemn Christian observance commemorating the crucifixion of Jesus.' },
  { date:'2025-04-27', title:'Vaishakha Amavasya',      type:'amavasya',         desc:'New moon of Vaishakha — auspicious for ancestral rites and charity.' },

  // ── May 2025 ──
  { date:'2025-05-12', title:'Buddha Purnima',          type:'festival',         desc:'Vesak — birth, enlightenment, and passing of Gautama Buddha on Vaishakha Purnima.' },
  { date:'2025-05-12', title:'Vaishakha Purnima',       type:'purnima',          desc:'Sacred full moon — Buddha Purnima observed on this day.' },
  { date:'2025-05-26', title:'Jyeshtha Amavasya',       type:'amavasya',         desc:'New moon of Jyeshtha — Shani Jayanti often falls near this date.' },

  // ── June 2025 ──
  { date:'2025-06-11', title:'Jyeshtha Purnima',        type:'purnima',          desc:'Full moon of Jyeshtha — Vat Purnima observed by married women in Maharashtra.' },
  { date:'2025-06-25', title:'Ashadha Amavasya',        type:'amavasya',         desc:'New moon of Ashadha month.' },
  { date:'2025-06-27', title:'Rath Yatra',              type:'festival',         desc:'Grand chariot festival of Lord Jagannath at Puri, Odisha — attended by millions.' },

  // ── July 2025 ──
  { date:'2025-07-10', title:'Guru Purnima',            type:'festival',         desc:'Full moon of Ashadha — day to honour and worship one\'s spiritual teacher (Guru).' },
  { date:'2025-07-10', title:'Ashadha Purnima',         type:'purnima',          desc:'Guru Purnima — Vyasa Puja and veneration of all Gurus.' },
  { date:'2025-07-13', title:'Saturn Retrograde',       type:'retrograde-start', planet:'Saturn',  desc:'Saturn turns retrograde in Aquarius — time to review discipline, karma, and long-term plans. Lasts until Nov 28.' },
  { date:'2025-07-18', title:'Mercury Retrograde',      type:'retrograde-start', planet:'Mercury', desc:'Mercury turns retrograde in Leo — communication disruptions, travel delays. Lasts until Aug 11.' },
  { date:'2025-07-24', title:'Shravana Amavasya',       type:'amavasya',         desc:'New moon of Shravana — Hariyali Amavasya. Plant trees, offer tarpan to ancestors.' },

  // ── August 2025 ──
  { date:'2025-08-09', title:'Raksha Bandhan',          type:'festival',         desc:'Sacred bond of protection between brothers and sisters on Shravana Purnima.' },
  { date:'2025-08-09', title:'Shravana Purnima',        type:'purnima',          desc:'Full moon of Shravana — Raksha Bandhan and sacred thread renewal for Brahmins.' },
  { date:'2025-08-11', title:'Mercury Direct',          type:'retrograde-end',   planet:'Mercury', desc:'Mercury stations direct in Cancer — safe to resume travel and communication projects.' },
  { date:'2025-08-16', title:'Janmashtami',             type:'festival',         desc:'Birth anniversary of Lord Krishna — celebrated at midnight with fasting, bhajan, and Dahi Handi.' },
  { date:'2025-08-23', title:'Bhadra Amavasya',         type:'amavasya',         desc:'New moon of Bhadra — Pithori Amavasya, auspicious for mothers\' worship.' },
  { date:'2025-08-27', title:'Ganesh Chaturthi',        type:'festival',         desc:'10-day festival celebrating the birth of Lord Ganesha — clay idols installed, immersed on Anant Chaturdashi.' },

  // ── September 2025 ──
  { date:'2025-09-07', title:'Bhadra Purnima',          type:'purnima',          desc:'Full moon of Bhadra — Pitru Paksha (fortnight of ancestors) begins from next day.' },
  { date:'2025-09-07', title:'Total Lunar Eclipse',     type:'eclipse',          desc:'Total Lunar Eclipse visible across Asia, Europe, and Africa — Chandra Grahan. Observe eclipse rituals.' },
  { date:'2025-09-21', title:'Mahalaya / Sarva Pitru Amavasya', type:'festival', desc:'Last day of Pitru Paksha — tarpan for all ancestors. Devi Paksha begins. Goddess Durga descends.' },
  { date:'2025-09-21', title:'Ashwin Amavasya',         type:'amavasya',         desc:'Mahalaya — most important day for ancestral rites.' },
  { date:'2025-09-21', title:'Annular Solar Eclipse',   type:'eclipse',          desc:'Annular Solar Eclipse — Surya Grahan on Ashwin Amavasya. Visible in parts of South America, Antarctica.' },
  { date:'2025-09-22', title:'Shardiya Navratri Begins',type:'festival',         desc:'Nine sacred nights of Goddess Durga in the autumn season. Fasting and recitation of Durga Saptashati.' },

  // ── October 2025 ──
  { date:'2025-10-02', title:'Gandhi Jayanti',          type:'festival',         desc:'National holiday — birth anniversary of Mahatma Gandhi, father of the nation.' },
  { date:'2025-10-07', title:'Sharad Purnima',          type:'festival',         desc:'Kojagari Purnima — Moon is closest to Earth. Goddess Lakshmi walks the Earth. Keep milk/kheer under moonlight.' },
  { date:'2025-10-07', title:'Ashwin Purnima',          type:'purnima',          desc:'Sharad Purnima — most luminous full moon of the year.' },
  { date:'2025-10-11', title:'Dussehra (Vijayadashami)',type:'festival',         desc:'Victory of Lord Rama over Ravana and Goddess Durga over Mahishasura. Burning of Ravana effigy.' },
  { date:'2025-10-20', title:'Dhanteras',               type:'festival',         desc:'Kartik Krishna Trayodashi — worship of Lord Dhanvantari and Goddess Lakshmi. Auspicious to buy gold, silver, or utensils.' },
  { date:'2025-10-21', title:'Naraka Chaturdashi',      type:'festival',         desc:'Choti Diwali — Lord Krishna killed the demon Narakasura. Abhyang (oil bath) before sunrise is auspicious.' },
  { date:'2025-10-21', title:'Kartik Amavasya',         type:'amavasya',         desc:'Diwali night — most auspicious Amavasya of the year for Lakshmi puja.' },
  { date:'2025-10-21', title:'Diwali',                  type:'festival',         desc:'Festival of Lights — Lakshmi-Ganesh puja at auspicious time (Pradosh Kaal). Most celebrated festival of India.' },
  { date:'2025-10-22', title:'Govardhan Puja',          type:'festival',         desc:'Annakut festival — worship of Govardhan hill. 56-dish bhog (chhappan bhog) offered to Lord Krishna.' },
  { date:'2025-10-23', title:'Bhai Dooj',               type:'festival',         desc:'Yama Dwitiya — sisters pray for brothers\' long life; brothers give gifts. Similar to Raksha Bandhan.' },
  { date:'2025-10-28', title:'Chhath Puja',             type:'festival',         desc:'Ancient Vedic festival dedicated to Surya Dev and Chhathi Maiya — sunrise/sunset arghya from water bodies.' },

  // ── November 2025 ──
  { date:'2025-11-05', title:'Kartik Purnima',          type:'purnima',          desc:'Dev Deepawali — gods celebrate Diwali; Varanasi ghats lit with thousands of lamps. Pushkar Fair.' },
  { date:'2025-11-05', title:'Dev Deepawali',           type:'festival',         desc:'Kartik Purnima — celestial Diwali. Bath in Ganga especially meritorious. Tulsi Vivah celebrated.' },
  { date:'2025-11-09', title:'Mercury Retrograde',      type:'retrograde-start', planet:'Mercury', desc:'Mercury turns retrograde in Scorpio — introspection, delays in communication and travel.' },
  { date:'2025-11-20', title:'Margashirsha Amavasya',   type:'amavasya',         desc:'New moon of Margashirsha — auspicious for ancestral rites.' },
  { date:'2025-11-28', title:'Saturn Direct',           type:'retrograde-end',   planet:'Saturn',  desc:'Saturn stations direct in Aquarius — karmic lessons crystallise; commitments and discipline rewarded.' },
  { date:'2025-11-29', title:'Mercury Direct',          type:'retrograde-end',   planet:'Mercury', desc:'Mercury stations direct in Scorpio — communication clears, plans can move forward.' },

  // ── December 2025 ──
  { date:'2025-12-04', title:'Margashirsha Purnima',    type:'purnima',          desc:'Full moon of Margashirsha — auspicious for Dattatreya worship.' },
  { date:'2025-12-20', title:'Pausha Amavasya',         type:'amavasya',         desc:'New moon of Pausha — soma rites and ancestral offerings.' },
  { date:'2025-12-25', title:'Christmas',               type:'festival',         desc:'Birth of Jesus Christ — widely celebrated across India.' },

  // ── January 2026 ──
  { date:'2026-01-03', title:'Paush Purnima',           type:'purnima',          desc:'Full moon of Pausha — Magh Mela bathing begins.' },
  { date:'2026-01-14', title:'Makar Sankranti',         type:'festival',         desc:'Sun enters Capricorn — harvest festival, kite-flying, sesame sweets.' },
  { date:'2026-01-19', title:'Magha Amavasya',          type:'amavasya',         desc:'New moon of Magha — Mauni Amavasya; silence and tarpan for ancestors.' },
  { date:'2026-01-30', title:'Vasant Panchami',         type:'festival',         desc:'Saraswati Puja — yellow attire, start new learning, seek Saraswati\'s blessings.' },

  // ── February 2026 ──
  { date:'2026-02-01', title:'Magh Purnima',            type:'purnima',          desc:'Full moon of Magha — bathing in Triveni Sangam is highly meritorious.' },
  { date:'2026-02-17', title:'Maha Shivratri',          type:'festival',         desc:'Great night of Lord Shiva — fast, do Shiva abhishek, stay awake reciting Om Namah Shivaya.' },
  { date:'2026-02-17', title:'Phalguna Amavasya',       type:'amavasya',         desc:'Maha Shivratri falls near this Amavasya — extremely sacred.' },

  // ── March 2026 ──
  { date:'2026-03-03', title:'Holika Dahan',            type:'festival',         desc:'Bonfire on Phalguna Purnima eve — light bonfires and pray for protection from evil.' },
  { date:'2026-03-04', title:'Holi',                    type:'festival',         desc:'Festival of Colors — Phalguna Purnima. Play with natural colors, forgive and celebrate.' },
  { date:'2026-03-04', title:'Phalguna Purnima',        type:'purnima',          desc:'Full moon of Phalguna — Holi celebrated.' },
  { date:'2026-03-18', title:'Gudi Padwa / Ugadi',      type:'festival',         desc:'Hindu New Year (Vikram Samvat 2083 begins).' },
  { date:'2026-03-18', title:'Chaitra Amavasya',        type:'amavasya',         desc:'New moon of Chaitra.' },
  { date:'2026-03-19', title:'Chaitra Navratri Begins', type:'festival',         desc:'Spring Navratri — nine nights of Devi worship begins.' },

  // ── April 2026 ──
  { date:'2026-04-02', title:'Chaitra Purnima',         type:'purnima',          desc:'Full moon of Chaitra — Hanuman Jayanti.' },
  { date:'2026-04-02', title:'Hanuman Jayanti',         type:'festival',         desc:'Birth anniversary of Lord Hanuman — recite Hanuman Chalisa 108 times.' },
  { date:'2026-04-16', title:'Vaishakha Amavasya',      type:'amavasya',         desc:'New moon of Vaishakha.' },

  // ── May 2026 ──
  { date:'2026-05-01', title:'Buddha Purnima',          type:'festival',         desc:'Vesak — birth, enlightenment and passing of Gautama Buddha.' },
  { date:'2026-05-01', title:'Vaishakha Purnima',       type:'purnima',          desc:'Vaishakha Purnima — Buddha Purnima.' },
  { date:'2026-05-15', title:'Jyeshtha Amavasya',       type:'amavasya',         desc:'New moon of Jyeshtha.' },
  { date:'2026-05-29', title:'Jyeshtha Purnima',        type:'purnima',          desc:'Full moon of Jyeshtha — Vat Savitri Purnima (Maharashtra).' },
];

const TYPE_ORDER = ['eclipse','retrograde-start','retrograde-end','transit','festival','purnima','amavasya'];

exports.getCalendar = (req, res) => {
  try {
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
    const year  = parseInt(req.query.year)  || new Date().getFullYear();
    const prefix = `${year}-${String(month).padStart(2, '0')}`;

    const events = ALL_EVENTS
      .filter(e => e.date.startsWith(prefix))
      .sort((a, b) => {
        const dateDiff = a.date.localeCompare(b.date);
        if (dateDiff !== 0) return dateDiff;
        return TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type);
      });

    const grouped = {};
    events.forEach(e => {
      if (!grouped[e.date]) grouped[e.date] = [];
      grouped[e.date].push(e);
    });

    // Next 3 upcoming events across all months (for sidebar teaser)
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = ALL_EVENTS
      .filter(e => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);

    res.json({ month, year, events, grouped, upcoming });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
