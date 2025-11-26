# Implementation Plan

- [x] 1. Add auth types and extend existing types

  - Add `AuthUser`, `AuthContextValue`, `LoginCredentials`, `AuthSession` interfaces to `src/types/index.ts`
  - _Requirements: 1.1_

- [x] 2. Create auth API endpoint

  - [x] 2.1 Create `/api/auth/route.ts` with POST handler for login
    - Validate password against `NEXUS_PASSWORD` env var for password mode
    - Generate session token with expiry
    - Return success/error response
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 2.2 Add GET handler for session validation
    - Verify token validity and expiry
    - Return authenticated status and user info
    - _Requirements: 2.4_
  - [x] 2.3 Add DELETE handler for logout
    - Clear server-side session if applicable
    - _Requirements: 2.5_

- [x] 3. Create config API endpoint

  - Create `/api/config/route.ts` to expose safe config values (auth mode, permissions, features)
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 4. Create useAuth hook with AuthProvider

  - [x] 4.1 Create `src/hooks/useAuth.ts` with AuthContext and AuthProvider
    - Implement context following `useNavigation` pattern
    - Fetch config on mount to determine auth mode
    - _Requirements: 1.1, 5.1_
  - [x] 4.2 Implement "none" mode logic
    - Return `isAuthenticated: true` without credentials
    - _Requirements: 1.2_
  - [x] 4.3 Implement "password" mode logic
    - Check localStorage for valid session
    - Call `/api/auth` for login/logout
    - _Requirements: 1.3, 1.5_
  - [x] 4.4 Implement "supabase" mode logic
    - Use Supabase client's `onAuthStateChange`
    - Delegate login/logout to Supabase Auth
    - _Requirements: 1.4, 1.5_
  - [x] 4.5 Export useAuth hook from `src/hooks/index.ts`
    - _Requirements: 1.1_

- [x] 5. Create login page

  - [x] 5.1 Create `src/app/auth/page.tsx` with login form
    - Fetch config to determine auth mode
    - Redirect to "/" if mode is "none"
    - _Requirements: 3.1, 3.6_
  - [x] 5.2 Implement password mode UI
    - Password input field with submit button
    - _Requirements: 3.2_
  - [x] 5.3 Implement supabase mode UI
    - Email and password inputs
    - _Requirements: 3.3_
  - [x] 5.4 Handle authentication success/failure
    - Redirect on success, show error on failure
    - _Requirements: 3.4, 3.5_

- [x] 6. Update Layout with AuthProvider

  - Wrap app with `AuthProvider` in `src/app/layout.tsx`
  - _Requirements: 1.1_

- [x] 7. Update Sidebar for auth-aware UI

  - [x] 7.1 Conditionally show/hide "New Note" button based on auth state
    - Hide when not authenticated and write requires auth
    - _Requirements: 4.1, 4.4_
  - [x] 7.2 Add Login link when not authenticated
    - Show link to `/auth` page
    - _Requirements: 4.2_
  - [x] 7.3 Add Logout button when authenticated
    - Call logout function from useAuth
    - _Requirements: 4.5_

- [x] 8. Add unit tests for auth functionality
  - [x] 8.1 Create `src/hooks/__tests__/useAuth.test.ts`
    - Test all three auth modes
    - Test login/logout flows
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
