-- ═══════════════════════════════════════════════
-- CREATIVE INTELLIGENCE STUDIO — DATABASE SCHEMA
-- Single source of truth for the analyses table
-- ═══════════════════════════════════════════════

-- Create the analyses table if it doesn't exist
CREATE TABLE IF NOT EXISTS analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  report JSONB NOT NULL,
  scores JSONB,
  summary TEXT,
  screenshot_url TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure columns exist (safe for existing tables)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analyses' AND column_name='scores') THEN
        ALTER TABLE analyses ADD COLUMN scores JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analyses' AND column_name='summary') THEN
        ALTER TABLE analyses ADD COLUMN summary TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analyses' AND column_name='screenshot_url') THEN
        ALTER TABLE analyses ADD COLUMN screenshot_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analyses' AND column_name='user_id') THEN
        ALTER TABLE analyses ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Drop all old policies to start clean
DROP POLICY IF EXISTS "Allow anonymous inserts" ON analyses;
DROP POLICY IF EXISTS "Allow anonymous selects" ON analyses;
DROP POLICY IF EXISTS "Users can insert their own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can view their own analyses" ON analyses;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON analyses;
DROP POLICY IF EXISTS "Allow authenticated reads" ON analyses;
DROP POLICY IF EXISTS "Allow anon inserts without user_id" ON analyses;
DROP POLICY IF EXISTS "Allow anon reads" ON analyses;

-- ═══════════════════════════════════════════════
-- POLICY: Authenticated users can insert with their user_id
-- ═══════════════════════════════════════════════
CREATE POLICY "Allow authenticated inserts"
ON analyses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- POLICY: Authenticated users can read their own reports
-- ═══════════════════════════════════════════════
CREATE POLICY "Allow authenticated reads"
ON analyses FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- POLICY: Anonymous users can insert (user_id will be null)
-- This allows the analyze API to work for unauthenticated users
-- ═══════════════════════════════════════════════
CREATE POLICY "Allow anon inserts without user_id"
ON analyses FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- ═══════════════════════════════════════════════
-- POLICY: Anonymous users can read reports with no owner
-- ═══════════════════════════════════════════════
CREATE POLICY "Allow anon reads"
ON analyses FOR SELECT
TO anon
USING (user_id IS NULL);
