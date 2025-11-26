# Implementation Plan

- [x] 1. Set up QueryClient and provider structure in page.tsx

  - Create QueryClient instance with appropriate default options
  - Wrap page content with QueryClientProvider
  - Add "use client" directive
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 2. Create MainApp component with core state and hooks

  - [x] 2.1 Create MainApp component structure

    - Add state for searchOpen modal
    - Fetch config via /api/config endpoint
    - Use useNotes() hook to fetch all notes
    - Use useNavigation() hook for pane state
    - Use useAuth() hook for authentication state
    - _Requirements: 1.1, 1.2, 2.1, 2.2_

  - [x] 2.2 Implement URL synchronization

    - Call useURLSync() hook to sync navigation with URL
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 2.3 Implement initial note loading
    - Check if panes are empty after URL sync
    - Open home/index note if exists, otherwise first note
    - Handle empty notes state
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 3. Implement keyboard shortcuts

  - [x] 3.1 Create useKeyboardShortcuts hook

    - Handle Cmd/Ctrl+K for search
    - Handle Cmd/Ctrl+N for new note
    - Handle Escape for closing modals/panes
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 3.2 Integrate keyboard shortcuts in MainApp
    - Wire up search open callback
    - Wire up new note callback
    - Wire up escape callback with modal/pane logic
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 4. Render Layout with StackContainer

  - [x] 4.1 Implement page click handler

    - Create onPageClick callback that calls pushPane
    - _Requirements: 4.3, 10.1, 10.2_

  - [x] 4.2 Implement new note handler

    - Create onNewNote callback that creates note and opens pane
    - Use useCreateNote mutation
    - _Requirements: 4.4_

  - [x] 4.3 Render Layout and StackContainer
    - Pass config, notes, and callbacks to Layout
    - Render StackContainer as Layout children
    - _Requirements: 4.1, 4.2_

- [x] 5. Integrate SearchModal

  - [x] 5.1 Add SearchModal component
    - Render SearchModal with isOpen state
    - Pass onClose callback to close modal
    - Pass onSelect callback to open selected note
    - Pass config for styling
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 6. Handle loading and error states

  - [x] 6.1 Implement loading state

    - Show loading indicator while config or notes are loading
    - Show loading indicator while auth is checking
    - _Requirements: 2.2, 1.3_

  - [x] 6.2 Implement error handling
    - Use default config if fetch fails
    - Display error state for notes loading failure
    - _Requirements: 1.3_

- [ ]\* 7. Write tests for main app functionality

  - [ ]\* 7.1 Test keyboard shortcuts hook

    - Test Cmd+K triggers search callback
    - Test Cmd+N triggers new note callback
    - Test Escape triggers escape callback
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]\* 7.2 Test initial note selection logic
    - Test URL slugs take priority
    - Test home/index note fallback
    - Test first note fallback
    - _Requirements: 7.1, 7.2, 7.3_
