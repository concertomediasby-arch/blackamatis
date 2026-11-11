const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (id: string | null | undefined): id is string => !!id && UUID.test(id);

/**
 * Database id for a draft item. Real UUIDs pass through; any other id
 * (placeholder "vehicle", "m-12") maps to the
 * same UUID every time, so saving an item twice updates one row instead of
 * creating a duplicate.
 */
export async function stableUuid(id: string): Promise<string> {
  if (isUuid(id)) return id.toLowerCase();
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`blackamatis:${id}`))).slice(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5 (name-based)
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
