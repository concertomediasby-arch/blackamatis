"use client";

import { ContentFallback, useSiteContent } from "@/components/public/ContentProvider";
import { Craftsmanship } from "@/components/public/Craftsmanship";
import { Diagram, type DiagramNode } from "@/components/public/Diagram";
import { DiagramPanel } from "@/components/public/DiagramPanel";
import { storageUrl } from "@/lib/supabase/env";
import { PhotoLog } from "@/components/public/PhotoLog";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { checkFuse } from "@/lib/emma/fuses";
import { isPlaceholder } from "@/lib/format";
import type { AudioComponent, WiringLink } from "@/lib/types";
import { EditPencil } from "@/components/public/EditMode";


const brandModel = (c: AudioComponent) => [c.brand, c.model].filter((x) => !isPlaceholder(x)).join(" ") || "[BRAND / MODEL]";
const linkLabel = (l?: WiringLink) => `${l?.cable_mm2 != null ? `${l.cable_mm2} mm²` : "[__ mm²]"} · ${l?.fuse_a != null ? `${l.fuse_a} A` : "[__ A]"}`;

function SectionHead({ eyebrow, title, id, children, tone = "dark" }: { eyebrow: string; title: string; id: string; children?: React.ReactNode; tone?: "dark" | "light" }) {
  return (
    <div className="flex max-w-[680px] flex-col gap-3">
      <span className={`eyebrow ${tone === "dark" ? "text-amber" : "text-navy"}`}>{eyebrow}</span>
      <h2 id={id} className="display m-0 text-[clamp(40px,5vw,56px)] font-extrabold">
        {title}
      </h2>
      {children && <p className={`m-0 leading-[1.7] ${tone === "dark" ? "text-muted" : "text-dark-muted"}`}>{children}</p>}
    </div>
  );
}

