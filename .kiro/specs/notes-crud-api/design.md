# Design Document

## Overview

This design describes the implementation of RESTful API routes for notes CRUD operations in a Next.js App Router application with Supabase as the backend. The API provides endpoints for listing, creating, reading, updating, and deleting notes, with automatic synchronization of wikilink relationships.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Application                        │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js API Route Handlers                    │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐  │
│  │  /api/notes/route.ts    │  │  /api/notes/[slug]/route.ts │  │
│  │  - GET (list all)       │  │  - GET (single + backlinks) │  │
│  │  - POST (create)        │  │  - PUT (update)             │  │
│  └─────────────────────────┘  │  - DELETE                   │  │
│                               └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Helper Functions                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  src/lib/links.ts                                        │   │
│  │  - syncLinks(slug, content) - parse & sync wikilinks     │   │
│  │  - generateSlug(title) - create URL-friendly slug        │   │
│  │  - parseWikilinks(content) - extract [[links]]           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Supabase                                 │
│  ┌──────────────────────┐    ┌──────────────────────────────┐  │
│  │     notes table      │    │        links table           │  │
│  │  - id (UUID)         │    │  - id (UUID)                 │  │
│  │  - slug (unique)     │◄───│  - source_slug (FK)          │  │
│  │  - title             │    │  - target_slug               │  │
│  │  - content           │    │  - created_at                │  │
│  │  - tags[]            │    └──────────────────────────────┘  │
│  │  - section           │                                      │
│  │  - order             │                                      │
│  │  - created_at        │                                      │
│  │  - updated_at        │                                      │
│  └──────────────────────┘                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### API Route: `/api/notes/route.ts`

Handles collection-level operations for notes.

#### GET Handler

```typescript
// Response: Note[]
GET / api / notes;
```

- Fetches all notes from Supabase ordered by `created_at` descending
- Returns array of Note objects

#### POST Handler

```typescript
// Request body
interface CreateNoteRequest {
  title: string;
  content?: string;
  slug?: string; // Optional - auto-generated if not provided
  tags?: string[];
  section?: string;
  order?: number;
}

// Response: Note
POST / api / notes;
```

- Validates required `title` field
- Auto-generates slug from title if not provided
- Creates note in database
- Calls `syncLinks()` to parse and store wikilinks
- Returns created note with 201 status

### API Route: `/api/notes/[slug]/route.ts`

Handles individual note operations.

#### GET Handler

```typescript
// Response
interface NoteWithBacklinks extends Note {
  backlinks: string[];  // Array of slugs that link to this note
}

GET /api/notes/:slug
```

- Fetches note by slug
- Queries links table for backlinks (where `target_slug` = slug)
- Returns note with backlinks array

#### PUT Handler

```typescript
// Request body
interface UpdateNoteRequest {
  title?: string;
  content?: string;
  tags?: string[];
  section?: string;
  order?: number;
}

// Response: Note
PUT /api/notes/:slug
```

- Updates specified fields
- If content is updated, calls `syncLinks()` to re-sync wikilinks
- Returns updated note

#### DELETE Handler

```typescript
DELETE /api/notes/:slug
// Response: { message: string }
```

- Deletes note by slug
- Links are automatically removed via CASCADE constraint
- Returns success message

### Helper Module: `src/lib/links.ts`

#### parseWikilinks

```typescript
function parseWikilinks(content: string): string[];
```

- Uses regex `/\[\[([^\]]+)\]\]/g` to extract wikilink targets
- Returns array of unique target slugs
- Handles edge cases (empty content, no links)

#### generateSlug

```typescript
function generateSlug(title: string): string;
```

- Converts title to lowercase
- Replaces spaces with hyphens
- Removes special characters (keeps alphanumeric and hyphens)
- Trims leading/trailing hyphens

#### syncLinks

```typescript
async function syncLinks(slug: string, content: string): Promise<void>;
```

- Parses wikilinks from content
- Deletes existing links where `source_slug` = slug
- Inserts new link records for each target
- Uses Supabase client for database operations

## Data Models

### Note (existing type in `src/types/index.ts`)

```typescript
interface Note {
  id: string;
  slug: string;
  title: string;
  content: string;
  tags: string[];
  section?: string;
  order?: number;
  created_at: string;
  updated_at: string;
}
```

### Link (new type)

```typescript
interface Link {
  id: string;
  source_slug: string;
  target_slug: string;
  created_at: string;
}
```

### API Response Types

```typescript
interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface NoteWithBacklinks extends Note {
  backlinks: string[];
}
```

## Error Handling

All API routes follow consistent error handling patterns:

| Scenario                | Status Code | Response Body                                       |
| ----------------------- | ----------- | --------------------------------------------------- |
| Success (GET/PUT)       | 200         | `{ data: Note }` or `{ data: Note[] }`              |
| Success (POST)          | 201         | `{ data: Note }`                                    |
| Success (DELETE)        | 200         | `{ message: "Note deleted successfully" }`          |
| Missing required fields | 400         | `{ error: "Title is required" }`                    |
| Note not found          | 404         | `{ error: "Note not found" }`                       |
| Slug conflict           | 409         | `{ error: "A note with this slug already exists" }` |
| Database error          | 500         | `{ error: "Failed to [operation]" }`                |

### Error Response Structure

```typescript
// All error responses use NextResponse.json()
return NextResponse.json({ error: "Error message" }, { status: statusCode });
```

## Testing Strategy

### Unit Tests

- `parseWikilinks`: Test regex parsing with various content patterns
  - Empty content
  - Single link
  - Multiple links
  - Nested brackets
  - Duplicate links (should dedupe)
- `generateSlug`: Test slug generation
  - Basic title conversion
  - Special characters removal
  - Multiple spaces handling

### Integration Tests

- API route handlers with mocked Supabase client
- Test each HTTP method with valid/invalid inputs
- Verify correct status codes and response shapes

### Manual Testing

- Create note with wikilinks, verify links table populated
- Update note content, verify links re-synced
- Delete note, verify cascade removes links
- Fetch note, verify backlinks returned correctly
