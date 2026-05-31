'use strict';

const PDFDocument = require('pdfkit');
const { getKundaliInterpretation } = require('./interpretationEngine');
const { NAKSHATRA_ATTRIBUTES, LUCKY_FACTORS, GRAHA_BHAVA_HINDI } = require('./hindiContent');
const { LAGNA_LIFE_EN, MOON_DOMAIN_EN, PLANET_CAREER_EN, PLANET_VITTA_EN, PLANET_VIDYA_EN } = require('./pdfEnglishContent');

const PLANET_ORDER = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];

function bufferFromDoc(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}

// ─── COLOURS ────────────────────────────────────────────────────────────────
const GOLD   = '#C9A84C';
const DARK   = '#1A1A2E';
const GREY   = '#555555';
const LGREY  = '#999999';
const WHITE  = '#FFFFFF';
const LIGHT  = '#F5F0E8';
const ACCENT = '#8B5CF6';
const CREAM  = '#FBF8F2';

// ─── LAYOUT HELPERS ──────────────────────────────────────────────────────────

function drawHeader(doc, title, subtitle) {
  doc.rect(0, 0, doc.page.width, 80).fill(DARK);
  doc.fontSize(22).fillColor(GOLD).font('Helvetica-Bold')
     .text('AstroVyoma', 40, 18);
  doc.fontSize(10).fillColor(LGREY).font('Helvetica')
     .text('Vedic Astrology — Jyotisha Engine', 40, 44);
  doc.fontSize(16).fillColor(WHITE).font('Helvetica-Bold')
     .text(title, 0, 22, { align: 'right', width: doc.page.width - 40 });
  doc.fontSize(9).fillColor(LGREY).font('Helvetica')
     .text(subtitle, 0, 44, { align: 'right', width: doc.page.width - 40 });
  doc.y = 100;
}

// FIX: text is drawn INSIDE the dark strip, doc.y is explicitly placed past it
function sectionTitle(doc, text) {
  doc.moveDown(0.4);
  const sy = doc.y;
  if (sy > doc.page.height - 100) {
    doc.addPage();
    doc.y = 40;
  }
  const stripY = doc.y;
  doc.rect(40, stripY, doc.page.width - 80, 24).fill(DARK);
  doc.fillColor(GOLD).fontSize(10.5).font('Helvetica-Bold')
     .text(text, 52, stripY + 7, { width: doc.page.width - 110, lineBreak: false });
  doc.y = stripY + 30;
}

function infoRow(doc, label, value, y) {
  doc.fontSize(9).fillColor(LGREY).font('Helvetica').text(label, 50, y, { width: 165 });
  doc.fontSize(9).fillColor(DARK).font('Helvetica-Bold').text(String(value || '—'), 220, y, { width: doc.page.width - 270 });
}

function tableHeader(doc, cols, widths, y) {
  let x = 40;
  doc.rect(40, y - 4, doc.page.width - 80, 18).fill('#E8E0D0');
  for (let i = 0; i < cols.length; i++) {
    doc.fontSize(8).fillColor(DARK).font('Helvetica-Bold').text(cols[i], x + 4, y, { width: widths[i] - 6, lineBreak: false });
    x += widths[i];
  }
  return y + 16;
}

function tableRow(doc, cells, widths, y, shade) {
  if (shade) doc.rect(40, y - 3, doc.page.width - 80, 14).fill('#FAF7F0');
  let x = 40;
  for (let i = 0; i < cells.length; i++) {
    doc.fontSize(8).fillColor(DARK).font('Helvetica').text(String(cells[i] || '—'), x + 4, y, { width: widths[i] - 6, lineBreak: false });
    x += widths[i];
  }
  return y + 14;
}

// Wrap long text inside a light-background box
function readingBlock(doc, text, color) {
  if (!text) return;
  const textH = doc.heightOfString(text, { width: doc.page.width - 130, fontSize: 9 });
  const totalH = textH + 16;
  checkPage(doc, totalH + 14);
  doc.rect(50, doc.y, doc.page.width - 100, 6).fill(CREAM); // spacer
  doc.y += 2;
  const blockY = doc.y;
  doc.rect(50, blockY, doc.page.width - 100, totalH).fill(CREAM);
  doc.fillColor(color || DARK).fontSize(9).font('Helvetica')
     .text(text, 62, blockY + 8, { width: doc.page.width - 130 });
  doc.y = blockY + totalH + 4;
}

function readingPair(doc, label, text) {
  if (!text) return;
  doc.moveDown(0.25);
  doc.fillColor(GOLD).fontSize(9).font('Helvetica-Bold').text(label + ':', 50, doc.y);
  doc.moveDown(0.1);
  readingBlock(doc, text, DARK);
}

function checkPage(doc, needed) {
  if (doc.y + needed > doc.page.height - 60) {
    doc.addPage();
    doc.y = 40;
  }
}

// Only add a page if the current page has real content (prevents double-blank-pages
// when checkPage/sectionTitle already added a fresh page at end of previous section)
function newSectionPage(doc) {
  if (doc.y > 110) doc.addPage();
}

function bulletList(doc, items) {
  for (const item of items) {
    checkPage(doc, 20);
    const bY = doc.y;
    doc.fillColor(GOLD).fontSize(9).font('Helvetica-Bold').text('•', 48, bY);
    doc.fillColor(DARK).fontSize(8.5).font('Helvetica').text(item, 58, bY, { width: doc.page.width - 108 });
    doc.moveDown(0.3);
  }
}

// ─── ENGLISH COVER PAGE ───────────────────────────────────────────────────────
function drawEnglishCoverPage(doc, name, birthInfo, data) {
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(DARK);
  doc.rect(0, 0, doc.page.width, 6).fill(GOLD);

  doc.fontSize(32).fillColor(GOLD).font('Helvetica-Bold')
     .text('AstroVyoma', 0, 60, { align: 'center', width: doc.page.width });
  doc.fontSize(11).fillColor(LGREY).font('Helvetica')
     .text('Vedic Astrology — Jyotisha Engine', 0, 102, { align: 'center', width: doc.page.width });

  doc.rect(doc.page.width / 2 - 80, 125, 160, 1).fill(GOLD);

  doc.fontSize(20).fillColor('#FFFFFF').font('Helvetica-Bold')
     .text('Janma Kundali', 0, 145, { align: 'center', width: doc.page.width });
  doc.fontSize(13).fillColor(GOLD).font('Helvetica-Bold')
     .text('Complete Vedic Birth Chart Report', 0, 175, { align: 'center', width: doc.page.width });

  // OM symbol approximation
  doc.fontSize(56).fillColor(GOLD).font('Helvetica')
     .text('OM', 0, 210, { align: 'center', width: doc.page.width });

  // Name box
  const nameBoxY = 295;
  doc.roundedRect(80, nameBoxY, doc.page.width - 160, 85, 6)
     .lineWidth(1).strokeColor(GOLD).stroke();
  doc.fontSize(9).fillColor(LGREY).font('Helvetica')
     .text('Prepared for', 0, nameBoxY + 10, { align: 'center', width: doc.page.width });
  doc.fontSize(18).fillColor('#FFFFFF').font('Helvetica-Bold')
     .text(name || '—', 0, nameBoxY + 26, { align: 'center', width: doc.page.width });
  doc.fontSize(9).fillColor(LGREY).font('Helvetica')
     .text(`${birthInfo.dob || ''}  |  ${birthInfo.birth_time || ''}  |  ${birthInfo.birth_place || ''}`,
           0, nameBoxY + 58, { align: 'center', width: doc.page.width });

  // Key placements
  const kY = 415;
  doc.roundedRect(80, kY, doc.page.width - 160, 110, 6)
     .lineWidth(0.5).strokeColor('#3A3A5E').stroke();
  const placements = [
    ['Ascendant (Lagna)', data.lagna || '—'],
    ['Moon Sign (Rashi)',  data.moon_sign || '—'],
    ['Sun Sign',           data.sun_sign || '—'],
    ['Janma Nakshatra',   data.nakshatra || '—'],
  ];
  const cw = (doc.page.width - 160) / 2;
  placements.forEach(([label, val], i) => {
    const tx = 100 + (i % 2) * cw;
    const ty = kY + 14 + Math.floor(i / 2) * 46;
    doc.fontSize(8).fillColor(LGREY).font('Helvetica').text(label, tx, ty, { width: cw - 20 });
    doc.fontSize(14).fillColor(GOLD).font('Helvetica-Bold').text(val, tx, ty + 14, { width: cw - 20 });
  });

  const fY = doc.page.height - 90;
  doc.rect(0, fY, doc.page.width, 1).fill('#2A2A4E');
  doc.fontSize(7.5).fillColor(LGREY).font('Helvetica')
     .text('Lahiri Ayanamsha | Swiss Ephemeris | Parashari System', 0, fY + 12, { align: 'center', width: doc.page.width });
  doc.fontSize(7.5).fillColor(LGREY).font('Helvetica')
     .text(`Generated: ${new Date().toLocaleDateString('en-IN')}  |  AstroVyoma Vedic Astrology`, 0, fY + 28, { align: 'center', width: doc.page.width });

  doc.rect(0, doc.page.height - 6, doc.page.width, 6).fill(GOLD);
}

// ─── DOSHA COMPUTE FUNCTIONS ──────────────────────────────────────────────────
function computeMangalDoshaEn(data) {
  const mars = (data.planetary_positions || {})['Mars'];
  if (!mars) return false;
  return [1, 4, 7, 8, 12].includes(parseInt(mars.house));
}

function computeKalsarpEn(data) {
  const pp = data.planetary_positions || {};
  const rahu = pp['Rahu'], ketu = pp['Ketu'];
  if (!rahu || !ketu) return 'absent';
  const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const rahuIdx = SIGNS.indexOf(rahu.sign), ketuIdx = SIGNS.indexOf(ketu.sign);
  if (rahuIdx < 0 || ketuIdx < 0) return 'absent';
  const main = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
  let allBetween = true, allReverse = true;
  for (const pn of main) {
    const pos = pp[pn]; if (!pos) continue;
    const pIdx = SIGNS.indexOf(pos.sign); if (pIdx < 0) continue;
    let inArc = false, idx = rahuIdx;
    while (idx !== ketuIdx) { if (idx === pIdx) { inArc = true; break; } idx = (idx + 1) % 12; }
    if (!inArc) allBetween = false;
    let inRev = false; idx = ketuIdx;
    while (idx !== rahuIdx) { if (idx === pIdx) { inRev = true; break; } idx = (idx + 1) % 12; }
    if (!inRev) allReverse = false;
  }
  if (allBetween) return 'dosha';
  if (allReverse) return 'yoga';
  return 'absent';
}

