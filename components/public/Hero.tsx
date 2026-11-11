"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "@/components/ui/Arrow";
import { CarPhoto } from "./CarPhoto";
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

/** Deterministic splatter dots around the car. */
const DOTS = (() => {
  let s = 7;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 80 }, () => {
    const x = 60 + rnd() * 900;
    const y = 110 + rnd() * 430;
    const r = rnd() < 0.08 ? 5 + rnd() * 3 : 1 + rnd() * 3.5;
    return { x: Math.round(x), y: Math.round(y), r: Math.round(r * 10) / 10 };
  });
})();

type Props = {
  darkName: string;
  lightName: string;
  carPhotoUrl: string | null;
  carLayout: CarPhotoLayout;
  instagramUrl: string | null;
  /** Key numbers from the data, e.g. "EXPERT UNLIMITED", "15 amplifiers". */
  stats: string[];
};

/**
 * Landing hero, one screen tall: the word AMATIS across the top, the car in
 * front of its lower half, the headline bottom left with the two ways in, and
 * key numbers from the data along the bottom edge.
 */
export function Hero({
  darkName,
  lightName,
  carPhotoUrl,
  carLayout,
  instagramUrl,
  stats,
}: Props) {
  // The hero shows the dark face; the light palette stays for a future switch.
  const [face] = useState<Face>("dark");
  const f = FACES[face];
  const pencilTone = face === "dark" ? "dark" : "light";

  return (
    <section
      aria-label="Hero"
      className={`relative flex min-h-[100svh] flex-col overflow-hidden ${face === "light" ? "on-light" : ""}`}
      style={{
        background: f.bg,
        color: f.ink,
        transition: "background-color .5s ease, color .5s ease",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      >
        <div
          className="orb left-[30%] top-[-120px] h-[560px] w-[560px] opacity-45 blur-[130px]"
          style={{ background: f.orbA }}
        />
        <div
          className="orb bottom-[-160px] right-[-80px] h-[520px] w-[520px] opacity-80 blur-[120px]"
          style={{ background: f.orbB }}
        />
        <div
          className="orb bottom-[-200px] left-[-120px] h-[480px] w-[480px] opacity-70 blur-[120px]"
          style={{ background: f.orbB }}
        />
      </div>

      <SiteHeader face={face} inHero />

      {/* Word + car: the word sits high so its top half stays readable above the car. */}
      <div
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-3 pt-4 sm:px-6 lg:px-10"
        style={
          {
            "--word": "clamp(96px, min(23vw, 26vh), 420px)",
          } as React.CSSProperties
        }
      >
        <span
          aria-hidden="true"
          className="pointer-events-none select-none font-display font-black leading-[0.78] tracking-[-0.01em]"
          style={{
            fontSize: "var(--word)",
            color: f.word,
            transition: "color .5s ease",
          }}
        >
          AMATIS
        </span>
        <div
          className="relative flex w-full flex-col items-center"
          style={{
            marginTop: "calc(var(--word) * -0.46)",
            maxWidth: "min(1180px, 104vh)",
          }}
        >
          <EditPencil
            href="/editor/vehicle/#f-car-photo"
            label="Car photo"
            className="right-[6%] top-2"
            tone={pencilTone}
          />
          <svg
            aria-hidden="true"
            viewBox="0 0 1000 660"
            preserveAspectRatio="xMidYMid meet"
            className="absolute -inset-x-[4%] -inset-y-[6%] h-[112%] w-[108%] opacity-85"
            style={{ fill: f.speck }}
          >
            {DOTS.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r={d.r} />
            ))}
          </svg>
          {carPhotoUrl ? (
            <CarPhoto
              url={carPhotoUrl}
              layout={carLayout}
              className="max-w-[1100px]"
            />
          ) : (
            <>
              <svg
                role="img"
                aria-label="Honda Odyssey silhouette (car photo not uploaded yet)"
                viewBox="0 0 810 330"
                className="relative h-auto w-full max-w-[900px] drop-shadow-[0_40px_40px_rgba(0,0,0,0.45)]"
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
                  d="M428 80 L428 250 M608 80 L608 250 M60 222 L770 222"
                  stroke={f.carGlass}
                  strokeWidth="3"
                  fill="none"
                />
                <path d="M52 206 L118 196 L112 214 L56 220 Z" fill={f.light} />
                <path
                  d="M752 120 L770 120 L776 170 L758 170 Z"
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
            </>
          )}
        </div>
      </div>

      {/* Headline and the two ways in. */}
      <div className="relative z-10 flex flex-wrap items-end justify-between gap-x-10 gap-y-6 px-8 pb-4 pt-3 sm:px-[72px] lg:px-[88px]">
        <div className="relative flex max-w-[900px] flex-col gap-3">
          <EditPencil
            href="/editor/vehicle/#faces"
            label="Dark and light side names"
            className="-right-12 -top-2"
            tone={pencilTone}
          />
          <span className="eyebrow" style={{ color: f.accent }}>
            {face === "dark" ? darkName : lightName}
          </span>
          <h1
            className="display m-0 font-black tracking-[0.01em]"
            style={{
              fontSize: "clamp(40px, min(4.6vw, 7vh), 76px)",
              lineHeight: 0.92,
            }}
          >
            <span className="whitespace-nowrap">ONE CAR.</span>{" "}
            <span className="whitespace-nowrap">TWO FACES.</span>
          </h1>
          <p
            className="m-0 max-w-[480px] text-[16px] leading-relaxed"
            style={{ color: f.muted }}
          >
            A Honda Odyssey built for EMMA 2026. One two-face concept, carried
            from the exterior through the interior to the trunk.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href="#start"
            className="pill min-h-12 px-6"
            style={{ background: f.ctaBg, color: f.ctaFg }}
          >
            Explore the build <span aria-hidden="true">↓</span>
          </a>
          <Link
            href="/judge"
            className="pill min-h-12 border px-6"
            style={{ borderColor: f.line, color: f.ink }}
          >
            Judge Mode <ArrowUpRight />
          </Link>
        </div>
      </div>

      {/* Key numbers from the data, social links and the scroll cue. */}
      <div
        className="relative z-10 mx-3 mb-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t px-5 pt-4 sm:mx-6 sm:px-12 lg:mx-10"
        style={{ borderColor: f.line }}
      >
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
        {stats.length > 0 && (
          <ul
            aria-label="Key numbers"
            className="m-0 grid w-full list-none grid-cols-2 gap-x-5 gap-y-1 p-0 font-mono text-[12px] tracking-[0.12em] sm:flex sm:w-auto sm:flex-wrap sm:items-center"
          >
            {stats.map((s, i) => (
              <li
                key={s}
                className="flex items-center gap-5"
                style={{ color: i === 0 ? f.accent : f.muted }}
              >
                {i > 0 && (
                  <span aria-hidden="true" className="hidden sm:inline" style={{ color: f.line }}>
                    ·
                  </span>
                )}
                {s.toUpperCase()}
              </li>
            ))}
          </ul>
        )}
        <a
          href="#start"
          className="hidden min-h-11 items-center gap-3 text-[13px] font-semibold sm:inline-flex"
          style={{ color: f.ink }}
        >
          <span
            aria-hidden="true"
            className="h-px w-10"
            style={{ background: f.line }}
          />
          Scroll to explore
        </a>
      </div>
    </section>
  );
}
