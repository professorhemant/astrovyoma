'use strict';

// ─── RULE-BASED VEDIC ASTROLOGY INTERPRETATION ENGINE ────────────────────────
// Pure traditional Jyotisha phala — no AI, no probabilities.
// All readings encode classical Parashari + Brihat Jataka rules.

const LAGNA_READINGS = {
  Aries: {
    body:        'Athletic build, reddish or sharp complexion, prominent forehead, brisk gait.',
    personality: 'Mesha Lagna (Mars-ruled) — you are a born pioneer. Action precedes planning; courage precedes caution. You lead others not by consensus but by sheer momentum. Competitive by nature, you thrive in environments that demand initiative and lose energy in routine. Impatience is your chief shadow — tempering it produces a formidable leader.',
    strengths:   'Courage, executive ability, independence, resilience under pressure.',
    challenges:  'Impulsiveness, aggression, difficulty sustaining long-term projects.',
    dharma:      'Your dharma is to initiate — to begin what the world needs but is too afraid to start.'
  },
  Taurus: {
    body:        'Stocky or well-built frame, pleasing features, strong neck, deliberate movements.',
    personality: 'Vrishabha Lagna (Venus-ruled) — you are the builder of the zodiac. You work slowly, sustainably, and permanently. Security — financial and emotional — is your bedrock. Blessed with an aesthetic eye and sensory refinement, you create comfort wherever you go. Stubbornness is your shadow; loyalty and patience are your gifts.',
    strengths:   'Financial acumen, patience, sensory intelligence, unwavering loyalty.',
    challenges:  'Rigidity, possessiveness, over-attachment to comfort and status.',
    dharma:      'Your dharma is to establish — to turn potential into lasting, material reality.'
  },
  Gemini: {
    body:        'Slender, tall build, sharp eyes, quick and restless movements.',
    personality: 'Mithuna Lagna (Mercury-ruled) — the mind is your primary instrument. Curious, communicative, and endlessly adaptable, you see multiple angles simultaneously. Business acumen and skill with words mark you for success in trade, writing, education, or technology. The twin-sign nature gives you dual streams in life — two careers, two circles, two modes of being.',
    strengths:   'Intellect, communication, adaptability, commercial instinct.',
    challenges:  'Inconsistency, scattered energy, difficulty with depth and commitment.',
    dharma:      'Your dharma is to connect — to bridge ideas, people, and worlds through the power of language.'
  },
  Cancer: {
    body:        'Round face, pale or wheatish complexion, soft features, fluctuating weight.',
    personality: 'Karka Lagna (Moon-ruled) — you operate through feeling before logic. Home, family, and emotional continuity are sacred to you. Your intuition borders on psychic; you sense the emotional undercurrent of any room instantly. The Moon as your lord brings fluctuating circumstances but extraordinary inner knowing. Moodiness is the price of your sensitivity.',
    strengths:   'Emotional intelligence, nurturing ability, loyalty, tenacious memory.',
    challenges:  'Moodiness, excessive attachment, difficulty releasing the past.',
    dharma:      'Your dharma is to nurture — to hold others in safety while they grow.'
  },
  Leo: {
    body:        'Strong, well-proportioned frame, commanding presence, thick hair, radiating warmth.',
    personality: 'Simha Lagna (Sun-ruled) — regal by nature, you carry natural authority without trying. Generous, warm-hearted, and magnanimous, you inspire others by simply being yourself. You seek recognition — not from vanity but from a genuine need to know your light is reaching others. Pride can become hubris; your greatest gift is turning your radiance into genuine service.',
    strengths:   'Leadership, generosity, creative confidence, resilience, magnetism.',
    challenges:  'Pride, need for constant approval, difficulty accepting criticism.',
    dharma:      'Your dharma is to shine — and through your shining, to give others permission to do the same.'
  },
  Virgo: {
    body:        'Medium height, clean and precise appearance, observant eyes, thoughtful posture.',
    personality: 'Kanya Lagna (Mercury-ruled) — you are the chart\'s craftsman. Analytical, detail-oriented, and devoted to improvement, you seek precision in all things. Health, service, and systematic excellence are your natural domains. Over-analysis and self-criticism are your shadows; your penetrating intellect and devotion to right action are your highest gifts.',
    strengths:   'Analytical precision, service orientation, health awareness, problem-solving.',
    challenges:  'Over-criticism, anxiety, perfectionism that paralyzes rather than perfects.',
    dharma:      'Your dharma is to refine — to take the raw and make it precise, healing, and useful.'
  },
  Libra: {
    body:        'Symmetrical, attractive features, graceful bearing, pleasing complexion.',
    personality: 'Tula Lagna (Venus-ruled) — you are the balancer. Diplomatic, just, and partnership-oriented, you thrive when life is harmonious and wither in sustained conflict. Relationships define your world; you see yourself most clearly in the mirror of another. Indecision is your shadow — you see so many sides that choosing becomes difficult. Your gift is bringing genuine fairness to every situation.',
    strengths:   'Diplomacy, aesthetic sensibility, relationship intelligence, fairness.',
    challenges:  'Indecision, dependency on others\' approval, avoidance of necessary conflict.',
    dharma:      'Your dharma is to balance — to hold the scales steady when the world tips to extremes.'
  },
  Scorpio: {
    body:        'Penetrating eyes, magnetic presence, often stocky and dense, intense facial expressions.',
    personality: 'Vrischika Lagna (Mars-ruled, Ketu sub-ruler) — you are the transformer. Intense, penetrating, and magnetic, you possess an extraordinary capacity for regeneration. You go where others fear to look — into the depths of psychology, the occult, and the hidden motives of human beings. Jealousy and possessiveness are your shadows; your capacity for focus, healing, and resurrection are unsurpassed.',
    strengths:   'Depth of insight, willpower, research ability, power of renewal.',
    challenges:  'Jealousy, secretiveness, difficulty forgiving, emotional extremism.',
    dharma:      'Your dharma is to transform — to descend into darkness and rise with what only darkness can reveal.'
  },
  Sagittarius: {
    body:        'Tall, well-built, athletic, open and expansive facial expression, prominent thighs.',
    personality: 'Dhanu Lagna (Jupiter-ruled) — the philosopher and seeker. Optimistic, freedom-loving, and driven by the pursuit of truth, you cannot be contained by small thinking. Teaching, law, spirituality, foreign travel, and higher education are your natural domains. Overconfidence and preachiness can alienate; your gift is the wisdom to transform experience into meaning.',
    strengths:   'Philosophical depth, optimism, wisdom, love of freedom and truth.',
    challenges:  'Overconfidence, restlessness, reluctance to deal with practical minutiae.',
    dharma:      'Your dharma is to seek — and having found, to illuminate the path for others.'
  },
  Capricorn: {
    body:        'Lean, angular features, prominent bones, disciplined posture, mature bearing even in youth.',
    personality: 'Makara Lagna (Saturn-ruled) — you are built for the long game. Disciplined, pragmatic, and relentlessly ambitious, you build where others would give up. Saturn\'s exaltation sign grants remarkable endurance — your life tends to improve with age. A cool exterior conceals deep loyalty and an acute sense of responsibility. Your rewards come late; they also last the longest.',
    strengths:   'Discipline, ambition, organizational ability, long-term thinking, reliability.',
    challenges:  'Coldness, pessimism, excessive rigidity, difficulty in expressing warmth.',
    dharma:      'Your dharma is to master — to demonstrate that sustained right action builds what cannot be destroyed.'
  },
  Aquarius: {
    body:        'Well-formed body, broad shoulders, intelligent eyes, distinctive or unconventional appearance.',
    personality: 'Kumbha Lagna (Saturn-ruled) — the humanitarian and reformer. You think independently, resist conformity, and are drawn to science, technology, social reform, and serving the collective. Emotional detachment can make you seem aloof; beneath it is a genuine concern for humanity. Your vision of a better world — and your systematic pursuit of it — is your deepest contribution.',
    strengths:   'Independent thinking, humanitarian vision, intellectual originality, scientific mind.',
    challenges:  'Emotional detachment, stubbornness in opinion, alienation from intimacy.',
    dharma:      'Your dharma is to reform — to build the systems that serve all of humanity, not just the few.'
  },
  Pisces: {
    body:        'Soft features, dreamlike eyes, medium build that fluctuates, graceful or fluid movements.',
    personality: 'Meena Lagna (Jupiter-ruled) — you inhabit the boundary between the seen and unseen worlds. Compassionate, intuitive, and spiritually porous, you absorb others\' emotions as naturally as breathing. Artistic, empathic, and often psychic, you carry the culminating wisdom of all twelve signs. Boundary-setting and practicality are your lifelong work; boundless compassion is your eternal gift.',
    strengths:   'Spiritual sensitivity, compassion, artistic ability, healing gift, intuition.',
    challenges:  'Poor boundaries, escapism, vulnerability to deception and dependency.',
    dharma:      'Your dharma is to dissolve — to surrender the ego and serve as a clear channel for divine compassion.'
  }
};

