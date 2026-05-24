import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { products as sampleProducts } from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { FarmerVoiceListing } from "@/components/FarmerVoiceListing";
import { PricePredictionPanel } from "@/components/PricePredictionPanel";

import { TrendingUp, Package, Heart, Plus, IndianRupee } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type FarmerProduct = {
  id: string;
  name?: string;
  price?: number;
  stock?: string | number;
  image?: string;
};

export const Route = createFileRoute("/farmer-dashboard")({
  validateSearch: (s: Record<string, unknown>): { section?: string; add?: boolean } => ({
    section: (s.section as string) || undefined,
    add: s.add === true || s.add === "true",
  }),
  head: () => ({
    meta: [{ title: "Farmer Dashboard — KrishiDirect" }],
  }),
  component: FarmerDashboard,
});

function FarmerDashboard() {
  const search = Route.useSearch();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [products, setProducts] = useState<FarmerProduct[]>([]);
  const listingsRef = useRef<HTMLElement>(null);

  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");

  const [loading, setLoading] = useState(false);

  const fillFromVoice = useCallback((values: { name?: string; price?: string; stock?: string }) => {
    if (values.name) setName(values.name);
    if (values.price) setPrice(values.price);
    if (values.stock) setStock(values.stock);
    setShowForm(true);
  }, []);

  useEffect(() => {
    if (search.section !== "listings") return;

    setShowForm(Boolean(search.add));
    requestAnimationFrame(() => {
      listingsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [search.section, search.add]);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const arr: FarmerProduct[] = [];

      snap.forEach((doc) => {
        arr.push({
          id: doc.id,
          ...(doc.data() as Omit<FarmerProduct, "id">),
        });
      });

      setProducts(arr);
    });

    return () => unsub();
  }, []);

  const addProduct = async () => {
    if (!name || !price || !stock) {
      return alert(t.fillAllFields);
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "products"), {
        name,
        price: Number(price),
        stock,
        image: image || sampleProducts[0].image,
        unit: "kg",
        farmerId: "f1",
        ownerId: user?.uid || null,
        createdAt: serverTimestamp(),
      });

      setName("");
      setPrice("");
      setStock("");
      setImage("");

      setShowForm(false);
    } catch (e) {
      console.error(e);
      alert(t.failedAddProduct);
    } finally {
      setLoading(false);
    }
  };

  const bars = [40, 65, 50, 80, 70, 95, 88];

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-8 py-10">
      <div className="mb-8">
        <h1 className="display text-4xl font-extrabold">{t.farmerDashboardTitle}</h1>

        <p className="text-muted-foreground mt-2">{t.farmerDashboardCopy}</p>
        <p className="mt-2 text-sm font-bold text-primary">{t.tollFree}</p>
      </div>

      <div className="mb-6">
        <PricePredictionPanel />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat Icon={IndianRupee} label={t.thisWeek} value="₹12,480" accent="bg-primary" />

        <Stat Icon={Package} label={t.pendingOrders} value="7" accent="gradient-harvest" />

        <Stat Icon={TrendingUp} label={t.topProduct} value="Tomato" accent="gradient-fresh" />

        <Stat Icon={Heart} label={t.followers} value="142" accent="bg-harvest" />
      </div>

      <section
        ref={listingsRef}
        id="listings"
        className="rounded-3xl bg-card border border-border p-6 mb-6 scroll-mt-24"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="display text-2xl font-bold">{t.productListings}</h2>

          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary-glow"
          >
            <Plus className="h-4 w-4" />
            {showForm ? t.closeForm : t.addProduct}
          </button>
        </div>

        {showForm && (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="md:col-span-2">
              <FarmerVoiceListing onParsed={fillFromVoice} />
            </div>
            <input
              placeholder={t.productName}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 px-4 rounded-xl border"
            />

            <input
              placeholder={t.price}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-11 px-4 rounded-xl border"
            />

            <input
              placeholder={t.stock}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="h-11 px-4 rounded-xl border"
            />

            <input
              placeholder={t.imageUrl}
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="h-11 px-4 rounded-xl border"
            />

            <button
              onClick={addProduct}
              disabled={loading}
              className="h-11 rounded-xl bg-primary text-primary-foreground font-bold"
            >
              {loading ? t.adding : t.saveProduct}
            </button>
          </div>
        )}

        <div className="flex items-end gap-3 h-48">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full rounded-t-xl gradient-fresh transition-all hover:opacity-80"
                style={{ height: `${h}%` }}
              />

              <span className="text-[10px] text-muted-foreground font-semibold">
                {["M", "T", "W", "T", "F", "S", "S"][i]}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-card border border-border p-6">
        <h2 className="display text-2xl font-bold mb-4">{t.myProducts}</h2>

        <div className="grid gap-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-4 p-3 rounded-2xl hover:bg-secondary/40"
            >
              <img
                src={p.image || sampleProducts[0].image}
                alt={p.name || t.productName}
                className="h-14 w-14 rounded-xl object-cover"
              />

              <div className="flex-1">
                <div className="font-semibold">{p.name}</div>

                <div className="text-xs text-muted-foreground">
                  {t.stock}: {p.stock} kg
                </div>
              </div>

              <div className="font-bold text-primary">₹{p.price}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Stat({
  Icon,
  label,
  value,
  accent,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 hover-lift">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>

      <div className="mt-3 text-xs text-muted-foreground uppercase tracking-wider">{label}</div>

      <div className="text-3xl font-extrabold display mt-1">{value}</div>
    </div>
  );
}
