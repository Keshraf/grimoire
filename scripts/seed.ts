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
  return [...new Set(links)]; // Return unique links
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

  // Locate seed file
  const seedFilePath = path.join(
    process.cwd(),
    "examples",
    exampleName,
    "seed-data.sql"
  );

  if (!fs.existsSync(seedFilePath)) {
    result.errors.push(`Seed file not found: ${seedFilePath}`);
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
    const { error } = await supabase.from("notes").insert({
      title: note.title,
      content: note.content,
      tags: note.tags,
    });

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

// Parse notes from SQL INSERT statements (title, content, tags format)
function parseNotesFromSQL(
  sql: string
): Array<{ title: string; content: string; tags: string[] }> {
  const notes: Array<{
    title: string;
    content: string;
    tags: string[];
  }> = [];

  // Find the INSERT INTO notes statement
  const notesRegex =
    /INSERT INTO notes \(title, content, tags\) VALUES\s*([\s\S]*?);(?=\s*--|\s*INSERT|\s*$)/;
  const match = notesRegex.exec(sql);

  if (!match) {
    console.warn("No notes INSERT statement found in SQL");
    return notes;
  }

  const valuesSection = match[1];

  // Parse each note entry: ('Title', 'Content...', ARRAY['tag1', 'tag2'])
  const entryRegex = /\(\s*'([^']+)',\s*'([\s\S]*?)',\s*ARRAY\[(.*?)\]\s*\)/g;

  let entryMatch;
  while ((entryMatch = entryRegex.exec(valuesSection)) !== null) {
    const title = entryMatch[1];
    const content = entryMatch[2].replace(/''/g, "'"); // Unescape SQL quotes
    const tagsStr = entryMatch[3];
    const tags = tagsStr
      .split(",")
      .map((t) => t.trim().replace(/'/g, ""))
      .filter((t) => t);

    notes.push({ title, content, tags });
  }

  return notes;
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
