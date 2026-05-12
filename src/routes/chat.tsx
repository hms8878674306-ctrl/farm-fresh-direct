import { createFileRoute, Link } from "@tanstack/react-router";
import { farmers, farmerById, products } from "@/lib/data";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Handshake, Check, X, Sparkles, Send } from "lucide-react";
import { deals } from "@/lib/deals-store";
import { cart } from "@/lib/cart-store";

export const Route = createFileRoute("/chat")({
  validateSearch: (s: Record<string, unknown>): { farmerId?: string; productId?: string; qty?: number } => ({
    farmerId: (s.farmerId as string) || "f1",
    productId: (s.productId as string) || undefined,
    qty: Number(s.qty) || undefined,
  }),
  head: () => ({ meta: [{ title: "Negotiate with Farmer — KrishiDirect" }] }),
  component: Chat,
});

type MsgKind = "text" | "offer" | "counter" | "accept" | "reject" | "deal";
type Msg = {
  id: string;
  from: "me" | "farmer";
  kind: MsgKind;
  text: string;
  price?: number;     // for offer / counter / deal
  qty?: number;
  unit?: string;
  productName?: string;
  time: string;
};

const PRESET_USER = [
  "Is this harvested today?",
  "Can you deliver tomorrow morning?",
  "Is it organic certified?",
];

const PRESET_FARMER: Record<string, string> = {
  "Is this harvested today?": "Yes, picked this morning at 6am from my farm 🌅",
  "Can you deliver tomorrow morning?": "Sure, I will pack tonight and rider will reach by 9am ✅",
  "Is it organic certified?": "Yes, certified by APEDA. Zero pesticides 🌱",
};

function fmtTime(d: Date) { return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }

/** Farmer's negotiation policy:
 *  - basePrice = listed product price
 *  - floor = 85% of base (won't go lower)
 *  - if buyer offers >= floor and qty >= 5  → ACCEPT
 *  - else counter-offer halfway between buyer offer and floor (clamped to >= floor)
 *  - if buyer offers < 60% of base → REJECT politely
 */
function farmerDecide(basePrice: number, offerPrice: number, qty: number) {
  const floor = Math.round(basePrice * 0.85);
  const hardFloor = Math.round(basePrice * 0.6);
  if (offerPrice < hardFloor) {
    return { decision: "reject" as const, price: floor, reason: `Sorry, I can't go below ₹${floor}/unit — that's my cost 🙏` };
  }
  if (offerPrice >= floor && qty >= 5) {
    return { decision: "accept" as const, price: offerPrice, reason: `Done! ₹${offerPrice} for ${qty} units. Deal sealed 🤝` };
  }
  if (offerPrice >= floor) {
    return { decision: "counter" as const, price: offerPrice, reason: `For just ${qty} units I can do ₹${offerPrice}, but order 5+ and it's confirmed ✨` };
  }
  const mid = Math.max(floor, Math.round((offerPrice + basePrice) / 2));
  return { decision: "counter" as const, price: mid, reason: `Best I can do is ₹${mid}/unit. Quality is premium 🌿` };
}

function Chat() {
  const { farmerId, productId, qty } = Route.useSearch();
  const { user, role } = useAuth();
  const farmer = farmerById(farmerId || "f1") || farmers[0];

  const product = useMemo(
    () => products.find(p => p.id === productId) || products.find(p => p.farmerId === farmer.id) || products[0],
    [farmer.id, productId]
  );

  if (role === "farmer") {
    return <FarmerChat farmerId={farmer.id} farmer={farmer} fallbackProduct={product} />;
  }

  return <ConsumerChat farmerId={farmer.id} user={user} farmer={farmer} product={product} initialQty={qty || 5} />;
}

