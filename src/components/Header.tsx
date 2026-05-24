import { Link, useLocation } from "@tanstack/react-router";
import { ClipboardList, Languages, LayoutDashboard, Leaf, LogIn, LogOut, MessageCircle, PackageSearch, ShoppingCart, Store } from "lucide-react";
import { useCart, cartCount } from "@/lib/cart-store";
import { useState, useEffect } from "react";
import { CartDrawer } from "./CartDrawer";
import { VoiceSearch } from "./VoiceSearch";
import { useAuth } from "@/lib/auth-context";
import { INDIAN_LANGUAGES } from "@/lib/i18n/languages";
import { useLanguage, type Language } from "@/lib/language-context";

export function Header() {
  const s = useCart();
  const count = cartCount(s);
  const [openCart, setOpenCart] = useState(false);
  const [bumped, setBumped] = useState(false);
  const loc = useLocation();
  const { user, role, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const isFarmer = role === "farmer";

  useEffect(() => { if (count > 0) { setBumped(true); const t = setTimeout(() => setBumped(false), 400); return () => clearTimeout(t); } }, [count]);

  const linkCls = (path: string) =>
    `text-sm font-medium transition-colors ${loc.pathname === path ? "text-primary" : "text-muted-foreground hover:text-foreground"}`;
  const dashboardPath = isFarmer ? "/farmer-dashboard" : "/dashboard";

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-fresh shadow-glow">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="display text-xl font-extrabold tracking-tight">
              Krishi<span className="text-primary">Direct</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            <Link to="/" className={linkCls("/")}>{t.home}</Link>
            {isFarmer ? (
              <>
                <Link to="/farmer-dashboard" className={linkCls("/farmer-dashboard")}>{t.farmerDashboard}</Link>
                <Link to="/farmer-dashboard" search={{ section: "listings", add: true }} className={linkCls("/farmer-dashboard")}>{t.listings}</Link>
                <Link to="/track" className={linkCls("/track")}>{t.orders}</Link>
                <Link to="/chat" search={{ farmerId: "f1" }} className={linkCls("/chat")}>{t.chat}</Link>
              </>
            ) : (
              <>
                <Link to="/shop" search={{ q: "" }} className={linkCls("/shop")}>{t.shop}</Link>
                <Link to="/farmers" className={linkCls("/farmers")}>{t.farmers}</Link>
                <Link to="/track" className={linkCls("/track")}>{t.track}</Link>
                <Link to="/dashboard" className={linkCls("/dashboard")}>{t.dashboard}</Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {!isFarmer && <VoiceSearch />}
            <div className="hidden lg:inline-flex h-10 items-center gap-1 rounded-full border border-border bg-card px-3 text-xs font-semibold text-muted-foreground">
              {isFarmer ? <Store className="h-4 w-4 text-primary" /> : <ShoppingCart className="h-4 w-4 text-primary" />}
              {isFarmer ? t.farmerMode : t.consumerMode}
            </div>
            <label className="inline-flex h-10 items-center gap-1 rounded-full border border-border bg-card px-2 text-sm">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">{t.language}</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="max-w-[7.5rem] bg-transparent text-xs font-semibold outline-none"
                aria-label={t.language}
              >
                {INDIAN_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeLabel}
                  </option>
                ))}
              </select>
            </label>
            <Link to="/chat" search={{ farmerId: "f1" }} className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition" aria-label={t.chat}>
              <MessageCircle className="h-5 w-5" />
            </Link>
            <Link to={dashboardPath} className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-muted">
              {isFarmer ? <PackageSearch className="h-5 w-5" /> : <LayoutDashboard className="h-5 w-5" />}
            </Link>
            {user ? (
              <button onClick={() => signOut()} title={user.email || t.signOut}
                className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted" aria-label={t.signOut}>
                <LogOut className="h-5 w-5" />
              </button>
            ) : (
              <Link to="/login" className="hidden sm:inline-flex h-10 px-4 items-center gap-2 rounded-full border border-border hover:bg-muted text-sm font-semibold">
                <LogIn className="h-4 w-4" /> {t.signIn}
              </Link>
            )}
            {isFarmer ? (
              <Link
                to="/farmer-dashboard"
                search={{ section: "listings", add: true }}
                className="relative h-10 px-4 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-soft transition"
              >
                <ClipboardList className="h-4 w-4" />
                <span className="hidden sm:inline">{t.listings}</span>
              </Link>
            ) : (
              <button
                onClick={() => setOpenCart(true)}
                className={`relative h-10 px-4 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-soft transition ${bumped ? "animate-bounce-in" : ""}`}
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">{t.cart}</span>
                {count > 0 && (
                  <span className="ml-1 inline-flex h-6 min-w-6 px-1.5 items-center justify-center rounded-full bg-harvest text-harvest-foreground text-xs font-bold">{count}</span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>
      {!isFarmer && <CartDrawer open={openCart} onClose={() => setOpenCart(false)} />}
    </>
  );
}
