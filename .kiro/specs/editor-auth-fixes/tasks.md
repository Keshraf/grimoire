# Implementation Plan

- [-] 1. Update Pane component editor selection logic

  - [x] 1.1 Import useAuth hook and get canWrite state
    - Add `useAuth` import from `@/hooks`
    - Destructure `canWrite` from the hook
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 1.2 Replace InlineNoteEditor with conditional editor rendering
    - When `inline_editing` AND `canWrite` → render WysiwygEditor directly
    - Otherwise → render NoteViewer
    - Remove InlineNoteEditor usage entirely from this component
    - _Requirements: 1.1, 1.2, 1.3_
  - [ ] 1.3 Write property test for editor component selection
    - **Property 1: Editor component selection based on config and permissions**
    - **Validates: Requirements 1.1, 1.2, 1.3**

- [-] 2. Update MainApp component with auth gate

  - [x] 2.1 Add auth gate logic before rendering content
    - Check if `authMode` is "password" or "supabase"
    - Check if `auth.permissions.read` is "authenticated"
    - If both true and user not authenticated, redirect to /auth
    - Show loading indicator while auth state is loading
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [ ] 2.2 Write property test for auth enforcement
    - **Property 2: Auth enforcement based on config and user state**
    - **Validates: Requirements 2.1, 2.2, 2.3**

- [-] 3. Update Sidebar component New Note button visibility

  - [x] 3.1 Update SidebarActions to check inline_editing config
    - Change condition from `canWrite` to `config.features.inline_editing && canWrite`
    - Pass config to SidebarActions if not already available
    - _Requirements: 3.1, 3.2, 3.3_
  - [ ]\* 3.2 Write property test for New Note button visibility
    - **Property 3: New Note button visibility based on config and permissions**
    - **Validates: Requirements 3.1, 3.2, 3.3**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
