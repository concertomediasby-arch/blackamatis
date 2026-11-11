export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True when Supabase env vars are set. Without them the site runs on placeholder data. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://blackamatis.concerto.id";

export const STORAGE_BUCKETS = { photos: "photos", pdfs: "pdfs" } as const;

/** Public URL for a file in a public bucket, or null. Absolute URLs pass through. */
export function storageUrl(path: string | null | undefined, bucket: keyof typeof STORAGE_BUCKETS = "photos") {
  if (!path) return null;
  if (/^(https?:|blob:|data:)/.test(path) || path.startsWith("/")) return path;
  if (!isSupabaseConfigured) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKETS[bucket]}/${path}`;
}
