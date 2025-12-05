# Implementation Plan

- [x] 1. Create Codex configuration file

  - [x] 1.1 Create examples/codex/nexus.config.yaml with documentation mode settings
    - Set site.title to "Codex API Docs" and site.description
    - Set mode to "documentation"
    - Configure theme.preset to "light" with custom_css pointing to codex.css
    - Enable linear_nav, search, backlinks_panel, and mcp_server features
    - Define navigation.sections with all four sections and their pages
    - Set auth.mode to "none" for public read access
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 2. Create seed data SQL file

  - [x] 2.1 Create examples/codex/seed-data.sql with Getting Started section pages

    - Create "Introduction" page with API overview, features, and links to other pages
    - Create "Installation" page with SDK setup for multiple languages
    - Create "Quick Start" page with first API call examples
    - Include section and order fields for linear navigation
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 2.2 Add Authentication section pages to seed-data.sql

    - Create "Authentication Overview" page explaining auth methods
    - Create "OAuth 2.0" page with authorization flow documentation
    - Create "API Keys" page with key management instructions
    - Include wikilinks between auth pages and to API Reference
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 2.3 Add API Reference section pages to seed-data.sql

    - Create "Users API" page with CRUD endpoints, parameters, and examples
    - Create "Posts API" page with post management endpoints
    - Create "Comments API" page with comment endpoints
    - Include HTTP methods, request/response examples, and code blocks
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 2.4 Add Guides section pages to seed-data.sql

    - Create "Pagination" page with cursor and offset pagination examples
    - Create "Error Handling" page with error codes and response formats
    - Create "Rate Limiting" page with rate limit documentation
    - Include practical code examples in each guide
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 2.5 Add links table INSERT statements to seed-data.sql

    - Extract all wikilinks from page content
    - Create corresponding INSERT statements for links table
    - Ensure bidirectional links where appropriate
    - _Requirements: 2.4, 2.5_

  - [ ]\* 2.6 Write property test for seed data page count

    - **Property 1: Seed Data Page Count**
    - **Validates: Requirements 2.1**

  - [ ]\* 2.7 Write property test for seed data completeness

    - **Property 2: Seed Data Completeness**
    - **Validates: Requirements 2.2, 2.3**

  - [ ]\* 2.8 Write property test for wikilink-link consistency
    - **Property 3: Wikilink-Link Consistency**
    - **Validates: Requirements 2.4, 2.5**

- [x] 3. Checkpoint - Verify seed data structure

  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create README documentation

  - [x] 4.1 Create examples/codex/README.md with setup instructions
    - Describe Codex as API documentation example
    - Include prerequisites (Supabase, Node.js, environment variables)
    - Document setup steps: copy config, seed database, run dev server
    - Include customization guidance for creating similar documentation sites
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 5. Validate MCP server integration

  - [ ]\* 5.1 Write property test for MCP get_page response

    - **Property 6: MCP Get Page Response**
    - **Validates: Requirements 8.2**

  - [ ]\* 5.2 Write property test for MCP search results
    - **Property 7: MCP Search Results**
    - **Validates: Requirements 8.3**

- [x] 6. Validate linear navigation

  - [ ]\* 6.1 Write property test for linear navigation middle pages
    - **Property 8: Linear Navigation Middle Pages**
    - **Validates: Requirements 9.1, 9.4**

- [x] 7. Content quality validation

  - [ ]\* 7.1 Write property test for API Reference content structure

    - **Property 4: API Reference Content Structure**
    - **Validates: Requirements 5.4**

  - [ ]\* 7.2 Write property test for Guide code examples
    - **Property 5: Guide Code Examples**
    - **Validates: Requirements 6.3**

- [x] 8. Final Checkpoint - Verify all features work
  - Ensure all tests pass, ask the user if questions arise.
