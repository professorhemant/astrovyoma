import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import ZodiacIcon from '../components/ZodiacIcon';
import { horoscope as horoscopeApi } from '../api';

const ELEMENT_ICON = { Fire: '🔥', Earth: '🌍', Air: '💨', Water: '💧' };

const COLOR_CSS = {
  'Red':'#ef4444','Coral':'#f97316','Orange':'#f97316','Gold':'#c9a84c','Amber':'#f59e0b',
  'White':'#e5e7eb','Blue':'#3b82f6','Purple':'#a855f7','Green':'#22c55e','Pink':'#ec4899',
  'Yellow':'#eab308','Silver':'#94a3b8','Black':'#374151','Light Blue':'#93c5fd',
  'Turquoise':'#14b8a6','Lavender':'#c4b5fd','Indigo':'#6366f1','Brown':'#b45309',
  'Teal':'#0d9488','Maroon':'#991b1b','Burgundy':'#be123c','Violet':'#7c3aed',
  'Sky Blue':'#7dd3fc','Electric Blue':'#3b82f6','Deep Purple':'#7e22ce','Dark Blue':'#1e40af',
  'Ocean Blue':'#0284c7','Sea Green':'#059669','Deep Red':'#dc2626','Deep Blue':'#1e40af',
  'Dark Green':'#166534','Blue-Green':'#0f766e','Pearl White':'#f0fdf4','Navy Blue':'#1e3a8a',
};

