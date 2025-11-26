# Requirements Document

## Introduction

This feature implements navigation state management for a multi-pane note viewing application. The system uses React Context with useReducer to manage pane navigation state, supporting operations like pushing new panes, closing panes, toggling view/edit modes, and linear navigation (prev/next). URL synchronization ensures the navigation state persists and can be restored from the URL.

## Glossary

- **Pane**: A single view container displaying a note, identified by a slug
- **Navigation_Stack**: An ordered array of panes representing the current navigation state
- **Active_Pane**: The currently focused pane in the navigation stack
- **Slug**: A unique URL-friendly identifier for a note
- **View_Mode**: Display mode for a pane (either "view" or "edit")
- **Navigation_System**: The React Context-based state management system for panes

## Requirements

### Requirement 1: Navigation Context Setup

**User Story:** As a developer, I want a centralized navigation context, so that all components can access and modify navigation state consistently.

#### Acceptance Criteria

1. THE Navigation_System SHALL provide a NavigationContext that stores the current Navigation_Stack, active pane index, and mode for each pane.
2. THE Navigation_System SHALL provide a NavigationProvider component that wraps the application and supplies navigation state to child components.
3. THE Navigation_System SHALL provide a useNavigation hook that returns the current state and dispatch function.
4. IF a component attempts to use useNavigation outside of NavigationProvider, THEN THE Navigation_System SHALL throw a descriptive error.

### Requirement 2: Push Pane Action

**User Story:** As a user, I want to open a new note in a pane, so that I can view linked content while keeping context.

#### Acceptance Criteria

1. WHEN a PUSH_PANE action is dispatched with a slug and afterIndex, THE Navigation_System SHALL close all panes after afterIndex and add the new pane.
2. WHEN a PUSH_PANE action is dispatched, THE Navigation_System SHALL set the new pane as the active pane.
3. WHEN a PUSH_PANE action is dispatched, THE Navigation_System SHALL initialize the new pane in view mode.
4. IF a PUSH_PANE action is dispatched with a slug that already exists in the stack before afterIndex, THEN THE Navigation_System SHALL still add the pane to allow duplicate viewing.

### Requirement 3: Close Pane Action

**User Story:** As a user, I want to close a pane and all panes after it, so that I can simplify my navigation stack.

#### Acceptance Criteria

1. WHEN a CLOSE_PANE action is dispatched with an index, THE Navigation_System SHALL remove the pane at that index and all panes after it.
2. WHEN a CLOSE_PANE action removes the active pane, THE Navigation_System SHALL set the active pane to the last remaining pane.
3. IF a CLOSE_PANE action is dispatched with index 0 and there is only one pane, THEN THE Navigation_System SHALL keep that pane open.

### Requirement 4: Set Active Pane Action

**User Story:** As a user, I want to focus on a specific pane, so that I can interact with that note.

#### Acceptance Criteria

1. WHEN a SET_ACTIVE action is dispatched with an index, THE Navigation_System SHALL update the active pane index to the specified value.
2. IF a SET_ACTIVE action is dispatched with an index outside the valid range, THEN THE Navigation_System SHALL clamp the index to the valid range.

### Requirement 5: Set Mode Action

**User Story:** As a user, I want to toggle between view and edit mode for a pane, so that I can read or modify note content.

#### Acceptance Criteria

1. WHEN a SET_MODE action is dispatched with a pane index and mode, THE Navigation_System SHALL update that pane's mode to the specified value.
2. THE Navigation_System SHALL support "view" and "edit" as valid mode values.
3. IF a SET_MODE action is dispatched with an invalid pane index, THEN THE Navigation_System SHALL ignore the action.

### Requirement 6: Linear Navigation Action

**User Story:** As a user, I want to navigate to the previous or next note, so that I can browse notes sequentially.

#### Acceptance Criteria

1. WHEN a NAVIGATE_LINEAR action is dispatched with a slug and afterIndex, THE Navigation_System SHALL close all panes after afterIndex and add the new pane.
2. WHEN a NAVIGATE_LINEAR action is dispatched, THE Navigation_System SHALL set the new pane as active.
3. THE Navigation_System SHALL initialize linearly navigated panes in view mode.

### Requirement 7: Restore From URL Action

**User Story:** As a user, I want my navigation state restored when I return to a URL, so that I can resume where I left off.

#### Acceptance Criteria

1. WHEN a RESTORE_FROM_URL action is dispatched with an array of slugs, THE Navigation_System SHALL initialize the Navigation_Stack with panes for each slug.
2. WHEN a RESTORE_FROM_URL action is dispatched, THE Navigation_System SHALL set the last pane as the active pane.
3. THE Navigation_System SHALL initialize all restored panes in view mode.

### Requirement 8: URL Synchronization

**User Story:** As a user, I want the URL to reflect my current navigation state, so that I can share or bookmark my view.

#### Acceptance Criteria

1. WHEN the Navigation_Stack changes, THE Navigation_System SHALL update the URL to format /[firstSlug]?stack=slug2,slug3 for stacks with multiple panes.
2. WHEN the Navigation_Stack has only one pane, THE Navigation_System SHALL update the URL to /[slug] without query parameters.
3. WHEN the useURLSync hook mounts, THE Navigation_System SHALL parse the current URL and dispatch RESTORE_FROM_URL if panes are encoded.
4. THE Navigation_System SHALL update the URL without triggering a full page reload.