function computeSadeSatiEn(data) {
  const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const now = new Date(); const yr = now.getFullYear() + now.getMonth() / 12;
  let saturnSign = yr >= 2025.41 && yr < 2028.33 ? 'Aries' : yr >= 2023.18 ? 'Pisces' : 'Aries';
  const moonSign = data.moon_sign; if (!moonSign) return null;
  const satIdx = SIGNS.indexOf(saturnSign), moonIdx = SIGNS.indexOf(moonSign);
  if (satIdx < 0 || moonIdx < 0) return null;
  const diff = ((satIdx - moonIdx) + 12) % 12;
  if (diff === 11) return { active: true, phase: 'Rising Phase (First 2.5 yrs)', saturnSign };
  if (diff === 0)  return { active: true, phase: 'Peak Phase (Middle 2.5 yrs)', saturnSign };
  if (diff === 1)  return { active: true, phase: 'Setting Phase (Last 2.5 yrs)', saturnSign };
  if (diff === 3 || diff === 7) return { active: false, dhaiya: true, saturnSign };
  return { active: false, saturnSign };
}

const MANGAL_DOSHA_EN = {
  present: {
    title: 'Mangal Dosha (Kuja Dosha) — PRESENT',
    desc: 'Your birth chart has Mangal Dosha (also called Kuja Dosha). This occurs when Mars is placed in houses 1, 4, 7, 8, or 12 from the Ascendant. It can affect marriage timing and marital harmony. The dosha is neutralized if both partners have it.',
    effects: 'Possible delays in marriage, friction in marital relationships, or health concerns for the spouse. Channeling Mars energy constructively through discipline and physical activity is advised.',
    remedies: [
      'Recite Hanuman Chalisa on Tuesdays and offer red flowers.',
      'Wear a Red Coral (Moonga) gemstone — only after consulting a qualified astrologer.',
      'Marry a person who also has Mangal Dosha — they cancel each other.',
      'Perform Kumbh Vivah (symbolic marriage with a peepal/banana tree) as advised by a priest.',
      'Fast on Tuesdays and worship at a Mangal Nath temple.',
    ]
  },
  absent: {
    title: 'Mangal Dosha — NOT PRESENT',
    desc: 'Your birth chart does not have Mangal Dosha. Mars is not placed in houses 1, 4, 7, 8, or 12. No special Mars-related affliction is expected in marital matters.',
  }
};

const KALSARP_EN = {
  dosha: {
    title: 'Kalsarp Dosha — PRESENT',
    desc: 'Your chart has Kalsarp Dosha — all seven classical planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn) are hemispherically enclosed between Rahu and Ketu. This can bring life struggles, unexpected obstacles, and karmic burdens from past lives.',
    effects: 'Unexpected setbacks, delays in success, fear of water or serpents, and karmic challenges. However, in some charts this same yoga produces extraordinary single-minded achievement.',
    remedies: [
      'Perform Nag Panchami puja and offer milk to serpents.',
      'Arrange a Kalsarp Shanti puja at Trimbakeshwar (Nasik).',
      'Chant "Om Rahave Namah" and "Om Ketave Namah" 108 times daily.',
      'Float a silver serpent idol in flowing water.',
      'Offer water to a Peepal tree every Saturday.',
    ]
  },
  yoga: {
    title: 'Kalsarp Yoga — PRESENT',
    desc: 'Your chart has Kalsarp Yoga — planets are in the arc from Ketu to Rahu. This yoga of intense focus can produce extraordinary ambition and achievement when directed with purpose.',
  },
  absent: {
    title: 'Kalsarp Dosha — NOT PRESENT',
    desc: 'Your birth chart does not have Kalsarp Dosha. All planets are not hemispherically enclosed between Rahu and Ketu. This is a positive indicator.',
  }
};

const SADE_SATI_EN = {
  description: 'Sade Sati (Saturn\'s 7.5-year transit) occurs when Saturn transits through the 12th, 1st, and 2nd houses from the natal Moon sign — roughly 2.5 years in each sign. It is a period of significant transformation, testing, and reconstruction in life.',
  phases: {
    rising:  { name: 'Rising Phase', desc: 'Saturn transits the 12th house from natal Moon. Mental anxiety, family concerns, and financial stress may arise. Focus on health.' },
    peak:    { name: 'Peak Phase',   desc: 'Saturn directly transits the natal Moon sign — the most intense phase. Hard work, major decisions, and life turns are common. Patience is key.' },
    setting: { name: 'Setting Phase', desc: 'Saturn transits the 2nd house from natal Moon. Situations gradually improve. The fruits of effort during Sade Sati begin to manifest.' },
  },
  remedies: [
    'Offer sesame oil at a Shani temple every Saturday and recite Shani Stotra.',
    'Donate black sesame seeds, mustard oil, and dark clothing on Saturdays.',
    'Recite Hanuman Chalisa daily — Hanuman pacifies Saturn\'s influence.',
    'Chant Shani mantra "Om Sham Shanaischaraya Namah" 108 times.',
    'Feed the poor, donate shoes, clothes, and food — Saturn is pleased by service.',
  ],
};

// ─── LUCKY FACTORS ENGLISH ───────────────────────────────────────────────────
function drawLuckyFactorsEn(doc, nakshatra) {
  const lf = LUCKY_FACTORS[nakshatra];
  if (!lf) return;
  checkPage(doc, 130);
  sectionTitle(doc, 'Lucky & Unlucky Factors');
  const startY = doc.y;
  const W = doc.page.width - 80;
  doc.roundedRect(40, startY, W, 118, 4).fill('#FEF9EE');

  const col1X = 48, col2X = 48 + W / 2;
  const rows = [
    ['Lucky Numbers',   lf.numbers || '—'],
    ['Unlucky Numbers', lf.unlucky || '—'],
    ['Lucky Days',      lf.days    || '—'],
    ['Lucky Metal',     lf.dhatu   || '—'],
    ['Lucky Gemstone',  lf.ratna   || '—'],
    ['Lucky Color',     lf.rang    || '—'],
  ];
  const half = Math.ceil(rows.length / 2);
  for (let i = 0; i < rows.length; i++) {
    const x = i < half ? col1X : col2X;
    const y = startY + 10 + (i % half) * 19;
    doc.fontSize(7.5).fillColor(LGREY).font('Helvetica').text(rows[i][0], x, y, { width: W / 2 - 10 });
    doc.fontSize(8.5).fillColor(DARK).font('Helvetica-Bold').text(rows[i][1], x + 95, y, { width: W / 2 - 100 });
  }
  doc.fontSize(7.5).fillColor(LGREY).font('Helvetica').text('Name Letters (Namaakshar)', col1X, startY + 100, { width: 95 });
  doc.fontSize(8.5).fillColor(DARK).font('Helvetica-Bold').text(lf.akshar || '—', col1X + 95, startY + 100, { width: W - 100 });
  doc.y = startY + 128;
}

