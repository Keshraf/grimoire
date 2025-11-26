# Requirements Document

## Introduction

This document defines the requirements for a SearchModal component in NEXUS, providing users with a unified search experience that combines full-text search with optional AI-powered question answering. The modal allows users to quickly find notes by title or content, and when AI search is enabled, receive synthesized answers to natural language questions with source citations.

## Glossary

- **SearchModal**: A modal dialog component that provides search functionality for finding notes
- **Full-Text Search**: Database-level text search using Supabase's PostgreSQL full-text search capabilities
- **AI Search**: Optional feature that uses OpenAI/Anthropic APIs to answer questions based on note content
- **SearchResult**: An object containing slug, title, excerpt, and relevance score for a matched note
- **AISearchResult**: An object containing an AI-generated answer and array of source SearchResults
- **NexusConfig**: The application configuration object loaded from nexus.config.yaml

## Requirements

### Requirement 1: Search API Endpoint

**User Story:** As a user, I want to search my notes by text content, so that I can quickly find relevant information.

#### Acceptance Criteria

1. WHEN the user submits a search query via POST to `/api/search`, THE Search_API SHALL return an array of SearchResult objects matching the query within 2 seconds.
2. WHEN the search query matches note titles or content, THE Search_API SHALL return results ordered by relevance score in descending order.
3. WHEN no notes match the search query, THE Search_API SHALL return an empty array.
4. IF the search query is empty or missing, THEN THE Search_API SHALL return a 400 Bad Request response with an error message.

### Requirement 2: AI Search Functionality

**User Story:** As a user, I want to ask natural language questions about my notes, so that I can get synthesized answers without reading multiple documents.

#### Acceptance Criteria

1. WHERE AI search is enabled in config, WHEN the user submits a question-style query, THE AI_Search_Module SHALL generate an answer based on relevant note content.
2. WHEN generating an AI answer, THE AI_Search_Module SHALL include source references linking to the notes used for the answer.
3. IF the OpenAI/Anthropic API call fails, THEN THE AI_Search_Module SHALL return an error message and fall back to standard search results.
4. WHEN building context for the AI, THE AI_Search_Module SHALL limit context to the most relevant notes to stay within token limits.

### Requirement 3: SearchModal UI Component

**User Story:** As a user, I want a modal interface to search my notes, so that I can access search from anywhere in the application.

#### Acceptance Criteria

1. WHEN the SearchModal opens, THE SearchModal SHALL focus the search input field automatically.
2. WHEN the user types in the search input, THE SearchModal SHALL display search results after a 300ms debounce delay.
3. WHEN search results are available, THE SearchModal SHALL display each result with title and excerpt.
4. WHERE AI search is enabled and the query appears to be a question, THE SearchModal SHALL display the AI answer above the search results.
5. WHEN the user clicks a search result, THE SearchModal SHALL call the onSelect callback with the selected note's slug and close the modal.

### Requirement 4: Keyboard Navigation

**User Story:** As a user, I want to navigate search results with my keyboard, so that I can quickly select results without using a mouse.

#### Acceptance Criteria

1. WHEN the user presses the ArrowDown key, THE SearchModal SHALL move focus to the next search result in the list.
2. WHEN the user presses the ArrowUp key, THE SearchModal SHALL move focus to the previous search result in the list.
3. WHEN the user presses Enter with a result focused, THE SearchModal SHALL select that result and close the modal.
4. WHEN the user presses Escape, THE SearchModal SHALL close the modal without selecting a result.

### Requirement 5: Loading and Error States

**User Story:** As a user, I want clear feedback during search operations, so that I understand the current state of my search.

#### Acceptance Criteria

1. WHILE a search request is in progress, THE SearchModal SHALL display a loading indicator.
2. IF a search request fails, THEN THE SearchModal SHALL display an error message to the user.
3. WHEN the search input is empty, THE SearchModal SHALL display placeholder text indicating how to search.
