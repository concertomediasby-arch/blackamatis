/** True for an unfilled placeholder such as "[OWNER NAME]". */
export function isPlaceholder(v: string | null | undefined): boolean {
  return !v || v.trim() === "" || /^\[.*\]$/.test(v.trim());
}

export function instagramHref(handle: string): string | null {
  const h = handle.trim();
  if (isPlaceholder(h)) return null;
  if (/^https?:\/\//.test(h)) return h;
  return `https://instagram.com/${h.replace(/^@/, "")}`;
}
