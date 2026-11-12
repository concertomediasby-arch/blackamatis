"use client";

import { CLASS_INFO } from "@/lib/emma/matrix";
import {
  HOME_DEFAULTS,
  HOME_LIMITS,
  normalizeHome,
  type HomeSettings,
} from "@/lib/home";
import { HeroHeadline } from "@/components/public/Hero";
import { WorkshopCard } from "@/components/public/HomeSections";
import { heroText } from "@/lib/home";
import { homeLayoutOf } from "@/lib/page-layout";
import { useEditor } from "../EditorProvider";
import { ScaledPreview } from "../ScaledPreview";
import { Card, Checkbox, TextArea, TextField } from "../Field";
import { UploadZone } from "../UploadZone";

/** Editor › Vehicle & Story › Landing page: the hero text and whether the vehicle data strip shows. Empty = default text. */
export function HomeHeroEditor() {
  const { content, update } = useEditor();
  const v = content.vehicle;
  const h = normalizeHome(v.home);
  const set = (p: Partial<HomeSettings>) =>
    update((c) => ({
      ...c,
      vehicle: {
        ...c.vehicle,
        home: { ...normalizeHome(c.vehicle.home), ...p },
      },
    }));
  const className = CLASS_INFO[v.class]?.name ?? "";
  const left = (k: keyof typeof HOME_LIMITS) =>
    `${HOME_LIMITS[k] - (h[k] as string).length} characters left`;

  return (
    <Card title="Landing page" id="home-hero">
      <p className="m-0 text-sm text-[#4a4852]">
        The text on the first screen of the site. Leave a field empty to use the
        default shown in grey.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField
          label="Small line above the headline"
          value={h.eyebrow}
          maxLength={HOME_LIMITS.eyebrow}
          placeholder={`EMMA 2026 · ${className}`}
          onChange={(e) => set({ eyebrow: e.target.value })}
          hint={
            h.eyebrow
              ? left("eyebrow")
              : "Default follows the class chosen above."
          }
        />
        <TextField
          label="Button"
          value={h.cta}
          maxLength={HOME_LIMITS.cta}
          placeholder={HOME_DEFAULTS.cta}
          onChange={(e) => set({ cta: e.target.value })}
          hint={left("cta")}
        />
        <TextArea
          label="Headline"
          rows={2}
          value={h.title}
          maxLength={HOME_LIMITS.title}
          placeholder={HOME_DEFAULTS.title}
          onChange={(e) => set({ title: e.target.value })}
          hint="Each line here is a line on the site. Two short lines work best."
        />
        <TextArea
          label="Short copy"
          rows={3}
          value={h.intro}
          maxLength={HOME_LIMITS.intro}
          placeholder={HOME_DEFAULTS.intro}
          onChange={(e) => set({ intro: e.target.value })}
          hint={left("intro")}
        />
      </div>
      <TextField
        label="Label at the top right of every page (and on the print QR)"
        value={h.label}
        maxLength={HOME_LIMITS.label}
        placeholder={`EMMA 2026 · ${v.category || "…"}`}
        onChange={(e) => set({ label: e.target.value })}
        hint={
          h.label
            ? left("label")
            : 'Empty = "EMMA 2026 · " + the EMMA category above. Shown in capitals.'
        }
      />
      <Checkbox
        label="Show the vehicle data strip (car, year, category, owner, installer) under the ways in"
        checked={h.show_strip}
        onChange={(e) => set({ show_strip: e.target.checked })}
      />
      <ScaledPreview label="Preview of the landing page text">
        <div className="px-[88px] py-14">
          <HeroHeadline
            text={heroText(v.home, className)}
            headline={homeLayoutOf(v)}
          />
        </div>
      </ScaledPreview>
    </Card>
  );
}

/** Editor › Vehicle & Story › Workshop card: the "Built by" card on the home page. Name = installer, link = Instagram (Team & links). */
export function WorkshopCardEditor() {
  const { content, update } = useEditor();
  const v = content.vehicle;
  const h = normalizeHome(v.home);
  const set = (p: Partial<HomeSettings>) =>
    update((c) => ({
      ...c,
      vehicle: {
        ...c.vehicle,
        home: { ...normalizeHome(c.vehicle.home), ...p },
      },
    }));
  return (
    <Card title="Workshop card (Built by)" id="workshop">
      <p className="m-0 text-sm text-[#4a4852]">
        One card on the home page under &ldquo;The people behind it&rdquo;: the
        workshop&apos;s logo, its name (the Installer / workshop field above:{" "}
        <b>{v.installer || "not filled in"}</b>), one line about it, and a link
        to the Instagram account above.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <UploadZone
          label="Workshop logo"
          kind="photo"
          folder="team"
          cropMode="whole"
          value={h.workshop_logo}
          onChange={(p) => set({ workshop_logo: p })}
          hint="A transparent PNG works best."
        />
        <TextArea
          label="One line about the workshop"
          rows={3}
          maxLength={HOME_LIMITS.workshop_line}
          value={h.workshop_line}
          placeholder="e.g. Installation, fabrication, design and tuning."
          onChange={(e) => set({ workshop_line: e.target.value })}
          hint={`${HOME_LIMITS.workshop_line - h.workshop_line.length} characters left`}
        />
      </div>
      <ScaledPreview label="Preview of the Built by card" width={1200}>
        <div className="p-10">
          <WorkshopCard
            installer={v.installer}
            instagram={v.instagram}
            home={v.home}
          />
        </div>
      </ScaledPreview>
    </Card>
  );
}
