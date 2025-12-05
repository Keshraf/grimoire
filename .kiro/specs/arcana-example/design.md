# Design Document: Arcana Example

## Overview

Arcana is a demonstration application built on the NEXUS skeleton, showcasing a personal knowledge management use case with a dark, mystical aesthetic. It features interconnected philosophical notes about consciousness, creativity, and the nature of mind, demonstrating how wikilinks create an explorable knowledge graph.

The example consists of:

1. A customized `nexus.config.yaml` for the Arcana theme and settings
2. Seed data SQL with 10+ interconnected philosophical notes
3. A TypeScript seed script to populate the database
4. Deployment configuration for Vercel

## Architecture

```
/examples/
├── arcana/
│   ├── nexus.config.yaml    # Arcana-specific configuration
│   ├── seed-data.sql        # Arcana notes (philosophy/creativity)
│   └── README.md            # Setup instructions for Arcana
└── [future-example]/
    ├── nexus.config.yaml    # Different configuration
    ├── seed-data.sql        # Different content
    └── README.md            # Setup instructions

/scripts/
└── seed.ts                  # Generic seeding script (takes example name as arg)
```

### Data Isolation Strategy

Each example maintains **completely separate data**:

1. **Different Supabase Projects**: Each deployed example uses its own Supabase project/database
2. **Example-Specific Seed Files**: Each example has its own `seed-data.sql` with unique content
3. **Configuration Copying**: To deploy an example, copy its `nexus.config.yaml` to the root

### Switching Between Examples

```bash
# To deploy Arcana:
cp examples/arcana/nexus.config.yaml ./nexus.config.yaml
npm run seed -- arcana

# To deploy a different example:
cp examples/other/nexus.config.yaml ./nexus.config.yaml
npm run seed -- other
```

Each example is self-contained and can be deployed independently to different Vercel projects with different Supabase backends.

## Components and Interfaces

### Configuration File (nexus.config.yaml)

The Arcana configuration overrides default NEXUS settings:

```yaml
site:
  title: "Arcana"
  description: "A mystical knowledge base exploring consciousness and creativity"

mode: "personal"

theme:
  preset: "dark"
  custom_css: "./themes/arcana.css"

features:
  local_graph: true
  backlinks_panel: true
  linear_nav: false
  tags: true
  search: true
  ai_search: false
  import_export: true
  mcp_server: true

auth:
  mode: "password"
```

### Seed Data Structure

Each note follows this structure:

- **title**: Unique identifier and display title (e.g., "Consciousness")
- **content**: Markdown with wikilinks using `[[Title]]` syntax
- **tags**: Array of categorization tags

### Note Topics

| Title                 | Links To                               | Tags                   |
| --------------------- | -------------------------------------- | ---------------------- |
| Consciousness         | Qualia, Free Will, Philosophy of Mind  | philosophy, mind       |
| Qualia                | Consciousness, Subjective Experience   | philosophy, perception |
| Free Will             | Consciousness, Determinism             | philosophy, agency     |
| Creativity            | Consciousness, Flow State, Imagination | creativity, mind       |
| Flow State            | Creativity, Consciousness, Focus       | psychology, creativity |
| Philosophy of Mind    | Consciousness, Qualia, Dualism         | philosophy             |
| Subjective Experience | Qualia, Consciousness                  | philosophy, perception |
| Determinism           | Free Will, Causality                   | philosophy             |
| Imagination           | Creativity, Consciousness              | creativity, mind       |
| Dualism               | Consciousness, Philosophy of Mind      | philosophy             |
| Causality             | Determinism, Free Will                 | philosophy             |
| Focus                 | Flow State, Consciousness              | psychology             |

### Seed Script Interface

```typescript
interface SeedResult {
  notesCreated: number;
  linksCreated: number;
  errors: string[];
}

// Takes example name as argument to locate the correct seed-data.sql
async function seed(exampleName: string): Promise<SeedResult>;

// Usage: npm run seed -- arcana
// Reads from: examples/arcana/seed-data.sql
```

### Example README Template

Each example includes a README.md with:

1. Description of the example use case
2. Prerequisites (Supabase project, environment variables)
3. Step-by-step deployment instructions
4. Demo credentials (if using password auth)

## Data Models

Uses existing NEXUS schema from `scripts/setup-supabase.sql`:

```sql
-- Notes table (existing)
notes (
  id UUID PRIMARY KEY,
  title TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Links table (existing)
links (
  id UUID PRIMARY KEY,
  source_title TEXT NOT NULL,
  target_title TEXT NOT NULL,
  created_at TIMESTAMPTZ
)
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Wikilink Count Consistency

_For any_ note in the Arcana seed data, the note content SHALL contain between 2 and 3 wikilinks (inclusive) to other notes.

**Validates: Requirements 2.2**

### Property 2: Tag Presence

_For any_ note in the Arcana seed data, the note SHALL have at least one tag assigned for categorization.

**Validates: Requirements 2.4**

### Property 3: Link Table Integrity

_For any_ wikilink `[[target]]` found in a note's content, there SHALL exist a corresponding entry in the links table with the note's title as source_title and the target as target_title.

**Validates: Requirements 3.3**

## Error Handling

| Scenario                      | Handling                                                         |
| ----------------------------- | ---------------------------------------------------------------- |
| Database connection failure   | Seed script exits with error message and non-zero code           |
| Duplicate title on insert     | Script uses INSERT with conflict handling                        |
| Invalid wikilink target       | Link is still created; broken links are handled by UI gracefully |
| Missing environment variables | Script validates required env vars before execution              |

## Testing Strategy

### Unit Tests

- Verify configuration file structure matches expected schema
- Verify seed SQL syntax is valid
- Verify wikilink extraction from markdown content

### Property-Based Tests

Using **Vitest** with custom property assertions:

1. **Property 1 (Wikilink Count)**: Parse each note's content, extract wikilinks, verify count is 2-3
2. **Property 2 (Tag Presence)**: For each note, verify tags array is non-empty
3. **Property 3 (Link Integrity)**: Extract wikilinks from content, verify matching links table entries

Each property test will run against the seed data SQL to validate correctness before deployment.

Test annotation format: `**Feature: arcana-example, Property {number}: {property_text}**`
