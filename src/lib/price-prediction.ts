import { products, priceFlash } from "@/lib/data";

export type PriceForecast = {
  productId: string;
  name: string;
  currentPrice: number;
  predictedPrice: number;
  changePct: number;
  trend: "up" | "down" | "steady";
  confidence: number;
  tip: string;
};

/** Lightweight demand/season forecast (demo ML-style signals from market data). */
export function forecastPrices(): PriceForecast[] {
  const month = new Date().getMonth();

  return products.map((p) => {
    const flash = priceFlash.find((f) => f.name === p.name);
    const momentum = flash?.delta ?? 0;
    const seasonal =
      p.category === "fruit" && month >= 2 && month <= 5
        ? 0.06
        : p.category === "leafy" && month >= 6 && month <= 9
          ? 0.04
          : -0.01;

    const predicted = Math.max(1, Math.round(p.price * (1 + momentum / 100 + seasonal)));
    const changePct = +(((predicted - p.price) / p.price) * 100).toFixed(1);
    const trend = changePct > 1.5 ? "up" : changePct < -1.5 ? "down" : "steady";

    let tip = "Hold price steady — demand looks balanced.";
    if (trend === "up") tip = "Demand rising — consider a small price increase tomorrow.";
    if (trend === "down") tip = "Prices softening — sell today or offer a bundle deal.";

    return {
      productId: p.id,
      name: p.name,
      currentPrice: p.price,
      predictedPrice: predicted,
      changePct,
      trend,
      confidence: 72 + Math.min(20, Math.abs(momentum) * 2),
      tip,
    };
  });
}

export function forecastForProduct(productId: string): PriceForecast | undefined {
  return forecastPrices().find((f) => f.productId === productId);
}
