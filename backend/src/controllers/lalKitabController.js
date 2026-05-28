'use strict';

const { calculateKundali } = require('../services/kundaliEngine');

// ── Planet metadata ────────────────────────────────────────────────────────────
const PLANET_META = {
  Sun:     { symbol:'☉', color:'#FFB347', ruler:'Authority & Soul',    hindiName:'Surya'   },
  Moon:    { symbol:'☽', color:'#C0C0FF', ruler:'Mind & Mother',       hindiName:'Chandra' },
  Mars:    { symbol:'♂', color:'#FF6B6B', ruler:'Courage & Land',      hindiName:'Mangal'  },
  Mercury: { symbol:'☿', color:'#7EC8A4', ruler:'Intellect & Business',hindiName:'Budh'    },
  Jupiter: { symbol:'♃', color:'#FFD700', ruler:'Wisdom & Fortune',    hindiName:'Guru'    },
  Venus:   { symbol:'♀', color:'#FFB6C1', ruler:'Love & Luxury',       hindiName:'Shukra'  },
  Saturn:  { symbol:'♄', color:'#A0A0B0', ruler:'Karma & Discipline',  hindiName:'Shani'   },
  Rahu:    { symbol:'☊', color:'#8B5CF6', ruler:'Obsession & Illusion',hindiName:'Rahu'    },
  Ketu:    { symbol:'☋', color:'#F97316', ruler:'Detachment & Moksha', hindiName:'Ketu'    },
};

