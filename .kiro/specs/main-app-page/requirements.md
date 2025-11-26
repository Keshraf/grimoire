# Requirements Document

## Introduction

This document specifies the requirements for updating `/src/app/page.tsx` to serve as the main application entry point for NEXUS. The page will orchestrate configuration loading, authentication checking, provider setup, and rendering of the core application components including the Layout, StackContainer, SearchModal, and ImportExportModal. It will also implement global keyboard shortcuts for common actions.

## Glossary

- **Main_Page**: The root page component at `/src/app/page.tsx` that serves as the application entry point
- **Config**: Application configuration loaded from `nexus.config.yaml` via `getConfig()`
- **NavigationProvider**: React context provider managing multi-pane navigation state
- **QueryClientProvider**: React Query provider for data fetching and caching
- **Layout**: Main layout component containing sidebar and content areas
- **StackContainer**: Component managing horizontally stacked note panes
- **SearchModal**: Modal dialog for searching notes, triggered by Cmd+K
- **ImportExportModal**: Modal dialog for importing/exporting notes
- **Pane**: A single note view/edit panel within the StackContainer
- **Wikilink**: Internal link syntax `[[slug]]` used to reference other notes

## Requirements

### Requirement 1: Configuration Loading

**User Story:** As a user, I want the application to load my configuration settings, so that my customizations are applied when the app starts.

#### Acceptance Criteria

1. WHEN the Main_Page renders, THE Main_Page SHALL load configuration using the `getConfig()` function.
2. THE Main_Page SHALL pass the loaded Config to child components that require it.
3. IF the Config fails to load, THEN THE Main_Page SHALL use default configuration values.

### Requirement 2: Authentication Integration

**User Story:** As a user, I want the application to check my authentication status, so that I can access features based on my permissions.

#### Acceptance Criteria

1. THE Main_Page SHALL utilize the AuthProvider context to access authentication state.
2. WHEN the authentication state is loading, THE Main_Page SHALL display a loading indicator.
3. THE Main_Page SHALL pass authentication-aware callbacks to child components.

### Requirement 3: Provider Setup

**User Story:** As a developer, I want all necessary providers wrapped around the application, so that state management works correctly throughout the component tree.

#### Acceptance Criteria

1. THE Main_Page SHALL be wrapped with QueryClientProvider for React Query functionality.
2. THE Main_Page SHALL utilize the existing NavigationProvider from the root layout.
3. THE Main_Page SHALL create and configure a QueryClient instance for data fetching.

### Requirement 4: Layout Rendering

**User Story:** As a user, I want to see the main application layout with sidebar and content area, so that I can navigate and view notes.

#### Acceptance Criteria

1. THE Main_Page SHALL render the Layout component with Config, notes data, and callback handlers.
2. THE Main_Page SHALL render the StackContainer component inside the Layout.
3. THE Main_Page SHALL pass an `onPageClick` handler to Layout that opens notes in new panes.
4. THE Main_Page SHALL pass an `onNewNote` handler to Layout that creates new notes.

### Requirement 5: Search Modal Integration

**User Story:** As a user, I want to quickly search my notes using a keyboard shortcut, so that I can find information efficiently.

#### Acceptance Criteria

1. THE Main_Page SHALL render the SearchModal component.
2. WHEN the user presses Cmd+K (Mac) or Ctrl+K (Windows), THE Main_Page SHALL open the SearchModal.
3. WHEN the user selects a search result, THE Main_Page SHALL open the selected note in a new pane.
4. WHEN the SearchModal is open and the user presses Escape, THE Main_Page SHALL close the SearchModal.

### Requirement 6: Import/Export Modal Integration

**User Story:** As a user, I want to access import/export functionality, so that I can backup or migrate my notes.

#### Acceptance Criteria

1. WHERE the `import_export` feature is enabled in Config, THE Main_Page SHALL render the ImportExportModal component.
2. THE Main_Page SHALL listen for the `open-import-export` custom event to open the modal.

### Requirement 7: Initial Note Loading

**User Story:** As a user, I want the application to show a default note when I first open it, so that I have a starting point for navigation.

#### Acceptance Criteria

1. WHEN the Main_Page loads with no panes open, THE Main_Page SHALL open the home/index note if it exists.
2. IF no home/index note exists, THEN THE Main_Page SHALL open the first available note.
3. IF no notes exist, THEN THE Main_Page SHALL display an empty state message.

### Requirement 8: Keyboard Shortcuts

**User Story:** As a user, I want keyboard shortcuts for common actions, so that I can work more efficiently.

#### Acceptance Criteria

1. WHEN the user presses Cmd+K (Mac) or Ctrl+K (Windows), THE Main_Page SHALL open the SearchModal.
2. WHEN the user presses Cmd+N (Mac) or Ctrl+N (Windows), THE Main_Page SHALL create a new note.
3. WHEN the user presses Escape with a modal open, THE Main_Page SHALL close the topmost modal.
4. WHEN the user presses Escape with no modals open and multiple panes exist, THE Main_Page SHALL close the rightmost pane.

### Requirement 9: URL Synchronization

**User Story:** As a user, I want the URL to reflect my current navigation state, so that I can bookmark and share specific views.

#### Acceptance Criteria

1. THE Main_Page SHALL use the `useURLSync` hook to synchronize navigation state with the URL.
2. WHEN the URL contains pane slugs on page load, THE Main_Page SHALL restore those panes.
3. WHEN panes are opened or closed, THE Main_Page SHALL update the URL without page reload.

### Requirement 10: Wikilink Navigation

**User Story:** As a user, I want to click on wikilinks to open linked notes, so that I can explore connections between my notes.

#### Acceptance Criteria

1. WHEN the user clicks a `[[wikilink]]` in a note, THE Main_Page SHALL open the linked note in a new pane to the right.
2. THE Main_Page SHALL pass the link click handler through to the StackContainer component.
