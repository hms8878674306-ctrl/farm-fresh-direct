import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  X,
  Bot,
  ChevronDown,
  Languages,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { askGemini } from "@/lib/gemini";
import { getRegionalLanguage, INDIAN_LANGUAGES } from "@/lib/i18n/languages";

type ChatMsg = {
  id: string;
  role: "user" | "model";
  text: string;
  time: string;
};

function fmtTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Multilingual Greetings
const GREETINGS: Record<string, string> = {
  en: "Namaste! I'm KrishiMitra, your AI assistant for KrishiDirect. Ask me anything about our fresh crops, local farmers, pricing, or delivery! 🌾",
  hi: "नमस्ते! मैं कृषिमित्र हूँ, कृषिडायरेक्ट के लिए आपका एआई सहायक। मुझसे हमारी ताज़ा फसलों, स्थानीय किसानों, कीमतों या डिलीवरी के बारे में कुछ भी पूछें! 🌾",
  bn: "নমস্কার! আমি কৃষিমিত্র, কৃষিডাইরেক্টের জন্য আপনার এআই সহকারী। আমাদের তাজা ফসল, স্থানীয় কৃষক, দাম বা ডেলিভারি সম্পর্কে যেকোনো কিছু জিজ্ঞাসা করুন! 🌾",
  te: "నమస్తే! నేను క్రిషిమిత్ర, కృషిడైరెక్ట్ కోసం మీ AI సహాయకుడిని. మా తాజా పంటలు, స్థానిక రైతులు, ధరలు లేదా డెలివరీ గురించి ఏదైనా నన్ను అడగండి! 🌾",
  mr: "नमस्ते! मी कृषिमित्र आहे, कृषिडायरेक्टसाठी तुमचा एआय सहाय्यक. आमच्या ताज्या पिकांबद्दल, स्थानिक शेतकऱ्यांबद्दल, किमती किंवा वितरणाबद्दल मला काहीही विचारा! 🌾",
  ta: "வணக்கம்! நான் கிருஷிமித்ரா, கிருஷிடைரக்ட்டிற்கான உங்கள் AI உதவியாளர். எங்கள் புதிய பயிர்கள், உள்ளூர் விவசாயிகள், விலை அல்லது விநியோகம் பற்றி எதையும் என்னிடம் கேளுங்கள்! 🌾",
  ur: "اسلام علیکم! میں کرشی مترا ہوں، کرشی ڈائریکٹ کے لیے آپ کا اے آئی اسسٹنٹ۔ ہم سے ہماری تازہ فصلوں، مقامی کسانوں، قیمتوں یا ترسیل کے بارے میں کچھ بھی پوچھیں! 🌾",
  gu: "નમસ્તે! હું કૃષિમિત્ર છું, કૃષિડાયરેક્ટ માટે તમારા એઆઈ સહાયક. પાક, સ્થાનિક ખેડૂતો, કિંમત અથવા ડિલિવરી વિશે ગમે તે પૂછો! 🌾",
  kn: "ನಮಸ್ತೆ! ನಾನು ಕೃಷಿಮಿತ್ರ, ಕೃಷಿಡೈರೆಕ್ಟ್‌ಗಾಗಿ ನಿಮ್ಮ AI ಸಹಾಯಕ. ನಮ್ಮ ತಾಜಾ ಬೆಳೆಗಳು, ಸ್ಥಳೀಯ ರೈತರು, ಬೆಲೆಗಳು ಅಥವಾ ವಿತರಣೆಯ ಬಗ್ಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ! 🌾",
  ml: "നമസ്തേ! ഞാൻ കൃഷിമിത്ര, കൃഷിഡയറക്ടിനായുള്ള നിങ്ങളുടെ AI അസിസ്റ്റന്റ്. ഞങ്ങളുടെ പുതിയ വിളകൾ, പ്രാദേശിക കർഷകർ, വില അല്ലെങ്കിൽ ഡെലിവറി എന്നിവയെക്കുറിച്ച് എന്തും എന്നോട് ചോദിക്കുക! 🌾",
  pa: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਕ੍ਰਿਸ਼ੀਮਿੱਤਰ ਹਾਂ, ਕ੍ਰਿਸ਼ੀਡਾਇਰੈਕਟ ਲਈ ਤੁਹਾਡਾ ਏਆਈ ਸਹਾਇਕ। ਸਾਡੀਆਂ ਤਾਜ਼ਾ ਫਸਲਾਂ, ਸਥਾਨਕ ਕਿਸਾਨਾਂ, ਕੀਮਤਾਂ ਜਾਂ ਡਿਲੀਵਰੀ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ! 🌾",
};