// ── Planet-in-house effects (Lal Kitab) ───────────────────────────────────────
// Format: [good, title, summary, advice, remedy]
const EFFECTS = {
  Sun: [
    null,
    [true,  'Radiant Lagna',       'Strong personality and natural leadership ability. Government blessings flow readily. Father figure is influential and supportive.',                                  'Take up positions of authority confidently. Your presence commands respect.',                       'Offer water (arghya) to the rising Sun daily. Keep a copper Surya yantra.'],
    [false, 'Family Tensions',     'Financial fluctuations and disputes within the family. Speech can cause unintended hurt. Property matters may cause friction.',                                       'Avoid ego clashes at home. Keep speech measured and kind.',                                         'Keep a square piece of copper in your wallet. Donate wheat and jaggery on Sundays.'],
    [true,  'Courageous Ventures', 'Bold, energetic, and successful in self-initiated ventures. Siblings bring support and recognition. Communication roles suit you.',                                  'Launch business or creative projects — your courage will carry them forward.',                       'Donate wheat and jaggery to labourers on Sundays.'],
    [false, 'Mother\'s Care',      'Property gains are possible but require effort. Mother\'s health needs attention and care. Ancestral home matters may come up for resolution.',                      'Do not sell ancestral land or property — hold it for stability.',                                   'Throw copper coins in a flowing river. Never sell your mother\'s land.'],
    [true,  'Bright Intellect',    'Intelligent, creative, and favoured by government. Children are a source of pride. Speculative ventures guided by intuition succeed.',                               'Use your natural creativity and government connections for career growth.',                          'Wear a gold ring. Chant the Gayatri mantra 108 times daily.'],
    [true,  'Enemy Vanquisher',    'Enemies are defeated with relative ease. Good health and strong immunity. Government employment or contracts are achievable.',                                        'Face competition head-on — you have the cosmic favour to overcome obstacles.',                       'Feed wheat and jaggery to a cow on Sundays.'],
    [false, 'Ego in Partnership',  'Spouse health requires attention. Partnerships suffer from ego conflicts. Government or business collaborations bring frustration.',                                  'Avoid dominating your partner. Compromise and collaboration will heal this placement.',              'Donate wheat and jaggery at a Shiva temple on Sundays.'],
    [false, 'Life\'s Obstacles',   'Delays and obstacles appear frequently, but longevity is protected. Avoid speculative or risky ventures. Health needs consistent care.',                             'Be patient — obstacles are karmic lessons, not permanent blocks.',                                  'Throw copper coins into a flowing river on Sundays.'],
    [true,  'Dharmic Fortune',     'Deeply spiritual and fortunate. Father is prosperous and a source of blessings. Long journeys and pilgrimages bring transformation.',                                'Strengthen your relationship with your father — his blessings amplify your fortune.',               'Respect your father daily. Donate generously at religious places.'],
    [true,  'Career Authority',    'Powerful career trajectory with genuine authority and recognition. Government positions and fame are strongly indicated. Highest of all houses for Sun.',            'Pursue positions of power boldly. Leadership and authority are your cosmic birthright.',             'Wear a gold ring. Practice Surya Namaskar every morning.'],
    [true,  'Gains & Influence',   'Gains from government, financial profits, and influential contacts. Large social network brings steady prosperity.',                                                 'Leverage your connections and social standing for career and income growth.',                        'Keep a gold or copper article on your person at all times.'],
    [false, 'Foreign Expenditure', 'Expenses increase and secret enemies emerge. Foreign travel or stays are indicated. Spiritual growth through solitude and introspection.',                           'Retreat and recharge regularly. Spiritual discipline turns expenditure into inner wealth.',           'Donate wheat flour at a temple on Sundays.'],
  ],
  Moon: [
    null,
    [true,  'Charming Persona',    'Attractive, popular, and emotionally intelligent. Public life is successful and fulfilling. Strong intuition guides important decisions.',                            'Trust your instincts in public dealings — your emotional intelligence is your greatest asset.',      'Offer raw milk at the roots of a Peepal tree on Mondays.'],
    [false, 'Emotional Wealth',    'Income fluctuates with emotional states. Sweet speech wins others over. Family relationships deeply felt. Money comes and goes cyclically.',                          'Create stable savings habits to balance income fluctuations.',                                       'Keep silver or a pearl with you. Donate rice and milk to the needy.'],
    [true,  'Bold Independence',   'Courageous, independent, and physically active. Travel brings fortune. Siblings, especially sisters, play a positive role.',                                         'Embrace travel and movement — staying static limits your potential.',                                'Keep a small silver ball or coin in your pocket.'],
    [true,  'Domestic Bliss',      'Highly comfortable domestic life with a happy and healthy mother. Property ownership brings stability. Emotional foundations are solid.',                             'Invest in property and home comforts — they will appreciate in all senses.',                         'Offer milk at the roots of a Peepal tree on Mondays.'],
    [true,  'Creative Mind',       'Intelligent and imaginative children. Creative investments pay off emotionally and financially. Emotional intelligence enhances education.',                          'Nurture your children\'s creative talents — they will bring you pride and joy.',                     'Wear a silver ring on the right ring finger.'],
    [false, 'Maternal Tensions',   'Tensions with maternal relatives, particularly maternal uncles/aunts. Digestive health needs attention. Emotional discipline is key.',                               'Resolve old family tensions before they compound. Dietary discipline protects health.',              'Donate milk and rice to the poor on Mondays.'],
    [true,  'Emotional Bond',      'Charming and emotionally expressive spouse. Relationships are intense, deep, and ultimately fulfilling. Partnership brings emotional security.',                     'Allow emotional vulnerability in relationships — it will deepen the bond.',                          'Respect your partner. Offer water at a Shiva-Parvati temple.'],
    [false, 'Psychic Sensitivity', 'Health sensitivity particularly around water and emotional stress. Psychic and intuitive abilities are heightened. Ancestral property matters arise.',               'Protect your emotional health. Practice grounding activities like gardening.',                       'Keep silver with you always. Donate rice and milk at night.'],
    [true,  'Spiritual Fortune',   'Spiritually inclined with a fortunate and religious mother. Pilgrimages and religious journeys are deeply fulfilling and transformative.',                            'Follow your spiritual calling — it will bring outer fortune too.',                                  'Offer water (arghya) at a Shiva temple on Mondays.'],
    [true,  'Public Success',      'Career flourishes in public-facing roles. Fame and recognition come through emotional intelligence. Mother\'s prayers are a powerful shield.',                       'Respect your mother — her blessings determine your professional success.',                          'Keep silver at your work desk. Respect mother daily.'],
    [true,  'Steady Profits',      'Profits flow from public dealings and emotional intelligence. Good friends support you faithfully. Financial gains are steady and reliable.',                         'Cultivate your friendship networks — they are sources of both joy and income.',                      'Keep silver with you. Feed cows regularly.'],
    [false, 'Hidden World',        'A tendency toward hidden fears and excessive expenses. Spiritual and mystical tendencies are strong. Night-time work and solitude suit you.',                        'Channel your spiritual sensitivity into meditation and service.',                                    'Donate milk at night. Keep a pearl or silver piece.'],
  ],
  Mars: [
    null,
    [false, 'Fire Within',         'Highly energetic and courageous but prone to accidents and impulsive decisions. Physical strength is exceptional. Anger management is essential.',                    'Channel Mars energy into sports, martial arts, or physical labor. Avoid reckless risks.',            'Donate blood voluntarily on birthdays. Feed sweets to labourers on Tuesdays.'],
    [false, 'Sharp Tongue',        'Family conflicts arise from directness and impatience. Speech cuts like a knife. Financial gains and losses are both sharp and sudden.',                              'Soften your communication at home. Think before speaking to family members.',                        'Donate red lentils in flowing water. Keep red coral or ivory.'],
    [true,  'Courageous Path',     'Excellent for courage, self-employment, and physical ventures. Siblings are deeply supportive allies. Short journeys bring success.',                                 'Launch your own ventures confidently — Mars here guarantees the courage to succeed.',                'Donate land to the poor. Feed monkeys on Tuesdays.'],
    [false, 'Land & Strife',       'Domestic strife related to land and property. Mother\'s health needs attention. Property gains are possible but come with effort and conflict.',                      'Register property in mother\'s name for protection. Keep home atmosphere peaceful.',                 'Keep land or property in mother\'s name. Avoid selling ancestral property.'],
    [false, 'Competitive Mind',    'Highly competitive and intelligent. Children may be few or arrive later. Speculative risks must be carefully managed.',                                               'Invest competitive energy into education and skill-building rather than speculation.',               'Feed sweets to monkeys on Tuesdays. Donate land to the poor.'],
    [true,  'Warrior\'s Strength', 'Mars here is a warrior — enemies are decisively defeated. Physical health and stamina are outstanding. Service-related income is steady.',                           'Face all challenges head-on. Mars in the 6th gives you the strength to overcome any obstacle.',      'Donate blood on your birthday. Feed the poor on Tuesdays.'],
    [false, 'Martial Marriage',    'Arguments and aggression can strain the marriage. Partnerships need careful handling. Mangal Dosha considerations apply here.',                                        'Practice patience and diplomacy in marriage. Couples counselling can be deeply beneficial.',         'Donate blood. Wife should wear gold bangles. Perform Mangal Shanti puja.'],
    [false, 'Surgery Risk',        'Risk of accidents, surgeries, or injuries. Long-term health needs monitoring. Financial losses can be sudden. Extra physical caution is needed.',                    'Avoid unnecessary risky activities. Buy health insurance and maintain safety practices.',            'Donate blood regularly. Keep a protective amulet (tawiz) for safety.'],
    [false, 'Religious Impulse',   'Impulsive in matters of dharma and religion. Disputes over religious opinions possible. Brother\'s support arrives through spiritual channels.',                     'Channel religious energy into personal practice rather than debate.',                                'Plant fruit trees. Respect and support your brothers.'],
    [true,  'Land Authority',      'Strong career in fields related to land, construction, engineering, or authority. Leadership and physical management roles suit you.',                                'Pursue land, property, or engineering careers actively — Mars here empowers professional life.',      'Plant trees. Donate to land-related charities. Support farmers.'],
    [true,  'Profit & Courage',    'Excellent gains through courageous ventures and physical effort. Profits from land and property. Income is strong and increasing.',                                   'Invest in land and physical assets — they will multiply your wealth reliably.',                      'Plant trees. Donate blood on Tuesdays.'],
    [false, 'Foreign Expenses',    'Expenses related to land or surgeries arise. Foreign lands may hold opportunity but also risk. Spiritual discipline limits losses.',                                  'Budget carefully for unexpected physical expenses. Foreign investments need due diligence.',          'Throw red lentils into running water on Tuesdays.'],
  ],
  Mercury: [
    null,
    [true,  'Quick Mind',          'Highly intelligent, communicative, and youthful in appearance and energy. Business instincts are sharp. Writing and speaking bring recognition.',                    'Use your communication skills as your primary career asset.',                                        'Feed green grass to cows. Keep a small piece of gold on your person.'],
    [true,  'Business Speaker',    'Eloquent and persuasive speech. Business acumen is strong, particularly using family resources. Wit and humor open many doors.',                                     'Develop public speaking — your voice is a natural business tool.',                                   'Wear emerald or green jade. Donate green cloth to young students.'],
    [true,  'Silver Tongue',       'Excellent writer, speaker, and communicator. Short journeys bring profit. Siblings are intellectually stimulating companions.',                                       'Publish your ideas — books, articles, or videos can make you famous.',                               'Feed parrots or birds. Donate stationery to students.'],
    [true,  'Educated Home',       'High level of education linked to the home and mother. Property may come through maternal relatives. Home doubles as office effectively.',                            'Work from home or near family to multiply both prosperity and peace.',                                'Feed cows green grass. Keep marble or glass decorative items at home.'],
    [true,  'Sharp Intellect',     'Children are exceptionally intelligent and articulate. Creative and analytical mind excels in speculation with wisdom. Educational success.',                          'Invest in your children\'s education — it will pay dividends in happiness.',                         'Worship Lord Ganesha on Wednesdays. Keep glass marbles as a symbol.'],
    [true,  'Clever Victor',       'Defeats enemies through intelligence, strategy, and communication rather than force. Health is maintained through disciplined diet and routine.',                     'Choose your battles wisely and win with words rather than confrontation.',                           'Donate medicines to the poor. Feed green grass to cows.'],
    [true,  'Intelligent Union',   'Intelligent, witty, communicative spouse. Business partnerships are highly successful. Written agreements always work in your favor.',                               'Choose partners in life and business who are your intellectual equals.',                              'Respect your spouse\'s intellect. Keep a green emerald.'],
    [true,  'Research Mind',       'Sharp research abilities and secretive intelligence. Inheritances may arrive through clever means. Hidden knowledge is accessible.',                                  'Pursue research, investigation, or occult sciences — Mercury here grants deep insight.',             'Donate books to students. Keep cage-free pet birds if possible.'],
    [true,  'Scholar Teacher',     'A natural scholar, teacher, and guide. Fortune increases through education and knowledge-sharing. Father is highly educated and cultured.',                           'Teach what you know freely — generosity with knowledge multiplies your wisdom.',                     'Teach others freely as a volunteer. Donate books and stationery.'],
    [true,  'Commerce Career',     'Highly successful in business, communications, or information-based careers. Professional writing or media brings lasting fame.',                                     'Build your professional brand through communication and published work.',                             'Keep a pet parrot (or care for birds). Donate books and pens.'],
    [true,  'Network Wealth',      'Profits through intelligence, business networks, and writing. Gains from communication-based ventures are steady and growing.',                                       'Build a powerful professional network — your connections are your greatest income source.',           'Feed green fodder to cows. Keep an emerald.'],
    [false, 'Scattered Thoughts',  'Expenses through miscommunication and scattered thinking. Spiritual mind with practical application. Foreign business ventures hold promise.',                        'Practice mindfulness and clear communication to reduce misunderstandings and expenses.',              'Donate books or pens weekly. Keep glass items clean and polished.'],
  ],
  Jupiter: [
    null,
    [true,  'Blessed Life',        'Fortunate, wise, and naturally respected by all. Long and healthy life with spiritual depth. The most auspicious Lagna placement for Jupiter.',                      'Share your wisdom generously — it multiplies when given freely.',                                    'Respect all teachers and elders. Donate yellow items on Thursdays.'],
    [true,  'Expanding Wealth',    'Wealth accumulates steadily and family life is deeply fulfilling. Speech carries wisdom and authority. Financial foundation is solid.',                               'Invest in long-term assets — Jupiter here ensures steady, compounding growth.',                      'Donate gold or yellow items on Thursdays. Respect teachers.'],
    [true,  'Philosopher Traveller','Courageous with a philosophical mindset. Travel for education and wisdom is highly beneficial. Writing and teaching are natural strengths.',                          'Take educational trips and publish your philosophical insights.',                                     'Offer yellow sweets at a Vishnu temple. Feed Brahmins on Thursdays.'],
    [true,  'Comfortable Sage',    'Comfortable, luxurious home life. Wise and nurturing mother. Property and vehicles come easily. Home is a place of learning and peace.',                              'Create a home library or meditation space — it will be your greatest sanctuary.',                    'Keep yellow cloth or turmeric in your home. Feed cows on Thursdays.'],
    [true,  'Brilliant Children',  'Intelligent and scholarly children. Excellent for speculative investments guided by wisdom. Education and teaching roles are powerfully favoured.',                   'Invest in your children\'s higher education — the returns will be extraordinary.',                   'Worship Lord Vishnu on Thursdays. Donate yellow sweets to children.'],
    [false, 'Debt Energy',         'Financial debts from others and over-generosity are possible. Health through wise lifestyle choices. Enemies exist but are manageable.',                              'Set clear boundaries in financial dealings. Do not lend without documentation.',                     'Keep a small yellow flag. Donate yellow items to those in need.'],
    [true,  'Spiritual Marriage',  'Wise, spiritual, and evolved spouse. Marriage elevates both partners to higher states. Business partnerships are guided by ethics.',                                  'Your partnership is a spiritual journey — treat it with the reverence it deserves.',                 'Respect your spouse\'s family. Donate to newly married couples.'],
    [true,  'Hidden Blessings',    'Long life and spiritual transformation are indicated. Hidden wealth may emerge through inheritance or unexpected sources. Occult wisdom.',                             'Trust the unseen hand guiding your life — hidden blessings are working in your favour.',             'Donate to temples. Perform Satyanarayan puja on full moon days.'],
    [true,  'Supreme Fortune',     'Jupiter in the 9th house is its most powerful placement. Supremely fortunate with a noble, wise father. Religious life brings extraordinary blessings.',              'Embrace your spiritual path fully — it is your highway to abundance.',                               'Respect all teachers. Donate freely and joyfully to religious causes.'],
    [true,  'Spiritual Authority', 'Distinguished career with lasting recognition. Authority comes through wisdom and spiritual standing. Teaching or guiding roles bring fame.',                         'Lead through wisdom, not force. Your natural authority is your greatest professional asset.',         'Keep a yellow flag at your workplace. Respect all your mentors.'],
    [true,  'Abundant Network',    'Excellent gains through wisdom, large networks, and teaching. Prosperity flows steadily. Income from education or knowledge-based work is high.',                     'Build educational and spiritual communities — they will sustain your wealth.',                        'Donate yellow sweets on Thursdays. Keep turmeric in the home.'],
    [true,  'Generous Sage',       'Spiritual liberation through generosity and charitable service. Wisdom gained through self-sacrifice. Foreign pilgrimages are transformative.',                       'Donate generously without expectation — it is your karmic path to liberation.',                      'Donate generously to those in need. Perform pilgrimages when possible.'],
  ],
  Venus: [
    null,
    [true,  'Beautiful Soul',      'Handsome or beautiful, deeply artistic, and naturally charming. Creative pursuits bring fame and fortune. Life is aesthetically rich.',                               'Express your artistic talents in your career — beauty is your professional gift.',                   'Donate white sweets to young girls on Fridays.'],
    [true,  'Wealthy Speech',      'Wealth accumulates through charm and artistic skill. Sweet, persuasive speech opens many doors. Family life is aesthetically beautiful.',                             'Use your charm and eloquence in negotiations — they are worth more than you know.',                  'Keep silver or white items in your home. Donate white cloth on Fridays.'],
    [true,  'Artistic Traveller',  'Artistic and charming communicator. Travel for pleasure is deeply beneficial. Creative expression in all its forms brings recognition.',                              'Take artistic retreats or travel to places of beauty — they restore and inspire you.',               'Feed cows on Fridays. Keep silver in your wallet.'],
    [true,  'Luxurious Home',      'Luxurious and beautiful home, fine vehicles, and a deeply happy domestic life. Comforts arrive naturally without excessive struggle.',                                'Invest in the beauty and comfort of your home — it is your greatest sanctuary.',                     'Keep your home fragrant and beautiful. Donate to women in need.'],
    [true,  'Romantic Creator',    'Deeply romantic, highly creative, and blessed with beautiful or talented children. Artistic talents shine brilliantly. Love is fulfilling.',                          'Channel your romantic and creative energy into art that can be shared with the world.',              'Donate to young girls. Practice or patronise the arts actively.'],
    [false, 'Love Betrayal',       'Risk of betrayal in love relationships and over-indulgence affecting health. Financial fluctuations through pleasure-seeking. Restraint is needed.',                  'Set clear boundaries in romantic relationships. Cultivate self-discipline in pleasures.',            'Donate white items to poor women. Fast on Fridays and offer prayers.'],
    [true,  'Ideal Partner',       'Excellent for marriage — a beautiful, loving, and devoted spouse. Business partnerships are harmonious and financially rewarding.',                                   'Your partnership is among the most blessed possible — nurture it with attention and care.',          'Respect women. Gift silver items to your spouse on your anniversary.'],
    [true,  'Hidden Pleasures',    'Inheritance through spouse, sensual depth, and hidden artistic talents. Resources come from unexpected sources. Luxury in private life.',                             'Trust in the abundance flowing toward you — it often arrives through your partner.',                 'Donate a white sari or cloth to women. Keep silver items at home.'],
    [true,  'Artistic Fortune',    'Fortune through artistic or aesthetic pursuits. Devotion expressed through beauty. Religious and cultural activities bring recognition.',                              'Combine your spiritual and artistic natures — sacred art or music is your calling.',                'Respect female elders. Visit beautiful temples or cultural places on Fridays.'],
    [true,  'Career Beauty',       'Career in arts, beauty, fashion, film, or luxury is highly successful. Creative fame is achievable. Workplace has an attractive atmosphere.',                         'Build your professional brand around aesthetics — your creative eye is your career.',               'Donate to female artists. Keep your workspace beautiful and fragrant.'],
    [true,  'Profitable Arts',     'Great gains through artistic expression, relationships, and the beauty industry. Profitable social networks and loyal, loving friends.',                              'Monetise your artistic talents — Jupiter\'s sister sign here ensures it pays generously.',           'Gift silver items to your wife or sister. Feed cows on Fridays.'],
    [false, 'Secret Luxury',       'Tendency to private pleasures that must be kept in balance. Spiritual artistic expression — music, dance for the divine. Foreign luxury.',                           'Direct artistic gifts toward spiritual expression rather than pure indulgence.',                     'Donate white items at night. Fast and pray on Fridays.'],
  ],
  Saturn: [
    null,
    [false, 'Karmic Discipline',   'Slow but certain progress through consistent effort. Highly disciplined and long-lived. Struggles in youth give way to stability and authority in later life.',      'Play the long game — Saturn here rewards patience and consistent effort over time.',                 'Feed crows and dogs daily. Donate black sesame and oil on Saturdays.'],
    [false, 'Harsh Speech',        'Speech can be harsh or blunt, affecting family harmony. Financial growth is delayed but eventual. Family karma needs to be consciously healed.',                     'Practice speaking with warmth and care — your words carry more weight than you realise.',           'Donate black sesame on Saturdays. Feed crows daily.'],
    [true,  'Persistent Worker',   'Hardworking, methodical, and disciplined. Gains come after sustained, focused effort. Patience is your greatest professional virtue.',                               'Embrace the process — Saturn here ensures that consistent work is never wasted.',                    'Keep ants fed near your home. Donate black sesame on Saturdays.'],
    [false, 'Property Karma',      'Property-related delays and complications. Mother\'s health requires long-term care and attention. Karmic obligations linked to land and home.',                     'Fulfil family karmic obligations consciously — they are the price of future abundance.',             'Keep iron items in the home. Feed crows and dogs on Saturdays.'],
    [false, 'Patient Learning',    'Children may arrive late or in fewer numbers. Learning comes through hard work and persistent effort. Discipline in education is the key.',                          'Invest in practical, skills-based education rather than purely theoretical learning.',              'Feed crows on Saturdays. Donate black blankets to the poor.'],
    [true,  'Tenacious Victor',    'The strongest position for Saturn — defeats enemies through sheer tenacity and discipline. Financial gains through service and persistence.',                         'Trust your ability to outlast any obstacle — Saturn here makes you unbreakable.',                    'Feed crows and dogs on Saturdays. Donate iron items.'],
    [false, 'Delayed Marriage',    'Marriage is often delayed or the spouse is older. Relationship deepens slowly but with great durability. Karmic partnership deserves respect.',                      'Allow relationships to develop slowly — the depth that follows is extraordinary.',                  'Donate oil on Saturdays. Feed dogs and crows near your home.'],
    [true,  'Iron Constitution',   'Exceptional longevity and resilience. Life has many obstacles, but you survive and outlast them all. Hidden strength is your defining quality.',                     'Trust your resilience — you are built to endure and ultimately thrive.',                             'Donate black sesame oil at a Shani temple on Saturdays.'],
    [false, 'Karmic Religion',     'Disciplined and consistent spiritual practice brings results. Complications around father and religious authority. Karma of past religious promises.',                'Fulfil spiritual promises and commitments made in the past — Saturn is watching.',                   'Visit a Shani temple on Saturdays. Donate food to the poor.'],
    [true,  'Slow Authority',      'Career builds slowly but reaches genuine, durable authority. Government employment or long-term institutions are favourable professional homes.',                     'Choose stable, long-term career paths over quick gains — Saturn rewards loyalty.',                   'Keep an iron horseshoe at home. Respect all workers and servants.'],
    [true,  'Earned Prosperity',   'Gains arrive after hard and consistent work. Income is eventually stable and reliable. Loyal, long-standing friendships are a source of support.',                   'Invest patiently in long-term financial instruments — compounding is your greatest ally.',           'Donate oil on Saturdays. Feed dogs near your home.'],
    [false, 'Karmic Release',      'Expenses as karmic repayments. Spiritual liberation through disciplined service and self-denial. Work in solitary or institutional settings.',                        'Accept karmic expenses as spiritual investments — they are clearing past debts.',                    'Donate black items on Saturdays. Feed crows and dogs at night.'],
  ],
  Rahu: [
    null,
    [false, 'Mysterious Nature',   'Unconventional, magnetic, and mysterious personality. Foreign connections and unorthodox career paths are indicated. Life takes unexpected turns.',                   'Embrace your uniqueness — Rahu here makes you stand out, not fit in.',                              'Keep a silver elephant figurine. Donate coal or mustard on Saturdays.'],
    [false, 'Unusual Speech',      'Speech is unusual, harsh, or unconventional. Family has complications from foreign or unconventional sources. Income from unexpected channels.',                      'Practice conscious, clear communication to reduce misunderstandings in family life.',               'Donate coal on Saturdays. Keep a silver coin in your wallet.'],
    [true,  'Daring Ventures',     'Bold, unconventional, and successful in uncharted ventures. Foreign or tech-related siblings possible. Courage in unexplored territories.',                           'Pioneer new fields — Rahu here rewards those who dare to go where others fear.',                    'Keep an elephant figurine in your home. Feed crows on Saturdays.'],
    [false, 'Disrupted Home',      'Home life is disrupted or unconventional. Foreign land property is possible. Karmic lessons arrive through mother or domestic life.',                                'Ground yourself with spiritual practice at home to counterbalance Rahu\'s restlessness.',            'Keep a silver ball in your home. Bury a piece of coal near the house foundation.'],
    [false, 'Unconventional Mind', 'Unusual and brilliant intellect. Children may be unconventional or arrive through unusual circumstances. Speculative losses possible.',                               'Avoid speculative investments driven by obsession — research and patience are needed.',              'Keep a cat\'s eye or sapphire stone. Donate coal on Saturdays.'],
    [true,  'Foreign Success',     'Strong placement — foreign job opportunities abound. Enemies are defeated through unconventional means. Tech-related or media careers flourish.',                    'Pursue international career opportunities fearlessly — Rahu here supports them strongly.',           'Keep fennel seeds with you. Feed fish in a river on Saturdays.'],
    [false, 'Karmic Partner',      'Unusual, foreign, or unconventional spouse. Deep karmic relationship that transforms both partners. Business partnerships involve foreign elements.',                  'Approach your karmic partnership with acceptance and a willingness to transform.',                   'Keep silver with you. Respect your spouse\'s unusual qualities.'],
    [false, 'Shadow Depths',       'Fascination with the occult, secrets, and the paranormal. Sudden gains and equally sudden losses. Mysterious health issues may arise.',                              'Develop spiritual discernment to separate genuine insight from Rahu\'s illusions.',                 'Donate coal on Saturdays. Keep an 8-faced Rudraksha mala.'],
    [false, 'Unconventional Dharma','An unconventional spiritual path, possibly influenced by foreign or technology-based practices. Father\'s life is complex and multi-layered.',                       'Follow your unique spiritual path with commitment, regardless of conventional expectations.',         'Wear silver. Visit foreign or unusual spiritual places.'],
    [true,  'Tech Authority',      'Career excels in foreign, technology, media, or unconventional fields. Mass media and large-scale influence are indicated. Fame is possible.',                       'Pursue technology, media, or international careers actively — these are your power zones.',          'Keep coal or lead at your workplace. Feed fish in a river regularly.'],
    [true,  'Unexpected Gains',    'Large and unexpected gains from foreign or unconventional sources. Powerful, unusual network of connections. Income is irregular but substantial.',                   'Build international and tech-oriented networks — they are your greatest income source.',             'Keep fennel seeds on your person. Feed fish on Saturdays.'],
    [false, 'Hidden Dimensions',   'Foreign travel, hidden spiritual powers, and expenses from illusions or deception. Spiritual practices from foreign traditions are healing.',                         'Protect yourself from deceptive situations. Foreign spiritual retreats are beneficial.',            'Feed fish in a river on Saturdays. Donate coal or mustard oil.'],
  ],
  Ketu: [
    null,
    [false, 'Detached Soul',       'Spiritual and detached personality with deep past-life wisdom. Unconventional life path that cannot be easily understood by others.',                                'Accept your spiritual uniqueness and stop trying to fit conventional moulds.',                       'Keep a dog as a pet or feed dogs regularly. Donate spotted or multi-coloured items.'],
    [false, 'Spiritual Wealth',    'Detachment from material wealth and family ties. Unusual or sparse speech carries unexpected wisdom. Money is spent on spiritual pursuits.',                          'Cultivate non-attachment to wealth while still creating it consciously.',                            'Donate multi-coloured cloth on Tuesdays. Feed dogs regularly.'],
    [false, 'Silent Sage',         'Detached from siblings, with mysterious communication. Spiritual journeys are transformative. Inner wisdom exceeds outer knowledge.',                                'Go within for answers before seeking them outside — your inner wisdom is vast.',                    'Keep a pet dog. Donate blankets to the homeless.'],
    [false, 'Ancestral Release',   'Disconnection from homeland and ancestral property. Spiritual home is within. Mother may be separated or have unconventional spiritual practices.',                   'Make peace with your rootlessness — your true home is your inner spiritual world.',                  'Keep a cat\'s eye stone. Feed dogs near your home or temple.'],
    [false, 'Karmic Children',     'Past life karmas are being resolved through children. Spiritual or unusual children. Unconventional intellect that transcends conventional education.',               'Accept the spiritual lessons your children bring — they are your greatest teachers.',                'Adopt or feed stray dogs. Donate blankets to those in need.'],
    [true,  'Spiritual Healer',    'Spiritual defeat of enemies and extraordinary healing abilities from past lives. Health is protected by invisible forces. Service is your gift.',                     'Use your healing gifts in service — Ketu here has given you abilities beyond ordinary understanding.','Feed dogs daily. Keep a cat\'s eye stone for protection.'],
    [false, 'Karmic Marriage',     'Karmic marriage with a spiritual or unconventional spouse. Deep past-life connection is the foundation. The relationship is transformative for both.',                'Approach your karmic relationship with acceptance, wisdom, and spiritual maturity.',                 'Feed dogs daily. Donate spotted or multi-coloured items on Tuesdays.'],
    [false, 'Past Life Gifts',     'Deep occult knowledge carried from past lives. Health sensitivity with sudden onset and resolution. Transformation comes through surrendering control.',              'Trust the transformation process — Ketu here strips away what no longer serves your highest good.',  'Keep a cat\'s eye stone. Feed dogs on Tuesdays.'],
    [true,  'Liberation Path',     'Strongly spiritual past life with accumulated wisdom. Detachment from conventional religion leads to genuine mystical experience. Moksha energy.',                    'Trust your unorthodox spiritual path — it leads more directly to truth than convention.',            'Respect all saints and spiritual masters. Feed dogs daily.'],
    [false, 'Detached Career',     'Unconventional and spiritual career path. Past-life professional karma plays out in this life. Work carries a sense of karmic completion.',                           'Do your professional work as a spiritual practice, without attachment to outcomes.',                 'Feed dogs near your workplace. Keep a cat\'s eye stone at your desk.'],
    [false, 'Sudden Gains',        'Unexpected and sudden gains that arrive and disappear. Spiritual and detached relationship with income. Networking comes naturally but is transient.',                'Create material stability through discipline, as gains here are unpredictable by nature.',           'Feed dogs regularly. Donate spotted cloth on Tuesdays.'],
    [true,  'Moksha Energy',       'The most spiritual placement — Ketu in the 12th is the natural house of liberation. Foreign spiritual retreats bring profound transformation.',                       'Embrace solitude, meditation, and inner exploration — you are on the path to liberation.',           'Feed dogs. Meditate daily. Donate blankets to spiritual seekers.'],
  ],
};

