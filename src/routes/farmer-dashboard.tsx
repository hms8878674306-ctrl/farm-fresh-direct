import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { IndianRupee, Heart, Package, Plus, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { FarmerVoiceListing } from "@/components/FarmerVoiceListing";
import { PricePredictionPanel } from "@/components/PricePredictionPanel";
import { PriceTicker } from "@/components/PriceTicker";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { useLanguage } from "@/lib/language-context";
import { products as sampleProducts } from "@/lib/data";

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
    meta: [{ title: "Farmer Dashboard - KrishiDirect" }],
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
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editImage, setEditImage] = useState("");

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
      snap.forEach((d) => {
        arr.push({ id: d.id, ...(d.data() as Omit<FarmerProduct, "id">) });
      });
      setProducts(arr);
    });
    return () => unsub();
  }, []);

  const addProduct = async () => {
    if (!name || !price || !stock) {
      alert(t.fillAllFields);
      return;
    }

    try {
      setSaving(true);
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
      setSaving(false);
    }
  };

  const beginEdit = (p: FarmerProduct) => {
    setEditingId(p.id);
    setEditName(p.name || "");
    setEditPrice(String(p.price ?? ""));
    setEditStock(String(p.stock ?? ""));
    setEditImage(p.image || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditPrice("");
    setEditStock("");
    setEditImage("");
  };

  const saveEdit = async () => {
    if (!editingId || !editName || !editPrice || !editStock) {
      alert(t.fillAllFields);
      return;
    }

    try {
      setSaving(true);
      await updateDoc(doc(db, "products", editingId), {
        name: editName,
        price: Number(editPrice),
        stock: editStock,
        image: editImage || sampleProducts[0].image,
        updatedAt: serverTimestamp(),
      });
      cancelEdit();
    } catch (e) {
      console.error(e);
      alert(t.failedPublishListing);
    } finally {
      setSaving(false);
    }
  };

  const bars = [40, 65, 50, 80, 70, 95, 88];

  return (
    <>
      <PriceTicker />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-8 md:py-10">
        <div className="mb-8 space-y-2">
          <h1 className="display text-3xl font-extrabold sm:text-4xl">{t.farmerDashboardTitle}</h1>
          <p className="text-muted-foreground">{t.farmerDashboardCopy}</p>
          <p className="text-sm font-bold text-primary">{t.tollFree}</p>
        </div>

        <div className="mb-6">
          <PricePredictionPanel />
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat Icon={IndianRupee} label={t.thisWeek} value="₹12,480" accent="bg-primary" />
          <Stat Icon={Package} label={t.pendingOrders} value="7" accent="gradient-harvest" />
          <Stat Icon={TrendingUp} label={t.topProduct} value="Tomato" accent="gradient-fresh" />
          <Stat Icon={Heart} label={t.followers} value="142" accent="bg-harvest" />
        </div>

        <section
          ref={listingsRef}
          id="listings"
          className="mb-6 scroll-mt-24 rounded-3xl border border-border bg-card p-4 sm:p-6"
        >
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="display text-2xl font-bold">{t.productListings}</h2>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-glow"
            >
              <Plus className="h-4 w-4" />
              {showForm ? t.closeForm : t.addProduct}
            </button>
          </div>

          {showForm && (
            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <FarmerVoiceListing onParsed={fillFromVoice} />
              </div>
              <input
                placeholder={t.productName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl border px-4"
              />
              <input
                placeholder={t.price}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-11 rounded-xl border px-4"
              />
              <input
                placeholder={t.stock}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="h-11 rounded-xl border px-4"
              />
              <input
                placeholder={t.imageUrl}
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="h-11 rounded-xl border px-4"
              />
              <button
                onClick={addProduct}
                disabled={saving}
                className="h-11 rounded-xl bg-primary font-bold text-primary-foreground"
              >
                {saving ? t.adding : t.saveProduct}
              </button>
            </div>
          )}

          <div className="flex h-48 items-end gap-3 overflow-x-auto">
            {bars.map((h, i) => (
              <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-xl gradient-fresh transition-all hover:opacity-80"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {["M", "T", "W", "T", "F", "S", "S"][i]}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-4 sm:p-6">
          <h2 className="display mb-4 text-2xl font-bold">{t.myProducts}</h2>

          <div className="grid gap-3">
            {products.map((p) => {
              const editing = editingId === p.id;

              return (
                <div key={p.id} className="rounded-2xl p-3 hover:bg-secondary/40">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <img
                      src={p.image || sampleProducts[0].image}
                      alt={p.name || t.productName}
                      className="h-14 w-14 rounded-xl object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="break-words font-semibold">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.stock}: {p.stock} kg
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                      <div className="font-bold text-primary">₹{p.price}</div>
                      <button
                        onClick={() => beginEdit(p)}
                        className="h-9 rounded-full border border-border px-4 text-xs font-bold hover:bg-muted"
                      >
                        Update
                      </button>
                    </div>
                  </div>

                  {editing && (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder={t.productName}
                        className="h-10 rounded-xl border px-3"
                      />
                      <input
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        placeholder={t.price}
                        className="h-10 rounded-xl border px-3"
                      />
                      <input
                        value={editStock}
                        onChange={(e) => setEditStock(e.target.value)}
                        placeholder={t.stock}
                        className="h-10 rounded-xl border px-3"
                      />
                      <input
                        value={editImage}
                        onChange={(e) => setEditImage(e.target.value)}
                        placeholder={t.imageUrl}
                        className="h-10 rounded-xl border px-3"
                      />
                      <div className="flex gap-2 sm:col-span-2">
                        <button
                          onClick={saveEdit}
                          disabled={saving}
                          className="h-10 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground"
                        >
                          {saving ? t.saving : "Save update"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="h-10 rounded-xl border border-border px-4 text-xs font-bold hover:bg-muted"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </>
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
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>
      <div className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="display mt-1 text-3xl font-extrabold">{value}</div>
    </div>
  );
}