const MOON_READINGS = {
  Aries:       'Your mind runs fast and hot — reactions precede reflection. Emotionally independent, you rarely ask for help and recover from setbacks with impressive speed. The Aries Moon grants entrepreneurial instinct and emotional courage, but impatience in relationships is a recurring theme to master.',
  Taurus:      'Your mind is calm, deliberate, and sensory. You process emotion through comfort — beauty, food, music, and touch ground you. Slow to anger but formidable when pushed past your threshold, you need stability to think clearly. Once an emotional bond forms, it lasts a lifetime.',
  Gemini:      'Your mind is mercurial — quick, restless, and easily understimulated. You process emotion through conversation and analysis, talking to understand what you feel. Anxiety rises when the mind goes idle. Your wit and adaptability make you the most engaging conversationalist in any gathering.',
  Cancer:      'The Moon in its own sign — profoundly nurturing, intuitive, and memory-rich. You feel everything deeply and forget nothing. Home and family are your emotional universe. Moodiness follows the lunar cycle; your gift is an extraordinary psychic sensitivity that serves as compass when logic fails.',
  Leo:         'The mind needs appreciation to feel emotionally secure. You love dramatically and expect loyalty in equal measure. Generous to those within your circle, you can be wounded by ingratitude more deeply than you show. Your emotional warmth and natural authority draw others to you effortlessly.',
  Virgo:       'The mind analyzes emotion rather than simply feeling it. You express care through service — doing, fixing, improving. Anxiety surfaces when things are imperfect or uncertain. Your emotional intelligence is precise and practical; the work is learning to feel without immediately needing to correct.',
  Libra:       'The mind seeks harmony above all. Conflict disturbs your equilibrium at a visceral level. You feel most yourself in relationship — mirroring and being mirrored. The challenge is developing your own emotional center so you don\'t depend entirely on others\' mood to determine your own.',
  Scorpio:     'The mind plunges into depths others avoid. Intensity, passion, and a near-psychic sensitivity to hidden motives define your emotional life. You rarely show what you truly feel. Loyalty is everything; betrayal, once experienced, reshapes your trust permanently. Your emotional power is immense when consciously directed.',
  Sagittarius: 'The mind is optimistic, philosophical, and freedom-hungry. You process emotion through movement — travel, intellectual exploration, or spiritual practice. Emotional commitment can feel like constraint until you meet someone who shares your quest for meaning. Your faith and resilience keep you buoyant through every storm.',
  Capricorn:   'Moon is debilitated in Capricorn — emotional expression is restrained; duty routinely overrides feeling. You show love through action and responsibility rather than words. The emotional world feels safer when organized and productive. With maturity, this placement produces exceptional emotional wisdom earned through lived experience.',
  Aquarius:    'The mind is objective, detached, and drawn to the collective rather than the personal. Emotional intimacy requires intellectual connection first. You love humanity in the abstract and may struggle with the messiness of intimate bonds. Your gift is the capacity to remain clear-headed in emotional storms that overwhelm others.',
  Pisces:      'The Moon is exalted in Pisces — profoundly compassionate, porous, and spiritually inclined. You feel everything around you; boundaries between your emotions and others\' are naturally thin. Your empathy is your greatest gift and your deepest vulnerability. Learning to protect your emotional field without closing your heart is the central work of your inner life.'
};

