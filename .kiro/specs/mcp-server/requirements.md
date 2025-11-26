# Requirements Document

## Introduction

This document specifies the requirements for implementing a Model Context Protocol (MCP) server endpoint in NEXUS. The MCP server will expose NEXUS knowledge base functionality to AI agents and LLM applications, enabling them to list pages, retrieve content, search notes, ask questions using AI, and explore note connections through a standardized protocol interface.

## Glossary

- **MCP**: Model Context Protocol - an open protocol that standardizes how applications provide context to Large Language Models (LLMs)
- **MCP_Server**: The NEXUS API endpoint that implements the MCP protocol at `/api/mcp`
- **Tool**: An MCP capability that can be invoked by clients to perform specific operations
- **Manifest**: A JSON response describing available MCP tools and their schemas
- **Slug**: A URL-friendly identifier for a note (e.g., "getting-started")
- **Outlinks**: Wikilinks (`[[slug]]`) found within a note's content pointing to other notes
- **Backlinks**: References from other notes that link to a specific note
- **Local_Graph**: A subset of the knowledge graph showing direct connections to a specific note

## Requirements

### Requirement 1: MCP Manifest Endpoint

**User Story:** As an AI agent developer, I want to retrieve the MCP manifest from NEXUS, so that I can discover available tools and their input schemas.

#### Acceptance Criteria

1. WHEN a GET request is sent to `/api/mcp`, THE MCP_Server SHALL return a JSON manifest containing the list of available tools with their names, descriptions, and input schemas.
2. WHEN a GET request is sent to `/api/mcp`, THE MCP_Server SHALL return a response with HTTP status code 200 and Content-Type `application/json`.
3. THE MCP_Server SHALL include the following tools in the manifest: `list_pages`, `get_page`, `search`, `ask`, and `get_connections`.

### Requirement 2: List Pages Tool

**User Story:** As an AI agent, I want to list all pages in the knowledge base, so that I can understand what content is available.

#### Acceptance Criteria

1. WHEN a POST request with tool name `list_pages` is sent to `/api/mcp`, THE MCP_Server SHALL return an array of all notes containing their slugs and titles.
2. THE MCP_Server SHALL return the notes sorted by creation date in descending order.
3. IF no notes exist in the database, THEN THE MCP_Server SHALL return an empty array.

### Requirement 3: Get Page Tool

**User Story:** As an AI agent, I want to retrieve the full content of a specific page, so that I can read and analyze its information.

#### Acceptance Criteria

1. WHEN a POST request with tool name `get_page` and input `{ slug: string }` is sent to `/api/mcp`, THE MCP_Server SHALL return the note's full content, title, outlinks, and backlinks.
2. IF the requested slug does not exist, THEN THE MCP_Server SHALL return an error response with a descriptive message indicating the page was not found.
3. THE MCP_Server SHALL resolve outlinks by parsing `[[slug]]` patterns from the note content.
4. THE MCP_Server SHALL resolve backlinks by querying notes that reference the requested slug.

### Requirement 4: Search Tool

**User Story:** As an AI agent, I want to search the knowledge base by query, so that I can find relevant pages matching specific terms.

#### Acceptance Criteria

1. WHEN a POST request with tool name `search` and input `{ query: string }` is sent to `/api/mcp`, THE MCP_Server SHALL return an array of matching pages with their slugs, titles, and relevance excerpts.
2. THE MCP_Server SHALL search both note titles and content for matches.
3. THE MCP_Server SHALL limit search results to a maximum of 20 items.
4. IF no matches are found, THEN THE MCP_Server SHALL return an empty array.

### Requirement 5: Ask Tool (AI-Powered)

**User Story:** As an AI agent, I want to ask natural language questions about the knowledge base, so that I can get synthesized answers with source citations.

#### Acceptance Criteria

1. WHEN a POST request with tool name `ask` and input `{ question: string }` is sent to `/api/mcp`, THE MCP_Server SHALL return an AI-generated answer based on relevant notes along with source references.
2. IF AI search is not enabled or the API key is not configured, THEN THE MCP_Server SHALL return an error response indicating AI search is unavailable.
3. THE MCP_Server SHALL include source citations in the response identifying which notes were used to generate the answer.
4. IF no relevant notes are found for the question, THEN THE MCP_Server SHALL return a response indicating no relevant information was found.

### Requirement 6: Get Connections Tool

**User Story:** As an AI agent, I want to explore the connections of a specific page, so that I can understand its relationships within the knowledge graph.

#### Acceptance Criteria

1. WHEN a POST request with tool name `get_connections` and input `{ slug: string }` is sent to `/api/mcp`, THE MCP_Server SHALL return the note's outlinks, backlinks, and local graph data.
2. THE MCP_Server SHALL return local graph data containing nodes (id, title, connections count) and edges (source, target) for directly connected notes.
3. IF the requested slug does not exist, THEN THE MCP_Server SHALL return an error response with a descriptive message.

### Requirement 7: Error Handling

**User Story:** As an AI agent developer, I want consistent error responses from the MCP server, so that I can handle failures gracefully.

#### Acceptance Criteria

1. IF a POST request contains an invalid or missing tool name, THEN THE MCP_Server SHALL return an error response with HTTP status code 400 and a message indicating the tool is not found.
2. IF a POST request contains invalid JSON, THEN THE MCP_Server SHALL return an error response with HTTP status code 400 and a message indicating invalid request format.
3. IF a required input parameter is missing for a tool, THEN THE MCP_Server SHALL return an error response with HTTP status code 400 and a message indicating the missing parameter.
4. IF an internal server error occurs, THEN THE MCP_Server SHALL return an error response with HTTP status code 500 and a generic error message without exposing internal details.

### Requirement 8: MCP Protocol Compliance

**User Story:** As an AI agent developer, I want the MCP server to follow standard protocol conventions, so that I can integrate it with existing MCP clients.

#### Acceptance Criteria

1. THE MCP_Server SHALL accept POST requests with JSON body containing `tool` (string) and `input` (object) fields for tool invocations.
2. THE MCP_Server SHALL return tool results in a JSON response with a `result` field containing the tool output.
3. THE MCP_Server SHALL return errors in a JSON response with an `error` field containing a descriptive message.