// English planet-in-house readings (concise translations)
const GRAHA_BHAVA_EN = {
  Sun: {
    1:'Sun in 1st House — You have a radiant, self-assured personality with natural leadership. Government and authority roles suit you well. Your father plays a significant role in life. Health is generally robust but guard against eye strain and headaches.',
    2:'Sun in 2nd House — Your voice is commanding and confident. You hold leadership in family. Earning potential is strong but watch ego-driven financial decisions. Paternal wealth or status benefits you.',
    3:'Sun in 3rd House — Courage, initiative, and strong communication define you. Siblings may be competitive. Writing, media, and travel bring success.',
    4:'Sun in 4th House — Home, land, and mother carry deep significance. Real estate gains are possible. Guard against heart-related issues and seek mental calm in nature.',
    5:'Sun in 5th House — Remarkable intellect and creativity. Children may be talented. Romance is dramatic and passionate. Politics and higher education bring recognition.',
    6:'Sun in 6th House — Victory over enemies and competitors. Government or health-service careers suit you. Immunity is good; watch blood pressure and bile disorders.',
    7:'Sun in 7th House — Spouse is dynamic and proud. Government connections benefit business. Marriage may involve ego clashes — mutual respect is essential.',
    8:'Sun in 8th House — Life holds unexpected transformations. Occult and research interest you. Father relations can be tense. Regular health check-ups are advised.',
    9:'Sun in 9th House — Very auspicious. Fortune, religion, and higher education are blessed. Father gives spiritual guidance. Pilgrimages and travel abroad bring elevation.',
    10:'Sun in 10th House — Exceptional for career. High rank, fame, and government favor. Born leader and statesman. You shine like the sun in your profession.',
    11:'Sun in 11th House — Multiple income streams and abundant gains. Powerful and influential friends. Desires are fulfilled. Elder siblings support your aspirations.',
    12:'Sun in 12th House — Success and recognition abroad. Spending tendencies are high. Spiritual pursuits and meditation offer strength. Foreign residence possible.',
  },
  Moon: {
    1:'Moon in 1st House — Emotional, receptive, and popular personality. Mother is the most important figure. Moods fluctuate with lunar cycles. Public life and mass appeal are strong.',
    2:'Moon in 2nd House — Sweet and melodious voice. Family from maternal side is supportive financially. Interest in food, cuisine, and arts. Income fluctuates.',
    3:'Moon in 3rd House — Communication, short travels, and writing are favored. Special bond with sister. Restless mind finds peace in short trips and creative expression.',
    4:'Moon in 4th House — Exalted position — very auspicious. Deep love for mother. Comfortable home life and property gains. Emotional security through family.',
    5:'Moon in 5th House — Romantic, creative, and deeply nurturing toward children. Emotionally invested in love relationships. Intuitive intelligence.',
    6:'Moon in 6th House — Digestive and emotional issues possible. Service-oriented professions suit. Mother\'s health may be a concern.',
    7:'Moon in 7th House — Spouse is nurturing and attractive. Public relations and business with masses bring success. Emotional depth in marriage.',
    8:'Moon in 8th House — Deep emotional undercurrents. Interest in the occult and psychology. Mood swings and occasional depression need management.',
    9:'Moon in 9th House — Deeply spiritual and religious. Pilgrimages are meaningful. Mother is pious. Luck comes from abroad or higher education.',
    10:'Moon in 10th House — Public popularity and career advancement. Career may involve frequent changes. Mother influences professional path. Fame with masses.',
    11:'Moon in 11th House — Many friends and active social life. Desires fulfilled. Gains from mother or women. Social networks are rewarding.',
    12:'Moon in 12th House — Inner peace in solitude. Vivid dreams. Foreign travel or residence likely. Spiritual inclinations strong. Control expenditure.',
  },
  Mars: {
    1:'Mars in 1st House — Bold, energetic, and direct. Natural warrior energy. Control anger and impulsiveness. Physically strong with a penetrating gaze.',
    2:'Mars in 2nd House — Speech is blunt and forceful. Family may involve disputes. Strong earning drive but financial risks from impulsiveness.',
    3:'Mars in 3rd House — Most auspicious Mars placement. Remarkable courage, valour, and sibling support. Success in sports, military, police, and technology.',
    4:'Mars in 4th House — Domestic friction possible. Engineering and construction careers suit. Guard against accidents with vehicles and fire at home.',
    5:'Mars in 5th House — Sharp, action-oriented intellect. Passionate romancer. Children are energetic. Caution needed in speculation and stock trading.',
    6:'Mars in 6th House — Victory over rivals and competitors. Surgery, military, and healthcare careers excel. Strong immunity. Wins legal battles.',
    7:'Mars in 7th House — Spouse is bold and occasionally aggressive. Marital tensions possible. Business partners may clash. Success in legal matters.',
    8:'Mars in 8th House — Risk of accidents or surgery — exercise caution. Deep interest in occult and research. Long life with periodic crises.',
    9:'Mars in 9th House — Active in religious and legal causes. Father relations can be tense. Adventurous higher education. Fights for dharma.',
    10:'Mars in 10th House — Career through courage and action. Excellence in army, police, engineering, surgery. Reaches high position. Occasional government conflict.',
    11:'Mars in 11th House — Bold, powerful friends. Multiple income sources. Elder siblings assist. Gains from technical fields.',
    12:'Mars in 12th House — Success abroad. Covert operations and research suit. High expenditure — budget carefully. Hospitals and foreign lands prominent.',
  },
  Mercury: {
    1:'Mercury in 1st House — Intelligent, articulate, and multi-talented. Natural communicator and writer. Youthful appearance. Versatile business acumen.',
    2:'Mercury in 2nd House — Eloquent and persuasive speech. Business acumen in commerce and trade. Earns through intellect. Scholarly family environment.',
    3:'Mercury in 3rd House — Outstanding in writing, journalism, and communication. Sibling intellectual bonding. Rapid travel and multi-tasking.',
    4:'Mercury in 4th House — Educated, wise mother. Home filled with books and intellectual atmosphere. Technical skills in real estate and vehicles.',
    5:'Mercury in 5th House — Brilliant mind, math aptitude, creative writing. Intelligent children. Seeks intellectual parity in romance. Business acumen in markets.',
    6:'Mercury in 6th House — Analytical in health-care, law, and accounting. Defeats rivals with wit. Digestive and nervous system need attention.',
    7:'Mercury in 7th House — Intelligent spouse. Success in trade partnerships and legal commerce. Intellectual compatibility in marriage essential.',
    8:'Mercury in 8th House — Deep interest in occult, astrology, and research. Works well with others\' assets and insurance. Cryptic and layered communication.',
    9:'Mercury in 9th House — Love of philosophy, religion, and higher learning. Gains from guru or mentor. Publishing and teaching careers shine.',
    10:'Mercury in 10th House — Career through communication, business, writing, IT, or media. Manages multiple roles simultaneously.',
    11:'Mercury in 11th House — Intelligent, helpful friends. Income from business and intellect. New technology brings gains.',
    12:'Mercury in 12th House — Interest in secret writing and spiritual texts. Gains from foreign languages. Anxious mind — yoga and meditation advised.',
  },
  Jupiter: {
    1:'Jupiter in 1st House — Highly auspicious. Wise, generous, religious, and blessed. Society respects you. Naturally guides and mentors others. Physically healthy.',
    2:'Jupiter in 2nd House — Melodious, knowledge-rich speech. Educated family. Wealth accumulates steadily. Family is learned and dharmic.',
    3:'Jupiter in 3rd House — Sibling cooperation and love of teaching. Writing is philosophical and meaningful. Auspicious travels with learning.',
    4:'Jupiter in 4th House — Happy, prosperous home. Wise, religious mother. Property gains. Peace of mind and connection to educational institutions.',
    5:'Jupiter in 5th House — Exceptional mind and blessed children. Pure and elevating love life. Academic success. Investments yield good returns.',
    6:'Jupiter in 6th House — Protection from illness. Moral victory over enemies. Interest in healing arts. Debts cleared gradually.',
    7:'Jupiter in 7th House — Excellent for marriage — spouse is wise, spiritual, and supportive. Business gains through partnerships. Public goodwill.',
    8:'Jupiter in 8th House — Long life. Interest in occult and hidden knowledge. Inheritance likely. Grace of guru helps through crises.',
    9:'Jupiter in 9th House — One of Jupiter\'s best placements. Religion, fortune, and higher education are greatly blessed. Guru\'s blessings always present.',
    10:'Jupiter in 10th House — High career position, honors, and government goodwill. Respected in teaching, judiciary, or religious fields.',
    11:'Jupiter in 11th House — Abundant gains, noble friends, and desires fulfilled. Elder sibling or mentor assists. Religious organizations are rewarding.',
    12:'Jupiter in 12th House — Generous spending on charity and dharma. Success abroad and foreign educational ties. Spiritually inclined toward moksha.',
  },
  Venus: {
    1:'Venus in 1st House — Beautiful, charming, and artistic. Personality radiates grace and warmth. Love of aesthetics and luxury. Natural magnetism.',
    2:'Venus in 2nd House — Sweet, loving voice. Artistic family. Accumulates jewelry, art, and wealth. Enjoys fine food and cultural pleasures.',
    3:'Venus in 3rd House — Skilled in arts, music, and creative writing. Sister is supportive. Travel brings romance and beauty.',
    4:'Venus in 4th House — Beautiful, comfortable home. Loving, artistic mother. Property gains. Enjoys vehicle comforts.',
    5:'Venus in 5th House — Very active, romantic love life. Exceptional artistic talent in music, dance, or visual arts. Children are beautiful and creative.',
    6:'Venus in 6th House — Beauty industry and health-care careers suit. Wins rivals through charm. Guard kidneys and skin.',
    7:'Venus in 7th House — Excellent for marriage — beautiful and loving spouse. Business partnerships thrive. Love marriage likely.',
    8:'Venus in 8th House — Gains through spouse\'s wealth. Intense romantic experiences. Interest in esoteric arts. Longevity.',
    9:'Venus in 9th House — Beautiful fusion of spirituality and art. Meaningful pilgrimages. Fine arts higher education.',
    10:'Venus in 10th House — Career in arts, fashion, entertainment, or beauty industry. Fame and public adoration. Women support career.',
    11:'Venus in 11th House — Gains, loving friends, desires fulfilled. Older sister assists. Income from fashion, arts, or entertainment.',
    12:'Venus in 12th House — Secret romantic relationships possible. Pleasures and luxury abroad. Spiritual art and meditation bring joy.',
  },
  Saturn: {
    1:'Saturn in 1st House — Serious, ambitious, and disciplined. Life involves tough lessons but steady progress. Slim build. Personality matures beautifully with age.',
    2:'Saturn in 2nd House — Heavy family responsibilities. Speech is slow and measured. Wealth accumulates gradually. Disciplined savings and investments.',
    3:'Saturn in 3rd House — Complex sibling dynamics. Travel involves delays. Writing is deep and philosophical. Perseverance wins through.',
    4:'Saturn in 4th House — Domestic difficulties and distance from mother. Property acquired slowly. Home happiness improves with age.',
    5:'Saturn in 5th House — Delayed children or fewer children. Deep philosophical intellect. Cautious in romance and investments.',
    6:'Saturn in 6th House — Auspicious — slow but sure victory over rivals. Industrious, healthy through discipline. Service and labor-oriented livelihood.',
    7:'Saturn in 7th House — Late marriage or older spouse. Marital life is dutiful and serious. Business partnerships need careful vetting.',
    8:'Saturn in 8th House — Long life likely. Life holds mysterious turns and transformations. Interest in research, mining, and hidden subjects.',
    9:'Saturn in 9th House — Skepticism toward conventional religion. Higher education is earned through struggle. Foreign travel delayed.',
    10:'Saturn in 10th House — Career built through hard work; recognition grows with age. Connected to government and law. High position achieved eventually.',
    11:'Saturn in 11th House — Auspicious — gradual wealth accumulation. Older or mature friends assist. Long-term efforts fulfill goals.',
    12:'Saturn in 12th House — Peace in solitude. Seeks spiritual liberation. Foreign residence possible. Control expenditure carefully.',
  },
  Rahu: {
    1:'Rahu in 1st House — Extraordinary ambition and desire for unique identity. Mysterious persona with foreign appeal. Sudden health fluctuations possible.',
    2:'Rahu in 2nd House — Unconventional speech and sometimes harsh words. Complex family dynamics. Earns through unusual or non-traditional means.',
    3:'Rahu in 3rd House — Exceptional in media, digital technology, and communications. Complex sibling bonds. Frequent, unexpected travel.',
    4:'Rahu in 4th House — Domestic restlessness. Foreign cultural influences in home. Land and property matters may be complex.',
    5:'Rahu in 5th House — Unconventional, original thinking. Complex romantic situations. Creative output is highly original and unique.',
    6:'Rahu in 6th House — Auspicious — outsmarts rivals. Health crises arise suddenly but resolve. Guard against exotic or unusual illnesses.',
    7:'Rahu in 7th House — Foreign or cross-cultural spouse. Delays in marriage. Unconventional business partners. Avoid extramarital entanglements.',
    8:'Rahu in 8th House — Deep interest in occult, tantra, and esoteric arts. Sudden life changes. Inheritance possible. Accident risks.',
    9:'Rahu in 9th House — Unconventional or rebellious religious views. Foreign education and international connections. Fortune can shift suddenly.',
    10:'Rahu in 10th House — Extraordinary career rise possible in unconventional fields. Fame in politics and media but controversy may follow.',
    11:'Rahu in 11th House — Unconventional income sources. Diverse friend circles. Sudden windfalls and losses. Large ambitions.',
    12:'Rahu in 12th House — Extended foreign stay likely. Mystical and spiritual experiences. Hidden enemies possible. Sleep disturbances.',
  },
  Ketu: {
    1:'Ketu in 1st House — Spiritual, mysterious, and otherworldly personality. Past-life skills and knowledge are readily accessible. Detachment from material identity.',
    2:'Ketu in 2nd House — Unclear or silent speech. Emotional distance from family. Fluctuating finances. Spiritual spending.',
    3:'Ketu in 3rd House — Mystical writing and communication. Distance from siblings. Spiritual travel purpose. Cautious communication.',
    4:'Ketu in 4th House — Domestic restlessness and distance from mother. Spiritual home environment. Inner restlessness.',
    5:'Ketu in 5th House — Unusual, mystical intelligence. Spiritual mantra and tantra practices interest you. Complex romantic scenarios.',
    6:'Ketu in 6th House — Mysterious elimination of enemies. Unusual diseases best treated through alternative medicine. Spiritual service.',
    7:'Ketu in 7th House — Spouse is spiritual or mysterious. Marriage is complex. Business partnerships need careful oversight.',
    8:'Ketu in 8th House — Most auspicious Ketu placement. Profound occult knowledge and path toward spiritual liberation. Long life and sudden spiritual awakening.',
    9:'Ketu in 9th House — Past-life dharma and wisdom. Unconventional guru relationship. Seeks own spiritual path outside tradition.',
    10:'Ketu in 10th House — Unique and unconventional career path. May become a spiritual guide or researcher.',
    11:'Ketu in 11th House — Few but remarkable friends. Desires fulfilled suddenly. Association with spiritual groups.',
    12:'Ketu in 12th House — Best Ketu placement — moksha yoga. Spiritual liberation and foreign spiritual experiences. Past-life karma completed.',
  },
};

