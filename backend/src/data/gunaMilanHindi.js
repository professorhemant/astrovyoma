// गुण मिलान — हिन्दी
//
// The koota names, what each one weighs, the verdict for each score band, and
// the three doshas the calculator can report.
//
// ── Written by Claude, 2026-08-15, and NOT yet reviewed by an astrologer. ──
//
// The vocabulary here is the settled vocabulary of Ashtakoota milan — वर्ण,
// वश्य, तारा, योनि, ग्रह मैत्री, गण, भकूट, नाड़ी — so the names are not
// translations so much as the Sanskrit written in its own script. The verdicts
// and the dosha effects are mine, and they say what the English says.
//
// Marriage compatibility is the most consequential thing this site computes.
// Nothing here promises or forbids a marriage: the English is careful to say
// that a low score asks for effort and an astrologer, not that a match is
// doomed, and the Hindi keeps that exactly.

const KOOT_HINDI = {
  varna:   { name: 'वर्ण',        desc: 'आध्यात्मिक स्तर और अहं का सामंजस्य' },
  vasya:   { name: 'वश्य',        desc: 'पारस्परिक आकर्षण और प्रभाव' },
  tara:    { name: 'तारा',        desc: 'जन्म नक्षत्र और आरोग्य' },
  yoni:    { name: 'योनि',        desc: 'प्रकृति और शारीरिक अनुकूलता' },
  graha:   { name: 'ग्रह मैत्री', desc: 'बौद्धिक और मानसिक स्नेह' },
  gana:    { name: 'गण',          desc: 'स्वभाव और आचरण' },
  bhakoot: { name: 'भकूट',        desc: 'प्रेम, परिवार और आजीविका' },
  nadi:    { name: 'नाड़ी',       desc: 'स्वास्थ्य और संतान' },
};

const VERDICT_HINDI = {
  excellent:   'उत्तम मिलान',
  verygood:    'अत्यंत शुभ मिलान',
  good:        'शुभ मिलान',
  average:     'मध्यम मिलान',
  challenging: 'विचारणीय मिलान',
};

const TIER_TEXTS_HINDI = {
  excellent:   'यह दुर्लभ शुभ योग है। इस जोड़ी में अनेक जन्मों का कार्मिक संबंध दिखाई देता है। दोनों को पारस्परिक उन्नति, समान धर्म-मार्ग और स्थायी सामंजस्य प्राप्त होगा। विवाह अत्यंत शुभ है।',
  verygood:    'अत्यंत अनुकूल मिलान, जिसकी नींव सुदृढ़ है। दोनों में स्वाभाविक समझ है और वे मिलकर संतोषपूर्ण जीवन बनाएँगे। छोटे मतभेद खुले संवाद से सहज ही सुलझ जाएँगे।',
  good:        'अधिकांश क्षेत्रों में अच्छा सामंजस्य रखने वाला शुभ मिलान। कुछ कूटों में सचेत प्रयास अपेक्षित है, किन्तु संबंध की सम्भावनाएँ प्रबल हैं। कम अंक वाले कूटों के लिए वैदिक उपाय करने से बंधन और दृढ़ होगा।',
  average:     'मध्यम सामंजस्य, जिसमें दोनों की ओर से प्रयास और समझ आवश्यक है। यह सुखी दाम्पत्य में बाधा नहीं है — किन्तु मतभेदों को सुलझाने के लिए दोनों का समर्पित होना आवश्यक है। मार्गदर्शन हेतु किसी योग्य ज्योतिषी से परामर्श करें।',
  challenging: 'इस मिलान में कार्मिक चुनौतियाँ दिखाई देती हैं। दृढ़ संकल्प के साथ विवाह सम्भव है, किन्तु आगे बढ़ने से पूर्व किसी अनुभवी ज्योतिषी का परामर्श लेना उचित रहेगा।',
};

const DOSHA_HINDI = {
  'Nadi Dosha': {
    name: 'नाड़ी दोष',
    effect: 'स्वास्थ्य और संतान पर प्रभाव सम्भव है। अष्टकूट में यह सर्वाधिक महत्वपूर्ण दोष माना गया है।',
    remedy: 'नाड़ी दोष निवारण पूजा कराएँ। विवाह से पूर्व किसी वैदिक ज्योतिषी से परामर्श करें।',
    cancellation: { 'Same nakshatra cancels Nadi Dosha': 'दोनों का एक ही नक्षत्र होने से नाड़ी दोष का परिहार हो जाता है' },
  },
  'Bhakoot Dosha': {
    name: 'भकूट दोष',
    effect: 'आर्थिक समृद्धि, पारिवारिक सुख और आजीविका पर प्रभाव सम्भव है।',
    remedy: 'चन्द्रमा के लिए ग्रह शांति पूजा कराएँ। अनुकूल रत्न धारण करें।',
    cancellation: {
      'Same rashi lord cancels Bhakoot Dosha': 'दोनों की राशि का स्वामी एक होने से भकूट दोष का परिहार हो जाता है',
      'Same gana cancels Bhakoot Dosha': 'दोनों का गण एक होने से भकूट दोष का परिहार हो जाता है',
    },
  },
  'Gana Dosha': {
    name: 'गण दोष',
    effect: 'स्वभाव की भिन्नता समय के साथ मतभेद उत्पन्न कर सकती है।',
    remedy: 'गण दोष शांति कराएँ और पारस्परिक संवाद बनाए रखें।',
    cancellation: {},
  },
};

const SEVERITY_HINDI = { High: 'उच्च', Medium: 'मध्यम', Low: 'अल्प' };

const GANA_NAMES_HINDI = { 'Dev (Divine)': 'देव गण', 'Manav (Human)': 'मनुष्य गण', 'Rakshasa (Demon)': 'राक्षस गण' };
const NADI_NAMES_HINDI = { 'Aadi (Vata)': 'आदि (वात)', 'Madhya (Pitta)': 'मध्य (पित्त)', 'Antya (Kapha)': 'अन्त्य (कफ)' };

module.exports = {
  KOOT_HINDI, VERDICT_HINDI, TIER_TEXTS_HINDI, DOSHA_HINDI,
  SEVERITY_HINDI, GANA_NAMES_HINDI, NADI_NAMES_HINDI,
};
