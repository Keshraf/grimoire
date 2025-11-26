# Implementation Plan

- [x] 1. Create LinkAutocomplete component

  - [x] 1.1 Create `/src/components/LinkAutocomplete.tsx` with props interface

    - Define `LinkAutocompleteProps` interface with query, notes, position, onSelect, onClose, onCreateNew
    - Implement basic component structure with fixed positioning
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 1.2 Implement note filtering logic

    - Filter notes by case-insensitive match on title and slug
    - Limit results to 10 items
    - Show "Create new note" option when no matches and query is non-empty
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 1.3 Implement keyboard navigation

    - Track selectedIndex state
    - Handle ArrowDown to move selection down with wrap-around
    - Handle ArrowUp to move selection up with wrap-around
    - Handle Enter to select current item
    - Handle Escape to close popup
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 1.4 Implement mouse interaction

    - Add onClick handler to select item
    - Add hover state styling for items
    - _Requirements: 5.1, 5.2_

  - [x] 1.5 Style the autocomplete popup
    - Apply theme colors from config (surface, text, primary)
    - Add shadow and border radius
    - Style selected and hovered states
    - _Requirements: 2.2, 5.2_

- [x] 2. Refactor NoteEditor component

  - [x] 2.1 Update NoteEditor props interface

    - Change props to: content, onChange, onSave, onCancel, notes, onCreateNote (optional)
    - Remove config prop dependency for core functionality
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 2.2 Implement autocomplete trigger detection

    - Detect `[[` pattern in textarea on input change
    - Track trigger position in content
    - Calculate cursor screen position for popup placement
    - _Requirements: 1.1, 1.2_

  - [x] 2.3 Implement link insertion logic

    - Replace trigger text and query with formatted wikilink
    - Use `[[slug]]` format when title matches slug
    - Use `[[slug|title]]` format when title differs from slug
    - Position cursor after closing `]]`
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 2.4 Implement keyboard shortcuts

    - Cmd/Ctrl+S triggers onSave callback
    - Escape triggers onCancel when autocomplete is closed
    - Pass keyboard events to LinkAutocomplete when open
    - _Requirements: 6.1, 6.2_

  - [x] 2.5 Implement auto-resize textarea

    - Adjust textarea height based on scrollHeight
    - Apply monospace font styling
    - _Requirements: 6.3, 6.4_

  - [x] 2.6 Handle autocomplete close conditions
    - Close on Escape key
    - Close when `[[` trigger is deleted
    - Close on click outside popup
    - _Requirements: 1.2, 1.3, 1.4_

- [x] 3. Wire up components and export

  - [x] 3.1 Integrate LinkAutocomplete into NoteEditor

    - Render LinkAutocomplete conditionally when trigger is active
    - Pass filtered query and position to LinkAutocomplete
    - Handle onSelect to insert link
    - _Requirements: 1.1, 4.1_

  - [x] 3.2 Update component barrel export

    - Add LinkAutocomplete to `/src/components/index.ts`
    - _Requirements: 7.1_

  - [x] 3.3 Write unit tests for LinkAutocomplete

    - Test filtering logic
    - Test keyboard navigation
    - Test selection callbacks
    - _Requirements: 2.1, 3.1, 3.2, 3.3_

  - [x] 3.4 Write unit tests for NoteEditor
    - Test trigger detection
    - Test link insertion formats
    - Test keyboard shortcuts
    - _Requirements: 1.1, 4.1, 6.1_
