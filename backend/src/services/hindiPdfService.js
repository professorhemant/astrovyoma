'use strict';

const path = require('path');
const PDFDocument = require('pdfkit');
const { getKundaliInterpretation } = require('./interpretationEngine');
const {
  NAKSHATRA_ATTRIBUTES,
  LUCKY_FACTORS,
  GRAHA_BHAVA_HINDI,
  GRAHA_RASHI_HINDI,
  VARSHAPHAL_LAGNA_HINDI,
  MUNTHA_HOUSE_HINDI,
  MUDDA_PLANET_HINDI,
  JAIMINI_KARAKA_HINDI,
  KARAKAMSHA_HINDI,
  KP_INTRO_HINDI,
  LAGNA_HINDI, MOON_HINDI, SUN_HINDI, NAKSHATRA_HINDI,
  DASHA_HINDI, YOGA_HINDI, LABELS_HINDI: L,
  MANGAL_DOSHA_HINDI, KALSARP_HINDI, SADE_SATI_HINDI,
  MOON_DOMAIN_HINDI, PLANET_CAREER_HINDI, PLANET_VITTA_HINDI, PLANET_VIDYA_HINDI,
} = require('./hindiContent');
const { calcVarshaphal, calcJaimini, calcKP } = require('./kundaliEngine');

// ─── GRAHA DIGNITY HELPERS ────────────────────────────────────────────────────
const SIGN_ORDER = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const PLANET_EXALT = { Sun:'Aries', Moon:'Taurus', Mars:'Capricorn', Mercury:'Virgo', Jupiter:'Cancer', Venus:'Pisces', Saturn:'Libra', Rahu:'Gemini', Ketu:'Sagittarius' };
const PLANET_DEBIL = { Sun:'Libra', Moon:'Scorpio', Mars:'Cancer', Mercury:'Pisces', Jupiter:'Capricorn', Venus:'Virgo', Saturn:'Aries', Rahu:'Sagittarius', Ketu:'Gemini' };
const PLANET_OWN   = { Sun:['Leo'], Moon:['Cancer'], Mars:['Aries','Scorpio'], Mercury:['Gemini','Virgo'], Jupiter:['Sagittarius','Pisces'], Venus:['Taurus','Libra'], Saturn:['Capricorn','Aquarius'], Rahu:[], Ketu:[] };
const SIGN_LORDS   = { Aries:'Mars', Taurus:'Venus', Gemini:'Mercury', Cancer:'Moon', Leo:'Sun', Virgo:'Mercury', Libra:'Venus', Scorpio:'Mars', Sagittarius:'Jupiter', Capricorn:'Saturn', Aquarius:'Saturn', Pisces:'Jupiter' };
const PLANET_FRIENDS = {
  Sun:     ['Moon','Mars','Jupiter'],
  Moon:    ['Sun','Mercury'],
  Mars:    ['Sun','Moon','Jupiter'],
  Mercury: ['Sun','Venus'],
  Jupiter: ['Sun','Moon','Mars'],
  Venus:   ['Mercury','Saturn'],
  Saturn:  ['Mercury','Venus'],
  Rahu:    ['Venus','Saturn','Mercury'],
  Ketu:    ['Mars','Venus','Saturn'],
};
const PLANET_ENEMIES = {
  Sun:     ['Venus','Saturn'],
  Moon:    ['None'],
  Mars:    ['Mercury'],
  Mercury: ['Moon'],
  Jupiter: ['Mercury','Venus'],
  Venus:   ['Sun','Moon'],
  Saturn:  ['Sun','Moon','Mars'],
  Rahu:    ['Sun','Moon','Mars'],
  Ketu:    ['Sun','Moon','Mars'],
};
function getPlanetDignityHi(planet, sign) {
  if (PLANET_EXALT[planet] === sign) return 'उच्च';
  if (PLANET_DEBIL[planet] === sign) return 'नीच';
  if (PLANET_OWN[planet]?.includes(sign)) return 'स्वगृह';
  const lord = SIGN_LORDS[sign];
  if (PLANET_FRIENDS[planet]?.includes(lord)) return 'मित्र राशि';
  if (PLANET_ENEMIES[planet]?.includes(lord)) return 'शत्रु राशि';
  return 'सम राशि';
}
function getLordedHousesHi(planet, lagnaSign) {
  const lagnaIdx = SIGN_ORDER.indexOf(lagnaSign);
  if (lagnaIdx === -1) return '';
  const BHAVA_ORDINAL_HI = ['','प्रथम','द्वितीय','तृतीय','चतुर्थ','पंचम','षष्ठ','सप्तम','अष्टम','नवम','दशम','एकादश','द्वादश'];
  const houses = [];
  SIGN_ORDER.forEach((sign, idx) => {
    if (SIGN_LORDS[sign] === planet) {
      const houseNum = ((idx - lagnaIdx + 12) % 12) + 1;
      houses.push(BHAVA_ORDINAL_HI[houseNum]);
    }
  });
  return houses.join(', ');
}

const FONT_DIR      = path.join(__dirname, '../../assets/fonts');
const NIRMALA       = path.join(FONT_DIR, 'Nirmala.ttf');
const NIRMALA_B     = path.join(FONT_DIR, 'NirmalaB.ttf');
const ASSETS_DIR    = path.join(__dirname, '../../assets');
const IMG_MANDALA   = path.join(ASSETS_DIR, 'zodiac-mandala-sm.png');
const IMG_HERO      = path.join(ASSETS_DIR, 'hero-banner-sm.jpg');
const fs            = require('fs');

const PLANET_ORDER = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];

const NAK_HI = {
  Ashwini:'अश्विनी', Bharani:'भरणी', Krittika:'कृत्तिका', Rohini:'रोहिणी',
  Mrigashira:'मृगशिरा', Ardra:'आर्द्रा', Punarvasu:'पुनर्वसु', Pushya:'पुष्य',
  Ashlesha:'आश्लेषा', Magha:'मघा', PurvaPhalguni:'पूर्वाफाल्गुनी',
  UttaraPhalguni:'उत्तराफाल्गुनी', Hasta:'हस्त', Chitra:'चित्रा', Swati:'स्वाति',
  Vishakha:'विशाखा', Anuradha:'अनुराधा', Jyeshtha:'ज्येष्ठा', Mula:'मूल',
  PurvaAshadha:'पूर्वाषाढ़ा', UttaraAshadha:'उत्तराषाढ़ा', Shravana:'श्रवण',
  Dhanishtha:'धनिष्ठा', Shatabhisha:'शतभिषा', PurvaBhadrapada:'पूर्वाभाद्रपद',
  UttaraBhadrapada:'उत्तराभाद्रपद', Revati:'रेवती'
};
function hiNak(n) { return NAK_HI[n] || n || '—'; }

// ─── COLOURS ──────────────────────────────────────────────────────────────────
const GOLD  = '#C9A84C';
const DARK  = '#1A1A2E';
const GREY  = '#555555';
const LGREY = '#999999';
const WHITE = '#FFFFFF';
const LIGHT = '#F5F0E8';
const CREAM = '#FBF8F2';
const SAFFRON = '#E8630A';
const DEEP_GOLD = '#B8860B';

