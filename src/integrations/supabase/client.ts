import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = (
  import.meta.env.VITE_SUPABASE_URL ||
  ""
).replace(/\/$/, "");

/** Accept either name so Vercel/local setup does not break */
const SUPABASE_KEY = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ""
).trim();

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) {
      headers.delete("Authorization");
    }

    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "[eKharayo] Missing Supabase env. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) on Vercel, then Redeploy.",
  );
}

export const supabase = createClient<Database>(SUPABASE_URL || "https://invalid.local", SUPABASE_KEY || "invalid", {
  global: {
    fetch: createSupabaseFetch(SUPABASE_KEY || "invalid"),
  },
  auth: {
    storage: typeof window !== "undefined" ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
});
