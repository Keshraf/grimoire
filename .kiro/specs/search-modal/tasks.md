# Implementation Plan

- [x] 1. Create Search API endpoint

  - [x] 1.1 Create `/src/app/api/search/route.ts` with POST handler
    - Accept `{ query: string, includeAI?: boolean }` request body
    - Validate query is non-empty, return 400 if missing
    - Use Supabase full-text search on notes table
    - Return SearchResult[] ordered by relevance
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Create AI Search module

  - [x] 2.1 Create `/src/lib/ai-search.ts` with aiSearch function

    - Build context from relevant notes (limit to ~4000 tokens)
    - Call OpenAI API with system prompt for Q&A
    - Return AISearchResult with answer and sources
    - Handle API errors gracefully
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 2.2 Integrate AI search into search API route
    - Check if AI is enabled in config
    - Call aiSearch when includeAI is true
    - Include aiAnswer in response
    - _Requirements: 2.1, 2.3_

- [x] 3. Create SearchModal component

  - [x] 3.1 Create `/src/components/SearchModal.tsx` base component

    - Props: isOpen, onClose, onSelect, config
    - Modal overlay with search input (autofocus)
    - State for query, results, aiAnswer, selectedIndex, isLoading, error
    - _Requirements: 3.1, 3.3_

  - [x] 3.2 Implement debounced search functionality

    - 300ms debounce on input changes
    - Call /api/search with query
    - Display results with title and excerpt
    - Show AI answer above results when available
    - _Requirements: 3.2, 3.4_

  - [x] 3.3 Implement keyboard navigation

    - ArrowDown/ArrowUp to navigate results
    - Enter to select highlighted result
    - Escape to close modal
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 3.4 Implement loading and error states
    - Show loading indicator during search
    - Display error message on failure
    - Show placeholder when input is empty
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 4. Export and integrate SearchModal
  - [x] 4.1 Export SearchModal from components barrel file
    - Add export to `/src/components/index.ts`
    - _Requirements: 3.1_
