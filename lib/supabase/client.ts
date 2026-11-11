"use client";

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

let client: SupabaseClient | null = null;

/**
 * Browser Supabase client (anon / publishable key only; RLS does the rest).
 * The session is kept in localStorage. Returns null when Supabase is not configured.
 */
export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) client = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
  return client;
}
