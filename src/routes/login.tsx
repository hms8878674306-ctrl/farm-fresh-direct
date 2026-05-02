import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Leaf } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — KrishiDirect" }] }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      nav({ to: "/" });
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };

  const google = async () => {
    setErr(""); setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
      nav({ to: "/" });
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="text-center mb-8">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-fresh shadow-glow mb-3">
          <Leaf className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="display text-3xl font-extrabold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to KrishiDirect</p>
      </div>

      <form onSubmit={submit} className="rounded-2xl bg-card border border-border p-6 space-y-3">
        <input required type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}
          className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:outline-none" />
        <input required type="password" placeholder="Password" value={pw} onChange={e=>setPw(e.target.value)}
          className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:outline-none" />
        {err && <p className="text-xs text-destructive">{err}</p>}
        <button disabled={busy} className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50">
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <div className="relative my-2"><div className="border-t border-border" /><span className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-card px-2 text-xs text-muted-foreground">or</span></div>

        <button type="button" onClick={google} disabled={busy}
          className="w-full h-11 rounded-xl border border-border font-semibold hover:bg-muted flex items-center justify-center gap-2">
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34.1 7.1 29.3 5 24 5 16.3 5 9.6 9.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C41 35.1 44 30 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
          Continue with Google
        </button>

        <p className="text-center text-sm text-muted-foreground pt-2">
          New here? <Link to="/signup" className="text-primary font-semibold">Create account</Link>
        </p>
      </form>
    </main>
  );
}
