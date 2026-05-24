import { Languages } from "lucide-react";
import { LANGUAGES, languageOptionLabel, useLanguage, type Language } from "@/lib/language-context";
import { cn } from "@/lib/utils";

type LanguageSelectProps = {
  className?: string;
  selectClassName?: string;
};

export function LanguageSelect({ className, selectClassName }: LanguageSelectProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label
      className={cn(
        "inline-flex h-10 items-center gap-1 rounded-full border border-border bg-card px-2 text-sm shadow-soft",
        className,
      )}
    >
      <Languages className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <span className="sr-only">{t.language}</span>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className={cn("max-w-[9.5rem] bg-transparent text-xs font-semibold outline-none", selectClassName)}
        aria-label={t.language}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {languageOptionLabel(lang)}
          </option>
        ))}
      </select>
    </label>
  );
}
