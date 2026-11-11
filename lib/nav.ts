export const NAV = [
  { href: "/history", label: "History" },
  { href: "/theme", label: "Theme" },
  { href: "/installation", label: "Installation" },
  { href: "/bonus", label: "Bonus Point" },
  { href: "/judge", label: "Judge Mode" },
] as const;

/** Page order for the footer prev/next links. */
const ORDER = [{ href: "/", label: "Home" }, ...NAV];

export function prevNext(pathname: string) {
  const i = ORDER.findIndex((p) => p.href === pathname);
  if (i < 0) return { prev: null, next: null };
  return { prev: i > 0 ? ORDER[i - 1] : null, next: i < ORDER.length - 1 ? ORDER[i + 1] : null };
}
