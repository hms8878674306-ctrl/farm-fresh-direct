import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut as fbSignOut, type User } from "firebase/auth";
import { auth } from "./firebase";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRoleState] = useState<Role>("consumer");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const r = (localStorage.getItem("krishi-role") as Role) || "consumer";
      setRoleState(r);
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
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
