import { createFileRoute } from "@tanstack/react-router";
import { products } from "@/lib/data";
import { useLanguage } from "@/lib/language-context";
import {
  Package,
  Heart,
  RotateCcw,
  IndianRupee,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Consumer Dashboard — KrishiDirect" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { t } = useLanguage();
  return (
    <main className="mx-auto max-w-7xl px-4 md:px-8 py-10">
      <div className="mb-8">
        <h1 className="display text-4xl font-extrabold">
          {t.consumerDashboardTitle}
        </h1>

        <p className="text-muted-foreground mt-2">
          {t.consumerDashboardWelcome}
        </p>
      </div>

      <ConsumerView />
    </main>
  );
}

function Stat({
  Icon,
  label,
  value,
  accent,
}: {
  Icon: any;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 hover-lift">
      <div
        className={`h-11 w-11 rounded-xl flex items-center justify-center ${accent}`}
      >
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>

      <div className="mt-3 text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </div>

      <div className="text-3xl font-extrabold display mt-1">
        {value}
      </div>
    </div>
  );
}

function ConsumerView() {
  const { t } = useLanguage();
  const favs = products.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          Icon={Package}
          label={t.statOrders}
          value="12"
          accent="bg-primary"
        />

        <Stat
          Icon={Heart}
          label={t.statFavorites}
          value="8"
          accent="gradient-harvest"
        />

        <Stat
          Icon={RotateCcw}
          label={t.statReorders}
          value="5"
          accent="gradient-fresh"
        />

        <Stat
          Icon={IndianRupee}
          label={t.statSaved}
          value="₹420"
          accent="bg-harvest"
        />
      </div>

      <section className="rounded-3xl bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="display text-2xl font-bold">
            {t.reorderFavourites}
          </h2>

          <span className="text-xs text-muted-foreground">
            {t.oneTapReorder}
          </span>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {favs.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/50 hover-lift"
            >
              <img
                src={p.image}
                alt={p.name}
                className="h-16 w-16 rounded-xl object-cover"
              />

              <div className="flex-1">
                <div className="font-semibold text-sm">
                  {p.name}
                </div>

                <div className="text-xs text-muted-foreground">
                  ₹{p.price}/{p.unit}
                </div>
              </div>

              <button className="h-10 w-10 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center hover:bg-primary-glow">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl gradient-fresh p-6 text-primary-foreground">
        <div className="text-xs uppercase tracking-widest opacity-90">
          {t.subscriptionEyebrow}
        </div>

        <h2 className="display text-3xl font-extrabold mt-1">
          {t.weeklyVeggieBox}
        </h2>

        <p className="opacity-90 text-sm mt-2 max-w-md">
          {t.weeklyVeggieBoxCopy}
        </p>

        <button className="mt-4 px-5 py-2.5 rounded-full bg-white text-primary font-bold text-sm">
          {t.subscribeBtn}
        </button>
      </section>
    </div>
  );
}