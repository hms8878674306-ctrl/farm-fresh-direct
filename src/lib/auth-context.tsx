import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut as fbSignOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export type Role = "consumer" | "farmer";
type Ctx = {
  user: User | null;
  loading: boolean;
  role: Role;
  setRole: (r: Role) => void;
  signOut: () => Promise<void>;
};
const AuthCtx = createContext<Ctx>({
  user: null, loading: true, role: "consumer", setRole: () => {}, signOut: async () => {},
});

const isRole = (value: unknown): value is Role => value === "consumer" || value === "farmer";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRoleState] = useState<Role>("consumer");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) {
        setRoleState("consumer");
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", u.uid);
        const snap = await getDoc(userRef);
        const savedRole = snap.exists() ? snap.data().role : undefined;
        const nextRole = isRole(savedRole) ? savedRole : "consumer";

        setRoleState(nextRole);
        if (typeof window !== "undefined") localStorage.setItem("krishi-role", nextRole);
      } catch (error) {
        console.error("Failed to load user role:", error);
        setRoleState("consumer");
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    if (typeof window !== "undefined") localStorage.setItem("krishi-role", r);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, role, setRole, signOut: () => fbSignOut(auth) }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
