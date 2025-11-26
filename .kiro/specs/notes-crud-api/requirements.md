# Requirements Document

## Introduction

This feature implements RESTful API routes for managing notes in the Nexus knowledge base application. The API provides CRUD (Create, Read, Update, Delete) operations for notes stored in Supabase, with automatic handling of wikilink relationships between notes. The API follows Next.js App Router conventions and returns JSON responses with proper error handling.

## Glossary

- **Note**: A knowledge base entry containing a title, content (markdown), tags, and metadata stored in the Supabase `notes` table
- **Slug**: A URL-friendly unique identifier for a note, derived from the title (e.g., "my-note-title")
- **Wikilink**: A reference to another note using double-bracket syntax `[[target-slug]]` within note content
- **Outlink**: A wikilink from the current note to another note
- **Backlink**: A reference from another note pointing to the current note
- **Links Table**: The Supabase `links` table that tracks source-target relationships between notes
- **API Route Handler**: A Next.js App Router file that exports HTTP method handlers (GET, POST, PUT, DELETE)
- **syncLinks**: A helper function that parses wikilinks from content and synchronizes the links table

## Requirements

### Requirement 1: List All Notes

**User Story:** As a user, I want to fetch all notes from the knowledge base, so that I can browse and navigate the available content.

#### Acceptance Criteria

1. WHEN a GET request is made to `/api/notes`, THE API SHALL return a JSON array of all notes from the Supabase `notes` table.
2. WHEN the database query succeeds, THE API SHALL return a 200 status code with the notes array.
3. IF a database error occurs during the fetch operation, THEN THE API SHALL return a 500 status code with an error message in JSON format.

### Requirement 2: Create a New Note

**User Story:** As a user, I want to create a new note with a title and content, so that I can add knowledge to my base.

#### Acceptance Criteria

1. WHEN a POST request is made to `/api/notes` with a JSON body containing `title` and `content`, THE API SHALL create a new note in the Supabase `notes` table.
2. WHEN the request body does not include a `slug`, THE API SHALL auto-generate a slug from the title using lowercase letters, replacing spaces with hyphens, and removing special characters.
3. WHEN the note is created successfully, THE API SHALL parse the content for `[[wikilinks]]` and insert corresponding records into the `links` table.
4. WHEN the note creation succeeds, THE API SHALL return a 201 status code with the created note object in JSON format.
5. IF the request body is missing required fields (`title`), THEN THE API SHALL return a 400 status code with a validation error message.
6. IF a note with the same slug already exists, THEN THE API SHALL return a 409 status code with a conflict error message.
7. IF a database error occurs during creation, THEN THE API SHALL return a 500 status code with an error message.

### Requirement 3: Fetch Single Note with Backlinks

**User Story:** As a user, I want to fetch a specific note by its slug along with its backlinks, so that I can view the note and discover related content.

#### Acceptance Criteria

1. WHEN a GET request is made to `/api/notes/[slug]`, THE API SHALL return the note matching the provided slug from the Supabase `notes` table.
2. WHEN the note is found, THE API SHALL query the `links` table to retrieve all backlinks (notes that link to this note).
3. WHEN the note and backlinks are retrieved successfully, THE API SHALL return a 200 status code with the note object including a `backlinks` array.
4. IF no note exists with the provided slug, THEN THE API SHALL return a 404 status code with a not found error message.
5. IF a database error occurs during the fetch operation, THEN THE API SHALL return a 500 status code with an error message.

### Requirement 4: Update an Existing Note

**User Story:** As a user, I want to update an existing note's title, content, or tags, so that I can keep my knowledge base current.

#### Acceptance Criteria

1. WHEN a PUT request is made to `/api/notes/[slug]` with a JSON body containing update fields, THE API SHALL update the corresponding note in the Supabase `notes` table.
2. WHEN the content field is updated, THE API SHALL re-parse the content for `[[wikilinks]]` and synchronize the `links` table by removing old links and inserting new ones.
3. WHEN the update succeeds, THE API SHALL return a 200 status code with the updated note object in JSON format.
4. IF no note exists with the provided slug, THEN THE API SHALL return a 404 status code with a not found error message.
5. IF a database error occurs during the update operation, THEN THE API SHALL return a 500 status code with an error message.

### Requirement 5: Delete a Note

**User Story:** As a user, I want to delete a note from my knowledge base, so that I can remove outdated or unwanted content.

#### Acceptance Criteria

1. WHEN a DELETE request is made to `/api/notes/[slug]`, THE API SHALL delete the note matching the provided slug from the Supabase `notes` table.
2. WHEN the note is deleted, THE API SHALL rely on the database CASCADE constraint to automatically remove associated records from the `links` table.
3. WHEN the deletion succeeds, THE API SHALL return a 200 status code with a success confirmation message.
4. IF no note exists with the provided slug, THEN THE API SHALL return a 404 status code with a not found error message.
5. IF a database error occurs during the deletion operation, THEN THE API SHALL return a 500 status code with an error message.

### Requirement 6: Link Synchronization Helper

**User Story:** As a developer, I want a reusable helper function to synchronize wikilinks, so that link management is consistent across create and update operations.

#### Acceptance Criteria

1. WHEN the `syncLinks` function is called with a source slug and content string, THE API SHALL parse all `[[target-slug]]` patterns from the content.
2. WHEN parsing is complete, THE API SHALL delete all existing link records where `source_slug` matches the provided slug.
3. WHEN old links are deleted, THE API SHALL insert new link records for each parsed target slug.
4. IF the content contains no wikilinks, THEN THE API SHALL only delete existing links without inserting new ones.
5. IF a database error occurs during link synchronization, THEN THE API SHALL propagate the error to the calling function.
