import type { WiringLink } from "../types";
import { checkFuse, type FuseCheck } from "./fuses";

export type CircuitLink = { link: WiringLink; check: FuseCheck };
export type CircuitStep = { key: string; /** The link that feeds this step (null for the first one). */ in: CircuitLink | null };

export type Circuit = {
  /** From the power source down to the device, following Wiring links upstream. */
  path: CircuitStep[];
  /** Links that leave the device (e.g. a distribution block's outputs). */
  feeds: CircuitLink[];
  /** Overall result for every link on the path and in feeds. */
  status: "ok" | "over" | "incomplete" | "unlinked";
};

const withCheck = (link: WiringLink): CircuitLink => ({ link, check: checkFuse(link.cable_mm2, link.fuse_a) });

/**
 * The power path of one component, built from the editor's Wiring links.
 * Stops at a loop or when nothing feeds the current step.
 */
export function circuitOf(deviceKey: string, links: readonly WiringLink[]): Circuit {
  const path: CircuitStep[] = [];
  const seen = new Set<string>();
  let key: string | null = deviceKey;
  while (key && !seen.has(key)) {
    seen.add(key);
    const incoming = links.find((l) => l.to_key === key);
    path.unshift({ key, in: incoming ? withCheck(incoming) : null });
    key = incoming?.from_key ?? null;
  }
  // A loop leaves the first step with an incoming link; the path starts there.
  if (path[0]?.in && seen.has(path[0].in.link.from_key)) path[0] = { ...path[0], in: null };

  const feeds = links.filter((l) => l.from_key === deviceKey).map(withCheck);
  const all = [...path.flatMap((s) => (s.in ? [s.in] : [])), ...feeds];
  const status: Circuit["status"] =
    all.length === 0 ? "unlinked" : all.some((c) => c.check.status === "over") ? "over" : all.some((c) => c.check.status === "unknown") ? "incomplete" : "ok";
  return { path, feeds, status };
}
