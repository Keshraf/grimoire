-- Nexus Knowledge Base Schema
-- Run this in your Supabase SQL Editor

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  section TEXT,
  "order" INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Links table for tracking wikilinks between notes
CREATE TABLE IF NOT EXISTS links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_title TEXT NOT NULL REFERENCES notes(title) ON DELETE CASCADE,
  target_title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_title, target_title)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_notes_section ON notes(section);
CREATE INDEX IF NOT EXISTS idx_notes_order ON notes("order");
CREATE INDEX IF NOT EXISTS idx_links_source ON links(source_title);
CREATE INDEX IF NOT EXISTS idx_links_target ON links(target_title);

-- Full-text search
ALTER TABLE notes ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_notes_fts ON notes USING GIN(fts);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Apply trigger to notes table
DROP TRIGGER IF EXISTS notes_updated_at ON notes;
CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security (optional - enable if needed)
-- ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Public read access policy (uncomment if RLS enabled)
-- CREATE POLICY "Public read access" ON notes FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON links FOR SELECT USING (true);
