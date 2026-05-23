import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
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
import { setWelcomeIntent } from "@/lib/welcome";
import type { Role } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Sign in — KrishiDirect" }],
  }),
  component: Login,
});

function Login() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const redirectUser = async (uid: string, fallbackName = "") => {
    try {
      const userRef = doc(db, "users", uid);

      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();

        console.log("USER DATA:", data);

        const role: Role = data.role === "farmer" ? "farmer" : "consumer";
        setWelcomeIntent({ role, mode: "signin", name: data.name || fallbackName || data.email || "" });
        window.location.href = "/";

      } else {
        console.log("No user document found");

        window.location.href = "/";
      }

    } catch (e) {
      console.error(e);
    }
  };

  const submit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setErr("");
    setBusy(true);

    try {
      const result =
        await signInWithEmailAndPassword(
          auth,
          email,
          pw
        );

      console.log(
        "Logged in UID:",
        result.user.uid
      );

      await redirectUser(result.user.uid, result.user.displayName || email);

    } catch (e: any) {
      console.error(e);

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

      const userRef = doc(
        db,
        "users",
        result.user.uid
      );

      const userSnap =
        await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: result.user.uid,
          name: result.user.displayName,
          email: result.user.email,
          role: "consumer",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      await redirectUser(result.user.uid, result.user.displayName || result.user.email || "");

    } catch (e: any) {
      console.error(e);

      setErr(e.message);

    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="text-center mb-8">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-fresh shadow-glow mb-3">
          <Leaf className="h-7 w-7 text-primary-foreground" />
        </div>

        <h1 className="display text-3xl font-extrabold">
          {t.welcomeBackLogin}
        </h1>

        <p className="text-sm text-muted-foreground">
          {t.signInToKrishi}
        </p>
      </div>

      <form
        onSubmit={submit}
        className="rounded-2xl bg-card border border-border p-6 space-y-3"
      >
        <input
          required
          type="email"
          placeholder={t.email}
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:outline-none"
        />

        <input
          required
          type="password"
          placeholder={t.password}
          value={pw}
          onChange={(e) =>
            setPw(e.target.value)
          }
          className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary focus:outline-none"
        />

        {err && (
          <p className="text-xs text-destructive">
            {err}
          </p>
        )}

        <button
          disabled={busy}
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50"
        >
          {busy
            ? t.signingIn
            : t.signIn}
        </button>

        <div className="relative my-2">
          <div className="border-t border-border" />

          <span className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-card px-2 text-xs text-muted-foreground">
            {t.orDivider}
          </span>
        </div>

        <button
          type="button"
          onClick={google}
          disabled={busy}
          className="w-full h-11 rounded-xl border border-border font-semibold hover:bg-muted flex items-center justify-center gap-2"
        >
          {t.continueGoogle}
        </button>

        <p className="text-center text-sm text-muted-foreground pt-2">
          {t.newHere}{" "}
          <Link
            to="/signup"
            className="text-primary font-semibold"
          >
            {t.createAccount}
          </Link>
        </p>
      </form>
    </main>
  );
}
