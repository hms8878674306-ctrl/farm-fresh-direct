import { Link, useLocation } from "@tanstack/react-router";
import { ShoppingCart, Leaf, MessageCircle, LayoutDashboard, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { useCart, cartCount } from "@/lib/cart-store";
import { useState, useEffect } from "react";
import { CartDrawer } from "./CartDrawer";
import { VoiceSearch } from "./VoiceSearch";
import { useAuth } from "@/lib/auth-context";

export function Header() {
  const s = useCart();
  const count = cartCount(s);
  const [openCart, setOpenCart] = useState(false);
  const [bumped, setBumped] = useState(false);
  const loc = useLocation();
  const { user, signOut } = useAuth();

  useEffect(() => { if (count > 0) { setBumped(true); const t = setTimeout(() => setBumped(false), 400); return () => clearTimeout(t); } }, [count]);

  const linkCls = (path: string) =>
    `text-sm font-medium transition-colors ${loc.pathname === path ? "text-primary" : "text-muted-foreground hover:text-foreground"}`;

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
            <Link to="/" className={linkCls("/")}>Home</Link>
            <Link to="/shop" className={linkCls("/shop")}>Shop</Link>
            <Link to="/farmers" className={linkCls("/farmers")}>Farmers</Link>
            <Link to="/track" className={linkCls("/track")}>Track</Link>
            <Link to="/dashboard" className={linkCls("/dashboard")}>Dashboard</Link>
          </nav>

          <div className="flex items-center gap-2">
            <VoiceSearch />
            <Link to="/chat" className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition" aria-label="Chat">
              <MessageCircle className="h-5 w-5" />
            </Link>
            <Link to="/dashboard" className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-muted">
              <LayoutDashboard className="h-5 w-5" />
            </Link>
            {user ? (
              <button onClick={() => signOut()} title={user.email || "Sign out"}
                className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted" aria-label="Sign out">
                <LogOut className="h-5 w-5" />
              </button>
            ) : (
              <Link to="/login" className="hidden sm:inline-flex h-10 px-4 items-center gap-2 rounded-full border border-border hover:bg-muted text-sm font-semibold">
                <LogIn className="h-4 w-4" /> Sign in
              </Link>
            )}
            <button
              onClick={() => setOpenCart(true)}
              className={`relative h-10 px-4 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-soft transition ${bumped ? "animate-bounce-in" : ""}`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 && (
                <span className="ml-1 inline-flex h-6 min-w-6 px-1.5 items-center justify-center rounded-full bg-harvest text-harvest-foreground text-xs font-bold">{count}</span>
              )}
            </button>
          </div>
        </div>
      </header>
      <CartDrawer open={openCart} onClose={() => setOpenCart(false)} />
    </>
  );
}
