# Design Document: SearchModal

## Overview

The SearchModal feature provides a unified search experience combining Supabase full-text search with optional AI-powered question answering. It consists of three main parts: a search API endpoint, an AI search module, and a React modal component with keyboard navigation.

## Architecture

```mermaid
flowchart TB
    subgraph Client
        SM[SearchModal Component]
        SM --> |debounced query| API
        SM --> |onSelect| Parent[Parent Component]
    end

    subgraph API Layer
        API[/api/search]
        API --> |full-text search| SB[(Supabase)]
        API --> |if AI enabled| AIS[AI Search Module]
        AIS --> |relevant notes| OpenAI[OpenAI/Anthropic API]
    end
```

## Components and Interfaces

### 1. Search API Route (`/src/app/api/search/route.ts`)

Handles POST requests for searching notes.

```typescript
// Request body
interface SearchRequest {
  query: string;
  includeAI?: boolean; // Whether to include AI answer
}

// Response
interface SearchResponse {
  results: SearchResult[];
  aiAnswer?: AISearchResult;
  error?: string;
}
```

**Implementation Details:**

- Uses Supabase's `textSearch` function with `plainto_tsquery` for full-text search
- Searches across `title` and `content` columns
- Returns top 20 results ordered by relevance
- If `includeAI` is true and AI is configured, calls the AI search module

### 2. AI Search Module (`/src/lib/ai-search.ts`)

Handles AI-powered question answering using OpenAI or Anthropic.

```typescript
export interface AISearchOptions {
  provider: "openai" | "anthropic";
  apiKey: string;
  maxTokens?: number;
}

export async function aiSearch(
  question: string,
  relevantNotes: Note[],
  options: AISearchOptions
): Promise<AISearchResult>;
```

**Implementation Details:**

- Builds context from top 5 most relevant notes (limited to ~4000 tokens)
- Constructs a system prompt instructing the AI to answer based only on provided context
- Returns structured response with answer text and source slugs
- Handles API errors gracefully with fallback behavior

### 3. SearchModal Component (`/src/components/SearchModal.tsx`)

React component providing the search UI.

```typescript
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (slug: string) => void;
  config: NexusConfig;
}
```

**State Management:**

- `query`: Current search input value
- `results`: Array of SearchResult from API
- `aiAnswer`: Optional AISearchResult
- `selectedIndex`: Currently highlighted result index
- `isLoading`: Loading state for API calls
- `error`: Error message if search fails

## Data Models

Uses existing types from `src/types/index.ts`:

```typescript
interface SearchResult {
  slug: string;
  title: string;
  excerpt: string;
  score: number;
}

interface AISearchResult {
  answer: string;
  sources: SearchResult[];
}
```

## Error Handling

| Scenario        | Handling                                    |
| --------------- | ------------------------------------------- |
| Empty query     | Return 400 Bad Request                      |
| Supabase error  | Return 500 with error message               |
| AI API failure  | Log error, return results without AI answer |
| Network timeout | Display error in modal, allow retry         |
| Invalid API key | Return 401 Unauthorized                     |

## Testing Strategy

### Unit Tests

- AI search module: Mock OpenAI/Anthropic responses, test context building
- Search API: Mock Supabase client, test query handling and error cases

### Integration Tests

- SearchModal: Test keyboard navigation, result selection, modal open/close
- API endpoint: Test with real Supabase instance in test environment

## UI Behavior

### Modal Layout

```
┌─────────────────────────────────────┐
│ 🔍 [Search input field...        ] │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ AI Answer (if question query)  │ │
│ │ Based on: note1, note2         │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ▸ Note Title 1                      │
│   Excerpt with **match** highlight  │
│ ─────────────────────────────────── │
│   Note Title 2                      │
│   Excerpt with **match** highlight  │
│ ─────────────────────────────────── │
│   Note Title 3                      │
│   Excerpt with **match** highlight  │
└─────────────────────────────────────┘
```

### Keyboard Shortcuts

- `↓` / `↑`: Navigate results
- `Enter`: Select highlighted result
- `Escape`: Close modal
- Focus wraps from last to first result

### Debouncing

- 300ms debounce on input to prevent excessive API calls
- Cancel pending requests when new input arrives

## Dependencies

- `@supabase/supabase-js`: Database queries
- `openai` (optional): OpenAI API client for AI search
- No additional UI libraries needed (uses Tailwind CSS)
