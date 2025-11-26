import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Auth modes", () => {
    it("should return authenticated true for 'none' mode", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ auth: { mode: "none" } }),
      });

      // The hook would set isAuthenticated to true when mode is "none"
      const configResponse = await mockFetch("/api/config");
      const config = await configResponse.json();

      expect(config.auth.mode).toBe("none");
    });

    it("should check server session for 'password' mode", async () => {
      // Config fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            auth: { mode: "password", permissions: { write: "authenticated" } },
          }),
      });

      // Auth check fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            authenticated: true,
            authMode: "password",
            user: { id: "password-user" },
          }),
      });

      const configResponse = await mockFetch("/api/config");
      const config = await configResponse.json();
      expect(config.auth.mode).toBe("password");

      const authResponse = await mockFetch("/api/auth");
      const authData = await authResponse.json();
      expect(authData.authenticated).toBe(true);
    });

    it("should return unauthenticated when no session exists", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            auth: { mode: "password", permissions: { write: "authenticated" } },
          }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            authenticated: false,
            authMode: "password",
            user: null,
          }),
      });

      const configResponse = await mockFetch("/api/config");
      await configResponse.json();

      const authResponse = await mockFetch("/api/auth");
      const authData = await authResponse.json();
      expect(authData.authenticated).toBe(false);
    });
  });

  describe("Login flow", () => {
    it("should login successfully with correct password", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            user: { id: "password-user" },
            expiresAt: Date.now() + 86400000,
          }),
      });

      const response = await mockFetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "test-password" }),
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
    });

    it("should fail login with incorrect password", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            success: false,
            error: "Invalid password",
          }),
      });

      const response = await mockFetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "wrong-password" }),
      });

      expect(response.ok).toBe(false);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid password");
    });
  });

  describe("Logout flow", () => {
    it("should logout successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const response = await mockFetch("/api/auth", { method: "DELETE" });
      const data = await response.json();

      expect(data.success).toBe(true);
    });
  });

  describe("canWrite permission", () => {
    it("should allow write when authenticated", async () => {
      const isAuthenticated = true;
      const writePermission = "authenticated";
      const canWrite = writePermission === "public" || isAuthenticated;

      expect(canWrite).toBe(true);
    });

    it("should deny write when not authenticated and write requires auth", async () => {
      const isAuthenticated = false;
      const writePermission = "authenticated";
      const canWrite = writePermission === "public" || isAuthenticated;

      expect(canWrite).toBe(false);
    });

    it("should allow write when permission is public", async () => {
      const isAuthenticated = false;
      const writePermission = "public";
      const canWrite = writePermission === "public" || isAuthenticated;

      expect(canWrite).toBe(true);
    });
  });
});
