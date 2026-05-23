import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language-context";

export function SploshSlogan() {
  const { t } = useLanguage();
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("krishi-splash")) { setGone(true); return; }
    sessionStorage.setItem("krishi-splash", "1");
    const timer = setTimeout(() => setGone(true), 2700);
    return () => clearTimeout(timer);
  }, []);
  if (gone) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary text-primary-foreground animate-splash-out">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 text-6xl animate-float-up">🌾</div>
        <div className="absolute top-20 right-16 text-5xl animate-float-side">🥭</div>
        <div className="absolute bottom-20 left-20 text-5xl animate-float-up" style={{ animationDelay: "0.4s" }}>🍅</div>
        <div className="absolute bottom-32 right-24 text-6xl animate-float-side" style={{ animationDelay: "0.8s" }}>🥬</div>
      </div>
      <div className="relative text-center px-6">
        <div className="text-sm tracking-[0.4em] uppercase opacity-80 mb-4">KrishiDirect</div>
        <h1 className="display text-5xl md:text-7xl font-extrabold animate-slogan">
          {t.heroTitleA} <span className="shimmer-text">{t.heroTitleB}</span>
        </h1>
      </div>
    </div>
  );
}
