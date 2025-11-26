# Implementation Plan

- [x] 1. Install dependencies and set up project structure

  - Install `gray-matter` and `jszip` packages
  - Create directory structure for new API routes
  - _Requirements: 1.1, 2.1_

- [x] 2. Implement Import API endpoint

  - [x] 2.1 Create POST /api/import/route.ts
    - Parse multipart form data to extract uploaded files
    - Filter for .md files only
    - _Requirements: 1.1_
  - [x] 2.2 Implement frontmatter parsing and note creation
    - Use gray-matter to extract title and tags from frontmatter
    - Fall back to filename (without extension) if no frontmatter title
    - Generate slug using existing `generateSlug()` function
    - Check for slug conflicts before insertion
    - Insert note into database
    - _Requirements: 1.1, 1.2, 1.3, 1.6_
  - [x] 2.3 Implement link syncing for imported notes
    - Call existing `syncLinks()` for each imported note
    - Return JSON response with imported count and errors array
    - _Requirements: 1.4, 1.5_

- [x] 3. Implement Export API endpoint

  - [x] 3.1 Create GET /api/export/route.ts
    - Fetch all notes from database
    - Parse includeBacklinks query parameter
    - _Requirements: 2.1_
  - [x] 3.2 Implement frontmatter generation and zip creation
    - Generate YAML frontmatter with title, tags, timestamps
    - Optionally compute and include backlinks from links table
    - Use JSZip to create archive with {slug}.md files
    - Return zip with Content-Disposition attachment header
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [x] 4. Implement ImportExportModal component

  - [x] 4.1 Create modal structure with tabs
    - Create ImportExportModal.tsx with isOpen/onClose props
    - Implement tab navigation between Import and Export
    - Style with Tailwind CSS matching existing modal patterns
    - _Requirements: 3.1, 3.5_
  - [x] 4.2 Implement Import tab functionality
    - Create drag-drop zone with visual feedback
    - Add file picker button as alternative
    - Display upload progress and processing status
    - Show results with imported count and error list
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [x] 4.3 Implement Export tab functionality
    - Add checkbox for "Include backlinks in frontmatter"
    - Add download button that calls export API
    - Display progress feedback during download
    - _Requirements: 3.5, 3.6, 3.7_

- [x] 5. Integrate modal into application
  - Add ImportExportModal to Layout or appropriate parent component
  - Add trigger button/menu item to open the modal
  - Export component from components/index.ts barrel file
  - _Requirements: 3.1_
