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
import { normalizeCarLayout } from "@/lib/photo";
import { storageUrl } from "@/lib/supabase/env";
import { instagramHref } from "@/lib/format";
import { EditPencil } from "@/components/public/EditMode";

const PAGES = [
  {
    href: "/history",
    no: "01",
    title: "History",
    body: "The journey from stock condition to competition ready.",
    tone: "dark",
  },
  {
    href: "/theme",
    no: "02",
    title: "Theme",
    body: "The two-face concept and its design zones.",
    tone: "light",
  },
  {
    href: "/installation",
    no: "03",
    title: "Installation",
    body: "System, wiring, fuses and evidence for every judge book criterion.",
    tone: "dark",
  },
  {
    href: "/bonus",
    no: "04",
    title: "Bonus Point",
    body: "Bonus point requests and the ideas behind them.",
    tone: "light",
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
      />

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

      <section
        aria-labelledby="explore"
        className="px-8 sm:px-[72px] lg:px-[88px] pb-28"
      >
        <h2 id="explore" className="eyebrow m-0 mb-8 font-medium text-muted-2">
          Explore the portfolio
        </h2>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4 p-0">
          {PAGES.map((p) => (
            <li key={p.href}>
              <Link
                href={p.href}
                className={`${p.tone === "dark" ? "glass-dark" : "glass-light on-light"} group flex min-h-[300px] flex-col justify-between gap-16 rounded-[28px] p-8 no-underline`}
              >
                <span className="flex items-center justify-between">
                  <span
                    className={`font-mono text-xs ${p.tone === "dark" ? "text-amber" : "text-navy"}`}
                  >
                    {p.no}
                  </span>
                  <span className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                    <ArrowUpRight size={22} />
                  </span>
                </span>
                <span className="flex flex-col gap-3">
                  <span className="font-display text-[44px] font-extrabold leading-none">
                    {p.title}
                  </span>
                  <span
                    className={`text-[15px] leading-relaxed ${p.tone === "dark" ? "text-muted-2" : "text-dark-muted"}`}
                  >
                    {p.body}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
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
