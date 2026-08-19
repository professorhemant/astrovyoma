'use strict';

// What the texts actually say a dream symbol means.
//
// The point of this file is that the model does not get to decide whether a
// dream was auspicious. That verdict is the most quotable thing this feature
// prints, and left to a language model it comes out differently every time the
// same dream is submitted. Here the verdict is looked up, the model is handed
// the row, and its job is to write — not to rule.
//
// `source` is load-bearing and must stay honest:
//
//   agni    Agni Purana ch. 229, the svapna-adhyaya. Explicit auspicious and
//           inauspicious lists.
//   sushruta Sushruta Samhita, Sutrasthana ch. 29 — dreams read as prognosis.
//           The frankly fatal readings in that chapter are deliberately left
//           out; see the note at the bottom of this file.
//   lok     Widespread popular tradition with no classical citation behind it.
//           Most of what the Hindi dream sites publish is this. It is included
//           because people search for it, and labelled because it is not the
//           same kind of claim.
//
// Where the classical reading contradicts the popular one — and it often does,
// most sharply on snakes and weddings — both are carried. Saying "the internet
// tells you this; the Agni Purana says the opposite" is the most interesting
// thing this feature can do, and it can only do it if the provenance survives.

const SYMBOLS = [
  // ── From the Agni Purana's auspicious list ────────────────────────────────
  {
    key: 'climbing_hill', verdict: 'auspicious', source: 'agni',
    en: 'Climbing a hill or mountain', hi: 'पहाड़ या पर्वत पर चढ़ना',
    aliases: ['mountain', 'hill', 'climbing', 'summit', 'पहाड़', 'पर्वत', 'चढ़ना'],
    planet: 'Sun', theme: 'career',
    vedic: { en: 'Named among the auspicious dreams — ascent stands for rank gained and obstacles cleared.', hi: 'शुभ स्वप्नों में गिना गया है — ऊपर चढ़ना पद बढ़ने और रुकावट हटने का संकेत है।' },
    jungian: { en: 'The effortful climb toward a goal the dreamer has set themselves.', hi: 'अपने तय किए लक्ष्य की ओर मेहनत से बढ़ना।' },
  },
  {
    key: 'riding_elephant', verdict: 'auspicious', source: 'agni',
    en: 'Riding an elephant', hi: 'हाथी की सवारी करना',
    aliases: ['elephant', 'हाथी'],
    planet: 'Jupiter', theme: 'career',
    vedic: { en: 'Among the most favourable dreams in the text — the family of one who dreams of an elephant is said to flourish.', hi: 'पाठ के सबसे शुभ स्वप्नों में — कहा गया है कि हाथी देखने वाले का परिवार फलता-फूलता है।' },
    jungian: { en: 'Carried by a power larger than oneself, and steering it.', hi: 'स्वयं से बड़ी शक्ति पर सवार होना और उसे दिशा देना।' },
  },
  {
    key: 'riding_bull', verdict: 'auspicious', source: 'agni',
    en: 'Riding a bull or seeing a cow', hi: 'बैल की सवारी या गाय देखना',
    aliases: ['bull', 'cow', 'ox', 'बैल', 'गाय', 'नंदी'],
    planet: 'Venus', theme: 'wealth',
    vedic: { en: 'Listed with the elephant, the horse and gold as dreams whose seer prospers.', hi: 'हाथी, घोड़े और सोने के साथ उन स्वप्नों में गिना गया जिनका देखने वाला समृद्ध होता है।' },
    jungian: { en: 'Fertility and steady strength rather than sudden fortune.', hi: 'अचानक भाग्य नहीं, बल्कि स्थिर शक्ति और उर्वरता।' },
  },
  {
    key: 'white_flowers', verdict: 'auspicious', source: 'agni',
    en: 'White flowers', hi: 'सफ़ेद फूल',
    aliases: ['flowers', 'white flower', 'garland', 'फूल', 'सफेद फूल', 'माला'],
    planet: 'Moon', theme: 'spiritual',
    vedic: { en: 'A favourable sign of purity and of merit ripening.', hi: 'पवित्रता और पुण्य के फलने का शुभ संकेत।' },
    jungian: { en: 'Something in the dreamer coming quietly into bloom.', hi: 'भीतर कुछ चुपचाप खिल रहा है।' },
  },
  {
    key: 'white_garments', verdict: 'auspicious', source: 'agni',
    en: 'Wearing white clothes', hi: 'सफ़ेद वस्त्र पहनना',
    aliases: ['white clothes', 'white garment', 'सफेद कपड़े', 'श्वेत वस्त्र'],
    planet: 'Moon', theme: 'spiritual',
    vedic: { en: 'Auspicious — white is the colour of clarity and of a settled mind.', hi: 'शुभ — सफ़ेद स्पष्टता और शांत मन का रंग है।' },
    jungian: { en: 'A wish to begin again without the old stains.', hi: 'पुराने दाग़ों के बिना फिर से शुरू करने की इच्छा।' },
  },
  {
    key: 'grey_hair', verdict: 'auspicious', source: 'agni',
    en: 'Grey hair', hi: 'सफ़ेद बाल',
    aliases: ['grey hair', 'gray hair', 'white hair', 'सफेद बाल', 'बाल पकना'],
    planet: 'Saturn', theme: 'spiritual',
    vedic: { en: 'Counted auspicious — the dream of age is a dream of authority and long life, not of decline.', hi: 'शुभ माना गया — बुढ़ापे का स्वप्न पतन नहीं, अधिकार और दीर्घायु का स्वप्न है।' },
    jungian: { en: 'The wise elder in oneself asking to be listened to.', hi: 'भीतर बैठा अनुभवी वृद्ध सुने जाने की माँग कर रहा है।' },
  },
  {
    key: 'eclipse', verdict: 'auspicious', source: 'agni',
    en: 'An eclipse of the sun or moon', hi: 'सूर्य या चंद्र ग्रहण',
    aliases: ['eclipse', 'ग्रहण', 'सूर्य ग्रहण', 'चंद्र ग्रहण'],
    planet: 'Rahu', theme: 'spiritual',
    vedic: { en: 'Listed among the auspicious dreams, though it is popularly feared — a covering that passes, and reveals.', hi: 'शुभ स्वप्नों में गिना गया, यद्यपि लोक में इससे डर है — एक आवरण जो गुज़र जाता है और प्रकट करता है।' },
    jungian: { en: 'Something briefly hidden so it can be seen properly afterwards.', hi: 'कुछ थोड़ी देर छिपता है ताकि बाद में ठीक से दिखे।' },
  },
  {
    key: 'bathing', verdict: 'auspicious', source: 'agni',
    en: 'Bathing', hi: 'स्नान करना',
    aliases: ['bath', 'bathing', 'snan', 'स्नान', 'नहाना'],
    planet: 'Moon', theme: 'health',
    vedic: { en: 'Auspicious — and bathing is itself the prescribed act on waking from an ill dream.', hi: 'शुभ — और बुरा स्वप्न देखकर जागने पर स्नान ही विहित कर्म है।' },
    jungian: { en: 'Washing off what has been carried too long.', hi: 'बहुत दिनों से ढोया हुआ बोझ धो देना।' },
  },
  {
    key: 'drinking_milk', verdict: 'auspicious', source: 'agni',
    en: 'Drinking milk', hi: 'दूध पीना',
    aliases: ['milk', 'दूध', 'खीर'],
    planet: 'Moon', theme: 'health',
    vedic: { en: 'A favourable dream of nourishment and of sattva.', hi: 'पोषण और सत्त्व का शुभ स्वप्न।' },
    jungian: { en: 'A need to be cared for that the waking day is not meeting.', hi: 'देखभाल की ज़रूरत जो जागते दिन में पूरी नहीं हो रही।' },
  },
  {
    key: 'clear_sky', verdict: 'auspicious', source: 'agni',
    en: 'A clear sky', hi: 'साफ़ आसमान',
    aliases: ['sky', 'clear sky', 'open sky', 'आसमान', 'आकाश'],
    planet: 'Jupiter', theme: 'spiritual',
    vedic: { en: 'Auspicious — freedom from limitation and a widening of what is possible.', hi: 'शुभ — सीमाओं से मुक्ति और संभावनाओं का विस्तार।' },
    jungian: { en: 'Room to breathe after a period of constriction.', hi: 'घुटन के दौर के बाद साँस लेने की जगह।' },
  },
  {
    key: 'victory_over_enemies', verdict: 'auspicious', source: 'agni',
    en: 'Defeating an enemy', hi: 'शत्रु पर विजय',
    aliases: ['enemy', 'victory', 'winning a fight', 'शत्रु', 'दुश्मन', 'जीत'],
    planet: 'Mars', theme: 'career',
    vedic: { en: 'Explicitly auspicious — the obstacle named in the dream is the one about to give way.', hi: 'स्पष्ट रूप से शुभ — स्वप्न में दिखी बाधा ही टूटने वाली है।' },
    jungian: { en: 'An inner conflict finally taking a side.', hi: 'भीतर का द्वंद्व आख़िर एक पक्ष चुन रहा है।' },
  },
  {
    key: 'royal_installation', verdict: 'auspicious', source: 'agni',
    en: 'Being crowned or honoured', hi: 'राजतिलक या सम्मान मिलना',
    aliases: ['crown', 'throne', 'coronation', 'award', 'honour', 'राजतिलक', 'सम्मान', 'ताज'],
    planet: 'Sun', theme: 'career',
    vedic: { en: 'Among the most favourable — recognition and rise in standing.', hi: 'सबसे शुभ में — पहचान और प्रतिष्ठा में वृद्धि।' },
    jungian: { en: 'Claiming an authority the dreamer has not yet claimed awake.', hi: 'वह अधिकार माँगना जो जागते हुए अभी नहीं माँगा।' },
  },
  {
    key: 'gold', verdict: 'auspicious', source: 'agni',
    en: 'Gold', hi: 'सोना',
    aliases: ['gold', 'golden', 'सोना', 'स्वर्ण', 'ज़ेवर'],
    planet: 'Jupiter', theme: 'wealth',
    vedic: { en: 'Named with the elephant, horse and bull as dreams whose seer prospers.', hi: 'हाथी, घोड़े और बैल के साथ उन स्वप्नों में जिनका देखने वाला समृद्ध होता है।' },
    jungian: { en: 'What the dreamer regards as genuinely valuable, not what they are told to.', hi: 'जिसे स्वप्नदर्शी सचमुच मूल्यवान मानता है, वह नहीं जो उसे बताया गया है।' },
  },
  {
    key: 'horse', verdict: 'auspicious', source: 'agni',
    en: 'A horse', hi: 'घोड़ा',
    aliases: ['horse', 'घोड़ा', 'अश्व'],
    planet: 'Mars', theme: 'career',
    vedic: { en: 'A prospering dream — speed, and travel that pays.', hi: 'समृद्धि का स्वप्न — गति और लाभदायक यात्रा।' },
    jungian: { en: 'Energy the dreamer has but has not yet harnessed.', hi: 'ऊर्जा जो है, पर अभी साधी नहीं गई।' },
  },
  {
    key: 'many_arms', verdict: 'auspicious', source: 'agni',
    en: 'Having many arms or heads', hi: 'अनेक भुजाएँ या सिर होना',
    aliases: ['many arms', 'many heads', 'multiple limbs', 'अनेक भुजा', 'कई सिर'],
    planet: 'Jupiter', theme: 'spiritual',
    vedic: { en: 'Auspicious — the divine form, and capacity beyond the ordinary.', hi: 'शुभ — दिव्य रूप, और सामान्य से परे सामर्थ्य।' },
    jungian: { en: 'Carrying more than one person’s share, for better or worse.', hi: 'एक व्यक्ति के हिस्से से ज़्यादा उठाना — भला या बुरा।' },
  },

  // ── From the Agni Purana's inauspicious list ──────────────────────────────
  {
    key: 'wedding', verdict: 'inauspicious', source: 'agni',
    en: 'A wedding or marriage ceremony', hi: 'विवाह या शादी का समारोह',
    aliases: ['wedding', 'marriage', 'shaadi', 'baraat', 'शादी', 'विवाह', 'बारात'],
    planet: 'Venus', theme: 'relationships',
    vedic: { en: 'The texts place marriage ceremonies among the ill omens — which is the opposite of what almost every popular dream guide says. Classically it points to an obligation being taken on, not a joy arriving.', hi: 'शास्त्र विवाह-समारोह को अशुभ संकेतों में रखते हैं — जो लगभग हर लोकप्रिय स्वप्न-पुस्तिका के उलट है। शास्त्रीय अर्थ में यह किसी दायित्व के गले पड़ने का संकेत है, ख़ुशी आने का नहीं।' },
    jungian: { en: 'A binding commitment the dreamer is weighing, and not only a romantic one.', hi: 'कोई बंधनकारी प्रतिबद्धता जिसे मन तौल रहा है — ज़रूरी नहीं कि प्रेम-संबंधी हो।' },
  },
  {
    key: 'killing_snake', verdict: 'inauspicious', source: 'agni',
    en: 'Killing a snake', hi: 'साँप को मारना',
    aliases: ['killing snake', 'kill a snake', 'killed a snake', 'saap marna', 'सांप मार', 'सांप को मार'],
    planet: 'Ketu', theme: 'spiritual',
    vedic: { en: 'Listed among the inauspicious dreams. The popular Hindi guides read this as a triumph over enemies; the Agni Purana does not agree with them.', hi: 'अशुभ स्वप्नों में सूचीबद्ध। लोकप्रिय हिंदी पुस्तिकाएँ इसे शत्रु पर विजय बताती हैं; अग्नि पुराण उनसे सहमत नहीं है।' },
    jungian: { en: 'Cutting off something in oneself rather than coming to terms with it.', hi: 'भीतर की किसी चीज़ से समझौता करने के बजाय उसे काट देना।' },
  },
  {
    key: 'falling', verdict: 'inauspicious', source: 'agni',
    en: 'Falling from a height', hi: 'ऊँचाई से गिरना',
    aliases: ['falling', 'fall', 'fell', 'गिर', 'ऊंचाई से गिर'],
    planet: 'Saturn', theme: 'career',
    vedic: { en: 'An ill omen — loss of position, or a support giving way.', hi: 'अशुभ संकेत — पद की हानि, या किसी सहारे का खिसकना।' },
    jungian: { en: 'The classic dream of control slipping. Usually about one specific thing the dreamer can name on waking.', hi: 'नियंत्रण छूटने का जाना-पहचाना स्वप्न। प्रायः किसी एक चीज़ के बारे में, जिसे जागकर नाम दिया जा सकता है।' },
  },
  {
    key: 'nudity', verdict: 'inauspicious', source: 'agni',
    en: 'Being naked', hi: 'नग्न होना',
    aliases: ['naked', 'nude', 'no clothes', 'नग्न', 'निर्वस्त्र', 'कपड़े न होना'],
    planet: 'Rahu', theme: 'relationships',
    vedic: { en: 'Among the ill omens — exposure and loss of standing.', hi: 'अशुभ संकेतों में — उघड़ जाना और प्रतिष्ठा की हानि।' },
    jungian: { en: 'Fear of being seen as one actually is, usually at work or among peers.', hi: 'जैसा है वैसा दिख जाने का डर — प्रायः काम पर या बराबरी वालों के बीच।' },
  },
  {
    key: 'torn_clothes', verdict: 'inauspicious', source: 'agni',
    en: 'Torn or dirty clothing', hi: 'फटे या मैले कपड़े',
    aliases: ['torn clothes', 'dirty clothes', 'फटे कपड़े', 'मैले कपड़े'],
    planet: 'Saturn', theme: 'wealth',
    vedic: { en: 'An ill omen pointing to want and to reputation fraying.', hi: 'अभाव और प्रतिष्ठा के क्षय का अशुभ संकेत।' },
    jungian: { en: 'A self-image the dreamer feels is no longer holding together.', hi: 'अपनी वह छवि जो अब जुड़ी नहीं रह रही।' },
  },
  {
    key: 'mud', verdict: 'inauspicious', source: 'agni',
    en: 'Being smeared with mud', hi: 'कीचड़ से सना होना',
    aliases: ['mud', 'dirt', 'kichad', 'कीचड़', 'मिट्टी लगना'],
    planet: 'Saturn', theme: 'health',
    vedic: { en: 'Inauspicious — defilement, and blame that sticks.', hi: 'अशुभ — मलिनता, और चिपक जाने वाला दोषारोपण।' },
    jungian: { en: 'Shame the dreamer has not been able to wash off.', hi: 'वह लज्जा जो अब तक धुल नहीं पाई।' },
  },
  {
    key: 'drowning', verdict: 'inauspicious', source: 'agni',
    en: 'Drowning', hi: 'डूबना',
    aliases: ['drowning', 'drown', 'sinking', 'sank', 'डूब'],
    planet: 'Moon', theme: 'health',
    vedic: { en: 'An ill omen — being overtaken by what one cannot stand above.', hi: 'अशुभ संकेत — उस चीज़ में डूब जाना जिसके ऊपर खड़ा नहीं हुआ जा सकता।' },
    jungian: { en: 'Emotion at a volume the dreamer cannot currently process.', hi: 'भावना इतनी मात्रा में कि मन उसे अभी सँभाल नहीं पा रहा।' },
  },
  {
    key: 'house_collapse', verdict: 'inauspicious', source: 'agni',
    en: 'A building collapsing', hi: 'इमारत का गिरना',
    aliases: ['building collapse', 'house falling', 'मकान गिरना', 'इमारत गिरना'],
    planet: 'Saturn', theme: 'family',
    vedic: { en: 'Inauspicious — the structure that shelters the dreamer is unsound.', hi: 'अशुभ — जो ढाँचा आश्रय देता है वही कमज़ोर है।' },
    jungian: { en: 'A family or working arrangement the dreamer senses is failing.', hi: 'कोई पारिवारिक या कामकाजी व्यवस्था जिसके टूटने का आभास है।' },
  },
  {
    key: 'sweeping_house', verdict: 'inauspicious', source: 'agni',
    en: 'Sweeping one’s own house', hi: 'अपना घर बुहारना',
    aliases: ['sweeping', 'broom', 'jhadu', 'झाड़ू', 'घर बुहारना'],
    planet: 'Ketu', theme: 'family',
    vedic: { en: 'Counted among the ill omens, unexpectedly — sweeping out is read as sending away, not tidying.', hi: 'अप्रत्याशित रूप से अशुभ संकेतों में — बुहारना सफ़ाई नहीं, विदा करना पढ़ा जाता है।' },
    jungian: { en: 'Clearing something away before the dreamer has finished with it.', hi: 'किसी चीज़ से निपटने से पहले ही उसे हटा देना।' },
  },
  {
    key: 'riding_donkey', verdict: 'inauspicious', source: 'agni',
    en: 'Riding a donkey or pig', hi: 'गधे या सूअर की सवारी',
    aliases: ['donkey', 'pig', 'गधा', 'सूअर'],
    planet: 'Saturn', theme: 'career',
    vedic: { en: 'An ill omen — humiliation, or being carried by unworthy means.', hi: 'अशुभ संकेत — अपमान, या अनुचित साधन पर सवार होना।' },
    jungian: { en: 'Progress the dreamer is ashamed of the manner of.', hi: 'ऐसी प्रगति जिसके तरीक़े पर शर्म है।' },
  },
  {
    key: 'eating_flesh', verdict: 'inauspicious', source: 'agni',
    en: 'Eating meat', hi: 'माँस खाना',
    aliases: ['eating meat', 'flesh', 'मांस', 'मांस खाना'],
    planet: 'Mars', theme: 'health',
    vedic: { en: 'Listed among the inauspicious — appetite overtaking restraint.', hi: 'अशुभ में सूचीबद्ध — संयम पर भूख का हावी होना।' },
    jungian: { en: 'A hunger the dreamer judges themselves for.', hi: 'ऐसी भूख जिसके लिए मन ख़ुद को दोषी ठहराता है।' },
  },
  {
    key: 'grass_on_body', verdict: 'inauspicious', source: 'agni',
    en: 'Grass growing on the body', hi: 'शरीर पर घास उगना',
    aliases: ['grass on body', 'शरीर पर घास'],
    planet: 'Ketu', theme: 'health',
    vedic: { en: 'The first of the ill omens named in the chapter — stagnation settling on the body itself.', hi: 'अध्याय में गिनाए अशुभ संकेतों में पहला — ठहराव का शरीर पर ही जम जाना।' },
    jungian: { en: 'A long-neglected part of life beginning to show.', hi: 'बहुत दिनों से उपेक्षित जीवन-पक्ष अब दिखने लगा है।' },
  },

  // ── From Sushruta, as prognosis rather than fate ──────────────────────────
  {
    key: 'red_flowers_journey', verdict: 'inauspicious', source: 'sushruta',
    en: 'Travelling south, or red flowers and red-clad figures', hi: 'दक्षिण दिशा की यात्रा, या लाल फूल और लाल वस्त्रधारी',
    aliases: ['red flowers', 'south', 'red clothes', 'लाल फूल', 'दक्षिण'],
    planet: 'Mars', theme: 'health',
    vedic: { en: 'Sushruta reads this among the dreams that warn of illness. Treated here as a prompt to rest and check on health, not as a prediction.', hi: 'सुश्रुत इसे रोग की चेतावनी देने वाले स्वप्नों में गिनते हैं। यहाँ इसे भविष्यवाणी नहीं, विश्राम करने और स्वास्थ्य जाँचने का संकेत माना गया है।' },
    jungian: { en: 'The body asking for attention through the only channel available at night.', hi: 'शरीर रात में उपलब्ध एकमात्र माध्यम से ध्यान माँग रहा है।' },
  },
  {
    key: 'oil_bath_dark', verdict: 'inauspicious', source: 'sushruta',
    en: 'Being smeared with oil, or covered in darkness', hi: 'तेल से लिप्त होना, या अंधकार में घिरना',
    aliases: ['oil bath', 'smeared with oil', 'darkness', 'तेल लग', 'अंधेरा', 'अँधेरा'],
    planet: 'Saturn', theme: 'health',
    vedic: { en: 'Named by Sushruta among the dreams that precede a decline in vigour. Read here as a call to rest.', hi: 'सुश्रुत ने इसे बल घटने से पहले आने वाले स्वप्नों में गिनाया है। यहाँ इसे विश्राम की पुकार माना गया है।' },
    jungian: { en: 'Depletion the dreamer has been overriding.', hi: 'थकान जिसे नज़रअंदाज़ किया जा रहा है।' },
  },

  // ── Popular tradition — labelled as such ──────────────────────────────────
  {
    key: 'snake', verdict: 'mixed', source: 'lok',
    en: 'Seeing a snake', hi: 'साँप देखना',
    aliases: ['snake', 'serpent', 'cobra', 'naag', 'saap', 'sanp', 'सांप', 'नाग', 'कोबरा'],
    planet: 'Rahu', theme: 'wealth',
    vedic: { en: 'The most searched dream in India, and the one where tradition splits. Popular Swapna Shastra reads a black cobra as honour or wealth arriving; the classical lists are far more cautious and count killing one as an ill omen. Where the dreamer felt no fear, the favourable reading is the usual one.', hi: 'भारत में सबसे ज़्यादा खोजा जाने वाला स्वप्न, और वही जहाँ परंपरा बँट जाती है। लोकप्रिय स्वप्न शास्त्र काले नाग को मान-सम्मान या धन-लाभ पढ़ता है; शास्त्रीय सूचियाँ कहीं अधिक सतर्क हैं और साँप मारने को अशुभ गिनती हैं। जहाँ डर न लगा हो, वहाँ शुभ अर्थ ही लिया जाता है।' },
    jungian: { en: 'Energy that is dangerous and vital at once — rarely about an actual person.', hi: 'ऐसी ऊर्जा जो एक साथ ख़तरनाक भी है और प्राणदायी भी — बिरले ही किसी वास्तविक व्यक्ति के बारे में।' },
  },
  {
    key: 'teeth_falling', verdict: 'inauspicious', source: 'lok',
    en: 'Teeth falling out', hi: 'दाँत गिरना',
    aliases: ['teeth', 'tooth', 'daant', 'दांत', 'दात गिर', 'दांत टूट'],
    planet: 'Saturn', theme: 'family',
    vedic: { en: 'Popularly read as worry over an elder’s health or a loss in the family. This reading is widespread but has no place in the classical lists.', hi: 'लोक में किसी बुज़ुर्ग के स्वास्थ्य की चिंता या परिवार में हानि के रूप में पढ़ा जाता है। यह अर्थ बहुत प्रचलित है, पर शास्त्रीय सूचियों में नहीं मिलता।' },
    jungian: { en: 'One of the most universal dreams there is — usually powerlessness, or fear of ageing and of how one appears.', hi: 'सबसे सार्वभौमिक स्वप्नों में एक — प्रायः असहायता, या उम्र और अपनी छवि का डर।' },
  },
  {
    key: 'flying', verdict: 'auspicious', source: 'lok',
    en: 'Flying', hi: 'उड़ना',
    aliases: ['flying', 'fly', 'flew', 'flight', 'udna', 'उड', 'आकाश में उड'],
    planet: 'Mercury', theme: 'spiritual',
    vedic: { en: 'Popularly favourable — rising above a difficulty. The classical lists praise the clear sky rather than flight itself.', hi: 'लोक में शुभ — किसी कठिनाई से ऊपर उठना। शास्त्रीय सूचियाँ उड़ान की नहीं, स्वच्छ आकाश की प्रशंसा करती हैं।' },
    jungian: { en: 'Release from a constraint, and often the most pleasant dream people report.', hi: 'किसी बंधन से मुक्ति — और प्रायः सबसे सुखद बताया जाने वाला स्वप्न।' },
  },
  {
    key: 'water', verdict: 'mixed', source: 'lok',
    en: 'Water — a river, lake or flood', hi: 'पानी — नदी, तालाब या बाढ़',
    aliases: ['water', 'river', 'lake', 'flood', 'sea', 'पानी', 'नदी', 'बाढ़', 'समुद्र'],
    planet: 'Moon', theme: 'health',
    vedic: { en: 'Clear water is held favourable and muddy or turbulent water unfavourable — the state of the water is the whole of the reading.', hi: 'स्वच्छ जल शुभ और गंदला या उफनता जल अशुभ माना जाता है — पूरा अर्थ जल की अवस्था में ही है।' },
    jungian: { en: 'Feeling itself. Calm water and a flood are the same symbol at two volumes.', hi: 'भावना स्वयं। शांत जल और बाढ़ एक ही प्रतीक हैं, बस मात्रा अलग है।' },
  },
  {
    key: 'fire', verdict: 'mixed', source: 'lok',
    en: 'Fire', hi: 'आग',
    aliases: ['fire', 'flames', 'burning', 'आग', 'ज्वाला', 'जलना'],
    planet: 'Mars', theme: 'career',
    vedic: { en: 'A contained fire — a lamp, a hearth, a sacred flame — is auspicious; a spreading fire that consumes is not.', hi: 'सीमित अग्नि — दीपक, चूल्हा, यज्ञ की ज्वाला — शुभ है; फैलती और भस्म करती आग नहीं।' },
    jungian: { en: 'Anger or desire, depending entirely on whether the dreamer was warmed or threatened.', hi: 'क्रोध या इच्छा — पूरी तरह इस पर कि स्वप्न में गर्माहट मिली या ख़तरा।' },
  },
  {
    key: 'temple', verdict: 'auspicious', source: 'lok',
    en: 'A temple or deity', hi: 'मंदिर या देवता',
    aliases: ['temple', 'god', 'deity', 'mandir', 'मंदिर', 'देवता', 'भगवान'],
    planet: 'Jupiter', theme: 'spiritual',
    vedic: { en: 'Held highly auspicious, and the classical lists agree — divine favour seen in a dream is among the good omens.', hi: 'अत्यंत शुभ माना जाता है, और शास्त्रीय सूचियाँ भी सहमत हैं — स्वप्न में दैवी कृपा शुभ संकेतों में है।' },
    jungian: { en: 'A search for meaning, or for permission from something larger.', hi: 'अर्थ की खोज, या किसी बड़ी सत्ता से स्वीकृति की।' },
  },
  {
    key: 'deceased_relative', verdict: 'mixed', source: 'lok',
    en: 'A relative who has died', hi: 'दिवंगत परिजन',
    aliases: ['dead relative', 'deceased', 'ancestor', 'pitru', 'grandmother', 'grandfather', 'पितर', 'दिवंगत', 'मृत परिजन'],
    planet: 'Ketu', theme: 'family',
    vedic: { en: 'Traditionally read as the pitrs seeking remembrance — an occasion for tarpan or a simple offering, and favourable if they appeared calm or gave something.', hi: 'परंपरा में पितरों द्वारा स्मरण चाहने के रूप में पढ़ा जाता है — तर्पण या साधारण अर्पण का अवसर, और यदि वे शांत दिखे या कुछ दिया तो शुभ।' },
    jungian: { en: 'Grief still doing its work, and often simple longing rather than a message.', hi: 'शोक अब भी अपना काम कर रहा है — प्रायः कोई संदेश नहीं, बस याद।' },
  },
  {
    key: 'being_chased', verdict: 'inauspicious', source: 'lok',
    en: 'Being chased', hi: 'कोई पीछा कर रहा हो',
    aliases: ['chased', 'chase', 'chasing', 'running away', 'पीछा', 'भाग'],
    planet: 'Mars', theme: 'health',
    vedic: { en: 'Read as an unresolved difficulty gaining on the dreamer, and a prompt to face what is being avoided.', hi: 'अनसुलझी कठिनाई के निकट आने के रूप में पढ़ा जाता है — जिससे बचा जा रहा है, उसका सामना करने का संकेत।' },
    jungian: { en: 'Almost always avoidance. What is chasing is usually the dreamer’s own.', hi: 'लगभग हमेशा टालमटोल। जो पीछा कर रहा है वह प्रायः स्वयं का ही अंश है।' },
  },
  {
    key: 'exam', verdict: 'mixed', source: 'lok',
    en: 'An exam, or being late', hi: 'परीक्षा, या देर हो जाना',
    aliases: ['exam', 'test', 'being late', 'missing train', 'परीक्षा', 'देर', 'ट्रेन छूटना'],
    planet: 'Mercury', theme: 'career',
    vedic: { en: 'Read as a test approaching in waking life — favourable if the dreamer completed it.', hi: 'जागते जीवन में आ रही किसी परीक्षा के रूप में — यदि स्वप्न में पूरी कर ली तो शुभ।' },
    jungian: { en: 'Performance anxiety, and one of the commonest dreams of adults with responsibility.', hi: 'प्रदर्शन की चिंता — ज़िम्मेदारी उठाने वालों के सबसे आम स्वप्नों में।' },
  },
  {
    key: 'money_found_lost', verdict: 'mixed', source: 'lok',
    en: 'Finding or losing money', hi: 'धन मिलना या खोना',
    aliases: ['money', 'wealth', 'coins', 'losing money', 'पैसा', 'धन', 'रुपये'],
    planet: 'Venus', theme: 'wealth',
    vedic: { en: 'Finding is favourable; losing points to insecurity rather than to actual loss.', hi: 'मिलना शुभ है; खोना वास्तविक हानि नहीं, असुरक्षा की ओर संकेत करता है।' },
    jungian: { en: 'Self-worth, more often than finances.', hi: 'वित्त से कहीं अधिक बार, अपने मूल्य का प्रश्न।' },
  },
  {
    key: 'child', verdict: 'auspicious', source: 'lok',
    en: 'A child or baby', hi: 'बच्चा या शिशु',
    aliases: ['child', 'baby', 'infant', 'बच्चा', 'शिशु'],
    planet: 'Jupiter', theme: 'family',
    vedic: { en: 'Auspicious — new beginnings, and growth in the family’s fortunes.', hi: 'शुभ — नई शुरुआत, और परिवार की समृद्धि में वृद्धि।' },
    jungian: { en: 'Something newly begun that still needs protecting.', hi: 'कुछ नया शुरू हुआ है जिसे अभी सँभाल चाहिए।' },
  },
  {
    key: 'own_death', verdict: 'auspicious', source: 'lok',
    en: 'One’s own death', hi: 'अपनी मृत्यु देखना',
    aliases: ['own death', 'dying', 'my death', 'अपनी मृत्यु', 'मरना'],
    planet: 'Ketu', theme: 'spiritual',
    vedic: { en: 'Contrary to the fear it causes, dreaming of one’s own death is traditionally read as long life and the end of a hard phase — never as a forecast.', hi: 'जो डर यह पैदा करता है उसके विपरीत, अपनी मृत्यु का स्वप्न परंपरा में दीर्घायु और कठिन दौर के अंत का संकेत है — कभी भविष्यवाणी नहीं।' },
    jungian: { en: 'A version of oneself ending so another can begin. Among the most misread dreams there is.', hi: 'अपना एक रूप समाप्त हो रहा है ताकि दूसरा शुरू हो सके। सबसे ग़लत समझे जाने वाले स्वप्नों में।' },
  },
];

