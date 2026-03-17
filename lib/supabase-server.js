import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client for use in Server Components (SSR)
// This client is used for read-only public data fetching (browse listings, etc.)

const SUPABASE_URL = 'https://cawowquolsqgbsouwhsr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhd293cXVvbHNxZ2Jzb3V3aHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODE2NjUsImV4cCI6MjA4OTI1NzY2NX0.w3YcESxMlt7JJW-k4nXv_6gdO2Ml09U1pFaVGDmUwaE';

export const supabaseServer = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
