/**
 * Property tests for Arcana seed data
 * **Feature: arcana-example**
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

interface Note {
  title: string;
  content: string;
  tags: string[];
}

interface Link {
  source: string;
  target: string;
}

// Parse the seed SQL file to extract notes and links
function parseSeedData(): { notes: Note[]; links: Link[] } {
  const sqlPath = path.join(__dirname, "..", "seed-data.sql");
  const sql = fs.readFileSync(sqlPath, "utf-8");

  const notes: Note[] = [];
  const links: Link[] = [];

  // Find the VALUES section for notes (title, content, tags format)
  const notesSection = sql.match(
    /INSERT INTO notes \(title, content, tags\) VALUES\s*([\s\S]*?);(?=\s*--|\s*INSERT|\s*$)/
  );

  if (notesSection) {
    const valuesText = notesSection[1];

    // Parse each note entry: ('Title', 'Content...', ARRAY['tag1', 'tag2'])
    const entryRegex = /\(\s*'([^']+)',\s*'([\s\S]*?)',\s*ARRAY\[(.*?)\]\s*\)/g;

    let entryMatch;
    while ((entryMatch = entryRegex.exec(valuesText)) !== null) {
      const title = entryMatch[1];
      const content = entryMatch[2].replace(/''/g, "'");
      const tagsStr = entryMatch[3];
      const tags = tagsStr
        .split(",")
        .map((t) => t.trim().replace(/'/g, ""))
        .filter((t) => t);

      notes.push({ title, content, tags });
    }
  }

  // Parse links section (source_title, target_title format)
  const linksSection = sql.match(
    /INSERT INTO links \(source_title, target_title\) VALUES\s*([\s\S]*?);/
  );

  if (linksSection) {
    const linkRegex = /\('([^']+)',\s*'([^']+)'\)/g;
    let match;
    while ((match = linkRegex.exec(linksSection[1])) !== null) {
      links.push({ source: match[1], target: match[2] });
    }
  }

  return { notes, links };
}

// Extract wikilinks from content (handles [[title]] and [[title|display]])
function extractWikilinks(content: string): string[] {
  const regex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  const links: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    links.push(match[1].trim());
  }
  return [...new Set(links)];
}

describe("Arcana Seed Data Properties", () => {
  const { notes, links } = parseSeedData();

  /**
   * **Feature: arcana-example, Property 1: Wikilink Count Consistency**
   * For any note in the Arcana seed data, the note content SHALL contain
   * between 2 and 3 wikilinks (inclusive) to other notes.
   * **Validates: Requirements 2.2**
   */
  describe("Property 1: Wikilink Count Consistency", () => {
    it("every note should have 2-3 wikilinks", () => {
      expect(notes.length).toBeGreaterThanOrEqual(10);

      for (const note of notes) {
        const wikilinks = extractWikilinks(note.content);
        expect(
          wikilinks.length,
          `Note "${note.title}" has ${wikilinks.length} wikilinks, expected 2-3`
        ).toBeGreaterThanOrEqual(2);
        expect(
          wikilinks.length,
          `Note "${note.title}" has ${wikilinks.length} wikilinks, expected 2-3`
        ).toBeLessThanOrEqual(3);
      }
    });
  });

  /**
   * **Feature: arcana-example, Property 2: Tag Presence**
   * For any note in the Arcana seed data, the note SHALL have at least
   * one tag assigned for categorization.
   * **Validates: Requirements 2.4**
   */
  describe("Property 2: Tag Presence", () => {
    it("every note should have at least one tag", () => {
      for (const note of notes) {
        expect(
          note.tags.length,
          `Note "${note.title}" has no tags`
        ).toBeGreaterThanOrEqual(1);
      }
    });
  });

  /**
   * **Feature: arcana-example, Property 3: Link Table Integrity**
   * For any wikilink [[target]] found in a note's content, there SHALL exist
   * a corresponding entry in the links table with the note's title as source_title
   * and the target as target_title.
   * **Validates: Requirements 3.3**
   */
  describe("Property 3: Link Table Integrity", () => {
    it("every wikilink in content should have a corresponding links table entry", () => {
      for (const note of notes) {
        const wikilinks = extractWikilinks(note.content);

        for (const target of wikilinks) {
          const hasLink = links.some(
            (link) => link.source === note.title && link.target === target
          );
          expect(
            hasLink,
            `Missing link entry: ${note.title} -> ${target}`
          ).toBe(true);
        }
      }
    });

    it("every links table entry should correspond to a wikilink in content", () => {
      for (const link of links) {
        const sourceNote = notes.find((n) => n.title === link.source);
        expect(
          sourceNote,
          `Link source "${link.source}" not found in notes`
        ).toBeDefined();

        if (sourceNote) {
          const wikilinks = extractWikilinks(sourceNote.content);
          expect(
            wikilinks,
            `Link ${link.source} -> ${link.target} has no corresponding wikilink`
          ).toContain(link.target);
        }
      }
    });
  });

  // Additional validation tests
  describe("Seed Data Completeness", () => {
    it("should have at least 10 notes", () => {
      expect(notes.length).toBeGreaterThanOrEqual(10);
    });

    it("should include required topics", () => {
      const requiredTitles = [
        "Consciousness",
        "Qualia",
        "Free Will",
        "Creativity",
        "Flow State",
        "Philosophy of Mind",
      ];

      for (const title of requiredTitles) {
        const found = notes.some((n) => n.title === title);
        expect(found, `Missing required topic: ${title}`).toBe(true);
      }
    });
  });
});
