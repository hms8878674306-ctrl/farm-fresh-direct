import { createFileRoute, Link } from "@tanstack/react-router";
import { farmers, products } from "@/lib/data";
import { Star, MapPin, MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export const Route = createFileRoute("/farmers")({
  head: () => ({ meta: [{ title: "Our Farmers — KrishiDirect" }, { name: "description", content: "Meet the verified farmers behind your fresh produce." }] }),
  component: FarmersPage,
});

function FarmersPage() {
  const { t } = useLanguage();

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-8 py-10">
      <div className="mb-10">
        <h1 className="display text-4xl md:text-5xl font-extrabold">{t.ourFarmersTitle}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">{t.farmersPageCopy}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {farmers.map(f => {
          const items = products.filter(p => p.farmerId === f.id);
          const farmerName = t[`farmer${f.id.toUpperCase()}`] || f.name;
          return (
            <div key={f.id} className="rounded-3xl bg-card border border-border overflow-hidden shadow-card hover-lift">
              <div className="grid grid-cols-[140px_1fr] gap-4 p-5">
                <img src={f.photo} alt={farmerName} className="h-32 w-32 rounded-2xl object-cover" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xl">{farmerName}</h3>
                    {f.verified && <span className="text-[10px] font-bold uppercase bg-fresh text-fresh-foreground px-2 py-0.5 rounded-full">✓ {t.verifiedBadge}</span>}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1"><MapPin className="h-3.5 w-3.5" /> {f.location}</div>
                  <div className="flex items-center gap-1 mt-1"><Star className="h-4 w-4 fill-harvest text-harvest" /><span className="font-bold">{f.rating}</span></div>
                  <p className="mt-2 text-sm">{t.grows}: <span className="font-semibold">{f.specialty}</span></p>
                  <Link to="/chat" search={{ farmerId: f.id } as never} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                    <MessageCircle className="h-3.5 w-3.5" /> {t.chatToNegotiate}
                  </Link>
                </div>
              </div>
              <div className="border-t border-border p-4 flex gap-2 overflow-x-auto">
                {items.map(p => {
                  const productName = t[`product${p.id.toUpperCase()}`] || p.name;
                  return (
                    <div key={p.id} className="flex-shrink-0 w-20 text-center">
                      <img src={p.image} alt={productName} className="h-16 w-20 rounded-lg object-cover" />
                      <div className="text-[10px] mt-1 truncate">{productName}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
