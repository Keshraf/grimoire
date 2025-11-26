# Requirements Document

## Introduction

This document defines the requirements for implementing an authentication system in NEXUS. The system supports three authentication modes configured via `nexus.config.yaml`: "none" (no authentication), "password" (single shared password), and "supabase" (full user authentication via Supabase Auth). The authentication system controls access to write operations (create, edit, delete notes) while optionally protecting read access based on configuration.

## Glossary

- **Authentication_System**: The NEXUS component responsible for verifying user identity and managing authentication state
- **Auth_Mode**: The configured authentication method ("none", "password", or "supabase")
- **Session**: A validated authentication state stored client-side that persists across page reloads
- **Write_Operation**: Any action that modifies data (create, update, delete notes)
- **Read_Operation**: Any action that retrieves data without modification

## Requirements

### Requirement 1: Authentication Hook

**User Story:** As a developer, I want a centralized authentication hook, so that components can easily check auth state and perform login/logout actions.

#### Acceptance Criteria

1. THE Authentication_System SHALL provide a `useAuth` hook that returns `isAuthenticated`, `user`, `login`, `logout`, and `isLoading` properties.
2. WHEN Auth_Mode is "none", THE Authentication_System SHALL return `isAuthenticated` as true without requiring any credentials.
3. WHEN Auth_Mode is "password", THE Authentication_System SHALL validate credentials against the NEXUS_PASSWORD environment variable.
4. WHEN Auth_Mode is "supabase", THE Authentication_System SHALL delegate authentication to Supabase Auth client.
5. THE Authentication_System SHALL persist session state across page reloads using appropriate storage mechanisms.

### Requirement 2: Authentication API Endpoint

**User Story:** As a frontend developer, I want a server-side authentication endpoint, so that credentials can be securely validated without exposing secrets to the client.

#### Acceptance Criteria

1. THE Authentication_System SHALL expose a POST endpoint at `/api/auth` for authentication requests.
2. WHEN a valid password is submitted in "password" mode, THE Authentication_System SHALL return a success response with a session token.
3. WHEN an invalid password is submitted, THE Authentication_System SHALL return a 401 Unauthorized response.
4. THE Authentication_System SHALL validate the session token on subsequent requests.
5. THE Authentication_System SHALL expose a DELETE endpoint at `/api/auth` for logout operations.

### Requirement 3: Login Page

**User Story:** As a user, I want a login page, so that I can authenticate and gain access to write operations.

#### Acceptance Criteria

1. THE Authentication_System SHALL render a login form at `/auth` route.
2. WHEN Auth_Mode is "password", THE Authentication_System SHALL display a password input field.
3. WHEN Auth_Mode is "supabase", THE Authentication_System SHALL display email/password inputs or Supabase Auth UI.
4. WHEN authentication succeeds, THE Authentication_System SHALL redirect the user to the main application.
5. WHEN authentication fails, THE Authentication_System SHALL display an error message to the user.
6. IF Auth_Mode is "none", THEN THE Authentication_System SHALL redirect from `/auth` to the main application.

### Requirement 4: Protected Write Operations

**User Story:** As a content owner, I want write operations protected by authentication, so that only authorized users can modify content.

#### Acceptance Criteria

1. WHILE user is not authenticated, THE Authentication_System SHALL hide edit and create note buttons in the UI.
2. WHILE user is not authenticated, THE Authentication_System SHALL display a login link in the header area.
3. WHEN an unauthenticated request attempts a write operation, THE Authentication_System SHALL return a 401 Unauthorized response.
4. WHILE user is authenticated, THE Authentication_System SHALL display edit and create note buttons.
5. WHILE user is authenticated, THE Authentication_System SHALL display a logout option.

### Requirement 5: Configuration-Driven Behavior

**User Story:** As a site administrator, I want authentication behavior controlled by configuration, so that I can choose the appropriate security level for my deployment.

#### Acceptance Criteria

1. THE Authentication_System SHALL read the `auth.mode` setting from `nexus.config.yaml`.
2. THE Authentication_System SHALL read the `auth.permissions.read` setting to determine if read access requires authentication.
3. THE Authentication_System SHALL read the `auth.permissions.write` setting to determine write access requirements.
4. WHEN `auth.permissions.read` is "public", THE Authentication_System SHALL allow unauthenticated read access.
5. WHEN `auth.permissions.read` is "authenticated", THE Authentication_System SHALL require authentication for read access.
