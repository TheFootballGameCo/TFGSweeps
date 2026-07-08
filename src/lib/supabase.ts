// ---------------------------------------------------------------------------
// Supabase client. One instance shared app-wide.
// If env vars are missing the app still boots — isSupabaseConfigured lets the
// UI show a friendly setup notice instead of crashing.
// ---------------------------------------------------------------------------

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * The shared client. When not configured we still create one pointed at a
 * placeholder so imports never explode; guard real usage with
 * isSupabaseConfigured.
 */
export const supabase: SupabaseClient = createClient(
  url ?? 'https://placeholder.supabase.co',
  anonKey ?? 'placeholder'
);