function ConsumerChat({
  farmerId,
  user,
  farmer,
  product,
  initialQty,
}: {
  farmerId: string;
  user: ReturnType<typeof useAuth>["user"];
  farmer: ReturnType<typeof farmerById>;
  product: typeof products[number];
  initialQty: number;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [offerPrice, setOfferPrice] = useState<number>(Math.round(product.price * 0.9));
  const [offerQty, setOfferQty] = useState<number>(initialQty);
  const [deal, setDeal] = useState<{ price: number; qty: number } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const userKey = user?.uid || (typeof window !== "undefined"
    ? (sessionStorage.getItem("krishi-anon") || (() => {
        const k = "anon-" + Math.random().toString(36).slice(2, 10);
        sessionStorage.setItem("krishi-anon", k); return k;
      })())
    : "anon");
  const convoId = `${farmerId}__${product.id}__${userKey}`;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  useEffect(() => {
    setDoc(doc(db, "chats", convoId), {
      farmerId, userId: userKey, productId: product.id, updatedAt: serverTimestamp(),
    }, { merge: true }).catch(() => {});

    const q = query(collection(db, "chats", convoId, "messages"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const list: Msg[] = snap.docs.map(d => {
        const v = d.data() as any;
        const t: Date = v.createdAt?.toDate?.() || new Date();
        return {
          id: d.id,
          from: v.from === "me" || v.userId === userKey ? "me" : "farmer",
          kind: (v.kind || "text") as MsgKind,
          text: v.text || "",
          price: v.price, qty: v.qty, unit: v.unit, productName: v.productName,
          time: fmtTime(t),
        };
      });
      if (list.length === 0) {
        addDoc(collection(db, "chats", convoId, "messages"), {
          from: "farmer", kind: "text",
          text: `Namaste! I'm ${farmer.name}. Let's talk about ${product.name} — ₹${product.price}/${product.unit}. Make me an offer 🙏`,
          createdAt: serverTimestamp(),
        }).catch(() => {});
      }
      // detect existing deal in history
      const lastDeal = [...list].reverse().find(m => m.kind === "deal");
      if (lastDeal && lastDeal.price && lastDeal.qty) {
        setDeal({ price: lastDeal.price, qty: lastDeal.qty });
        // Persist negotiated price + ensure item is in cart at deal qty
        deals.set({ productId: product.id, price: lastDeal.price, qty: lastDeal.qty, at: Date.now() });
        const inCart = cart.get().items.find(i => i.product.id === product.id);
        if (!inCart) cart.add(product, lastDeal.qty);
        else if (inCart.qty < lastDeal.qty) cart.setQty(product.id, lastDeal.qty);
      } else {
        setDeal(null);
      }
      setMsgs(list);
    }, (err) => console.warn("[chat] snapshot:", err.message));

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convoId]);

  const writeMsg = async (m: Partial<Msg> & { from: "me" | "farmer"; kind: MsgKind; text: string }) => {
    try {
      await addDoc(collection(db, "chats", convoId, "messages"), {
        ...m, userId: m.from === "me" ? userKey : null, createdAt: serverTimestamp(),
      });
    } catch (e: any) { console.warn("[chat] send:", e.message); }
  };

  const sendText = async (text: string) => {
    if (deal) return;
    await writeMsg({ from: "me", kind: "text", text });
    setTimeout(() => {
      const reply = PRESET_FARMER[text] || "Let me check and get back to you 🙂";
      writeMsg({ from: "farmer", kind: "text", text: reply });
    }, 700);
  };

  const sendOffer = async () => {
    if (deal) return;
    const price = Math.max(1, Math.round(offerPrice));
    const qty = Math.max(1, Math.round(offerQty));
    await writeMsg({
      from: "me", kind: "counter", price, qty, unit: product.unit, productName: product.name,
      text: `My offer: ₹${price}/${product.unit} × ${qty} ${product.unit}`,
    });
    setTimeout(async () => {
      const d = farmerDecide(product.price, price, qty);
      if (d.decision === "accept") {
        await writeMsg({ from: "farmer", kind: "accept", text: d.reason, price: d.price, qty, unit: product.unit, productName: product.name });
        await writeMsg({ from: "farmer", kind: "deal", price: d.price, qty, unit: product.unit, productName: product.name,
          text: `🤝 DEAL: ${product.name} — ₹${d.price}/${product.unit} × ${qty}` });
      } else if (d.decision === "reject") {
        await writeMsg({ from: "farmer", kind: "reject", text: d.reason, price: d.price });
      } else {
        await writeMsg({ from: "farmer", kind: "counter", text: d.reason, price: d.price, qty, unit: product.unit, productName: product.name });
        setOfferPrice(d.price); // suggest matching the counter
      }
    }, 800);
  };

  const acceptCounter = async (price: number, qty: number) => {
    if (deal) return;
    await writeMsg({ from: "me", kind: "accept", text: `Accepted ₹${price}/${product.unit} × ${qty}`, price, qty, unit: product.unit, productName: product.name });
    await writeMsg({ from: "farmer", kind: "deal", price, qty, unit: product.unit, productName: product.name,
      text: `🤝 DEAL: ${product.name} — ₹${price}/${product.unit} × ${qty}` });
  };

  const walkAway = async () => {
    if (deal) return;
    await writeMsg({ from: "me", kind: "reject", text: "No deal — I'll think about it." });
    await writeMsg({ from: "farmer", kind: "text", text: "No worries! Come back anytime 🙏" });
  };

  // Find latest farmer counter we can accept
  const latestFarmerCounter = useMemo(() => {
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i];
      if (m.kind === "deal") break;
      if (m.from === "farmer" && m.kind === "counter" && m.price && m.qty) return m;
    }
    return null;
  }, [msgs]);

  const dealTotal = deal ? deal.price * deal.qty : 0;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <div className="rounded-3xl bg-card border border-border shadow-card overflow-hidden flex flex-col h-[calc(100vh-180px)]">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border bg-secondary/40">
          <img src={farmer.photo} alt={farmer.name} className="h-12 w-12 rounded-full object-cover" />
          <div className="flex-1 min-w-0">
            <div className="font-bold flex items-center gap-2">{farmer.name}<span className="h-2 w-2 rounded-full bg-fresh animate-pulse" /></div>
            <div className="text-xs text-muted-foreground truncate">Negotiating: {product.name} · Listed ₹{product.price}/{product.unit}</div>
          </div>
          {!user && <Link to="/login" className="text-xs font-semibold text-primary hover:underline">Sign in</Link>}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
          {msgs.map((m) => {
            const mine = m.from === "me";
            if (m.kind === "deal") {
              return (
                <div key={m.id} className="flex justify-center">
                  <div className="max-w-md w-full rounded-2xl p-4 gradient-fresh text-primary-foreground shadow-glow">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-90"><Handshake className="h-4 w-4" /> Deal sealed</div>
                    <div className="display text-2xl font-extrabold mt-1">{m.productName}</div>
                    <div className="mt-1 text-sm opacity-95">₹{m.price}/{m.unit} × {m.qty} = <span className="font-bold">₹{(m.price! * m.qty!)}</span></div>
                    <Link to="/checkout" className="inline-block mt-3 px-4 py-2 rounded-full bg-white text-primary text-sm font-bold">Proceed to checkout →</Link>
                  </div>
                </div>
              );
            }
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary rounded-bl-sm"}`}>
                  {(m.kind === "offer" || m.kind === "counter") && m.price ? (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider opacity-75 font-bold">{mine ? "Your offer" : "Counter offer"}</div>
                      <div className="text-base font-extrabold mt-0.5">₹{m.price}/{m.unit} × {m.qty}</div>
                      <p className="text-xs mt-1 opacity-90">{m.text.replace(/^My offer:.*$/, "")}</p>
                      {!mine && !deal && latestFarmerCounter?.id === m.id && (
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => acceptCounter(m.price!, m.qty!)} className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-fresh text-fresh-foreground hover:opacity-90"><Check className="h-3 w-3" /> Accept</button>
                          <button onClick={walkAway} className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-background text-foreground border border-border hover:bg-muted"><X className="h-3 w-3" /> Walk away</button>
                        </div>
                      )}
                    </div>
                  ) : m.kind === "accept" ? (
                    <p className="text-sm flex items-center gap-1.5"><Check className="h-4 w-4" /> {m.text}</p>
                  ) : m.kind === "reject" ? (
                    <p className="text-sm flex items-center gap-1.5"><X className="h-4 w-4" /> {m.text}</p>
                  ) : (
                    <p className="text-sm">{m.text}</p>
                  )}
                  <div className={`text-[10px] mt-1 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{m.time}</div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {/* Composer */}
        <div className="border-t border-border p-3 bg-card space-y-3">
          {deal ? (
            <div className="rounded-xl bg-fresh/10 border border-fresh/30 p-3 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-fresh" />
              <div className="flex-1 text-sm">
                <div className="font-bold">Negotiation closed</div>
                <div className="text-xs text-muted-foreground">{product.name} · ₹{deal.price}/{product.unit} × {deal.qty} = <b>₹{dealTotal}</b></div>
              </div>
              <Link to="/checkout" className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">Checkout</Link>
            </div>
          ) : (
            <>
              {/* Offer builder */}
              <div className="rounded-xl bg-secondary/40 border border-border p-3">
                <div className="text-[11px] text-muted-foreground mb-2 font-semibold">💰 Make an offer</div>
                <div className="flex flex-wrap items-end gap-3">
                  <label className="flex-1 min-w-28">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Price /{product.unit}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="font-bold">₹</span>
                      <input type="number" min={1} value={offerPrice} onChange={e => setOfferPrice(+e.target.value)}
                        className="w-full h-9 px-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none text-sm font-bold" />
                    </div>
                  </label>
                  <label className="flex-1 min-w-24">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Quantity</div>
                    <input type="number" min={1} value={offerQty} onChange={e => setOfferQty(+e.target.value)}
                      className="mt-1 w-full h-9 px-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none text-sm font-bold" />
                  </label>
                  <button onClick={sendOffer} className="h-9 px-4 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-glow inline-flex items-center gap-1.5">
                    <Handshake className="h-3.5 w-3.5" /> Send offer
                  </button>
                </div>
                <div className="text-[10px] text-muted-foreground mt-2">
                  Total: <b>₹{offerPrice * offerQty}</b> · vs listed <span className="line-through">₹{product.price * offerQty}</span>
                </div>
              </div>

              {/* Quick questions */}
              <div>
                <div className="text-[11px] text-muted-foreground mb-2 px-1">💬 Quick questions</div>
                <div className="flex gap-2 overflow-x-auto">
                  {PRESET_USER.map(p => (
                    <button key={p} onClick={() => sendText(p)}
                      className="flex-shrink-0 px-3 py-2 text-xs rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground border border-border font-semibold transition">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

type ChatSummary = {
  id: string;
  farmerId?: string;
  userId?: string;
  productId?: string;
};

function FarmerChat({
  farmerId,
  farmer,
  fallbackProduct,
}: {
  farmerId: string;
  farmer: ReturnType<typeof farmerById>;
  fallbackProduct: typeof products[number];
}) {
  const [convos, setConvos] = useState<ChatSummary[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [reply, setReply] = useState("");
  const [counterPrice, setCounterPrice] = useState(fallbackProduct.price);
  const [counterQty, setCounterQty] = useState(5);
  const endRef = useRef<HTMLDivElement>(null);

  const selectedConvo = convos.find(c => c.id === selectedId) || null;
  const product = products.find(p => p.id === selectedConvo?.productId) || fallbackProduct;
  const latestBuyerOffer = useMemo(() => {
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i];
      if (m.kind === "deal") break;
      if (m.from === "me" && (m.kind === "offer" || m.kind === "counter") && m.price && m.qty) return m;
    }
    return null;
  }, [msgs]);
  const closedDeal = useMemo(() => [...msgs].reverse().find(m => m.kind === "deal"), [msgs]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  useEffect(() => {
    const q = query(collection(db, "chats"), orderBy("updatedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs
        .map(d => ({ id: d.id, ...(d.data() as Omit<ChatSummary, "id">) }))
        .filter(c => !c.farmerId || c.farmerId === farmerId);

      setConvos(list);
      setSelectedId(current => current || list[0]?.id || "");
    }, (err) => console.warn("[farmer-chat] inbox:", err.message));

    return () => unsub();
  }, [farmerId]);

  useEffect(() => {
    if (!selectedId) {
      setMsgs([]);
      return;
    }

    const q = query(collection(db, "chats", selectedId, "messages"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const list: Msg[] = snap.docs.map(d => {
        const v = d.data() as any;
        const t: Date = v.createdAt?.toDate?.() || new Date();

        return {
          id: d.id,
          from: v.from === "farmer" ? "farmer" : "me",
          kind: (v.kind || "text") as MsgKind,
          text: v.text || "",
          price: v.price,
          qty: v.qty,
          unit: v.unit,
          productName: v.productName,
          time: fmtTime(t),
        };
      });

      setMsgs(list);
    }, (err) => console.warn("[farmer-chat] messages:", err.message));

    return () => unsub();
  }, [selectedId]);

  useEffect(() => {
    setCounterPrice(latestBuyerOffer?.price || product.price);
    setCounterQty(latestBuyerOffer?.qty || 5);
  }, [latestBuyerOffer?.price, latestBuyerOffer?.qty, product.price]);

  const writeFarmerMsg = async (m: Partial<Msg> & { kind: MsgKind; text: string }) => {
    if (!selectedId || closedDeal) return;

    await addDoc(collection(db, "chats", selectedId, "messages"), {
      ...m,
      from: "farmer",
      createdAt: serverTimestamp(),
    });
    await setDoc(doc(db, "chats", selectedId), { updatedAt: serverTimestamp() }, { merge: true });
  };

  const sendReply = async () => {
    const text = reply.trim();
    if (!text) return;

    setReply("");
    await writeFarmerMsg({ kind: "text", text });
  };

  const sendCounter = async () => {
    await writeFarmerMsg({
      kind: "counter",
      price: Math.max(1, Math.round(counterPrice)),
      qty: Math.max(1, Math.round(counterQty)),
      unit: product.unit,
      productName: product.name,
      text: `Farmer counter: ₹${Math.round(counterPrice)}/${product.unit} × ${Math.round(counterQty)} ${product.unit}`,
    });
  };

  const acceptBuyerOffer = async () => {
    if (!latestBuyerOffer?.price || !latestBuyerOffer.qty) return;

    await writeFarmerMsg({
      kind: "accept",
      price: latestBuyerOffer.price,
      qty: latestBuyerOffer.qty,
      unit: product.unit,
      productName: product.name,
      text: `Accepted ₹${latestBuyerOffer.price}/${product.unit} × ${latestBuyerOffer.qty}`,
    });
    await writeFarmerMsg({
      kind: "deal",
      price: latestBuyerOffer.price,
      qty: latestBuyerOffer.qty,
      unit: product.unit,
      productName: product.name,
      text: `🤝 DEAL: ${product.name} — ₹${latestBuyerOffer.price}/${product.unit} × ${latestBuyerOffer.qty}`,
    });
  };

  const rejectBuyerOffer = async () => {
    await writeFarmerMsg({
      kind: "reject",
      text: "Sorry, I cannot accept this price. Please send a better offer.",
    });
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <div className="mb-6">
        <h1 className="display text-4xl font-extrabold">Farmer Negotiation Inbox</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review buyer offers for {farmer.name}, send counters, and close deals from the farmer side.
        </p>
      </div>

      <div className="grid min-h-[calc(100vh-230px)] gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-3xl border border-border bg-card p-3 shadow-card">
          <div className="px-2 pb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Buyer chats</div>
          {convos.length === 0 ? (
            <div className="rounded-2xl bg-secondary/50 p-4 text-sm text-muted-foreground">
              No buyer negotiations yet. When consumers start a chat, it will appear here.
            </div>
          ) : (
            <div className="space-y-2">
              {convos.map((c, index) => {
                const item = products.find(p => p.id === c.productId) || fallbackProduct;
                const active = c.id === selectedId;

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`w-full rounded-2xl border p-3 text-left transition ${active ? "border-primary bg-primary/10" : "border-border hover:bg-secondary/50"}`}
                  >
                    <div className="text-sm font-bold">Buyer #{index + 1}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{item.name}</div>
                    <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">Conversation active</div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <section className="flex min-h-[620px] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card">
          <div className="flex items-center gap-3 border-b border-border bg-secondary/40 p-4">
            <img src={farmer.photo} alt={farmer.name} className="h-12 w-12 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <div className="font-bold">{selectedConvo ? `Negotiating ${product.name}` : "Select a buyer chat"}</div>
              <div className="truncate text-xs text-muted-foreground">Listed ₹{product.price}/{product.unit}</div>
            </div>
            {closedDeal && (
              <span className="rounded-full bg-fresh px-3 py-1 text-xs font-bold text-fresh-foreground">Deal closed</span>
            )}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-background p-4">
            {msgs.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                Select a buyer conversation to start replying.
              </div>
            ) : msgs.map((m) => {
              const mine = m.from === "farmer";

              if (m.kind === "deal") {
                return (
                  <div key={m.id} className="flex justify-center">
                    <div className="w-full max-w-md rounded-2xl p-4 gradient-fresh text-primary-foreground shadow-glow">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-90"><Handshake className="h-4 w-4" /> Deal sealed</div>
                      <div className="display mt-1 text-2xl font-extrabold">{m.productName}</div>
                      <div className="mt-1 text-sm opacity-95">₹{m.price}/{m.unit} × {m.qty} = <span className="font-bold">₹{(m.price! * m.qty!)}</span></div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary rounded-bl-sm"}`}>
                    {(m.kind === "offer" || m.kind === "counter") && m.price ? (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">{mine ? "Your counter" : "Buyer offer"}</div>
                        <div className="mt-0.5 text-base font-extrabold">₹{m.price}/{m.unit} × {m.qty}</div>
                        <p className="mt-1 text-xs opacity-90">{m.text}</p>
                      </div>
                    ) : m.kind === "accept" ? (
                      <p className="flex items-center gap-1.5 text-sm"><Check className="h-4 w-4" /> {m.text}</p>
                    ) : m.kind === "reject" ? (
                      <p className="flex items-center gap-1.5 text-sm"><X className="h-4 w-4" /> {m.text}</p>
                    ) : (
                      <p className="text-sm">{m.text}</p>
                    )}
                    <div className={`mt-1 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{m.time}</div>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          <div className="space-y-3 border-t border-border bg-card p-3">
            {!selectedConvo ? (
              <div className="rounded-xl bg-secondary/50 p-3 text-sm text-muted-foreground">Choose a buyer chat from the inbox.</div>
            ) : closedDeal ? (
              <div className="rounded-xl border border-fresh/30 bg-fresh/10 p-3 text-sm">
                Negotiation is closed for this buyer.
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-border bg-secondary/40 p-3">
                  <div className="mb-2 text-[11px] font-semibold text-muted-foreground">Respond to latest buyer offer</div>
                  <div className="flex flex-wrap items-end gap-3">
                    <label className="min-w-28 flex-1">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Price /{product.unit}</div>
                      <input type="number" min={1} value={counterPrice} onChange={e => setCounterPrice(+e.target.value)}
                        className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm font-bold focus:border-primary focus:outline-none" />
                    </label>
                    <label className="min-w-24 flex-1">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Quantity</div>
                      <input type="number" min={1} value={counterQty} onChange={e => setCounterQty(+e.target.value)}
                        className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm font-bold focus:border-primary focus:outline-none" />
                    </label>
                    <button onClick={sendCounter} className="h-9 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground hover:bg-primary-glow">
                      Send counter
                    </button>
                    <button onClick={acceptBuyerOffer} disabled={!latestBuyerOffer} className="h-9 rounded-full bg-fresh px-4 text-xs font-bold text-fresh-foreground disabled:opacity-50">
                      Accept buyer
                    </button>
                    <button onClick={rejectBuyerOffer} className="h-9 rounded-full border border-border px-4 text-xs font-bold hover:bg-muted">
                      Reject
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") sendReply(); }}
                    placeholder="Reply as farmer..."
                    className="h-11 flex-1 rounded-xl border border-border bg-background px-4 text-sm focus:border-primary focus:outline-none"
                  />
                  <button onClick={sendReply} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground">
                    <Send className="h-4 w-4" /> Send
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
