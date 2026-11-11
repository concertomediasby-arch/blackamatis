import { normalizeCircuit } from "./circuits";
import { CLASS_INFO } from "./emma/matrix";
import type { SiteContent } from "./types";

export type Highlight = {
  key: "class" | "amps" | "circuits" | "fuses";
  title: string;
  note: string;
};

/**
 * Key numbers for the landing hero, counted from published data only: the
 * EMMA class, the amplifiers, circuits and fused circuits on the cable
 * diagram. An item is left out when there is nothing to count yet.
 */
export function homeHighlights(
  c: Pick<SiteContent, "vehicle" | "circuits" | "components">,
): Highlight[] {
  const out: Highlight[] = [];
  const cls = CLASS_INFO[c.vehicle.class];
  if (cls) out.push({ key: "class", title: cls.name, note: "EMMA 2026 class" });
  const runs = (c.circuits ?? [])
    .map(normalizeCircuit)
    .filter((x) => x.kind === "channel");
  const comp = (key: string | null) => c.components.find((x) => x.key === key);
  const ampRuns = runs.filter(
    (x) => comp(x.component_key)?.type === "amplifier",
  );
  const ampNames = [
    ...new Set(
      ampRuns.map((x) => comp(x.component_key)!.title).filter(Boolean),
    ),
  ];
  const fused = runs.filter((x) =>
    x.power.some((i) => i.t === "node" && (i.is_fuse || i.fuse_a != null)),
  ).length;
  const n = (k: number, one: string) => `${k} ${one}${k === 1 ? "" : "s"}`;
  if (ampRuns.length)
    out.push({
      key: "amps",
      title: n(ampRuns.length, "amplifier"),
      note: ampNames.join(" · "),
    });
  if (runs.length)
    out.push({
      key: "circuits",
      title: n(runs.length, "circuit"),
      note: "Every run on the cable diagram",
    });
  if (fused)
    out.push({
      key: "fuses",
      title: n(fused, "fused circuit"),
      note: "Rated by the VW75212 table",
    });
  return out;
}

/** A labelled pointer on the hero car photo: point in % of the car box; labels stack beside the car. */
export type Callout = {
  id: string;
  x: number;
  y: number;
  title: string;
  note: string;
};

/**
 * Default callouts for the hero: the two faces (names from the vehicle) and
 * the amplifier / circuit counts, top to bottom. Points are a starting point
 * for a side-on photo; the text comes only from the data.
 */
export function heroCallouts(
  c: Pick<SiteContent, "vehicle">,
  highlights: Highlight[],
): Callout[] {
  const h = (k: Highlight["key"]) => highlights.find((x) => x.key === k);
  const out: Callout[] = [
    {
      id: "light",
      x: 46,
      y: 18,
      title: "Light side",
      note: c.vehicle.light_side_name,
    },
  ];
  const amps = h("amps");
  const runs = h("circuits");
  if (amps)
    out.push({ id: "amps", x: 84, y: 34, title: amps.title, note: amps.note });
  if (runs)
    out.push({
      id: "circuits",
      x: 80,
      y: 58,
      title: runs.title,
      note: runs.note,
    });
  out.push({
    id: "dark",
    x: 56,
    y: 82,
    title: "Dark side",
    note: c.vehicle.dark_side_name,
  });
  return out;
}
