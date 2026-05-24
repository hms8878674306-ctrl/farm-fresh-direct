export const LANGUAGE_CODES = [
  "en",
  "hi",
  "bn",
  "te",
  "mr",
  "ta",
  "ur",
  "gu",
  "kn",
  "ml",
  "or",
  "pa",
  "as",
  "mai",
  "ks",
  "sd",
  "ne",
  "sa",
  "kok",
  "mni",
  "brx",
  "sat",
  "doi",
] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export type RegionalLanguage = {
  code: LanguageCode;
  nativeLabel: string;
  englishLabel: string;
  speechLocale: string;
  /** ISO code used by Google Translate / translation API. */
  translateCode: string;
};

export const ENGLISH: RegionalLanguage = {
  code: "en",
  nativeLabel: "English",
  englishLabel: "English",
  speechLocale: "en-IN",
  translateCode: "en",
};

/** All 23 supported languages (English + 22 scheduled languages). */
export const LANGUAGES: RegionalLanguage[] = [
  ENGLISH,
  { code: "hi", nativeLabel: "हिन्दी", englishLabel: "Hindi", speechLocale: "hi-IN", translateCode: "hi" },
  { code: "bn", nativeLabel: "বাংলা", englishLabel: "Bengali", speechLocale: "bn-IN", translateCode: "bn" },
  { code: "te", nativeLabel: "తెలుగు", englishLabel: "Telugu", speechLocale: "te-IN", translateCode: "te" },
  { code: "mr", nativeLabel: "मराठी", englishLabel: "Marathi", speechLocale: "mr-IN", translateCode: "mr" },
  { code: "ta", nativeLabel: "தமிழ்", englishLabel: "Tamil", speechLocale: "ta-IN", translateCode: "ta" },
  { code: "ur", nativeLabel: "اردو", englishLabel: "Urdu", speechLocale: "ur-IN", translateCode: "ur" },
  { code: "gu", nativeLabel: "ગુજરાતી", englishLabel: "Gujarati", speechLocale: "gu-IN", translateCode: "gu" },
  { code: "kn", nativeLabel: "ಕನ್ನಡ", englishLabel: "Kannada", speechLocale: "kn-IN", translateCode: "kn" },
  { code: "ml", nativeLabel: "മലയാളം", englishLabel: "Malayalam", speechLocale: "ml-IN", translateCode: "ml" },
  { code: "or", nativeLabel: "ଓଡ଼ିଆ", englishLabel: "Odia", speechLocale: "or-IN", translateCode: "or" },
  { code: "pa", nativeLabel: "ਪੰਜਾਬੀ", englishLabel: "Punjabi", speechLocale: "pa-IN", translateCode: "pa" },
  { code: "as", nativeLabel: "অসমীয়া", englishLabel: "Assamese", speechLocale: "as-IN", translateCode: "as" },
  { code: "mai", nativeLabel: "मैथिली", englishLabel: "Maithili", speechLocale: "hi-IN", translateCode: "hi" },
  { code: "ks", nativeLabel: "کٲشُر", englishLabel: "Kashmiri", speechLocale: "hi-IN", translateCode: "hi" },
  { code: "sd", nativeLabel: "سنڌي", englishLabel: "Sindhi", speechLocale: "sd-IN", translateCode: "sd" },
  { code: "ne", nativeLabel: "नेपाली", englishLabel: "Nepali", speechLocale: "ne-NP", translateCode: "ne" },
  { code: "sa", nativeLabel: "संस्कृत", englishLabel: "Sanskrit", speechLocale: "hi-IN", translateCode: "sa" },
  { code: "kok", nativeLabel: "कोंकणी", englishLabel: "Konkani", speechLocale: "kok-IN", translateCode: "kok" },
  { code: "mni", nativeLabel: "মৈতৈলোন্", englishLabel: "Manipuri", speechLocale: "mni-IN", translateCode: "mni" },
  { code: "brx", nativeLabel: "बड़ो", englishLabel: "Bodo", speechLocale: "brx-IN", translateCode: "brx" },
  { code: "sat", nativeLabel: "ᱥᱟᱱᱛᱟᱲᱤ", englishLabel: "Santali", speechLocale: "sat-IN", translateCode: "sat" },
  { code: "doi", nativeLabel: "डोगरी", englishLabel: "Dogri", speechLocale: "doi-IN", translateCode: "doi" },
];

/** @deprecated Use LANGUAGES */
export const INDIAN_LANGUAGES = LANGUAGES;

const byCode = new Map(LANGUAGES.map((lang) => [lang.code, lang]));

export function languageOptionLabel(lang: RegionalLanguage): string {
  return `${lang.nativeLabel} (${lang.code.toUpperCase()})`;
}

export function getRegionalLanguage(code: LanguageCode): RegionalLanguage | undefined {
  return byCode.get(code);
}

export function isSupportedLanguage(code: unknown): code is LanguageCode {
  return typeof code === "string" && byCode.has(code as LanguageCode);
}

export function getSpeechLocale(code: LanguageCode): string {
  return getRegionalLanguage(code)?.speechLocale ?? "en-IN";
}

export function getTranslateCode(code: LanguageCode): string {
  return getRegionalLanguage(code)?.translateCode ?? code;
}

export function getGoogleTranslateCode(code: LanguageCode): string {
  return getTranslateCode(code);
}
