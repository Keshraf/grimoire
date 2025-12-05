# Requirements Document

## Introduction

This document specifies the requirements for fixing editor behavior and authentication enforcement in the NEXUS knowledge base application. Currently, there are three main issues:

1. **Arcana editor UX**: The inline editor requires double-click to start editing, which is poor UX. When `inline_editing` is enabled, users should be able to start editing immediately without double-clicking.

2. **Authentication enforcement**: When password authentication is configured (arcana), unauthenticated users can still view and potentially edit notes. The system should enforce authentication before allowing any access when auth is required.

3. **New note creation visibility**: When editing is disabled (codex), the "New Note" button should not be shown since users cannot create content anyway.

## Glossary

- **NEXUS**: The knowledge base application being configured
- **Arcana**: A personal knowledge base configuration with inline editing enabled and password authentication
- **Codex**: A documentation configuration with editing disabled and no authentication
- **Inline Editing**: A feature flag (`features.inline_editing`) that enables in-place note editing
- **InlineNoteEditor**: The component that shows rendered content and switches to WYSIWYG on double-click
- **WysiwygEditor**: The TipTap-based rich text editor component
- **NoteViewer**: The read-only component that renders markdown as HTML
- **canWrite**: A computed auth property indicating if the current user has write permissions

## Requirements

### Requirement 1

**User Story:** As a user with inline editing enabled, I want to start editing notes immediately without double-clicking, so that I have a smoother editing experience.

#### Acceptance Criteria

1. WHEN `features.inline_editing` is enabled AND the user has write permissions THEN the Pane component SHALL render the WysiwygEditor directly instead of the InlineNoteEditor
2. WHEN `features.inline_editing` is enabled AND the user does NOT have write permissions THEN the Pane component SHALL render the NoteViewer in read-only mode
3. WHEN `features.inline_editing` is disabled THEN the Pane component SHALL render the NoteViewer regardless of user permissions

### Requirement 2

**User Story:** As a site administrator, I want unauthenticated users to be blocked from accessing content when authentication is required, so that my knowledge base remains private.

#### Acceptance Criteria

1. WHEN `auth.mode` is "password" or "supabase" AND `auth.permissions.read` is "authenticated" AND the user is NOT authenticated THEN the MainApp component SHALL redirect the user to the authentication page
2. WHEN `auth.mode` is "password" or "supabase" AND `auth.permissions.read` is "public" AND the user is NOT authenticated THEN the MainApp component SHALL allow read-only access to notes
3. WHEN `auth.mode` is "none" THEN the MainApp component SHALL allow full access without authentication checks
4. WHILE the authentication state is loading THEN the MainApp component SHALL display a loading indicator instead of content

### Requirement 3

**User Story:** As a user of a read-only documentation site, I want the interface to hide creation options that I cannot use, so that I have a cleaner and less confusing experience.

#### Acceptance Criteria

1. WHEN `features.inline_editing` is disabled THEN the Sidebar component SHALL hide the "New Note" button regardless of authentication status
2. WHEN `features.inline_editing` is enabled AND the user has write permissions THEN the Sidebar component SHALL display the "New Note" button
3. WHEN `features.inline_editing` is enabled AND the user does NOT have write permissions THEN the Sidebar component SHALL hide the "New Note" button
