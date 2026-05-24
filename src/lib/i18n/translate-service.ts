import type { Dictionary } from "./en";
import { en } from "./en";
import { getTranslateCode, type LanguageCode } from "./languages";

/** Bump when English source strings change to invalidate cached translations. */
export const I18N_CACHE_VERSION = "3";

const PLACEHOLDER_RE = /\{[a-zA-Z0-9_]+\}/g;
const CACHE_PREFIX = "krishi-i18n-cache";

type CachePayload = {
  version: string;
  entries: Dictionary;
};

function cacheKey(lang: LanguageCode) {
  return `${CACHE_PREFIX}:${I18N_CACHE_VERSION}:${lang}`;
}

function shieldPlaceholders(text: string) {
  const tokens: string[] = [];
  const shielded = text.replace(PLACEHOLDER_RE, (match) => {
    tokens.push(match);
    return `__PH${tokens.length - 1}__`;
  });
  return { shielded, tokens };
}

function restorePlaceholders(text: string, tokens: string[]) {
  return text.replace(/__PH(\d+)__/g, (_, index) => tokens[Number(index)] ?? "");
}

async function translateLine(text: string, targetLang: LanguageCode): Promise<string> {
  const target = getTranslateCode(targetLang);
  const { shielded, tokens } = shieldPlaceholders(text);
  if (!shielded.trim()) return text;

  const url =
    "https://api.mymemory.translated.net/get?" +
    new URLSearchParams({
      q: shielded,
      langpair: `en|${target}`,
      de: "krishidirect@user.com",
    });

  const res = await fetch(url);
  if (!res.ok) throw new Error(`translate HTTP ${res.status}`);

  const data = (await res.json()) as {
    responseStatus?: number;
    responseData?: { translatedText?: string };
  };

  if (data.responseStatus !== 200 || !data.responseData?.translatedText) {
    throw new Error("translate API rejected request");
  }

  return restorePlaceholders(data.responseData.translatedText, tokens);
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function runWorker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => runWorker()));
  return results;
}

function readCache(lang: LanguageCode): Dictionary | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(cacheKey(lang));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachePayload;
    if (parsed.version !== I18N_CACHE_VERSION) return null;
    return parsed.entries;
  } catch {
    return null;
  }
}

function writeCache(lang: LanguageCode, entries: Dictionary) {
  if (typeof window === "undefined") return;
  const payload: CachePayload = { version: I18N_CACHE_VERSION, entries };
  try {
    localStorage.setItem(cacheKey(lang), JSON.stringify(payload));
  } catch {
    // Storage full — translations still work for this session.
  }
}

/** Unique English strings → one API call each, then mapped back to all keys. */
async function translateDictionary(targetLang: LanguageCode, source: Dictionary): Promise<Dictionary> {
  const entries = Object.entries(source);
  const uniqueTexts = [...new Set(entries.map(([, value]) => value))];

  const translatedList = await mapWithConcurrency(uniqueTexts, 6, async (text, index) => {
    if (index > 0) await new Promise((r) => setTimeout(r, 120));
    try {
      return await translateLine(text, targetLang);
    } catch {
      return text;
    }
  });

  const translationMap = new Map(uniqueTexts.map((text, i) => [text, translatedList[i]]));
  const result: Dictionary = { ...source };

  for (const [key, value] of entries) {
    result[key] = translationMap.get(value) ?? value;
  }

  return result;
}

export async function resolveDictionary(lang: LanguageCode, source: Dictionary = en): Promise<Dictionary> {
  if (lang === "en") return source;

  const cached = readCache(lang);
  if (cached) return cached;

  const translated = await translateDictionary(lang, source);
  writeCache(lang, translated);
  return translated;
}

export function clearTranslationCache() {
  if (typeof window === "undefined") return;
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith(CACHE_PREFIX)) localStorage.removeItem(key);
  }
}