// ── Rin (Ancestral Debt) rules ─────────────────────────────────────────────────
const RIN_RULES = [
  {
    id: 'pitru',    name: 'Pitru Rin',     hindiName: 'पितृ ऋण',
    planet: 'Sun',  badHouses: new Set([2,6,8,12]),
    desc: 'Debt owed to the paternal lineage and ancestors. Indicated when the Sun is in a challenging position.',
    cause: 'Past life disrespect toward father, ancestors, or authority figures. Unfulfilled duties toward the paternal family.',
    remedy: 'Perform Pitru Paksha rituals (Shraddha). Feed crows during Pitru Paksha. Donate food to Brahmins on your father\'s behalf. Light a lamp on ancestors\' death anniversaries.',
  },
  {
    id: 'matru',    name: 'Matru Rin',     hindiName: 'मातृ ऋण',
    planet: 'Moon', badHouses: new Set([6,8,12]),
    desc: 'Debt owed to the maternal lineage and the divine feminine. Indicated when the Moon is afflicted.',
    cause: 'Past life disrespect toward mother, women, or maternal relatives. Neglect of nurturing responsibilities.',
    remedy: 'Serve your mother wholeheartedly. Donate silver or white items to women. Feed and clothe poor women and girls. Keep a fast on Mondays.',
  },
  {
    id: 'dev',      name: 'Dev Rin',       hindiName: 'देव ऋण',
    planet: 'Jupiter', badHouses: new Set([6,8,12]),
    desc: 'Debt owed to teachers, divine forces, and the universe. Indicated when Jupiter is in a challenging position.',
    cause: 'Disrespect toward teachers and gurus in past or present lives. Broken religious vows or promises to the divine.',
    remedy: 'Respect all teachers and gurus. Donate to temples and religious causes. Keep your word and honour all vows. Perform Vishnu puja regularly.',
  },
  {
    id: 'stri',     name: 'Stri Rin',      hindiName: 'स्त्री ऋण',
    planet: 'Venus', badHouses: new Set([6,8,12]),
    desc: 'Debt owed to women — wife, sister, mother, or women in general. Indicated when Venus is in a challenging position.',
    cause: 'Mistreatment, disrespect, or exploitation of women in past or present lives.',
    remedy: 'Serve and respect all women in your life. Donate to women\'s causes. Gift silver items to your spouse. Support women\'s education and welfare.',
  },
  {
    id: 'bhai',     name: 'Bhai Rin',      hindiName: 'भाई ऋण',
    planet: 'Mars',  badHouses: new Set([6,8,12]),
    desc: 'Debt owed to brothers, land, or co-workers. Indicated when Mars is in a challenging position.',
    cause: 'Past life disputes over land and property with brothers or co-workers. Deception in land dealings.',
    remedy: 'Support and reconcile with brothers. Donate land or contribute to land charities. Plant trees. Feed animals on Tuesdays.',
  },
  {
    id: 'karma',    name: 'Karma Rin',     hindiName: 'कर्म ऋण',
    planet: 'Saturn', badHouses: new Set([1,2,4,8,12]),
    desc: 'Past life karmic debt that manifests as obstacles, delays, and lessons in this life.',
    cause: 'Accumulated karma from past life actions — particularly misuse of power, laziness, or exploitation of the weak.',
    remedy: 'Perform selfless service (seva). Donate to the poor and underprivileged. Feed crows and dogs. Keep Saturdays as a day of discipline and service.',
  },
];

