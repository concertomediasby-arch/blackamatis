"use client";

import {
  ContentFallback,
  useSiteContent,
} from "@/components/public/ContentProvider";
import Link from "next/link";
import { Hero } from "@/components/public/Hero";
import { ArrowUpRight } from "@/components/ui/Arrow";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { CLASS_INFO } from "@/lib/emma/matrix";
import { normalizeCarLayout } from "@/lib/photo";
import { normalizeMedia } from "@/lib/bonus-media";
import { storageUrl } from "@/lib/supabase/env";
import { instagramHref } from "@/lib/format";
import { EditPencil } from "@/components/public/EditMode";
import { PartnerLogo } from "@/components/public/PartnerLogo";
import { categoryLabel, heroText } from "@/lib/home";
import {
  StatementSection,
  WorkshopCard,
} from "@/components/public/HomeSections";
import { homeLayoutOf } from "@/lib/page-layout";
import { visiblePartners } from "@/lib/partners";

/** Two ways in: visitors (lemon, light face) and judges (dark face). */
const WAYS = [
  {
    key: "visit",
    tone: "light",
    eyebrow: "For visitors",
    title: "See the build",
    body: "The two-face theme, the bonus ideas and how the car got here.",
    links: [
      {
        href: "/theme",
        label: "Theme",
        note: "The two-face concept in every zone",
      },
      {
        href: "/bonus",
        label: "Bonus Point",
        note: "Idea, process and result of each request",
      },
      {
        href: "/history",
        label: "History",
        note: "From stock to the stage: the story of the build",
      },
    ],
  },
  {
    key: "judge",
    tone: "dark",
    eyebrow: "For judges",
    title: "Check the install",
    body: "Diagrams, fuses and photo evidence for every judge book criterion.",
    links: [
      {
        href: "/judge",
        label: "Judge Mode",
        note: "Criteria, max points, evidence pack (PDF)",
      },
      {
        href: "/installation/#wiring",
        label: "Power & fuses",
        note: "Every circuit by fuse code, checked against VW75212",
      },
      {
        href: "/installation/#photo-log",
        label: "Photo log",
        note: "Behind the panels, each photo with what it proves",
      },
    ],
  },
] as const;

export function HomeView() {
  const state = useSiteContent();
  if (state.status !== "ready") return <ContentFallback state={state} />;
  const c = state.content;
  const v = c.vehicle;

  const hero = heroText(v.home, CLASS_INFO[v.class].name);
  const data = [
    { k: "Car", v: v.model },
    { k: "Year / generation", v: v.year },
    {
      k: "EMMA category",
      v: categoryLabel(v.category, CLASS_INFO[v.class].name),
    },
    { k: "Owner", v: v.owner },
    { k: "Installer", v: v.installer },
    // A field left empty in the editor (e.g. an owner who prefers not to be named) is not shown.
  ].filter((d) => (d.v ?? "").trim() !== "");

  return (
    <>
      <Hero
        carPhotoUrls={[
          v.car_photo_path,
          ...normalizeMedia(v.hero_photos).map((m) => m.path),
        ]
          .map((p) => storageUrl(p))
          .filter((u): u is string => !!u)}
        carLayout={normalizeCarLayout(v.car_photo_layout)}
        instagramUrl={instagramHref(v.instagram)}
        text={hero}
        headline={homeLayoutOf(v)}
        judgeThumbUrl={storageUrl(v.system_diagram_path)}
      />

      <section
        id="start"
        aria-label="Ways in"
        className="grid scroll-mt-6 grid-cols-1 gap-4 px-3 pt-8 sm:px-6 lg:grid-cols-2 lg:px-10"
      >
        {WAYS.map((w) => {
          const light = w.tone === "light";
          return (
            <div
              key={w.key}
              className={`${light ? "glass-light on-light" : "glass-dark"} flex flex-col gap-8 rounded-[32px] p-6 sm:p-12`}
            >
              <div className="flex flex-col gap-3">
                <span
                  className={`eyebrow ${light ? "text-navy" : "text-amber"}`}
                >
                  {w.eyebrow}
                </span>
                <h2 className="display m-0 text-[clamp(40px,5vw,64px)] font-black leading-none">
                  {w.title}
                </h2>
                <p
                  className={`m-0 max-w-[460px] text-[16px] leading-relaxed ${light ? "text-dark-muted" : "text-muted"}`}
                >
                  {w.body}
                </p>
              </div>
              <ul className="m-0 flex list-none flex-col p-0">
                {w.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className={`group flex min-h-[72px] items-center justify-between gap-4 border-t py-3 no-underline ${light ? "border-black/20" : "border-white/15"}`}
                    >
                      <span className="flex flex-col gap-0.5">
                        <span className="font-display text-[28px] font-extrabold leading-tight">
                          {l.label}
                        </span>
                        <span
                          className={`text-[14px] ${light ? "text-dark-muted" : "text-muted-2"}`}
                        >
                          {l.note}
                        </span>
                      </span>
                      <span className="flex-none transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                        <ArrowUpRight size={22} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      {hero.showStrip && data.length > 0 && (
        <GlassPanel
          as="section"
          id="vehicle"
          aria-label="Vehicle data"
          className="relative mx-3 mt-8 overflow-hidden rounded-[28px] sm:mx-6 lg:mx-10"
        >
          <EditPencil href="/editor/vehicle/#vehicle" label="Vehicle data" />
          <dl className="m-0 grid sm:px-6 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            {data.map((d) => (
              <div
                key={d.k}
                className="flex flex-col gap-2 border-b border-white/10 px-6 py-7 sm:border-b-0 sm:border-r last:border-0"
              >
                <dt className="label text-muted-2">{d.k}</dt>
                <dd className="m-0 font-display text-[28px] font-bold leading-tight">
                  {d.v}
                </dd>
              </div>
            ))}
          </dl>
        </GlassPanel>
      )}

      <StatementSection statement={v.statement}>
        <EditPencil
          href="/editor/vehicle/#f-statement"
          label="Project statement"
          className="right-5 top-20 sm:right-10"
        />
      </StatementSection>

      <section aria-labelledby="team" className="px-3 sm:px-6 lg:px-10">
        <GlassPanel className="relative flex flex-col gap-8 rounded-[36px] p-6 sm:p-12">
          <EditPencil
            href="/editor/vehicle/#team"
            label="Team"
            className="right-5 top-5"
          />
          <div className="flex max-w-[640px] flex-col gap-3">
            <span className="eyebrow text-amber">Team &amp; partners</span>
            <h2
              id="team"
              className="display m-0 text-[clamp(40px,5vw,56px)] font-extrabold"
            >
              The people behind it
            </h2>
            <p className="m-0 leading-[1.7] text-muted">
              The workshop that built Black Amethyst, and the brands that
              supported the project.
            </p>
          </div>
          <WorkshopCard
            installer={v.installer}
            instagram={v.instagram}
            home={v.home}
          >
            <EditPencil
              href="/editor/vehicle/#workshop"
              label="Workshop card"
              className="right-4 top-4"
            />
          </WorkshopCard>
          <div className="relative flex flex-col gap-4">
            <EditPencil
              href="/editor/vehicle/#partners"
              label="Partners"
              className="-top-3 right-0"
            />
            <span className="eyebrow text-muted-2">Supported by</span>
            <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 p-0">
              {visiblePartners(c.partners).map((p) => {
                const box = <PartnerLogo partner={p} />;
                return (
                  <li key={p.id}>
                    {p.url ? (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={p.name}
                      >
                        {box}
                      </a>
                    ) : (
                      box
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </GlassPanel>
      </section>
    </>
  );
}