const SUN_READINGS = {
  Aries:       'Your Sun speaks of a pioneering soul who came here to forge new paths. Self-assertion is natural; authority is assumed rather than requested. The father\'s influence is typically strong and formative.',
  Taurus:      'Your Sun speaks of a soul who came to establish lasting value — financial, aesthetic, or familial. You build to endure. The father may embody stability and practicality.',
  Gemini:      'Your Sun speaks of a communicative soul who came to bridge ideas and people. Intellectual vitality is the core life force. The father may be intellectual, versatile, or involved in communication-related work.',
  Cancer:      'Your Sun speaks of a nurturing soul who came to create emotional safety for others. Sensitivity is your strength, not your weakness. The father\'s role in shaping your sense of security is deeply formative.',
  Leo:         'The Sun in its own sign — you came to radiate, to lead, and to inspire. Vitality is exceptional when purpose is clear. The father\'s dignity and authority shape your relationship with power throughout life.',
  Virgo:       'The Sun is in its debilitation sign — the soul came to serve through humility and precision. Ego must be refined into expertise. The father may be health-conscious, analytical, or self-critical.',
  Libra:       'Your Sun speaks of a justice-seeking soul who came to restore balance. Leadership is exercised through diplomacy rather than force. The father may represent refinement, fairness, or an idealistic worldview.',
  Scorpio:     'Your Sun speaks of a transformative soul who came to dissolve and rebuild — yourself and the structures around you. Willpower is immense. The father\'s intensity or complexity shapes your relationship with power.',
  Sagittarius: 'Your Sun speaks of a philosophical soul who came to seek and teach truth. Wisdom is your essential life resource. The father may be a teacher, traveler, or spiritually inclined person.',
  Capricorn:   'Your Sun speaks of an achieving soul who came to master the material world through discipline. Recognition comes through earned authority. The father\'s pragmatism and ambition form your foundational model of success.',
  Aquarius:    'Your Sun speaks of a reformist soul who came to serve the collective rather than the personal. Original thinking is your core gift. The father may be unconventional, distant, or associated with progressive ideas.',
  Pisces:      'Your Sun speaks of a compassionate, transcendent soul who came to dissolve boundaries and serve. The outer identity may feel fluid. The father\'s sensitivity or spiritual leanings form a central emotional theme.'
};

