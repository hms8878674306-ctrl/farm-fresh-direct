import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { Header } from "@/components/Header";
import { SploshSlogan } from "@/components/SploshSlogan";
import { AuthProvider } from "@/lib/auth-context";
import { AuthGate } from "@/components/AuthGate";
import { useEffect } from "react";
import { hideLovableBadge } from "@/lib/hide-lovable-badge";
import { seedIfEmpty } from "@/lib/seed";
import { LanguageProvider } from "@/lib/language-context";
import { useLanguage } from "@/lib/language-context";
import { WelcomeOverlay } from "@/components/WelcomeOverlay";
import { KrishiAiChatbot } from "@/components/KrishiAiChatbot";

function NotFoundComponent() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="display text-7xl font-extrabold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">{t.notFoundTitle}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t.notFoundCopy}</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-glow"
        >
          {t.backHome}
        </Link>
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
      {
        name: "description",
        content:
          "Buy fresh produce directly from local farmers. No middlemen. Same-day delivery, COD available.",
      },
      { property: "og:title", content: "KrishiDirect — Freshness Direct From Farm" },
      {
        property: "og:description",
        content:
          "Buy fresh produce directly from local farmers. No middlemen. Same-day delivery, COD available.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "KrishiDirect — Freshness Direct From Farm" },
      {
        name: "twitter:description",
        content:
          "Buy fresh produce directly from local farmers. No middlemen. Same-day delivery, COD available.",
      },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/6de43b92-72c1-4bb6-a2d8-fb5c72a6473c",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/6de43b92-72c1-4bb6-a2d8-fb5c72a6473c",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  useEffect(() => {
    seedIfEmpty();
    return hideLovableBadge();
  }, []);
  return (
    <AuthProvider>
      <LanguageProvider>
        <AuthGate>
          <div id="google_translate_element" className="sr-only" aria-hidden="true" />
          <SploshSlogan />
          <Header />
          <WelcomeOverlay />
          <Outlet />
          <Footer />
          <KrishiAiChatbot />
        </AuthGate>
      </LanguageProvider>
    </AuthProvider>
  );
}

function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border mt-20 py-8 text-center text-sm text-muted-foreground">
      <div className="display text-lg font-bold text-foreground">
        Krishi<span className="text-primary">Direct</span>
      </div>
      <p className="mt-1">
        {t.heroTitleA} {t.heroTitleB}
      </p>
      <p className="mt-2 font-bold text-primary">{t.tollFree}</p>
    </footer>
  );
}
