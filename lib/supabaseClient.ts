import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function warnMissingEnv() {
  // eslint-disable-next-line no-console
  console.warn(
    "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Create .env.local (or set them in Vercel) before using SeatHappens."
  );
}

function canCreateClient() {
  if (supabaseUrl && supabaseAnonKey) {
    return true;
  }

  warnMissingEnv();
  return false;
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!canCreateClient()) {
    return null;
  }

  return createClient(supabaseUrl!, supabaseAnonKey!);
}

export function getSupabaseServerClient(): SupabaseClient | null {
  if (!canCreateClient()) {
    return null;
  }

  return createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