// The dream arrives as free text in either language and often in neither
// script — "saap", "sapne me daant" — so every symbol carries its aliases in
// Latin and Devanagari both, and the text is scanned for them.
//
// A miss is cheap: the model still writes the reading, just without a sourced
// verdict to anchor it. A false match is not cheap, because it prints a
// citation against a symbol the dreamer never mentioned. So matching is by
// whole word, never by substring — a plain `includes` found "oil" inside
// "coiled" and attached an illness omen from Sushruta to a dream about a cobra.
const DEVANAGARI = /[ऀ-ॿ]/;

// Hindi typed by hand nasalises inconsistently — दांत and दाँत are the same
// word to the person typing and different strings to a computer. Folding the
// chandrabindu onto the anusvara, and stripping the nukta, lets one alias catch
// the spellings people actually use.
function normalise(s) {
  return String(s)
    .toLowerCase()
    .replace(/ँ/g, 'ं')
    .replace(/़/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Devanagari has no word boundary \b can see, so a term in that script is
// matched as a substring of the normalised text. Latin terms get real word
// boundaries, plus the handful of English inflections that actually turn up
// in dream descriptions — "fell" for falling, "flew" for flying.
function termMatches(hay, term) {
  if (DEVANAGARI.test(term)) return hay.includes(term);
  return new RegExp(`\\b${escapeRe(term)}(s|es|ed|ing)?\\b`, 'i').test(hay);
}

function matchSymbols(text, limit = 6) {
  if (!text) return [];
  const hay = normalise(text);
  const hits = [];
  for (const s of SYMBOLS) {
    const terms = [s.key.replace(/_/g, ' '), s.en, s.hi, ...(s.aliases || [])];
    let score = 0;
    for (const t of terms) {
      const needle = normalise(t);
      if (needle.length < 3) continue;
      // Longer phrases are stronger evidence than a single common word, so a
      // two-word alias outscores a one-word one and sorts above it.
      if (termMatches(hay, needle)) score += needle.split(/\s+/).length;
    }
    if (score > 0) hits.push({ symbol: s, score });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit).map(h => h.symbol);
}

const SOURCE_LABEL = {
  agni:     { en: 'Agni Purana, ch. 229', hi: 'अग्नि पुराण, अध्याय 229' },
  sushruta: { en: 'Sushruta Samhita, Sutrasthana ch. 29', hi: 'सुश्रुत संहिता, सूत्रस्थान अध्याय 29' },
  lok:      { en: 'Popular tradition', hi: 'लोक परंपरा' },
};

const VERDICT_LABEL = {
  auspicious:   { en: 'Auspicious', hi: 'शुभ' },
  inauspicious: { en: 'Inauspicious', hi: 'अशुभ' },
  mixed:        { en: 'Depends on the dream', hi: 'स्वप्न पर निर्भर' },
};

// A note on what is deliberately absent.
//
// Sushruta's chapter and Prasna Marga's thirty-first both read certain dreams
// as arishta — omens of death, with timing. That material is genuinely in the
// sources and it is genuinely excluded here. Someone types a frightening dream
// into this box at four in the morning; there is no version of telling them the
// texts give them six months that is worth publishing. The prognostic entries
// that remain are phrased as a reason to rest and to get checked, which is the
// useful half of what Sushruta was doing anyway.

module.exports = { SYMBOLS, matchSymbols, SOURCE_LABEL, VERDICT_LABEL };
