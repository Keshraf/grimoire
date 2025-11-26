"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, authMode, login } = useAuth();
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already authenticated or auth mode is "none"
  useEffect(() => {
    if (!isLoading && (isAuthenticated || authMode === "none")) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, authMode, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (authMode === "password") {
        await login({ password });
      } else if (authMode === "supabase") {
        await login({ email, password });
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-[var(--color-text-muted)]">Loading...</div>
      </div>
    );
  }

  if (authMode === "none") {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <div className="w-full max-w-md p-8 rounded-lg bg-[var(--color-surface)] border border-white/10">
        <h1
          className="text-2xl font-semibold mb-6 text-center"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--color-text)",
          }}
        >
          Sign In
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === "supabase" && (
            <div>
              <label
                htmlFor="email"
                className="block text-sm mb-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[var(--color-background)] border border-white/20 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm mb-1"
              style={{ color: "var(--color-text-muted)" }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[var(--color-background)] border border-white/20 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 px-4 rounded font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-text)",
            }}
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
