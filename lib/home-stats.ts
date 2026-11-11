import { normalizeCircuit } from "./circuits";
import { CLASS_INFO } from "./emma/matrix";
import type { SiteContent } from "./types";

export type Highlight = { key: "class" | "amps" | "circuits" | "fuses"; title: string; note: string };

/**
 * Key numbers for the landing hero, counted from published data only: the
 * EMMA class, the amplifiers, circuits and fused circuits on the cable
 * diagram. An item is left out when there is nothing to count yet.
 */
export function homeHighlights(c: Pick<SiteContent, "vehicle" | "circuits" | "components">): Highlight[] {
  const out: Highlight[] = [];
  const cls = CLASS_INFO[c.vehicle.class];
  if (cls) out.push({ key: "class", title: cls.name, note: "EMMA 2026 class" });
  const runs = (c.circuits ?? []).map(normalizeCircuit).filter((x) => x.kind === "channel");
  const comp = (key: string | null) => c.components.find((x) => x.key === key);
  const ampRuns = runs.filter((x) => comp(x.component_key)?.type === "amplifier");
  const ampNames = [...new Set(ampRuns.map((x) => comp(x.component_key)!.title).filter(Boolean))];
  const fused = runs.filter((x) => x.power.some((i) => i.t === "node" && (i.is_fuse || i.fuse_a != null))).length;
  const n = (k: number, one: string) => `${k} ${one}${k === 1 ? "" : "s"}`;
  if (ampRuns.length) out.push({ key: "amps", title: n(ampRuns.length, "amplifier"), note: ampNames.join(" · ") });
  if (runs.length) out.push({ key: "circuits", title: n(runs.length, "circuit"), note: "Every run on the cable diagram" });
  if (fused) out.push({ key: "fuses", title: n(fused, "fused circuit"), note: "Rated by the VW75212 table" });
  return out;
}
