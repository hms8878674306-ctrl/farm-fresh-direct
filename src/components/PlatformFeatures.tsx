import { Brain, Headset, MapPinned } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const FEATURES = [
  { titleKey: "featureAiTitle", copyKey: "featureAiCopy", Icon: Brain },
  { titleKey: "featureVoiceTitle", copyKey: "featureVoiceCopy", Icon: Headset },
  { titleKey: "featureGpsTitle", copyKey: "featureGpsCopy", Icon: MapPinned },
] as const;

export function PlatformFeatures() {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="grid gap-4">
        {FEATURES.map(({ titleKey, copyKey, Icon }) => (
          <div
            key={titleKey}
            className="flex items-start gap-4 rounded-2xl border border-border bg-secondary/50 p-5 shadow-card hover-lift"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="display text-xl font-bold">{t[titleKey]}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{t[copyKey]}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
