"use client";

import { Card, TextArea } from "../Field";
import { UploadZone } from "../UploadZone";
import { useEditor } from "../EditorProvider";
import { HotspotEditor } from "./HotspotEditor";

/** The team's own system diagram image, shown first in the Signal flow panel. */
export function SystemDiagramImage() {
  const { content, update } = useEditor();
  const v = content.vehicle;
  const set = (patch: Partial<typeof v>) => update((c) => ({ ...c, vehicle: { ...c.vehicle, ...patch } }));
  return (
    <Card title="System diagram image" id="system-image">
      <p className="m-0 text-sm text-[#4a4852]">
        Upload your own system diagram (for example the one made for the judges). The Installation page then shows it first, and every device you mark
        below opens its spec sheet when clicked. The generated diagram stays available as a second tab.
      </p>
      <UploadZone
        label="Diagram image (PNG or JPG)"
        kind="photo"
        focusable={false}
        folder="diagram"
        value={v.system_diagram_path}
        onChange={(p) => set({ system_diagram_path: p })}
        hint="Landscape works best. Shown full width; visitors can open it full size."
      />
      <TextArea
        label="Description for screen readers"
        rows={2}
        maxLength={400}
        value={v.system_diagram_alt}
        onChange={(e) => set({ system_diagram_alt: e.target.value })}
        hint="One or two sentences, e.g. “Head unit to STEG DSP, then amplifiers per channel to tweeters, midranges, midbass and two subwoofers.”"
      />
      {v.system_diagram_path && <HotspotEditor imagePath={v.system_diagram_path} alt={v.system_diagram_alt} />}
    </Card>
  );
}
