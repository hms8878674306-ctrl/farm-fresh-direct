import { createFileRoute, Link } from "@tanstack/react-router";
import heroFarm from "@/assets/hero-farm.jpg";
import { products, farmers, seasonalTheme } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { PriceTicker } from "@/components/PriceTicker";
import { FarmerVoiceListing } from "@/components/FarmerVoiceListing";
import {
  AlertTriangle,
  BarChart3,
  CalendarCheck,
  ClipboardCheck,
  MessageCircle,
  PackagePlus,
  ShieldCheck,
  Sprout,
  Truck,
  Zap,
  ArrowRight,
  Star,
  MapPin,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type FarmerProductSummary = {
  id: string;
  price?: number | string;
  stock?: number | string;
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KrishiDirect — Freshness Direct From Farm" },
      {
        name: "description",
        content:
          "Fresh fruits & vegetables straight from farmers near you. Cash on delivery, same-day shipping.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [scrollY, setScrollY] = useState(0);
  const { role } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (role === "farmer") {
    return <FarmerHome />;
  }

  return (
    <main>
      {/* HERO with parallax */}
      <section className="relative h-[88vh] min-h-[560px] overflow-hidden">
        <div className="absolute inset-0" style={{ transform: `translateY(${scrollY * 0.4}px)` }}>
          <img
            src={heroFarm}
            alt="Farmer holding fresh tomatoes at sunrise"
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 gradient-hero" />
        </div>

        {/* Floating produce */}
        <div className="absolute inset-0 pointer-events-none text-7xl">
          <span className="absolute top-[15%] left-[8%] animate-float-up">🍅</span>
          <span className="absolute top-[25%] right-[12%] animate-float-side text-6xl">🥭</span>
          <span
            className="absolute bottom-[28%] left-[14%] animate-float-side text-5xl"
            style={{ animationDelay: "0.6s" }}
          >
            🌶️
          </span>
          <span
            className="absolute bottom-[18%] right-[10%] animate-float-up text-6xl"
            style={{ animationDelay: "1.1s" }}
          >
            🥬
          </span>
        </div>

        <div className="relative z-10 flex h-full items-center px-4 md:px-8">
          <div className="mx-auto max-w-7xl w-full">
            <div className="max-w-2xl text-primary-foreground">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
                <Sprout className="h-3.5 w-3.5" /> {seasonalTheme.emoji} {t.heroEyebrow}
              </span>
              <h1 className="display mt-5 text-5xl md:text-7xl font-extrabold leading-[1.05]">
                {t.heroTitleA}
                <br />
                <span className="shimmer-text">{t.heroTitleB}</span>
              </h1>
              <p className="mt-5 text-lg md:text-xl text-white/85 max-w-xl">{t.heroCopy}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/shop"
                  search={{ q: "" }}
                  className="inline-flex items-center gap-2 rounded-full bg-harvest text-harvest-foreground px-6 py-3 font-bold shadow-glow hover:scale-105 transition"
                >
                  {t.shop} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/farmers"
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur text-white px-6 py-3 font-semibold hover:bg-white/25 transition"
                >
                  {t.farmers}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PriceTicker />

      {/* TRUST BADGES */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { Icon: ShieldCheck, label: t.trustVerified },
          { Icon: Sprout, label: t.trustMiddleman },
          { Icon: Zap, label: t.trustPayment },
          { Icon: Truck, label: t.trustDelivery },
        ].map(({ Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-2xl bg-card border border-border p-4 hover-lift"
          >
            <div className="h-11 w-11 rounded-xl gradient-fresh flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="font-semibold text-sm">{label}</div>
          </div>
        ))}
      </section>

      {/* AI RECOMMENDATIONS */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-harvest font-bold">
              {t.aiPicks}
            </span>
            <h2 className="display text-4xl font-extrabold mt-1">{t.inSeason}</h2>
            <p className="text-muted-foreground mt-1 text-sm">{t.inSeasonCopy}</p>
          </div>
          <Link
            to="/shop"
            search={{ q: "" }}
            className="hidden sm:inline-flex text-sm font-semibold text-primary hover:underline"
          >
            {t.viewAll}
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* FARMER STORIES */}
      <section className="bg-secondary/40 py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-widest text-harvest font-bold">
              {t.farmerStories}
            </span>
            <h2 className="display text-4xl font-extrabold mt-1">{t.meetFarmers}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {farmers.map((f) => (
              <div
                key={f.id}
                className="rounded-3xl bg-card border border-border overflow-hidden hover-lift shadow-card"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={f.photo}
                    alt={f.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">{f.name}</h3>
                    {f.verified && (
                      <span className="text-[10px] font-bold uppercase bg-fresh text-fresh-foreground px-2 py-0.5 rounded-full">
                        {t.verified}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3.5 w-3.5" /> {f.location}
                  </div>
                  <p className="mt-3 text-sm">
                    {t.specialty}: <span className="font-semibold">{f.specialty}</span>
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-harvest text-harvest" />
                    <span className="font-bold">{f.rating}</span>
                    <span className="text-muted-foreground">/ 5.0</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function FarmerHome() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [farmProducts, setFarmProducts] = useState<FarmerProductSummary[]>([]);
  const [chatCount, setChatCount] = useState(0);
  const [draftName, setDraftName] = useState("");
  const [draftPrice, setDraftPrice] = useState("");
  const [draftStock, setDraftStock] = useState("");
  const [saving, setSaving] = useState(false);
  const [checkedTasks, setCheckedTasks] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("krishi-farmer-tasks");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setFarmProducts(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FarmerProductSummary, "id">) })),
        );
      },
      () => setFarmProducts([]),
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "chats"), orderBy("updatedAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => setChatCount(snap.size),
      () => setChatCount(0),
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("krishi-farmer-tasks", JSON.stringify(checkedTasks));
    }
  }, [checkedTasks]);

  const toggleTask = (task: string) => {
    setCheckedTasks((current) =>
      current.includes(task) ? current.filter((item) => item !== task) : [...current, task],
    );
  };

  const fillFromVoice = useCallback((values: { name?: string; price?: string; stock?: string }) => {
    if (values.name) setDraftName(values.name);
    if (values.price) setDraftPrice(values.price);
    if (values.stock) setDraftStock(values.stock);
  }, []);

  const quickAddProduct = async () => {
    if (!draftName || !draftPrice || !draftStock) {
      alert(t.fillAllFields);
      return;
    }

    try {
      setSaving(true);
      await addDoc(collection(db, "products"), {
        name: draftName,
        price: Number(draftPrice),
        stock: draftStock,
        image: products[0].image,
        unit: "kg",
        farmerId: "f1",
        ownerId: user?.uid || null,
        createdAt: serverTimestamp(),
      });

      setDraftName("");
      setDraftPrice("");
      setDraftStock("");
    } catch (error) {
      console.error(error);
      alert(t.failedPublishListing);
    } finally {
      setSaving(false);
    }
  };

  const listedValue = farmProducts.reduce((sum, item) => {
    const stock = Number.parseFloat(String(item.stock || 0));
    return sum + Number(item.price || 0) * (Number.isFinite(stock) ? stock : 0);
  }, 0);
  const lowStock = farmProducts.filter(
    (item) => Number.parseFloat(String(item.stock || 0)) <= 10,
  ).length;
  const tasks = [t.taskOffers, t.taskStock, t.taskPack, t.taskPickup];

  return (
    <main className="bg-background">
      <section className="relative overflow-hidden bg-foreground text-background">
        <div className="mx-auto grid min-h-[520px] max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-[1fr_1fr] md:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80">
              <Sprout className="h-3.5 w-3.5" /> {t.farmerMode}
            </span>
            <h1 className="display mt-5 max-w-3xl text-5xl font-extrabold leading-[1.05] text-white md:text-6xl">
              {t.farmerHeroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/75">{t.farmerHeroCopy}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/farmer-dashboard"
                search={{ section: "listings", add: true }}
                className="inline-flex items-center gap-2 rounded-full bg-harvest px-6 py-3 font-bold text-harvest-foreground shadow-glow transition hover:scale-105"
              >
                {t.addListing} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/chat"
                search={{ farmerId: "f1" }}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20"
              >
                {t.buyerOffers}
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-white/60">
                  {t.quickListing}
                </div>
                <h2 className="text-2xl font-extrabold text-white">{t.addCropFast}</h2>
              </div>
              <PackagePlus className="h-6 w-6 text-harvest" />
            </div>
            <div className="grid gap-3">
              <FarmerVoiceListing
                onParsed={fillFromVoice}
                className="border-white/15 bg-white/10 text-white [&_p]:text-white/70 [&_.text-muted-foreground]:text-white/65"
              />
              <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder={t.cropName}
                className="h-11 rounded-xl border border-white/15 bg-white px-4 text-sm text-foreground outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={draftPrice}
                  onChange={(e) => setDraftPrice(e.target.value)}
                  type="number"
                  placeholder={t.pricePerKg}
                  className="h-11 rounded-xl border border-white/15 bg-white px-4 text-sm text-foreground outline-none"
                />
                <input
                  value={draftStock}
                  onChange={(e) => setDraftStock(e.target.value)}
                  placeholder={t.stockKg}
                  className="h-11 rounded-xl border border-white/15 bg-white px-4 text-sm text-foreground outline-none"
                />
              </div>
              <button
                onClick={quickAddProduct}
                disabled={saving}
                className="h-11 rounded-xl bg-harvest text-sm font-bold text-harvest-foreground transition hover:scale-[1.01] disabled:opacity-60"
              >
                {saving ? t.saving : t.publishListing}
              </button>
              <p className="text-xs text-white/55">{t.fullListingHint}</p>
              <p className="text-xs font-bold text-harvest">{t.tollFree}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 md:grid-cols-4 md:px-8">
        {[
          { Icon: PackagePlus, label: t.activeListings, value: String(farmProducts.length) },
          { Icon: MessageCircle, label: t.buyerChats, value: String(chatCount) },
          { Icon: AlertTriangle, label: t.lowStock, value: String(lowStock) },
          { Icon: BarChart3, label: t.listedValue, value: `Rs ${Math.round(listedValue)}` },
        ].map(({ Icon, label, value }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-fresh">
              <Icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="mt-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {label}
            </div>
            <div className="mt-1 text-3xl font-extrabold">{value}</div>
          </div>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[1.1fr_0.9fr] md:px-8">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-harvest">
                {t.today}
              </span>
              <h2 className="display text-3xl font-extrabold">{t.workChecklist}</h2>
            </div>
            <CalendarCheck className="h-6 w-6 text-primary" />
          </div>
          <div className="grid gap-3">
            {tasks.map((task) => (
              <label
                key={task}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border p-3 hover:bg-secondary/50"
              >
                <input
                  type="checkbox"
                  checked={checkedTasks.includes(task)}
                  onChange={() => toggleTask(task)}
                  className="h-4 w-4 accent-primary"
                />
                <span
                  className={`text-sm font-semibold ${checkedTasks.includes(task) ? "text-muted-foreground line-through" : ""}`}
                >
                  {task}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-harvest">
                {t.demand}
              </span>
              <h2 className="display text-3xl font-extrabold">{t.marketSignals}</h2>
            </div>
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-3">
            {products.slice(0, 4).map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-2xl bg-secondary/50 p-3"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-12 w-12 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {index === 0
                      ? t.buyerInterestHigh
                      : index === 1
                        ? t.buyerInterestRising
                        : t.buyerInterestSteady}
                  </div>
                </div>
                <div className="text-right text-sm font-extrabold text-primary">
                  Rs {item.price}/kg
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-3 md:px-8">
        {[
          {
            Icon: PackagePlus,
            title: t.manageListings,
            body: t.manageListingsCopy,
            to: "/farmer-dashboard" as const,
            search: { section: "listings", add: true },
          },
          {
            Icon: ClipboardCheck,
            title: t.prepareOrders,
            body: t.prepareOrdersCopy,
            to: "/track" as const,
            search: undefined,
          },
          {
            Icon: Users,
            title: t.negotiateOffers,
            body: t.negotiateOffersCopy,
            to: "/chat" as const,
            search: { farmerId: "f1" },
          },
        ].map(({ Icon, title, body, to, search }) => (
          <Link
            key={title}
            to={to}
            search={search as never}
            className="rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:shadow-glow"
          >
            <Icon className="h-6 w-6 text-primary" />
            <h2 className="mt-4 text-xl font-bold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          </Link>
        ))}
      </section>

    </main>
  );
}
