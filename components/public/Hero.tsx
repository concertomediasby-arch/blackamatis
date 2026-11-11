"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "@/components/ui/Arrow";
import { CarPhoto } from "./CarPhoto";
import { Carousel } from "./PhotoSlider";
import { EditPencil } from "./EditMode";
import type { CarPhotoLayout } from "@/lib/photo";
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

/** Section index on the right edge. */
const SECTIONS = [
  { href: "#top", label: "Build" },
  { href: "#start", label: "Ways in" },
  { href: "#vehicle", label: "Details" },
];

type Props = {
  classLabel: string;
  /** Cut-out car photos: the main one first, then the extra hero photos. */
  carPhotoUrls: string[];
  carLayout: CarPhotoLayout;
  instagramUrl: string | null;
  /** Thumbnail for the judges' card (e.g. the system diagram). */
  judgeThumbUrl: string | null;
};

/**
 * Landing hero, one screen tall: AMATIS large and faint behind the car,
 * the car on the right, the headline bottom left, a judges' card,
 * a section index and a vertical scroll cue on the right edge.
 */
export function Hero({
  classLabel,
  carPhotoUrls,
  carLayout,
  instagramUrl,
  judgeThumbUrl,
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
          className="orb right-[20%] top-[-180px] h-[640px] w-[640px] opacity-35 blur-[140px]"
          style={{ background: f.orbA }}
        />
        <div
          className="orb bottom-[-200px] left-[-120px] h-[520px] w-[520px] opacity-70 blur-[120px]"
          style={{ background: f.orbB }}
        />
      </div>

      {/* AMATIS, large and faint, behind everything */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[16%] z-0 flex justify-center"
      >
        <span
          className="select-none font-display font-black leading-[0.8]"
          style={{
            fontSize: "clamp(140px, min(27vw, 46vh), 520px)",
            color: "rgba(242,240,230,0.06)",
          }}
        >
          AMATIS
        </span>
      </div>

      <SiteHeader face={face} inHero />

      <div className="relative z-10 grid flex-1 grid-cols-1 gap-6 px-8 pb-6 pt-6 sm:px-[72px] lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:pr-[140px] lg:pl-[88px]">
        {/* Car */}
        <div className="relative flex flex-col items-center justify-center gap-4 lg:order-2 lg:items-end">
          <EditPencil
            href="/editor/vehicle/#f-car-photo"
            label="Car photo"
            className="right-[2%] top-[4%]"
            tone={pencilTone}
          />
          <div
            className="relative w-full lg:w-[92%]"
            style={{ maxWidth: "min(1040px, 108vh)" }}
          >
            {carPhotoUrls.length > 0 ? (
              <Carousel
                variant="bare"
                label="Photos of the car"
                showCaption={false}
                footerClassName="justify-end"
                slides={carPhotoUrls.map((url, i) => ({
                  id: `${i}-${url}`,
                  url,
                }))}
                renderSlide={(sl) => (
                  <div className="pointer-events-none select-none px-[2%]">
                    <CarPhoto
                      url={sl.url}
                      layout={carLayout}
                      className="max-w-none"
                    />
                  </div>
                )}
              />
            ) : (
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
                {[205, 640].map((cx) => (
                  <g key={cx}>
                    <circle cx={cx} cy="262" r="52" fill="#000" />
                    <circle cx={cx} cy="262" r="28" fill={f.carGlass} />
                  </g>
                ))}
              </svg>
            )}
          </div>
        </div>

        {/* Headline, bottom left */}
        <div className="relative flex flex-col justify-end gap-5 pt-10 lg:order-1 lg:pb-10">
          <span
            className="font-mono text-[12px] uppercase tracking-[0.16em]"
            style={{ color: f.accent }}
          >
            EMMA 2026 · {classLabel}
          </span>
          <h1
            className="display m-0 font-black"
            style={{
              fontSize: "clamp(48px, min(5.4vw, 9vh), 104px)",
              lineHeight: 0.92,
            }}
          >
            One car.
            <br />
            Two faces.
          </h1>
          <p
            className="m-0 max-w-[380px] text-[17px] leading-relaxed"
            style={{ color: f.muted }}
          >
            A Honda Odyssey built for EMMA 2026. One two-face concept, from the
            exterior through the interior to the trunk.
          </p>
          <a
            href="#start"
            className="group inline-flex min-h-12 items-center gap-3 self-start rounded-full border py-1.5 pl-6 pr-1.5 font-semibold uppercase tracking-[0.06em]"
            style={{ borderColor: f.line, color: f.ink }}
          >
            Explore the build
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5"
              style={{ background: f.ctaBg, color: f.ctaFg }}
            >
              <span aria-hidden="true">→</span>
            </span>
          </a>
        </div>
      </div>

      {/* Judges' card, bottom */}
      <div className="relative z-10 flex flex-wrap items-end justify-between gap-4 px-5 pb-6 sm:px-8 lg:pl-14 lg:pr-[140px]">
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
        <Link
          href="/judge"
          className="group flex items-center gap-4 rounded-2xl border p-1.5 pr-6 backdrop-blur-[24px]"
          style={{ borderColor: f.glassBorder, background: "rgba(0,0,0,0.55)" }}
        >
          <span
            className="relative h-14 w-24 overflow-hidden rounded-xl"
            style={{ background: f.glass }}
          >
            {judgeThumbUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- static export, small thumbnail
              <img
                src={judgeThumbUrl}
                alt=""
                className="h-full w-full object-cover opacity-80"
              />
            )}
          </span>
          <span className="flex flex-col leading-tight">
            <span
              className="font-mono text-[10px] uppercase tracking-[0.14em]"
              style={{ color: f.muted }}
            >
              For judges
            </span>
            <span className="font-semibold uppercase tracking-[0.04em]">
              Check the install
            </span>
          </span>
          <ArrowUpRight />
        </Link>
      </div>

      {/* Right edge: section dots and a vertical scroll cue */}
      <nav
        aria-label="Sections"
        className="absolute right-10 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-1 lg:flex"
      >
        {SECTIONS.map((x, i) => (
          <a
            key={x.href}
            href={x.href}
            className="flex h-8 w-8 items-center justify-center"
            aria-label={x.label}
            aria-current={i === 0 ? "true" : undefined}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: i === 0 ? f.accent : f.line }}
            />
          </a>
        ))}
      </nav>
      <a
        href="#start"
        className="absolute bottom-0 right-10 z-10 hidden h-[34vh] w-16 flex-col items-center justify-between rounded-t-2xl border border-b-0 py-5 font-mono text-[11px] uppercase tracking-[0.16em] lg:flex"
        style={{
          borderColor: f.glassBorder,
          background: f.glass,
          color: f.muted,
        }}
      >
        <span className="[writing-mode:vertical-rl] rotate-180">
          Scroll to explore
        </span>
        <span aria-hidden="true" style={{ color: f.accent }}>
          ↓
        </span>
      </a>
    </section>
  );
}