const NAKSHATRA_READINGS = {
  'Ashwini':           'Ashwini (Ketu) — the Physician\'s Star. You move swiftly through life with the energy of the twin Ashvin gods — healers, warriors, and initiators. Healing arts, sports, and pioneering ventures call to you. Your gift is the ability to restore what has been damaged; your shadow is the difficulty in slowing down enough to finish what you begin.',
  'Bharani':           'Bharani (Venus) — the Star of Bearing. Ruled by Yama, lord of dharma and death, you carry the creative and destructive power of Venus in its full force. Artistic magnetism, moral intensity, and an unyielding sense of responsibility define you. You create and you release — bearing the weight of both with extraordinary endurance.',
  'Krittika':          'Krittika (Sun) — the Star of Fire. Ruled by Agni, the fire deity, you cut through illusion with directness and clarity. Leadership and penetrating critical faculties mark your path. The fire that purifies also burns; learning to apply your precision constructively, rather than critically, is your central task.',
  'Rohini':            'Rohini (Moon) — the Most Beloved Star. The Moon\'s most exalted point, placed in Taurus. You are magnetic, creative, and deeply sensory. Beauty, material comfort, and artistic expression flow toward you naturally. The shadow of Rohini is attachment — to things, to people, to the past. Your gift is the power to make anything flourish.',
  'Mrigashira':        'Mrigashira (Mars) — the Searching Deer. Eternally curious, you are the seeker — moving through life in graceful, gentle pursuit of what truly satisfies. Research, travel, and intellectual exploration call to you. Restlessness is your shadow; refined intelligence and the capacity to find beauty in the search itself are your gifts.',
  'Ardra':             'Ardra (Rahu) — the Storm Star. You are the agent of transformation through dissolution. Storms appear before your greatest periods of growth. Intellectual brilliance and emotional rawness coexist in you. You understand destruction because you have been rebuilt — and you can rebuild others as a result.',
  'Punarvasu':         'Punarvasu (Jupiter) — the Returner. You are the soul who comes back — to wisdom, to goodness, to your essential nature — no matter how far you wander. Philosophical depth, spiritual seeking, and the regenerative capacity to begin again are your hallmarks. Home holds deep meaning even when you wander far from it.',
  'Pushya':            'Pushya (Saturn) — the Most Auspicious Nakshatra. The nourisher. Disciplined, devoted to dharma, and genuinely nurturing, you are here to feed — spiritually, materially, and emotionally. Teaching, healing, and charitable work are your natural domains. Saturn\'s sattvic quality here produces true and lasting wisdom.',
  'Ashlesha':          'Ashlesha (Mercury) — the Entwiner. The serpent\'s gaze. You see through people with a clarity that can feel psychic — their motives, their patterns, their hidden strengths and wounds. Healing, research, and the occult sciences are your domain. Self-mastery — channeling this penetrating perception constructively — is your deepest lifelong task.',
  'Magha':             'Magha (Ketu) — the Throne. Royal dignity, ancestral pride, and natural authority mark you. You carry the karma of your lineage — both its glory and its unresolved patterns. Leadership in tradition-honoring fields suits you. Your task is to honor the ancestors while forging a genuinely new path.',
  'Purva Phalguni':    'Purva Phalguni (Venus) — the Fruit of the Tree. Rest, pleasure, and creative expression are your birthright. Artistic gifts, romantic magnetism, and genuine capacity for joy define your best self. The challenge is avoiding the comfort that stops growth. Your gift is the rare ability to restore delight to a world exhausted by struggle.',
  'Uttara Phalguni':   'Uttara Phalguni (Sun) — the Harvest. You succeed through sustained effort and genuine service. Reliable and responsible by nature, you build long-term partnerships — marital and professional — with rare commitment. Recognition comes through what you have built over time, not through sudden brilliance.',
  'Hasta':             'Hasta (Moon) — the Hand. Skilled, dexterous, and quick-witted, you accomplish through practical intelligence what others achieve through force. Healing arts and craftsmanship mark your path. Resourcefulness is your greatest tool. The Moon\'s influence gives you an instinctive understanding of what people truly need.',
  'Chitra':            'Chitra (Mars) — the Bright Jewel. Artistry, technical excellence, and aesthetic precision are your hallmarks. You create with both analytical rigor and genuine beauty — the architect, the designer, the master craftsperson. The jewel in your chart is your ability to make the extraordinary look natural.',
  'Swati':             'Swati (Rahu) — the Independent One. You are self-willed, freedom-loving, and adaptable as wind. Commerce, entrepreneurship, and unconventional paths suit you. You bend without breaking — resilience is your defining quality. Spiritual independence and the courage to walk your own path define your soul\'s journey.',
  'Vishakha':          'Vishakha (Jupiter) — the Forked Branch. Goal-oriented, determined, and intense in pursuit of what you want, you work steadily toward your destination even when the path divides. Jupiter\'s influence brings wisdom to your ambition. The risk is sacrificing relationships to goals; the gift is the capacity to actually achieve what you set out to do.',
  'Anuradha':          'Anuradha (Saturn) — the Star of Success. Devotion, organizational mastery, and genuine loyalty define you. You honor commitment deeply and expect the same. Research, spiritual practice, and long-term partnership are your natural domains. Deep friendships — rare, chosen carefully, and lasting a lifetime — are your greatest worldly wealth.',
  'Jyeshtha':          'Jyeshtha (Mercury) — the Eldest. You carry the elder\'s authority — the one who holds the group together, who speaks the truth others avoid, who bears responsibility with grace. Social power and genuine courage mark you. The shadow is arrogance born of knowing you carry more than your share; the gift is protective leadership.',
  'Mula':              'Mula (Ketu) — the Root. You are drawn to investigate the very roots of things — philosophy, medicine, research, the occult, the origin of suffering. Ketu here brings a burning desire to understand rather than accumulate. Wealth may come and go dramatically on your path; wisdom — once earned — does not.',
  'Purva Ashadha':     'Purva Ashadha (Venus) — the Invincible. You reinvigorate whatever you touch. Venus gives you the capacity to restore energy, beauty, and hope to exhausted situations. Philosophy, teaching, and commerce suit you. Beneath your confident exterior lies an emotional depth that surprises those who assume you are purely intellectual.',
  'Uttara Ashadha':    'Uttara Ashadha (Sun) — the Latter Invincible. Victory through righteousness. Patient, principled, and unyielding in the pursuit of right action, you succeed where others have given up — not through brilliance but through sustained moral endurance. What you build lasts; what you complete stays completed.',
  'Shravana':          'Shravana (Moon) — the Listening Star. You learn through listening — through what the world speaks beneath its noise. Teaching, counseling, and preserving knowledge are your natural callings. Your wisdom is relational, oral, and experiential. Recognition comes from the quality of what you have genuinely heard and understood.',
  'Dhanishtha':        'Dhanishtha (Mars) — the Wealthiest Star. Musical, rhythmic, and materially gifted, you carry both prosperity and the restlessness that accumulates it. Real estate, music, science, and executive roles suit your energy. Mars drives you perpetually forward — learning to rest is a skill you must develop intentionally.',
  'Shatabhisha':       'Shatabhisha (Rahu) — the Hundred Healers. Research, medicine, astrology, and mysticism are your natural domains. Independent and intellectually unconventional, you arrive at insights others miss entirely. You heal through unusual methods. Solitude is both your refuge and your risk — balance it with genuine human connection.',
  'Purva Bhadrapada':  'Purva Bhadrapada (Jupiter) — the Blessed Feet. Idealistic, passionate, and spiritually intense, you are capable of sacrificing everything for a higher cause. When the cause is genuinely higher, this is liberation. When it is merely ideology, it is costly martyrdom. Jupiter\'s wisdom is the compass that makes the difference.',
  'Uttara Bhadrapada': 'Uttara Bhadrapada (Saturn) — the Serpent of Wisdom. You are the sage who waits and then acts with perfect timing. Research, spiritual practice, and charitable work are your domain. Patience is not passivity for you — it is precision. Contentment and detachment, earned through life experience, are your highest achievements.',
  'Revati':            'Revati (Mercury) — the Wealthy and Complete. The final nakshatra carries the full arc of the zodiac\'s wisdom. You walk between worlds — sensing what others cannot, feeling the undercurrent of life. Artistic, spiritual, and profoundly empathic, your journey this life is to complete karmic cycles and leave the world measurably kinder than you found it.'
};

