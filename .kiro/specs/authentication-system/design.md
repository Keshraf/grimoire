# Design Document: Authentication System

## Overview

The authentication system provides flexible access control for NEXUS, supporting three modes:

- **none**: No authentication required, all users have full access
- **password**: Single shared password for write access (simple deployments)
- **supabase**: Full user authentication via Supabase Auth (multi-user deployments)

The system integrates with the existing React Context pattern used by `useNavigation` and leverages React Query for any auth-related data fetching.

## Architecture

```mermaid
flowchart TB
    subgraph Client
        useAuth[useAuth Hook]
        AuthProvider[AuthProvider Context]
        LoginPage[/auth Page]
        Layout[Layout.tsx]
        Sidebar[Sidebar.tsx]
    end

    subgraph Server
        AuthAPI[/api/auth]
        NotesAPI[/api/notes]
    end

    subgraph Storage
        LocalStorage[localStorage/cookies]
        SupabaseAuth[Supabase Auth]
        EnvVars[NEXUS_PASSWORD]
    end

    useAuth --> AuthProvider
    LoginPage --> AuthAPI
    AuthAPI --> EnvVars
    AuthAPI --> SupabaseAuth
    AuthProvider --> LocalStorage
    AuthProvider --> SupabaseAuth
    Layout --> useAuth
    Sidebar --> useAuth
    NotesAPI --> AuthAPI
```

## Components and Interfaces

### 1. Auth Types (`src/types/index.ts`)

Extend existing types:

```typescript
export interface AuthUser {
  id: string;
  email?: string;
}

export interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  authMode: "none" | "password" | "supabase";
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export interface LoginCredentials {
  password?: string; // For password mode
  email?: string; // For supabase mode
}

export interface AuthSession {
  token: string;
  expiresAt: number;
}
```

### 2. Auth Hook (`src/hooks/useAuth.ts`)

Context-based hook following the `useNavigation` pattern:

```typescript
// AuthContext with Provider
// - Reads auth.mode from config (fetched via API or passed as prop)
// - For "none": Always returns isAuthenticated: true
// - For "password": Checks localStorage for valid session token
// - For "supabase": Uses Supabase client's onAuthStateChange

// Key functions:
// - login(credentials): Calls /api/auth POST, stores session
// - logout(): Clears session, calls /api/auth DELETE
// - checkSession(): Validates existing session on mount
```

### 3. Auth API (`src/app/api/auth/route.ts`)

Server-side authentication endpoint:

| Method | Purpose       | Request Body                            | Response                     |
| ------ | ------------- | --------------------------------------- | ---------------------------- |
| POST   | Login         | `{ password }` or `{ email, password }` | `{ success, token?, user? }` |
| DELETE | Logout        | -                                       | `{ success }`                |
| GET    | Check session | -                                       | `{ authenticated, user? }`   |

**Password Mode Flow:**

1. Compare submitted password with `process.env.NEXUS_PASSWORD`
2. Generate JWT or simple token with expiry
3. Return token to client

**Supabase Mode Flow:**

1. Delegate to Supabase Auth
2. Return Supabase session

### 4. Login Page (`src/app/auth/page.tsx`)

Client component with conditional rendering:

```typescript
// If auth.mode === "none": Redirect to "/"
// If auth.mode === "password": Show password form
// If auth.mode === "supabase": Show email/password form

// On successful login: redirect to "/" or returnUrl
// On error: Display error message
```

### 5. Auth-Aware Layout Updates

**Layout.tsx changes:**

- Wrap children with `AuthProvider`
- No direct auth checks (delegated to child components)

**Sidebar.tsx changes:**

- Conditionally render "New Note" button based on `isAuthenticated` and write permissions
- Show "Login" link when not authenticated
- Show "Logout" button when authenticated

### 6. Config API (`src/app/api/config/route.ts`)

New endpoint to expose safe config values to client:

```typescript
// GET /api/config
// Returns: { auth: { mode, permissions }, features, ... }
// Excludes: sensitive server-only values
```

## Data Models

### Session Storage

**Password Mode:**

```typescript
// localStorage key: "nexus_auth_session"
{
  token: string; // JWT or random token
  expiresAt: number; // Unix timestamp
}
```

**Supabase Mode:**

- Managed by `@supabase/supabase-js` client
- Uses Supabase's built-in session storage

### Token Structure (Password Mode)

Simple approach using signed tokens:

```typescript
// Server generates: base64(JSON.stringify({ exp: timestamp })) + "." + hmac
// Or use jose/jsonwebtoken for proper JWT
```

## Error Handling

| Scenario                   | HTTP Status | Client Behavior                  |
| -------------------------- | ----------- | -------------------------------- |
| Invalid password           | 401         | Show "Invalid password" error    |
| Session expired            | 401         | Clear session, redirect to /auth |
| Supabase auth error        | 401         | Show Supabase error message      |
| Missing NEXUS_PASSWORD env | 500         | Show configuration error         |
| Write without auth         | 401         | Show "Login required" message    |

## Testing Strategy

### Unit Tests

- `useAuth` hook: Test all three modes, login/logout flows
- Auth API: Test password validation, token generation
- Session management: Test expiry, persistence

### Integration Tests

- Full login flow for password mode
- Protected route access
- UI state changes based on auth

### Test Files

- `src/hooks/__tests__/useAuth.test.ts`
- `src/app/api/auth/__tests__/route.test.ts`

## Security Considerations

1. **Password Mode**:

   - Passwords compared using timing-safe comparison
   - Tokens have reasonable expiry (24h default)
   - HTTPS required in production

2. **Supabase Mode**:

   - Leverages Supabase's security features
   - Row-level security can be enabled

3. **General**:
   - No sensitive data in client-accessible config
   - API routes validate auth before mutations
