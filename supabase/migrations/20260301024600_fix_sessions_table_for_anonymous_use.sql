/*
  # Fix sessions table for anonymous use

  1. Changes
    - Make user_id nullable to allow anonymous sessions
    - Update RLS policies to allow anonymous access
    - Drop existing policies and create new permissive ones

  2. Security
    - Allow public access for demo/testing purposes
    - Can be restricted later when auth is implemented
*/

ALTER TABLE sessions ALTER COLUMN user_id DROP NOT NULL;

DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can create sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can view own session metrics" ON session_metrics;
DROP POLICY IF EXISTS "Users can insert metrics for own sessions" ON session_metrics;

CREATE POLICY "Allow public read access to sessions"
  ON sessions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to sessions"
  ON sessions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to sessions"
  ON sessions FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from sessions"
  ON sessions FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access to session_metrics"
  ON session_metrics FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to session_metrics"
  ON session_metrics FOR INSERT
  TO public
  WITH CHECK (true);
