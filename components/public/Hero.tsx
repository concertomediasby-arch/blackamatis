"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "@/components/ui/Arrow";
import { CarPhoto } from "./CarPhoto";
import { EditPencil } from "./EditMode";
import type { CarPhotoLayout } from "@/lib/photo";
import type { Highlight } from "@/lib/home-stats";
import { SiteHeader } from "./SiteHeader";

type Face = "dark" | "light";

const FACES = {
  dark: {
    bg: "#000231",
    word: "#E5A90A",
    ink: "#F2F0E6",
    muted: "#C9C6CF",
    accent: "#E5A90A",
    car: "#000000",
    carGlass: "#14254D",
    light: "#FEF112",
    speck: "#E5A90A",
    ctaBg: "#E5A90A",
    ctaFg: "#000231",
    line: "rgba(242,240,230,0.4)",
    glass: "rgba(1,20,53,0.55)",
    glassBorder: "rgba(255,255,255,0.16)",
    orbA: "#E5A90A",
    orbB: "#00006A",
  },
  light: {
    bg: "#FEF112",
    word: "#000000",
    ink: "#000000",
    muted: "#2E2E34",
    accent: "#00006A",
    car: "#011435",
    carGlass: "#2B4377",
    light: "#E5A90A",
    speck: "#000000",
    ctaBg: "#000000",
    ctaFg: "#FEF112",
    line: "rgba(0,0,0,0.4)",
    glass: "rgba(255,255,255,0.34)",
    glassBorder: "rgba(255,255,255,0.75)",
    orbA: "#E5A90A",
    orbB: "#FFFFFF",
  },
} as const;

const ICONS: Record<Highlight["key"], React.ReactNode> = {
  class: (
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM17 6h3v1a3 3 0 0 1-3 3M7 6H4v1a3 3 0 0 0 3 3" />
  ),
  amps: <path d="M3 7h18v10H3zM7 7v10M11 10h6M11 14h6" />,
  circuits: (
    <path d="M4 6h6v4H4zM14 14h6v4h-6zM7 10v2a2 2 0 0 0 2 2h5M17 14v-2a2 2 0 0 0-2-2h-1" />
  ),
  fuses: <path d="M9 3h6v4H9zM9 17h6v4H9zM10 7v10M14 7v10M12 7v4" />,
};

/** Section index on the right edge: where the reader is on the landing page. */
const SECTIONS = [
  { href: "#top", no: "01", label: "Build" },
  { href: "#start", no: "02", label: "Ways in" },
  { href: "#vehicle", no: "03", label: "Details" },
];

type Props = {
  darkName: string;
  lightName: string;
  carPhotoUrl: string | null;
  carLayout: CarPhotoLayout;
  instagramUrl: string | null;
  /** Key numbers from the data, shown in the strip along the bottom. */
  highlights: Highlight[];
};

/**
 * Landing hero, one screen tall, in a product-landing layout: a three-line
 * headline on the left, the car in front of a glass circle on the right, a
 * section index on the right edge and a strip of key numbers at the bottom.
 */
