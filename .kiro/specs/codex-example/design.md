# Design Document: Codex API Documentation Example

## Overview

Codex is the second example application built on the NEXUS skeleton, demonstrating its versatility for technical API documentation. While Arcana showcases personal knowledge management with a dark mystical theme, Codex presents a professional, light-themed documentation site with linear navigation optimized for sequential reading.

The example consists of three main artifacts:

1. `nexus.config.yaml` - Configuration for documentation mode
2. `seed-data.sql` - 15+ API documentation pages with realistic content
3. `README.md` - Setup and customization instructions

## Architecture

```
examples/codex/
├── nexus.config.yaml    # Documentation mode configuration
├── seed-data.sql        # API documentation content
├── README.md            # Setup instructions
└── __tests__/
    └── seed-data.test.ts  # Validation tests
```

The Codex example leverages existing NEXUS infrastructure:

- **LinearNav component** - Provides prev/next navigation between ordered pages
- **MCP Server** - Enables AI agent queries against documentation
- **Supabase** - Stores notes with section and order fields
- **Config system** - Loads codex-specific settings from YAML

## Components and Interfaces

### Configuration Structure

```yaml
site:
  title: "Codex API Docs"
  description: "Professional API documentation"

mode: "documentation"

theme:
  preset: "light"
  custom_css: "./themes/codex.css"

features:
  linear_nav: true
  mcp_server: true

navigation:
  sections:
    - title: "Getting Started"
      pages: ["Introduction", "Installation", "Quick Start"]
    - title: "Authentication"
      pages: ["Authentication Overview", "OAuth 2.0", "API Keys"]
    - title: "API Reference"
      pages: ["Users API", "Posts API", "Comments API"]
    - title: "Guides"
      pages: ["Pagination", "Error Handling", "Rate Limiting"]

auth:
  mode: "none"
```

### Seed Data Structure

Each documentation page follows this pattern:

```sql
INSERT INTO notes (title, content, tags, section, "order") VALUES
(
  'Page Title',
  '# Page Title\n\nContent with [[Wikilinks]]...',
  ARRAY['tag1', 'tag2'],
  'Section Name',
  1  -- Order within section
);
```

### Navigation Flow

```mermaid
graph LR
    A[Introduction] --> B[Installation]
    B --> C[Quick Start]
    C --> D[Auth Overview]
    D --> E[OAuth 2.0]
    E --> F[API Keys]
    F --> G[Users API]
    G --> H[Posts API]
    H --> I[Comments API]
    I --> J[Pagination]
    J --> K[Error Handling]
    K --> L[Rate Limiting]
```

## Data Models

### Note with Documentation Fields

```typescript
interface DocumentationNote {
  id: string;
  title: string; // Primary identifier
  content: string; // Markdown with wikilinks
  tags: string[]; // Categorization tags
  section: string; // Section name for grouping
  order: number; // Position within section
  created_at: string;
  updated_at: string;
}
```

### Navigation Section

```typescript
interface NavigationSection {
  title: string; // Section display name
  pages: string[]; // Ordered list of page titles
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Seed Data Page Count

_For any_ valid Codex seed data file, the number of INSERT statements into the notes table SHALL be at least 15.
**Validates: Requirements 2.1**

### Property 2: Seed Data Completeness

_For any_ page inserted in the seed data, the page SHALL have non-null values for title, content, section, and order fields.
**Validates: Requirements 2.2, 2.3**

### Property 3: Wikilink-Link Consistency

_For any_ wikilink `[[Target]]` found in page content, there SHALL exist a corresponding record in the links table with matching source_title and target_title.
**Validates: Requirements 2.4, 2.5**

### Property 4: API Reference Content Structure

_For any_ page in the API Reference section, the content SHALL contain at least one HTTP method keyword (GET, POST, PUT, DELETE, PATCH) and at least one code block.
**Validates: Requirements 5.4**

### Property 5: Guide Code Examples

_For any_ page in the Guides section, the content SHALL contain at least one code block (markdown triple backticks).
**Validates: Requirements 6.3**

### Property 6: MCP Get Page Response

_For any_ valid page title in the database, an MCP get_page request SHALL return a response containing the page's title, content, outlinks array, and backlinks array.
**Validates: Requirements 8.2**

### Property 7: MCP Search Results

_For any_ search query that matches text in at least one page's title or content, an MCP search request SHALL return at least one result with title and excerpt.
**Validates: Requirements 8.3**

### Property 8: Linear Navigation Middle Pages

_For any_ page that is neither first nor last in the navigation order, the LinearNav component SHALL render both previous and next navigation buttons.
**Validates: Requirements 9.1, 9.4**

## Error Handling

### Configuration Errors

- Missing required fields in nexus.config.yaml: System uses defaults from config.defaults.ts
- Invalid section references: Pages not in database are skipped in navigation

### Seed Data Errors

- Duplicate titles: Database constraint prevents insertion, error logged
- Missing wikilink targets: Links table entry created, target page shows as "not found"
- Invalid SQL syntax: Seed script fails with descriptive error

### MCP Errors

- Page not found: Returns 404 with descriptive message
- Invalid tool name: Returns 400 with available tools list
- Database connection failure: Returns 500 with generic error

## Testing Strategy

### Dual Testing Approach

This feature uses both unit tests and property-based tests:

- **Unit tests**: Verify specific examples and edge cases
- **Property-based tests**: Verify universal properties across all inputs

### Property-Based Testing Framework

**Framework**: fast-check (TypeScript property-based testing library)

**Configuration**: Each property test runs minimum 100 iterations

**Test File Location**: `examples/codex/__tests__/seed-data.test.ts`

### Test Categories

1. **Configuration Validation Tests**

   - Verify nexus.config.yaml structure matches NexusConfig type
   - Verify all required fields are present
   - Verify navigation sections reference valid pages

2. **Seed Data Property Tests**

   - Property 1: Page count >= 15
   - Property 2: All pages have required fields
   - Property 3: Wikilink-link consistency
   - Property 4: API Reference content structure
   - Property 5: Guide code examples

3. **MCP Integration Tests**

   - Property 6: get_page response structure
   - Property 7: search results for matching queries

4. **Linear Navigation Tests**
   - Property 8: Middle page navigation buttons

### Test Annotations

Each property-based test includes a comment referencing the design document:

```typescript
// **Feature: codex-example, Property 1: Seed Data Page Count**
```
