import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TRANSLATIONS } from '../constants';

interface I18nContextType {
  lang: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof TRANSLATIONS.en) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('lang') as Language) || 'ar';
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('lang', lang);
  }, [lang]);

  const t = (key: keyof typeof TRANSLATIONS.en) => {
    return TRANSLATIONS[lang][key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLanguage: setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