const SIGNS_DATA = {
  Aries: {
    symbol:'♈', dates:'Mar 21 — Apr 19', element:'Fire', ruling:'Mars', color:'#FF6B6B',
    luckyDay:'Tuesday', compatibility:['Leo','Sagittarius','Gemini'],
    love:   ['Passionate energy draws a special person closer — be bold and openly vulnerable.',
             'Venus graces relationships; a heartfelt conversation clears the air beautifully.',
             'An old spark reignites, or a new connection carries surprising romantic depth.',
             'Romance sparkles after sunset; a loving gesture resonates deeply with your partner.',
             'The Moon heightens emotional sensitivity — listen more than you speak in love.',
             'An evening encounter carries unexpected romantic energy — stay open and present.',
             'An unexpected social meeting could spark genuine and lasting romantic interest.'],
    career:['Bold initiative at work earns real recognition from decision-makers above you.',
            'A creative project finds the support it needs to grow beyond your expectations.',
            'Signed agreements carry lasting power — review details carefully before committing.',
            'A long-pursued professional goal takes a significant, tangible step forward today.',
            'Your business instincts are razor-sharp — trust them in any key meeting today.',
            'A mentor\'s guidance unlocks a career door that effort alone could not open.',
            'An unconventional approach to a workplace challenge yields impressive real results.'],
    health:['Channel your abundant energy into vigorous morning exercise for the best results.',
            'Avoid impulsive choices after 3 PM; your wellbeing benefits from a measured pace.',
            'Outdoor activities — a walk or run — restore your natural vitality significantly.',
            'Rest is your power today; recovery sustains the driven, ambitious pace you love.',
            'Give your head and eyes a screen break — 20 minutes of nature gazing helps greatly.',
            'Your spine and posture improve with a short, consistent daily stretching routine.',
            'Consistent sleep and meal rhythms support your characteristically high energy today.'],
    finance:['Financial matters align favorably — an investment decision gains useful clarity.',
             'Avoid large impulse purchases today; let sound financial ideas develop and mature.',
             'Agreements today carry lasting monetary value — read every clause with care.',
             'Patience in financial timing pays off; the right moment is close but not yet.',
             'A financial instinct proves accurate — move on it with measured, calm confidence.',
             'Long-term investments and property matters deserve your careful, focused attention.',
             'An unconventional financial opportunity appears — evaluate it with balanced judgment.'],
    ratings:[{love:4,career:5,health:3,finance:4,overall:4},{love:4,career:4,health:4,finance:3,overall:4},
             {love:3,career:5,health:4,finance:4,overall:4},{love:5,career:3,health:3,finance:3,overall:4},
             {love:4,career:4,health:5,finance:4,overall:4},{love:5,career:4,health:3,finance:3,overall:4},
             {love:3,career:4,health:4,finance:5,overall:4}],
  },
  Taurus: {
    symbol:'♉', dates:'Apr 20 — May 20', element:'Earth', ruling:'Venus', color:'#6BCB77',
    luckyDay:'Friday', compatibility:['Virgo','Capricorn','Cancer'],
    love:   ['Venus, your ruler, draws beautiful, genuine romantic energy toward you today.',
             'Family warmth and emotional closeness create the most meaningful love moments.',
             'Express a long-held feeling with gentle confidence — it will be received well.',
             'A partnership proves more deeply fulfilling than you initially imagined it would.',
             'Your patient, steady love is deeply noticed and appreciated by your partner.',
             'Your grounded, reliable nature is cherished and recognized by those closest to you.',
             'A restful evening creates perfect conditions for deep, honest emotional bonding.'],
    career:['Creative talents attract genuine positive attention from colleagues and leaders.',
            'A practical solution to a professional challenge emerges with satisfying clarity.',
            'Business negotiations reach a favorable, mutually beneficial conclusion today.',
            'A partnership reveals itself as far more professionally valuable than first thought.',
            'Steady, determined effort on a long-term project yields concrete visible results.',
            'Your grounded reliability earns important recognition within your organization.',
            'Consistent professional habits bring the material progress you have been building.'],
    health:['Indulge thoughtfully in beauty and comfort — your senses need gentle nourishment.',
            'Avoid food overindulgence; your body benefits greatly from lighter, mindful eating.',
            'A change of environment brings surprising, revitalizing energy to your body today.',
            'Simple daily pleasures — a walk, good food, music — genuinely nourish your soul.',
            'Channel physical drive into productive, satisfying, hands-on activity today.',
            'Spiritual practice or quiet contemplation brings deep, lasting peace to your spirit.',
            'Rest is productive today — your body rebuilds strength through quality sleep.'],
    finance:['Financial matters improve steadily with Venus guiding your careful choices today.',
             'A practical, methodical approach to your finances yields reliable positive results.',
             'A long-standing financial situation reaches a favorable and clear resolution.',
             'Investments made with patience and conviction carry real long-term promise.',
             'Avoid confrontation in financial dealings; diplomacy brings the better outcome.',
             'Long-awaited financial clarity arrives — act decisively on what becomes clear.',
             'Material progress comes through consistent discipline rewarded by Saturn today.'],
    ratings:[{love:5,career:4,health:4,finance:4,overall:4},{love:4,career:3,health:3,finance:4,overall:4},
             {love:3,career:5,health:4,finance:4,overall:4},{love:4,career:4,health:3,finance:5,overall:4},
             {love:3,career:4,health:4,finance:3,overall:4},{love:4,career:5,health:5,finance:4,overall:5},
             {love:3,career:4,health:5,finance:4,overall:4}],
  },
  Gemini: {
    symbol:'♊', dates:'May 21 — Jun 20', element:'Air', ruling:'Mercury', color:'#FFD93D',
    luckyDay:'Wednesday', compatibility:['Libra','Aquarius','Aries'],
    love:   ['Brilliant communication opens a beautiful new level of intimacy with your partner.',
             'A new friendship carries a warm, unexpected quality that deepens naturally over time.',
             'Venus adds genuine warmth to your social connections — a meaningful bond blossoms.',
             'Evening reflection reveals a key insight about what you truly need in your love life.',
             'Creative collaboration with someone special becomes surprisingly romantic and deep.',
             'Your magnetic aura is at its peak — romantic connections intensify naturally today.',
             'A philosophical conversation reveals unexpectedly deep romantic resonance today.'],
    career:['Two exciting opportunities arrive — choose the one aligned with your true purpose.',
            'Focus your scattered energy into one project for maximum tangible professional impact.',
            'A chance professional meeting leads to a genuinely significant career opportunity.',
            'A bold idea impresses those in authority — share it clearly and confidently today.',
            'A creative collaboration bears uniquely impressive and original professional fruit.',
            'Your ability to see multiple perspectives solves a team conflict brilliantly.',
            'Completing what you\'ve started earns you far more credit than starting anew.'],
    health:['Mental vitality is high — new activities and short travels restore your energy.',
            'Focus concentrated energy to prevent the restlessness that drains your reserves.',
            'Focus on your lungs and arms today — breathing exercises are especially beneficial.',
            'Evening meditation calms your active mind while revealing surprising wellness insights.',
            'Channel your competitive energy productively rather than into mental tension.',
            'Your mind and body both benefit from a healthy mix of activity and genuine rest.',
            'Complete one pending health habit before introducing anything new to your routine.'],
    finance:['Financial clarity arrives after a period of confusion — act on what you now see.',
             'Focus on one solid financial plan rather than exploring many options simultaneously.',
             'A financial opportunity emerges unexpectedly from your expanding professional network.',
             'Financial instincts are unusually sharp today — act on well-considered opportunities.',
             'A creative financial approach yields impressive results; your unique thinking pays off.',
             'Financial negotiations strongly favor you — negotiate with clarity and confidence.',
             'Completing a financial task you\'ve been avoiding brings real relief and clarity.'],
    ratings:[{love:4,career:5,health:4,finance:4,overall:4},{love:4,career:4,health:3,finance:3,overall:4},
             {love:3,career:5,health:4,finance:4,overall:4},{love:4,career:4,health:4,finance:4,overall:4},
             {love:4,career:4,health:3,finance:4,overall:4},{love:5,career:4,health:4,finance:5,overall:5},
             {love:3,career:4,health:4,finance:4,overall:4}],
  },
  Cancer: {
    symbol:'♋', dates:'Jun 21 — Jul 22', element:'Water', ruling:'Moon', color:'#C9A84C',
    luckyDay:'Monday', compatibility:['Scorpio','Pisces','Taurus'],
    love:   ['Deep emotional sensitivity draws your partner closer with irresistible warmth.',
             'Your nurturing wisdom is exactly what a loved one needs and will deeply appreciate.',
             'Your emotional intelligence navigates a delicate relational situation with grace.',
             'Your innate empathy heals a wounded relationship that needed your compassionate touch.',
             'Old memories surface with healing purpose — revisit them gently with an open heart.',
             'Stand firmly in your emotional needs; your partner benefits from your honest clarity.',
             'Healthy emotional boundaries create clarity, closeness, and deepened mutual trust.'],
    career:['Creative work reveals your true professional soul purpose with startling clarity.',
            'Your intuition about a business matter proves strikingly and usefully accurate.',
            'Your emotional intelligence navigates a workplace sensitivity with visible skill.',
            'Community or team service brings unexpected recognition and genuine professional joy.',
            'Your careful, compassionate communication style solves a persistent workplace challenge.',
            'A financial or career opportunity arises through an unexpected personal connection.',
            'Your persistent care and attention creates results that others are now noticing.'],
    health:['Psychic sensitivity is high — protect your energy carefully through intentional grounding.',
            'Your intuitive wisdom about your own body is unusually accurate today — trust it.',
            'Honor your genuine need for meaningful evening solitude as true self-care today.',
            'A dream carries significant wellness content — record and reflect on it carefully.',
            'Old emotional patterns surface with healing intent — process them with self-compassion.',
            'Your body craves emotional nourishment as much as physical sustenance today.',
            'Healthy emotional boundaries are your most powerful and effective wellness tool.'],
    finance:['Financial matters resolve harmoniously with the Moon\'s gentle, supportive guidance.',
             'Review expenses with careful attention — small leaks can be easily and quickly patched.',
             'Contracts and financial communications require your precise, detail-oriented attention.',
             'Community-connected financial opportunities are surprisingly rewarding and fruitful.',
             'A long-standing financial problem yields to logical, methodical examination today.',
             'A financial opportunity arises through a meaningful family or personal connection.',
             'Long-term financial goals take a meaningful, satisfying step in the right direction.'],
    ratings:[{love:5,career:4,health:3,finance:4,overall:4},{love:4,career:4,health:4,finance:3,overall:4},
             {love:4,career:5,health:4,finance:4,overall:4},{love:5,career:3,health:3,finance:3,overall:4},
             {love:4,career:4,health:5,finance:4,overall:4},{love:5,career:4,health:4,finance:4,overall:4},
             {love:4,career:3,health:5,finance:4,overall:4}],
  },
  Leo: {
    symbol:'♌', dates:'Jul 23 — Aug 22', element:'Fire', ruling:'Sun', color:'#FF9F43',
    luckyDay:'Sunday', compatibility:['Aries','Sagittarius','Gemini'],
    love:   ['Romance ignites with passionate intensity — your confidence and warmth are irresistible.',
             'Your generous, warm heart creates deep and lasting romantic connection today.',
             'Love deepens beautifully through genuinely heartfelt, honest communication.',
             'Guard against pride obscuring important romantic feedback — remain lovingly open.',
             'Your emotional depth draws your partner into meaningful, intimate conversation.',
             'Celebrating your victories with loved ones creates warmth and joy for everyone.',
             'Your authentic, courageous presence in love creates something truly beautiful.'],
    career:['Your natural leadership steps forward confidently and earns the recognition it deserves.',
            'Career advancement comes through authentic, unfiltered self-expression today.',
            'A creative collaboration becomes something truly exceptional and career-defining.',
            'A presentation or speech lands with unusually powerful and memorable impact.',
            'Spiritual practice replenishes your considerable professional energy and clarity.',
            'Competitive situations test your full mettle — you emerge noticeably victorious.',
            'Your legacy is built one disciplined, courageous professional decision at a time.'],
    health:['Your vitality is at its natural peak — channel it into something creatively demanding.',
            'Your regal presence maintains its energy when fueled by generous, joyful giving.',
            'Your heart and spine deserve gentle, attentive care alongside vigorous activity.',
            'Guard against overconfidence in physical matters — balanced rest is equally vital.',
            'Spiritual practice specifically replenishes your considerable physical energy today.',
            'Give your heart and spine gentle, intentional care through stretching and movement.',
            'Disciplined physical habits build the royal, lasting vitality you naturally deserve.'],
    finance:['Creative projects attracting financial recognition — your unique talents are paying off.',
             'A charitable act returns unexpected but very meaningful financial blessings today.',
             'Financial gains come naturally through your unique, expressive, and creative talents.',
             'Your natural persuasion powers benefit business and financial matters significantly.',
             'Family financial matters require your generous, warm, and thoughtful spirit today.',
             'Hard-earned financial victories are real and deserve thoughtful, joyful celebration.',
             'Long-term financial projects make steady, deeply satisfying progress through discipline.'],
    ratings:[{love:5,career:5,health:4,finance:4,overall:5},{love:4,career:5,health:4,finance:4,overall:4},
             {love:5,career:4,health:3,finance:5,overall:4},{love:3,career:5,health:4,finance:3,overall:4},
             {love:4,career:3,health:4,finance:4,overall:4},{love:4,career:5,health:3,finance:4,overall:4},
             {love:4,career:4,health:4,finance:4,overall:4}],
  },
  Virgo: {
    symbol:'♍', dates:'Aug 23 — Sep 22', element:'Earth', ruling:'Mercury', color:'#A29BFE',
    luckyDay:'Wednesday', compatibility:['Taurus','Capricorn','Cancer'],
    love:   ['Your attention to meaningful details creates a quietly beautiful romantic impression.',
             'Lowering your defenses opens a relationship to genuine warmth and real connection.',
             'Your careful, thoughtful words bring healing to a relationship that needed them.',
             'Devoted attention to your partner today creates a beautifully lasting shared memory.',
             'Your heart gently guides you where your mind has been unproductively circling.',
             'Your reliability and care become someone\'s true emotional anchor and strength.',
             'Your steadfast, reliable nature is deeply noticed and sincerely appreciated today.'],
    career:['Your meticulous approach to a complex problem yields a brilliant, elegant solution.',
            'Practical professional wisdom helps someone genuinely in need — it returns as karma.',
            'A technical challenge yields fully and satisfyingly to your methodical analysis.',
            'Your unique ability to spot what others miss becomes your most valuable superpower.',
            'Creative projects surprise you with their depth and meaningful professional resonance.',
            'A position of greater career responsibility begins to clearly and concretely approach.',
            'Long-deserved career recognition finally arrives as a tangible, meaningful reward.'],
    health:['Small, consistent healthy changes yield the most meaningful and lasting improvements.',
            'A practical healing discovery today brings long-lasting, measurable health benefit.',
            'Your careful attention to health details creates a quietly beautiful lasting outcome.',
            'A small investment in wellbeing now yields disproportionately large returns later.',
            'Creative healthy activities surprise you with their genuine restorative power today.',
            'Channel high physical energy into productive, satisfying hands-on exercise today.',
            'Your disciplined approach to health is recognized and rewarded with lasting results.'],
    finance:['Review your income streams with characteristic Virgo precision — hidden gains await.',
             'Practical financial wisdom emerges from careful, methodical examination today.',
             'A technical financial challenge yields fully to your disciplined problem-solving.',
             'A small investment today yields disproportionately large and satisfying returns later.',
             'Creative financial projects resonate beyond expectations — trust your original instinct.',
             'A position of greater financial responsibility approaches — prepare with discipline.',
             'Long-deserved financial recognition finally arrives as a concrete, meaningful reward.'],
    ratings:[{love:3,career:5,health:4,finance:5,overall:4},{love:4,career:4,health:5,finance:3,overall:4},
             {love:4,career:5,health:4,finance:4,overall:4},{love:3,career:4,health:3,finance:5,overall:4},
             {love:4,career:4,health:4,finance:4,overall:4},{love:4,career:5,health:4,finance:4,overall:4},
             {love:4,career:5,health:4,finance:5,overall:5}],
  },
  Libra: {
    symbol:'♎', dates:'Sep 23 — Oct 22', element:'Air', ruling:'Venus', color:'#FD79A8',
    luckyDay:'Friday', compatibility:['Gemini','Aquarius','Leo'],
    love:   ['Perfect relational harmony flows through Venus\'s grace — love reaches beautiful completion.',
             'Your natural diplomacy resolves what seemed like an impossible relational misunderstanding.',
             'A creative, artistic experience opens your heart to new romantic depth and possibility.',
             'Evening invested in authentic self-care creates attractive, magnetic romantic energy.',
             'A romantic spark ignites unexpectedly — your indecision resolves into warm, clear action.',
             'Prioritizing inner peace over outer approval transforms your love relationships profoundly.',
             'A deep commitment made today carries beautiful, genuinely lasting relational value.'],
    career:['Legal matters resolve in your favor — your balanced approach proves powerfully effective.',
            'Your extraordinary diplomatic skill resolves what others considered a genuine impasse.',
            'An important professional negotiation concludes favorably thanks to your natural grace.',
            'A public professional moment showcases your extraordinary poise and authentic elegance.',
            'A long-delayed professional decision must be made now — trust your clear first instinct.',
            'A creative collaboration begins with tremendous, visible, and mutually exciting promise.',
            'Your consistent fairness in a challenging situation earns deep and lasting respect.'],
    health:['Balance in all things guides your wellbeing today — it is your mantra and your gift.',
            'Your diplomatic energy can be draining — schedule restorative solitude today.',
            'Creative expression serves as powerful, effective therapy for your sensitive nature.',
            'Invest in beauty and authentic self-care — your body and spirit both need and deserve it.',
            'Your kidneys and lower back benefit specifically from gentle, mindful yoga practice.',
            'Your sensitivity to environmental energies is heightened — choose calming spaces mindfully.',
            'Physical foundations built consistently today carry enduring, beautiful lasting value.'],
    finance:['Financial matters resolve beautifully in your favor with Venus\'s gracious support.',
             'A financial partnership proves far more lucrative than you initially and cautiously expected.',
             'An important financial negotiation concludes favorably — your balance serves you well.',
             'Career advancement through your unique ability to bridge opposing financial perspectives.',
             'Long-delayed financial decisions must now be made — trust your balanced first instinct.',
             'A promising creative financial collaboration begins with great and mutual enthusiasm.',
             'Your consistent financial fairness earns meaningful, lasting trust and important respect.'],
    ratings:[{love:5,career:4,health:4,finance:5,overall:5},{love:4,career:5,health:3,finance:4,overall:4},
             {love:4,career:5,health:4,finance:4,overall:4},{love:4,career:5,health:4,finance:4,overall:4},
             {love:4,career:3,health:4,finance:3,overall:4},{love:4,career:4,health:4,finance:4,overall:4},
             {love:5,career:5,health:4,finance:4,overall:5}],
  },
  Scorpio: {
    symbol:'♏', dates:'Oct 23 — Nov 21', element:'Water', ruling:'Mars', color:'#6C5CE7',
    luckyDay:'Tuesday', compatibility:['Cancer','Pisces','Capricorn'],
    love:   ['Hidden relational truths surface — handle them with your characteristic depth and grace.',
             'A past emotional hurt releases its grip — forgiveness creates powerful personal liberation.',
             'Surprising sweetness enters your relationship as Venus softens your intense presence.',
             'Communication with someone from your past carries genuinely healing and meaningful purpose.',
             'Your extraordinary resilience in love inspires and strengthens those who love you deeply.',
             'Your loved ones sense your unusual emotional depth — let them see inside it tonight.',
             'Your patience in love builds something of profound and lasting beauty over time.'],
    career:['A professional transformation long in process reaches its climactic, defining moment.',
            'Your unique ability to see beneath the surface saves a professionally critical situation.',
            'Research and investigation yield extraordinary results — your analytical power shines.',
            'A mystery that has troubled you professionally reveals its surprising solution today.',
            'Your extraordinary resilience through challenge inspires and motivates those around you.',
            'A position of genuine strategic professional power approaches — prepare and step into it.',
            'Your extraordinary capacity for disciplined transformation defines your career trajectory.'],
    health:['Your personal power and vitality are currently at their most potent, transformative peak.',
            'Process deep feelings through purposeful creative expression rather than inward silence.',
            'Creative, expressive outlets serve as genuine and effective therapy for your nature.',
            'A mystery about your health reveals its helpful and illuminating solution to you.',
            'Your resilient body continues recovering from past challenges with remarkable strength.',
            'Psychic sensitivity is exceptionally heightened — protect your energy field tonight.',
            'Trust your body\'s profound capacity for deep metamorphosis and complete regeneration.'],
    finance:['Shared financial resources and transformation-related matters move powerfully forward.',
             'A financial matter involving shared or joint resources aligns very favorably today.',
             'Unexpected financial depth emerges from a creative or spiritual venture you overlooked.',
             'A financial mystery reveals its helpful solution — your investigative instincts pay off.',
             'A joint financial or shared resource matter finally moves clearly and concretely forward.',
             'Financial discipline and extraordinary patience are rewarded with concrete tangible results.',
             'Your long-term financial transformation is progressing exactly as your deepest instincts knew.'],
    ratings:[{love:4,career:5,health:4,finance:5,overall:5},{love:4,career:4,health:4,finance:4,overall:4},
             {love:5,career:4,health:4,finance:4,overall:4},{love:4,career:5,health:4,finance:4,overall:4},
             {love:4,career:4,health:4,finance:4,overall:4},{love:4,career:5,health:3,finance:4,overall:4},
             {love:4,career:5,health:4,finance:4,overall:4}],
  },
  Sagittarius: {
    symbol:'♐', dates:'Nov 22 — Dec 21', element:'Fire', ruling:'Jupiter', color:'#E17055',
    luckyDay:'Thursday', compatibility:['Aries','Leo','Aquarius'],
    love:   ['Your prophetic optimism in love is not naive — it is genuinely and beautifully well-founded.',
             'A romantic partner shares your deeper values — the connection deepens into something real.',
             'Your broad, generous perspective beautifully solves a romantic misunderstanding.',
             'A philosophical conversation with your partner reveals unexpectedly deep romantic resonance.',
             'Your warm, adventurous spirit meets an emotional need your partner has quietly been holding.',
             'Your heart and its emotional needs deserve equal honor alongside all intellectual adventures.',
             'Your hard-won wisdom in love becomes another person\'s liberation and source of healing.'],
    career:['A philosophical professional insight transforms how you clearly see your unique path.',
            'Teaching, sharing, or publishing your wisdom creates meaningful and positive ripple effects.',
            'A legal or educational professional matter resolves very clearly in your favor today.',
            'Financial and professional matters benefit from your optimism backed by concrete planning.',
            'A bold career action opens a door that patient waiting alone could never have unlocked.',
            'Your remarkably broad perspective solves what narrow, conventional thinking cannot.',
            'A long-term educational or philosophical project reaches a deeply meaningful milestone.'],
    health:['Your abundant natural fire and vitality seek adventurous, expansive outdoor expression.',
            'Guard against overcommitting physically — authentic enthusiasm sometimes outpaces recovery.',
            'Your broad perspective on wellness opens a new and surprisingly effective healing path.',
            'Physical practice grounds your visionary nature in the body\'s present reality and wisdom.',
            'A physical adventure tests and significantly strengthens your remarkable, resilient spirit.',
            'Your body and spirit both need emotional nourishment alongside all your physical adventures.',
            'Consistent, grounded physical practice builds the lasting vitality your adventurous life demands.'],
    finance:['A major breakthrough financial understanding transforms your entire sense of abundance.',
             'A foreign or distant financial connection brings a genuinely significant monetary opportunity.',
             'A legal or financial matter resolves clearly and very favorably in your direction today.',
             'Financial matters benefit fully from optimism backed by careful, realistic planning.',
             'A bold financial action opens a door that patience alone could never have unlocked.',
             'Your broad financial perspective solves what narrow, conventional thinking simply cannot.',
             'A long-term financial or investment project reaches a deeply meaningful tangible milestone.'],
    ratings:[{love:4,career:5,health:4,finance:4,overall:4},{love:4,career:5,health:3,finance:4,overall:4},
             {love:3,career:5,health:4,finance:5,overall:4},{love:5,career:4,health:4,finance:4,overall:4},
             {love:4,career:5,health:5,finance:4,overall:5},{love:4,career:4,health:4,finance:3,overall:4},
             {love:4,career:5,health:4,finance:4,overall:4}],
  },
  Capricorn: {
    symbol:'♑', dates:'Dec 22 — Jan 19', element:'Earth', ruling:'Saturn', color:'#636E72',
    luckyDay:'Saturday', compatibility:['Taurus','Virgo','Scorpio'],
    love:   ['Allow yourself to fully receive love — you have genuinely and thoroughly earned this warmth.',
             'A relationship genuinely surprises you with warmth and depth you weren\'t expecting.',
             'A long-guarded feeling finds its safe, welcome, and healing emotional expression today.',
             'The most beautiful relationships you build, like great structures, last through generations.',
             'Your competence and genuine integrity attract exactly the partner your soul recognizes.',
             'Family heritage carries important keys to understanding your present relationship situation.',
             'Your legendary persistence in love is deeply and truly noticed by those closest to you.'],
    career:['A career milestone arrives, hard-earned and profoundly meaningful — it deserves celebration.',
            'A professional recognition arrives quietly for work done consistently in quiet dedication.',
            'A business strategy crystallizes with unusual, actionable, and practical clarity today.',
            'Authority figures respond very positively to your measured, competent, and reliable approach.',
            'Your competence and integrity earn the professional recognition they have long deserved.',
            'A leadership role perfectly suited to your natural strengths approaches clearly today.',
            'A project that seemed completely stalled breaks clearly through its obstacle today.'],
    health:['Your steady, disciplined physical nature reaches a well-earned health summit today.',
            'Allow genuine rest — you have absolutely earned this restorative and necessary recovery.',
            'Your disciplined physical approach creates lasting, measurable wellness results over time.',
            'The most beautiful physical habits built consistently last through entire healthy years.',
            'Your ancestors\' remarkable strength flows through you in every moment of physical challenge.',
            'Family heritage holds important wellness keys — revisit traditional health practices today.',
            'Your knees and joints benefit meaningfully from gentle, consistent movement and care.'],
    finance:['Financial discipline creates genuine, lasting material wealth — your patient approach pays.',
             'An unexpected financial grace arrives as a reward for your sustained, consistent effort.',
             'A business financial strategy crystallizes with extraordinary clarity and precision today.',
             'Legal and contractual financial documents require your careful, characteristic attention.',
             'Your competence and integrity earn meaningful financial recognition and genuine trust.',
             'A property or home financial matter reaches a favorable and deeply satisfying resolution.',
             'A stalled financial project breaks through its obstacle with determined, renewed momentum.'],
    ratings:[{love:3,career:5,health:4,finance:5,overall:4},{love:4,career:5,health:3,finance:4,overall:4},
             {love:4,career:5,health:4,finance:5,overall:5},{love:4,career:4,health:4,finance:4,overall:4},
             {love:4,career:5,health:4,finance:4,overall:4},{love:4,career:4,health:4,finance:4,overall:4},
             {love:3,career:4,health:4,finance:4,overall:4}],
  },
  Aquarius: {
    symbol:'♒', dates:'Jan 20 — Feb 18', element:'Air', ruling:'Saturn', color:'#00CEC9',
    luckyDay:'Saturday', compatibility:['Gemini','Libra','Sagittarius'],
    love:   ['Your unique perspective on human connection creates genuinely meaningful romantic resonance.',
             'Friendships deepen authentically through shared ideals and mutual humanitarian vision.',
             'Warmth added to your natural detachment creates a beautifully balanced, attractive presence.',
             'Being emotionally present transforms a deep friendship into something far more meaningful.',
             'An important emotional ally emerges from an unexpected and surprising personal direction.',
             'Your empathy for humanity expresses itself most beautifully through present, personal love.',
             'The future of love you envision for yourself is being built one brave step at a time.'],
    career:['A humanitarian idea finds the powerful institutional support it has long been waiting for.',
            'A community professional initiative gains the real momentum needed for genuine lasting impact.',
            'A technological solution emerges with elegant, powerful, and surprisingly beautiful simplicity.',
            'Creative work with clear social purpose receives meaningful professional recognition today.',
            'Your innovative professional approach disrupts in the most constructive and positive sense.',
            'Disciplined, systematic work on your vision creates a definitive and remarkable career stage.',
            'Your disciplined professional eccentricity is your single greatest and most recognized asset.'],
    health:['Your remarkable visionary energy needs practical physical grounding in consistent movement.',
            'Community interaction and shared physical activities replenish your considerable reserves.',
            'An eccentric but genuinely effective wellness approach deserves your serious consideration.',
            'Allow yourself to be fully emotionally present — your feelings hold real physical wisdom.',
            'The cosmic Age of Aquarius flows through your body as an instrument of physical change.',
            'A solitary physical practice specifically replenishes your extraordinary outward-directed energy.',
            'Systematic, disciplined physical habits ground your expansive vision in a strong, healthy body.'],
    finance:['Technology or innovation specifically opens an unexpected and significant financial door.',
             'A community financial initiative gains exactly the momentum it needs for real lasting impact.',
             'An eccentric financial idea deserves serious evaluation — it is genuinely ahead of its time.',
             'Creative work with social purpose yields surprising and meaningful financial recognition.',
             'Your innovative financial approach disrupts in the most financially constructive sense.',
             'Long-term financial projects built on innovative vision reach a definitive important stage.',
             'Your systematic approach to financial innovation is your greatest and most lasting asset.'],
    ratings:[{love:4,career:5,health:3,finance:4,overall:4},{love:4,career:5,health:4,finance:4,overall:4},
             {love:3,career:5,health:4,finance:4,overall:4},{love:5,career:4,health:4,finance:4,overall:4},
             {love:4,career:5,health:4,finance:4,overall:4},{love:4,career:4,health:4,finance:4,overall:4},
             {love:4,career:5,health:4,finance:5,overall:5}],
  },
  Pisces: {
    symbol:'♓', dates:'Feb 19 — Mar 20', element:'Water', ruling:'Jupiter', color:'#74B9FF',
    luckyDay:'Thursday', compatibility:['Cancer','Scorpio','Taurus'],
    love:   ['Your compassionate, boundless love heals a wounded heart with extraordinary gentle power.',
             'Your extraordinary intuition guides you perfectly toward authentic, soulful romantic connection.',
             'A creative, artistic love expression is received with deep and genuine appreciation.',
             'A romantic connection carries unmistakable soulmate resonance — pay close, careful attention.',
             'A teacher or spiritual figure appears with profound wisdom about love and true connection.',
             'Sacred solitude brings a profound insight about what you truly need in your love life.',
             'Your loving emotional boundaries, established with care, become your greatest relationship freedom.'],
    career:['Creative or spiritual professional work reaches a transcendent level of authentic expression.',
            'A creative project channels genuine higher inspiration into something truly extraordinary.',
            'A creative writing or artistic project reaches a beautifully significant professional completion.',
            'Financial matters through creative or spiritual work align extremely and favorably today.',
            'A teacher or spiritual mentor appears with genuinely transformative professional wisdom.',
            'Subconscious material surfaces and brings an extraordinary professional insight to light.',
            'Spiritual disciplines practiced consistently yield remarkably transformative professional results.'],
    health:['A dream carries profound wellness content — write it down and reflect on it carefully.',
            'Your extraordinary intuition about your body\'s true needs is highly accurate today.',
            'Creative or artistic expression serves as genuine, deep therapy for your sensitive nature.',
            'Beauty serves as your personal portal to physical and spiritual divine wellbeing today.',
            'Your faith — in life, yourself, and the cosmos — supports your body\'s natural healing.',
            'Solitude is sacred, healing communion with your deepest physical and spiritual self.',
            'Your loving, established boundaries create the emotional freedom that sustains true wellbeing.'],
    finance:['Financial matters through creative or inspired spiritual work align powerfully and favorably.',
             'A spiritual practice opens a surprising and genuinely valuable financial opportunity.',
             'Creative financial completion brings a profound sense of satisfaction and meaningful relief.',
             'Financial matters through inspired, creative work align in uniquely favorable ways today.',
             'A far-reaching financial connection carries an important and transformative message.',
             'A hidden financial opportunity surfaces as your subconscious brings it into conscious awareness.',
             'Financial boundaries established with love create the freedom and clarity you\'ve been seeking.'],
    ratings:[{love:5,career:4,health:4,finance:4,overall:4},{love:5,career:4,health:5,finance:3,overall:4},
             {love:4,career:5,health:4,finance:4,overall:4},{love:5,career:4,health:4,finance:5,overall:5},
             {love:4,career:5,health:4,finance:4,overall:4},{love:4,career:4,health:5,finance:4,overall:4},
             {love:4,career:4,health:5,finance:4,overall:4}],
  },
};