function computeSadeSatiLifetimeTableEn(birthYear, moonSign) {
  const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const moonIdx = SIGNS.indexOf(moonSign);
  if (moonIdx < 0) return [];

  const saturnEntries = {
    Aquarius: 2020.08, Pisces: 2023.21, Aries: 2025.41,
    Taurus: 2028.33, Gemini: 2030.79, Cancer: 2033.25,
    Leo: 2035.71, Virgo: 2038.17, Libra: 2040.63,
    Scorpio: 2043.08, Sagittarius: 2045.54, Capricorn: 2048.00,
    Aquarius2: 2050.46, Pisces2: 2052.92, Aries2: 2055.08,
  };
  const prevSign = SIGNS[(moonIdx + 11) % 12];
  const currSign = moonSign;
  const nextSign = SIGNS[(moonIdx + 1)  % 12];
  const relevantSigns = [prevSign, currSign, nextSign];
  const phaseNames = ['Rising Phase (12th from Moon)', 'Peak Phase (Moon Sign)', 'Setting Phase (2nd from Moon)'];
  const occurrences = [];

  for (const key of Object.keys(saturnEntries)) {
    const baseSign = key.replace(/\d+$/, '');
    const phaseIdx = relevantSigns.indexOf(baseSign);
    if (phaseIdx < 0) continue;
    const startYr = saturnEntries[key];
    const endYr   = startYr + 2.46;
    if (endYr < birthYear || startYr > birthYear + 100) continue;
    occurrences.push({ phase: phaseNames[phaseIdx], saturnSign: baseSign, start: `${Math.floor(startYr)}`, end: `${Math.floor(endYr)}` });
  }
  return occurrences;
}

// ─── SUMMARY PDF ─────────────────────────────────────────────────────────────

async function generateSummaryPDF(data, name, birthInfo) {
  const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
  const p = bufferFromDoc(doc);

  const pp      = data.planetary_positions || {};
  const dashas  = data.dasha_sequence || [];
  const panchang = data.panchang || {};
  const now     = new Date();
  const interp  = getKundaliInterpretation(data);
  const mangalDosha = computeMangalDoshaEn(data);
  const kalsarp     = computeKalsarpEn(data);
  const sadeSati    = computeSadeSatiEn(data);
  const naksAttr    = NAKSHATRA_ATTRIBUTES[data.nakshatra] || null;

  // ── Cover page ──────────────────────────────────────────────────────────────
  drawEnglishCoverPage(doc, name, birthInfo, data);

  // ── Page 2 ──────────────────────────────────────────────────────────────────
  doc.addPage();
  drawHeader(doc, 'Kundali Summary', 'Vedic Birth Chart — Jyotisha');

  // Birth details
  doc.roundedRect(40, doc.y, doc.page.width - 80, 100, 6).fill(LIGHT);
  const boxTop = doc.y + 10;
  infoRow(doc, 'Name',           name || '—',                                          boxTop);
  infoRow(doc, 'Date of Birth',  birthInfo.dob || '—',                                 boxTop + 16);
  infoRow(doc, 'Time of Birth',  birthInfo.birth_time || '—',                          boxTop + 32);
  infoRow(doc, 'Birth Place',    birthInfo.birth_place || '—',                         boxTop + 48);
  infoRow(doc, 'Lat / Lng',      `${parseFloat(birthInfo.lat||0).toFixed(4)}° N, ${parseFloat(birthInfo.lng||0).toFixed(4)}° E`, boxTop + 64);
  doc.y = boxTop + 108;

  sectionTitle(doc, 'CORE PLACEMENTS');
  const placements = [
    ['Ascendant (Lagna)',        data.lagna || '—'],
    ['Moon Sign (Janma Rashi)',  data.moon_sign || '—'],
    ['Sun Sign',                 data.sun_sign || '—'],
    ['Janma Nakshatra',          `${data.nakshatra || '—'} — Pada ${data.nakshatra_pada || '—'}`],
    ['Nakshatra Lord',           data.nakshatra_lord || '—'],
    ['Ayanamsha (Lahiri)',        data.ayanamsha?.dms || '—'],
  ];
  let y = doc.y;
  for (const [label, val] of placements) { infoRow(doc, label, val, y); y += 16; }
  doc.y = y + 8;

  if (naksAttr) {
    sectionTitle(doc, 'NAKSHATRA ATTRIBUTES');
    const attrY = doc.y;
    doc.roundedRect(40, attrY, doc.page.width - 80, 44, 4).fill(LIGHT);
    const hw = (doc.page.width - 80) / 3;
    const attrList = [['Varna', naksAttr.varna], ['Gana', naksAttr.gana], ['Yoni', naksAttr.yoni], ['Nadi', naksAttr.nadi], ['Vasya', naksAttr.vasya]];
    attrList.forEach(([label, val], i) => {
      const cx = 48 + (i % 3) * hw;
      const cy = attrY + 6 + Math.floor(i / 3) * 22;
      doc.fontSize(7.5).fillColor(LGREY).font('Helvetica').text(label, cx, cy, { width: hw - 8 });
      doc.fontSize(9).fillColor(DARK).font('Helvetica-Bold').text(val || '—', cx, cy + 10, { width: hw - 8 });
    });
    doc.y = attrY + 54;
  }

  sectionTitle(doc, 'PANCHANG AT BIRTH');
  const panRows = [
    ['Vaar (Weekday)',   panchang.vaar?.name || '—'],
    ['Tithi',           panchang.tithi?.name || '—'],
    ['Nakshatra',       `${panchang.nakshatra?.name || '—'} Pada ${panchang.nakshatra?.pada || '—'}`],
    ['Yoga',            panchang.yoga?.name || '—'],
    ['Karana',          panchang.karana?.name || '—'],
  ];
  y = doc.y;
  for (const [label, val] of panRows) { infoRow(doc, label, val, y); y += 16; }
  doc.y = y + 8;

  sectionTitle(doc, 'CURRENT DASHA PERIOD');
  const currentMaha  = dashas.find(d => new Date(d.start) <= now && new Date(d.end) >= now);
  const currentAntar = currentMaha?.antardashas?.find(a => new Date(a.start) <= now && new Date(a.end) >= now);
  if (currentMaha) {
    y = doc.y;
    infoRow(doc, 'Mahadasha (Major)',  `${currentMaha.planet} Dasha (${currentMaha.start} → ${currentMaha.end})`, y);
    if (currentAntar) infoRow(doc, 'Antardasha (Sub)', `${currentMaha.planet}/${currentAntar.planet} (${currentAntar.start} → ${currentAntar.end})`, y + 16);
    const bal = data.dasha_balance;
    if (bal) infoRow(doc, 'Dasha at Birth', `${bal.planet} — ${bal.remaining_years} yrs remaining`, y + 32);
    doc.y = y + 50;
  }

  sectionTitle(doc, 'PLANETARY POSITIONS');
  const cols = ['Planet','Sign','House','Deg','Nakshatra','R?'];
  const ws   = [68, 88, 44, 74, 120, 28];
  y = tableHeader(doc, cols, ws, doc.y);
  for (const [i, pName] of PLANET_ORDER.entries()) {
    const pos = pp[pName];
    if (!pos) continue;
    y = tableRow(doc, [
      pName, pos.sign, pos.house || '—',
      `${parseFloat(pos.sign_degree || 0).toFixed(2)}°`,
      `${pos.nakshatra || '—'} P${pos.nakshatra_pada || '—'}`,
      pos.retrograde ? 'R' : ''
    ], ws, y, i % 2 === 0);
    if (y > doc.page.height - 80) { doc.addPage(); drawHeader(doc, 'Planetary Positions', 'continued'); y = 110; }
  }
  doc.y = y + 10;

  // ── ASTROLOGICAL READING — the inference section ─────────────────────────
  checkPage(doc, 80);
  sectionTitle(doc, 'WHAT YOUR KUNDALI REVEALS — JYOTISHA PHALA');

  if (interp.lagna_reading) {
    readingPair(doc, `Ascendant in ${data.lagna} — Your Outer Self & Approach to Life`, interp.lagna_reading.personality);
  }
  checkPage(doc, 60);
  if (interp.moon_reading) {
    readingPair(doc, `Moon in ${data.moon_sign} — Your Mind & Emotional World`, interp.moon_reading);
  }
  checkPage(doc, 60);
  if (interp.dasha_reading?.text && interp.dasha_reading.current) {
    const md = interp.dasha_reading.current.mahadasha;
    readingPair(doc, `Current Period — ${md.planet} Mahadasha (${md.start} → ${md.end})`, interp.dasha_reading.text);
  }

  // Yogas — brief listing
  if (interp.yogas.length > 0) {
    checkPage(doc, 50);
    doc.moveDown(0.4);
    doc.fillColor(DARK).fontSize(9).font('Helvetica-Bold').text('Notable Yogas in Your Chart:', 50, doc.y);
    doc.moveDown(0.2);
    for (const yoga of interp.yogas) {
      checkPage(doc, 30);
      doc.fillColor(GOLD).fontSize(8.5).font('Helvetica-Bold').text(`• ${yoga.name}`, 54, doc.y);
      doc.fillColor(DARK).fontSize(8.5).font('Helvetica').text(yoga.desc, 66, doc.y, { width: doc.page.width - 116 });
      doc.moveDown(0.4);
    }
  }

  // Life purpose
  checkPage(doc, 60);
  sectionTitle(doc, 'LIFE PURPOSE & NATURE');
  readingPair(doc, 'Life Purpose', data.life_purpose || '—');
  readingPair(doc, 'Swabhav (Cosmic Nature)', data.swabhav || '—');

  // Mangal Dosha
  checkPage(doc, 80);
  const mdEn = mangalDosha ? MANGAL_DOSHA_EN.present : MANGAL_DOSHA_EN.absent;
  sectionTitle(doc, mdEn.title);
  readingBlock(doc, mdEn.desc);

  // Kalsarp
  checkPage(doc, 60);
  const ksEn = kalsarp === 'dosha' ? KALSARP_EN.dosha : kalsarp === 'yoga' ? KALSARP_EN.yoga : KALSARP_EN.absent;
  sectionTitle(doc, ksEn.title);
  readingBlock(doc, ksEn.desc);

  // Sade Sati
  if (sadeSati) {
    checkPage(doc, 60);
    if (sadeSati.active) {
      sectionTitle(doc, `Sade Sati — ACTIVE (${sadeSati.phase})`);
      readingBlock(doc, `Current Saturn transiting ${sadeSati.saturnSign}. Your Moon sign is ${data.moon_sign}. ${SADE_SATI_EN.phases[sadeSati.phase === 'Rising Phase (First 2.5 yrs)' ? 'rising' : sadeSati.phase === 'Peak Phase (Middle 2.5 yrs)' ? 'peak' : 'setting']?.desc || ''}`);
    } else {
      sectionTitle(doc, 'Sade Sati — NOT ACTIVE');
      readingBlock(doc, `Saturn is currently in ${sadeSati.saturnSign}. Your Moon sign ${data.moon_sign} is not within the Sade Sati zone at this time.`);
    }
  }

  // Footer on all pages
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    if (i === 0) continue;
    doc.fontSize(7).fillColor(LGREY)
       .text(`AstroVyoma Vedic Astrology — Jyotisha Engine • Generated ${new Date().toLocaleDateString('en-IN')} • Page ${i+1} of ${pages.count}`,
             40, doc.page.height - 50, { align: 'center', width: doc.page.width - 80 });
  }

  doc.end();
  return p;
}

