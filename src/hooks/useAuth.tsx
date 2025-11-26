"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { AuthContextValue, AuthUser, LoginCredentials } from "@/types";
import { createClient } from "@/lib/supabase/client";

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authMode, setAuthMode] = useState<"none" | "password" | "supabase">(
    "none"
  );
  const [writePermission, setWritePermission] = useState<
    "authenticated" | "public"
  >("authenticated");

  // Create Supabase client once
  const supabase = createClient();

  // Check session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        // Fetch config to get auth mode
        const configRes = await fetch("/api/config");
        const config = await configRes.json();
        const mode = config.auth?.mode || "none";
        setAuthMode(mode);
        setWritePermission(config.auth?.permissions?.write || "authenticated");

        if (mode === "none") {
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        if (mode === "password") {
          // Check server session
          const authRes = await fetch("/api/auth");
          const authData = await authRes.json();
          setIsAuthenticated(authData.authenticated);
          setUser(authData.user || null);
          setIsLoading(false);
          return;
        }

        if (mode === "supabase") {
          // Check Supabase session using getUser() for security
          const {
            data: { user: supabaseUser },
            error,
          } = await supabase.auth.getUser();

          if (error) {
            console.error("Auth check error:", error);
            setIsAuthenticated(false);
            setUser(null);
          } else if (supabaseUser) {
            setIsAuthenticated(true);
            setUser({ id: supabaseUser.id, email: supabaseUser.email });
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [supabase.auth]);

  // Listen for Supabase auth changes
  useEffect(() => {
    if (authMode !== "supabase") return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setIsAuthenticated(true);
        setUser({ id: session.user.id, email: session.user.email });
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
        setUser(null);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        // Session was refreshed, update user if needed
        setUser({ id: session.user.id, email: session.user.email });
      }
    });

    return () => subscription.unsubscribe();
  }, [authMode, supabase.auth]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      if (authMode === "none") {
        setIsAuthenticated(true);
        return;
      }

      if (authMode === "password") {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: credentials.password }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Login failed");
        }

        setIsAuthenticated(true);
        setUser(data.user || null);
        return;
      }

      if (authMode === "supabase") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email || "",
          password: credentials.password || "",
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.user) {
          setIsAuthenticated(true);
          setUser({ id: data.user.id, email: data.user.email });
        }
      }
    },
    [authMode, supabase.auth]
  );

  const logout = useCallback(async () => {
    if (authMode === "password") {
      await fetch("/api/auth", { method: "DELETE" });
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    if (authMode === "supabase") {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [authMode, supabase.auth]);

  // Determine if user can write
  const canWrite = writePermission === "public" || isAuthenticated;

  const value: AuthContextValue = {
    isAuthenticated,
    isLoading,
    user,
    authMode,
    canWrite,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider. " +
        "Wrap your component tree with <AuthProvider>."
    );
  }
  return context;
}
