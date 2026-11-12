/**
 * Partner slots without a logo stay in the editor but are hidden on the site,
 * so a slot added for a future sponsor never shows an empty box. Before any
 * logo is uploaded, every slot shows (as a placeholder).
 */
export function visiblePartners<T extends { logo_path: string | null }>(
  partners: T[],
): T[] {
  const withLogo = partners.filter((p) => p.logo_path);
  return withLogo.length ? withLogo : partners;
}
