"use client";

import type { Vehicle } from "@/lib/types";
import { Card, TextArea } from "../Field";
import { UploadZone } from "../UploadZone";
import { useEditor } from "../EditorProvider";
import { HotspotEditor } from "./HotspotEditor";

const KINDS = {
  system: {
    title: "System diagram image",
    id: "system-image",
    path: "system_diagram_path",
    alt: "system_diagram_alt",
    field: "hotspots",
    intro:
      "Upload your own system diagram (for example the one made for the judges). The Installation page then shows it first in Signal flow, and every device you mark below opens its spec sheet when clicked. The generated diagram stays available as a second tab.",
    altHint: "One or two sentences, e.g. “Head unit to STEG DSP, then amplifiers per channel to tweeters, midranges, midbass and two subwoofers.”",
  },
  wiring: {
    title: "Cable diagram image",
    id: "wiring-image",
    path: "wiring_diagram_path",
    alt: "wiring_diagram_alt",
    field: "wiring_hotspots",
    intro:
      "Upload your own cable / wiring diagram. The Installation page then shows it first in Power & fuses, and every device you mark below opens its spec sheet when clicked. The generated power diagram with cable sizes and fuses stays available as a second tab.",
    altHint: "One or two sentences, e.g. “Battery and main fuses to two power banks, then fused distribution blocks to every amplifier, the DSP and the streamer.”",
  },
} as const;

/** The team's own diagram image (system or wiring), shown first in its section on the Installation page. */
export function DiagramImageCard({ kind }: { kind: keyof typeof KINDS }) {
  const k = KINDS[kind];
  const { content, update } = useEditor();
  const v = content.vehicle;
  const set = (patch: Partial<Vehicle>) => update((c) => ({ ...c, vehicle: { ...c.vehicle, ...patch } }));
  const path = v[k.path];
  const alt = v[k.alt] ?? "";
  return (
    <Card title={k.title} id={k.id}>
      <p className="m-0 text-sm text-[#4a4852]">{k.intro}</p>
      <UploadZone
        label="Diagram image (PNG or JPG)"
        kind="photo"
        focusable={false}
        folder="diagram"
        value={path}
        onChange={(p) => set({ [k.path]: p })}
        hint="Landscape works best. Shown full width; visitors can open it full size."
      />
      <TextArea label="Description for screen readers" rows={2} maxLength={400} value={alt} onChange={(e) => set({ [k.alt]: e.target.value })} hint={k.altHint} />
      {path && <HotspotEditor imagePath={path} alt={alt} field={k.field} />}
    </Card>
  );
}
