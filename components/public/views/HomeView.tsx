"use client";

import {
  ContentFallback,
  useSiteContent,
} from "@/components/public/ContentProvider";
import Link from "next/link";
import { Hero } from "@/components/public/Hero";
import { ArrowUpRight } from "@/components/ui/Arrow";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Placeholder } from "@/components/ui/Placeholder";
import { CLASS_INFO } from "@/lib/emma/matrix";
import { homeStats } from "@/lib/home-stats";
import { normalizeCarLayout } from "@/lib/photo";
import { storageUrl } from "@/lib/supabase/env";
import { instagramHref } from "@/lib/format";
import { EditPencil } from "@/components/public/EditMode";

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
        note: "Before and after, timeline, competitions",
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

  const data = [
    { k: "Car", v: v.model },
    { k: "Year / generation", v: v.year },
    { k: "EMMA category", v: `${v.category} · ${CLASS_INFO[v.class].name}` },
    { k: "Owner", v: v.owner },
    { k: "Installer", v: v.installer },
  ];

  return (
    <>
      <Hero
        darkName={v.dark_side_name}
        lightName={v.light_side_name}
        carPhotoUrl={storageUrl(v.car_photo_path)}
        carLayout={normalizeCarLayout(v.car_photo_layout)}
        instagramUrl={instagramHref(v.instagram)}
        stats={homeStats(c)}
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

      <section
        aria-labelledby="statement"
        className="px-8 sm:px-[72px] lg:px-[88px] relative grid grid-cols-1 items-start gap-10 py-28 md:grid-cols-2 md:gap-16"
      >
        <EditPencil
          href="/editor/vehicle/#f-statement"
          label="Project statement"
          className="right-5 top-20 sm:right-10"
        />
        <div className="flex flex-col gap-4">
          <span className="eyebrow text-amber">Project statement</span>
          <h2
            id="statement"
            className="display m-0 font-extrabold"
            style={{ fontSize: "clamp(40px, 5vw, 64px)" }}
          >
            One car.
            <br />
            Two faces.
          </h2>
        </div>
        <div className="flex flex-col gap-5 text-lg leading-[1.7] text-muted">
          <p className="m-0">{v.statement}</p>
          <p className="m-0 text-muted-2">
            EMMA judges assess design as a concept and a consistent theme, not
            personal taste. This page is the entry point to the full project
            documentation.
          </p>
        </div>
      </section>

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
              Everyone who planned, built and tuned Black Amatis, and the brands
              that supported the project.
            </p>
          </div>
          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 p-0">
            {c.team.map((t) => (
              <li
                key={t.id}
                className="glass-inset flex flex-col gap-4 rounded-3xl p-6"
              >
                <Placeholder
                  path={t.photo_path}
                  label="Photo"
                  alt={t.name}
                  className="h-[72px] w-[72px] rounded-full text-[9px]"
                  sizes="72px"
                />
                <div className="flex flex-col gap-1">
                  <span className="label text-amber">{t.role}</span>
                  <span className="font-display text-[26px] font-extrabold leading-tight">
                    {t.name}
                  </span>
                  <span className="text-sm leading-normal text-muted">
                    {t.line}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="relative flex flex-col gap-4">
            <EditPencil
              href="/editor/vehicle/#partners"
              label="Partners"
              className="-top-3 right-0"
            />
            <span className="eyebrow text-muted-2">Supported by</span>
            <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 p-0">
              {c.partners.map((p) => {
                const box = (
                  <Placeholder
                    path={p.logo_path}
                    label={p.name.replace(/^\[|\]$/g, "")}
                    alt={p.name}
                    fit="contain"
                    className="h-[88px] rounded-[18px] bg-white/5"
                    sizes="200px"
                  />
                );
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
