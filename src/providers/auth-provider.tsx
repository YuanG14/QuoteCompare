"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "configuration-missing";

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() =>
    isFirebaseConfigured() ? "loading" : "configuration-missing",
  );

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
      setUser(nextUser);
      setStatus(nextUser ? "authenticated" : "unauthenticated");
    });

    return unsubscribe;
  }, []);

  const value = useMemo(() => ({ user, status }), [user, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
