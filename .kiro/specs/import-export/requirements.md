# Requirements Document

## Introduction

This document specifies the requirements for import/export functionality in NEXUS. The feature enables users to bulk import markdown files into the knowledge base and export all notes as a downloadable zip archive. This supports data portability, backup workflows, and migration from other note-taking systems like Obsidian.

## Glossary

- **Import_System**: The server-side component that processes uploaded markdown files and inserts them into the database
- **Export_System**: The server-side component that generates downloadable zip archives of all notes
- **Frontmatter**: YAML metadata at the beginning of a markdown file, delimited by `---`
- **Wikilink**: Internal link syntax using `[[slug]]` format
- **Slug**: URL-friendly identifier for a note (e.g., "my-note-title")
- **Import_Modal**: The UI component providing drag-drop and file picker interfaces for importing files
- **Export_Modal**: The UI component providing download options for exporting notes

## Requirements

### Requirement 1: Import Markdown Files via API

**User Story:** As a user, I want to upload multiple markdown files to import them as notes, so that I can migrate my existing notes from other systems.

#### Acceptance Criteria

1. WHEN the Import_System receives a POST request with multipart form data containing .md files, THE Import_System SHALL parse each file and extract frontmatter metadata (title, tags).
2. WHEN a markdown file lacks frontmatter title, THE Import_System SHALL use the filename (without extension) as the note title.
3. WHEN the Import_System successfully parses a markdown file, THE Import_System SHALL generate a slug from the title and insert the note into the database.
4. WHEN the Import_System inserts a note, THE Import_System SHALL parse wikilinks from the content and populate the links table.
5. WHEN the Import_System completes processing all files, THE Import_System SHALL return a JSON response containing the count of imported notes and an array of errors for failed imports.
6. IF a note with the same slug already exists, THEN THE Import_System SHALL skip that file and include it in the errors array with a conflict message.

### Requirement 2: Export Notes as Zip Archive

**User Story:** As a user, I want to download all my notes as a zip file of markdown files, so that I can back up my knowledge base or migrate to another system.

#### Acceptance Criteria

1. WHEN the Export_System receives a GET request, THE Export_System SHALL retrieve all notes from the database.
2. WHEN the Export_System generates a markdown file for a note, THE Export_System SHALL include frontmatter containing title, tags, and timestamps.
3. WHEN the Export_System has generated all markdown files, THE Export_System SHALL package them into a zip archive.
4. WHEN the zip archive is ready, THE Export_System SHALL return it as a downloadable file with Content-Disposition header set to attachment.
5. WHERE the user requests backlinks in frontmatter, THE Export_System SHALL include a backlinks array in each note's frontmatter listing slugs that link to it.

### Requirement 3: Import/Export Modal UI

**User Story:** As a user, I want a modal interface with tabs for importing and exporting notes, so that I can easily manage data transfer operations.

#### Acceptance Criteria

1. WHEN the user opens the Import_Modal import tab, THE Import_Modal SHALL display a drag-drop zone that accepts .md files.
2. WHEN the user opens the Import_Modal import tab, THE Import_Modal SHALL display a file picker button as an alternative to drag-drop.
3. WHEN the user drops or selects files, THE Import_Modal SHALL display upload progress and processing status.
4. WHEN the import operation completes, THE Import_Modal SHALL display results showing count of imported notes and any errors.
5. WHEN the user opens the Export_Modal export tab, THE Export_Modal SHALL display a button to download all notes as a zip file.
6. WHEN the user opens the Export_Modal export tab, THE Export_Modal SHALL display a checkbox option to include backlinks in frontmatter.
7. WHEN the user clicks the download button, THE Export_Modal SHALL initiate the zip download and display progress feedback.