const JUPITER_IN_HOUSE = {
  1:  'Jupiter in the 1st house is a profound blessing — wisdom, dignity, and natural abundance radiate from your very presence. Health is generally robust; philosophical depth marks your worldview from youth.',
  2:  'Jupiter in the 2nd house brings wealth through righteous means, eloquence of speech, and a large, nurturing family circle. Your words carry genuine authority.',
  3:  'Jupiter in the 3rd house elevates communication — writing, philosophy, and teaching through the medium of language. Siblings may be learned or spiritually inclined.',
  4:  'Jupiter in the 4th house blesses home, mother, and inner peace. Real estate may bring gain; your home is a place of learning and spiritual refuge.',
  5:  'Jupiter in the 5th house — the most auspicious position for intelligence and children. Speculative ventures succeed; creative brilliance is marked. Spiritual practices bear deep fruit.',
  6:  'Jupiter in the 6th house overcomes enemies and disease through dharmic means rather than conflict. Healthcare, law, or charitable service are your most natural arenas.',
  7:  'Jupiter in the 7th house brings a wise, learned, and spiritually inclined marriage partner. Business partnerships are generally auspicious and dharmic.',
  8:  'Jupiter in the 8th house confers interest in mysticism, occult sciences, and the nature of transformation. Inheritance or unexpected gains are possible. Longevity is generally favored.',
  9:  'Jupiter in the 9th — its most exalted position by house. This is the placement of the truly fortunate: deep dharma, blessings from teachers and spiritual lineages, and protection through right action.',
  10: 'Jupiter in the 10th house promises a career in teaching, law, finance, governance, or spiritual leadership. Fame and legitimate authority are the natural fruits of your work.',
  11: 'Jupiter in the 11th house fulfills desires effortlessly. Income flows with ease; well-placed friends and elder connections open significant opportunities.',
  12: 'Jupiter in the 12th house confers spiritual liberation, foreign connections, and a life oriented toward selfless service. The inner life is rich; the ashram, hospital, or foreign land may be your true home.'
};

