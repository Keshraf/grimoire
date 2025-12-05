# Design Document: Editor and Authentication Fixes

## Overview

This design addresses three interconnected issues in the NEXUS knowledge base:

1. **Editor UX improvement**: Replace the double-click-to-edit pattern with direct WYSIWYG editing when inline editing is enabled and the user has write permissions
2. **Authentication enforcement**: Properly gate content access based on auth configuration
3. **UI consistency**: Hide creation options when editing is disabled

The changes are localized to three components: `Pane.tsx`, `MainApp.tsx`, and `Sidebar.tsx`.

## Architecture

The solution follows the existing architecture patterns:

- Configuration-driven behavior via `NexusConfig`
- Auth state managed by `useAuth` hook providing `canWrite`, `isAuthenticated`, and `isLoading`
- Component composition for different view modes

```
┌─────────────────────────────────────────────────────────────────┐
│                         MainApp                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Auth Gate (new)                             │   │
│  │  - Check auth.mode + auth.permissions.read              │   │
│  │  - Redirect if auth required but not authenticated      │   │
│  │  - Show loading state while checking                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│              ┌───────────────┴───────────────┐                  │
│              ▼                               ▼                  │
│  ┌─────────────────────┐         ┌─────────────────────────┐   │
│  │      Sidebar        │         │    StackContainer       │   │
│  │  - New Note button  │         │         │               │   │
│  │    visibility based │         │         ▼               │   │
│  │    on inline_editing│         │  ┌─────────────┐        │   │
│  │    AND canWrite     │         │  │    Pane     │        │   │
│  └─────────────────────┘         │  │  - Editor   │        │   │
│                                  │  │    selection│        │   │
│                                  │  └─────────────┘        │   │
│                                  └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Pane Component Changes

**Current behavior**: Uses `InlineNoteEditor` when `inline_editing` is enabled, which requires double-click to edit.

**New behavior**:

- When `inline_editing` enabled AND `canWrite` → render `WysiwygEditor` directly
- When `inline_editing` enabled AND NOT `canWrite` → render `NoteViewer`
- When `inline_editing` disabled → render `NoteViewer`

```typescript
// Pane.tsx - Editor selection logic
interface PaneProps {
  // ... existing props
}

// Inside Pane component:
const { canWrite } = useAuth();

// Editor selection logic
const renderEditor = () => {
  if (config.features.inline_editing && canWrite) {
    // Direct WYSIWYG editing - no double-click required
    return (
      <WysiwygEditor
        content={note.content}
        config={config}
        notes={allNotes}
        onSave={onSave}
        onLinkClick={onLinkClick}
        onCreateNote={onCreateNote}
      />
    );
  }
  // Read-only view
  return (
    <NoteViewer html={note.html} config={config} onLinkClick={onLinkClick} />
  );
};
```

### 2. MainApp Component Changes

**Current behavior**: No auth gating for content access.

**New behavior**: Check auth requirements before rendering content.

```typescript
// MainApp.tsx - Auth gate logic
const { isAuthenticated, isLoading, authMode } = useAuth();

// Determine if auth is required for reading
const requiresAuthForRead =
  (authMode === "password" || authMode === "supabase") &&
  config.auth?.permissions?.read === "authenticated";

// Auth gate
if (isLoading) {
  return <LoadingSpinner />;
}

if (requiresAuthForRead && !isAuthenticated) {
  // Redirect to auth page
  router.push("/auth");
  return null;
}

// Render normal content
```

### 3. Sidebar Component Changes

**Current behavior**: Shows "New Note" button based only on `canWrite`.

**New behavior**: Shows "New Note" button only when BOTH `inline_editing` is enabled AND `canWrite` is true.

```typescript
// Sidebar.tsx - SidebarActions component
const showNewNoteButton = config.features.inline_editing && canWrite;

{
  showNewNoteButton && (
    <button onClick={onNewNote}>
      <PlusIcon />
      <span>New Note</span>
    </button>
  );
}
```

## Data Models

No changes to data models. The solution uses existing:

- `NexusConfig` for feature flags and auth configuration
- `AuthContextValue` from `useAuth` hook

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Editor component selection based on config and permissions

_For any_ combination of `inline_editing` (boolean) and `canWrite` (boolean), the Pane component should render:

- `WysiwygEditor` when `inline_editing=true` AND `canWrite=true`
- `NoteViewer` in all other cases

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Auth enforcement based on config and user state

_For any_ combination of `authMode` ("none" | "password" | "supabase"), `readPermission` ("public" | "authenticated"), and `isAuthenticated` (boolean):

- When `authMode !== "none"` AND `readPermission === "authenticated"` AND `isAuthenticated === false` → redirect to /auth
- Otherwise → render content

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 3: New Note button visibility based on config and permissions

_For any_ combination of `inline_editing` (boolean) and `canWrite` (boolean), the New Note button should be visible if and only if `inline_editing=true` AND `canWrite=true`.

**Validates: Requirements 3.1, 3.2, 3.3**

## Error Handling

- **Auth loading state**: Display loading indicator while auth state is being determined to prevent flash of unauthorized content
- **Redirect loop prevention**: Only redirect to /auth if not already on auth page
- **Graceful degradation**: If auth check fails, default to requiring authentication (fail secure)

## Testing Strategy

### Unit Tests

Unit tests will verify specific scenarios:

- Pane renders correct editor component for each config/permission combination
- MainApp redirects when auth is required but user is not authenticated
- Sidebar hides New Note button when inline_editing is disabled

### Property-Based Tests

Property-based testing will use **fast-check** library to verify the correctness properties hold across all input combinations.

Each property-based test will:

- Generate random combinations of config flags and auth states
- Verify the component behavior matches the expected outcome
- Run a minimum of 100 iterations
- Be tagged with the property it validates using format: `**Feature: editor-auth-fixes, Property {number}: {property_text}**`

Test file location: `src/components/__tests__/editor-auth.test.ts`
