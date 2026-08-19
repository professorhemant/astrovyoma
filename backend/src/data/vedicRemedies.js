'use strict';

// The remedy facts a model is not allowed to make up.
//
// Written after the dream reading told somebody to donate black sesame on a
// Thursday. Sesame belongs to Saturn and Saturn's day is Saturday; Thursday is
// Jupiter's, and its offering is turmeric or chana dal. The reading around it
// was fine — the model is good at reasoning about a chart and bad at recalling
// a lookup table, and it fails in exactly this way: fluently, and only on the
// one detail somebody might act on.
//
// remediesController solves the same problem with its own pinned block. That
// one is about gemstones and rudraksha and is tuned for a chart consultation;
// this is the smaller set a dream reading actually reaches for. The day column
// is deliberately identical to that file's, because two features contradicting
// each other about Saturn's day is worse than either being wrong alone. If one
// changes, change both.
//
// There is a Hindi copy of all of it rather than an English block the model is
// asked to translate. Given the English, it copied the lines out verbatim into
// a Hindi reading — a reference sitting in the prompt is text to be echoed, and
// the instruction to answer in Hindi did not outweigh it.

const PLANET_DAYS = {
  en: `PLANET → DAY → WHAT IS DONATED. Use these exactly; never pair an item with another planet's day.
- Sun → Sunday → wheat, jaggery (gud), copper, red cloth
- Moon → Monday → rice, milk, sugar, white cloth, silver
- Mars → Tuesday → red lentils (masoor dal), jaggery, red cloth
- Mercury → Wednesday → whole green gram (sabut moong), green cloth
- Jupiter → Thursday → turmeric (haldi), chana dal, yellow cloth, banana
- Venus → Friday → curd, rice, sugar, white cloth
- Saturn → Saturday → BLACK SESAME (kala til), mustard oil, black cloth, iron, black urad dal
- Rahu → Saturday → black sesame, a blanket, coconut, mustard oil
- Ketu → Tuesday → sesame, a blanket, grey or multicoloured cloth`,

  hi: `ग्रह → दिन → क्या दान करें। इन्हें ठीक इसी तरह लें; किसी वस्तु को दूसरे ग्रह के दिन से कभी न जोड़ें।
- सूर्य → रविवार → गेहूँ, गुड़, ताँबा, लाल कपड़ा
- चंद्र → सोमवार → चावल, दूध, चीनी, सफ़ेद कपड़ा, चाँदी
- मंगल → मंगलवार → मसूर दाल, गुड़, लाल कपड़ा
- बुध → बुधवार → साबुत मूँग, हरा कपड़ा
- गुरु → गुरुवार → हल्दी, चना दाल, पीला कपड़ा, केला
- शुक्र → शुक्रवार → दही, चावल, चीनी, सफ़ेद कपड़ा
- शनि → शनिवार → काला तिल, सरसों का तेल, काला कपड़ा, लोहा, काली उड़द
- राहु → शनिवार → काला तिल, कंबल, नारियल, सरसों का तेल
- केतु → मंगलवार → तिल, कंबल, स्लेटी या रंग-बिरंगा कपड़ा`,
};

// What the texts actually prescribe on waking from an ill dream, as opposed to
// generic advice. The order is the Agni Purana's own.
const DREAM_REMEDIES = {
  en: `WHAT THE TEXTS PRESCRIBE AFTER AN INAUSPICIOUS DREAM (Agni Purana ch. 229). Prefer these over generic advice:
- Sleep again. The same chapter holds that a dream slept upon does not come to pass, so this is the first remedy and not merely comfort.
- Bathe on rising.
- An oblation of sesamum (til), and honouring brahmins.
- Worship of Vishnu, Brahma, Shiva, Surya or Ganapati; recitation of the Purusha Sukta.
- The Duswapna-nivarana hymn of the Rigveda's tenth mandala, whose subject is precisely the destruction of bad dreams.
- Before sleeping, the verse: "Ramaskandam Hanumantam, Vainateyam Vrikodaram / Shayanayah smare nityam, duswapnam tasya nashyati."
- Ordinary sleep hygiene where the dream looks like it came from the day rather than from anywhere else.`,

  hi: `अशुभ स्वप्न के बाद शास्त्र क्या कहते हैं (अग्नि पुराण, अध्याय 229)। सामान्य सलाह से पहले इन्हीं को चुनें:
- फिर से सो जाएँ। उसी अध्याय में है कि जिस स्वप्न पर दोबारा नींद आ जाए वह फलता नहीं — इसलिए यह पहला उपाय है, केवल दिलासा नहीं।
- उठकर स्नान करें।
- तिल की आहुति, और ब्राह्मणों का सम्मान।
- विष्णु, ब्रह्मा, शिव, सूर्य या गणपति की पूजा; पुरुष सूक्त का पाठ।
- ऋग्वेद के दसवें मंडल का दु:स्वप्न-निवारण सूक्त, जिसका विषय ही बुरे सपनों का नाश है।
- सोने से पहले यह श्लोक: "रामस्कंदं हनूमंतं, वैनतेयं वृकोदरम् / शयने यः स्मरेन्नित्यं, दु:स्वप्नस्तस्य नश्यति।"
- जहाँ सपना दिन भर की बातों से आया लगे, वहाँ सोने की सामान्य दिनचर्या सुधारें।`,
};

// The reference is material to draw on, not lines to copy out. Saying so keeps
// the model from lifting a bullet verbatim instead of writing a remedy.
const USE_NOTE = {
  en: `Draw remedies from the two lists above and phrase them naturally for this dreamer. Do not quote the lists verbatim.`,
  hi: `ऊपर की दोनों सूचियों से उपाय चुनें और उन्हें इस स्वप्नदर्शी के लिए स्वाभाविक भाषा में लिखें। सूची की पंक्तियाँ ज्यों की त्यों न उतारें।`,
};

function remedyReference(lang) {
  const l = lang === 'hi' ? 'hi' : 'en';
  return `${PLANET_DAYS[l]}\n\n${DREAM_REMEDIES[l]}\n\n${USE_NOTE[l]}`;
}

module.exports = { remedyReference, PLANET_DAYS, DREAM_REMEDIES };