const SATURN_IN_HOUSE = {
  1:  'Saturn in the 1st house — you carry gravity from birth. Early life involves responsibility beyond your years, but midlife brings an authority that others cannot easily challenge. Discipline is your native mode.',
  2:  'Saturn in the 2nd house demands financial discipline — wealth comes through consistent effort and patient accumulation, never through sudden fortune. Family responsibilities are ongoing.',
  3:  'Saturn in the 3rd house grants exceptional willpower, persistence, and technical mastery. Communications are measured and deliberate. Sustained written work or technical expertise is your calling.',
  4:  'Saturn in the 4th house may delay property acquisition and create an internal sense of limitation early in life. In maturity, deep contentment and true inner peace emerge — the long work of building an unshakeable foundation.',
  5:  'Saturn in the 5th house calls for seriousness in speculation and creativity. Children may arrive late; intelligence is deep and systematic rather than quick. Speculation and short-term gambling are firmly advised against.',
  6:  'Saturn in the 6th house — an excellent placement. Enemies are overcome through sheer persistence; diseases are managed through discipline. Service-oriented professions suit you powerfully.',
  7:  'Saturn in the 7th house may delay marriage and bring a partner who is older, more serious, or more disciplined than expected. The word is delay — not denial. Partnerships deepen significantly with time.',
  8:  'Saturn in the 8th house demands confrontation with impermanence and limitation. Chronic conditions may require attention. Research, occult sciences, and genuine psychological depth are your most meaningful gifts.',
  9:  'Saturn in the 9th house makes you a questioner of received tradition — you earn your philosophy through experience rather than inheritance. The relationship with the father may be challenging but ultimately transformative.',
  10: 'Saturn in the 10th house — career rewards arrive slowly, deliberately, and permanently. Government, administration, law, mining, or real estate suit your patient ambition. Authority earned here is never taken away.',
  11: 'Saturn in the 11th house produces steady, accumulating income over time. Friendships are few but lasting. Elder siblings may be serious or geographically distant. Long-term gains consistently outperform short-term ones.',
  12: 'Saturn in the 12th house — the soul is called toward solitude, spiritual discipline, and foreign residence. Expenses require vigilant management. The inner life is profound; the outward life may feel constrained until spiritual practice becomes central.'
};

const RAHU_IN_HOUSE = {
  1:  'Rahu in the 1st house creates a personality that defies easy categorization — unconventional, magnetic, and driven by ambitions that exceed the norm. Foreign cultures or unusual experiences shape your identity powerfully.',
  2:  'Rahu in the 2nd house amplifies material ambition. Wealth may come through foreign sources, technology, or unconventional means. Speech can be powerful and persuasive — use it with awareness.',
  3:  'Rahu in the 3rd house gives extraordinary daring in communication. You will do what others won\'t — say what others won\'t — and this courage, properly directed, opens doors no one else reaches.',
  4:  'Rahu in the 4th house creates restlessness at home — a foreign residence or unconventional living arrangement may be where you actually flourish. The conventional home structure may feel like a cage.',
  5:  'Rahu in the 5th house brings unconventional romantic experiences and an unusual relationship with children and creative work. Speculation carries genuine risk — exercise disciplined caution.',
  6:  'Rahu in the 6th house is a powerful placement for overcoming enemies and competitors through relentless, unconventional effort. Foreign or cross-cultural service work suits you unusually well.',
  7:  'Rahu in the 7th house draws partnerships — personal and professional — with people from very different backgrounds. These unions are karmic and transformative by design.',
  8:  'Rahu in the 8th house confers deep interest in the occult, mysticism, and the hidden dimensions of existence. Sudden events repeatedly reshape your life; inheritance or unexpected gains are possible.',
  9:  'Rahu in the 9th house creates an unconventional spiritual path. Foreign teachers, non-traditional philosophies, and a questioning relationship with inherited religion define your dharmic journey.',
  10: 'Rahu in the 10th house — career rise is dramatic, unusual, and larger than expected. Ambition drives you toward prominent roles in technology, foreign affairs, or unconventional fields. The spotlight finds you.',
  11: 'Rahu in the 11th house brings large ambitions and fulfills them through unconventional networks. Gains from foreign sources; friends from diverse backgrounds open extraordinary opportunities.',
  12: 'Rahu in the 12th house draws you toward foreign countries, spiritual seeking, or work in isolated or institutional settings. Hidden expenses and karmic debts require attention and conscious clearing.'
};

const KETU_IN_HOUSE = {
  1:  'Ketu in the 1st house — past-life wisdom runs deep and is immediately felt by others as unusual spiritual gravity. The ego is being refined out of its attachment to self-assertion; moksha-seeking is a natural orientation.',
  2:  'Ketu in the 2nd house brings detachment from material accumulation. Speech carries spiritual quality. Family karma from past lives is actively being resolved in this birth.',
  3:  'Ketu in the 3rd house gives courage that is instinctive rather than calculated — you act in the right moment without knowing why. Siblings may carry spiritual significance or geographic distance.',
  4:  'Ketu in the 4th house — the inner home is the spiritual realm. Outer home may shift frequently across this lifetime. The mother may be spiritually inclined or physically unavailable in a formative way.',
  5:  'Ketu in the 5th house brings past-life knowledge that surfaces as intuition. Children carry significant karmic lessons. Speculation and gambling are firmly contraindicated by this placement.',
  6:  'Ketu in the 6th house dissolves opposition quietly and effortlessly. Enemies tend to eliminate themselves; disease can be healed through spiritual or unconventional means.',
  7:  'Ketu in the 7th house brings partnerships that feel unmistakably karmic — both deeply connecting and ultimately releasing. The soul is completing a lesson about union and separation simultaneously.',
  8:  'Ketu in the 8th house creates a profound orientation toward moksha, mysticism, and the nature of death. Sudden inner transformations reshape the spiritual landscape repeatedly.',
  9:  'Ketu in the 9th house produces a questioning relationship with tradition that ultimately leads to a genuinely personal spiritual wisdom — earned rather than inherited.',
  10: 'Ketu in the 10th house draws the native toward spiritual, research-oriented, or behind-the-scenes work. Worldly recognition may come through unusual means or be deliberately set aside in favor of inner work.',
  11: 'Ketu in the 11th house fulfills desires — yet satisfaction proves elusive, pointing the soul toward a deeper seeking beyond material fulfillment. Past-life connections manifest as significant friendships.',
  12: 'Ketu in the 12th house — the strongest placement for liberation in a chart. The soul has nearly completed its material curriculum. Solitude, spiritual practice, and service toward liberation define this birth\'s highest arc.'
};

