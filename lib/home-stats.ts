import { normalizeCircuit } from "./circuits";
import { CLASS_INFO } from "./emma/matrix";
import type { SiteContent } from "./types";

/**
 * Key numbers for the landing hero, counted from published data only:
 * the EMMA class, amplifiers and fused circuits on the cable diagram.
 * A number is left out when there is nothing to count yet.
 */
export function homeStats(c: Pick<SiteContent, "vehicle" | "circuits" | "components">): string[] {
  const out: string[] = [];
  const cls = CLASS_INFO[c.vehicle.class];
  if (cls) out.push(cls.name.toUpperCase());
  const runs = (c.circuits ?? []).map(normalizeCircuit).filter((x) => x.kind === "channel");
  const type = (key: string | null) => c.components.find((x) => x.key === key)?.type;
  const amps = runs.filter((x) => type(x.component_key) === "amplifier").length;
  const fused = runs.filter((x) => x.power.some((i) => i.t === "node" && (i.is_fuse || i.fuse_a != null))).length;
  if (amps) out.push(`${amps} amplifier${amps === 1 ? "" : "s"}`);
  if (runs.length) out.push(`${runs.length} circuit${runs.length === 1 ? "" : "s"}`);
  if (fused) out.push(`${fused} fused circuit${fused === 1 ? "" : "s"}`);
  return out;
}
