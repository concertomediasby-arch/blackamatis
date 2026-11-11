import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createPlainClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

/** Cookie-aware client for server components / actions (editor session). */
export async function createClient() {
  if (!isSupabaseConfigured) return null;
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a server component: cookies are read-only there.
        }
      },
    },
  });
}

/** Anonymous client for public, cacheable reads (no cookies). */
export function createPublicClient() {
  if (!isSupabaseConfigured) return null;
  return createPlainClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
}
