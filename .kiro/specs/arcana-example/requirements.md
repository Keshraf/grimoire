# Requirements Document

## Introduction

This specification defines the Arcana example application - a personal knowledge management demo that showcases the NEXUS skeleton's flexibility for philosophical and creative exploration. Arcana demonstrates how the skeleton can be configured for a dark, mystical aesthetic with interconnected notes about consciousness, philosophy, and creativity.

## Glossary

- **NEXUS**: The skeleton knowledge base template that supports multiple navigation modes
- **Arcana**: The example application demonstrating personal knowledge management use case
- **Wikilink**: A `[[Title]]` syntax link connecting notes to each other
- **Seed Data**: Pre-populated content demonstrating the application's capabilities
- **Personal Mode**: NEXUS configuration optimized for flat exploration without linear navigation

## Requirements

### Requirement 1

**User Story:** As a hackathon judge, I want to see a complete example configuration, so that I can understand how the NEXUS skeleton adapts to different use cases.

#### Acceptance Criteria

1. WHEN a user views the Arcana example THEN the system SHALL provide a `nexus.config.yaml` file with site title set to "Arcana"
2. WHEN the Arcana configuration is loaded THEN the system SHALL use "personal" mode for flat exploration
3. WHEN the Arcana theme is applied THEN the system SHALL use the dark arcana.css preset
4. WHEN features are configured THEN the system SHALL enable all features except ai_search
5. WHEN authentication is configured THEN the system SHALL use "password" mode

### Requirement 2

**User Story:** As a user exploring Arcana, I want to see interconnected philosophical notes, so that I can understand how wikilinks create a knowledge graph.

#### Acceptance Criteria

1. WHEN the seed data is loaded THEN the system SHALL contain at least 10 notes about philosophy and creativity topics
2. WHEN viewing any note THEN the system SHALL display 2-3 wikilinks to related notes
3. WHEN the notes are created THEN the system SHALL include topics covering Consciousness, Qualia, Free Will, Creativity, Flow State, and Philosophy of Mind
4. WHEN notes are stored THEN the system SHALL include appropriate tags for categorization

### Requirement 3

**User Story:** As a developer setting up Arcana, I want a seed script, so that I can populate the database with example content.

#### Acceptance Criteria

1. WHEN the seed script is executed THEN the system SHALL read the SQL seed file from the examples directory
2. WHEN the seed script runs THEN the system SHALL execute the SQL against the configured Supabase instance
3. WHEN notes are inserted THEN the system SHALL populate the links table based on wikilinks in content
4. WHEN the seed completes THEN the system SHALL report the number of notes and links created

### Requirement 4

**User Story:** As a developer, I want the example structure to be isolated, so that users can copy and customize it without affecting the skeleton.

#### Acceptance Criteria

1. WHEN the Arcana example is created THEN the system SHALL place all files in an `/examples/arcana/` directory
2. WHEN a user copies the example THEN the system SHALL provide self-contained configuration that works independently
3. WHEN the seed script is run THEN the system SHALL use environment variables for database connection

### Requirement 5

**User Story:** As a hackathon judge, I want to interact with a live deployed demo, so that I can evaluate the application's functionality in a real environment.

#### Acceptance Criteria

1. WHEN the Arcana demo is deployed THEN the system SHALL be accessible via a public Vercel URL
2. WHEN the deployment is configured THEN the system SHALL use the Arcana nexus.config.yaml as the active configuration
3. WHEN the database is set up THEN the system SHALL have seed data pre-populated for immediate exploration
4. WHEN a judge visits the demo THEN the system SHALL display the Arcana theme with all configured features working
5. WHEN password authentication is enabled THEN the system SHALL allow access with a shared demo password
