import { createFileRoute } from "@tanstack/react-router";
import { products } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { useState } from "react";
import { Search } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => ({ q: (s.q as string) || "" }),
  head: () => ({ meta: [{ title: "Shop Fresh — KrishiDirect" }, { name: "description", content: "Browse fresh vegetables and fruits from local farmers." }] }),
  component: Shop,
});

const CAT_KEYS: Record<string, string> = {
  all: "catAll",
  vegetable: "catVegetable",
  fruit: "catFruit",
  leafy: "catLeafy",
};

function Shop() {
  const { q } = Route.useSearch();
  const { t } = useLanguage();
  const [query, setQuery] = useState(q || "");
  const [cat, setCat] = useState<string>("all");

  const filtered = products.filter(p =>
    (cat === "all" || p.category === cat) &&
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-8 py-10">
      <div className="mb-8">
        <h1 className="display text-4xl md:text-5xl font-extrabold">{t.shopTitle}</h1>
        <p className="text-muted-foreground mt-2">{t.shopCopy}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t.shopSearchPlaceholder}
            className="w-full h-12 pl-11 pr-4 rounded-full bg-card border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {["all", "vegetable", "fruit", "leafy"].map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-4 h-12 rounded-full text-sm font-semibold whitespace-nowrap transition ${cat === c ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:bg-muted"}`}>
              {t[CAT_KEYS[c]]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(p => <ProductCard key={p.id} product={p} />)}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <div className="text-6xl mb-4">🌾</div>
          <p>{t.noProduceFound}</p>
        </div>
      )}
    </main>
  );
}