function bufferFromDoc(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end',  () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}

function registerFonts(doc) {
  doc.registerFont('Nirmala',  NIRMALA);
  doc.registerFont('NirmalaB', NIRMALA_B);
}

function hi(key) { return L[key] || key; }

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function drawPageHeader(doc, title, subtitle) {
  const base = doc.y > 20 ? doc.y : 0;
  doc.rect(0, base, doc.page.width, 80).fill(DARK);
  doc.fontSize(22).fillColor(GOLD).font('Helvetica-Bold').text('AstroVyoma', 40, base + 18);
  doc.fontSize(10).fillColor(LGREY).font('Nirmala').text('वैदिक ज्योतिष — स्वर्णिम भविष्यवाणी', 40, base + 44);
  doc.fontSize(14).fillColor(WHITE).font('NirmalaB').text(title, 0, base + 22, { align: 'right', width: doc.page.width - 40 });
  if (subtitle) doc.fontSize(9).fillColor(LGREY).font('Nirmala').text(subtitle, 0, base + 44, { align: 'right', width: doc.page.width - 40 });
  doc.y = base + 100;
}

function sectionTitle(doc, text, color) {
  doc.moveDown(0.4);
  if (doc.y > doc.page.height - 100) { doc.addPage(); doc.y = 40; }
  const sy = doc.y;
  doc.rect(40, sy, doc.page.width - 80, 24).fill(color || DARK);
  doc.fillColor(GOLD).fontSize(10.5).font('NirmalaB')
     .text(text, 52, sy + 5, { width: doc.page.width - 110, lineBreak: false });
  doc.y = sy + 30;
}

function subSectionTitle(doc, text) {
  doc.moveDown(0.3);
  checkPage(doc, 50);
  doc.fillColor(DEEP_GOLD).fontSize(9.5).font('NirmalaB').text(text, 50, doc.y);
  doc.moveDown(0.15);
}

function infoRow(doc, label, value, y) {
  doc.fontSize(9).fillColor(LGREY).font('Nirmala').text(label, 50, y, { width: 180 });
  doc.fontSize(9).fillColor(DARK).font('NirmalaB').text(String(value || '—'), 235, y, { width: doc.page.width - 280 });
}

function infoRowCompact(doc, label, value, x, y, labelW) {
  const lw = labelW || 120;
  doc.fontSize(8.5).fillColor(LGREY).font('Nirmala').text(label, x, y, { width: lw });
  doc.fontSize(8.5).fillColor(DARK).font('NirmalaB').text(String(value || '—'), x + lw + 4, y, { width: 130 });
}

function tableHeader(doc, cols, widths, y) {
  let x = 40;
  doc.rect(40, y - 4, doc.page.width - 80, 18).fill('#E8E0D0');
  for (let i = 0; i < cols.length; i++) {
    doc.fontSize(8).fillColor(DARK).font('NirmalaB').text(cols[i], x + 4, y, { width: widths[i] - 6, lineBreak: false });
    x += widths[i];
  }
  return y + 16;
}

function tableRow(doc, cells, widths, y, shade) {
  // 1. Measure tallest cell to get row height BEFORE drawing anything
  doc.fontSize(8).font('Nirmala');
  let rowH = 14;
  for (let i = 0; i < cells.length; i++) {
    const w = Math.max(widths[i] - 8, 10);
    const h = doc.heightOfString(String(cells[i] || '—'), { width: w });
    if (h + 8 > rowH) rowH = h + 8;
  }
  // 2. If row won't fit on this page, move to a new page first
  if (y + rowH > doc.page.height - 55) {
    doc.addPage();
    y = 40;
  }
  // 3. Draw shade and cells at the (possibly updated) y
  if (shade) doc.rect(40, y - 2, doc.page.width - 80, rowH).fill('#FAF7F0');
  let x = 40;
  for (let i = 0; i < cells.length; i++) {
    const w = Math.max(widths[i] - 8, 10);
    doc.fontSize(8).fillColor(DARK).font('Nirmala')
       .text(String(cells[i] || '—'), x + 4, y, { width: w });
    x += widths[i];
  }
  return y + rowH + 2;
}

function readingBlock(doc, text, bgColor) {
  if (!text) return;
  const textH  = doc.heightOfString(text, { width: doc.page.width - 130, fontSize: 9, font: 'Nirmala' });
  const totalH = textH + 18;
  checkPage(doc, totalH + 10);
  const blockY = doc.y;
  doc.rect(50, blockY, doc.page.width - 100, totalH).fill(bgColor || CREAM);
  doc.fillColor(DARK).fontSize(9).font('Nirmala')
     .text(text, 62, blockY + 9, { width: doc.page.width - 130 });
  doc.y = blockY + totalH + 4;
}

function readingPair(doc, label, text, bg) {
  if (!text) return;
  doc.moveDown(0.25);
  doc.fillColor(GOLD).fontSize(9).font('NirmalaB').text(label + ':', 50, doc.y);
  doc.moveDown(0.1);
  readingBlock(doc, text, bg);
}

function bulletList(doc, items, indent) {
  const ix = indent || 58;
  for (const item of items) {
    checkPage(doc, 20);
    const bY = doc.y;
    doc.fillColor(GOLD).fontSize(9).font('NirmalaB').text('•', ix - 10, bY);
    doc.fillColor(DARK).fontSize(8.5).font('Nirmala').text(item, ix, bY, { width: doc.page.width - ix - 50 });
    doc.moveDown(0.3);
  }
}

function checkPage(doc, needed) {
  if (doc.y + (needed || 60) > doc.page.height - 60) { doc.addPage(); doc.y = 40; }
}

function newSectionPage(doc) {
  // Add a page only when there's not enough room for the section header + meaningful content
  if (doc.page.height - doc.y < 290) {
    doc.addPage();
    doc.y = 0;
  }
}

// ─── LUCKY FACTORS TABLE ──────────────────────────────────────────────────────
function drawLuckyFactors(doc, nakshatra, lagna) {
  const lf = LUCKY_FACTORS[nakshatra];
  if (!lf) return;
  checkPage(doc, 130);
  sectionTitle(doc, 'शुभ-अशुभ विवरण (भाग्यशाली कारक)');
  const startY = doc.y;
  const W = doc.page.width - 80;
  doc.roundedRect(40, startY, W, 118, 4).fill('#FEF9EE');

  const col1X = 48, col2X = 48 + W / 2;
  const rows = [
    ['शुभ अंक',          lf.numbers || '—'],
    ['अशुभ अंक',         lf.unlucky || '—'],
    ['भाग्यशाली दिन',    lf.days    || '—'],
    ['भाग्यशाली धातु',   lf.dhatu   || '—'],
    ['भाग्यशाली रत्न',   lf.ratna   || '—'],
    ['भाग्यशाली रंग',    lf.rang    || '—'],
  ];
  const half = Math.ceil(rows.length / 2);
  for (let i = 0; i < rows.length; i++) {
    const x = i < half ? col1X : col2X;
    const y = startY + 10 + (i % half) * 19;
    doc.fontSize(7.5).fillColor(LGREY).font('Nirmala').text(rows[i][0], x, y, { width: W / 2 - 10 });
    doc.fontSize(8.5).fillColor(DARK).font('NirmalaB').text(rows[i][1], x + 90, y, { width: W / 2 - 100 });
  }
  // Name akshar row at bottom
  doc.fontSize(7.5).fillColor(LGREY).font('Nirmala').text('नाम के प्रथम अक्षर', col1X, startY + 100, { width: 90 });
  doc.fontSize(8.5).fillColor(DARK).font('NirmalaB').text(lf.akshar || '—', col1X + 90, startY + 100, { width: W - 100 });
  doc.y = startY + 128;
}

// ─── SADE SATI FUTURE TABLE ───────────────────────────────────────────────────
function computeSadeSatiLifetimeTable(birthYear, moonSign) {
  const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const SIGN_HI = { Aries:'मेष', Taurus:'वृषभ', Gemini:'मिथुन', Cancer:'कर्क', Leo:'सिंह', Virgo:'कन्या', Libra:'तुला', Scorpio:'वृश्चिक', Sagittarius:'धनु', Capricorn:'मकर', Aquarius:'कुम्भ', Pisces:'मीन' };
  const moonIdx = SIGNS.indexOf(moonSign);
  if (moonIdx < 0) return [];

  // Saturn transit schedule (approximate years when Saturn enters each sign)
  // Saturn cycle ~29.5 years, ~2.46 yrs per sign
  // Known: Saturn in Aquarius Jan 2020, Pisces Mar 2023, Aries May 2025
  const saturnEntries = {
    Aquarius: 2020.08, Pisces: 2023.21, Aries: 2025.41,
    Taurus: 2028.33, Gemini: 2030.79, Cancer: 2033.25,
    Leo: 2035.71, Virgo: 2038.17, Libra: 2040.63,
    Scorpio: 2043.08, Sagittarius: 2045.54, Capricorn: 2048.00,
    // Next cycle
    Aquarius2: 2050.46, Pisces2: 2052.92, Aries2: 2055.08,
  };

  // Sade Sati = Saturn in 12th, 1st, 2nd from Moon sign
  const prevSign = SIGNS[(moonIdx + 11) % 12]; // 12th from moon
  const currSign = moonSign;                     // 1st (moon sign itself)
  const nextSign = SIGNS[(moonIdx + 1)  % 12]; // 2nd from moon

  const relevantSigns = [prevSign, currSign, nextSign];
  const phaseNames = ['उदय (12वाँ भाव)', 'शिखर (जन्म राशि)', 'अस्त (2रा भाव)'];

  const occurrences = [];
  const allKeys = Object.keys(saturnEntries);

  for (let i = 0; i < allKeys.length; i++) {
    const key = allKeys[i];
    const baseSign = key.replace(/\d+$/, ''); // strip cycle suffix
    const phaseIdx = relevantSigns.indexOf(baseSign);
    if (phaseIdx < 0) continue;

    const startYr = saturnEntries[key];
    const endYr   = startYr + 2.46;
    if (endYr < birthYear || startYr > birthYear + 100) continue;

    occurrences.push({
      phase: phaseNames[phaseIdx],
      saturnRashi: SIGN_HI[baseSign] || baseSign,
      start: `${Math.floor(startYr)}`,
      end: `${Math.floor(endYr)}`,
      moonRashi: SIGN_HI[moonSign] || moonSign,
    });
  }

  // Group into 7.5-year Sade Sati blocks (every ~29.5 years)
  return occurrences;
}

// ─── COVER PAGE ────────────────────────────────────────────────────────────────
function drawCoverPage(doc, name, birthInfo, data) {
  const W = doc.page.width;
  const H = doc.page.height;

  // Full-page dark background
  doc.rect(0, 0, W, H).fill(DARK);

  // Top gold band
  doc.rect(0, 0, W, 6).fill(GOLD);

  // Brand
  doc.fontSize(34).fillColor(GOLD).font('Helvetica-Bold')
     .text('AstroVyoma', 0, 22, { align: 'center', width: W });
  doc.fontSize(11).fillColor(LGREY).font('Nirmala')
     .text('वैदिक ज्योतिष — स्वर्णिम भविष्यवाणी', 0, 62, { align: 'center', width: W });

  // ── Hero banner image (full width, ~130pt tall) ──────────────────────────
  let heroBannerH = 0;
  if (fs.existsSync(IMG_HERO)) {
    try {
      const bannerW = W - 40;
      const bannerH = Math.round(bannerW / 3.2);   // ~3.2:1 aspect
      doc.image(IMG_HERO, 20, 84, { width: bannerW, height: bannerH });
      // Subtle gold border around the banner
      doc.rect(20, 84, bannerW, bannerH).lineWidth(1).strokeColor(GOLD).stroke();
      heroBannerH = bannerH;
    } catch (_) { /* fallback: no image */ }
  }

  // Report title (below banner)
  const titleY = 84 + heroBannerH + 14;
  doc.rect(W / 2 - 80, titleY - 2, 160, 1).fill(GOLD);
  doc.fontSize(22).fillColor(WHITE).font('NirmalaB')
     .text('जन्म कुण्डली', 0, titleY + 8, { align: 'center', width: W });
  doc.fontSize(13).fillColor(GOLD).font('NirmalaB')
     .text('सम्पूर्ण जन्मपत्रिका विवेचन', 0, titleY + 36, { align: 'center', width: W });

  // ── Zodiac mandala image (centered medallion) ────────────────────────────
  const mandalaSz = 170;
  const mandalaY  = titleY + 68;
  if (fs.existsSync(IMG_MANDALA)) {
    try {
      doc.image(IMG_MANDALA, (W - mandalaSz) / 2, mandalaY,
                { width: mandalaSz, height: mandalaSz });
    } catch (_) {
      // fallback: big ॐ
      doc.fontSize(60).fillColor(GOLD).font('Nirmala')
         .text('ॐ', 0, mandalaY + 50, { align: 'center', width: W });
    }
  } else {
    doc.fontSize(60).fillColor(GOLD).font('Nirmala')
       .text('ॐ', 0, mandalaY + 50, { align: 'center', width: W });
  }

  // Name box (below mandala)
  const nameBoxY = mandalaY + mandalaSz + 16;
  doc.roundedRect(80, nameBoxY, W - 160, 90, 6)
     .lineWidth(1).strokeColor(GOLD).stroke();
  doc.fontSize(9).fillColor(LGREY).font('Nirmala')
     .text('नाम', 0, nameBoxY + 12, { align: 'center', width: W });
  doc.fontSize(18).fillColor(WHITE).font('NirmalaB')
     .text(name || '—', 0, nameBoxY + 28, { align: 'center', width: W });
  doc.fontSize(9).fillColor(LGREY).font('Nirmala')
     .text(`${birthInfo.dob || ''}  |  ${birthInfo.birth_time || ''}  |  ${birthInfo.birth_place || ''}`,
           0, nameBoxY + 62, { align: 'center', width: W });

  // Key placements box
  const kY = nameBoxY + 102;
  const kH = Math.min(120, H - kY - 110);
  doc.roundedRect(80, kY, W - 160, kH, 6)
     .lineWidth(0.5).strokeColor('#3A3A5E').stroke();

  const lagnaName = hi(data.lagna) || '—';
  const moonName  = hi(data.moon_sign) || '—';
  const sunName   = hi(data.sun_sign) || '—';
  const nakName   = hiNak(data.nakshatra) || '—';

  [['लग्न', lagnaName], ['चन्द्र राशि', moonName],
   ['सूर्य राशि', sunName], ['जन्म नक्षत्र', nakName]].forEach(([label, val], i) => {
    const tx = 80 + (i % 2) * ((W - 160) / 2) + 20;
    const ty = kY + 15 + Math.floor(i / 2) * 46;
    doc.fontSize(8).fillColor(LGREY).font('Nirmala').text(label, tx, ty, { width: 160 });
    doc.fontSize(14).fillColor(GOLD).font('NirmalaB').text(val, tx, ty + 14, { width: 160 });
  });

  // Footer info
  const fY = H - 100;
  doc.rect(0, fY, W, 1).fill('#2A2A4E');
  doc.fontSize(7.5).fillColor(LGREY).font('Nirmala')
     .text('लाहिरी अयनांश | स्विस एफेमेरिस | पाराशरी पद्धति', 0, fY + 12, { align: 'center', width: W });
  doc.fontSize(7.5).fillColor(LGREY).font('Nirmala')
     .text(`निर्मित: ${new Date().toLocaleDateString('hi-IN')}  |  AstroVyoma Vedic Astrology`, 0, fY + 28, { align: 'center', width: W });
  doc.fontSize(7).fillColor('#555577').font('Nirmala')
     .text('यह दस्तावेज़ व्यक्तिगत उपयोग हेतु है। सभी फल पाराशरी ज्योतिष परम्परा पर आधारित हैं।', 0, fY + 48, { align: 'center', width: W });

  // Bottom gold band
  doc.rect(0, H - 6, W, 6).fill(GOLD);
}

// ─── COMPUTE MANGAL DOSHA ─────────────────────────────────────────────────────
function computeMangalDosha(data) {
  const pp = data.planetary_positions || {};
  const mars = pp['Mars'];
  if (!mars) return false;
  const h = parseInt(mars.house);
  return [1, 4, 7, 8, 12].includes(h);
}

// ─── COMPUTE KALSARP ──────────────────────────────────────────────────────────
function computeKalsarp(data) {
  const pp = data.planetary_positions || {};
  const rahu = pp['Rahu'];
  const ketu = pp['Ketu'];
  if (!rahu || !ketu) return 'absent';

  const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const rahuIdx = SIGNS.indexOf(rahu.sign);
  const ketuIdx = SIGNS.indexOf(ketu.sign);
  if (rahuIdx < 0 || ketuIdx < 0) return 'absent';

  const mainPlanets = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
  let allBetween = true;
  let allReverse = true;

  for (const pName of mainPlanets) {
    const pos = pp[pName];
    if (!pos) continue;
    const pIdx = SIGNS.indexOf(pos.sign);
    if (pIdx < 0) continue;

    // Check if planet is in arc from Rahu to Ketu (clockwise)
    let inArc = false;
    let idx = rahuIdx;
    while (idx !== ketuIdx) {
      if (idx === pIdx) { inArc = true; break; }
      idx = (idx + 1) % 12;
    }
    if (!inArc) allBetween = false;

    // Check reverse arc (Ketu to Rahu)
    let inRevArc = false;
    idx = ketuIdx;
    while (idx !== rahuIdx) {
      if (idx === pIdx) { inRevArc = true; break; }
      idx = (idx + 1) % 12;
    }
    if (!inRevArc) allReverse = false;
  }

  if (allBetween) return 'dosha';
  if (allReverse) return 'yoga';
  return 'absent';
}

// ─── COMPUTE SADE SATI ────────────────────────────────────────────────────────
function computeSadeSati(data) {
  const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  // Saturn entered Aries approx May 2025; in Aries through ~May 2028
  // Use a rough current Saturn sign based on today's date
  const now = new Date();
  const yr = now.getFullYear() + now.getMonth() / 12;
  let saturnSign;
  if (yr >= 2025.41 && yr < 2028.33)      saturnSign = 'Aries';
  else if (yr >= 2023.18 && yr < 2025.41) saturnSign = 'Pisces';
  else if (yr >= 2020.75 && yr < 2023.18) saturnSign = 'Aquarius';
  else saturnSign = 'Aries'; // fallback

  const moonSign = data.moon_sign;
  if (!moonSign) return null;

  const satIdx  = SIGNS.indexOf(saturnSign);
  const moonIdx = SIGNS.indexOf(moonSign);
  if (satIdx < 0 || moonIdx < 0) return null;

  const diff = ((satIdx - moonIdx) + 12) % 12;
  if (diff === 11) return { active: true, phase: 'uday',   saturnSign };
  if (diff === 0)  return { active: true, phase: 'shikhar', saturnSign };
  if (diff === 1)  return { active: true, phase: 'ast',    saturnSign };
  if (diff === 3 || diff === 7) return { active: false, dhaiya: true, saturnSign };
  return { active: false, saturnSign };
}

// ─── GET HINDI INTERPRETATION ─────────────────────────────────────────────────
function getHindiInterp(data) {
  const lagnaH   = LAGNA_HINDI[data.lagna]       || null;
  const moonH    = MOON_HINDI[data.moon_sign]     || null;
  const sunH     = SUN_HINDI[data.sun_sign]       || null;
  const naksH    = NAKSHATRA_HINDI[data.nakshatra]|| null;
  const naksAttr = NAKSHATRA_ATTRIBUTES[data.nakshatra] || null;
  const interp   = getKundaliInterpretation(data);
  const now      = new Date();
  const dashas   = data.dasha_sequence || [];
  const currentMaha  = dashas.find(d => new Date(d.start) <= now && new Date(d.end) >= now);
  const currentAntar = currentMaha?.antardashas?.find(a => new Date(a.start) <= now && new Date(a.end) >= now);
  const dashaH   = currentMaha ? DASHA_HINDI[currentMaha.planet] : null;
  const yogasH   = interp.yogas.map(y => ({ name: y.name, desc: YOGA_HINDI[y.name] || y.desc }));
  const mangalDosha = computeMangalDosha(data);
  const kalsarp     = computeKalsarp(data);
  const sadeSati    = computeSadeSati(data);

  return { lagnaH, moonH, sunH, naksH, naksAttr, dashaH, yogasH,
           currentMaha, currentAntar, retroPlanets: interp.retro_planets || [],
           mangalDosha, kalsarp, sadeSati };
}

// ─── SUMMARY PDF (HINDI) — AstroSage pattern ─────────────────────────────────
async function generateSummaryPDFHindi(data, name, birthInfo) {
  const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
  registerFonts(doc);
  const p = bufferFromDoc(doc);

  const pp       = data.planetary_positions || {};
  const panchang = data.panchang            || {};
  const now      = new Date();
  const hi_interp = getHindiInterp(data);
  const { lagnaH, moonH, sunH, naksH, naksAttr, dashaH, yogasH,
          currentMaha, currentAntar, retroPlanets,
          mangalDosha, kalsarp, sadeSati } = hi_interp;

  // ── पृष्ठ 1: मुखपृष्ठ ──────────────────────────────────────────────────────
  drawCoverPage(doc, name, birthInfo, data);

  // ── पृष्ठ 2: व्यक्ति विवरण ──────────────────────────────────────────────────
  doc.addPage();
  drawPageHeader(doc, 'व्यक्ति विवरण', 'जन्म-पत्रिका का मूल विवरण');

  sectionTitle(doc, 'जन्म विवरण');
  const b = doc.y;
  doc.roundedRect(40, b, doc.page.width - 80, 108, 4).fill(LIGHT);
  infoRow(doc, 'नाम',           name || '—',                              b + 10);
  infoRow(doc, 'जन्म तिथि',    birthInfo.dob || '—',                     b + 26);
  infoRow(doc, 'जन्म समय',     birthInfo.birth_time || '—',              b + 42);
  infoRow(doc, 'जन्म स्थान',   birthInfo.birth_place || '—',             b + 58);
  infoRow(doc, 'अक्षांश/देशांश', `${parseFloat(birthInfo.lat||0).toFixed(4)}°उ. ${parseFloat(birthInfo.lng||0).toFixed(4)}°पू.`, b + 74);
  infoRow(doc, 'अयनांश',       data.ayanamsha?.dms || '—',               b + 90);
  doc.y = b + 118;

  sectionTitle(doc, 'लग्न एवं राशि विवरण');
  const c = doc.y;
  doc.roundedRect(40, c, doc.page.width - 80, 92, 4).fill(CREAM);
  infoRow(doc, 'लग्न राशि',        `${hi(data.lagna)} (${(parseFloat(data.lagna_degree||0)).toFixed(2)}°)`, c + 10);
  infoRow(doc, 'चन्द्र राशि',      hi(data.moon_sign) || '—',                     c + 26);
  infoRow(doc, 'सूर्य राशि',       hi(data.sun_sign) || '—',                      c + 42);
  infoRow(doc, 'जन्म नक्षत्र',     `${hiNak(data.nakshatra)} — चरण ${data.nakshatra_pada || '—'}`, c + 58);
  infoRow(doc, 'नक्षत्र स्वामी',   hi(data.nakshatra_lord) || '—',                c + 74);
  doc.y = c + 102;

  // Nakshatra attributes box
  if (naksAttr) {
    sectionTitle(doc, 'नक्षत्र गुण विवरण');
    const na = doc.y;
    doc.roundedRect(40, na, doc.page.width - 80, 72, 4).fill(LIGHT);
    const hw = (doc.page.width - 80) / 2 - 8;
    infoRowCompact(doc, 'वर्ण',  naksAttr.varna || '—', 48, na + 10, 80);
    infoRowCompact(doc, 'गण',    naksAttr.gana  || '—', 48 + hw, na + 10, 80);
    infoRowCompact(doc, 'योनि',  naksAttr.yoni  || '—', 48, na + 28, 80);
    infoRowCompact(doc, 'नाड़ी', naksAttr.nadi  || '—', 48 + hw, na + 28, 80);
    infoRowCompact(doc, 'वश्य',  naksAttr.vasya || '—', 48, na + 46, 80);
    const lagnaInfo = lagnaH ? `${lagnaH.rashi}` : '—';
    infoRowCompact(doc, 'राशि',  lagnaInfo, 48 + hw, na + 46, 80);
    doc.y = na + 82;
  }

  sectionTitle(doc, 'जन्मकालीन पंचांग');
  const panRows = [
    ['वार',     panchang.vaar?.name   || '—'],
    ['तिथि',   panchang.tithi?.name  || '—'],
    ['नक्षत्र', `${hiNak(panchang.nakshatra?.name)} — चरण ${panchang.nakshatra?.pada || '—'}`],
    ['योग',     panchang.yoga?.name   || '—'],
    ['करण',    panchang.karana?.name || '—'],
  ];
  let y = doc.y;
  for (const [label, val] of panRows) { infoRow(doc, label, val, y); y += 16; }
  doc.y = y + 8;

  // Lucky factors
  drawLuckyFactors(doc, data.nakshatra, data.lagna);

  // ── पृष्ठ 3: आपका लग्न ───────────────────────────────────────────────────
  newSectionPage(doc);
  drawPageHeader(doc, 'आपका लग्न', lagnaH ? lagnaH.title : '');

  if (lagnaH) {
    doc.fontSize(8.5).fillColor(GREY).font('Nirmala')
       .text('लग्न कुण्डली का वह बिन्दु है जो पृथ्वी के पूर्व क्षितिज पर उदय हो रहा था। यह आपके जीवन का केंद्रबिन्दु, शरीर और व्यक्तित्व का प्रतीक है।',
             50, doc.y, { width: doc.page.width - 100 });
    doc.moveDown(0.6);

    subSectionTitle(doc, '1. लग्न क्या है ?');
    readingBlock(doc, `${lagnaH.rashi} राशि आपके लग्न में है। ${lagnaH.title.split('—')[1]?.trim() || ''}। लग्न से आपके जीवन का समग्र स्वरूप, शारीरिक गठन और मूल प्रवृत्तियाँ निर्धारित होती हैं।`);

    subSectionTitle(doc, '2. स्वास्थ्य एवं शरीर');
    readingPair(doc, 'शारीरिक संरचना', lagnaH.sharir);
    readingPair(doc, 'स्वास्थ्य विवेचन', lagnaH.swasthya);

    subSectionTitle(doc, '3. स्वभाव एवं व्यक्तित्व');
    readingPair(doc, 'मूल स्वभाव', lagnaH.svabhav);
    readingPair(doc, 'चरित्र', lagnaH.charitra);
    readingPair(doc, 'मुख्य शक्तियाँ', lagnaH.bal);
    readingPair(doc, 'जीवन की चुनौतियाँ', lagnaH.chunauti);

    subSectionTitle(doc, '4. धर्म एवं जीवन-लक्ष्य');
    readingPair(doc, 'जीवन-धर्म', lagnaH.dharma);
  }

  // ── पृष्ठ 4: नक्षत्र फल ──────────────────────────────────────────────────
  newSectionPage(doc);
  drawPageHeader(doc, 'नक्षत्र फल', `${hiNak(data.nakshatra)} नक्षत्र — चरण ${data.nakshatra_pada || '—'}`);

  doc.fontSize(8.5).fillColor(GREY).font('Nirmala')
     .text('नक्षत्र चन्द्रमा की स्थिति के आधार पर निर्धारित होता है। 27 नक्षत्र 12 राशियों में विभाजित हैं। जन्म नक्षत्र आपके मन, स्वभाव और जीवन की मूल धारा को दर्शाता है।',
           50, doc.y, { width: doc.page.width - 100 });
  doc.moveDown(0.8);

  if (naksAttr) {
    sectionTitle(doc, 'नक्षत्र के मूल गुण');
    const attrY = doc.y;
    doc.roundedRect(40, attrY, doc.page.width - 80, 88, 4).fill(LIGHT);
    const cols2 = [
      ['वर्ण', naksAttr.varna], ['गण', naksAttr.gana],
      ['योनि', naksAttr.yoni],  ['नाड़ी', naksAttr.nadi],
      ['वश्य', naksAttr.vasya], ['नक्षत्र स्वामी', hi(data.nakshatra_lord) || '—'],
    ];
    const cellW = (doc.page.width - 80) / 3;
    cols2.forEach(([label, val], i) => {
      const cx2 = 48 + (i % 3) * cellW;
      const cy2 = attrY + 12 + Math.floor(i / 3) * 38;
      doc.fontSize(7.5).fillColor(LGREY).font('Nirmala').text(label, cx2, cy2, { width: cellW - 8 });
      doc.fontSize(12).fillColor(DARK).font('NirmalaB').text(val || '—', cx2, cy2 + 13, { width: cellW - 8 });
    });
    doc.y = attrY + 98;
  }

  sectionTitle(doc, 'नक्षत्र फल विवेचन');
  if (naksH) readingBlock(doc, naksH);

  checkPage(doc, 80);
  sectionTitle(doc, 'चन्द्र फल — मन एवं भावनाएँ');
  if (moonH) readingBlock(doc, moonH);

  checkPage(doc, 80);
  sectionTitle(doc, 'सूर्य फल — आत्मा एवं व्यक्तित्व');
  if (sunH) readingBlock(doc, sunH);

  // ── पृष्ठ 5: विंशोत्तरी दशा + योग ──────────────────────────────────────
  newSectionPage(doc);
  drawPageHeader(doc, 'दशा एवं विशेष योग', 'विंशोत्तरी महादशा | शुभ योग');

  sectionTitle(doc, 'वर्तमान दशा');
  if (currentMaha && dashaH) {
    y = doc.y;
    doc.roundedRect(40, y, doc.page.width - 80, 56, 4).fill(LIGHT);
    infoRow(doc, 'महादशा',     `${hi(currentMaha.planet)} महादशा`, y + 10);
    infoRow(doc, 'अवधि',       `${currentMaha.start} से ${currentMaha.end}`, y + 26);
    if (currentAntar) infoRow(doc, 'अन्तर्दशा', `${hi(currentMaha.planet)}/${hi(currentAntar.planet)} (${currentAntar.start} से ${currentAntar.end})`, y + 42);
    doc.y = y + 66;
    readingBlock(doc, dashaH.reading);
  } else {
    doc.fontSize(9).fillColor(GREY).font('Nirmala').text('दशा विवरण उपलब्ध नहीं।', 50, doc.y);
    doc.moveDown(0.5);
  }

  if (yogasH.length > 0) {
    checkPage(doc, 80);
    sectionTitle(doc, 'विशेष योग');
    for (const yoga of yogasH) {
      checkPage(doc, 40);
      doc.fillColor(GOLD).fontSize(9).font('NirmalaB').text(`▸ ${yoga.name}`, 50, doc.y);
      doc.moveDown(0.15);
      readingBlock(doc, yoga.desc, CREAM);
      doc.moveDown(0.2);
    }
  }

  // Dosha summary
  checkPage(doc, 80);
  sectionTitle(doc, 'मंगल दोष एवं कालसर्प');
  const mdInfo = mangalDosha ? MANGAL_DOSHA_HINDI.present : MANGAL_DOSHA_HINDI.absent;
  readingPair(doc, mdInfo.title, mdInfo.desc);
  const ksInfo = kalsarp === 'dosha' ? KALSARP_HINDI.dosha : kalsarp === 'yoga' ? KALSARP_HINDI.yoga : KALSARP_HINDI.absent;
  readingPair(doc, ksInfo.title, ksInfo.desc);

  // Footer
  _addFooters(doc);
  doc.end();
  return p;
}

// ─── DETAILED PDF (HINDI) — AstroSage pattern ────────────────────────────────
async function generateDetailedPDFHindi(data, name, birthInfo) {
  const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
  registerFonts(doc);
  const p = bufferFromDoc(doc);

  const pp        = data.planetary_positions || {};
  const hc        = data.house_cusps         || {};
  const hp        = data.house_planets        || {};
  const hl        = data.house_lords          || {};
  const dashas    = data.dasha_sequence       || [];
  const panchang  = data.panchang             || {};
  const dc        = data.divisional_charts    || {};
  const nav       = dc.navamsha              || {};
  const shadbala  = data.shadbala             || {};
  const bhavaBala = data.bhava_bala           || {};
  const upgrahas  = data.upgrahas             || {};
  const siderealTime = data.sidereal_time    || {};
  const lmt       = data.lmt_info            || {};
  const now       = new Date();

  // Compute Varshaphal (solar return) asynchronously before building PDF
  const natalSunDeg = pp['Sun']?.degree ?? 0;
  const natalLagnaSignIdx = SIGN_ORDER.indexOf(data.lagna) !== -1 ? SIGN_ORDER.indexOf(data.lagna) : 0;
  const varshaphal = await calcVarshaphal(
    natalSunDeg, natalLagnaSignIdx,
    birthInfo?.dob || data.dob || '',
    parseFloat(birthInfo?.lat ?? data.birth_lat ?? 28.6),
    parseFloat(birthInfo?.lng ?? data.birth_lng ?? 77.2),
    parseFloat(birthInfo?.timezone ?? data.birth_timezone ?? 5.5)
  ).catch(() => null);

  const jaimini = calcJaimini(pp, data.divisional_charts || {});
  const kpData  = calcKP(pp, data.house_cusps || {});

  const hi_interp = getHindiInterp(data);
  const { lagnaH, moonH, sunH, naksH, naksAttr, dashaH, yogasH,
          currentMaha, currentAntar, retroPlanets,
          mangalDosha, kalsarp, sadeSati } = hi_interp;

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 1 — COVER
  // ══════════════════════════════════════════════════════════════════════════
  drawCoverPage(doc, name, birthInfo, data);

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 2 — व्यक्ति विवरण (full)
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageHeader(doc, 'व्यक्ति विवरण', 'सम्पूर्ण जन्म-पत्रिका — लाहिरी अयनांश');

  sectionTitle(doc, 'जन्म विवरण');
  let b = doc.y;
  doc.roundedRect(40, b, doc.page.width - 80, 124, 4).fill(LIGHT);
  infoRow(doc, 'नाम',              name || '—',                              b + 10);
  infoRow(doc, 'जन्म तिथि',       birthInfo.dob || '—',                     b + 26);
  infoRow(doc, 'जन्म समय',        birthInfo.birth_time || '—',              b + 42);
  infoRow(doc, 'जन्म स्थान',      birthInfo.birth_place || '—',             b + 58);
  infoRow(doc, 'अक्षांश/देशांश',  `${parseFloat(birthInfo.lat||0).toFixed(4)}°उ. ${parseFloat(birthInfo.lng||0).toFixed(4)}°पू.`, b + 74);
  infoRow(doc, 'समयक्षेत्र (UTC)', `+${birthInfo.timezone || 5.5}`,          b + 90);
  infoRow(doc, 'अयनांश मान',      data.ayanamsha?.dms || '—',               b + 106);
  doc.y = b + 134;

  sectionTitle(doc, 'मुख्य ग्रह एवं राशि स्थितियाँ');
  b = doc.y;
  doc.roundedRect(40, b, doc.page.width - 80, 108, 4).fill(CREAM);
  infoRow(doc, 'लग्न',             `${hi(data.lagna)} — ${(parseFloat(data.lagna_degree||0)).toFixed(2)}°`, b + 10);
  infoRow(doc, 'चन्द्र राशि',     hi(data.moon_sign) || '—',                 b + 26);
  infoRow(doc, 'सूर्य राशि',      hi(data.sun_sign)  || '—',                 b + 42);
  infoRow(doc, 'जन्म नक्षत्र',    `${hiNak(data.nakshatra)} — चरण ${data.nakshatra_pada || '—'}`, b + 58);
  infoRow(doc, 'नक्षत्र स्वामी',  hi(data.nakshatra_lord) || '—',            b + 74);
  infoRow(doc, 'जूलियन दिन',      data.julian_day?.toString() || '—',        b + 90);
  doc.y = b + 118;

  if (naksAttr) {
    sectionTitle(doc, 'नक्षत्र गुण — वर्ण, गण, योनि, नाड़ी, वश्य');
    b = doc.y;
    doc.roundedRect(40, b, doc.page.width - 80, 72, 4).fill(LIGHT);
    const hw = (doc.page.width - 80) / 2 - 8;
    infoRowCompact(doc, 'वर्ण',  naksAttr.varna || '—', 48, b + 10, 80);
    infoRowCompact(doc, 'गण',    naksAttr.gana  || '—', 48 + hw, b + 10, 80);
    infoRowCompact(doc, 'योनि',  naksAttr.yoni  || '—', 48, b + 28, 80);
    infoRowCompact(doc, 'नाड़ी', naksAttr.nadi  || '—', 48 + hw, b + 28, 80);
    infoRowCompact(doc, 'वश्य',  naksAttr.vasya || '—', 48, b + 46, 80);
    infoRowCompact(doc, 'नक्षत्र स्वामी', hi(data.nakshatra_lord) || '—', 48 + hw, b + 46, 80);
    doc.y = b + 82;
  }

  sectionTitle(doc, 'जन्मकालीन पंचांग');
  const panItems = [
    ['वार',    panchang.vaar?.name || '—'],
    ['तिथि',  `${panchang.tithi?.name || '—'} (${panchang.tithi?.completion_pct || 0}% पूर्ण)`],
    ['नक्षत्र', `${hiNak(panchang.nakshatra?.name)} — चरण ${panchang.nakshatra?.pada || '—'} (स्वामी: ${hi(panchang.nakshatra?.lord) || '—'})`],
    ['योग',    `${panchang.yoga?.number || '—'}. ${panchang.yoga?.name || '—'}`],
    ['करण',   panchang.karana?.name || '—'],
  ];
  let y = doc.y;
  for (const [label, val] of panItems) { infoRow(doc, label, val, y); y += 16; }
  doc.y = y + 8;

  // Lucky factors block
  drawLuckyFactors(doc, data.nakshatra, data.lagna);

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 3 — आपका लग्न
  // ══════════════════════════════════════════════════════════════════════════
  newSectionPage(doc);
  drawPageHeader(doc, 'आपका लग्न', lagnaH ? lagnaH.title : '');

  // Decorative zodiac mandala accent (right-side, beside intro text)
  if (fs.existsSync(IMG_MANDALA)) {
    try {
      const mSz = 90;
      const mX  = doc.page.width - mSz - 40;
      const mY  = doc.y;
      doc.image(IMG_MANDALA, mX, mY, { width: mSz, height: mSz });
      // Gold circle frame
      doc.circle(mX + mSz / 2, mY + mSz / 2, mSz / 2 + 2)
         .lineWidth(0.8).strokeColor(GOLD).stroke();
    } catch (_) {}
  }

  if (lagnaH) {
    doc.fontSize(8.5).fillColor(GREY).font('Nirmala')
       .text('लग्न कुण्डली का वह बिन्दु है जो पृथ्वी के पूर्व क्षितिज पर उदय हो रहा था। यह आपके जीवन, शरीर और व्यक्तित्व का आधार है।',
             50, doc.y, { width: doc.page.width - 100 });
    doc.moveDown(0.8);

    subSectionTitle(doc, '1. लग्न क्या है ?');
    readingBlock(doc, `आपकी कुण्डली में ${lagnaH.rashi} राशि लग्न में है। ${lagnaH.title.split('—').slice(1).join('').trim()}। लग्न आपके जीवन, शरीर और प्रकृति को निर्धारित करता है।`);

    checkPage(doc, 100);
    subSectionTitle(doc, '2. स्वास्थ्य एवं शरीर');
    readingPair(doc, 'शारीरिक संरचना', lagnaH.sharir);
    readingPair(doc, 'स्वास्थ्य विवेचन', lagnaH.swasthya);

    checkPage(doc, 120);
    subSectionTitle(doc, '3. स्वभाव एवं व्यक्तित्व');
    readingPair(doc, 'मूल स्वभाव', lagnaH.svabhav);
    readingPair(doc, 'चरित्र', lagnaH.charitra);
    readingPair(doc, 'मुख्य शक्तियाँ', lagnaH.bal);
    readingPair(doc, 'जीवन की चुनौतियाँ', lagnaH.chunauti);

    checkPage(doc, 60);
    subSectionTitle(doc, '4. धर्म एवं जीवन-लक्ष्य');
    readingPair(doc, 'जीवन-धर्म', lagnaH.dharma);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 4 — नक्षत्र फल
  // ══════════════════════════════════════════════════════════════════════════
  newSectionPage(doc);
  drawPageHeader(doc, 'नक्षत्र फल', `${hiNak(data.nakshatra)} — चरण ${data.nakshatra_pada || '—'} | स्वामी: ${hi(data.nakshatra_lord) || '—'}`);

  doc.fontSize(8.5).fillColor(GREY).font('Nirmala')
     .text('नक्षत्र चन्द्रमा की स्थिति के आधार पर निर्धारित होता है। जन्म नक्षत्र आपके मन, स्वभाव और जीवन की मूल धारा को दर्शाता है। 27 नक्षत्रों में से प्रत्येक की अपनी विशेष देवता, गुण और प्रभाव होते हैं।',
           50, doc.y, { width: doc.page.width - 100 });
  doc.moveDown(0.8);

  if (naksAttr) {
    sectionTitle(doc, 'नक्षत्र गुण सारणी');
    b = doc.y;
    doc.roundedRect(40, b, doc.page.width - 80, 88, 4).fill(LIGHT);
    const cellW = (doc.page.width - 80) / 3;
    const attrList = [
      ['वर्ण', naksAttr.varna], ['गण', naksAttr.gana],
      ['योनि', naksAttr.yoni],  ['नाड़ी', naksAttr.nadi],
      ['वश्य', naksAttr.vasya], ['स्वामी', hi(data.nakshatra_lord) || '—'],
    ];
    attrList.forEach(([label, val], i) => {
      const cx2 = 48 + (i % 3) * cellW;
      const cy2 = b + 12 + Math.floor(i / 3) * 38;
      doc.fontSize(7.5).fillColor(LGREY).font('Nirmala').text(label, cx2, cy2, { width: cellW - 8 });
      doc.fontSize(13).fillColor(DARK).font('NirmalaB').text(val || '—', cx2, cy2 + 13, { width: cellW - 8 });
    });
    doc.y = b + 98;
  }

  sectionTitle(doc, 'नक्षत्र फल विवेचन');
  if (naksH) readingBlock(doc, naksH);

  checkPage(doc, 80);
  sectionTitle(doc, 'चन्द्र फल — मन एवं भावनाएँ');
  doc.fontSize(8.5).fillColor(GREY).font('Nirmala')
     .text(`आपका चन्द्रमा ${hi(data.moon_sign)} राशि में स्थित है।`, 50, doc.y);
  doc.moveDown(0.3);
  if (moonH) readingBlock(doc, moonH);

  checkPage(doc, 80);
  sectionTitle(doc, 'सूर्य फल — आत्मा एवं अहम्');
  doc.fontSize(8.5).fillColor(GREY).font('Nirmala')
     .text(`आपका सूर्य ${hi(data.sun_sign)} राशि में स्थित है।`, 50, doc.y);
  doc.moveDown(0.3);
  if (sunH) readingBlock(doc, sunH);

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 5 — विस्तृत भविष्यफल (10 जीवन-क्षेत्र)
  // ══════════════════════════════════════════════════════════════════════════
  newSectionPage(doc);
  drawPageHeader(doc, 'विस्तृत भविष्यफल', 'दस जीवन-क्षेत्रों का सम्पूर्ण विश्लेषण');

  doc.fontSize(8.5).fillColor(GREY).font('Nirmala')
     .text('नीचे दिए गए फल आपके लग्न, राशि और ग्रह स्थितियों के आधार पर पाराशरी परम्परा में निर्धारित हैं। ये जीवन के दस प्रमुख क्षेत्रों का सम्पूर्ण विश्लेषण प्रस्तुत करते हैं।',
           50, doc.y, { width: doc.page.width - 100 });
  doc.moveDown(0.8);

  if (lagnaH) {
    const moonDomain  = MOON_DOMAIN_HINDI[data.moon_sign]  || {};
    const lord10      = hl['10'] || null;
    const lord2       = hl['2']  || null;
    const lord5       = hl['5']  || null;
    const career10    = lord10 ? (PLANET_CAREER_HINDI[lord10] || null) : null;
    const vitta2      = lord2  ? (PLANET_VITTA_HINDI[lord2]  || null) : null;
    const vidya5      = lord5  ? (PLANET_VIDYA_HINDI[lord5]  || null) : null;

    // Planets placed in 7th and 10th houses — brief contextual note
    const planets7  = (hp['7']  || []).filter(Boolean);
    const planets10 = (hp['10'] || []).filter(Boolean);
    const PLANET_HI = { Sun:'सूर्य', Moon:'चन्द्र', Mars:'मंगल', Mercury:'बुध', Jupiter:'गुरु', Venus:'शुक्र', Saturn:'शनि', Rahu:'राहु', Ketu:'केतु' };
    const p7note    = planets7.length  ? `सप्तम भाव में ${planets7.map(p => PLANET_HI[p] || p).join(', ')} स्थित हैं — इनका विवाह और साझेदारी पर विशेष प्रभाव है।` : null;
    const p10note   = planets10.length ? `दशम भाव में ${planets10.map(p => PLANET_HI[p] || p).join(', ')} स्थित हैं — ये ग्रह आपके कार्यक्षेत्र और सफलता को सीधे प्रभावित करते हैं।` : null;

    const lifeAreas = [
      ['1. चरित्र एवं आचरण',      lagnaH.charitra,     moonDomain.charitra],
      ['2. सौभाग्य एवं विवाह',    lagnaH.saubhagya,    [moonDomain.vivah, p7note].filter(Boolean).join(' ') || null],
      ['3. जीवनशैली',             lagnaH.jeevan_shaili, moonDomain.jeevan_shaili],
      ['4. रोजगार',               lagnaH.rozgar,        [career10, p10note].filter(Boolean).join(' ') || null],
      ['5. व्यवसाय',              lagnaH.vyavsay,       [career10, p10note].filter(Boolean).join(' ') || null],
      ['6. स्वास्थ्य',            lagnaH.swasthya,      moonDomain.swasthya],
      ['7. रुचि एवं शौक',         lagnaH.ruchi,         moonDomain.ruchi],
      ['8. प्रेम एवं सम्बन्ध',    lagnaH.prem,          [moonDomain.prem, p7note].filter(Boolean).join(' ') || null],
      ['9. वित्त एवं धन',         lagnaH.vitta,         vitta2],
      ['10. शिक्षा एवं विद्या',   lagnaH.shiksha,       vidya5],
    ];

    for (const [areaTitle, areaText, extraText] of lifeAreas) {
      checkPage(doc, 60);
      sectionTitle(doc, areaTitle, '#1E3A5F');
      if (areaText) readingBlock(doc, areaText, CREAM);
      if (extraText) readingBlock(doc, extraText, CREAM);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 5B — ग्रह फल विवेचन (planet-in-house readings)
  // ══════════════════════════════════════════════════════════════════════════
  newSectionPage(doc);
  drawPageHeader(doc, 'ग्रह फल विवेचन', 'प्रत्येक ग्रह का भाव-स्थिति अनुसार फल');

  doc.fontSize(8.5).fillColor(GREY).font('Nirmala')
     .text('नीचे आपकी जन्मकुण्डली में प्रत्येक ग्रह की भाव स्थिति के अनुसार फल दिए गए हैं। यह फल पाराशरी सिद्धांत पर आधारित हैं।',
           50, doc.y, { width: doc.page.width - 100 });
  doc.moveDown(0.8);

  const PLANET_HI_NAMES = {
    Sun:'सूर्य', Moon:'चन्द्र', Mars:'मंगल', Mercury:'बुध',
    Jupiter:'गुरु', Venus:'शुक्र', Saturn:'शनि', Rahu:'राहु', Ketu:'केतु'
  };
  const BHAVA_HI = ['','प्रथम','द्वितीय','तृतीय','चतुर्थ','पंचम','षष्ठ','सप्तम','अष्टम','नवम','दशम','एकादश','द्वादश'];

  for (const pName of PLANET_ORDER) {
    const pos = pp[pName];
    if (!pos) continue;
    const houseNum = parseInt(pos.house);
    if (!houseNum || houseNum < 1 || houseNum > 12) continue;
    const reading = GRAHA_BHAVA_HINDI[pName]?.[houseNum];
    if (!reading) continue;
    checkPage(doc, 70);
    sectionTitle(doc, `${PLANET_HI_NAMES[pName]} — ${BHAVA_HI[houseNum]} भाव (${hi(pos.sign)})`, '#1E3A5F');
    readingBlock(doc, reading, CREAM);
    doc.moveDown(0.2);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 5C — ग्रह विचार (ग्रह-राशि संयोग)
  // ══════════════════════════════════════════════════════════════════════════
  newSectionPage(doc);
  drawPageHeader(doc, 'ग्रह विचार', 'ग्रह-राशि संयोग फल — नवग्रहों का राशिगत विश्लेषण');

  doc.fontSize(8.5).fillColor(GREY).font('Nirmala')
     .text('प्रत्येक ग्रह जिस राशि में स्थित होता है, उसके अनुसार उसका स्वभाव और फल बदलता है। नीचे नवग्रहों का राशिगत विचार प्रस्तुत है।',
           50, doc.y, { width: doc.page.width - 100 });
  doc.moveDown(0.8);

  const lagnaSign = data.lagna || '';
  for (const pName of PLANET_ORDER) {
    const pos = pp[pName];
    if (!pos) continue;
    const sign = pos.sign;
    if (!sign) continue;
    const rashi = GRAHA_RASHI_HINDI[pName]?.[sign];
    if (!rashi) continue;
    const dignityHi = getPlanetDignityHi(pName, sign);
    const lordedHi  = lagnaSign ? getLordedHousesHi(pName, lagnaSign) : '';
    const subLabel  = lordedHi
      ? `${PLANET_HI_NAMES[pName]} — ${hi(sign)} (${dignityHi}) | भाव-स्वामित्व: ${lordedHi}`
      : `${PLANET_HI_NAMES[pName]} — ${hi(sign)} (${dignityHi})`;
    checkPage(doc, 70);
    sectionTitle(doc, subLabel, '#2C1B6E');
    readingBlock(doc, rashi, '#F5F0FF');
    doc.moveDown(0.2);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 5D — ग्रह दृष्टि (Graha Drishti)
  // ══════════════════════════════════════════════════════════════════════════
  checkPage(doc, 220);
  sectionTitle(doc, 'ग्रह दृष्टि — नवग्रहों की दृष्टि', '#1A4D2E');
  doc.fontSize(8).fillColor(GREY).font('Nirmala')
     .text('प्रत्येक ग्रह जिस भाव में बैठा है वहाँ से सप्तम भाव पर दृष्टि डालता है। मंगल की ४थी-८वीं, गुरु की ५वीं-९वीं और शनि की ३री-१०वीं विशेष दृष्टि भी होती है।',
           50, doc.y, { width: doc.page.width - 100 });
  doc.moveDown(0.5);

  {
    const BHAVA_ORDINAL_HI = ['','१','२','३','४','५','६','७','८','९','१०','११','१२'];
    const EXTRA_ASPECT_OFFSETS = { Mars: [3, 7], Jupiter: [4, 8], Saturn: [2, 9] };
    const cols = ['ग्रह', 'स्थान (भाव)', 'राशि', 'दृष्टि भाव'];
    const widths = [80, 90, 100, doc.page.width - 80 - 90 - 100 - 80];
    let ty = doc.y;
    ty = tableHeader(doc, cols, widths, ty);
    let shade = false;
    for (const pName of PLANET_ORDER) {
      const pos = pp[pName];
      if (!pos) continue;
      const houseNum = parseInt(pos.house);
      if (!houseNum || houseNum < 1 || houseNum > 12) continue;
      const aspectedHouses = [((houseNum - 1 + 6) % 12) + 1];
      (EXTRA_ASPECT_OFFSETS[pName] || []).forEach(off => {
        aspectedHouses.push(((houseNum - 1 + off) % 12) + 1);
      });
      const aspectStr = aspectedHouses.map(h => `${BHAVA_ORDINAL_HI[h]}वाँ`).join(', ');
      checkPage(doc, 20);
      ty = doc.y;
      ty = tableRow(doc,
        [PLANET_HI_NAMES[pName], `${BHAVA_ORDINAL_HI[houseNum]}वाँ भाव`, hi(pos.sign), aspectStr],
        widths, ty, shade);
      doc.y = ty;
      shade = !shade;
    }
    doc.moveDown(0.5);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 5E — वर्षफल (ताजिक — सौर-वापसी)
  // ══════════════════════════════════════════════════════════════════════════
  newSectionPage(doc);
  {
    const vp = varshaphal;
    const vpYear = vp?.year || new Date().getFullYear();
    drawPageHeader(doc, `वर्षफल ${vpYear}`, 'ताजिक पद्धति — सौर-वापसी कुण्डली');

    if (!vp) {
      doc.fontSize(9).fillColor(GREY).font('Nirmala')
         .text('वर्षफल गणना के लिए Swiss Ephemeris आवश्यक है। कृपया सर्वर पर sweph मॉड्यूल सुनिश्चित करें।', 50, doc.y, { width: doc.page.width - 100 });
    } else {
      // Summary info box
      checkPage(doc, 80);
      let b2 = doc.y;
      doc.roundedRect(40, b2, doc.page.width - 80, 64, 4).fill(CREAM);
      infoRow(doc, 'वर्ष',             String(vp.year),                   b2 + 8);
      infoRow(doc, 'आयु',              `${vp.age} वर्ष`,                  b2 + 24);
      infoRow(doc, 'सौर वापसी तिथि',  `${vp.return_date}  ${vp.return_time_local}`, b2 + 40);
      doc.y = b2 + 74;

      const hw = (doc.page.width - 80) / 2 - 8;
      checkPage(doc, 50);
      b2 = doc.y;
      doc.roundedRect(40, b2, doc.page.width - 80, 36, 4).fill(LIGHT);
      infoRowCompact(doc, 'वर्ष लग्न',    `${hi(vp.varsha_lagna)} (${hi(vp.varsha_lord)})`, 48, b2 + 10, 100);
      infoRowCompact(doc, 'मुन्था',        `${hi(vp.muntha.sign)} — ${BHAVA_HI[vp.muntha.house]} भाव`, 48 + hw, b2 + 10, 100);
      doc.y = b2 + 46;

      // Varsha Lagna interpretation
      const vlInterp = VARSHAPHAL_LAGNA_HINDI[vp.varsha_lagna];
      if (vlInterp) {
        sectionTitle(doc, `वर्ष लग्न — ${hi(vp.varsha_lagna)} (${hi(vp.varsha_lord)})`, '#1E5F3A');
        readingBlock(doc, vlInterp, '#F0FFF4');
      }

      // Muntha interpretation
      const munthaInterp = MUNTHA_HOUSE_HINDI[vp.muntha.house];
      if (munthaInterp) {
        checkPage(doc, 60);
        sectionTitle(doc, `मुन्था — ${hi(vp.muntha.sign)} (${BHAVA_HI[vp.muntha.house]} भाव)`, '#3A1E5F');
        readingBlock(doc, munthaInterp, '#F8F0FF');
      }

      // Zodiac mandala accent centered between interpretations and annual table
      if (fs.existsSync(IMG_MANDALA)) {
        try {
          checkPage(doc, 130);
          const mSz2 = 110;
          doc.moveDown(0.4);
          // Faint gold circle behind the mandala
          doc.circle(doc.page.width / 2, doc.y + mSz2 / 2, mSz2 / 2 + 4)
             .fillColor('#1A1A2E').fill();
          doc.image(IMG_MANDALA, (doc.page.width - mSz2) / 2, doc.y,
                    { width: mSz2, height: mSz2 });
          doc.circle(doc.page.width / 2, doc.y + mSz2 / 2, mSz2 / 2 + 4)
             .lineWidth(1).strokeColor(GOLD).stroke();
          // Decorative label
          doc.y += mSz2 + 6;
          doc.fontSize(8).fillColor(GOLD).font('NirmalaB')
             .text(`वर्ष ${vp.year} — सौर-वापसी कुण्डली`, 0, doc.y,
                   { align: 'center', width: doc.page.width });
          doc.moveDown(0.6);
        } catch (_) {}
      }

      // Annual planets table
      checkPage(doc, 150);
      sectionTitle(doc, 'वार्षिक ग्रह स्थिति (सौर-वापसी कुण्डली)', '#1E3A5F');
      {
        const BHAVA_ORDINAL_HI2 = ['','१','२','३','४','५','६','७','८','९','१०','११','१२'];
        const vpCols = ['ग्रह', 'राशि', 'भाव', 'नक्षत्र', 'वक्री'];
        const vpWidths = [70, 90, 70, 130, doc.page.width - 80 - 70 - 90 - 70 - 130];
        let vty = doc.y;
        vty = tableHeader(doc, vpCols, vpWidths, vty);
        let shade2 = false;
        for (const pName of PLANET_ORDER) {
          const vpos = vp.planets[pName];
          if (!vpos) continue;
          checkPage(doc, 20);
          vty = doc.y;
          vty = tableRow(doc, [
            PLANET_HI_NAMES[pName],
            hi(vpos.sign),
            `${BHAVA_ORDINAL_HI2[vpos.house]}वाँ`,
            hiNak(vpos.nakshatra),
            vpos.retrograde ? 'वक्री' : '—'
          ], vpWidths, vty, shade2);
          doc.y = vty;
          shade2 = !shade2;
        }
        doc.moveDown(0.5);
      }

      // Mudda Dasha table
      checkPage(doc, 200);
      sectionTitle(doc, `मुद्दा दशा — वर्ष ${vp.year}`, '#5F3A1E');
      doc.fontSize(8).fillColor(GREY).font('Nirmala')
         .text('मुद्दा दशा वर्षफल की वार्षिक दशा है। यह वर्ष के ३६५ दिनों में विभिन्न ग्रहों के प्रभाव-काल को दर्शाती है।', 50, doc.y, { width: doc.page.width - 100 });
      doc.moveDown(0.4);
      {
        const mdCols = ['ग्रह', 'आरम्भ', 'समाप्ति', 'दिन', 'फल'];
        const mdWidths = [70, 90, 90, 50, doc.page.width - 80 - 70 - 90 - 90 - 50];
        let mty = doc.y;
        mty = tableHeader(doc, mdCols, mdWidths, mty);
        let shade3 = false;
        const today = now.toISOString().slice(0, 10);
        for (const md of vp.mudda_dasha) {
          const isCurrent = today >= md.start && today < md.end;
          checkPage(doc, 20);
          mty = doc.y;
          mty = tableRow(doc, [
            (isCurrent ? '▶ ' : '') + (MUDDA_PLANET_HINDI[md.planet]?.name || hi(md.planet)),
            md.start, md.end, String(md.days),
            MUDDA_PLANET_HINDI[md.planet]?.desc || '—'
          ], mdWidths, mty, shade3 || isCurrent);
          doc.y = mty;
          shade3 = !shade3;
        }
        doc.moveDown(0.5);
      }
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 5F — जैमिनि पद्धति
  // ══════════════════════════════════════════════════════════════════════════
  if (jaimini) {
    newSectionPage(doc);
    drawPageHeader(doc, 'जैमिनि पद्धति', 'चर कारक | कारकांश | स्वांश | चर दशा');

    // Chara Karaka table
    sectionTitle(doc, 'चर कारक — नवग्रहों का कारकत्व', '#1E3A5F');
    doc.fontSize(8).fillColor(GREY).font('Nirmala')
       .text('जैमिनि पद्धति में ७ ग्रहों को उनकी राशि-अंश (उच्चतम से निम्नतम) के अनुसार कारक पद दिए जाते हैं। सबसे अधिक अंश वाला ग्रह आत्मकारक बनता है।',
             50, doc.y, { width: doc.page.width - 100 });
    doc.moveDown(0.4);
    {
      const ckCols = ['कारक', 'ग्रह', 'राशि-अंश', 'विवेचन'];
      const ckWidths = [100, 70, 80, doc.page.width - 80 - 100 - 70 - 80];
      let cky = doc.y;
      cky = tableHeader(doc, ckCols, ckWidths, cky);
      let shade = false;
      for (const ck of jaimini.charaKarakas) {
        checkPage(doc, 20);
        cky = doc.y;
        const desc = JAIMINI_KARAKA_HINDI[ck.karaka]?.desc || '—';
        cky = tableRow(doc, [
          JAIMINI_KARAKA_HINDI[ck.karaka]?.hi || ck.karaka_hi,
          PLANET_HI_NAMES[ck.planet] || ck.planet,
          `${ck.degree.toFixed(2)}°`,
          desc.length > 80 ? desc.slice(0, 78) + '…' : desc
        ], ckWidths, cky, shade);
        doc.y = cky;
        shade = !shade;
      }
      doc.moveDown(0.5);
    }

    // Atmakaraka and Karakamsha
    if (jaimini.atmakaraka) {
      checkPage(doc, 80);
      sectionTitle(doc, `आत्मकारक — ${PLANET_HI_NAMES[jaimini.atmakaraka] || jaimini.atmakaraka}`, '#5F1E1E');
      readingBlock(doc, JAIMINI_KARAKA_HINDI.Atmakaraka.desc, '#FFF5F0');
    }
    if (jaimini.karakamsha) {
      checkPage(doc, 80);
      sectionTitle(doc, `कारकांश — ${hi(jaimini.karakamsha)}`, '#1E5F3A');
      const kmInterp = KARAKAMSHA_HINDI[jaimini.karakamsha];
      if (kmInterp) readingBlock(doc, kmInterp, '#F0FFF4');
    }

    // Chara Dasha table
    checkPage(doc, 200);
    sectionTitle(doc, 'चर दशा — जैमिनि राशि दशा क्रम', '#3A5F1E');
    doc.fontSize(8).fillColor(GREY).font('Nirmala')
       .text('जैमिनि चर दशा में लग्न राशि से आरम्भ होकर प्रत्येक राशि की अपनी दशा-अवधि होती है जो राशि स्वामी की स्थिति के अनुसार निर्धारित होती है।',
             50, doc.y, { width: doc.page.width - 100 });
    doc.moveDown(0.4);
    {
      const cdCols = ['राशि', 'स्वामी', 'वर्ष'];
      const cdWidths = [110, 90, 60];
      let cdy = doc.y;
      cdy = tableHeader(doc, cdCols, cdWidths, cdy);
      let shade = false;
      for (const cd of jaimini.charaDashas) {
        checkPage(doc, 20);
        cdy = doc.y;
        cdy = tableRow(doc, [hi(cd.sign), PLANET_HI_NAMES[cd.lord] || cd.lord, String(cd.years)], cdWidths, cdy, shade);
        doc.y = cdy;
        shade = !shade;
      }
      doc.moveDown(0.5);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 5G — K.P. पद्धति
  // ══════════════════════════════════════════════════════════════════════════
  if (kpData) {
    newSectionPage(doc);
    drawPageHeader(doc, 'K.P. पद्धति', 'कृष्णमूर्ति पद्धति — नक्षत्र स्वामी एवं उप-स्वामी');

    doc.fontSize(8.5).fillColor(GREY).font('Nirmala')
       .text(KP_INTRO_HINDI, 50, doc.y, { width: doc.page.width - 100 });
    doc.moveDown(0.8);

    // KP Planets table
    sectionTitle(doc, 'ग्रहों का K.P. विश्लेषण — नक्षत्र स्वामी | उप-स्वामी', '#1E3A5F');
    {
      const kpCols = ['ग्रह', 'राशि', 'भाव', 'नक्षत्र स्वामी', 'उप-स्वामी', 'उप-उप-स्वामी'];
      const kpW = [60, 75, 45, 95, 95, doc.page.width - 80 - 60 - 75 - 45 - 95 - 95];
      let kty = doc.y;
      kty = tableHeader(doc, kpCols, kpW, kty);
      let shade = false;
      for (const pName of PLANET_ORDER) {
        const kp = kpData.kpPlanets[pName];
        if (!kp) continue;
        checkPage(doc, 20);
        kty = doc.y;
        kty = tableRow(doc, [
          PLANET_HI_NAMES[pName],
          hi(kp.sign),
          kp.house ? `${kp.house}` : '—',
          PLANET_HI_NAMES[kp.star_lord]    || kp.star_lord,
          PLANET_HI_NAMES[kp.sub_lord]     || kp.sub_lord,
          PLANET_HI_NAMES[kp.sub_sub_lord] || kp.sub_sub_lord
        ], kpW, kty, shade);
        doc.y = kty;
        shade = !shade;
      }
      doc.moveDown(0.8);
    }

    // KP Cusps table (house 1-12)
    if (Object.keys(kpData.kpCusps).length > 0) {
      checkPage(doc, 200);
      sectionTitle(doc, 'भाव स्पंद K.P. विश्लेषण — भावों के उप-स्वामी', '#5F3A1E');
      doc.fontSize(8).fillColor(GREY).font('Nirmala')
         .text('भाव स्पंद का उप-स्वामी (Cuspal Sub-Lord) उस भाव के फल प्राप्ति का निर्धारण करता है।', 50, doc.y, { width: doc.page.width - 100 });
      doc.moveDown(0.4);
      {
        const BHAVA_ORDINAL_HI3 = ['','१','२','३','४','५','६','७','८','९','१०','११','१२'];
        const ccCols = ['भाव', 'राशि', 'नक्षत्र स्वामी', 'उप-स्वामी', 'उप-उप-स्वामी'];
        const ccW = [55, 75, 110, 110, doc.page.width - 80 - 55 - 75 - 110 - 110];
        let ccy = doc.y;
        ccy = tableHeader(doc, ccCols, ccW, ccy);
        let shade = false;
        for (let h = 1; h <= 12; h++) {
          const kc = kpData.kpCusps[h];
          if (!kc) continue;
          checkPage(doc, 20);
          ccy = doc.y;
          ccy = tableRow(doc, [
            `${BHAVA_ORDINAL_HI3[h]}वाँ`,
            hi(kc.sign),
            PLANET_HI_NAMES[kc.star_lord]    || kc.star_lord,
            PLANET_HI_NAMES[kc.sub_lord]     || kc.sub_lord,
            PLANET_HI_NAMES[kc.sub_sub_lord] || kc.sub_sub_lord
          ], ccW, ccy, shade);
          doc.y = ccy;
          shade = !shade;
        }
        doc.moveDown(0.5);
      }
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 6 — मंगल दोष विवेचन
  // ══════════════════════════════════════════════════════════════════════════
  newSectionPage(doc);
  drawPageHeader(doc, 'मंगल दोष विवेचन', 'कुज दोष | विवाह एवं वैवाहिक जीवन');

  doc.fontSize(8.5).fillColor(GREY).font('Nirmala')
     .text('मंगल दोष (कुज दोष) वैवाहिक जीवन को प्रभावित करने वाला महत्वपूर्ण ग्रहदोष है। जब मंगल ग्रह लग्न, चतुर्थ, सप्तम, अष्टम या द्वादश भाव में होता है तो यह दोष बनता है।',
           50, doc.y, { width: doc.page.width - 100 });
  doc.moveDown(0.8);

  const mdData = mangalDosha ? MANGAL_DOSHA_HINDI.present : MANGAL_DOSHA_HINDI.absent;
  sectionTitle(doc, mdData.title, mangalDosha ? '#8B1A1A' : '#1A5C1A');
  readingBlock(doc, mdData.desc, mangalDosha ? '#FFF5F5' : '#F5FFF5');

  if (mangalDosha) {
    checkPage(doc, 60);
    sectionTitle(doc, 'मंगल दोष के प्रभाव');
    readingBlock(doc, MANGAL_DOSHA_HINDI.present.effects);
    checkPage(doc, 80);
    sectionTitle(doc, 'मंगल दोष निवारण के उपाय');
    bulletList(doc, MANGAL_DOSHA_HINDI.present.remedies);
  }

  // Mars position detail
  const marsPos = pp['Mars'];
  if (marsPos) {
    checkPage(doc, 60);
    sectionTitle(doc, 'मंगल की जन्मकालीन स्थिति');
    y = doc.y;
    infoRow(doc, 'मंगल राशि',  hi(marsPos.sign) || '—', y);
    infoRow(doc, 'मंगल भाव',   marsPos.house || '—',     y + 16);
    infoRow(doc, 'नक्षत्र',    hiNak(marsPos.nakshatra)+'  चरण '+(marsPos.nakshatra_pada||''), y + 32);
    infoRow(doc, 'स्थिति',     marsPos.retrograde ? 'वक्री' : 'मार्गी', y + 48);
    doc.y = y + 64;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 7 — कालसर्प दोष/योग
  // ══════════════════════════════════════════════════════════════════════════
  newSectionPage(doc);
  drawPageHeader(doc, 'कालसर्प दोष / योग', 'राहु-केतु अक्ष पर ग्रह स्थिति');

  doc.fontSize(8.5).fillColor(GREY).font('Nirmala')
     .text('जब जन्मकुण्डली के सभी सात मुख्य ग्रह राहु और केतु की धुरी के एक ओर आ जाते हैं तो कालसर्प दोष या योग बनता है। यह एक महत्वपूर्ण ग्रह संयोजन है जिसका जीवन पर गहरा प्रभाव पड़ता है।',
           50, doc.y, { width: doc.page.width - 100 });
  doc.moveDown(0.8);

  const ksData = kalsarp === 'dosha' ? KALSARP_HINDI.dosha : kalsarp === 'yoga' ? KALSARP_HINDI.yoga : KALSARP_HINDI.absent;
  const ksBg   = kalsarp === 'dosha' ? '#FFF0F0' : kalsarp === 'yoga' ? '#FFFFF0' : '#F0FFF0';
  sectionTitle(doc, ksData.title);
  readingBlock(doc, ksData.desc, ksBg);

  if (kalsarp === 'dosha') {
    checkPage(doc, 60);
    sectionTitle(doc, 'कालसर्प दोष के प्रभाव');
    readingBlock(doc, KALSARP_HINDI.dosha.effects);
    checkPage(doc, 80);
    sectionTitle(doc, 'कालसर्प दोष निवारण के उपाय');
    bulletList(doc, KALSARP_HINDI.dosha.remedies);
  }

  // Rahu/Ketu positions
  checkPage(doc, 80);
  sectionTitle(doc, 'राहु-केतु की जन्मकालीन स्थिति');
  const rahuPos = pp['Rahu'];
  const ketuPos = pp['Ketu'];
  y = doc.y;
  if (rahuPos) {
    infoRow(doc, 'राहु राशि', hi(rahuPos.sign) || '—', y);
    infoRow(doc, 'राहु भाव',  rahuPos.house || '—',     y + 16);
    y += 32;
  }
  if (ketuPos) {
    infoRow(doc, 'केतु राशि', hi(ketuPos.sign) || '—', y);
    infoRow(doc, 'केतु भाव',  ketuPos.house || '—',     y + 16);
    y += 32;
  }
  doc.y = y + 8;

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 8 — साढ़े सात (Sade Sati)
  // ══════════════════════════════════════════════════════════════════════════
  newSectionPage(doc);
  drawPageHeader(doc, 'साढ़े सात रिपोर्ट', 'शनि गोचर एवं चन्द्र राशि');

  doc.fontSize(8.5).fillColor(GREY).font('Nirmala')
     .text(SADE_SATI_HINDI.description, 50, doc.y, { width: doc.page.width - 100 });
  doc.moveDown(0.8);

  if (sadeSati) {
    if (sadeSati.active) {
      sectionTitle(doc, `साढ़ेसाती सक्रिय — ${SADE_SATI_HINDI.phases[sadeSati.phase].name}`, '#8B4A00');
      const ph = SADE_SATI_HINDI.phases[sadeSati.phase];
      readingBlock(doc, ph.desc, '#FFF8EE');
      checkPage(doc, 60);
      y = doc.y;
      infoRow(doc, 'वर्तमान शनि राशि', hi(sadeSati.saturnSign) || '—', y);
      infoRow(doc, 'आपकी चन्द्र राशि',  hi(data.moon_sign) || '—',     y + 16);
      doc.y = y + 32;
    } else if (sadeSati.dhaiya) {
      sectionTitle(doc, SADE_SATI_HINDI.shani_dhaiya.title, '#5C4000');
      readingBlock(doc, SADE_SATI_HINDI.shani_dhaiya.desc, '#FFFAEE');
    } else {
      sectionTitle(doc, 'साढ़ेसाती नहीं', '#1A5C1A');
      readingBlock(doc, 'वर्तमान में शनि आपकी चन्द्र राशि से 12वें, 1ले या 2रे भाव में नहीं है। साढ़ेसाती का प्रभाव नहीं है।', '#F0FFF0');
    }
  }

  checkPage(doc, 80);
  sectionTitle(doc, 'साढ़ेसाती के तीन चरण');
  for (const [key, ph] of Object.entries(SADE_SATI_HINDI.phases)) {
    checkPage(doc, 50);
    doc.fillColor(GOLD).fontSize(9).font('NirmalaB').text(`▸ ${ph.name}`, 50, doc.y);
    doc.moveDown(0.15);
    readingBlock(doc, ph.desc, CREAM);
    doc.moveDown(0.2);
  }

  checkPage(doc, 100);
  sectionTitle(doc, 'साढ़ेसाती निवारण के उपाय');
  bulletList(doc, SADE_SATI_HINDI.remedies);

  // Future Sade Sati occurrences table
  const birthYear = birthInfo.dob ? parseInt(birthInfo.dob.split('-')[0] || birthInfo.dob.split('/')[2] || new Date().getFullYear()) : new Date().getFullYear();
  const ssTable = computeSadeSatiLifetimeTable(birthYear, data.moon_sign);
  if (ssTable.length > 0) {
    checkPage(doc, 120);
    sectionTitle(doc, 'जीवन में साढ़ेसाती — भूत एवं भविष्य की पूर्ण तालिका');
    doc.fontSize(8).fillColor(GREY).font('Nirmala')
       .text(`चन्द्र राशि: ${hi(data.moon_sign) || data.moon_sign} — शनि जब इस राशि से 12वें, 1ले और 2रे भाव में होता है, तब साढ़ेसाती का प्रभाव रहता है।`,
             50, doc.y, { width: doc.page.width - 100 });
    doc.moveDown(0.5);
    const ssCols = ['साढ़ेसाती चरण', 'शनि राशि', 'प्रारम्भ वर्ष', 'समाप्ति वर्ष'];
    const ssWs   = [160, 100, 80, 80];
    let ssY = tableHeader(doc, ssCols, ssWs, doc.y);
    for (const [i, row] of ssTable.entries()) {
      checkPage(doc, 16);
      const isNow = parseInt(row.start) <= new Date().getFullYear() && parseInt(row.end) >= new Date().getFullYear();
      if (isNow) {
        doc.rect(40, ssY - 3, doc.page.width - 80, 14).fill('#FFF0E0');
        let tx = 40;
        const cells = [row.phase, row.saturnRashi, row.start, row.end];
        for (let ci = 0; ci < cells.length; ci++) {
          doc.fontSize(8).fillColor('#8B4500').font('NirmalaB').text(String(cells[ci]) + (ci === 0 ? ' ◄ वर्तमान' : ''), tx + 4, ssY, { width: ssWs[ci] - 6, lineBreak: false });
          tx += ssWs[ci];
        }
        ssY += 15;
      } else {
        ssY = tableRow(doc, [row.phase, row.saturnRashi, row.start, row.end], ssWs, ssY, i % 2 === 0);
      }
    }
    doc.y = ssY + 8;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 9 — ग्रह सारणी
  // ══════════════════════════════════════════════════════════════════════════
  newSectionPage(doc);
  drawPageHeader(doc, 'ग्रह सारणी', 'D-1 राशि कुण्डली — लाहिरी अयनांश');

  sectionTitle(doc, 'ग्रह स्थिति सारणी');
  const pCols = [L.planet, L.sign, L.house, 'देशांतर°', 'राश्यंश°', 'नक्षत्र', 'चरण', 'स्वामी', 'गति', 'स्थिति'];
  const pWs   = [52, 68, 30, 50, 50, 90, 26, 46, 36, 56];
  y = tableHeader(doc, pCols, pWs, doc.y);
  for (const [i, pName] of PLANET_ORDER.entries()) {
    const pos = pp[pName];
    if (!pos) continue;
    y = tableRow(doc, [
      hi(pName), hi(pos.sign), pos.house || '—',
      parseFloat(pos.degree || 0).toFixed(2),
      `${parseFloat(pos.sign_degree || 0).toFixed(2)}°`,
      hiNak(pos.nakshatra),
      pos.nakshatra_pada || '—',
      hi(pos.nakshatra_lord) || '—',
      parseFloat(pos.speed || 0).toFixed(3),
      pos.retrograde ? 'वक्री' : 'मार्गी'
    ], pWs, y, i % 2 === 0);
    if (y > doc.page.height - 80) { doc.addPage(); drawPageHeader(doc, 'ग्रह सारणी (जारी)', ''); y = 110; }
  }
  doc.y = y + 10;

  sectionTitle(doc, 'भाव सारणी — सम्पूर्ण राशि पद्धति');
  const hCols = [L.house, L.sign, L.house_lord, 'स्थित ग्रह'];
  const hWs   = [42, 90, 60, 300];
  y = tableHeader(doc, hCols, hWs, doc.y);
  for (let i = 1; i <= 12; i++) {
    const hSign = hc[`H${i}`]?.sign || '—';
    const planetsInHouse = (hp[i] || []).map(pn => hi(pn)).join(', ') || '—';
    y = tableRow(doc, [`${i}`, hi(hSign), hi(hl[i]) || '—', planetsInHouse], hWs, y, i % 2 === 0);
  }
  doc.y = y + 10;

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 10 — विभाजित कुण्डलियाँ
  // ══════════════════════════════════════════════════════════════════════════
  if (Object.keys(dc).length > 0) {
  newSectionPage(doc);
  drawPageHeader(doc, 'विभाजित कुण्डलियाँ', 'नवांश D-9 | होरा D-2 | द्रेक्काण D-3 | दशांश D-10');

  sectionTitle(doc, 'नवांश (D-9) — धर्म, विवाह एवं आत्मा');
  doc.fontSize(8).fillColor(GREY).font('Nirmala')
     .text('प्रत्येक राशि को 9 भागों में विभाजित किया जाता है — चर राशि से मेष, स्थिर से मकर, द्विस्वभाव से कर्क।', 50, doc.y);
  doc.moveDown(0.4);
  const nCols = [L.planet, 'D-1 राशि', 'नवांश राशि (D-9)'];
  const nWs   = [80, 120, 150];
  y = tableHeader(doc, nCols, nWs, doc.y);
  for (const [i, pName] of [...PLANET_ORDER, 'Lagna'].entries()) {
    const d1Sign  = pName === 'Lagna' ? data.lagna : pp[pName]?.sign;
    const navSign = nav[pName]?.sign;
    if (!d1Sign && !navSign) continue;
    y = tableRow(doc, [hi(pName), hi(d1Sign) || '—', hi(navSign) || '—'], nWs, y, i % 2 === 0);
  }
  doc.y = y + 8;

  const divEntries = [
    ['होरा (D-2) — धन एवं वित्त', dc.hora, 'सूर्य होरा (सिंह) या चन्द्र होरा (कर्क)'],
    ['द्रेक्काण (D-3) — भाई-बहन एवं पराक्रम', dc.drekkana, 'प्रत्येक राशि के 3 भाग (10° प्रत्येक)'],
    ['दशांश (D-10) — करियर एवं व्यवसाय', dc.dashamsha, 'प्रत्येक राशि के 10 भाग (3° प्रत्येक)'],
  ];
  for (const [title, divMap, desc] of divEntries) {
    checkPage(doc, 120);
    sectionTitle(doc, title);
    doc.fontSize(8).fillColor(GREY).font('Nirmala').text(desc, 50, doc.y);
    doc.moveDown(0.4);
    const dCols = [L.planet, 'D-1 राशि', 'विभाजित राशि'];
    const dWs   = [80, 120, 150];
    y = tableHeader(doc, dCols, dWs, doc.y);
    for (const [i, pName] of PLANET_ORDER.entries()) {
      const dSign = divMap?.[pName]?.sign;
      y = tableRow(doc, [hi(pName), hi(pp[pName]?.sign) || '—', hi(dSign) || '—'], dWs, y, i % 2 === 0);
    }
    doc.y = y + 8;
  }

  } // end divisional charts

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 11 — उपग्रह + शड्बल + भाव बल
  // ══════════════════════════════════════════════════════════════════════════
  const hasStrengthDataH = Object.keys(upgrahas).length > 0 || Object.keys(shadbala).length > 0 || Object.keys(bhavaBala).length > 0;
  if (hasStrengthDataH) {
  newSectionPage(doc);
  drawPageHeader(doc, 'उपग्रह एवं ग्रह बल', 'छाया बिन्दु | शड्बल | भाव बल');

  sectionTitle(doc, 'उपग्रह (छाया बिन्दु)');
  doc.fontSize(8).fillColor(GREY).font('Nirmala')
     .text('धूम = सूर्य + 133°20\' | व्यतीपात = 360° - धूम | परिधि = व्यतीपात + 180° | इन्द्रचाप = 360° - परिधि | उपकेतु = इन्द्रचाप + 16°40\'', 50, doc.y);
  doc.moveDown(0.4);
  const uCols = ['उपग्रह', 'देशांतर°', L.sign, 'राश्यंश°'];
  const uWs   = [100, 80, 100, 80];
  y = tableHeader(doc, uCols, uWs, doc.y);
  let uIdx = 0;
  for (const [uName, uData] of Object.entries(upgrahas)) {
    y = tableRow(doc, [uName, `${parseFloat(uData.degree || 0).toFixed(2)}°`, hi(uData.sign) || '—', `${parseFloat(uData.sign_degree || 0).toFixed(2)}°`], uWs, y, uIdx++ % 2 === 0);
  }
  doc.y = y + 10;

  sectionTitle(doc, 'भाव बल');
  const bCols = ['भाव', L.sign, 'भावेश', 'प्रकार', 'भावाधिपति', 'दिग्बल', 'दृष्टि', 'कुल', 'बल'];
  const bWs   = [34, 68, 54, 90, 56, 44, 44, 44, 50];
  y = tableHeader(doc, bCols, bWs, doc.y);
  for (let i = 1; i <= 12; i++) {
    const bb = bhavaBala[i];
    if (!bb) continue;
    y = tableRow(doc, [
      `${i}`, hi(bb.sign), hi(bb.lord),
      (bb.house_type || '').split(' ')[0],
      bb.bhavadhipati, bb.digbala, bb.drishti, bb.total, bb.strength
    ], bWs, y, i % 2 === 0);
    if (y > doc.page.height - 80) { doc.addPage(); y = 60; }
  }
  doc.y = y + 10;

  sectionTitle(doc, 'शड्बल — षट्विध ग्रह बल');
  const sCols = [L.planet, 'स्थान बल', 'दिग्बल', 'नैसर्गिक', 'चेष्टा बल', 'कुल', 'बल'];
  const sWs   = [70, 55, 55, 65, 55, 50, 60];
  y = tableHeader(doc, sCols, sWs, doc.y);
  for (const [i, pName] of ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'].entries()) {
    const sb = shadbala[pName];
    if (!sb) continue;
    y = tableRow(doc, [hi(pName), sb.sthana, sb.dig, sb.naisargika, sb.chesta, sb.total, sb.strength], sWs, y, i % 2 === 0);
  }
  doc.y = y + 10;

  } // end strength data

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 12 — विंशोत्तरी दशा
  // ══════════════════════════════════════════════════════════════════════════
  newSectionPage(doc);
  drawPageHeader(doc, 'विंशोत्तरी दशा', '120 वर्षीय ग्रह दशा पद्धति');

  const bal = data.dasha_balance;
  if (bal) {
    sectionTitle(doc, 'जन्मकालीन दशा शेष');
    y = doc.y;
    infoRow(doc, 'जन्म नक्षत्र स्वामी', hi(bal.planet), y);
    infoRow(doc, 'जन्म समय शेष',        `${bal.remaining_years} वर्ष (${bal.remaining_months} माह)`, y + 16);
    doc.y = y + 34;
  }

  sectionTitle(doc, 'महादशा क्रम (9 दशाएँ = 120 वर्ष)');
  const mCols = ['महादशा', 'वर्ष', 'आरम्भ', 'अंत', 'वर्तमान?'];
  const mWs   = [90, 40, 80, 80, 60];
  y = tableHeader(doc, mCols, mWs, doc.y);
  for (const [i, d] of dashas.entries()) {
    const isCurrent = new Date(d.start) <= now && new Date(d.end) >= now;
    y = tableRow(doc, [
      `${hi(d.planet)} दशा`, d.years, d.start, d.end, isCurrent ? '* सक्रिय' : ''
    ], mWs, y, i % 2 === 0);
  }
  doc.y = y + 10;

  if (currentMaha?.antardashas?.length) {
    checkPage(doc, 120);
    sectionTitle(doc, `अन्तर्दशा — ${hi(currentMaha.planet)} महादशा`);
    const aCols = ['अन्तर्दशा', 'आरम्भ', 'अंत', 'सक्रिय?'];
    const aWs   = [120, 80, 80, 60];
    y = tableHeader(doc, aCols, aWs, doc.y);
    for (const [i, a] of currentMaha.antardashas.entries()) {
      const isCurA = new Date(a.start) <= now && new Date(a.end) >= now;
      y = tableRow(doc, [`${hi(currentMaha.planet)}/${hi(a.planet)}`, a.start, a.end, isCurA ? '* सक्रिय' : ''], aWs, y, i % 2 === 0);
      if (y > doc.page.height - 60) { doc.addPage(); y = 60; }
    }
    doc.y = y + 10;
  }

  // Current dasha reading + antardasha-wise predictions
  if (dashaH && currentMaha) {
    checkPage(doc, 80);
    sectionTitle(doc, `वर्तमान दशा फल — ${dashaH.nama}`);
    readingBlock(doc, dashaH.reading);

    if (currentAntar) {
      checkPage(doc, 60);
      const antarDashaH = DASHA_HINDI[currentAntar.planet];
      sectionTitle(doc, `वर्तमान अन्तर्दशा — ${hi(currentMaha.planet)}/${hi(currentAntar.planet)}`);
      const y2 = doc.y;
      doc.roundedRect(40, y2, doc.page.width - 80, 36, 4).fill(LIGHT);
      infoRow(doc, 'अन्तर्दशा अवधि', `${currentAntar.start} से ${currentAntar.end}`, y2 + 10);
      doc.y = y2 + 46;
      if (antarDashaH) {
        readingBlock(doc, `${hi(currentMaha.planet)} महादशा में ${hi(currentAntar.planet)} अन्तर्दशा — ${antarDashaH.reading}`);
      }
    }

    // All antardasha predictions for current mahadasha
    if (currentMaha?.antardashas?.length > 3) {
      checkPage(doc, 80);
      sectionTitle(doc, `${hi(currentMaha.planet)} महादशा की सभी अन्तर्दशाओं का फल`);
      doc.fontSize(8).fillColor(GREY).font('Nirmala')
         .text('प्रत्येक अन्तर्दशा में महादशा की ऊर्जा और अन्तर्दशा ग्रह का मिश्रित प्रभाव जीवन पर पड़ता है।', 50, doc.y, { width: doc.page.width - 100 });
      doc.moveDown(0.5);
      for (const a of currentMaha.antardashas) {
        const aDashaH = DASHA_HINDI[a.planet];
        if (!aDashaH) continue;
        checkPage(doc, 50);
        const isCurA = new Date(a.start) <= now && new Date(a.end) >= now;
        doc.fillColor(isCurA ? SAFFRON : GOLD).fontSize(8.5).font('NirmalaB')
           .text(`▸ ${hi(currentMaha.planet)}/${hi(a.planet)} अन्तर्दशा (${a.start} – ${a.end})${isCurA ? '  ◄ वर्तमान' : ''}`, 50, doc.y);
        doc.moveDown(0.15);
        readingBlock(doc, aDashaH.reading, isCurA ? '#FFF8EE' : CREAM);
        doc.moveDown(0.2);
      }
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 13 — विशेष योग + वक्री ग्रह + समापन
  // ══════════════════════════════════════════════════════════════════════════
  newSectionPage(doc);
  drawPageHeader(doc, 'विशेष योग', 'पंचमहापुरुष एवं अन्य शुभ योग');

  doc.fontSize(8.5).fillColor(GREY).font('Nirmala')
     .text('योग वे विशेष ग्रह संयोजन हैं जो जन्मपत्रिका के मूल वादे को प्रबल बनाते हैं। नीचे शास्त्रीय नियमों से पहचाने गए योग दिए जा रहे हैं।',
           50, doc.y, { width: doc.page.width - 100 });
  doc.moveDown(0.6);

  if (yogasH.length > 0) {
    for (const yoga of yogasH) {
      checkPage(doc, 50);
      sectionTitle(doc, yoga.name);
      readingBlock(doc, yoga.desc, CREAM);
    }
  } else {
    doc.fontSize(9).fillColor(GREY).font('Nirmala')
       .text('आपकी कुण्डली में पंचमहापुरुष योग नहीं हैं। अन्य ग्रह संयोजन हो सकते हैं जिनके लिए व्यक्तिगत परामर्श लें।', 50, doc.y);
    doc.moveDown(0.5);
  }

  if (retroPlanets.length > 0) {
    checkPage(doc, 60);
    sectionTitle(doc, 'वक्री ग्रह');
    readingBlock(doc, `${retroPlanets.map(hi).join(', ')} — वक्री ग्रह अपनी ऊर्जा को आंतरिक रूप से प्रवाहित करते हैं। इनसे जुड़े भाव गहन चिंतन और पुनरावलोकन द्वारा फल देते हैं।`);
  }

  // समापन
  checkPage(doc, 80);
  doc.moveDown(0.5);
  doc.rect(40, doc.y, doc.page.width - 80, 68).fill(DARK);
  const cY = doc.y + 10;
  doc.fontSize(9).fillColor(GOLD).font('NirmalaB')
     .text('AstroVyoma वैदिक ज्योतिष — समापन', 50, cY, { width: doc.page.width - 100 });
  doc.fontSize(8).fillColor(LGREY).font('Nirmala')
     .text('यह रिपोर्ट स्विस एफेमेरिस की उच्च परिशुद्धता एवं लाहिरी (चित्रपक्ष) अयनांश से निर्मित है।', 50, cY + 18, { width: doc.page.width - 100 });
  doc.fontSize(8).fillColor(LGREY).font('Nirmala')
     .text('सभी फल पाराशरी ज्योतिष की शास्त्रीय परम्परा पर आधारित हैं। व्यक्तिगत परामर्श हेतु AstroVyoma पर प्रमाणित ज्योतिषी से मिलें।', 50, cY + 34, { width: doc.page.width - 100 });
  doc.fontSize(7.5).fillColor('#888899').font('Nirmala')
     .text('ज्योतिष मार्गदर्शन देता है — भाग्य बदलना आपके हाथ में है।', 50, cY + 50, { width: doc.page.width - 100 });
  doc.y += 80;

  _addFooters(doc);
  doc.end();
  return p;
}

// ─── FOOTER HELPER ────────────────────────────────────────────────────────────
function _addFooters(doc) {
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    // Skip cover page footer (page 0) — cover has its own
    if (i === 0) continue;
    doc.fontSize(7).fillColor(LGREY).font('Nirmala')
       .text(`AstroVyoma वैदिक ज्योतिष • निर्मित ${new Date().toLocaleDateString('hi-IN')} • पृष्ठ ${i+1} / ${pages.count}`,
             40, doc.page.height - 50, { align: 'center', width: doc.page.width - 80 });
  }
}

module.exports = { generateSummaryPDFHindi, generateDetailedPDFHindi };