export function Hero({
  darkName,
  lightName,
  carPhotoUrl,
  carLayout,
  instagramUrl,
  highlights,
}: Props) {
  // The hero shows the dark face; the light palette stays for a future switch.
  const [face] = useState<Face>("dark");
  const f = FACES[face];
  const pencilTone = face === "dark" ? "dark" : "light";

  return (
    <section
      id="top"
      aria-label="Hero"
      className={`relative flex min-h-[100svh] flex-col overflow-hidden ${face === "light" ? "on-light" : ""}`}
      style={{ background: f.bg, color: f.ink }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      >
        <div
          className="orb right-[8%] top-[-160px] h-[620px] w-[620px] opacity-35 blur-[140px]"
          style={{ background: f.orbA }}
        />
        <div
          className="orb bottom-[-200px] left-[-120px] h-[520px] w-[520px] opacity-70 blur-[120px]"
          style={{ background: f.orbB }}
        />
      </div>

      <SiteHeader face={face} inHero />

      <div className="relative z-10 grid flex-1 grid-cols-1 items-center gap-6 px-8 pb-4 pt-8 sm:px-[72px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:px-[88px]">
        {/* Left: label, headline, copy, actions */}
        <div className="relative flex flex-col gap-6">
          <EditPencil
            href="/editor/vehicle/#faces"
            label="Dark and light side names"
            className="-top-3 right-0 lg:right-auto lg:left-[300px]"
            tone={pencilTone}
          />
          <span
            className="self-start rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em]"
            style={{
              borderColor: f.glassBorder,
              color: f.accent,
              background: f.glass,
            }}
          >
            {face === "dark" ? darkName : lightName}
          </span>
          <h1
            className="display m-0 font-black"
            style={{
              fontSize: "clamp(48px, min(6.2vw, 10vh), 112px)",
              lineHeight: 0.9,
            }}
          >
            ONE CAR.
            <br />
            TWO FACES.
            <br />
            <span style={{ color: f.muted, opacity: 0.55 }}>BLACK AMATIS.</span>
          </h1>
          <span aria-hidden="true" className="flex items-center gap-1">
            <span className="h-px w-10" style={{ background: f.ink }} />
            <span
              className="h-1 w-1 rounded-full"
              style={{ background: f.accent }}
            />
          </span>
          <p
            className="m-0 max-w-[420px] text-[17px] leading-relaxed"
            style={{ color: f.muted }}
          >
            A Honda Odyssey built for EMMA 2026. One two-face concept, carried
            from the exterior through the interior to the trunk.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <a
              href="#start"
              className="pill min-h-12 gap-3 px-6"
              style={{ background: f.ctaBg, color: f.ctaFg }}
            >
              Explore the build <ArrowUpRight />
            </a>
            <span
              aria-hidden="true"
              className="hidden h-8 w-px sm:block"
              style={{ background: f.line }}
            />
            <Link
              href="/judge"
              className="group inline-flex min-h-12 items-center gap-3 font-semibold"
              style={{ color: f.ink }}
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full transition-transform group-hover:scale-105"
                style={{ background: f.ink, color: f.bg }}
              >
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </span>
              Judge Mode
            </Link>
          </div>
        </div>

        {/* Right: glass circle with the car in front */}
        <div className="relative order-first flex min-h-[260px] items-center justify-center lg:order-none lg:min-h-0">
          <div
            aria-hidden="true"
            className="absolute aspect-square w-[78%] max-w-[min(640px,62vh)] rounded-full border"
            style={{
              borderColor: "rgba(229,169,10,0.35)",
              background:
                "radial-gradient(circle at 50% 40%, rgba(229,169,10,0.18), rgba(1,20,53,0.2) 60%), repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 9px)",
              boxShadow:
                "0 0 0 18px rgba(255,255,255,0.03), inset 0 0 80px rgba(0,0,0,0.35)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute bottom-[12%] h-10 w-[60%] rounded-[50%] bg-black/50 blur-2xl"
          />
          <EditPencil
            href="/editor/vehicle/#f-car-photo"
            label="Car photo"
            className="right-[6%] top-[6%]"
            tone={pencilTone}
          />
          <div
            className="relative w-full"
            style={{ maxWidth: "min(900px, 95vh)" }}
          >
            {carPhotoUrl ? (
              <CarPhoto
                url={carPhotoUrl}
                layout={carLayout}
                className="max-w-none"
              />
            ) : (
              <div className="flex flex-col items-center">
                <svg
                  role="img"
                  aria-label="Honda Odyssey silhouette (car photo not uploaded yet)"
                  viewBox="0 0 810 330"
                  className="relative h-auto w-full drop-shadow-[0_40px_40px_rgba(0,0,0,0.45)]"
                >
                  <path
                    d="M30 255 C30 225 45 205 80 195 L190 170 L285 75 C298 62 312 58 330 58 L705 58 C735 58 750 72 756 95 L778 205 C782 225 780 250 768 258 L702 262 A62 62 0 0 0 578 262 L267 262 A62 62 0 0 0 143 262 L45 262 C35 262 30 260 30 255 Z"
                    fill={f.car}
                  />
                  <path
                    d="M300 80 L250 162 L420 162 L420 80 Z M436 80 L436 162 L600 162 L600 80 Z M616 80 L616 162 L738 162 L727 102 C724 88 716 80 702 80 Z"
                    fill={f.carGlass}
                  />
                  <path
                    d="M52 206 L118 196 L112 214 L56 220 Z"
                    fill={f.light}
                  />
                  {[205, 640].map((cx) => (
                    <g key={cx}>
                      <circle cx={cx} cy="262" r="52" fill="#000" />
                      <circle cx={cx} cy="262" r="28" fill={f.carGlass} />
                      <circle cx={cx} cy="262" r="8" fill={f.light} />
                    </g>
                  ))}
                </svg>
                <span
                  className="relative mt-2 font-mono text-[11px] tracking-[0.12em]"
                  style={{ color: f.muted }}
                >
                  [REPLACE WITH CAR PHOTO · TRANSPARENT PNG]
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Section index on the right edge */}
        <nav
          aria-label="Sections"
          className="absolute right-3 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-3 sm:right-6 lg:right-10 xl:flex"
        >
          {SECTIONS.map((x, i) => (
            <a
              key={x.href}
              href={x.href}
              className="flex min-h-11 flex-col items-center justify-center gap-2 font-mono text-[12px]"
              style={{
                color: i === 0 ? f.ink : f.muted,
                opacity: i === 0 ? 1 : 0.6,
              }}
            >
              <span>{x.no}</span>
              {i === 0 && (
                <span
                  aria-hidden="true"
                  className="h-12 w-px"
                  style={{ background: f.ink }}
                />
              )}
              <span className="sr-only">{x.label}</span>
            </a>
          ))}
        </nav>
      </div>

      {/* Key numbers strip, from the data */}
      {highlights.length > 0 && (
        <ul
          aria-label="Key numbers"
          className="relative z-10 mx-3 m-0 grid list-none grid-cols-2 gap-px overflow-hidden rounded-[24px] border p-0 backdrop-blur-[24px] sm:mx-6 lg:mx-10 lg:grid-cols-4"
          style={{ borderColor: f.glassBorder, background: f.glassBorder }}
        >
          {highlights.map((h) => (
            <li
              key={h.key}
              className="flex items-center gap-4 px-5 py-4 sm:px-7"
              style={{ background: "rgba(1,20,53,0.82)" }}
            >
              <span
                className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl border"
                style={{ borderColor: f.glassBorder, color: f.accent }}
              >
                <svg
                  aria-hidden="true"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {ICONS[h.key]}
                </svg>
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="font-semibold leading-tight">{h.title}</span>
                <span
                  className="truncate text-[13px]"
                  style={{ color: f.muted }}
                >
                  {h.note}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Social links and scroll cue */}
      <div className="relative z-10 flex items-center justify-between px-5 pb-4 pt-3 sm:px-8 lg:px-14">
        <div className="flex gap-1">
          <a
            href={instagramUrl ?? "#contact"}
            aria-label="Instagram"
            className="inline-flex h-11 w-11 items-center justify-center"
            style={{ color: f.ink }}
            {...(instagramUrl
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.6" />
            </svg>
          </a>
          <a
            href="#contact"
            aria-label="Contact"
            className="inline-flex h-11 w-11 items-center justify-center"
            style={{ color: f.ink }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <path d="M3 7l9 6 9-6" />
            </svg>
          </a>
        </div>
        <a
          href="#start"
          className="hidden min-h-11 items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] sm:inline-flex"
          style={{ color: f.muted }}
        >
          <span
            aria-hidden="true"
            className="flex h-7 w-[18px] justify-center rounded-full border pt-1.5"
            style={{ borderColor: f.muted }}
          >
            <span
              className="h-1.5 w-px motion-safe:animate-bounce"
              style={{ background: f.muted }}
            />
          </span>
          Scroll to explore
        </a>
        <span className="w-[88px]" aria-hidden="true" />
      </div>
    </section>
  );
}
