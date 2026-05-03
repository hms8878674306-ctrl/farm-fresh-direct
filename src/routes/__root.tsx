import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { Header } from "@/components/Header";
import { SploshSlogan } from "@/components/SploshSlogan";
import { AuthProvider } from "@/lib/auth-context";
import { AuthGate } from "@/components/AuthGate";
import { useEffect } from "react";
import { seedIfEmpty } from "@/lib/seed";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="display text-7xl font-extrabold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">This patch of the farm doesn't exist.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-glow">Back home</Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "KrishiDirect — Freshness Direct From Farm" },
      { name: "description", content: "Buy fresh produce directly from local farmers. No middlemen. Same-day delivery, COD available." },
      { property: "og:title", content: "KrishiDirect — Freshness Direct From Farm" },
      { property: "og:description", content: "Farm-to-table marketplace connecting farmers and consumers." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  useEffect(() => { seedIfEmpty(); }, []);
  return (
    <AuthProvider>
      <AuthGate>
        <SploshSlogan />
        <Header />
        <Outlet />
        <footer className="border-t border-border mt-20 py-8 text-center text-sm text-muted-foreground">
          <div className="display text-lg font-bold text-foreground">Krishi<span className="text-primary">Direct</span></div>
          <p className="mt-1">Freshness Direct From Farm. Built with ❤️ for farmers.</p>
        </footer>
      </AuthGate>
    </AuthProvider>
  );
}
