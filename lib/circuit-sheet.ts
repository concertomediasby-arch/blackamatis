import { analyseChain, chainStatus, type AnalysedItem, type CableCheck } from "./emma/chain";
import type { ChainItem, Circuit } from "./types";

export type SheetRow = {
  id: string;
  run: "power" | "ground" | "signal" | "speaker" | "other";
  /** Where the cable goes (the part after it, or the far end). */
  to: string;
  from?: string;
  name: string;
  awg: string | null;
  length_cm: number | null;
  check?: CableCheck;
};

export type Sheet = {
  rows: SheetRow[];
  status: ReturnType<typeof chainStatus>;
  /** Fuses of this circuit itself (e.g. the 100 A fuse on the distribution block). */
  fuses: { label: string; fuse_a: number | null }[];
  powerFrom?: string;
  groundTo?: string;
  /** Full runs from the battery, for "Show the full path". */
  power: AnalysedItem[];
  ground: AnalysedItem[];
  sharedPower: number;
  sharedGround: number;
};

const lastNode = (items: ChainItem[]) => [...items].reverse().find((i) => i.t === "node") as Extract<ChainItem, { t: "node" }> | undefined;

/** Cables of one run as rows: each cable is named by the part it leads to. */
function cableRows(items: AnalysedItem[], from: number, run: SheetRow["run"]): SheetRow[] {
  const out: SheetRow[] = [];
  items.forEach((it, i) => {
    if (i < from || it.t !== "cable") return;
    const next = items.slice(i + 1).find((x) => x.t === "node");
    const prev = [...items.slice(0, i)].reverse().find((x) => x.t === "node");
    out.push({
      id: it.id,
      run,
      to: next && next.t === "node" ? next.label : "",
      from: prev && prev.t === "node" ? prev.label : undefined,
      name: it.name,
      awg: it.awg,
      length_cm: it.length_cm,
      check: it.check,
    });
  });
  return out;
}

/**
 * The circuit as a data sheet: one row per cable (power, ground, signal,
 * speaker) with its VW75212 check. A main run lists all its own cables; a
 * device circuit lists only its own, with the shared run kept for the full path.
 */
export function circuitSheet(c: Circuit, circuits: Circuit[], productTitle: (key: string | null | undefined) => string | undefined): Sheet {
  const trunkP = c.kind === "channel" ? circuits.find((x) => x.id === c.power_from) : undefined;
  const trunkG = c.kind === "channel" ? circuits.find((x) => x.id === c.ground_from) : undefined;
  const sharedPower = trunkP?.power.length ?? 0;
  const sharedGround = trunkG?.ground.length ?? 0;
  const power = analyseChain([...(trunkP?.power ?? []), ...c.power]);
  const ground = analyseChain([...(trunkG?.ground ?? []), ...c.ground], false);
  const rows = [
    ...cableRows(power, sharedPower, "power"),
    ...cableRows(ground, sharedGround, "ground"),
    ...c.cables.map((s): SheetRow => ({
      id: s.id,
      run: s.role,
      to: (s.role === "speaker" && productTitle(s.to_key)) || s.to,
      from: s.from,
      name: s.name,
      awg: s.awg,
      length_cm: s.length_cm,
    })),
  ];
  return {
    rows,
    status: c.power.length || c.kind === "trunk" ? chainStatus(power) : "empty",
    fuses: c.power.flatMap((i) => (i.t === "node" && (i.is_fuse || i.fuse_a != null) ? [{ label: i.label, fuse_a: i.fuse_a ?? null }] : [])),
    powerFrom: trunkP ? lastNode(trunkP.power)?.label : undefined,
    groundTo: trunkG ? lastNode(trunkG.ground)?.label : undefined,
    power,
    ground,
    sharedPower,
    sharedGround,
  };
}
