"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { auth as authApi, type User } from "@/lib/api";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (body: {
    firstName: string; lastName: string; email: string;
    password: string; phone?: string; role?: string; preferredLanguage?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  user: null, loading: true,
  login: async () => {}, register: async () => {}, logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem("accessToken", res.token);
    localStorage.setItem("refreshToken", res.refreshToken);
    setUser(res.user);
  }, []);

  const register = useCallback(async (body: Parameters<typeof authApi.register>[0]) => {
    const res = await authApi.register(body);
    localStorage.setItem("accessToken", res.token);
    localStorage.setItem("refreshToken", res.refreshToken);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