export function InstallationView() {
  const state = useSiteContent();
  if (state.status !== "ready") return <ContentFallback state={state} />;
  const c = state.content;
  const comps = [...c.components].sort((a, b) => a.sort - b.sort);

  // Signal flow (data-driven via fed_by)
  const sys = comps.filter((x) => x.in_system);
  const sysKeys = new Set(sys.map((x) => x.key));
  const sysNodes: DiagramNode[] = sys.map((x) => ({ key: x.key, title: x.title, sub: brandModel(x), component: x }));
  const sysEdges = sys.filter((x) => x.fed_by && sysKeys.has(x.fed_by)).map((x) => ({ from: x.fed_by!, to: x.key }));

  // Power & fuses (data-driven via wiring_links)
  const wir = comps.filter((x) => x.in_wiring);
  const wirKeys = new Set(wir.map((x) => x.key));
  const links = c.wiring.filter((l) => wirKeys.has(l.from_key) && wirKeys.has(l.to_key));
  const incoming = new Map(links.map((l) => [l.to_key, l]));
  const parents = new Set(links.map((l) => l.from_key));
  const wirNodes: DiagramNode[] = wir.map((x) => {
    const l = incoming.get(x.key);
    const isOutput = l && !parents.has(x.key);
    const chk = checkFuse(l?.cable_mm2, l?.fuse_a);
    return {
      key: x.key,
      title: x.title,
      sub: brandModel(x),
      extra: isOutput ? linkLabel(l) : undefined,
      warn: chk.status === "over",
      component: x,
    };
  });
  const wirEdges = links.map((l) => ({ from: l.from_key, to: l.to_key }));
  const edgeLabels = Object.fromEntries(links.filter((l) => parents.has(l.to_key)).map((l) => [`${l.from_key}>${l.to_key}`, linkLabel(l)]));
  const root = wir.find((x) => x.type === "battery")?.key;
  const titleOf = (k: string) => comps.find((x) => x.key === k)?.title ?? k;

  return (
    <>
      <section className="mx-auto grid max-w-[1280px] grid-cols-1 items-end gap-12 px-5 pb-16 pt-24 sm:px-10 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <span className="eyebrow text-amber">03 — Installation</span>
          <h1 className="display m-0 font-black" style={{ fontSize: "clamp(64px, 9vw, 128px)", lineHeight: 0.85 }}>
            Behind
            <br />
            the panels.
          </h1>
        </div>
        <p className="m-0 text-lg leading-[1.7] text-muted">
          Signal flow, power and fuses, and photo evidence for every judge book criterion. Click any product in a diagram to see its spec sheet.
        </p>
      </section>

      <section aria-labelledby="system-diagram" className="mx-auto max-w-[1360px] px-3 pb-16 sm:px-6 lg:px-10">
        <GlassPanel className="relative flex flex-col gap-7 rounded-[36px] p-5 sm:p-12">
          <EditPencil href="/editor/components/#system-image" label="System diagram" className="right-5 top-5" />
          <DiagramPanel
            imageUrl={storageUrl(c.vehicle.system_diagram_path)}
            imageAlt={c.vehicle.system_diagram_alt}
            defaultAlt="System diagram of Black Amatis: source, processing, amplification and speakers"
            interactive={<Diagram label="Signal flow" nodes={sysNodes} edges={sysEdges} columnLabels={["SOURCE", "PROCESSING", "AMPLIFICATION", "SPEAKERS"]} />}
            components={comps}
            field="hotspots"
            tabs={["System diagram", "Specs per product"]}
            idPrefix="signal"
            textList={{ title: "Signal flow as a list", items: sysEdges.map((e) => `${titleOf(e.from)} to ${titleOf(e.to)}`) }}
            heading={
              <SectionHead eyebrow="System diagram" title="Signal flow" id="system-diagram">
                Source, processing, amplification and speakers.
              </SectionHead>
            }
          />
        </GlassPanel>
      </section>

      <section id="wiring" aria-labelledby="wiring-diagram" className="mx-auto max-w-[1360px] px-3 pb-16 sm:px-6 lg:px-10">
        <GlassPanel className="relative flex flex-col gap-7 rounded-[36px] p-5 sm:p-12">
          <EditPencil href={c.vehicle.wiring_diagram_path ? "/editor/components/#wiring-image" : "/editor/components/#wiring"} label="Wiring diagram" className="right-5 top-5" />
          <DiagramPanel
            imageUrl={storageUrl(c.vehicle.wiring_diagram_path)}
            imageAlt={c.vehicle.wiring_diagram_alt}
            defaultAlt="Cable diagram of Black Amatis: battery, main fuses, distribution and every powered component"
            interactive={
              <Diagram
                label="Power and fuses"
                nodes={wirNodes}
                edges={wirEdges}
                columnLabels={["POWER", "PROTECTION", "DISTRIBUTION", "CONSUMERS"]}
                edgeLabels={edgeLabels}
                groundFrom={root}
              />
            }
            components={comps}
            field="wiring_hotspots"
            circuit={{ links: c.wiring, photos: c.photos }}
            circuits={c.circuits}
            imageHint="Click a device to see its power path, cable and fuse"
            tabs={["Cable diagram", "Cable sizes & fuses"]}
            idPrefix="wiring"
            textList={{ title: "Power and fuses as a list", items: links.map((l) => `${titleOf(l.from_key)} to ${titleOf(l.to_key)}: ${linkLabel(l)}`) }}
            heading={
              <SectionHead eyebrow="Wiring diagram" title="Power & fuses" id="wiring-diagram">
                Main fuse within 40 cm of the positive battery post. Every fuse is rated by the smallest cable in its circuit (VW75212).
              </SectionHead>
            }
          />
        </GlassPanel>
      </section>

      <section id="photo-log" aria-labelledby="photo-log-title" className="mx-3 sm:mx-6 lg:mx-10">
        <GlassPanel tone="light" className="relative rounded-[36px]">
          <EditPencil href="/editor/photos/" label="Photo log" className="right-5 top-5" tone="light" />
          <div className="mx-auto flex max-w-[1280px] flex-col gap-10 px-5 py-20 sm:px-12">
            <SectionHead eyebrow="Photo log" title="Behind the panels" id="photo-log-title" tone="light">
              Every photo has a code and the judge book criterion it proves, so the work can be checked without removing a single panel.
            </SectionHead>
            <PhotoLog photos={c.photos} />
          </div>
        </GlassPanel>
      </section>

      <section id="craftsmanship" aria-labelledby="craft-title" className="mx-auto max-w-[1360px] px-3 pt-16 sm:px-6 lg:px-10">
        <GlassPanel className="relative flex flex-col gap-8 rounded-[36px] p-5 sm:p-12">
          <EditPencil href="/editor/photos/#craft" label="Craftsmanship close-ups" className="right-5 top-5" />
          <SectionHead eyebrow="Craftsmanship" title="Close-up" id="craft-title">
            Fit and finish in every category judges look at.
          </SectionHead>
          <Craftsmanship photos={c.craft} />
        </GlassPanel>
      </section>
    </>
  );
}
