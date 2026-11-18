// Server-only Supabase client. It uses the service role key, which bypasses Row Level Security,
// so it must never be imported by client components and the key must never start with NEXT_PUBLIC_.
import { createClient } from "@supabase/supabase-js";

export const supabaseReady = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export const db = () => createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