export function KrishiAiChatbot() {
  const { language, setLanguage, speechLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Audio config
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  
  // Voice Input (Speech to Text)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize Welcome message
  useEffect(() => {
    const greeting = GREETINGS[language] || GREETINGS.en;
    setMessages([
      {
        id: "welcome",
        role: "model",
        text: greeting,
        time: fmtTime(),
      },
    ]);
  }, [language]);

  // Scroll to bottom on messages update
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  // Speech Recognition setup
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechConstructor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechConstructor) {
      const rec = new SpeechConstructor();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = speechLocale;
      
      rec.onstart = () => {
        setIsListening(true);
      };
      
      rec.onresult = (event: any) => {
        const resultText = event.results[0]?.[0]?.transcript || "";
        setInput((prev) => (prev ? `${prev} ${resultText}` : resultText));
      };
      
      rec.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      };
      
      rec.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = rec;
    }
  }, [speechLocale]);

  // Speak response via TTS
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !isAudioEnabled) return;
    try {
      window.speechSynthesis.cancel(); // stop current speech
      
      // Clean markdown characters before reading
      const cleanText = text.replace(/[\*#_`-]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = speechLocale;
      
      // Try to find a voice that matches the speech locale
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(
        (v) => v.lang.startsWith(speechLocale) || v.lang.includes(language)
      );
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Text-to-speech failed:", e);
    }
  };

  const handleToggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Voice search is not supported in this browser. Try Google Chrome! 🎤");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.lang = speechLocale;
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Failed starting speech recognition:", err);
      }
    }
  };

  const handleSaveKey = () => {
    const trimmed = tempKey.trim();
    if (!trimmed) {
      alert("Please enter a valid Gemini API Key.");
      return;
    }
    saveGeminiApiKey(trimmed);
    setHasKey(true);
    setShowSettings(false);
  };

  const handleDeleteKey = () => {
    removeGeminiApiKey();
    setHasKey(false);
    setTempKey("");
    setShowSettings(true);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend) return;

    if (!customText) setInput(""); // Clear field

    // Append User Message
    const userMsg: ChatMsg = {
      id: Math.random().toString(),
      role: "user",
      text: textToSend,
      time: fmtTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Format chat history to send to Gemini (limit to last 6 messages)
      const chatHistory = messages
        .slice(-6)
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const reply = await askGemini(textToSend, chatHistory, language);
      
      const modelMsg: ChatMsg = {
        id: Math.random().toString(),
        role: "model",
        text: reply,
        time: fmtTime(),
      };
      
      setMessages((prev) => [...prev, modelMsg]);
      speakText(reply);
    } catch (error: any) {
      console.error("AI response error:", error);
      let errorText = "Sorry, I couldn't reach the AI model. Please verify your connection or try again.";
      if (error?.message === "API_KEY_MISSING") {
        errorText = "The Gemini API Key is missing. Please configure VITE_GEMINI_API_KEY in the .env file to start chatting! 🔑";
      } else if (error?.message?.includes("API_RESPONSE_ERROR_403")) {
        errorText = "Your API Key seems invalid or restricted. Please check your key settings. 🔑";
      }
      
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "model",
          text: errorText,
          time: fmtTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Convert markdown-like response to clean HTML
  const renderMessageContent = (text: string) => {
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // bold **text**
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // lists * item or - item
      .replace(/^\s*[-*]\s+(.*?)$/gm, "• $1")
      // new lines to br
      .replace(/\n/g, "<br />");
      
    return <div dangerouslySetInnerHTML={{ __html: html }} className="text-sm leading-relaxed" />;
  };

  const quickPrompts = [
    { text: language === "hi" ? "आज ताज़ा क्या है? 🥬" : "What is fresh today? 🥬", query: "What is fresh today? Show me listed items and who sells them." },
    { text: language === "hi" ? "जैविक फसलें दिखाएं 🌿" : "Show organic items 🌿", query: "Are there any organic certified items available?" },
    { text: language === "hi" ? "किराया/डिलीवरी 🚚" : "Delivery details 🚚", query: "How does payment and delivery work on KrishiDirect?" },
    { text: language === "hi" ? "रमेश पटेल कौन है? 👨‍🌾" : "About Ramesh Patel 👨‍🌾", query: "Tell me about Ramesh Patel, what he sells, and his location." }
  ];

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        aria-label="KrishiMitra AI Support"
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full gradient-fresh text-primary-foreground shadow-glow flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20 cursor-pointer ${
          isOpen ? "rotate-90 bg-destructive!" : "animate-bounce-in"
        }`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6 animate-pulse" />}
      </button>

      {/* CHAT WINDOW CARD */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[550px] rounded-3xl border border-border bg-card/90 backdrop-blur-xl shadow-glow flex flex-col overflow-hidden animate-welcome-pop border-primary/25">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/40">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl gradient-fresh flex items-center justify-center shadow-soft">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm flex items-center gap-1.5 leading-none text-foreground">
                  KrishiMitra AI <span className="inline-block h-2 w-2 rounded-full bg-fresh animate-pulse" />
                </h3>
                <label className="inline-flex items-center gap-1 mt-1 text-[10px] text-muted-foreground font-semibold cursor-pointer">
                  <Languages className="h-3 w-3 text-muted-foreground" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="bg-transparent text-[10px] font-bold outline-none cursor-pointer uppercase text-muted-foreground border-none p-0 focus:ring-0"
                    aria-label="Select Language"
                  >
                    {INDIAN_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code} className="text-foreground bg-card">
                        {lang.nativeLabel} ({lang.englishLabel})
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              {/* Sound toggle */}
              <button
                onClick={() => {
                  const next = !isAudioEnabled;
                  setIsAudioEnabled(next);
                  if (!next && typeof window !== "undefined") {
                    window.speechSynthesis.cancel();
                  }
                }}
                title={isAudioEnabled ? "Mute responses" : "Read responses aloud"}
                className={`p-2 rounded-full transition ${isAudioEnabled ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
              >
                {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full text-muted-foreground hover:bg-muted"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* MAIN CONTAINER */}
          <div className="flex-1 relative overflow-hidden flex flex-col bg-background/50">

            {/* MESSAGE LIST */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.map((msg) => {
                const isModel = msg.role === "model";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isModel ? "justify-start" : "justify-end"}`}
                  >
                    {isModel && (
                      <div className="h-7 w-7 rounded-lg gradient-fresh flex items-center justify-center shrink-0 shadow-soft">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                    <div className="flex flex-col max-w-[78%]">
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 ${
                          isModel
                            ? "bg-secondary rounded-tl-sm text-foreground"
                            : "bg-primary rounded-tr-sm text-primary-foreground"
                        }`}
                      >
                        {isModel ? renderMessageContent(msg.text) : <p className="text-sm">{msg.text}</p>}
                      </div>
                      <span
                        className={`text-[9px] text-muted-foreground mt-1 px-1 ${
                          isModel ? "text-left" : "text-right"
                        }`}
                      >
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {loading && (
                <div className="flex items-start gap-2.5 justify-start">
                  <div className="h-7 w-7 rounded-lg gradient-fresh flex items-center justify-center shrink-0 shadow-soft">
                    <Bot className="h-4 w-4 text-primary-foreground animate-pulse" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-secondary rounded-tl-sm text-foreground flex items-center gap-1.5 h-[38px]">
                    <span className="h-2 w-2 rounded-full bg-primary/75 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-primary/75 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-primary/75 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* QUICK ACTIONS SUGGESTIONS */}
            {!loading && messages.length <= 2 && (
              <div className="p-3 border-t border-border bg-secondary/15">
                <div className="text-[10px] text-muted-foreground mb-1.5 uppercase font-bold tracking-wider px-1">
                  💡 Ask KrishiMitra
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt.text}
                      onClick={() => handleSendMessage(prompt.query)}
                      className="px-2.5 py-1.5 text-[11px] font-semibold rounded-full border border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition cursor-pointer text-left shrink-0"
                    >
                      {prompt.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* COMPOSER / INPUT AREA */}
          <div className="border-t border-border p-3 bg-card flex gap-2 items-center">
            {/* Audio Speech Mic Input */}
            <button
              onClick={handleToggleVoiceInput}
              title={isListening ? "Stop listening" : "Talk in native language"}
              className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition ${
                isListening
                  ? "bg-harvest text-harvest-foreground animate-glow-pulse"
                  : "bg-secondary text-muted-foreground hover:bg-muted"
              }`}
            >
              {isListening ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) handleSendMessage();
              }}
              placeholder={isListening ? "Listening..." : "Type in your language..."}
              disabled={isListening}
              className="h-10 flex-1 px-3 rounded-xl border border-border bg-background text-sm focus:border-primary focus:outline-none"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !input.trim()}
              className="h-10 w-10 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary-glow transition disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