const DASHA_READINGS = {
  Sun:     'The Sun Mahadasha (6 years) calls you into authority, recognition, and soul-assertion. Government, leadership, and matters related to the father and seniors come into prominence. Health and vitality are generally elevated. This is the period to step forward and claim the role that was always yours.',
  Moon:    'The Moon Mahadasha (10 years) is a period of emotional depth, travel, changes in residence, and heightened intuition. The mother plays a significant and formative role. Business in public-facing fields, liquids, or real estate may flourish naturally. Protect your emotional field — you will feel everything more acutely in this period.',
  Mars:    'The Mars Mahadasha (7 years) is a period of raw energy, direct action, and confrontation with what can no longer be avoided. Property, siblings, and ventures requiring courage come into focus. Land, real estate, and technical fields are favored. The key is to channel this force constructively rather than reactively.',
  Rahu:    'The Rahu Mahadasha (18 years) is the great worldly period — ambition, foreign connections, unconventional paths, and unexpected reversals. Rahu amplifies whatever it touches, including desire. Technology, media, and foreign fields are highlighted. Your worldly destiny is substantially shaped by what you build in this period.',
  Jupiter: 'The Jupiter Mahadasha (16 years) is the most universally auspicious period in the chart. Expansion, wisdom, wealth, marriage, children, and spiritual growth are its hallmarks. Teachers, gurus, and what the tradition calls \'divine grace\' actively support your journey. Dharmic living yields extraordinary — often seemingly impossible — results.',
  Saturn:  'The Saturn Mahadasha (19 years) is the great karmic period. What you have planted, you now harvest — good and bad without exception. Legal matters, service-oriented work, and the confrontation of personal limitations are recurring themes. Those who embrace Saturn\'s discipline build permanent foundations; those who resist find the same lesson repeating until they do.',
  Mercury: 'The Mercury Mahadasha (17 years) is a period of intellect, commerce, communication, and versatility. Education, writing, trading, and analytical pursuits flourish. Siblings and cousins may play significant roles. Multiple income streams often open simultaneously — Mercury rewards those who adapt and specialize.',
  Ketu:    'The Ketu Mahadasha (7 years) is a period of spiritual intensity, sudden events, and liberation from the material. What is not essential falls away. Mystical experiences, pilgrimage, and detachment from the purely worldly characterize this time. Technical and research abilities sharpen. The outer life contracts; the inner life expands in direct proportion.',
  Venus:   'The Venus Mahadasha (20 years) is the longest period — encompassing comfort, beauty, love, and artistic expression at their fullest. Marriage is most likely to occur here. Business in beauty, art, hospitality, or finance flourishes. Sensory pleasures abound; conscious moderation is required. Genuine joy — rare in any period — is this Mahadasha\'s deepest gift.'
};

// ─── YOGA DETECTION ──────────────────────────────────────────────────────────

