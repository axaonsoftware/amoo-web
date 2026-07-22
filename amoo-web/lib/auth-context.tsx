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
  kind: "user" | "admin";
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  loginUser: (token: string, userData: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem("amoo_token") ||
      localStorage.getItem("amoo_admin_token");
    if (!token) {
      setLoading(false);
      return;
    }
    const kind = localStorage.getItem("amoo_admin_token") ? "admin" : "user";
    api
      .me()
      .then((res) => {
        const u = res?.user || res?.data?.data || res?.data;
        if (u) {
          setUser({ ...u, kind });
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        localStorage.removeItem("amoo_token");
        localStorage.removeItem("amoo_admin_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const loginUser = useCallback((token: string, userData: User) => {
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("amoo_token");
    localStorage.removeItem("amoo_admin_token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin: user?.kind === "admin", isAuthenticated: !!user, loginUser, logout }}
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
