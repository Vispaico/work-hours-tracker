import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl) {
  console.warn('[supabase] VITE_SUPABASE_URL is not configured. Auth will be disabled.');
}

if (!supabaseAnonKey) {
  console.warn('[supabase] VITE_SUPABASE_ANON_KEY is not configured. Auth will be disabled.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