export default function HoroscopeSignPage() {
  const { sign } = useParams();
  const signKey = sign ? sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase() : '';
  const signData = SIGNS_DATA[signKey];

  const [overview, setOverview] = useState('');
  const [luckyColor, setLuckyColor] = useState('Gold');
  const [luckyNumber, setLuckyNumber] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!signData) return;
    horoscopeApi.getDaily(signKey)
      .then(res => {
        setOverview(res.data.overview || res.data.horoscope || '');
        setLuckyColor(res.data.luckyColor || 'Gold');
        setLuckyNumber(res.data.luckyNumber || 7);
      })
      .catch(() => {
        setOverview('The cosmos aligns in your favor today. Trust your intuition and embrace the opportunities that present themselves with confidence.');
        setLuckyColor('Gold');
        setLuckyNumber(7);
      })
      .finally(() => setLoading(false));
  }, [signKey]);

  if (!signData) return <Navigate to="/horoscope" replace />;

  const dayOfWeek = new Date().getDay();
  const ratings = signData.ratings[dayOfWeek];
  const today = new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const colorCss = COLOR_CSS[luckyColor] || '#c9a84c';

  const CATEGORIES = [
    { key:'love',    label:'Love',    icon:'❤️', color:'#FF6B9D' },
    { key:'career',  label:'Career',  icon:'💼', color:'#FFD93D' },
    { key:'health',  label:'Health',  icon:'🌿', color:'#6BCB77' },
    { key:'finance', label:'Finance', icon:'💰', color:'#C9A84C' },
  ];

  return (
    <div className="relative min-h-screen bg-cosmic-950">
      <div className="relative z-10 pt-32 pb-16">

        {/* Breadcrumb */}
        <div className="max-w-4xl mx-auto px-4 md:px-8 mb-4 pt-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Link to="/horoscope" className="hover:text-gold-400 flex items-center gap-1 transition-colors">
              <ChevronLeft className="w-4 h-4" /> All Signs
            </Link>
            <span>/</span>
            <span className="text-gold-400">{signKey}</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-5">

          {/* Hero banner */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            className="rounded-3xl overflow-hidden"
            style={{ boxShadow:`0 0 80px ${signData.color}25` }}>
            <div className="relative px-8 py-10 text-center"
              style={{ background:`linear-gradient(135deg, ${signData.color}35, ${signData.color}10)` }}>
              <div className="absolute inset-0 bg-cosmic-900/50" />
              <div className="relative z-10">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center border-2"
                  style={{ borderColor:signData.color+'80', background:signData.color+'20' }}>
                  <ZodiacIcon sign={signKey} size={80} />
                </div>
                <p className="text-gray-200 text-xs uppercase tracking-widest mb-1">{signData.dates}</p>
                <h1 className="font-serif text-3xl md:text-5xl mb-3" style={{ color:signData.color, textShadow:`0 0 40px ${signData.color}60` }}>
                  {signKey}
                </h1>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-gray-300 text-sm">
                    {ELEMENT_ICON[signData.element]} {signData.element}
                  </span>
                  <span className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-gray-300 text-sm">
                    🪐 {signData.ruling}
                  </span>
                  <span className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-gray-200 text-sm">
                    📅 {today}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Overview */}
          <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className="bg-cosmic-800/60 backdrop-blur-sm border border-gold-600/20 rounded-3xl p-6">
            <h2 className="font-serif text-gold-400 text-xl mb-3">🌟 Today's Cosmic Reading</h2>
            {loading ? (
              <div className="flex items-center gap-3 text-gray-300 py-2">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <motion.div key={i} animate={{ opacity:[0.3,1,0.3] }} transition={{ repeat:Infinity, duration:1, delay:i*0.2 }}
                      className="w-2 h-2 rounded-full bg-gold-400" />
                  ))}
                </div>
                Reading the stars...
              </div>
            ) : (
              <p className="text-gray-300 leading-relaxed text-base font-light">{overview}</p>
            )}
          </motion.div>

          {/* Category breakdown */}
          <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
            className="bg-cosmic-800/60 border border-gold-600/20 rounded-3xl p-6">
            <h2 className="font-serif text-gold-400 text-xl mb-4">Today's Energy Forecast</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CATEGORIES.map(cat => (
                <div key={cat.key} className="bg-cosmic-900/60 rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-2">{cat.icon}</div>
                  <p className="text-white text-sm font-semibold mb-2">{cat.label}</p>
                  <div className="flex justify-center gap-0.5 mb-3">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className="text-sm" style={{ color: s <= ratings[cat.key] ? cat.color : '#374151' }}>★</span>
                    ))}
                  </div>
                  <p className="text-gray-200 text-xs leading-relaxed">{signData[cat.key][dayOfWeek]}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Lucky elements */}
          <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
            className="bg-cosmic-800/60 border border-gold-600/20 rounded-3xl p-6">
            <h2 className="font-serif text-gold-400 text-xl mb-4">🍀 Lucky Elements Today</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center bg-cosmic-900/60 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-full mx-auto mb-2 border-2 border-white/10"
                  style={{ background: colorCss }} />
                <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">Color</p>
                <p className="text-white font-semibold text-sm">{luckyColor}</p>
              </div>
              <div className="text-center bg-cosmic-900/60 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-full mx-auto mb-2 bg-gold-500/20 border border-gold-500/40 flex items-center justify-center">
                  <span className="text-gold-400 font-bold text-lg">{luckyNumber}</span>
                </div>
                <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">Number</p>
                <p className="text-white font-semibold text-sm">{luckyNumber}</p>
              </div>
              <div className="text-center bg-cosmic-900/60 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-full mx-auto mb-2 bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                  <span className="text-lg">🪐</span>
                </div>
                <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">Lucky Day</p>
                <p className="text-white font-semibold text-sm">{signData.luckyDay}</p>
              </div>
            </div>
          </motion.div>

          {/* Compatibility */}
          <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
            className="bg-cosmic-800/60 border border-gold-600/20 rounded-3xl p-6">
            <h2 className="font-serif text-gold-400 text-xl mb-1">Most Compatible Today</h2>
            <p className="text-gray-300 text-sm mb-4">Signs you harmonize with most today</p>
            <div className="flex gap-3 flex-wrap">
              {signData.compatibility.map(s => {
                const cd = SIGNS_DATA[s];
                return (
                  <Link key={s} to={`/horoscope/${s.toLowerCase()}`}
                    className="flex items-center gap-2 bg-cosmic-900/60 border border-gold-500/20 rounded-xl px-4 py-2.5 hover:border-gold-400/40 hover:bg-cosmic-800 transition-all">
                    <span style={{ color:cd?.color }} className="text-xl">{cd?.symbol}</span>
                    <div>
                      <p className="text-white text-sm font-medium">{s}</p>
                      <p className="text-gray-300 text-xs">{cd?.dates}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
            className="flex flex-col sm:flex-row gap-3">
            <Link to="/kundali" className="flex-1 text-center bg-gradient-to-r from-gold-600 to-gold-400 text-cosmic-950 font-semibold rounded-full py-3 text-sm hover:opacity-90 transition-opacity">
              Get My Free Kundali
            </Link>
            <Link to="/astrologers" className="flex-1 text-center border border-gold-500/40 text-gold-400 rounded-full py-3 text-sm hover:bg-gold-500/10 transition-colors">
              Talk to Astrologer
            </Link>
          </motion.div>

          {/* Other signs grid */}
          <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}>
            <h3 className="font-serif text-gold-400 text-xl mb-4 text-center">Explore Other Signs</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {Object.entries(SIGNS_DATA).filter(([s]) => s !== signKey).map(([s, data]) => (
                <Link key={s} to={`/horoscope/${s.toLowerCase()}`}
                  className="flex flex-col items-center gap-1.5 p-3 bg-cosmic-800/40 border border-gold-600/10 rounded-2xl hover:border-gold-400/30 hover:bg-cosmic-800/60 transition-all">
                  <span style={{ color:data.color }} className="text-xl">{data.symbol}</span>
                  <span className="text-gray-200 text-xs">{s}</span>
                </Link>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
