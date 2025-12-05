# Requirements Document

## Introduction

This specification covers the final preparation of the NEXUS project for the Kiroween Hackathon submission in the Skeleton Crew category. The project must be restructured to contain two separate deployable applications (Codex and Arcana) from a single skeleton codebase, include comprehensive user documentation, and provide a detailed write-up demonstrating effective Kiro usage throughout development.

## Glossary

- **NEXUS**: The skeleton template for building knowledge bases with horizontal, linear, and graphical navigation modes
- **Skeleton Crew**: Hackathon category requiring a lean code template demonstrated through two distinct applications
- **Arcana**: Personal knowledge base example with dark mystical theme and exploration-focused navigation
- **Codex**: API documentation example with light professional theme and linear navigation
- **Vercel**: Cloud platform for deploying Next.js applications
- **MCP (Model Context Protocol)**: Protocol enabling AI agents to query deployed NEXUS instances
- **Kiro**: AI-powered IDE with specs, hooks, steering, and MCP integration features

## Requirements

### Requirement 1: Repository Structure for Skeleton Crew

**User Story:** As a hackathon judge, I want to see two separate application folders in the repository, so that I can verify the skeleton template's versatility.

#### Acceptance Criteria

1. THE Repository SHALL contain an `/apps/arcana` folder with a complete deployable Arcana application
2. THE Repository SHALL contain an `/apps/codex` folder with a complete deployable Codex application
3. THE Repository SHALL contain a `/packages/nexus-core` folder with shared skeleton code that both applications import
4. WHEN a user clones the repository THEN the Repository SHALL provide clear separation between skeleton code and application-specific configurations
5. THE Repository SHALL maintain the `/.kiro` directory at the root level with all specs, hooks, and steering files visible

### Requirement 2: Vercel Deployment Configuration

**User Story:** As a developer using this skeleton, I want each application to be independently deployable to Vercel, so that I can host my knowledge base with minimal configuration.

#### Acceptance Criteria

1. THE Arcana Application SHALL include a `vercel.json` configuration file enabling one-click deployment
2. THE Codex Application SHALL include a `vercel.json` configuration file enabling one-click deployment
3. WHEN deploying to Vercel THEN each Application SHALL only require environment variables to be set in the Vercel dashboard
4. THE Repository SHALL include deployment instructions that a non-technical user can follow within 15 minutes
5. WHEN both applications are deployed THEN each Application SHALL function independently without conflicts

### Requirement 3: User-Friendly Setup Guide

**User Story:** As a non-developer user, I want a comprehensive setup guide written in plain language, so that I can deploy my own NEXUS instance without deep technical knowledge.

#### Acceptance Criteria

1. THE Setup Guide SHALL include step-by-step instructions with screenshots for creating a Supabase project
2. THE Setup Guide SHALL explain environment variables in plain language without assuming prior knowledge
3. THE Setup Guide SHALL provide a troubleshooting section addressing common setup errors
4. WHEN a user follows the guide THEN the User SHALL be able to deploy a working instance within 30 minutes
5. THE Setup Guide SHALL include a quick-start checklist summarizing all required steps
6. THE Setup Guide SHALL explain how to customize the `nexus.config.yaml` file with examples for common use cases

### Requirement 4: Hackathon Documentation - Kiro Usage Write-up

**User Story:** As a hackathon judge, I want to understand how Kiro was used throughout development, so that I can evaluate the effective implementation of Kiro features.

#### Acceptance Criteria

1. THE Write-up SHALL document specific examples of vibe coding conversations that generated significant code
2. THE Write-up SHALL describe agent hooks configured and how they improved the development workflow
3. THE Write-up SHALL explain the spec-driven development approach used for major features
4. THE Write-up SHALL detail steering documents created and their impact on AI response quality
5. THE Write-up SHALL describe MCP integrations used during development and their benefits
6. WHEN judges read the write-up THEN Judges SHALL understand the depth of Kiro feature utilization

### Requirement 5: Project Value Documentation

**User Story:** As a hackathon judge, I want to understand the unique value proposition of NEXUS, so that I can evaluate its potential impact and usefulness.

#### Acceptance Criteria

1. THE Documentation SHALL explain the three navigation modes (horizontal, linear, graphical) and their use cases
2. THE Documentation SHALL describe the inspiration from Andy Matuschak's notes and the problem being solved
3. THE Documentation SHALL highlight the AI-native features including MCP server integration
4. THE Documentation SHALL explain how the skeleton approach enables diverse applications from one codebase
5. THE Documentation SHALL include comparison with existing tools (Obsidian, GitBook, traditional wikis)

### Requirement 6: Monorepo Configuration

**User Story:** As a developer, I want the monorepo to use proper workspace tooling, so that dependencies are managed efficiently and builds are reliable.

#### Acceptance Criteria

1. THE Repository SHALL use npm workspaces or equivalent for managing multiple packages
2. WHEN running `npm install` at the root THEN the System SHALL install dependencies for all packages
3. THE Repository SHALL include scripts for building and running each application independently
4. WHEN shared code in `nexus-core` is modified THEN both Applications SHALL reflect the changes after rebuild
5. THE Repository SHALL include a root `package.json` with workspace configuration and common scripts
