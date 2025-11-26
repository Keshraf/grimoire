# Implementation Plan

- [x] 1. Update type definitions

  - [x] 1.1 Update NavigationAction type in src/types/index.ts
    - Replace existing NavigationAction with new action signatures
    - Add PUSH_PANE, CLOSE_PANE, SET_ACTIVE, SET_MODE, NAVIGATE_LINEAR, RESTORE_FROM_URL types
    - Add NavigationContextValue interface
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1_

- [x] 2. Create navigation state management hook

  - [x] 2.1 Create src/hooks/useNavigation.ts with reducer

    - Implement createPane helper function
    - Implement navigationReducer with all 6 action handlers
    - Handle PUSH_PANE: close panes after afterIndex, add new pane, set active
    - Handle CLOSE_PANE: remove pane at index and all after, adjust active index
    - Handle SET_ACTIVE: clamp index and update activePaneIndex
    - Handle SET_MODE: update mode for pane at index
    - Handle NAVIGATE_LINEAR: same as PUSH_PANE logic
    - Handle RESTORE_FROM_URL: create panes from slugs array
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2, 6.1, 6.2, 7.1, 7.2, 7.3_

  - [x] 2.2 Add NavigationContext and NavigationProvider

    - Create NavigationContext with createContext
    - Implement NavigationProvider component with useReducer
    - Add convenience methods (pushPane, closePane, setActive, setMode, navigateLinear)
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 2.3 Add useNavigation hook

    - Implement useNavigation hook that consumes NavigationContext
    - Throw descriptive error if used outside NavigationProvider
    - _Requirements: 1.3, 1.4_

  - [x] 2.4 Write unit tests for navigation reducer
    - Test each action type with various state configurations
    - Test edge cases (empty state, single pane, boundary indices)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 7.1, 7.2, 7.3_

- [x] 3. Create URL synchronization hook

  - [x] 3.1 Create src/hooks/useURLSync.ts

    - Implement parseURLToSlugs helper to extract slugs from pathname and search params
    - Implement buildURLFromSlugs helper to construct URL from slug array
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 3.2 Implement URL sync logic

    - On mount, parse current URL and dispatch RESTORE_FROM_URL
    - On state change, update URL using history.replaceState (no page reload)
    - Handle single pane (no query params) vs multiple panes (with stack param)
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 3.3 Write unit tests for URL sync utilities
    - Test URL parsing with various formats
    - Test URL building from slugs
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 4. Integrate with application

  - [x] 4.1 Wrap app with NavigationProvider in layout.tsx

    - Import NavigationProvider
    - Wrap children in NavigationProvider
    - _Requirements: 1.2_

  - [x] 4.2 Export hooks from src/hooks/index.ts
    - Create index.ts barrel file if needed
    - Export useNavigation and useURLSync
    - _Requirements: 1.3_
