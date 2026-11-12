import { isUuid } from "./ids";

/**
 * What a save writes: only what this editor changed since it loaded (or last
 * saved) the content. Rows and vehicle fields changed elsewhere in the
 * meantime (another tab, another team member, a fix made in the database) are
 * left alone, so an editor that was open for a while cannot undo them.
 */

/** Bookkeeping columns: never compared, never written from the editor's copy. */
const META = new Set(["status", "updated_at", "updated_by"]);

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** Vehicle fields that differ from the base copy. */
export function vehiclePatch<T extends object>(current: T, base: T): Partial<T> {
  const cur = current as Record<string, unknown>;
  const old = base as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(cur)) {
    if (META.has(k) || k === "id") continue;
    if (!same(cur[k], old[k])) out[k] = cur[k];
  }
  return out as Partial<T>;
}

/** A row without its bookkeeping columns, for comparing. */
const plain = (r: object) => Object.fromEntries(Object.entries(r).filter(([k]) => !META.has(k)));

/**
 * Rows to write and rows to delete for one table.
 * - Rows the database already had (UUID ids in the base) are written only when edited,
 *   and deleted only when this editor removed them.
 * - Rows that are new here (not in the base, or a placeholder id) are always written.
 * Rows that exist in the database but were never in the base are not touched.
 */
export function rowChanges<R extends { id: string }>(current: R[], base: R[]): { write: R[]; remove: string[] } {
  const known = new Map(base.filter((r) => isUuid(r.id)).map((r) => [r.id.toLowerCase(), r]));
  const here = new Set(current.map((r) => r.id.toLowerCase()));
  const write = current.filter((r) => {
    const was = known.get(r.id.toLowerCase());
    return !was || !same(plain(r), plain(was));
  });
  const remove = [...known.keys()].filter((id) => !here.has(id));
  return { write, remove };
}
