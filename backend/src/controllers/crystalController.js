const CRYSTALS = [
  // ── Navagraha Gemstones ──
  {
    slug:'ruby', name:'Ruby', hindiName:'Manik', type:'navagraha',
    planet:'Sun', signs:['Leo'], element:'Fire', chakra:'Solar Plexus',
    color:'#e11d48', colorName:'Deep Red', icon:'🔴', hardness:'9 Mohs',
    priceRange:'₹3,000 – ₹80,000 per ratti', uparatna:'Red Garnet, Red Spinel',
    shortDesc:'Gemstone of the Sun — bestows authority, confidence, and vitality.',
    benefits:['Strengthens Sun\'s influence — ideal for Leo Lagna and weak natal Sun','Boosts self-confidence, leadership, and decision-making ability','Improves eye health, heart, and bone strength','Brings recognition, government favour, and career advancement','Enhances father-son relationships and paternal blessings'],
    howToWear:'Set in gold. Wear on the ring finger of the right hand on a Sunday morning during Shukla Paksha (waxing moon). Perform the Sun mantra 108 times before wearing.',
    dayToActivate:'Sunday',
    mantra:'Om Hraam Hreem Hraum Sah Suryaya Namah (108 times)',
    cautions:['Never wear Ruby with Blue Sapphire — Sun and Saturn are enemies','Avoid if Saturn is a beneficial planet for your Lagna','Must be worn after full astrological consultation'],
    mallProductId: null,
  },
  {
    slug:'pearl', name:'Pearl', hindiName:'Moti', type:'navagraha',
    planet:'Moon', signs:['Cancer'], element:'Water', chakra:'Crown',
    color:'#f1f5f9', colorName:'Lustrous White', icon:'⚪', hardness:'2.5–4.5 Mohs',
    priceRange:'₹500 – ₹20,000 per ratti', uparatna:'Moonstone, White Coral',
    shortDesc:'Gemstone of the Moon — calms the mind, enhances intuition, and stabilises emotions.',
    benefits:['Strengthens Moon — ideal for Cancer Lagna and weak natal Moon','Calms anxiety, mood swings, and emotional turbulence','Enhances memory, concentration, and intuitive abilities','Improves relationship with mother and maternal bonds','Bestows good sleep, mental peace, and inner harmony'],
    howToWear:'Set in silver. Wear on the little finger of the right hand on a Monday morning during Shukla Paksha. The pearl should be natural, not cultured.',
    dayToActivate:'Monday',
    mantra:'Om Shram Shreem Shraum Sah Chandraya Namah (108 times)',
    cautions:['Avoid if the Moon is placed in the 6th, 8th, or 12th house without benefic aspects','Natural saltwater pearl only — cultured pearls have lesser potency','Those with Saturn as Lagna lord should consult before wearing'],
    mallProductId: null,
  },
  {
    slug:'red-coral', name:'Red Coral', hindiName:'Moonga', type:'navagraha',
    planet:'Mars', signs:['Aries','Scorpio'], element:'Fire', chakra:'Root',
    color:'#dc2626', colorName:'Vermillion Red', icon:'🪸', hardness:'3–4 Mohs',
    priceRange:'₹400 – ₹8,000 per ratti', uparatna:'Red Jasper, Carnelian',
    shortDesc:'Gemstone of Mars — builds courage, physical energy, and competitive edge.',
    benefits:['Strengthens Mars — overcomes timidity, blood disorders, and lack of drive','Boosts physical strength, immunity, and stamina','Excellent for those in sports, military, surgery, and business','Protects against black magic, evil eye, and external negative forces','Helps resolve Mangal Dosha when properly prescribed'],
    howToWear:'Set in gold or copper. Wear on the ring finger of the right hand on a Tuesday morning. The coral should be Italian Mediterranean or Japanese — deep red, no blemishes.',
    dayToActivate:'Tuesday',
    mantra:'Om Kraam Kreem Kraum Sah Bhaumaya Namah (108 times)',
    cautions:['Should not be worn if Mars rules the 6th, 8th, or 12th from Lagna without being a yogakaraka','Those with Taurus or Libra Lagna should be cautious — Mars is malefic','Do not wear with Emerald — Mars and Mercury are enemies'],
    mallProductId:'red-coral-6r',
  },
  {
    slug:'emerald', name:'Emerald', hindiName:'Panna', type:'navagraha',
    planet:'Mercury', signs:['Gemini','Virgo'], element:'Earth', chakra:'Heart',
    color:'#16a34a', colorName:'Vivid Green', icon:'💚', hardness:'7.5–8 Mohs',
    priceRange:'₹2,000 – ₹50,000 per ratti', uparatna:'Green Tourmaline, Peridot',
    shortDesc:'Gemstone of Mercury — sharpens intellect, communication, and business acumen.',
    benefits:['Strengthens Mercury — ideal for Gemini & Virgo Lagna or weak natal Mercury','Dramatically improves analytical thinking, writing, and communication','Excellent for students, writers, teachers, lawyers, and traders','Calms nervous system disorders and speech impediments','Enhances adaptability and quick decision-making'],
    howToWear:'Set in gold or panchdhatu. Wear on the little finger of the right hand on a Wednesday morning. Colombian or Zambian emeralds are preferred.',
    dayToActivate:'Wednesday',
    mantra:'Om Braam Breem Braum Sah Budhaya Namah (108 times)',
    cautions:['Do not wear with Red Coral — Mars and Mercury are enemies','Pregnant women should avoid — Mercury governs nervous system and may be overstimulating','Cracked or included stones of poor quality can give negative results'],
    mallProductId:'emerald-4r',
  },
  {
    slug:'yellow-sapphire', name:'Yellow Sapphire', hindiName:'Pukhraj', type:'navagraha',
    planet:'Jupiter', signs:['Sagittarius','Pisces'], element:'Space/Ether', chakra:'Throat',
    color:'#eab308', colorName:'Golden Yellow', icon:'💛', hardness:'9 Mohs',
    priceRange:'₹3,000 – ₹60,000 per ratti', uparatna:'Yellow Topaz, Citrine',
    shortDesc:'Gemstone of Jupiter — the most auspicious gem for prosperity, wisdom, and marriage.',
    benefits:['Strengthens Jupiter — excellent for Sagittarius & Pisces Lagna','Attracts wealth, financial stability, and unexpected fortune','Blesses marriage, especially recommended for women seeking a good spouse','Bestows wisdom, academic success, and guru\'s blessings','Protects from liver problems, obesity, and lack of direction'],
    howToWear:'Set in gold. Wear on the index finger of the right hand on a Thursday morning during Shukla Paksha. Ceylon (Sri Lanka) Yellow Sapphire is the finest quality.',
    dayToActivate:'Thursday',
    mantra:'Om Graam Greem Graum Sah Gurave Namah (108 times)',
    cautions:['One of the safest gems to wear — Jupiter is a natural benefic','Those with Mercury or Venus Lagna should still consult — Jupiter may not always be auspicious','Yellow Topaz is a safe substitute if cost is a concern'],
    mallProductId:'yellow-sapphire-5r',
  },
  {
    slug:'diamond', name:'Diamond / White Sapphire', hindiName:'Heera / Safed Pukhraj', type:'navagraha',
    planet:'Venus', signs:['Taurus','Libra'], element:'Water', chakra:'Sacral',
    color:'#e2e8f0', colorName:'Brilliant White', icon:'💎', hardness:'10 Mohs',
    priceRange:'₹5,000 – ₹2,00,000+ per ratti', uparatna:'White Sapphire, White Topaz, Opal',
    shortDesc:'Gemstone of Venus — attracts love, beauty, luxury, and creative inspiration.',
    benefits:['Strengthens Venus — ideal for Taurus & Libra Lagna','Enhances artistic talent, aesthetic sense, and creative expression','Attracts romantic love, marital harmony, and deep relationships','Brings luxury, fine things, and social recognition','Beneficial for those in arts, entertainment, fashion, and luxury sectors'],
    howToWear:'Set in platinum, white gold, or silver. Wear on the middle finger on a Friday morning. A flawless white diamond or Ceylon White Sapphire is preferred.',
    dayToActivate:'Friday',
    mantra:'Om Draam Dreem Draum Sah Shukraya Namah (108 times)',
    cautions:['Diamond should not be worn with Ruby or Red Coral — Sun/Mars are enemies of Venus','A flawed or cracked diamond can bring misfortune — gem quality is critical','White Sapphire is strongly recommended as a safe, effective, affordable alternative'],
    mallProductId: null,
  },
  {
    slug:'blue-sapphire', name:'Blue Sapphire', hindiName:'Neelam', type:'navagraha',
    planet:'Saturn', signs:['Capricorn','Aquarius'], element:'Air', chakra:'Third Eye',
    color:'#1d4ed8', colorName:'Royal Blue', icon:'💙', hardness:'9 Mohs',
    priceRange:'₹5,000 – ₹1,50,000 per ratti', uparatna:'Amethyst, Blue Spinel, Iolite',
    shortDesc:'Fastest-acting gem in Vedic astrology — transforms life within 3 days of wearing.',
    benefits:['Strengthens Saturn — ideal for Capricorn & Aquarius Lagna or beneficial Saturn','Brings sudden positive changes in career, finances, and social status','Excellent for yogis and those pursuing long-term discipline','Protects from black magic, evil eye, and Saturn\'s malefic transits','Sharpens focus, strengthens willpower, and enables systematic achievement'],
    howToWear:'Set in panchdhatu or silver. Wear on the middle finger of the right hand on a Saturday morning. Always do a 3-day trial: hold the stone for 3 days — if you feel negative effects, discontinue.',
    dayToActivate:'Saturday',
    mantra:'Om Praam Preem Praum Sah Shanaischaraya Namah (108 times)',
    cautions:['Blue Sapphire is the most powerful AND most dangerous gemstone — must NEVER be worn without a thorough chart analysis','Test for 3 days before permanent wearing — remove immediately if nightmares, accidents, or negative events occur','Never wear with Ruby or Red Coral'],
    mallProductId:'blue-sapphire-5r',
  },
  {
    slug:'hessonite', name:'Hessonite Garnet', hindiName:'Gomed', type:'navagraha',
    planet:'Rahu', signs:[], element:'Air', chakra:'Root',
    color:'#92400e', colorName:'Honey Brown', icon:'🟫', hardness:'6.5–7.5 Mohs',
    priceRange:'₹500 – ₹15,000 per ratti', uparatna:'Zircon, Orange Garnet',
    shortDesc:'Gemstone of Rahu — cuts through confusion, amplifies ambition, and breaks stagnation.',
    benefits:['Strengthens Rahu — recommended when Rahu is well-placed or causes chronic obstacles','Removes confusion, delays, and stagnation in career or relationships','Highly beneficial for those in technology, politics, foreign affairs, or unconventional fields','Protects against sudden reversals of fortune and mysterious illnesses','Accelerates results during Rahu Mahadasha or Antardasha'],
    howToWear:'Set in panchdhatu or silver. Wear on the middle finger on a Saturday or Wednesday. Ceylon Gomed (honey-amber colour without flaws) is the preferred variety.',
    dayToActivate:'Saturday',
    mantra:'Om Raam Raam Raaum Sah Rahave Namah (108 times)',
    cautions:['Rahu is unpredictable — Gomed should only be worn after verifying Rahu\'s role in the specific chart','Can amplify obsessive tendencies if Rahu is already overactive','Should not be worn with Blue Sapphire as both are intense shadow-planet gems'],
    mallProductId: null,
  },
  {
    slug:'cats-eye', name:"Cat's Eye", hindiName:'Lehsunia', type:'navagraha',
    planet:'Ketu', signs:[], element:'Fire', chakra:'Crown',
    color:'#a16207', colorName:'Chatoyant Greenish-Brown', icon:'🟡', hardness:'8.5 Mohs',
    priceRange:'₹2,000 – ₹40,000 per ratti', uparatna:'Chrysoberyl, Tiger\'s Eye',
    shortDesc:'Gemstone of Ketu — awakens spiritual wisdom and dissolves karmic blocks.',
    benefits:['Strengthens Ketu — recommended during Ketu Mahadasha or when Ketu causes mystical disturbances','Rapidly dissolves karmic debts and ancestral patterns','Bestows sudden spiritual awakening and intuitive abilities','Protects from occult attacks, psychic disturbances, and negative entities','Excellent for healers, researchers, and those on a spiritual path'],
    howToWear:'Set in panchdhatu. Wear on the middle finger on a Tuesday evening. The chatoyancy (the moving "eye" streak) must be clearly visible — this indicates an active stone.',
    dayToActivate:'Tuesday (evening)',
    mantra:'Om Sraam Sreem Sraum Sah Ketave Namah (108 times)',
    cautions:['Like Gomed, Cat\'s Eye must only be worn after determining Ketu\'s role in your specific chart','Can cause sudden detachment from worldly life — not suitable for those needing material focus','Do not wear with Emerald or Yellow Sapphire'],
    mallProductId: null,
  },
  // ── Healing Crystals ──
  {
    slug:'amethyst', name:'Amethyst', hindiName:'Jamuniya Patthar', type:'healing',
    planet:'Saturn', signs:['Aquarius','Capricorn','Pisces'], element:'Air', chakra:'Third Eye & Crown',
    color:'#7c3aed', colorName:'Violet Purple', icon:'💜', hardness:'7 Mohs',
    priceRange:'₹100 – ₹2,000 per piece', uparatna: null,
    shortDesc:'The stone of spiritual protection and meditation — calms the mind, enhances intuition.',
    benefits:['Calms anxiety, stress, and overactive thought patterns','Deepens meditation and spiritual practice','Enhances psychic perception and intuitive wisdom','Protects against negative energy and psychic attacks','Promotes restful sleep — place under the pillow for vivid, healing dreams','Excellent substitute for Blue Sapphire for those who cannot afford or safely wear Neelam'],
    howToUse:'Place in the northeast corner of your home. Hold during meditation. Keep by your bedside. Cleanse under running water monthly and recharge in moonlight on Purnima.',
    dayToActivate:'Saturday',
    mantra:'Om Shanti Shanti Shanti',
    cautions:['Will fade in direct sunlight — keep away from windows','Some people feel emotionally raw when first working with Amethyst — start with brief sessions'],
    mallProductId: null,
  },
  {
    slug:'rose-quartz', name:'Rose Quartz', hindiName:'Gulaabi Sphatik', type:'healing',
    planet:'Venus', signs:['Taurus','Libra','Cancer'], element:'Water', chakra:'Heart',
    color:'#fb7185', colorName:'Soft Pink', icon:'🌸', hardness:'7 Mohs',
    priceRange:'₹150 – ₹3,000 per piece', uparatna: null,
    shortDesc:'The stone of unconditional love — heals the heart, attracts romance, and deepens compassion.',
    benefits:['Opens and heals the heart chakra after emotional wounds','Attracts romantic love and deepens existing relationships','Cultivates self-love, forgiveness, and compassion','Reduces anger, jealousy, and resentment','Beneficial for mothers and children — promotes nurturing energy','Excellent for those with Venus-related challenges in their charts'],
    howToUse:'Place in the southwest corner of your bedroom to attract or strengthen romantic relationships. Hold over the heart during meditation. Give as a gift to someone you love.',
    dayToActivate:'Friday',
    mantra:'Om Shukraya Namah',
    cautions:['Avoid prolonged soaking in saltwater — it can damage the surface over time','Those going through a breakup may feel intensified emotions when first using Rose Quartz'],
    mallProductId:'rose-quartz-bracelet',
  },
  {
    slug:'black-tourmaline', name:'Black Tourmaline', hindiName:'Kala Sphatik', type:'healing',
    planet:'Saturn', signs:['Capricorn','Scorpio'], element:'Earth', chakra:'Root',
    color:'#1c1917', colorName:'Jet Black', icon:'🖤', hardness:'7–7.5 Mohs',
    priceRange:'₹200 – ₹5,000 per piece', uparatna: null,
    shortDesc:'The most powerful protection stone — creates an impenetrable shield of positive energy.',
    benefits:['Absorbs and transmutes negative energy, EMF radiation, and psychic attacks','Grounds scattered energy and calms anxiety in high-stress environments','Creates a protective energy field around the home and body','Removes negative thought loops, toxic patterns, and psychic cords','Excellent for healers, empaths, and those working in negative environments','Place near electronics to neutralise electromagnetic interference'],
    howToUse:'Place at all four corners of your home or bedroom for protection grid. Carry in pocket or wear as bracelet. Cleanse weekly with running water and recharge in sunlight.',
    dayToActivate:'Saturday',
    mantra:'Om Kavacha Raksha Namah',
    cautions:['Must be cleansed regularly — Black Tourmaline absorbs negative energy and can become saturated','If you feel heavy or drained after wearing, cleanse the stone immediately','Chunks are more protective than polished tumbles — for home use, raw is better'],
    mallProductId:'black-tourmaline-bracelet',
  },
  {
    slug:'citrine', name:'Citrine', hindiName:'Sunela', type:'healing',
    planet:'Jupiter', signs:['Sagittarius','Leo','Aries'], element:'Fire', chakra:'Solar Plexus',
    color:'#f59e0b', colorName:'Golden Yellow', icon:'🌟', hardness:'7 Mohs',
    priceRange:'₹100 – ₹3,000 per piece', uparatna: null,
    shortDesc:'The merchant\'s stone — attracts abundance, positivity, and financial success.',
    benefits:['Attracts wealth, prosperity, and financial opportunities','Boosts confidence, motivation, and creative thinking','Dissipates negative energy — one of the few stones that never needs cleansing','Excellent for businesses, home offices, and cash registers (attract abundance)','Excellent substitute for Yellow Sapphire for those wanting Jupiter\'s blessings affordably','Enhances digestive health and physical vitality'],
    howToUse:'Place in the wealth corner (southeast) of your home or office. Keep in your wallet alongside currency. Wear as jewellery or carry as a tumble stone. Does not need cleansing.',
    dayToActivate:'Thursday',
    mantra:'Om Shreem Hreem Kleem Namah',
    cautions:['Most commercial "Citrine" is heat-treated Amethyst — look for natural Citrine from Brazil or Congo','Fades in direct sunlight over time — keep out of prolonged exposure'],
    mallProductId: null,
  },
  {
    slug:'clear-quartz', name:'Clear Quartz', hindiName:'Sphatik', type:'healing',
    planet:'Moon', signs:['All Signs'], element:'Space/Ether', chakra:'Crown',
    color:'#f8fafc', colorName:'Crystal Clear', icon:'🔮', hardness:'7 Mohs',
    priceRange:'₹50 – ₹5,000 per piece', uparatna: null,
    shortDesc:'The master healer — amplifies energy, enhances clarity, and aligns all chakras.',
    benefits:['Amplifies the energy of all other crystals when placed nearby','Enhances mental clarity, focus, and memory retention','Aligns and balances all seven chakras simultaneously','Excellent for meditation, mantra chanting, and prayer','Used in Sphatik Shiva Lingam — highly auspicious for home puja','Traditional Vedic item: Sphatik mala is recommended for all types of mantra japa'],
    howToUse:'Place at the centre of a crystal grid to amplify other stones. Use Sphatik mala for japa meditation. Keep on your desk or altar. Cleanse in sunlight or moonlight regularly.',
    dayToActivate:'Monday (Full Moon)',
    mantra:'Om Namah Shivaya (traditionally used with Sphatik mala)',
    cautions:['Clear Quartz amplifies ALL energy — including negative emotions. Do not use when feeling severely distressed without grounding stones nearby','Sphere shapes can act as a magnifying lens and cause fire risk near windows'],
    mallProductId:'sphatik-crystal-mala',
  },
  {
    slug:'lapis-lazuli', name:'Lapis Lazuli', hindiName:'Lajward', type:'healing',
    planet:'Jupiter', signs:['Sagittarius','Aquarius','Pisces'], element:'Air', chakra:'Third Eye & Throat',
    color:'#1e40af', colorName:'Royal Blue with Gold Flecks', icon:'🔵', hardness:'5–6 Mohs',
    priceRange:'₹200 – ₹8,000 per piece', uparatna: null,
    shortDesc:'Stone of wisdom and truth — awakens the third eye and empowers authentic expression.',
    benefits:['Activates the third eye and crown chakra for enhanced intuition','Stimulates inner wisdom, objectivity, and the search for truth','Empowers honest, clear communication and authentic self-expression','Reduces anxiety in high-pressure communication scenarios','Excellent for those in writing, teaching, law, and leadership roles','Historically used by Egyptian pharaohs and royalty for divine insight'],
    howToUse:'Wear at the throat (as pendant) to enhance communication. Place on the third eye during meditation to awaken intuition. Keep on your study desk to enhance intellectual work.',
    dayToActivate:'Thursday',
    mantra:'Om Aim Hreem Shreem',
    cautions:['Do not cleanse in water — Lapis contains pyrite which can rust','Avoid exposure to acids, perfumes, and harsh chemicals','Lower quality material with excessive white calcite has minimal healing properties'],
    mallProductId: null,
  },
  {
    slug:'green-aventurine', name:'Green Aventurine', hindiName:'Sunehra Patthar (Haara)', type:'healing',
    planet:'Mercury', signs:['Taurus','Virgo','Libra'], element:'Earth', chakra:'Heart',
    color:'#16a34a', colorName:'Forest Green with Shimmer', icon:'🍀', hardness:'6.5–7 Mohs',
    priceRange:'₹100 – ₹1,500 per piece', uparatna: null,
    shortDesc:'The stone of opportunity — attracts luck, abundance, and new beginnings.',
    benefits:['Known as the "Stone of Opportunity" — one of the luckiest crystals for manifesting prosperity','Comforts, harmonises, and protects the heart chakra','Promotes decisiveness, creativity, and a pioneering spirit','Effective for healing old emotional wounds from the heart','Excellent for students facing competitive exams or interviews','Supports physical heart health and circulatory system'],
    howToUse:'Keep in your pocket or purse when going for an important meeting, interview, or exam. Place near your front door to attract new opportunities. Carry it when starting any new venture.',
    dayToActivate:'Wednesday or Friday',
    mantra:'Om Shreem Maha Lakshmiyai Namah',
    cautions:['Best cleansed under running water and moonlight','Not recommended during times of high emotional instability — it opens the heart and can increase sensitivity'],
    mallProductId: null,
  },
  {
    slug:'tigers-eye', name:"Tiger's Eye", hindiName:'Sunelaa Patthar', type:'healing',
    planet:'Mars', signs:['Leo','Capricorn','Aries'], element:'Fire', chakra:'Solar Plexus & Root',
    color:'#78350f', colorName:'Golden Brown with Chatoyancy', icon:'🐯', hardness:'6.5–7 Mohs',
    priceRange:'₹100 – ₹3,000 per piece', uparatna: null,
    shortDesc:'Stone of courage and will — sharpens focus, builds courage, and grounds ambitious energy.',
    benefits:['Builds courage, confidence, and mental clarity under pressure','Grounds scattered energy — excellent for those prone to anxiety or indecision','Sharpens focus and helps see situations clearly without bias','Excellent substitute for Red Coral for those who want Mars energy affordably','Excellent for entrepreneurs, athletes, and anyone in competitive fields','Balances the solar plexus and root chakra simultaneously'],
    howToUse:'Carry in your dominant hand when entering challenging situations. Place on your desk during work to maintain focus. Wear as a bracelet for continuous grounding energy throughout the day.',
    dayToActivate:'Tuesday',
    mantra:'Om Mangalaya Namah',
    cautions:['Can increase aggression if worn during high-stress or conflict-prone periods','Those with already overactive Mars may not need additional stimulation — assess first','Natural Tiger\'s Eye should have clear chatoyancy (moving golden stripe) — avoid cloudy specimens'],
    mallProductId: null,
  },
];

