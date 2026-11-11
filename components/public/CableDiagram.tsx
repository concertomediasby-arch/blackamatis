"use client";

import { useState } from "react";
import { normalizeCircuit } from "@/lib/circuits";
import type { AudioComponent, Circuit } from "@/lib/types";
import { ImageHotspots } from "./ImageHotspots";
import { RUN_H, RUN_W, RunCard } from "./RunCard";
import { POPOVER_H, POPOVER_W, SpecPopover } from "./SpecPopover";

/** The team's cable diagram: each marked run opens its circuit; "Product specs" switches to the spec sheet. */
export function CableDiagram({
  imageUrl,
  alt,
  circuits: rows,
  components,
}: {
  imageUrl: string;
  alt: string;
  circuits: Circuit[];
  components: AudioComponent[];
}) {
  const circuits = rows.map(normalizeCircuit).sort((a, b) => a.sort - b.sort);
  const [specsOf, setSpecsOf] = useState<string | null>(null);
  const byId = new Map(circuits.map((c) => [c.id, c]));
  const productOf = (c?: Circuit) =>
    components.find((x) => x.key === c?.component_key);

  return (
    <ImageHotspots
      imageUrl={imageUrl}
      alt={alt}
      targets={circuits.map((c) => ({
        id: c.id,
        title: c.name,
        ariaLabel: `${c.fuse_code ? `${c.fuse_code} · ` : ""}${c.name}. Open circuit: power, ground, cables and fuses`,
        spots: c.wiring_hotspots,
      }))}
      size={(id) =>
        specsOf === id ? { w: POPOVER_W, h: POPOVER_H } : { w: RUN_W, h: RUN_H }
      }
      renderDetail={(id, p) => {
        const c = byId.get(id)!;
        const product = productOf(c);
        if (specsOf === id && product)
          return (
            <SpecPopover
              ref={p.ref}
              id={p.id}
              component={product}
              style={p.style}
              inline={p.inline}
              onClose={() => {
                setSpecsOf(null);
                p.onClose();
              }}
              onBack={() => setSpecsOf(null)}
            />
          );
        return (
          <RunCard
            ref={p.ref}
            id={p.id}
            circuit={c}
            circuits={circuits}
            components={components}
            style={p.style}
            inline={p.inline}
            onClose={() => {
              setSpecsOf(null);
              p.onClose();
            }}
            onShowSpecs={product ? () => setSpecsOf(id) : undefined}
          />
        );
      }}
    />
  );
}
