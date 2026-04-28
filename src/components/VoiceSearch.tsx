import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

// Minimal Web Speech API wrapper
type SR = any;

export function VoiceSearch() {
  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");
  const recRef = useRef<SR | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SRC = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SRC) return;
    const r = new SRC();
    r.lang = "en-IN";
    r.continuous = false;
    r.interimResults = true;
    r.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join("");
      setText(t);
      if (e.results[e.results.length - 1].isFinal) {
        setListening(false);
        navigate({ to: "/shop", search: { q: t } as any });
      }
    };
    r.onend = () => setListening(false);
    recRef.current = r;
  }, [navigate]);

  const toggle = () => {
    if (!recRef.current) { alert("Voice search needs Chrome/Edge browser."); return; }
    if (listening) recRef.current.stop();
    else { setText(""); recRef.current.start(); setListening(true); }
  };

  return (
    <>
      <button
        onClick={toggle}
        aria-label="Voice search"
        className={`h-10 w-10 inline-flex items-center justify-center rounded-full transition ${listening ? "bg-harvest text-harvest-foreground animate-glow-pulse" : "hover:bg-muted"}`}
      >
        {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </button>
      {listening && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-card shadow-glow border border-border text-sm">
          🎙️ Listening… <span className="text-muted-foreground">{text || "say a vegetable name"}</span>
        </div>
      )}
    </>
  );
}
