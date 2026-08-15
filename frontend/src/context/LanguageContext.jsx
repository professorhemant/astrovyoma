import React, { createContext, useContext, useEffect, useState } from 'react';

// Which language the reader wants their readings in.
//
// Deliberately narrow for now: this chooses the language of the *writing* — the
// readings, the paragraphs, the parts of a report somebody sits and reads — and
// not the language of the interface. Buttons and table headings stay English.
//
// That split is the whole point rather than a shortcut. The Hindi that exists
// on this site is authored astrological Hindi; the interface has no Hindi at
// all, and machine-translating a hundred buttons to reach parity would make the
// site worse, not more Hindi. A reader who wants the reading in Hindi is served
// completely by translating the reading.
//
// Remembered per browser, because a reader who picks Hindi means it, and being
// asked again on the next page would be its own kind of rude.

const KEY = 'astrovyoma_lang';
const LanguageContext = createContext({ lang: 'en', setLang: () => {}, isHindi: false });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem(KEY) === 'hi' ? 'hi' : 'en'; } catch { return 'en'; }
  });

  const setLang = (next) => {
    setLangState(next === 'hi' ? 'hi' : 'en');
    try { localStorage.setItem(KEY, next); } catch { /* private browsing — the choice just will not stick */ }
  };

  // The page's own language attribute, so a screen reader announces Devanagari
  // as Hindi rather than reading it as though it were English.
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, isHindi: lang === 'hi' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

// Picks the Hindi where there is Hindi, and the English where there is not.
//
// The fallback is the honest half of this feature. Hindi exists for the lagna,
// the nakshatra, the dasha and the doshas; it does not exist for every domain
// the English page prints. Falling back leaves a reader with an English
// paragraph in a Hindi report, which is plainly better than a blank space and
// very much better than a translated guess about their health or their
// marriage.
export function pick(hindi, english, isHindi) {
  if (!isHindi) return english;
  return (hindi === undefined || hindi === null || hindi === '') ? english : hindi;
}
