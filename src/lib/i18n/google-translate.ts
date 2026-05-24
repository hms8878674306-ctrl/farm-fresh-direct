import { getGoogleTranslateCode, type LanguageCode } from "./languages";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate: {
        TranslateElement: new (
          options: { pageLanguage: string; autoDisplay: boolean },
          elementId: string,
        ) => void;
      };
    };
  }
}

const GOOGLE_SCRIPT_ID = "google-translate-script";

/** Read `googtrans` cookie value (e.g. `/en/hi`) or null if unset / English. */
export function readGoogTransCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
  const value = match?.[1]?.trim();
  if (!value || value === "/en/en") return null;
  return decodeURIComponent(value);
}

/** Expected googtrans path for a language (`/en/hi` or empty for English). */
export function expectedGoogTrans(lang: LanguageCode): string {
  if (lang === "en") return "";
  return `/en/${getGoogleTranslateCode(lang)}`;
}

export function googTransMatchesLanguage(lang: LanguageCode): boolean {
  const expected = expectedGoogTrans(lang);
  const current = readGoogTransCookie();
  if (lang === "en") return !current;
  return current === expected;
}

function setGoogTransCookie(path: string) {
  const encoded = encodeURIComponent(path);
  const base = `googtrans=${encoded}; path=/`;
  document.cookie = base;
  const host = window.location.hostname;
  if (host && !host.startsWith("localhost")) {
    document.cookie = `${base}; domain=${host}`;
    const parts = host.split(".");
    if (parts.length > 2) {
      document.cookie = `${base}; domain=.${parts.slice(-2).join(".")}`;
    }
  }
}

export function clearGoogTransCookie() {
  const expires = "Thu, 01 Jan 1970 00:00:00 UTC";
  document.cookie = `googtrans=; expires=${expires}; path=/`;
  const host = window.location.hostname;
  if (host && !host.startsWith("localhost")) {
    document.cookie = `googtrans=; expires=${expires}; path=/; domain=${host}`;
  }
}

/** Set Google Translate cookie and reload so Firestore / dynamic DOM is fully translated. */
export function applyGoogleTranslateAndReload(lang: LanguageCode) {
  if (lang === "en") {
    clearGoogTransCookie();
  } else {
    setGoogTransCookie(`/en/${getGoogleTranslateCode(lang)}`);
  }
  window.location.reload();
}

let scriptPromise: Promise<void> | null = null;

/** Load hidden Google Translate widget (required for googtrans cookie on reload). */
export function loadGoogleTranslateScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (document.getElementById(GOOGLE_SCRIPT_ID)) return scriptPromise ?? Promise.resolve();

  scriptPromise = new Promise((resolve) => {
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          { pageLanguage: "en", autoDisplay: false },
          "google_translate_element",
        );
      }
      resolve();
    };

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.onerror = () => resolve();
    document.body.appendChild(script);
  });

  return scriptPromise;
}
