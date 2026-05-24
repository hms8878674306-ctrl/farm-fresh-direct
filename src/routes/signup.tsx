import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  auth,
  googleProvider,
  db,
} from "@/lib/firebase";

import { Leaf } from "lucide-react";
import { LanguageSelect } from "@/components/LanguageSelect";
import { PriceTicker } from "@/components/PriceTicker";
import { useAuth, type Role } from "@/lib/auth-context";
import { setWelcomeIntent } from "@/lib/welcome";
import { useLanguage } from "@/lib/language-context";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [{ title: "Sign up — KrishiDirect" }],
  }),
  component: Signup,
});

function Signup() {
  const { t } = useLanguage();
  const nav = useNavigate();
  const { setRole: setAuthRole } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  const [role, setRole] = useState<Role>("consumer");

  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const saveUserToFirestore = async (
    uid: string,
    userName: string,
    userEmail: string,
    userRole: Role
  ) => {
    try {
      console.log("STARTING FIRESTORE SAVE");
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

      console.log("FIRESTORE SAVE SUCCESS");

      return true;

    } catch (error) {
      console.log("FIRESTORE SAVE ERROR:", error);
      return false;
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErr("");
    setBusy(true);

    try {
      const result =
        await createUserWithEmailAndPassword(
          auth,
          email,
          pw
        );

      if (name) {
        await updateProfile(result.user, {
          displayName: name,
        });
      }

      const saved = await saveUserToFirestore(
        result.user.uid,
        name,
        email,
        role
      );

      if (!saved) {
        setErr(t.firestoreFailed);
        return;
      }

      console.log("ROLE SELECTED:", role);
      setAuthRole(role);
      setWelcomeIntent({ role, mode: "signup", name: name || email });
      nav({ to: "/" });

    } catch (e: any) {
      console.log("SIGNUP ERROR:", e);
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setErr("");
    setBusy(true);

    try {
      const result =
        await signInWithPopup(
          auth,
          googleProvider
        );

      const saved = await saveUserToFirestore(
        result.user.uid,
        result.user.displayName || "",
        result.user.email || "",
        role
      );

      if (!saved) {
        setErr(t.firestoreFailed);
        return;
      }

      console.log("ROLE SELECTED:", role);
      setAuthRole(role);
      setWelcomeIntent({ role, mode: "signup", name: result.user.displayName || result.user.email || "" });
      nav({ to: "/" });

    } catch (e: any) {
      console.log("GOOGLE ERROR:", e);
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-20 md:top-6 md:right-8">
        <LanguageSelect />
      </div>
      <PriceTicker />
      <main className="mx-auto max-w-md px-4 py-16">
      <div className="text-center mb-8">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-fresh shadow-glow mb-3">
          <Leaf className="h-7 w-7 text-primary-foreground" />
        </div>

        <h1 className="display text-3xl font-extrabold">
          {t.joinKrishi}
        </h1>

        <p className="text-sm text-muted-foreground">
          {t.signupTagline}
        </p>
      </div>

      <form
        onSubmit={submit}
        className="rounded-2xl bg-card border border-border p-6 space-y-3"
      >
        <input
          placeholder={t.fullName}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:outline-none"
        />

        <input
          required
          type="email"
          placeholder={t.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:outline-none"
        />

        <input
          required
          type="password"
          placeholder={t.password}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:outline-none"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:outline-none"
        >
          <option value="consumer">
            {t.consumerRole}
          </option>

          <option value="farmer">
            {t.farmerRole}
          </option>
        </select>

        {err && (
          <p className="text-xs text-destructive">
            {err}
          </p>
        )}

        <button
          disabled={busy}
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50"
        >
          {busy ? t.creatingAccount : t.createAccount}
        </button>

        <button
          type="button"
          onClick={google}
          disabled={busy}
          className="w-full h-11 rounded-xl border border-border font-semibold hover:bg-muted"
        >
          {t.continueGoogle}
        </button>

        <p className="text-center text-sm text-muted-foreground pt-2">
          {t.alreadyHaveAccount}{" "}
          <Link
            to="/login"
            className="text-primary font-semibold"
          >
            {t.signIn}
          </Link>
        </p>
      </form>
    </main>
    </div>
  );
}
