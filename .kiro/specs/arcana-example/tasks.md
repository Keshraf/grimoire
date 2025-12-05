# Implementation Plan

- [x] 1. Create Arcana example directory structure

  - [x] 1.1 Create `/examples/arcana/` directory
    - Create the directory structure for the Arcana example
    - _Requirements: 4.1_
  - [x] 1.2 Create Arcana README.md with setup instructions
    - Include description, prerequisites, deployment steps, and demo password info
    - _Requirements: 4.2, 5.5_

- [x] 2. Create Arcana configuration file

  - [x] 2.1 Create `/examples/arcana/nexus.config.yaml`
    - Set site.title to "Arcana"
    - Set mode to "personal"
    - Set theme.preset to "dark" with custom_css pointing to arcana.css
    - Enable all features except ai_search
    - Set auth.mode to "password"
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3. Create seed data SQL file

  - [x] 3.1 Create `/examples/arcana/seed-data.sql` with 12 philosophical notes
    - Create notes: consciousness, qualia, free-will, creativity, flow-state, philosophy-of-mind, subjective-experience, determinism, imagination, dualism, causality, focus
    - Each note must have 2-3 wikilinks to related notes
    - Each note must have at least one tag
    - Include INSERT statements for both notes and links tables
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x] 3.2 Write property test for wikilink count consistency
    - **Property 1: Wikilink Count Consistency**
    - **Validates: Requirements 2.2**
  - [x] 3.3 Write property test for tag presence
    - **Property 2: Tag Presence**
    - **Validates: Requirements 2.4**

- [x] 4. Create seed script

  - [x] 4.1 Create `/scripts/seed.ts`
    - Accept example name as command line argument
    - Read SQL file from `examples/{name}/seed-data.sql`
    - Use environment variables for Supabase connection
    - Execute SQL against database
    - Extract wikilinks from content and populate links table
    - Report number of notes and links created
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.3_
  - [x] 4.2 Add seed script to package.json
    - Add `"seed": "npx tsx scripts/seed.ts"` script
    - _Requirements: 3.1_
  - [x] 4.3 Write property test for link table integrity
    - **Property 3: Link Table Integrity**
    - **Validates: Requirements 3.3**

- [x] 5. Checkpoint - Verify seed data and tests

  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Prepare for deployment

  - [x] 6.1 Copy Arcana config to root for deployment
    - Copy `examples/arcana/nexus.config.yaml` to root `nexus.config.yaml`
    - _Requirements: 5.2_
  - [x] 6.2 Run seed script to populate Arcana Supabase database
    - Execute `npm run seed -- arcana` against the Arcana Supabase project
    - Verify notes and links are created
    - _Requirements: 5.3_
  - [x] 6.3 Verify all features work locally
    - Test local graph, backlinks panel, search, tags, import/export
    - Verify arcana.css theme is applied
    - Test password authentication
    - _Requirements: 5.4, 5.5_

- [x] 7. Final Checkpoint - Verify everything works
  - Ensure all tests pass, ask the user if questions arise.
