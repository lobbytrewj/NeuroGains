/*
  # Add time under neural tension to sessions table

  1. Changes
    - Add time_under_neural_tension: Total seconds spent in optimal 8-12Hz tremor frequency range
    
  2. Notes
    - This metric tracks cumulative time in the optimal hypertrophy-inducing tremor zone
    - Critical for measuring effective training stimulus beyond just rep count
    - Helps athletes understand quality vs quantity of muscle tension
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'time_under_neural_tension'
  ) THEN
    ALTER TABLE sessions ADD COLUMN time_under_neural_tension integer DEFAULT 0;
  END IF;
END $$;