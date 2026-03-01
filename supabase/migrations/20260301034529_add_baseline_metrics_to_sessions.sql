/*
  # Add baseline calibration metrics to sessions table

  1. Changes
    - Add baseline_velocity: Peak concentric velocity from first 2 reps used as baseline
    - Add baseline_tremor: Average muscle tremor from first rep used as baseline
    - Add baseline_calibrated: Boolean flag indicating if baseline was established
    - Add tremor_deviation_avg: Average tremor deviation (current/baseline) across session

  2. Notes
    - These fields support VBT (Velocity-Based Training) methodology
    - Baseline values are established during first 2 reps of each session
    - Velocity loss and tremor deviation calculations depend on these baselines
    - Critical for accurate hypertrophy zone detection and final rep prediction
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'baseline_velocity'
  ) THEN
    ALTER TABLE sessions ADD COLUMN baseline_velocity numeric DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'baseline_tremor'
  ) THEN
    ALTER TABLE sessions ADD COLUMN baseline_tremor numeric DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'baseline_calibrated'
  ) THEN
    ALTER TABLE sessions ADD COLUMN baseline_calibrated boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'tremor_deviation_avg'
  ) THEN
    ALTER TABLE sessions ADD COLUMN tremor_deviation_avg numeric DEFAULT 0;
  END IF;
END $$;
