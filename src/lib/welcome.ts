import type { Role } from "./auth-context";

type WelcomeIntent = {
  role: Role;
  mode: "signin" | "signup";
  name?: string;
};

const KEY = "krishi-welcome";

export function setWelcomeIntent(intent: WelcomeIntent) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(intent));
}

export function consumeWelcomeIntent(): WelcomeIntent | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(KEY);
  sessionStorage.removeItem(KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as WelcomeIntent;
  } catch {
    return null;
  }
}