// ── Detect Rin ─────────────────────────────────────────────────────────────────
function detectRin(planets) {
  const found = [];
  for (const rule of RIN_RULES) {
    const p = planets[rule.planet];
    if (!p) continue;
    // house is 1-indexed
    if (rule.badHouses.has(p.house)) {
      found.push({
        ...rule,
        badHouses: undefined,
        planetHouse: p.house,
        planetSign:  p.sign,
      });
    }
  }
  return found;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const PLANET_ORDER = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];

function buildPlanetAnalysis(pp, lagnaIdx) {
  return PLANET_ORDER.map(planet => {
    const pos = pp[planet];
    if (!pos) return null;

    const house = ((pos.sign_index - lagnaIdx + 12) % 12) + 1;
    const effect = EFFECTS[planet]?.[house];
    const meta   = PLANET_META[planet];

    return {
      planet,
      house,
      sign:      pos.sign,
      degree:    pos.sign_degree,
      retrograde: pos.retrograde || false,
      symbol:    meta.symbol,
      color:     meta.color,
      ruler:     meta.ruler,
      hindiName: meta.hindiName,
      good:      effect ? effect[0] : true,
      title:     effect ? effect[1] : `${planet} in House ${house}`,
      summary:   effect ? effect[2] : 'Analysis not available.',
      advice:    effect ? effect[3] : '',
      remedy:    effect ? effect[4] : '',
    };
  }).filter(Boolean);
}

