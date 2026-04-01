-- pkgdocs packages table
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS packages (
  id              TEXT PRIMARY KEY,
  ecosystem       TEXT NOT NULL DEFAULT 'pypi',
  name            TEXT NOT NULL,
  summary         TEXT,
  tags            TEXT[]        DEFAULT '{}',
  difficulty      SMALLINT      DEFAULT 1,
  weekly_downloads BIGINT       DEFAULT 0,
  version         TEXT,
  data            JSONB NOT NULL,            -- full package JSON
  created_at      TIMESTAMPTZ   DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   DEFAULT NOW()
);

-- Sort by popularity
CREATE INDEX IF NOT EXISTS packages_downloads_idx
  ON packages (weekly_downloads DESC);

-- Tag filtering
CREATE INDEX IF NOT EXISTS packages_tags_idx
  ON packages USING gin (tags);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS packages_updated_at ON packages;
CREATE TRIGGER packages_updated_at
  BEFORE UPDATE ON packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Allow public read access (anon key)
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON packages
  FOR SELECT TO anon, authenticated USING (true);