exports.listCrystals = (req, res) => {
  try {
    const { type, planet, sign, search } = req.query;
    let results = CRYSTALS;

    if (type && type !== 'all') results = results.filter(c => c.type === type);
    if (planet) results = results.filter(c => c.planet.toLowerCase() === planet.toLowerCase());
    if (sign)   results = results.filter(c => c.signs.some(s => s.toLowerCase() === sign.toLowerCase()) || c.signs.includes('All Signs'));
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.hindiName.toLowerCase().includes(q) ||
        c.shortDesc.toLowerCase().includes(q) ||
        c.planet.toLowerCase().includes(q)
      );
    }

    const planets = [...new Set(CRYSTALS.map(c => c.planet))].sort();
    const summary = results.map(c => ({
      slug:c.slug, name:c.name, hindiName:c.hindiName, type:c.type,
      planet:c.planet, signs:c.signs, element:c.element, chakra:c.chakra,
      color:c.color, colorName:c.colorName, icon:c.icon, hardness:c.hardness,
      priceRange:c.priceRange, shortDesc:c.shortDesc, mallProductId:c.mallProductId,
    }));

    res.json({ crystals: summary, total: results.length, planets });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getCrystal = (req, res) => {
  try {
    const crystal = CRYSTALS.find(c => c.slug === req.params.slug);
    if (!crystal) return res.status(404).json({ error: 'Crystal not found' });

    const related = CRYSTALS
      .filter(c => c.slug !== crystal.slug && (c.planet === crystal.planet || c.chakra === crystal.chakra || c.element === crystal.element))
      .slice(0, 4)
      .map(c => ({ slug:c.slug, name:c.name, hindiName:c.hindiName, icon:c.icon, planet:c.planet, color:c.color, shortDesc:c.shortDesc, type:c.type }));

    res.json({ crystal, related });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
