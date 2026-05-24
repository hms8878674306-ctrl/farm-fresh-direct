import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onend: (() => void) | null;
};

type SpeechResultEvent = {
  results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type NavTarget = {
  to: string;
  search?: Record<string, unknown>;
};

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window &
    typeof globalThis & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

function normalize(text: string) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

function matchCommand(spoken: string, isFarmer: boolean): NavTarget | null {
  const s = normalize(spoken);

  const rules: Array<{ words: string[]; target: NavTarget }> = [
    { words: ["home", "मुख्य", "होम", "मुख्यपृष्ठ", "ಮುಖಪುಟ"], target: { to: "/" } },
    { words: ["shop", "buy", "market", "बाजार", "खरीद", "दुकान"], target: { to: "/shop", search: { q: "" } } },
    { words: ["track", "order", "delivery", "ऑर्डर", "ट्रैक", "डिलीवरी"], target: { to: "/track" } },
    { words: ["cart", "basket", "कार्ट", "टोकरी"], target: { to: "/checkout" } },
    { words: ["chat", "negotiate", "चैट", "मोलभाव"], target: { to: "/chat", search: { farmerId: "f1" } } },
    { words: ["login", "sign in", "लॉगिन"], target: { to: "/login" } },
    { words: ["farmer", "किसान", "शेतकरी"], target: { to: "/farmers" } },
    {
      words: ["dashboard", "sales", "डैशबोर्ड", "बिक्री"],
      target: { to: isFarmer ? "/farmer-dashboard" : "/dashboard" },
    },
    {
      words: ["listing", "listings", "add crop", "लिस्टिंग", "यादी"],
      target: { to: "/farmer-dashboard", search: { section: "listings", add: true } },
    },
  ];

  for (const rule of rules) {
    if (rule.words.some((w) => s.includes(normalize(w)))) return rule.target;
  }

  if (!isFarmer && s.length > 1) return { to: "/shop", search: { q: spoken.trim() } };
  return null;
}

export function VoiceNavigator() {
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const navigate = useNavigate();
  const { role } = useAuth();
  const { speechLocale, t } = useLanguage();
  const isFarmer = role === "farmer";

  useEffect(() => {
    const Source = getSpeechRecognitionConstructor();
    if (!Source) return;
    const r = new Source();
    r.continuous = false;
    r.interimResults = true;
    r.onresult = (e) => {
      const spoken = Array.from(e.results)
        .map((row) => row[0].transcript)
        .join("");
      setHeard(spoken);
      if (e.results[e.results.length - 1].isFinal) {
        setListening(false);
        const dest = matchCommand(spoken, isFarmer);
        if (dest) navigate(dest as never);
        else if (spoken.trim()) alert(t.voiceNavUnknown);
      }
    };
    r.onend = () => setListening(false);
    recRef.current = r;
  }, [isFarmer, navigate, t.voiceNavUnknown]);

  useEffect(() => {
    if (recRef.current) recRef.current.lang = speechLocale;
  }, [speechLocale]);

  const toggle = () => {
    if (!recRef.current) {
      alert(t.voiceUnsupported);
      return;
    }
    if (listening) {
      recRef.current.stop();
      return;
    }
    setHeard("");
    recRef.current.lang = speechLocale;
    recRef.current.start();
    setListening(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        title={t.voiceNavHint}
        aria-label={t.voiceNavHint}
        className={`h-10 w-10 inline-flex items-center justify-center rounded-full transition ${listening ? "bg-harvest text-harvest-foreground animate-glow-pulse" : "hover:bg-muted"}`}
      >
        {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </button>
      {listening && (
        <div className="fixed bottom-8 left-1/2 z-50 max-w-md px-6 py-3 rounded-full bg-card shadow-glow border border-border text-sm text-center">
          {t.voiceNavListening}: <span className="text-muted-foreground">{heard || "…"}</span>
        </div>
      )}
    </>
  );
}
