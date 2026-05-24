import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en, type Dictionary } from "@/lib/i18n/en";
import { getSpeechLocale, isSupportedLanguage, type LanguageCode } from "@/lib/i18n/languages";
import { resolveDictionary } from "@/lib/i18n/translate-service";

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

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [dictionary, setDictionary] = useState<Dictionary>(en);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("krishi-language");
    if (isSupportedLanguage(saved)) setLanguageState(saved);
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (language === "en") {
      setDictionary(en);
      setTranslating(false);
      return;
    }

  const load = async () => {
      setTranslating(true);
      try {
        const next = await resolveDictionary(language, en);
        if (!cancelled) setDictionary(next);
      } catch {
        if (!cancelled) setDictionary(en);
      } finally {
        if (!cancelled) setTranslating(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [language]);

  const setLanguage = (nextLanguage: LanguageCode) => {
    if (!isSupportedLanguage(nextLanguage)) return;
    setLanguageState(nextLanguage);
    if (typeof window !== "undefined") {
      localStorage.setItem("krishi-language", nextLanguage);
    }
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