// ─── DETAILED PDF ────────────────────────────────────────────────────────────

async function generateDetailedPDF(data, name, birthInfo) {
  const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
  const p = bufferFromDoc(doc);

  const pp       = data.planetary_positions || {};
  const hc       = data.house_cusps || {};
  const hp       = data.house_planets || {};
  const hl       = data.house_lords || {};
  const dashas   = data.dasha_sequence || [];
  const panchang = data.panchang || {};
  const upgrahas  = data.upgrahas || {};
  const bhavaBala = data.bhava_bala || {};
  const siderealTime = data.sidereal_time || {};
  const dc       = data.divisional_charts || {};
  const nav      = dc.navamsha || {};
  const shadbala = data.shadbala || {};
  const now      = new Date();
  const interp   = getKundaliInterpretation(data);
  const mangalDosha = computeMangalDoshaEn(data);
  const kalsarp     = computeKalsarpEn(data);
  const sadeSati    = computeSadeSatiEn(data);
  const naksAttr    = NAKSHATRA_ATTRIBUTES[data.nakshatra] || null;

  // ── Cover page ────────────────────────────────────────────────────────────
  drawEnglishCoverPage(doc, name, birthInfo, data);

  // ── PAGE 1: Header + Birth Details + Core Placements + Panchang ───────────
  doc.addPage();
  drawHeader(doc, 'Detailed Kundali Report', 'Complete Vedic Birth Chart — Jyotisha');

  doc.roundedRect(40, doc.y, doc.page.width - 80, 116, 6).fill(LIGHT);
  const b = doc.y + 10;
  infoRow(doc, 'Name',           name || '—',         b);
  infoRow(doc, 'Date of Birth',  birthInfo.dob || '—', b+16);
  infoRow(doc, 'Time of Birth',  birthInfo.birth_time || '—', b+32);
  infoRow(doc, 'Birth Place',    birthInfo.birth_place || '—', b+48);
  infoRow(doc, 'Lat / Lng',      `${parseFloat(birthInfo.lat||0).toFixed(4)}° N, ${parseFloat(birthInfo.lng||0).toFixed(4)}° E`, b+64);
  infoRow(doc, 'Timezone (UTC)', `+${birthInfo.timezone || 5.5}`, b+80);
  infoRow(doc, 'Julian Day',     data.julian_day?.toString() || '—', b+96);
  doc.y = b + 126;

  sectionTitle(doc, 'AYANAMSHA & LOCAL MEAN TIME');
  const lmt = data.lmt_info || {};
  let y = doc.y;
  infoRow(doc, 'Ayanamsha System',     data.ayanamsha?.name || 'Lahiri',         y);
  infoRow(doc, 'Ayanamsha Value',      data.ayanamsha?.dms || '—',               y+16);
  infoRow(doc, 'Standard Meridian',   `${lmt.standard_meridian || '82.5'}° East`, y+32);
  infoRow(doc, 'Birth Longitude',     `${lmt.birth_longitude || '—'}° East`,     y+48);
  infoRow(doc, 'LMT Correction',       lmt.lmt_correction_display || '—',        y+64);
  infoRow(doc, 'Local Mean Time',      lmt.lmt || '—',                            y+80);
  infoRow(doc, 'Sidereal Time (LMST)', siderealTime.lmst_time || '—',            y+96);
  infoRow(doc, 'Interval from Noon',  `${siderealTime.interval_from_noon_hrs || 0} hrs → +${siderealTime.sidereal_acceleration_sec || 0}s accel`, y+112);
  doc.y = y + 130;

  sectionTitle(doc, 'CORE PLACEMENTS');
  const lagDeg = data.lagna_degree != null ? parseFloat(data.lagna_degree).toFixed(2) : '';
  const core = [
    ['Ascendant (Lagna)',       `${data.lagna || '—'} — ${lagDeg}°`],
    ['Moon Sign (Janma Rashi)', data.moon_sign || '—'],
    ['Sun Sign',                data.sun_sign || '—'],
    ['Janma Nakshatra',         `${data.nakshatra || '—'} — Pada ${data.nakshatra_pada || '—'}`],
    ['Nakshatra Lord',          data.nakshatra_lord || '—'],
  ];
  y = doc.y;
  for (const [label, val] of core) { infoRow(doc, label, val, y); y += 16; }
  doc.y = y + 8;

  if (naksAttr) {
    sectionTitle(doc, 'NAKSHATRA ATTRIBUTES (BIRTH STAR QUALITIES)');
    const attrY2 = doc.y;
    doc.roundedRect(40, attrY2, doc.page.width - 80, 44, 4).fill(LIGHT);
    const hw2 = (doc.page.width - 80) / 3;
    [['Varna (Social Order)', naksAttr.varna], ['Gana (Temperament)', naksAttr.gana], ['Yoni (Animal Symbol)', naksAttr.yoni], ['Nadi (Pulse)', naksAttr.nadi], ['Vasya (Amenability)', naksAttr.vasya]].forEach(([label, val], i) => {
      const cx = 48 + (i % 3) * hw2;
      const cy = attrY2 + 6 + Math.floor(i / 3) * 22;
      doc.fontSize(7).fillColor(LGREY).font('Helvetica').text(label, cx, cy, { width: hw2 - 8 });
      doc.fontSize(9).fillColor(DARK).font('Helvetica-Bold').text(val || '—', cx, cy + 10, { width: hw2 - 8 });
    });
    doc.y = attrY2 + 54;
  }

  sectionTitle(doc, 'PANCHANG (FIVE LIMBS OF TIME)');
  const panItems = [
    ['Vaar (Weekday)',    panchang.vaar?.name || '—'],
    ['Tithi (Lunar Day)', `${panchang.tithi?.name || '—'} — ${panchang.tithi?.completion_pct || 0}% complete`],
    ['Nakshatra',         `${panchang.nakshatra?.name || '—'} Pada ${panchang.nakshatra?.pada || '—'} (Lord: ${panchang.nakshatra?.lord || '—'})`],
    ['Yoga',             `${panchang.yoga?.number || '—'}. ${panchang.yoga?.name || '—'}`],
    ['Karana',            panchang.karana?.name || '—'],
  ];
  y = doc.y;
  for (const [label, val] of panItems) { infoRow(doc, label, val, y); y += 16; }
  doc.y = y + 8;

  // Lucky factors
  drawLuckyFactorsEn(doc, data.nakshatra);

  // ── PAGE 2: Full Planetary Table + Houses ──────────────────────────────────
  newSectionPage(doc);
  drawHeader(doc, 'Planetary Positions', 'D-1 Rashi Chart — Sidereal Lahiri');

  sectionTitle(doc, 'GRAHA STHITI — PLANETARY POSITIONS');
  const pCols = ['Planet','Sign','House','Lon (°)','Deg in Sign','Nakshatra','Pada','Lord','Speed','Status'];
  const pWs   = [58, 78, 36, 50, 58, 95, 28, 48, 38, 58];
  y = tableHeader(doc, pCols, pWs, doc.y);
  for (const [i, pName] of PLANET_ORDER.entries()) {
    const pos = pp[pName];
    if (!pos) continue;
    y = tableRow(doc, [
      pName, pos.sign, pos.house || '—',
      parseFloat(pos.degree || 0).toFixed(2),
      `${parseFloat(pos.sign_degree || 0).toFixed(2)}°`,
      pos.nakshatra || '—',
      pos.nakshatra_pada || '—',
      pos.nakshatra_lord || '—',
      parseFloat(pos.speed || 0).toFixed(3),
      pos.retrograde ? 'Retrograde' : 'Direct'
    ], pWs, y, i % 2 === 0);
    if (y > doc.page.height - 80) { doc.addPage(); drawHeader(doc, 'Planetary Positions', 'continued'); y = 110; }
  }
  doc.y = y + 10;

  sectionTitle(doc, 'BHAVA (HOUSE) DETAILS — WHOLE SIGN SYSTEM');
  const hCols = ['House','Sign','Lord','Planets Placed'];
  const hWs   = [48, 98, 60, 300];
  y = tableHeader(doc, hCols, hWs, doc.y);
  for (let i = 1; i <= 12; i++) {
    const hSign = hc[`H${i}`]?.sign || '—';
    const planets = (hp[i] || []).join(', ') || '—';
    y = tableRow(doc, [`${i}`, hSign, hl[i] || '—', planets], hWs, y, i % 2 === 0);
  }
  doc.y = y + 10;

  // ── PAGE 3: Divisional Charts ──────────────────────────────────────────────
  if (Object.keys(dc).length > 0) {
  newSectionPage(doc);
  drawHeader(doc, 'Divisional Charts', 'Navamsha D-9 | Hora D-2 | Drekkana D-3 | Dashamsha D-10');

  sectionTitle(doc, 'NAVAMSHA (D-9) — DHARMA, MARRIAGE & INNER SOUL');
  doc.fontSize(8).fillColor(GREY).font('Helvetica')
     .text('Each 30° sign is divided into 9 parts of 3°20\'. Chara signs → Aries(0), Sthira → Capricorn(9), Dvishvabhava → Cancer(3).', 50, doc.y);
  doc.moveDown(0.4);
  const nCols = ['Planet','D-1 Sign','Navamsha Sign (D-9)'];
  const nWs   = [80, 120, 150];
  y = tableHeader(doc, nCols, nWs, doc.y);
  for (const [i, pName] of [...PLANET_ORDER, 'Lagna'].entries()) {
    const d1Sign  = pName === 'Lagna' ? data.lagna : pp[pName]?.sign;
    const navSign = nav[pName]?.sign;
    if (!d1Sign && !navSign) continue;
    y = tableRow(doc, [pName, d1Sign || '—', navSign || '—'], nWs, y, i % 2 === 0);
  }
  doc.y = y + 8;

  const divEntries = [
    ['HORA (D-2) — WEALTH & FINANCES', dc.hora, '2 parts per sign: Sun Hora (Leo) or Moon Hora (Cancer)'],
    ['DREKKANA (D-3) — SIBLINGS & COURAGE', dc.drekkana, '3 parts per sign (10° each): own sign, 5th, 9th'],
    ['DASHAMSHA (D-10) — CAREER & PROFESSION', dc.dashamsha, '10 parts per sign (3° each)'],
  ];
  for (const [title, divMap, desc] of divEntries) {
    checkPage(doc, 120);
    sectionTitle(doc, title);
    doc.fontSize(8).fillColor(GREY).font('Helvetica').text(desc, 50, doc.y);
    doc.moveDown(0.4);
    const dCols = ['Planet','D-1 Sign','Divisional Sign'];
    const dWs   = [80, 120, 150];
    y = tableHeader(doc, dCols, dWs, doc.y);
    for (const [i, pName] of PLANET_ORDER.entries()) {
      const dSign = divMap?.[pName]?.sign;
      y = tableRow(doc, [pName, pp[pName]?.sign || '—', dSign || '—'], dWs, y, i % 2 === 0);
    }
    doc.y = y + 8;
  }

  } // end divisional charts

  // ── PAGE 4: Upgrahas + Shadbala + Bhava Bala ──────────────────────────────
  const hasStrengthData = Object.keys(upgrahas).length > 0 || Object.keys(shadbala).length > 0 || Object.keys(bhavaBala).length > 0;
  if (hasStrengthData) {
  newSectionPage(doc);
  drawHeader(doc, 'Upgrahas & Strength', 'Shadow Planets | Shadbala | Bhava Bala');

  sectionTitle(doc, 'UPGRAHAS (SHADOW PLANETS — TERTIARY POINTS)');
  doc.fontSize(8).fillColor(GREY).font('Helvetica')
     .text('Dhuma=Sun+133°20\' | Vyatipata=360°-Dhuma | Paridhi=Vyatipata+180° | Indrachapa=360°-Paridhi | Upketu=Indrachapa+16°40\'', 50, doc.y);
  doc.moveDown(0.4);
  const uCols = ['Upgraha','Longitude','Sign','Deg in Sign'];
  const uWs   = [100, 80, 100, 80];
  y = tableHeader(doc, uCols, uWs, doc.y);
  let uIdx = 0;
  for (const [uName, uData] of Object.entries(upgrahas)) {
    y = tableRow(doc, [uName, `${parseFloat(uData.degree || 0).toFixed(2)}°`, uData.sign || '—', `${parseFloat(uData.sign_degree || 0).toFixed(2)}°`], uWs, y, uIdx++ % 2 === 0);
  }
  doc.y = y + 10;

  sectionTitle(doc, 'BHAVA BALA (HOUSE STRENGTH)');
  doc.fontSize(8).fillColor(GREY).font('Helvetica')
     .text('Bhavadhipati (lord shadbala×0.5) + Bhava Digbala (sign type × house type) + Bhava Drishti Bala (benefic/malefic aspects on house midpoint)', 50, doc.y);
  doc.moveDown(0.4);
  const bCols = ['House','Sign','Lord','Type','Bhavadhipati','Dig Bala','Drishti','Total','Strength'];
  const bWs   = [38, 76, 58, 100, 62, 48, 48, 48, 50];
  y = tableHeader(doc, bCols, bWs, doc.y);
  for (let i = 1; i <= 12; i++) {
    const bb = bhavaBala[i];
    if (!bb) continue;
    y = tableRow(doc, [
      `${i}`, bb.sign, bb.lord,
      (bb.house_type || '').split(' ')[0],
      bb.bhavadhipati, bb.digbala, bb.drishti, bb.total, bb.strength
    ], bWs, y, i % 2 === 0);
    if (y > doc.page.height - 80) { doc.addPage(); y = 60; }
  }
  doc.y = y + 10;

  sectionTitle(doc, 'SHADBALA (SIX-FOLD PLANETARY STRENGTH)');
  doc.fontSize(8).fillColor(GREY).font('Helvetica')
     .text('Sthana Bala (positional) + Dig Bala (directional) + Naisargika (natural) + Chesta Bala (motional)', 50, doc.y);
  doc.moveDown(0.4);
  const sCols = ['Planet','Sthana','Dig Bala','Naisargika','Chesta','Total','Strength'];
  const sWs   = [70, 55, 55, 65, 55, 50, 60];
  y = tableHeader(doc, sCols, sWs, doc.y);
  for (const [i, pName] of ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'].entries()) {
    const sb = shadbala[pName];
    if (!sb) continue;
    y = tableRow(doc, [pName, sb.sthana, sb.dig, sb.naisargika, sb.chesta, sb.total, sb.strength], sWs, y, i % 2 === 0);
  }
  doc.y = y + 10;

  } // end strength data

  // ── PAGE 5: Vimshottari Dasha ──────────────────────────────────────────────
  newSectionPage(doc);
  drawHeader(doc, 'Vimshottari Dasha', '120-Year Planetary Period System');

  const bal = data.dasha_balance;
  if (bal) {
    sectionTitle(doc, 'DASHA BALANCE AT BIRTH');
    y = doc.y;
    infoRow(doc, 'Janma Nakshatra Lord', bal.planet, y);
    infoRow(doc, 'Remaining at birth', `${bal.remaining_years} years (${bal.remaining_months} months)`, y + 16);
    doc.y = y + 34;
  }

  sectionTitle(doc, 'MAHADASHA SEQUENCE (9 PERIODS = 120 YEARS)');
  const mCols = ['Mahadasha','Years','Start','End','Current?'];
  const mWs   = [90, 40, 80, 80, 60];
  y = tableHeader(doc, mCols, mWs, doc.y);
  for (const [i, d] of dashas.entries()) {
    const isCurrent = new Date(d.start) <= now && new Date(d.end) >= now;
    y = tableRow(doc, [
      `${d.planet} Dasha`, d.years, d.start, d.end, isCurrent ? '★ Active' : ''
    ], mWs, y, i % 2 === 0);
  }
  doc.y = y + 10;

  const currentMaha = dashas.find(d => new Date(d.start) <= now && new Date(d.end) >= now);
  if (currentMaha?.antardashas?.length) {
    sectionTitle(doc, `ANTARDASHA — ${currentMaha.planet} Mahadasha`);
    const aCols = ['Antardasha','Start','End','Active?'];
    const aWs   = [120, 80, 80, 60];
    y = tableHeader(doc, aCols, aWs, doc.y);
    for (const [i, a] of currentMaha.antardashas.entries()) {
      const isCurA = new Date(a.start) <= now && new Date(a.end) >= now;
      y = tableRow(doc, [`${currentMaha.planet}/${a.planet}`, a.start, a.end, isCurA ? '★ Active' : ''], aWs, y, i % 2 === 0);
      if (y > doc.page.height - 60) { doc.addPage(); y = 60; }
    }
    doc.y = y + 10;
  }

  // ── PAGE 6: ASTROLOGICAL READING — THE INFERENCE SECTION ──────────────────
  newSectionPage(doc);
  drawHeader(doc, 'Astrological Reading', 'Jyotisha Phala — What Your Chart Reveals');

  // Intro note
  doc.fontSize(8.5).fillColor(GREY).font('Helvetica-Oblique')
     .text('The following reading derives purely from classical Vedic Jyotisha rules — Parashari and Brihat Jataka tradition. No artificial intelligence is used. These are the phala (fruits) that trained astrologers read from your birth chart.', 50, doc.y, { width: doc.page.width - 100 });
  doc.moveDown(0.8);

  // Lagna reading
  if (interp.lagna_reading) {
    sectionTitle(doc, `ASCENDANT IN ${(data.lagna || '').toUpperCase()} — OUTER SELF & LIFE APPROACH`);
    readingPair(doc, 'Personality & Nature', interp.lagna_reading.personality);
    readingPair(doc, 'Physical Appearance', interp.lagna_reading.body);
    readingPair(doc, 'Key Strengths', interp.lagna_reading.strengths);
    readingPair(doc, 'Challenges to Master', interp.lagna_reading.challenges);
    readingPair(doc, 'Dharma (Soul Purpose)', interp.lagna_reading.dharma);
  }

  // ── DETAILED LIFE FORECAST — 10 LIFE AREAS ────────────────────────────────
  const lagnaLife  = LAGNA_LIFE_EN[data.lagna]     || {};
  const moonDomEn  = MOON_DOMAIN_EN[data.moon_sign] || {};
  const lord10en   = hl['10'] || null;
  const lord2en    = hl['2']  || null;
  const lord5en    = hl['5']  || null;
  const career10en = lord10en ? (PLANET_CAREER_EN[lord10en] || null) : null;
  const vitta2en   = lord2en  ? (PLANET_VITTA_EN[lord2en]  || null) : null;
  const vidya5en   = lord5en  ? (PLANET_VIDYA_EN[lord5en]  || null) : null;

  const enPlanetHi = { Sun:'Sun', Moon:'Moon', Mars:'Mars', Mercury:'Mercury', Jupiter:'Jupiter', Venus:'Venus', Saturn:'Saturn', Rahu:'Rahu', Ketu:'Ketu' };
  const p7enList   = (hp['7']  || []).filter(Boolean);
  const p10enList  = (hp['10'] || []).filter(Boolean);
  const p7enNote   = p7enList.length  ? `${p7enList.join(', ')} in the 7th house — these planets shape the nature and timing of your marriage and partnerships.` : null;
  const p10enNote  = p10enList.length ? `${p10enList.join(', ')} in the 10th house — these planets directly influence your professional environment and career achievements.` : null;

  if (Object.keys(lagnaLife).length > 0) {
    newSectionPage(doc);
    drawHeader(doc, 'Detailed Life Forecast', '10 Life Areas — Personalised Jyotisha Reading');
    doc.fontSize(8.5).fillColor(GREY).font('Helvetica-Oblique')
       .text('The following predictions are derived from your Ascendant, Moon sign, house lords, and planetary placements using classical Parashari rules. Each section combines your Ascendant foundation with your personal Moon sign and house-lord influences.',
             50, doc.y, { width: doc.page.width - 100 });
    doc.moveDown(0.8);

    const enAreas = [
      ['1. CHARACTER & CONDUCT',        lagnaLife.charitra,     moonDomEn.charitra],
      ['2. MARRIAGE & FORTUNE',         lagnaLife.vivah,        [moonDomEn.vivah, p7enNote].filter(Boolean).join(' ') || null],
      ['3. LIFESTYLE & OUTLOOK',        lagnaLife.jeevan_shaili, moonDomEn.jeevan_shaili],
      ['4. EMPLOYMENT & SERVICE',       lagnaLife.rozgar,       [career10en, p10enNote].filter(Boolean).join(' ') || null],
      ['5. BUSINESS & PROFESSION',      lagnaLife.vyavsay,      [career10en, p10enNote].filter(Boolean).join(' ') || null],
      ['6. HEALTH & VITALITY',          lagnaLife.swasthya,     moonDomEn.swasthya],
      ['7. INTERESTS & RECREATION',     lagnaLife.ruchi,        moonDomEn.ruchi],
      ['8. LOVE & RELATIONSHIPS',       lagnaLife.prem,         [moonDomEn.prem, p7enNote].filter(Boolean).join(' ') || null],
      ['9. WEALTH & FINANCES',          lagnaLife.vitta,        vitta2en],
      ['10. EDUCATION & KNOWLEDGE',     lagnaLife.shiksha,      vidya5en],
    ];

    for (const [areaTitle, baseText, extraText] of enAreas) {
      checkPage(doc, 60);
      sectionTitle(doc, areaTitle);
      if (baseText) readingBlock(doc, baseText);
      if (extraText) readingBlock(doc, extraText);
    }
  }

  checkPage(doc, 80);
  if (interp.moon_reading) {
    sectionTitle(doc, `MOON IN ${(data.moon_sign || '').toUpperCase()} — MIND, EMOTION & INNER WORLD`);
    readingBlock(doc, interp.moon_reading, DARK);
    doc.moveDown(0.4);
  }

  checkPage(doc, 60);
  if (interp.sun_reading) {
    sectionTitle(doc, `SUN IN ${(data.sun_sign || '').toUpperCase()} — SOUL, VITALITY & PURPOSE`);
    readingBlock(doc, interp.sun_reading, DARK);
    doc.moveDown(0.4);
  }

  checkPage(doc, 80);
  if (interp.nakshatra_reading) {
    sectionTitle(doc, `JANMA NAKSHATRA — ${(data.nakshatra || '').toUpperCase()} (Lord: ${data.nakshatra_lord || '—'})`);
    readingBlock(doc, interp.nakshatra_reading, DARK);
    doc.moveDown(0.4);
  }

  // ── PAGE 7: Planetary Readings (Jupiter, Saturn, Rahu-Ketu) ───────────────
  checkPage(doc, 200);
  sectionTitle(doc, 'GURU (JUPITER) — WISDOM, FORTUNE & DHARMA');
  if (interp.jupiter_reading?.text) {
    doc.fontSize(8.5).fillColor(LGREY).font('Helvetica').text(`Jupiter is placed in the ${interp.jupiter_reading.house}th house.`, 50, doc.y);
    doc.moveDown(0.2);
    readingBlock(doc, interp.jupiter_reading.text, DARK);
  }

  checkPage(doc, 80);
  sectionTitle(doc, 'SHANI (SATURN) — KARMA, DISCIPLINE & LONGEVITY');
  if (interp.saturn_reading?.text) {
    doc.fontSize(8.5).fillColor(LGREY).font('Helvetica').text(`Saturn is placed in the ${interp.saturn_reading.house}th house.`, 50, doc.y);
    doc.moveDown(0.2);
    readingBlock(doc, interp.saturn_reading.text, DARK);
  }

  checkPage(doc, 100);
  sectionTitle(doc, 'RAHU-KETU AXIS — KARMA AXIS OF PAST & FUTURE');
  if (interp.rahu_reading?.text) {
    doc.fontSize(8.5).fillColor(LGREY).font('Helvetica').text(`Rahu is in the ${interp.rahu_reading.house}th house | Ketu is in the ${interp.ketu_reading?.house || '—'}th house.`, 50, doc.y);
    doc.moveDown(0.2);
    readingBlock(doc, interp.rahu_reading.text, DARK);
    doc.moveDown(0.3);
    if (interp.ketu_reading?.text) readingBlock(doc, interp.ketu_reading.text, DARK);
  }

  // Retrograde planets
  if (interp.retro_planets?.length > 0) {
    checkPage(doc, 50);
    doc.moveDown(0.4);
    doc.fillColor(DARK).fontSize(9).font('Helvetica-Bold').text('Retrograde Planets in Your Chart:', 50, doc.y);
    doc.moveDown(0.2);
    doc.fillColor(GREY).fontSize(9).font('Helvetica').text(
      `${interp.retro_planets.join(', ')} — Retrograde planets bring internalized, introspective energy. Their significations work through a deeper, more reflective channel. Lessons associated with these planets are central to this birth's unfolding.`,
      50, doc.y, { width: doc.page.width - 100 }
    );
    doc.moveDown(0.6);
  }

  // Dasha reading
  checkPage(doc, 100);
  if (interp.dasha_reading?.current) {
    const md = interp.dasha_reading.current.mahadasha;
    const ad = interp.dasha_reading.current.antardasha;
    sectionTitle(doc, `CURRENT DASHA — ${md.planet.toUpperCase()} MAHADASHA (${md.start} → ${md.end})`);
    if (interp.dasha_reading.text) {
      readingBlock(doc, interp.dasha_reading.text, DARK);
    }
    if (ad) {
      doc.moveDown(0.3);
      doc.fillColor(DARK).fontSize(9).font('Helvetica-Bold').text(`Active Antardasha: ${md.planet}/${ad.planet} (${ad.start} → ${ad.end})`, 50, doc.y);
      doc.moveDown(0.4);
    }
  }

  // Yogas
  if (interp.yogas.length > 0) {
    checkPage(doc, 80);
    sectionTitle(doc, 'PANCHA MAHAPURUSHA & NOTABLE YOGAS');
    doc.fontSize(8.5).fillColor(GREY).font('Helvetica')
       .text('Yogas are specific planetary combinations that modify the chart\'s fundamental promise. Those listed below have been identified in your birth chart by classical rules.', 50, doc.y, { width: doc.page.width - 100 });
    doc.moveDown(0.4);
    for (const yoga of interp.yogas) {
      checkPage(doc, 45);
      doc.fillColor(GOLD).fontSize(9).font('Helvetica-Bold').text(`▸ ${yoga.name}`, 50, doc.y);
      doc.moveDown(0.15);
      readingBlock(doc, yoga.desc, GREY);
      doc.moveDown(0.2);
    }
  }

  // ── GRAHA PHALA — PLANET-IN-HOUSE READINGS ──────────────────────────────────
  newSectionPage(doc);
  drawHeader(doc, 'Graha Phala — Planet Effects', 'Each Planet\'s Result by House Position');
  doc.fontSize(8.5).fillColor(GREY).font('Helvetica')
     .text('The following interpretations reflect the position of each planet in your birth chart according to Parashari Jyotisha tradition.',
           50, doc.y, { width: doc.page.width - 100 });
  doc.moveDown(0.8);

  const BHAVA_EN = ['','1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'];
  for (const pName of PLANET_ORDER) {
    const pos = pp[pName];
    if (!pos) continue;
    const houseNum = parseInt(pos.house);
    if (!houseNum || houseNum < 1 || houseNum > 12) continue;
    const reading = GRAHA_BHAVA_EN[pName]?.[houseNum];
    if (!reading) continue;
    checkPage(doc, 70);
    const stripY2 = doc.y;
    doc.moveDown(0.3);
    const currentStripY = doc.y;
    doc.rect(40, currentStripY, doc.page.width - 80, 22).fill('#1E3A5F');
    doc.fillColor(GOLD).fontSize(9.5).font('Helvetica-Bold')
       .text(`${pName} in ${BHAVA_EN[houseNum]} House — ${pos.sign}`, 52, currentStripY + 5, { width: doc.page.width - 110, lineBreak: false });
    doc.y = currentStripY + 28;
    readingBlock(doc, reading);
    doc.moveDown(0.15);
  }

  // ── MANGAL DOSHA PAGE ───────────────────────────────────────────────────────
  newSectionPage(doc);
  drawHeader(doc, 'Mangal Dosha Analysis', 'Kuja Dosha — Marriage & Marital Life');
  doc.fontSize(8.5).fillColor(GREY).font('Helvetica')
     .text('Mangal Dosha (Kuja Dosha) is a significant planetary affliction affecting marital life. It forms when Mars occupies houses 1, 4, 7, 8, or 12 from the Ascendant.', 50, doc.y, { width: doc.page.width - 100 });
  doc.moveDown(0.8);
  const mdDet = mangalDosha ? MANGAL_DOSHA_EN.present : MANGAL_DOSHA_EN.absent;
  sectionTitle(doc, mdDet.title);
  readingBlock(doc, mdDet.desc);
  if (mangalDosha) {
    checkPage(doc, 60); sectionTitle(doc, 'Effects'); readingBlock(doc, MANGAL_DOSHA_EN.present.effects);
    checkPage(doc, 100); sectionTitle(doc, 'Remedies'); bulletList(doc, MANGAL_DOSHA_EN.present.remedies);
  }
  const marsPos = pp['Mars'];
  if (marsPos) {
    checkPage(doc, 80); sectionTitle(doc, 'Mars Position in Your Chart');
    let my = doc.y;
    infoRow(doc, 'Mars Sign', marsPos.sign || '—', my);
    infoRow(doc, 'Mars House', marsPos.house || '—', my + 16);
    infoRow(doc, 'Nakshatra', `${marsPos.nakshatra || '—'} Pada ${marsPos.nakshatra_pada || '—'}`, my + 32);
    infoRow(doc, 'Status', marsPos.retrograde ? 'Retrograde' : 'Direct', my + 48);
    doc.y = my + 64;
  }

  // ── KALSARP PAGE ────────────────────────────────────────────────────────────
  newSectionPage(doc);
  drawHeader(doc, 'Kalsarp Dosha / Yoga', 'Rahu-Ketu Axis — Planetary Hemisphere');
  doc.fontSize(8.5).fillColor(GREY).font('Helvetica')
     .text('Kalsarp Dosha occurs when all seven classical planets are enclosed between Rahu and Ketu in the birth chart. This creates a powerful karmic signature.', 50, doc.y, { width: doc.page.width - 100 });
  doc.moveDown(0.8);
  const ksDet = kalsarp === 'dosha' ? KALSARP_EN.dosha : kalsarp === 'yoga' ? KALSARP_EN.yoga : KALSARP_EN.absent;
  sectionTitle(doc, ksDet.title);
  readingBlock(doc, ksDet.desc);
  if (kalsarp === 'dosha') {
    checkPage(doc, 60); sectionTitle(doc, 'Effects'); readingBlock(doc, KALSARP_EN.dosha.effects);
    checkPage(doc, 100); sectionTitle(doc, 'Remedies'); bulletList(doc, KALSARP_EN.dosha.remedies);
  }
  const rahuPos = pp['Rahu'], ketuPos = pp['Ketu'];
  checkPage(doc, 80); sectionTitle(doc, 'Rahu-Ketu Positions');
  let rky = doc.y;
  if (rahuPos) { infoRow(doc, 'Rahu Sign', rahuPos.sign || '—', rky); infoRow(doc, 'Rahu House', rahuPos.house || '—', rky + 16); rky += 32; }
  if (ketuPos) { infoRow(doc, 'Ketu Sign', ketuPos.sign || '—', rky); infoRow(doc, 'Ketu House', ketuPos.house || '—', rky + 16); rky += 32; }
  doc.y = rky + 8;

  // ── SADE SATI PAGE ──────────────────────────────────────────────────────────
  newSectionPage(doc);
  drawHeader(doc, 'Sade Sati Report', 'Saturn\'s 7.5-Year Transit — Moon Sign Analysis');
  doc.fontSize(8.5).fillColor(GREY).font('Helvetica')
     .text(SADE_SATI_EN.description, 50, doc.y, { width: doc.page.width - 100 });
  doc.moveDown(0.8);
  if (sadeSati?.active) {
    sectionTitle(doc, `Sade Sati — CURRENTLY ACTIVE: ${sadeSati.phase}`);
    const phKey = sadeSati.phase.includes('Rising') ? 'rising' : sadeSati.phase.includes('Peak') ? 'peak' : 'setting';
    readingBlock(doc, SADE_SATI_EN.phases[phKey]?.desc || '');
    let sy = doc.y + 8; infoRow(doc, 'Current Saturn Sign', sadeSati.saturnSign || '—', sy); infoRow(doc, 'Your Moon Sign', data.moon_sign || '—', sy + 16); doc.y = sy + 32;
  } else if (sadeSati?.dhaiya) {
    sectionTitle(doc, 'Shani Dhaiya (2.5-year sub-period) — ACTIVE');
    readingBlock(doc, `Saturn is transiting the 4th or 8th house from your Moon sign (${data.moon_sign}). This is a less intense but still notable Saturn sub-period.`);
  } else if (sadeSati) {
    sectionTitle(doc, 'Sade Sati — NOT CURRENTLY ACTIVE');
    readingBlock(doc, `Saturn is currently in ${sadeSati.saturnSign}. Your natal Moon is in ${data.moon_sign || '—'}. The Sade Sati zone does not apply at this time.`);
  }
  checkPage(doc, 120);
  sectionTitle(doc, 'The Three Phases of Sade Sati');
  for (const ph of Object.values(SADE_SATI_EN.phases)) {
    checkPage(doc, 50);
    doc.fillColor(GOLD).fontSize(9).font('Helvetica-Bold').text(`▸ ${ph.name}`, 50, doc.y);
    doc.moveDown(0.15);
    readingBlock(doc, ph.desc, CREAM);
    doc.moveDown(0.2);
  }
  checkPage(doc, 100); sectionTitle(doc, 'Sade Sati Remedies'); bulletList(doc, SADE_SATI_EN.remedies);

  // Future Sade Sati table
  const birthYrEn = birthInfo.dob ? parseInt(birthInfo.dob.split('-')[0] || birthInfo.dob.split('/')[2] || new Date().getFullYear()) : new Date().getFullYear();
  const ssTableEn = computeSadeSatiLifetimeTableEn(birthYrEn, data.moon_sign);
  if (ssTableEn.length > 0) {
    checkPage(doc, 120);
    sectionTitle(doc, 'Complete Sade Sati Timeline — Past & Future Occurrences');
    doc.fontSize(8).fillColor(GREY).font('Helvetica')
       .text(`Moon Sign: ${data.moon_sign} — Saturn afflicts when transiting the 12th, 1st, and 2nd signs from natal Moon.`,
             50, doc.y, { width: doc.page.width - 100 });
    doc.moveDown(0.5);
    const ssCols2 = ['Phase', 'Saturn Sign', 'Start Year', 'End Year'];
    const ssWs2   = [210, 100, 80, 80];
    let ssY2 = tableHeader(doc, ssCols2, ssWs2, doc.y);
    for (const [i, row] of ssTableEn.entries()) {
      const isNow2 = parseInt(row.start) <= new Date().getFullYear() && parseInt(row.end) >= new Date().getFullYear();
      if (isNow2) {
        doc.rect(40, ssY2 - 3, doc.page.width - 80, 14).fill('#FFF0E0');
        let tx = 40;
        const cells = [row.phase + ' ◄ Current', row.saturnSign, row.start, row.end];
        const fontC = ['Helvetica-Bold', 'Helvetica', 'Helvetica', 'Helvetica'];
        for (let ci = 0; ci < cells.length; ci++) {
          doc.fontSize(8).fillColor('#8B4500').font(fontC[ci]).text(String(cells[ci]), tx + 4, ssY2, { width: ssWs2[ci] - 6, lineBreak: false });
          tx += ssWs2[ci];
        }
        ssY2 += 15;
      } else {
        ssY2 = tableRow(doc, [row.phase, row.saturnSign, row.start, row.end], ssWs2, ssY2, i % 2 === 0);
      }
    }
    doc.y = ssY2 + 8;
  }

  // Closing
  checkPage(doc, 60);
  doc.moveDown(0.5);
  doc.rect(40, doc.y, doc.page.width - 80, 44).fill(DARK);
  const closingY = doc.y + 8;
  doc.fontSize(8).fillColor(LGREY).font('Helvetica')
     .text('This report is generated by AstroVyoma using Swiss Ephemeris precision with Lahiri (Chitrapaksha) Ayanamsha.', 50, closingY, { width: doc.page.width - 100 });
  doc.fontSize(8).fillColor(LGREY)
     .text('All interpretations follow traditional Vedic Jyotisha — Parashari tradition. For detailed personal guidance, consult a certified astrologer on AstroVyoma.', 50, closingY + 16, { width: doc.page.width - 100 });
  doc.y += 54;

  // Life purpose (traits section)
  checkPage(doc, 80);
  sectionTitle(doc, 'JANMA NAKSHATRA TRAITS & LIFE PURPOSE');
  const traits = data.personality_traits?.combined_traits || [];
  if (traits.length) {
    doc.fillColor(DARK).fontSize(9).font('Helvetica-Bold').text('Key Traits:', 50, doc.y);
    doc.moveDown(0.2);
    readingBlock(doc, traits.join(' • '), DARK);
  }
  readingPair(doc, 'Life Purpose', data.life_purpose || '—');
  readingPair(doc, 'Swabhav (Cosmic Nature)', data.swabhav || '—');

  // Footer on all pages except cover
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    if (i === 0) continue;
    doc.fontSize(7).fillColor(LGREY)
       .text(`AstroVyoma Detailed Kundali Report • Generated ${new Date().toLocaleDateString('en-IN')} • Page ${i+1} of ${pages.count}`,
             40, doc.page.height - 50, { align: 'center', width: doc.page.width - 80 });
  }

  doc.end();
  return p;
}

module.exports = { generateSummaryPDF, generateDetailedPDF };
