import React, { createContext, useEffect, useState } from "react";
import { auth } from "./firebase";

interface AuthCtx {
  token: string | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthCtx>({ token: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onIdTokenChanged(async (user) => {
      if (user) {
        const t = await user.getIdToken(true);
        localStorage.setItem("token", t);
        setToken(t);
      } else {
        localStorage.removeItem("token");
        setToken(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ token, loading }}>{children}</AuthContext.Provider>
  );
}; 