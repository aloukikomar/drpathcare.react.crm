"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface User {
  id: number;
  email: string;
  mobile: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  checkSession: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false); // track client mount

  useEffect(() => {
    // Only run on client
    const storedUser = localStorage.getItem("user");
    const storedAccess = localStorage.getItem("accessToken");
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedAccess) setAccessToken(storedAccess);
    setMounted(true); // client mounted
    setIsLoading(false);
  }, []);

  const login = (user: User, accessToken: string, refreshToken: string) => {
    setUser(user);
    setAccessToken(accessToken);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const checkSession = async () => {
    setIsLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      const storedAccess = localStorage.getItem("accessToken");
      if (storedUser && storedAccess) {
        setUser(JSON.parse(storedUser));
        setAccessToken(storedAccess);
      } else {
        setUser(null);
        setAccessToken(null);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setUser(null);
      setAccessToken(null);
    }
    setIsLoading(false);
  };

  // Prevent server/client mismatch
  if (!mounted) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout, checkSession, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
