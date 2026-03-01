import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Session = {
  id: string;
  start_time: string;
  end_time: string | null;
  duration_seconds: number;
  average_stability: number;
  peak_fatigue: number;
  min_stability: number;
  max_stability: number;
  created_at: string;
  updated_at: string;
};

export type SessionMetric = {
  id: string;
  session_id: string;
  timestamp: string;
  stability: number;
  fatigue: number;
  jitter_frequency: number;
  tremor: number;
};
