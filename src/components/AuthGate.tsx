import { useAuth } from "@/lib/auth-context";
import { useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Leaf } from "lucide-react";
import LoginPanel from "./LoginPanel";

const PUBLIC_PATHS = new Set(["/login", "/signup"]);

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Leaf className="h-5 w-5 animate-pulse text-primary" /> Loading…
        </div>
      </div>
    );
  }

  if (!user && !PUBLIC_PATHS.has(loc.pathname)) {
    return <LoginPanel />;
  }
  return <>{children}</>;
}
