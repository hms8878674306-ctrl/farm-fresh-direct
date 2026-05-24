import { Brain, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { forecastPrices } from "@/lib/price-prediction";
import { useLanguage } from "@/lib/language-context";

export function PricePredictionPanel() {
  const { t } = useLanguage();
  const forecasts = forecastPrices();

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Brain className="h-5 w-5" />
        </div>
        <div>
          <h2 className="display text-2xl font-bold">{t.aiPriceTitle}</h2>
          <p className="text-sm text-muted-foreground">{t.aiPriceSubtitle}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {forecasts.map((f) => {
          const Icon = f.trend === "up" ? TrendingUp : f.trend === "down" ? TrendingDown : Minus;
          const color =
            f.trend === "up" ? "text-fresh" : f.trend === "down" ? "text-destructive" : "text-muted-foreground";

          return (
            <div key={f.productId} className="rounded-2xl border border-border bg-secondary/40 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="font-bold">{f.name}</div>
                <Icon className={`h-4 w-4 shrink-0 ${color}`} />
              </div>
              <div className="mt-2 flex items-baseline gap-2 text-sm">
                <span className="text-muted-foreground">₹{f.currentPrice}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-extrabold text-primary">₹{f.predictedPrice}</span>
                <span className={`text-xs font-bold ${color}`}>
                  {f.changePct > 0 ? "+" : ""}
                  {f.changePct}%
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{f.tip}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t.aiConfidence}: {f.confidence}%
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
