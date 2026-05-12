import { useState } from "react";
import { Leaf, Sprout, ShoppingBasket } from "lucide-react";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { useAuth, type Role } from "@/lib/auth-context";
import { setWelcomeIntent } from "@/lib/welcome";

export default function LoginPanel() {
  const { role, setRole } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const openHome = (userRole: Role, mode: "signin" | "signup", userName?: string) => {
    setWelcomeIntent({ role: userRole, mode, name: userName });
    window.location.href = "/";
  };

  const saveUserDoc = async (uid: string, userName: string, userEmail: string, userRole: Role) => {
    const userRef = doc(db, "users", uid);

    await setDoc(
      userRef,
      {
        uid,
        name: userName,
        email: userEmail,
        role: userRole,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    const snap = await getDoc(userRef);
    if (!snap.exists() || snap.data().role !== userRole) {
      throw new Error("Firestore user role was not saved. Check Firestore rules.");
    }
  };

  const getSavedRole = async (uid: string, fallbackRole: Role) => {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    const savedRole = snap.exists() ? snap.data().role : undefined;

    if (savedRole === "consumer" || savedRole === "farmer") {
      return savedRole;
    }

    return fallbackRole;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      if (mode === "signin") {
        const c = await signInWithEmailAndPassword(auth, email, pw);
        const savedRole = await getSavedRole(c.user.uid, role);
        setRole(savedRole);
        openHome(savedRole, "signin", c.user.displayName || email);
      } else {
        const c = await createUserWithEmailAndPassword(auth, email, pw);
        if (name) await updateProfile(c.user, { displayName: name });
        await saveUserDoc(c.user.uid, name, email, role);
        setRole(role);
        openHome(role, "signup", name || email);
      }
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };

  const google = async () => {
    setErr(""); setBusy(true);
    try {
      const c = await signInWithPopup(auth, googleProvider);
      const userRef = doc(db, "users", c.user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists() || mode === "signup") {
        await saveUserDoc(c.user.uid, c.user.displayName || "", c.user.email || "", role);
      }

      const savedRole = mode === "signup" ? role : await getSavedRole(c.user.uid, role);
      setRole(savedRole);
      openHome(savedRole, mode, c.user.displayName || c.user.email || "");
    }
    catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };

  const RoleBtn = ({ value, Icon, label, desc }: { value: Role; Icon: any; label: string; desc: string }) => (
    <button type="button" onClick={() => setRole(value)}
      className={`flex-1 text-left rounded-xl border-2 p-3 transition ${role === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
      <Icon className={`h-5 w-5 mb-1.5 ${role === value ? "text-primary" : "text-muted-foreground"}`} />
      <div className="font-bold text-sm">{label}</div>
      <div className="text-[11px] text-muted-foreground">{desc}</div>
    </button>
  );

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-fresh shadow-glow mb-3">
            <Leaf className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="display text-3xl font-extrabold">Krishi<span className="text-primary">Direct</span></h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to continue</p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
          {/* Role selector */}
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-2">I am a</div>
            <div className="flex gap-2">
              <RoleBtn value="consumer" Icon={ShoppingBasket} label="Consumer" desc="Buy fresh produce" />
              <RoleBtn value="farmer" Icon={Sprout} label="Farmer" desc="Sell my harvest" />
            </div>
          </div>

          {/* Mode tabs */}
          <div className="flex rounded-xl bg-secondary p-1">
            {(["signin", "signup"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} type="button"
                className={`flex-1 h-9 rounded-lg text-sm font-bold transition ${mode === m ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
                {m === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:outline-none" />
            )}
            <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:outline-none" />
            <input required type="password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:outline-none" />
            {err && <p className="text-xs text-destructive">{err}</p>}
            <button disabled={busy} className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50">
              {busy ? "Please wait…" : (mode === "signin" ? `Sign in as ${role}` : `Create ${role} account`)}
            </button>
          </form>

          <div className="relative"><div className="border-t border-border" /><span className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-card px-2 text-xs text-muted-foreground">or</span></div>

          <button type="button" onClick={google} disabled={busy}
            className="w-full h-11 rounded-xl border border-border font-semibold hover:bg-muted flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34.1 7.1 29.3 5 24 5 16.3 5 9.6 9.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C41 35.1 44 30 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
            Continue with Google
          </button>
        </div>
      </div>
    </main>
  );
}
