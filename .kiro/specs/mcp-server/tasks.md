# Implementation Plan

- [x] 1. Add MCP type definitions

  - Add MCPTool, MCPManifest, MCPToolRequest, MCPResponse types to `src/types/index.ts`
  - Add tool-specific result types (ListPagesResult, GetPageResult, SearchToolResult, AskResult, GetConnectionsResult)
  - _Requirements: 1.1, 8.1, 8.2, 8.3_

- [x] 2. Create MCP API route with manifest endpoint

  - Create `src/app/api/mcp/route.ts`
  - Implement GET handler returning tool manifest with all 5 tools
  - Define tool schemas with names, descriptions, and input schemas
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 3. Implement tool router and error handling

  - Add POST handler with JSON parsing and validation
  - Implement tool routing based on `tool` field
  - Add error responses for invalid JSON, missing tool, unknown tool, missing params
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.1_

- [x] 4. Implement list_pages tool

  - Query all notes from Supabase with slug and title
  - Return sorted by created_at descending
  - Handle empty results
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 5. Implement get_page tool

  - Query note by slug from Supabase
  - Extract outlinks using parseWikilinks
  - Query backlinks from links table
  - Return full note data with links
  - Handle not found case
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 6. Implement search tool

  - Search notes by title and content using existing pattern
  - Generate excerpts around matches
  - Limit to 20 results
  - Handle no matches
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 7. Implement ask tool

  - Check AI search availability (config + API key)
  - Search for relevant notes
  - Call aiSearch with question and notes
  - Return answer with source citations
  - Handle unavailable/no results cases
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 8. Implement get_connections tool

  - Query note to verify existence
  - Extract outlinks from content
  - Query backlinks from links table
  - Generate local graph using getLocalGraph
  - Handle not found case
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 9. Write unit tests for MCP endpoint
  - Test GET manifest returns correct structure
  - Test POST tool routing and error handling
  - Test individual tool handlers
  - _Requirements: 1.1, 7.1, 7.2, 7.3_
