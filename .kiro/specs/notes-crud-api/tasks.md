# Implementation Plan

- [x] 1. Create helper functions module

  - [x] 1.1 Create `src/lib/links.ts` with link utility functions
    - Implement `parseWikilinks(content: string): string[]` using regex `/\[\[([^\]]+)\]\]/g`
    - Implement `generateSlug(title: string): string` for URL-friendly slug generation
    - Implement `syncLinks(slug: string, content: string): Promise<void>` to delete old links and insert new ones
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [x] 1.2 Add Link type to `src/types/index.ts`
    - Add `Link` interface with id, source_slug, target_slug, created_at fields
    - _Requirements: 6.1_

- [x] 2. Implement notes collection API route

  - [x] 2.1 Create `src/app/api/notes/route.ts` with GET handler
    - Fetch all notes from Supabase ordered by created_at descending
    - Return JSON response with proper error handling
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 2.2 Add POST handler to `src/app/api/notes/route.ts`
    - Validate required title field (return 400 if missing)
    - Auto-generate slug from title if not provided using `generateSlug`
    - Check for slug conflicts (return 409 if exists)
    - Insert note into Supabase
    - Call `syncLinks` to parse and store wikilinks
    - Return 201 with created note
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 3. Implement single note API route

  - [x] 3.1 Create `src/app/api/notes/[slug]/route.ts` with GET handler
    - Fetch note by slug from Supabase
    - Query links table for backlinks (where target_slug matches)
    - Return note with backlinks array
    - Handle 404 for non-existent notes
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [x] 3.2 Add PUT handler to `src/app/api/notes/[slug]/route.ts`
    - Validate note exists (return 404 if not)
    - Update note fields in Supabase
    - If content is updated, call `syncLinks` to re-sync wikilinks
    - Return updated note
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [x] 3.3 Add DELETE handler to `src/app/api/notes/[slug]/route.ts`
    - Validate note exists (return 404 if not)
    - Delete note from Supabase (CASCADE handles links cleanup)
    - Return success message
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 4. Write tests for link utilities
  - [x] 4.1 Create tests for `parseWikilinks` function
    - Test empty content returns empty array
    - Test single wikilink extraction
    - Test multiple wikilinks extraction
    - Test duplicate links are deduplicated
    - _Requirements: 6.1_
  - [x] 4.2 Create tests for `generateSlug` function
    - Test basic title to slug conversion
    - Test special character removal
    - Test whitespace handling
    - _Requirements: 2.2_
