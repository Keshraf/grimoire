#!/usr/bin/env npx tsx
/**
 * NEXUS Database Seed Script
 *
 * Seeds the database with example data from the specified example directory.
 *
 * Usage: npm run seed -- <example-name>
 * Example: npm run seed -- arcana
 *
 * Reads SQL from: examples/<example-name>/seed-data.sql
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";

// Load environment variables from .env file
config();

interface SeedResult {
  notesCreated: number;
  linksCreated: number;
  errors: string[];
}

// Extract wikilinks from markdown content (handles [[title]] and [[title|display]])
function extractWikilinks(content: string): string[] {
  const regex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  const links: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    links.push(match[1].trim());
  }
  return Array.from(new Set(links)); // Return unique links
}

async function seed(exampleName: string): Promise<SeedResult> {
  const result: SeedResult = {
    notesCreated: 0,
    linksCreated: 0,
    errors: [],
  };

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    result.errors.push("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
    return result;
  }

  if (!supabaseKey) {
    result.errors.push(
      "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable"
    );
    return result;
  }

  // Locate seed file - check multiple locations
  const possiblePaths = [
    // When run from app workspace (apps/codex or apps/arcana)
    path.join(process.cwd(), "seed-data.sql"),
    // When run from root with example name
    path.join(process.cwd(), "examples", exampleName, "seed-data.sql"),
    // When run from root for apps
    path.join(process.cwd(), "apps", exampleName, "seed-data.sql"),
  ];

  const seedFilePath = possiblePaths.find((p) => fs.existsSync(p));

  if (!seedFilePath) {
    result.errors.push(
      `Seed file not found. Checked: ${possiblePaths.join(", ")}`
    );
    return result;
  }

  console.log(`📂 Reading seed data from: ${seedFilePath}`);

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Read and parse the SQL file
  const sql = fs.readFileSync(seedFilePath, "utf-8");

  // Parse notes from SQL
  const notes = parseNotesFromSQL(sql);
  console.log(`📝 Found ${notes.length} notes to seed`);

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await supabase
    .from("links")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase
    .from("notes")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  // Insert notes
  console.log("📥 Inserting notes...");
  for (const note of notes) {
    const insertData: Record<string, unknown> = {
      title: note.title,
      content: note.content,
      tags: note.tags,
    };

    // Add optional fields for documentation mode
    if (note.section) {
      insertData.section = note.section;
    }
    if (note.order !== undefined) {
      insertData.order = note.order;
    }

    const { error } = await supabase.from("notes").insert(insertData);

    if (error) {
      result.errors.push(
        `Failed to insert note "${note.title}": ${error.message}`
      );
    } else {
      result.notesCreated++;
    }
  }

  // Extract and insert links
  console.log("🔗 Creating links from wikilinks...");
  for (const note of notes) {
    const wikilinks = extractWikilinks(note.content);

    for (const target of wikilinks) {
      const { error } = await supabase.from("links").insert({
        source_title: note.title,
        target_title: target,
      });

      if (error) {
        // Ignore duplicate key errors
        if (!error.message.includes("duplicate")) {
          result.errors.push(
            `Failed to create link ${note.title} -> ${target}: ${error.message}`
          );
        }
      } else {
        result.linksCreated++;
      }
    }
  }

  return result;
}

// Parse notes from SQL INSERT statements
// Supports both formats:
// - (title, content, tags) - personal mode
// - (title, content, tags, section, "order") - documentation mode
function parseNotesFromSQL(sql: string): Array<{
  title: string;
  content: string;
  tags: string[];
  section?: string;
  order?: number;
}> {
  const notes: Array<{
    title: string;
    content: string;
    tags: string[];
    section?: string;
    order?: number;
  }> = [];

  // Find all INSERT INTO notes VALUES blocks
  const insertBlocks = sql.split(/INSERT INTO notes\s*\([^)]+\)\s*VALUES/i);

  for (let blockIdx = 1; blockIdx < insertBlocks.length; blockIdx++) {
    const block = insertBlocks[blockIdx];

    // Find where this VALUES block ends (at the semicolon before next statement)
    const endMatch = block.match(/;[\s]*(?:--|INSERT|$)/);
    const valuesSection = endMatch ? block.slice(0, endMatch.index) : block;

    // Parse individual entries from this VALUES section
    const entries = extractSqlEntries(valuesSection);

    for (const entry of entries) {
      const parsed = parseEntry(entry);
      if (parsed) {
        notes.push(parsed);
      }
    }
  }

  if (notes.length === 0) {
    console.warn("No notes INSERT statement found in SQL");
  }

  return notes;
}

// Extract individual SQL value entries from a VALUES section
function extractSqlEntries(valuesSection: string): string[] {
  const entries: string[] = [];
  let i = 0;

  while (i < valuesSection.length) {
    // Find start of entry
    const openParen = valuesSection.indexOf("(", i);
    if (openParen === -1) break;

    // Find matching close paren, accounting for nested parens and strings
    let depth = 1;
    let j = openParen + 1;
    let inString = false;

    while (j < valuesSection.length && depth > 0) {
      const char = valuesSection[j];

      if (char === "'" && !inString) {
        inString = true;
        j++;
        continue;
      }

      if (char === "'" && inString) {
        // Check for escaped quote ''
        if (valuesSection[j + 1] === "'") {
          j += 2; // Skip both quotes
          continue;
        }
        inString = false;
        j++;
        continue;
      }

      if (!inString) {
        if (char === "(") depth++;
        if (char === ")") depth--;
      }

      j++;
    }

    if (depth === 0) {
      entries.push(valuesSection.slice(openParen, j));
    }

    i = j;
  }

  return entries;
}

// Parse a single SQL entry like ('title', 'content', ARRAY['tag'], 'section', 1)
function parseEntry(entry: string): {
  title: string;
  content: string;
  tags: string[];
  section?: string;
  order?: number;
} | null {
  // Remove outer parentheses
  entry = entry.trim();
  if (entry.startsWith("(")) entry = entry.slice(1);
  if (entry.endsWith(")")) entry = entry.slice(0, -1);

  // Extract SQL string values using a state machine
  const stringValues: string[] = [];
  let i = 0;

  while (i < entry.length) {
    // Skip to next single quote (start of string)
    while (i < entry.length && entry[i] !== "'") i++;
    if (i >= entry.length) break;

    // Start of string
    i++; // Skip opening quote
    let value = "";

    while (i < entry.length) {
      if (entry[i] === "'") {
        // Check for escaped quote
        if (entry[i + 1] === "'") {
          value += "'";
          i += 2;
          continue;
        }
        // End of string
        i++; // Skip closing quote
        break;
      }
      value += entry[i];
      i++;
    }

    stringValues.push(value);
  }

  // Extract ARRAY values
  const arrayMatch = entry.match(/ARRAY\[(.*?)\]/);
  const tagsStr = arrayMatch ? arrayMatch[1] : "";
  const tags = tagsStr
    .split(",")
    .map((t) => t.trim().replace(/'/g, ""))
    .filter((t) => t);

  // Extract order number (last number in entry)
  const orderMatch = entry.match(/,\s*(\d+)\s*$/);
  const order = orderMatch ? parseInt(orderMatch[1], 10) : undefined;

  if (stringValues.length < 2) {
    return null;
  }

  const title = stringValues[0];
  const content = stringValues[1];
  const section = stringValues.length >= 4 ? stringValues[3] : undefined;

  return { title, content, tags, section, order };
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: npm run seed -- <example-name>");
    console.error("Example: npm run seed -- arcana");
    process.exit(1);
  }

  const exampleName = args[0];
  console.log(`\n🌱 Seeding database with "${exampleName}" example...\n`);

  const result = await seed(exampleName);

  console.log("\n" + "═".repeat(50));
  console.log("📊 Seed Results:");
  console.log("═".repeat(50));
  console.log(`✅ Notes created: ${result.notesCreated}`);
  console.log(`✅ Links created: ${result.linksCreated}`);

  if (result.errors.length > 0) {
    console.log(`\n❌ Errors (${result.errors.length}):`);
    for (const error of result.errors) {
      console.log(`   - ${error}`);
    }
    process.exit(1);
  }

  console.log("\n🎉 Seeding complete!\n");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
