import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "en" | "hi" | "mr";

type Dictionary = {
  home: string;
  shop: string;
  farmers: string;
  track: string;
  dashboard: string;
  farmerDashboard: string;
  listings: string;
  orders: string;
  chat: string;
  signIn: string;
  signOut: string;
  cart: string;
  language: string;
  addToCart: string;
  addedToCart: string;
  total: string;
  per: string;
  farmerMode: string;
  consumerMode: string;
};

const dictionaries: Record<Language, Dictionary> = {
  en: {
    home: "Home",
    shop: "Shop",
    farmers: "Farmers",
    track: "Track",
    dashboard: "Dashboard",
    farmerDashboard: "Sales",
    listings: "Listings",
    orders: "Orders",
    chat: "Chat",
    signIn: "Sign in",
    signOut: "Sign out",
    cart: "Cart",
    language: "Language",
    addToCart: "Add to cart",
    addedToCart: "Added to cart",
    total: "total",
    per: "per",
    farmerMode: "Farmer workspace",
    consumerMode: "Consumer market",
  },
  hi: {
    home: "होम",
    shop: "बाज़ार",
    farmers: "किसान",
    track: "ट्रैक",
    dashboard: "डैशबोर्ड",
    farmerDashboard: "बिक्री",
    listings: "लिस्टिंग",
    orders: "ऑर्डर",
    chat: "चैट",
    signIn: "लॉग इन",
    signOut: "लॉग आउट",
    cart: "कार्ट",
    language: "भाषा",
    addToCart: "कार्ट में जोड़ें",
    addedToCart: "कार्ट में जुड़ा",
    total: "कुल",
    per: "प्रति",
    farmerMode: "किसान कार्यक्षेत्र",
    consumerMode: "ग्राहक बाज़ार",
  },
  mr: {
    home: "होम",
    shop: "बाजार",
    farmers: "शेतकरी",
    track: "ट्रॅक",
    dashboard: "डॅशबोर्ड",
    farmerDashboard: "विक्री",
    listings: "यादी",
    orders: "ऑर्डर",
    chat: "चॅट",
    signIn: "लॉग इन",
    signOut: "लॉग आउट",
    cart: "कार्ट",
    language: "भाषा",
    addToCart: "कार्टमध्ये जोडा",
    addedToCart: "कार्टमध्ये जोडले",
    total: "एकूण",
    per: "प्रति",
    farmerMode: "शेतकरी कार्यक्षेत्र",
    consumerMode: "ग्राहक बाजार",
  },
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Dictionary;
};

const LanguageCtx = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
  t: dictionaries.en,
});

const isLanguage = (value: unknown): value is Language =>
  value === "en" || value === "hi" || value === "mr";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("krishi-language");
    if (isLanguage(saved)) setLanguageState(saved);
  }, []);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    if (typeof window !== "undefined") {
      localStorage.setItem("krishi-language", nextLanguage);
    }
  };

  const value = useMemo(
    () => ({ language, setLanguage, t: dictionaries[language] }),
    [language]
  );

  return <LanguageCtx.Provider value={value}>{children}</LanguageCtx.Provider>;
}

export const useLanguage = () => useContext(LanguageCtx);
