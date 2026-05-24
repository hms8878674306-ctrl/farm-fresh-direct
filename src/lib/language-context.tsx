import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en, type Dictionary } from "@/lib/i18n/en";
import { getSpeechLocale, isSupportedLanguage, type LanguageCode } from "@/lib/i18n/languages";
import {
  getCachedDictionary,
  prefetchLanguages,
  resolveDictionary,
} from "@/lib/i18n/translate-service";

export type Language = LanguageCode;

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: Dictionary;
  speechLocale: string;
  translating: boolean;
};

const LanguageCtx = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
  t: en,
  speechLocale: "en-IN",
  translating: false,
});

function applyLanguage(
  lang: LanguageCode,
  setDictionary: (d: Dictionary) => void,
  setTranslating: (v: boolean) => void,
) {
  if (lang === "en") {
    setDictionary(en);
    setTranslating(false);
    return;
  }

  const cached = getCachedDictionary(lang);
  if (cached) {
    setDictionary(cached);
    setTranslating(false);
    return;
  }

  setTranslating(true);
  void resolveDictionary(lang, en).then((next) => {
    setDictionary(next);
    setTranslating(false);
  });
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [dictionary, setDictionary] = useState<Dictionary>(en);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("krishi-language");
    const initial = isSupportedLanguage(saved) ? saved : "en";
    setLanguageState(initial);
    applyLanguage(initial, setDictionary, setTranslating);
    prefetchLanguages(["hi", "mr", "bn", "ta", "te", "gu", "kn", "ml"]);
  }, []);

  const setLanguage = (nextLanguage: LanguageCode) => {
    if (!isSupportedLanguage(nextLanguage)) return;
    setLanguageState(nextLanguage);
    if (typeof window !== "undefined") {
      localStorage.setItem("krishi-language", nextLanguage);
    }
    applyLanguage(nextLanguage, setDictionary, setTranslating);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: dictionary,
      speechLocale: getSpeechLocale(language),
      translating,
    }),
    [dictionary, language, translating],
  );

  return <LanguageCtx.Provider value={value}>{children}</LanguageCtx.Provider>;
}

export const useLanguage = () => useContext(LanguageCtx);
