import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const SESSION_COOKIE = "nexus_auth_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Simple token generation (for password mode)
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Timing-safe string comparison
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// In-memory session store (for password mode)
// In production, use Redis or database
const sessions = new Map<string, { expiresAt: number }>();

/**
 * POST /api/auth - Login
 */
export async function POST(request: NextRequest) {
  const config = getConfig();
  const authMode = config.auth.mode;

  if (authMode === "none") {
    return NextResponse.json({ success: true, message: "No auth required" });
  }

  try {
    const body = await request.json();

    if (authMode === "password") {
      const { password } = body;
      const envPassword = process.env.NEXUS_PASSWORD;

      if (!envPassword) {
        return NextResponse.json(
          { success: false, error: "Server not configured for password auth" },
          { status: 500 }
        );
      }

      if (!password || !timingSafeEqual(password, envPassword)) {
        return NextResponse.json(
          { success: false, error: "Invalid password" },
          { status: 401 }
        );
      }

      // Generate session token
      const token = generateToken();
      const expiresAt = Date.now() + SESSION_DURATION;
      sessions.set(token, { expiresAt });

      // Set cookie
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_DURATION / 1000,
        path: "/",
      });

      return NextResponse.json({
        success: true,
        user: { id: "password-user" },
        expiresAt,
      });
    }

    if (authMode === "supabase") {
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: "Email and password required" },
          { status: 400 }
        );
      }

      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user: { id: data.user.id, email: data.user.email },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid auth mode" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}

/**
 * GET /api/auth - Check session
 */
export async function GET() {
  const config = getConfig();
  const authMode = config.auth.mode;

  if (authMode === "none") {
    return NextResponse.json({
      authenticated: true,
      authMode: "none",
      user: null,
    });
  }

  if (authMode === "password") {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({
        authenticated: false,
        authMode: "password",
        user: null,
      });
    }

    const session = sessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
      sessions.delete(token);
      return NextResponse.json({
        authenticated: false,
        authMode: "password",
        user: null,
      });
    }

    return NextResponse.json({
      authenticated: true,
      authMode: "password",
      user: { id: "password-user" },
    });
  }

  if (authMode === "supabase") {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({
        authenticated: false,
        authMode: "supabase",
        user: null,
      });
    }

    return NextResponse.json({
      authenticated: true,
      authMode: "supabase",
      user: { id: user.id, email: user.email },
    });
  }

  return NextResponse.json({
    authenticated: false,
    authMode,
    user: null,
  });
}

/**
 * DELETE /api/auth - Logout
 */
export async function DELETE() {
  const config = getConfig();
  const authMode = config.auth.mode;

  if (authMode === "password") {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (token) {
      sessions.delete(token);
    }

    cookieStore.delete(SESSION_COOKIE);
  }

  if (authMode === "supabase") {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  return NextResponse.json({ success: true });
}