function detectYogas(data) {
  const yogas = [];
  const pp = data.planetary_positions || {};
  const lagna = data.lagna;

  // Gaja Kesari — Jupiter in kendra from Moon
  const jupHouse = pp.Jupiter?.house;
  const moonHouse = pp.Moon?.house;
  if (jupHouse && moonHouse) {
    const diff = ((jupHouse - moonHouse + 12) % 12);
    if ([0, 3, 6, 9].includes(diff)) {
      yogas.push({
        name: 'Gaja Kesari Yoga',
        desc: 'Jupiter is in a kendra (angular house) from the Moon. Classical texts describe this as granting the strength of an elephant — wisdom, lasting fame, material prosperity, and a reputation that survives beyond this lifetime.'
      });
    }
  }

  // Budhaditya — Sun and Mercury in same sign
  if (pp.Sun?.sign && pp.Mercury?.sign && pp.Sun.sign === pp.Mercury.sign) {
    yogas.push({
      name: 'Budhaditya Yoga',
      desc: 'The Sun and Mercury occupy the same sign. This classical yoga grants a brilliant, penetrating intellect, eloquent speech, and favor from authority figures. Writing, communication, and analytical fields are naturally highlighted.'
    });
  }

  // Pancha Mahapurusha Yogas — planet in own/exalted sign in a kendra
  const kendra = [1, 4, 7, 10];
  const mahapurusha = [
    { planet: 'Jupiter', ownSigns: ['Sagittarius','Pisces'], exaltSign: 'Cancer', name: 'Hamsa Yoga', desc: 'Jupiter occupies its own or exalted sign in an angular house. Hamsa is the most sattvic of the five great-person yogas — granting a life of wisdom, justice, genuine prosperity, and deep spiritual merit.' },
    { planet: 'Venus',   ownSigns: ['Taurus','Libra'],       exaltSign: 'Pisces', name: 'Malavya Yoga', desc: 'Venus occupies its own or exalted sign in an angular house. Malavya Yoga confers beauty, sensory refinement, artistic mastery, marital happiness, and wealth accumulated through graceful means.' },
    { planet: 'Mars',    ownSigns: ['Aries','Scorpio'],      exaltSign: 'Capricorn', name: 'Ruchaka Yoga', desc: 'Mars occupies its own or exalted sign in an angular house. Ruchaka Yoga produces a courageous, decisive, and commanding personality — one who leads through direct action and rarely yields to opposition.' },
    { planet: 'Saturn',  ownSigns: ['Capricorn','Aquarius'], exaltSign: 'Libra', name: 'Shasha Yoga', desc: 'Saturn occupies its own or exalted sign in an angular house. Shasha Yoga grants longevity, authority over servants and subordinates, executive leadership, and the ability to build institutions that outlast their builder.' },
    { planet: 'Mercury', ownSigns: ['Gemini','Virgo'],       exaltSign: 'Virgo', name: 'Bhadra Yoga', desc: 'Mercury occupies its own or exalted sign in an angular house. Bhadra Yoga grants exceptional intellectual power, eloquence, commercial acumen, and the ability to master multiple disciplines simultaneously.' }
  ];
  for (const y of mahapurusha) {
    const p = pp[y.planet];
    if (p && kendra.includes(p.house)) {
      if (y.ownSigns.includes(p.sign) || p.sign === y.exaltSign) {
        yogas.push({ name: y.name, desc: y.desc });
      }
    }
  }

  // Viparita Raja Yoga — lord of 6/8/12 in 6/8/12
  // (simplified check: just flag if both lords are in those houses)
  const dusthana = [6, 8, 12];
  const hl = data.house_lords || {};
  const hp = data.house_planets || {};
  for (const h of dusthana) {
    const lord = hl[h];
    if (!lord) continue;
    const lordPos = pp[lord];
    if (lordPos && dusthana.includes(lordPos.house) && lordPos.house !== h) {
      yogas.push({
        name: 'Viparita Raja Yoga',
        desc: `The lord of the ${h}th house (a dusthana) is placed in another dusthana. Viparita Raja Yoga promises unexpected reversal of misfortune — enemies, diseases, and hidden adversaries end up neutralizing each other, leaving the native stronger than before.`
      });
      break;
    }
  }

  return yogas;
}

// ─── CURRENT DASHA ───────────────────────────────────────────────────────────

function getCurrentDasha(data) {
  const dashas = data.dasha_sequence || [];
  const now = new Date();
  const mahadasha = dashas.find(d => new Date(d.start) <= now && new Date(d.end) >= now);
  if (!mahadasha) return null;
  const antardasha = mahadasha.antardashas?.find(a => new Date(a.start) <= now && new Date(a.end) >= now);
  return { mahadasha, antardasha };
}

// ─── MAIN INTERPRETATION FUNCTION ────────────────────────────────────────────

function getKundaliInterpretation(data) {
  const pp = data.planetary_positions || {};
  const lagna = data.lagna;
  const moonSign = data.moon_sign;
  const sunSign = data.sun_sign;
  const nakshatra = data.nakshatra;

  const lagnaReading   = LAGNA_READINGS[lagna] || null;
  const moonReading    = MOON_READINGS[moonSign] || null;
  const sunReading     = SUN_READINGS[sunSign] || null;
  const nakshatraText  = NAKSHATRA_READINGS[nakshatra] || null;
  const jupiterHouse   = pp.Jupiter?.house;
  const saturnHouse    = pp.Saturn?.house;
  const rahuHouse      = pp.Rahu?.house;
  const ketuHouse      = pp.Ketu?.house;

  const jupiterReading = jupiterHouse ? JUPITER_IN_HOUSE[jupiterHouse] : null;
  const saturnReading  = saturnHouse  ? SATURN_IN_HOUSE[saturnHouse]  : null;
  const rahuReading    = rahuHouse    ? RAHU_IN_HOUSE[rahuHouse]      : null;
  const ketuReading    = ketuHouse    ? KETU_IN_HOUSE[ketuHouse]      : null;

  const current = getCurrentDasha(data);
  const dashaReading = current?.mahadasha
    ? (DASHA_READINGS[current.mahadasha.planet] || null)
    : null;

  const yogas = detectYogas(data);
  const balance = data.dasha_balance;

  // Retrograde planets (excluding Rahu/Ketu which are always retrograde)
  const retroPlanets = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']
    .filter(p => pp[p]?.retrograde);

  return {
    lagna_reading: lagnaReading,
    moon_reading: moonReading,
    sun_reading: sunReading,
    nakshatra_reading: nakshatraText,
    jupiter_reading: { house: jupiterHouse, text: jupiterReading },
    saturn_reading:  { house: saturnHouse,  text: saturnReading  },
    rahu_reading:    { house: rahuHouse,    text: rahuReading    },
    ketu_reading:    { house: ketuHouse,    text: ketuReading    },
    dasha_reading:   { current, text: dashaReading },
    yogas,
    retro_planets: retroPlanets,
    balance
  };
}

module.exports = { getKundaliInterpretation };
