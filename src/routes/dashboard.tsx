import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { products, farmers } from "@/lib/data";
import { TrendingUp, Package, Heart, RotateCcw, Plus, IndianRupee } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — KrishiDirect" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [view, setView] = useState<"farmer" | "consumer">("consumer");

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-8 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="display text-4xl font-extrabold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Switch between consumer and farmer view</p>
        </div>
        <div className="inline-flex p-1 rounded-full bg-secondary">
          {(["consumer", "farmer"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-5 h-10 rounded-full text-sm font-bold capitalize transition ${view === v ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground"}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "consumer" ? <ConsumerView /> : <FarmerView />}
    </main>
  );
}

function Stat({ Icon, label, value, accent }: { Icon: any; label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 hover-lift">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${accent}`}><Icon className="h-5 w-5 text-primary-foreground" /></div>
      <div className="mt-3 text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-3xl font-extrabold display mt-1">{value}</div>
    </div>
  );
}

function ConsumerView() {
  const favs = products.slice(0, 3);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat Icon={Package} label="Orders" value="12" accent="bg-primary" />
        <Stat Icon={Heart} label="Favorites" value="8" accent="gradient-harvest" />
        <Stat Icon={RotateCcw} label="Reorders" value="5" accent="gradient-fresh" />
        <Stat Icon={IndianRupee} label="Saved" value="₹420" accent="bg-harvest" />
      </div>

      <section className="rounded-3xl bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="display text-2xl font-bold">Reorder favourites</h2>
          <span className="text-xs text-muted-foreground">One-tap reorder</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {favs.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/50 hover-lift">
              <img src={p.image} alt={p.name} className="h-16 w-16 rounded-xl object-cover" />
              <div className="flex-1">
                <div className="font-semibold text-sm">{p.name}</div>
                <div className="text-xs text-muted-foreground">₹{p.price}/{p.unit}</div>
              </div>
              <button className="h-10 w-10 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center hover:bg-primary-glow"><RotateCcw className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl gradient-fresh p-6 text-primary-foreground">
        <div className="text-xs uppercase tracking-widest opacity-90">Subscription Basket</div>
        <h2 className="display text-3xl font-extrabold mt-1">Weekly Veggie Box</h2>
        <p className="opacity-90 text-sm mt-2 max-w-md">Get 7 farm-fresh veggies delivered every Monday. Pause or cancel anytime.</p>
        <button className="mt-4 px-5 py-2.5 rounded-full bg-white text-primary font-bold text-sm">Subscribe — ₹399/week</button>
      </section>
    </div>
  );
}

function FarmerView() {
  const farmer = farmers[0];
  const myProducts = products.filter(p => p.farmerId === farmer.id);
  const bars = [40, 65, 50, 80, 70, 95, 88];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat Icon={IndianRupee} label="This week" value="₹12,480" accent="bg-primary" />
        <Stat Icon={Package} label="Pending orders" value="7" accent="gradient-harvest" />
        <Stat Icon={TrendingUp} label="Top product" value="Tomato" accent="gradient-fresh" />
        <Stat Icon={Heart} label="Followers" value="142" accent="bg-harvest" />
      </div>

      <section className="rounded-3xl bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="display text-2xl font-bold">Earnings — last 7 days</h2>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary-glow"><Plus className="h-4 w-4" /> Add product</button>
        </div>
        <div className="flex items-end gap-3 h-48">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full rounded-t-xl gradient-fresh transition-all hover:opacity-80" style={{ height: `${h}%` }} />
              <span className="text-[10px] text-muted-foreground font-semibold">{["M","T","W","T","F","S","S"][i]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-card border border-border p-6">
        <h2 className="display text-2xl font-bold mb-4">My products</h2>
        <div className="grid gap-3">
          {myProducts.map(p => (
            <div key={p.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-secondary/40">
              <img src={p.image} alt={p.name} className="h-14 w-14 rounded-xl object-cover" />
              <div className="flex-1">
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">Stock: {p.stock} {p.unit}</div>
              </div>
              <div className="font-bold text-primary">₹{p.price}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