// ── Controller ─────────────────────────────────────────────────────────────────
async function analyse(req, res) {
  try {
    const { dob, tob, lat, lng } = req.body;
    if (!dob || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'dob, lat, lng are required' });
    }

    const chart = await calculateKundali(dob, tob || '12:00', parseFloat(lat), parseFloat(lng), 5.5);
    const pp    = chart.planetary_positions;
    const lagnaIdx = chart.lagna_sign_index;

    const planets  = buildPlanetAnalysis(pp, lagnaIdx);

    // Attach house to each planet for Rin detection
    const ppWithHouse = {};
    for (const p of planets) {
      ppWithHouse[p.planet] = { ...pp[p.planet], house: p.house };
    }

    const rin = detectRin(ppWithHouse);

    const goodCount = planets.filter(p => p.good).length;

    res.json({
      lagna:     chart.lagna,
      lagnaIdx,
      moonSign:  chart.moon_sign,
      sunSign:   chart.sun_sign,
      nakshatra: chart.nakshatra,
      dob,
      planets,
      rin,
      goodCount,
      totalPlanets: planets.length,
      overallTone: goodCount >= 6 ? 'Predominantly Favourable'
                 : goodCount >= 4 ? 'Mixed — Balanced Chart'
                 : 'Challenging — Remedies Strongly Recommended',
    });
  } catch (err) {
    console.error('[LalKitab]', err.message);
    res.status(400).json({ error: err.message || 'Analysis failed' });
  }
}

module.exports = { analyse };
