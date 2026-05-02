import { createFileRoute, Link } from "@tanstack/react-router";
import { farmers, farmerById } from "@/lib/data";
import { useState, useRef, useEffect } from "react";
import {
  collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/chat")({
  validateSearch: (s: Record<string, unknown>) => ({ farmerId: (s.farmerId as string) || "f1" }),
  head: () => ({ meta: [{ title: "Negotiate with Farmer — KrishiDirect" }] }),
  component: Chat,
});

type Msg = { id: string; from: "me" | "farmer"; text: string; time: string };

const PRESET_USER = [
  "Can you offer a better price?",
  "Is this harvested today?",
  "Can you deliver tomorrow morning?",
  "Do you give discount on bulk order?",
  "Is it organic certified?",
];

const PRESET_FARMER: Record<string, string> = {
  "Can you offer a better price?": "I can give you 5% off if you order 5kg or more 👍",
  "Is this harvested today?": "Yes, picked this morning at 6am from my farm 🌅",
  "Can you deliver tomorrow morning?": "Sure, I will pack tonight and rider will reach by 9am ✅",
  "Do you give discount on bulk order?": "For 10kg+ orders, flat 8% off and free delivery 🚚",
  "Is it organic certified?": "Yes, certified by APEDA. Zero pesticides 🌱",
};

function fmtTime(d: Date) { return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }

function Chat() {
  const { farmerId } = Route.useSearch();
  const { user } = useAuth();
  const farmer = farmerById(farmerId) || farmers[0];
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  // Conversation id is per-user-per-farmer (anonymous users get a session id).
  const userKey = user?.uid || (typeof window !== "undefined"
    ? (sessionStorage.getItem("krishi-anon") || (() => {
        const k = "anon-" + Math.random().toString(36).slice(2, 10);
        sessionStorage.setItem("krishi-anon", k); return k;
      })())
    : "anon");
  const convoId = `${farmerId}__${userKey}`;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  useEffect(() => {
    // Ensure conversation doc exists
    setDoc(doc(db, "chats", convoId), {
      farmerId, userId: userKey, updatedAt: serverTimestamp(),
    }, { merge: true }).catch(() => {});

    const q = query(collection(db, "chats", convoId, "messages"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const list: Msg[] = snap.docs.map(d => {
        const v = d.data() as any;
        const t: Date = v.createdAt?.toDate?.() || new Date();
        return { id: d.id, from: v.from === "me" || v.userId === userKey ? "me" : "farmer", text: v.text, time: fmtTime(t) };
      });
      if (list.length === 0) {
        // Greeting if empty
        addDoc(collection(db, "chats", convoId, "messages"), {
          from: "farmer", text: `Namaste! I'm ${farmer.name}. Ask me anything about my produce 🙏`,
          createdAt: serverTimestamp(),
        }).catch(() => {});
      }
      setMsgs(list);
    }, (err) => console.warn("[chat] snapshot:", err.message));

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convoId]);

  const send = async (text: string) => {
    try {
      await addDoc(collection(db, "chats", convoId, "messages"), {
        from: "me", userId: userKey, text, createdAt: serverTimestamp(),
      });
      // Auto-reply with preset (simulated farmer)
      setTimeout(() => {
        const reply = PRESET_FARMER[text] || "Let me check and get back to you 🙂";
        addDoc(collection(db, "chats", convoId, "messages"), {
          from: "farmer", text: reply, createdAt: serverTimestamp(),
        }).catch(() => {});
      }, 700);
    } catch (e: any) {
      console.warn("[chat] send:", e.message);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <div className="rounded-3xl bg-card border border-border shadow-card overflow-hidden flex flex-col h-[calc(100vh-180px)]">
        <div className="flex items-center gap-3 p-4 border-b border-border bg-secondary/40">
          <img src={farmer.photo} alt={farmer.name} className="h-12 w-12 rounded-full object-cover" />
          <div className="flex-1">
            <div className="font-bold flex items-center gap-2">{farmer.name}<span className="h-2 w-2 rounded-full bg-fresh animate-pulse" /></div>
            <div className="text-xs text-muted-foreground">{farmer.location} · Real-time chat</div>
          </div>
          {!user && <Link to="/login" className="text-xs font-semibold text-primary hover:underline">Sign in</Link>}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
          {msgs.map((m) => (
            <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 animate-leaf-grow ${m.from === "me" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary rounded-bl-sm"}`}>
                <p className="text-sm">{m.text}</p>
                <div className={`text-[10px] mt-1 ${m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{m.time}</div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="border-t border-border p-3 bg-card">
          <div className="text-[11px] text-muted-foreground mb-2 px-1">💬 Quick negotiate (tap to send)</div>
          <div className="flex gap-2 overflow-x-auto">
            {PRESET_USER.map(p => (
              <button key={p} onClick={() => send(p)}
                className="flex-shrink-0 px-3 py-2 text-xs rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground border border-border font-semibold transition">
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
