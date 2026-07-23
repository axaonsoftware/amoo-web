"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "./api";

export type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatar?: string;
  kind: "user" | "admin" | "expert";
  verified?: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isExpert: boolean;
  isAuthenticated: boolean;
  loginUser: (userData: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api
      .me()
      .then((res) => {
        const u = res?.user || res?.data?.data || res?.data;
        if (u) {
          const kind = res?.kind || (res?.data?.kind) || "user";
          setUser({ ...u, kind });
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const loginUser = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    const wasExpert = user?.kind === "expert";
    api.logout().catch(() => {});
    setUser(null);
    router.push(wasExpert ? "/astrologer-login" : "/user-login");
  }, [router, user]);

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin: user?.kind === "admin", isExpert: user?.kind === "expert", isAuthenticated: !!user, loginUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/user-login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) return null;
  if (!isAuthenticated) return null;
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/admin-login");
    }
  }, [loading, isAdmin, router]);

  if (loading) return null;
  if (!isAdmin) return null;
  return <>{children}</>;
}

export function RequireExpert({ children, fallbackPath = "/" }: { children: React.ReactNode; fallbackPath?: string }) {
  const { isExpert, isAdmin, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/astrologer-login");
    } else if (!isExpert && !isAdmin) {
      // Regular users hitting an expert-only route get sent home
      router.replace(fallbackPath);
    }
  }, [loading, isAuthenticated, isExpert, isAdmin, router, fallbackPath]);

  if (loading) return null;
  if (!isAuthenticated) return null;
  if (!isExpert && !isAdmin) return null;
  return <>{children}</>;
}
