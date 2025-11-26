# Requirements Document

## Introduction

This feature enhances the existing NoteEditor component with a wikilink autocomplete popup. When users type `[[` in the textarea, an autocomplete dropdown appears showing existing notes that match the input. Users can navigate with arrow keys, select with Enter, and optionally create new notes if no match exists. The feature improves the note-linking workflow by reducing friction when creating connections between notes.

## Glossary

- **NoteEditor**: The React component at `/src/components/NoteEditor.tsx` that provides markdown editing capabilities for notes
- **LinkAutocomplete**: A new React component that displays a popup with matching notes when the user types `[[`
- **Wikilink**: A link syntax using double brackets `[[slug]]` or `[[slug|display]]` to reference other notes
- **Slug**: A URL-friendly identifier for a note (e.g., "my-note-title")
- **Display Text**: Optional text shown instead of the slug in rendered wikilinks (e.g., `[[slug|My Note Title]]`)

## Requirements

### Requirement 1: Autocomplete Trigger

**User Story:** As a note author, I want the autocomplete popup to appear when I type `[[`, so that I can quickly link to existing notes.

#### Acceptance Criteria

1. WHEN the user types `[[` in the NoteEditor textarea, THE LinkAutocomplete SHALL display a popup positioned near the cursor.
2. WHEN the user deletes characters to remove the `[[` trigger, THE LinkAutocomplete SHALL close the popup.
3. WHEN the user clicks outside the popup, THE LinkAutocomplete SHALL close the popup.
4. WHEN the user presses Escape while the popup is open, THE LinkAutocomplete SHALL close the popup.

### Requirement 2: Note Filtering

**User Story:** As a note author, I want to filter notes by typing after `[[`, so that I can find the specific note I want to link.

#### Acceptance Criteria

1. WHEN the user types characters after `[[`, THE LinkAutocomplete SHALL filter the note list to show only notes whose title or slug contains the typed text.
2. WHILE the popup is open, THE LinkAutocomplete SHALL display a maximum of 10 matching notes.
3. WHEN no notes match the filter text, THE LinkAutocomplete SHALL display a "Create new note" option with the typed text as the title.
4. THE LinkAutocomplete SHALL perform case-insensitive matching when filtering notes.

### Requirement 3: Keyboard Navigation

**User Story:** As a note author, I want to navigate the autocomplete list with my keyboard, so that I can select notes without using the mouse.

#### Acceptance Criteria

1. WHEN the user presses the Down Arrow key while the popup is open, THE LinkAutocomplete SHALL move the selection to the next item in the list.
2. WHEN the user presses the Up Arrow key while the popup is open, THE LinkAutocomplete SHALL move the selection to the previous item in the list.
3. WHEN the user presses Enter while an item is selected, THE LinkAutocomplete SHALL insert the selected note's wikilink into the textarea.
4. WHEN the selection reaches the end of the list and the user presses Down Arrow, THE LinkAutocomplete SHALL wrap the selection to the first item.
5. WHEN the selection is at the first item and the user presses Up Arrow, THE LinkAutocomplete SHALL wrap the selection to the last item.

### Requirement 4: Link Insertion

**User Story:** As a note author, I want the selected note to be inserted as a properly formatted wikilink, so that the link works correctly.

#### Acceptance Criteria

1. WHEN the user selects a note from the autocomplete, THE NoteEditor SHALL replace the `[[` trigger and any typed filter text with `[[slug]]`.
2. WHEN the note's title differs from its slug, THE NoteEditor SHALL insert `[[slug|title]]` format.
3. WHEN the user selects "Create new note", THE NoteEditor SHALL insert `[[new-slug]]` where new-slug is derived from the typed text.
4. AFTER inserting a wikilink, THE NoteEditor SHALL position the cursor immediately after the closing `]]`.

### Requirement 5: Mouse Interaction

**User Story:** As a note author, I want to click on notes in the autocomplete list, so that I can select them with my mouse.

#### Acceptance Criteria

1. WHEN the user clicks on a note in the popup list, THE LinkAutocomplete SHALL insert that note's wikilink into the textarea.
2. WHILE the user hovers over a note in the popup list, THE LinkAutocomplete SHALL visually highlight that item.

### Requirement 6: Editor Enhancements

**User Story:** As a note author, I want the editor to have convenient keyboard shortcuts and auto-resizing, so that my editing experience is smooth.

#### Acceptance Criteria

1. WHEN the user presses Cmd+S (Mac) or Ctrl+S (Windows/Linux), THE NoteEditor SHALL trigger the onSave callback.
2. WHEN the user presses Escape while not in autocomplete mode, THE NoteEditor SHALL trigger the onCancel callback.
3. THE NoteEditor SHALL use a monospace font for the textarea.
4. THE NoteEditor SHALL auto-resize the textarea height to fit the content.

### Requirement 7: Props Interface

**User Story:** As a developer, I want the NoteEditor to have a clean props interface, so that I can integrate it easily.

#### Acceptance Criteria

1. THE NoteEditor SHALL accept a `content` prop of type string for the initial markdown content.
2. THE NoteEditor SHALL accept an `onChange` callback prop that receives the updated content string.
3. THE NoteEditor SHALL accept an `onSave` callback prop that is called when the user saves.
4. THE NoteEditor SHALL accept an `onCancel` callback prop that is called when the user cancels editing.
