import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
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
  results: ArrayLike<{
    0: { transcript: string };
    isFinal: boolean;
  }>;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const speechWindow = window as Window &
    typeof globalThis & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };

  return speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition || null;
}

export function VoiceSearch() {
  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const navigate = useNavigate();
  const { speechLocale, t } = useLanguage();

  useEffect(() => {
    const Source = getSpeechRecognitionConstructor();
    if (!Source) return;
    const r = new Source();
    r.lang = speechLocale;
    r.continuous = false;
    r.interimResults = true;
    r.onresult = (e) => {
      const spoken = Array.from(e.results)
        .map((result) => result[0].transcript)
        .join("");
      setText(spoken);
      if (e.results[e.results.length - 1].isFinal) {
        setListening(false);
        navigate({ to: "/shop", search: { q: spoken } as never });
      }
    };
    r.onend = () => setListening(false);
    recRef.current = r;
  }, [navigate, speechLocale]);

  const toggle = () => {
    if (!recRef.current) {
      alert(t.voiceUnsupported);
      return;
    }
    if (listening) recRef.current.stop();
    else {
      setText("");
      recRef.current.lang = speechLocale;
      recRef.current.start();
      setListening(true);
    }
  };

  return (
    <>
      <button
        onClick={toggle}
        aria-label={t.voiceSearch}
        className={`h-10 w-10 inline-flex items-center justify-center rounded-full transition ${listening ? "bg-harvest text-harvest-foreground animate-glow-pulse" : "hover:bg-muted"}`}
      >
        {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </button>
      {listening && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-card shadow-glow border border-border text-sm">
          {t.voiceTranscript}: <span className="text-muted-foreground">{text || t.cropName}</span>
        </div>
      )}
    </>
  );
}
