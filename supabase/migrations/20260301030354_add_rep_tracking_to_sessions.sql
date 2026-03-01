/*
  # Add rep tracking fields to sessions table

  1. Changes
    - Add fields for tracking rep-level hypertrophy metrics
    - total_reps: Total number of reps completed in session
    - hypertrophy_reps: Number of reps in optimal 8-12Hz tremor zone
    - hypertrophy_efficiency_score: Overall score (0-100) based on time in optimal zone
    - avg_velocity_loss: Average velocity loss across all reps (percentage)
    - peak_tremor_avg: Average peak tremor frequency across reps

  2. Notes
    - These metrics enable post-session hypertrophy analysis
    - Scores help athletes optimize training volume and intensity
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'total_reps'
  ) THEN
    ALTER TABLE sessions ADD COLUMN total_reps integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'hypertrophy_reps'
  ) THEN
    ALTER TABLE sessions ADD COLUMN hypertrophy_reps integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'hypertrophy_efficiency_score'
  ) THEN
    ALTER TABLE sessions ADD COLUMN hypertrophy_efficiency_score numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'avg_velocity_loss'
  ) THEN
    ALTER TABLE sessions ADD COLUMN avg_velocity_loss numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'peak_tremor_avg'
  ) THEN
    ALTER TABLE sessions ADD COLUMN peak_tremor_avg numeric DEFAULT 0;
  END IF;
END $$;
