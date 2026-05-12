import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Leaf, Store, X } from "lucide-react";
import { consumeWelcomeIntent } from "@/lib/welcome";
import type { Role } from "@/lib/auth-context";

type WelcomeState = {
  role: Role;
  mode: "signin" | "signup";
  name?: string;
};

export function WelcomeOverlay() {
  const [welcome, setWelcome] = useState<WelcomeState | null>(null);
  const consumedRef = useRef(false);

  useEffect(() => {
    if (consumedRef.current) return;
    consumedRef.current = true;

    const intent = consumeWelcomeIntent();
    if (!intent) return;

    setWelcome(intent);
  }, []);

  useEffect(() => {
    if (!welcome) return;

    const dismiss = () => setWelcome(null);
    const timer = window.setTimeout(dismiss, 2500);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };

    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      window.clearTimeout(timer);
    };
  }, [welcome]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const dismiss = () => setWelcome(null);

  useEffect(() => {
    const backupTimer = window.setTimeout(dismiss, 5000);
    return () => window.clearTimeout(backupTimer);
  }, []);

  if (!welcome) return null;

  const isFarmer = welcome.role === "farmer";
  const Icon = isFarmer ? Store : Leaf;
  const title = welcome.mode === "signup" ? "Welcome to KrishiDirect" : "Welcome back";
  const subtitle = isFarmer
    ? "Your farmer workspace is ready for listings, buyer offers, and orders."
    : "Your fresh market is ready with local produce and farm-direct deals.";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/75 px-4 backdrop-blur-md animate-soft-fade"
      onClick={dismiss}
      role="presentation"
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 text-center shadow-glow animate-welcome-pop"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close welcome"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl gradient-fresh">
          <Icon className="h-8 w-8 text-primary-foreground" />
        </div>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-fresh/15 px-3 py-1 text-xs font-bold text-primary">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {isFarmer ? "Farmer mode" : "Consumer mode"}
        </div>
        <h2 className="display mt-3 text-3xl font-extrabold">{title}</h2>
        {welcome.name && <p className="mt-1 text-sm font-semibold">{welcome.name}</p>}
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{subtitle}</p>
        <button
          type="button"
          onClick={dismiss}
          className="mt-5 h-11 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground hover:bg-primary-glow"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
