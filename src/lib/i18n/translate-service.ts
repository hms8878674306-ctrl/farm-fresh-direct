import type { Dictionary } from "./en";
import { en } from "./en";
import { getTranslateCode, type LanguageCode } from "./languages";

/** Bump when English source strings change to invalidate cached translations. */
export const I18N_CACHE_VERSION = "4";

const PLACEHOLDER_RE = /\{[a-zA-Z0-9_]+\}/g;
const CACHE_PREFIX = "krishi-i18n-cache";
const BATCH_SEP = "\n⟦KR⟧\n";

type CachePayload = {
  version: string;
  entries: Dictionary;
};

/** In-memory cache for instant language switches (same session). */
const memoryCache = new Map<LanguageCode, Dictionary>();

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
    // ignore quota errors
  }
}

/** Synchronous lookup — used when user changes language. */
export function getCachedDictionary(lang: LanguageCode): Dictionary | null {
  if (lang === "en") return en;
  const mem = memoryCache.get(lang);
  if (mem) return mem;
  const stored = readCache(lang);
  if (stored) {
    memoryCache.set(lang, stored);
    return stored;
  }
  return null;
}

function storeDictionary(lang: LanguageCode, entries: Dictionary) {
  memoryCache.set(lang, entries);
  writeCache(lang, entries);
}

async function googleBatchTranslate(texts: string[], targetLang: LanguageCode): Promise<string[]> {
  const tl = getTranslateCode(targetLang);
  const shields = texts.map((text) => shieldPlaceholders(text));
  const chunks: { start: number; texts: typeof shields }[] = [];

  let batch: typeof shields = [];
  let batchLen = 0;
  let start = 0;

  for (let i = 0; i < shields.length; i++) {
    const len = shields[i].shielded.length + BATCH_SEP.length;
    if (batch.length > 0 && batchLen + len > 3500) {
      chunks.push({ start, texts: batch });
      start = i;
      batch = [];
      batchLen = 0;
    }
    batch.push(shields[i]);
    batchLen += len;
  }
  if (batch.length) chunks.push({ start, texts: batch });

  const output = [...texts];

  for (const chunk of chunks) {
    const payload = chunk.texts.map((s) => s.shielded).join(BATCH_SEP);
    const url =
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${tl}&dt=t&q=` +
      encodeURIComponent(payload);

    const res = await fetch(url);
    if (!res.ok) throw new Error(`translate HTTP ${res.status}`);

    const data = (await res.json()) as [Array<[string]>, ...unknown[]];
    const translatedBlob = data[0].map((part) => part[0]).join("");
    const parts = translatedBlob.split(BATCH_SEP);

    chunk.texts.forEach((shield, i) => {
      const translated = restorePlaceholders(parts[i] ?? chunk.texts[i].shielded, shield.tokens);
      output[chunk.start + i] = translated;
    });
  }

  return output;
}

async function translateDictionary(targetLang: LanguageCode, source: Dictionary): Promise<Dictionary> {
  const entries = Object.entries(source);
  const uniqueTexts = [...new Set(entries.map(([, value]) => value))];

  let translatedList: string[];
  try {
    translatedList = await googleBatchTranslate(uniqueTexts, targetLang);
  } catch {
    translatedList = uniqueTexts;
  }

  const translationMap = new Map(uniqueTexts.map((text, i) => [text, translatedList[i]]));
  const result: Dictionary = { ...source };

  for (const [key, value] of entries) {
    result[key] = translationMap.get(value) ?? value;
  }

  return result;
}

export async function resolveDictionary(lang: LanguageCode, source: Dictionary = en): Promise<Dictionary> {
  if (lang === "en") return source;

  const cached = getCachedDictionary(lang);
  if (cached) return cached;

  const translated = await translateDictionary(lang, source);
  storeDictionary(lang, translated);
  return translated;
}

/** Warm popular languages in the background after first paint. */
export function prefetchLanguages(codes: LanguageCode[]) {
  if (typeof window === "undefined") return;
  const idle = (cb: () => void) =>
    "requestIdleCallback" in window
      ? window.requestIdleCallback(cb, { timeout: 4000 })
      : setTimeout(cb, 1500);

  idle(() => {
    for (const code of codes) {
      if (code === "en" || getCachedDictionary(code)) continue;
      void resolveDictionary(code).catch(() => {});
    }
  });
}

export function clearTranslationCache() {
  memoryCache.clear();
  if (typeof window === "undefined") return;
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith(CACHE_PREFIX)) localStorage.removeItem(key);
  }
}
