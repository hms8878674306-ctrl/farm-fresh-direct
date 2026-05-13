import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
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

type Props = {
  onParsed: (values: { name?: string; price?: string; stock?: string }) => void;
  className?: string;
};

const wordNumbers: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
  hundred: 100,
  "\u090f\u0915": 1,
  "\u0926\u094b": 2,
  "\u0924\u0940\u0928": 3,
  "\u091a\u093e\u0930": 4,
  "\u092a\u093e\u0902\u091a": 5,
  "\u091b\u0939": 6,
  "\u0938\u093e\u0924": 7,
  "\u0906\u0920": 8,
  "\u0928\u094c": 9,
  "\u0926\u0938": 10,
  "\u092c\u0940\u0938": 20,
  "\u0924\u0940\u0938": 30,
  "\u091a\u093e\u0932\u0940\u0938": 40,
  "\u092a\u091a\u093e\u0938": 50,
  "\u0938\u093e\u0920": 60,
  "\u0938\u0924\u094d\u0924\u0930": 70,
  "\u0905\u0938\u094d\u0938\u0940": 80,
  "\u0928\u092c\u094d\u092c\u0947": 90,
  "\u0938\u094c": 100,
  "\u0926\u0940\u0921": 1.5,
  "\u0926\u094b\u0928": 2,
  "\u092a\u093e\u091a": 5,
  "\u0938\u0939\u093e": 6,
  "\u0926\u0939\u093e": 10,
  "\u0935\u0940\u0938": 20,
  "\u091a\u093e\u0933\u0940\u0938": 40,
  "\u092a\u0928\u094d\u0928\u093e\u0938": 50,
  "\u0910\u0902\u0936\u0940": 80,
  "\u0928\u0935\u094d\u0935\u0926": 90,
  "\u0936\u0902\u092d\u0930": 100,
};

const cropAliases: Record<string, string> = {
  tomato: "Tomato",
  tomatoes: "Tomato",
  tamatar: "Tomato",
  "\u091f\u092e\u093e\u091f\u0930": "Tomato",
  "\u091f\u094b\u092e\u0945\u091f\u094b": "Tomato",
  onion: "Onion",
  onions: "Onion",
  pyaz: "Onion",
  "\u092a\u094d\u092f\u093e\u091c": "Onion",
  "\u0915\u093e\u0902\u0926\u093e": "Onion",
  spinach: "Spinach",
  palak: "Spinach",
  "\u092a\u093e\u0932\u0915": "Spinach",
  mango: "Mango",
  aam: "Mango",
  "\u0906\u092e": "Mango",
  "\u0906\u0902\u092c\u093e": "Mango",
  carrot: "Carrot",
  gajar: "Carrot",
  "\u0917\u093e\u091c\u0930": "Carrot",
  capsicum: "Capsicum",
  shimla: "Capsicum",
  "\u0936\u093f\u092e\u0932\u093e": "Capsicum",
  "\u0922\u094b\u092c\u0933\u0940": "Capsicum",
};

const listingStopWords = new Set([
  "price",
  "rate",
  "stock",
  "quantity",
  "kg",
  "kilo",
  "kilogram",
  "rupees",
  "rs",
  "rupay",
  "rupee",
  "\u0915\u0940\u092e\u0924",
  "\u092d\u093e\u0935",
  "\u0938\u094d\u091f\u0949\u0915",
  "\u0915\u093f\u0932\u094b",
  "\u0930\u0941\u092a\u092f\u0947",
  "\u0930\u0941\u092a\u092f\u093e",
  "\u0915\u093f\u0902\u092e\u0924",
]);

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const speechWindow = window as Window &
    typeof globalThis & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };

  return speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition || null;
}

function getNumbers(text: string) {
  const found: number[] = [];
  const digitMatches = text.match(/\d+(?:\.\d+)?/g) || [];
  digitMatches.forEach((match) => found.push(Number(match)));

  text.split(/\s+/).forEach((word) => {
    const value = wordNumbers[word.replace(/[.,]/g, "")];
    if (value) found.push(value);
  });

  return found.filter(Number.isFinite);
}

function parseListingSpeech(raw: string) {
  const text = raw.toLowerCase();
  const numbers = getNumbers(text);
  const values: { name?: string; price?: string; stock?: string } = {};

  values.price = numbers[0] ? String(numbers[0]) : undefined;
  values.stock = numbers[1] ? String(numbers[1]) : undefined;

  const alias = Object.keys(cropAliases).find((key) => text.includes(key));
  if (alias) {
    values.name = cropAliases[alias];
  } else {
    const cleaned = text
      .replace(/\d+(?:\.\d+)?/g, " ")
      .split(/\s+/)
      .map((word) => word.replace(/[.,]/g, ""))
      .filter((word) => word && !listingStopWords.has(word) && !wordNumbers[word])
      .join(" ");
    values.name = cleaned.split(/\s+/).slice(0, 3).join(" ") || undefined;
  }

  return values;
}

export function FarmerVoiceListing({ onParsed, className = "" }: Props) {
  const { t, speechLocale } = useLanguage();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [message, setMessage] = useState("");
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  const supported = useMemo(() => {
    return Boolean(getSpeechRecognitionConstructor());
  }, []);

  useEffect(() => {
    const Source = getSpeechRecognitionConstructor();
    if (!Source) return;

    const rec: SpeechRecognitionLike = new Source();
    rec.lang = speechLocale;
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (event) => {
      const spoken = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");

      setTranscript(spoken);

      if (event.results[event.results.length - 1].isFinal) {
        const values = parseListingSpeech(spoken);
        onParsed(values);
        setMessage(values.price ? t.voiceParsed : t.voiceNoPrice);
      }
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
  }, [onParsed, speechLocale, t.voiceNoPrice, t.voiceParsed]);

  const toggle = () => {
    if (!recRef.current || !supported) {
      setMessage(t.voiceUnsupported);
      return;
    }

    if (listening) {
      recRef.current.stop();
      setListening(false);
      return;
    }

    setTranscript("");
    setMessage("");
    recRef.current.lang = speechLocale;
    recRef.current.start();
    setListening(true);
  };

  return (
    <div className={`rounded-2xl border border-border bg-card/80 p-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-bold">{t.voiceBot}</div>
          <p className="mt-1 text-xs text-muted-foreground">{t.voiceBotHint}</p>
        </div>
        <button
          type="button"
          onClick={toggle}
          className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-bold transition ${
            listening ? "bg-harvest text-harvest-foreground" : "bg-primary text-primary-foreground"
          }`}
        >
          {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          {listening ? t.voiceStop : t.voiceStart}
        </button>
      </div>
      {(transcript || message) && (
        <div className="mt-3 rounded-xl bg-secondary/60 px-3 py-2 text-xs">
          {transcript && (
            <div>
              <span className="font-semibold">{t.voiceTranscript}:</span>{" "}
              <span className="text-muted-foreground">{transcript}</span>
            </div>
          )}
          {message && <div className="mt-1 font-semibold text-primary">{message}</div>}
        </div>
      )}
    </div>
  );
}
