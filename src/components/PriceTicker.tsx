import { TrendingUp, TrendingDown, Minus } from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { priceFlash } from "@/lib/data";
import { useLanguage } from "@/lib/language-context";

export function PriceTicker() {
  const { t } = useLanguage();
  const { role } = useAuth();
  const isFarmer = role === "farmer";
  const items = [...priceFlash, ...priceFlash];

  return (
    <div className="overflow-hidden border-y border-border bg-card py-3">
      <div className="flex w-max animate-ticker gap-8 whitespace-nowrap">
        {items.map((p, i) => {
          const Icon = p.delta > 0 ? TrendingUp : p.delta < 0 ? TrendingDown : Minus;
          const color =
            p.delta === 0
              ? "text-muted-foreground"
              : isFarmer
                ? p.delta > 0
                  ? "text-fresh"
                  : "text-destructive"
                : p.delta > 0
                  ? "text-destructive"
                  : "text-fresh";

          return (
            <div key={i} className="flex items-center gap-2 text-sm font-semibold">
              <span>{p.name}</span>
              <Icon className={`h-4 w-4 ${color}`} />
              <span className={color}>
                {p.delta > 0 ? "+" : ""}
                ₹{p.delta} {t.priceDeltaToday}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
