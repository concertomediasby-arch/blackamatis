"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "@/components/ui/Arrow";
import { SiteHeader } from "./SiteHeader";
import type { EmmaClass } from "@/lib/emma/matrix";

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
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: 80 }, () => {
    const x = 60 + rnd() * 900;
    const y = 110 + rnd() * 430;
    const r = rnd() < 0.08 ? 5 + rnd() * 3 : 1 + rnd() * 3.5;
    return { x: Math.round(x), y: Math.round(y), r: Math.round(r * 10) / 10 };
  });
})();

const CLASS_CHIPS: { k: EmmaClass; name: string }[] = [
  { k: "E", name: "Entry" },
  { k: "S", name: "Skilled" },
  { k: "M", name: "Master" },
  { k: "X", name: "Expert" },
];

type Props = {
  category: string;
  emmaClass: EmmaClass;
  darkName: string;
  lightName: string;
  carPhotoUrl: string | null;
  instagramUrl: string | null;
};

export function Hero({ category, emmaClass, darkName, lightName, carPhotoUrl, instagramUrl }: Props) {
  const [face, setFace] = useState<Face>("dark");
  const f = FACES[face];
  const selClass = emmaClass === "XU" ? "X" : emmaClass;
  const glassStyle = {
    background: f.glass,
    borderColor: f.glassBorder,
    transition: "background-color .5s ease, color .5s ease, border-color .5s ease",
  };

  return (
    <section
      aria-label="Hero"
      className={`relative flex min-h-[860px] flex-col overflow-hidden ${face === "light" ? "on-light" : ""}`}
      style={{ background: f.bg, color: f.ink, transition: "background-color .5s ease, color .5s ease" }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <div className="orb left-[30%] top-[-120px] h-[560px] w-[560px] opacity-45 blur-[130px]" style={{ background: f.orbA }} />
        <div className="orb bottom-[-160px] right-[-80px] h-[520px] w-[520px] opacity-80 blur-[120px]" style={{ background: f.orbB }} />
        <div className="orb bottom-[-200px] left-[-120px] h-[480px] w-[480px] opacity-70 blur-[120px]" style={{ background: f.orbB }} />
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 z-0 flex -translate-y-[46%] justify-center">
        <span
          className="font-display font-black leading-[0.8] tracking-[-0.01em]"
          style={{ fontSize: "clamp(150px, 25vw, 400px)", color: f.word, transition: "color .5s ease" }}
        >
          AMATIS
        </span>
      </div>

      <SiteHeader category={category} face={face} inHero />

      <div className="relative z-10 flex flex-1 flex-wrap items-center justify-between gap-6 px-5 py-6 sm:px-8 lg:px-14">
        <div
          className="flex max-w-[360px] flex-[1_1_260px] flex-col gap-4 rounded-[28px] border p-7 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-[24px] backdrop-saturate-150"
          style={glassStyle}
        >
          <span className="eyebrow" style={{ color: f.accent }}>
            {face === "dark" ? darkName : lightName}
          </span>
          <h1 className="display m-0 font-black tracking-[0.01em]" style={{ fontSize: "clamp(44px, 4.6vw, 64px)" }}>
            ONE CAR.
            <br />
            TWO FACES.
          </h1>
          <p className="m-0 text-[15px] leading-relaxed" style={{ color: f.muted }}>
            A Honda Odyssey built for EMMA 2026. One two-face concept, carried from the exterior through the interior to the trunk.
          </p>
        </div>

        <div className="relative flex min-h-[340px] flex-[3_1_460px] flex-col items-center justify-center">
          <svg aria-hidden="true" viewBox="0 0 1000 660" preserveAspectRatio="xMidYMid meet" className="absolute -inset-x-[4%] -inset-y-[6%] h-[112%] w-[108%] opacity-85" style={{ fill: f.speck }}>
            {DOTS.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r={d.r} />
            ))}
          </svg>
          {carPhotoUrl ? (
            <div className="relative aspect-[810/330] w-full max-w-[820px]">
              <Image src={carPhotoUrl} alt="Black Amatis, Honda Odyssey" fill priority sizes="(max-width: 768px) 100vw, 820px" className="object-contain drop-shadow-[0_40px_40px_rgba(0,0,0,0.45)]" />
            </div>
          ) : (
            <>
              <svg role="img" aria-label="Honda Odyssey silhouette (car photo not uploaded yet)" viewBox="0 0 810 330" className="relative h-auto w-full max-w-[820px] drop-shadow-[0_40px_40px_rgba(0,0,0,0.45)]">
                <path d="M30 255 C30 225 45 205 80 195 L190 170 L285 75 C298 62 312 58 330 58 L705 58 C735 58 750 72 756 95 L778 205 C782 225 780 250 768 258 L702 262 A62 62 0 0 0 578 262 L267 262 A62 62 0 0 0 143 262 L45 262 C35 262 30 260 30 255 Z" fill={f.car} />
                <path d="M300 80 L250 162 L420 162 L420 80 Z M436 80 L436 162 L600 162 L600 80 Z M616 80 L616 162 L738 162 L727 102 C724 88 716 80 702 80 Z" fill={f.carGlass} />
                <path d="M428 80 L428 250 M608 80 L608 250 M60 222 L770 222" stroke={f.carGlass} strokeWidth="3" fill="none" />
                <path d="M52 206 L118 196 L112 214 L56 220 Z" fill={f.light} />
                <path d="M752 120 L770 120 L776 170 L758 170 Z" fill={f.light} />
                {[205, 640].map((cx) => (
                  <g key={cx}>
                    <circle cx={cx} cy="262" r="52" fill="#000" />
                    <circle cx={cx} cy="262" r="28" fill={f.carGlass} />
                    <circle cx={cx} cy="262" r="8" fill={f.light} />
                  </g>
                ))}
              </svg>
              <span className="relative mt-2 font-mono text-[11px] tracking-[0.12em]" style={{ color: f.muted }}>
                [REPLACE WITH CAR PHOTO · TRANSPARENT PNG]
              </span>
            </>
          )}
        </div>

        <div
          className="ml-auto flex max-w-[250px] flex-[1_1_200px] flex-col items-center gap-4 rounded-[28px] border px-5 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-[24px] backdrop-saturate-150"
          style={glassStyle}
        >
          <span id="face-label" className="text-sm font-medium">
            Choose face
          </span>
          <div role="group" aria-labelledby="face-label" className="flex gap-3.5">
            {(
              [
                { key: "dark", label: "Dark face", swatch: "linear-gradient(135deg, #000231 50%, #E5A90A 50%)" },
                { key: "light", label: "Light face", swatch: "linear-gradient(135deg, #000000 50%, #FEF112 50%)" },
              ] as const
            ).map((p) => (
              <button
                key={p.key}
                type="button"
                aria-pressed={face === p.key}
                aria-label={p.label}
                onClick={() => setFace(p.key)}
                className="h-[52px] w-[52px] cursor-pointer rounded-full border-0 p-0"
                style={{
                  background: p.swatch,
                  boxShadow: face === p.key ? `0 0 0 3px ${f.bg}, 0 0 0 5px ${f.ink}` : `0 0 0 1px ${f.line}`,
                }}
              />
            ))}
          </div>
          <span id="cat-label" className="mt-2 text-sm font-medium">
            Category
          </span>
          <ul aria-labelledby="cat-label" className="m-0 flex list-none gap-2.5 p-0">
            {CLASS_CHIPS.map((c) => {
              const on = c.k === selClass;
              return (
                <li
                  key={c.k}
                  title={c.name}
                  className="flex h-12 w-12 items-center justify-center rounded-full border font-display text-lg font-extrabold"
                  style={{ borderColor: f.ink, background: on ? f.ink : "transparent", color: on ? f.bg : f.ink }}
                >
                  {c.k}
                  <span className="sr-only">
                    {c.name}
                    {on ? " (entered)" : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 px-5 pb-7 sm:px-8 lg:px-14">
        <div className="flex gap-1">
          <a
            href={instagramUrl ?? "#contact"}
            aria-label="Instagram"
            className="inline-flex h-11 w-11 items-center justify-center"
            style={{ color: f.ink }}
            {...(instagramUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.6" />
            </svg>
          </a>
          <a href="#contact" aria-label="Contact" className="inline-flex h-11 w-11 items-center justify-center" style={{ color: f.ink }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <path d="M3 7l9 6 9-6" />
            </svg>
          </a>
        </div>
        <div className="hidden items-center gap-4 sm:flex">
          <span aria-hidden="true" className="h-px w-20" style={{ background: f.line }} />
          <a href="#vehicle" className="text-[13px] font-semibold" style={{ color: f.ink }}>
            Scroll to explore
          </a>
          <span aria-hidden="true" className="h-px w-20" style={{ background: f.line }} />
        </div>
        <Link href="/installation" className="pill min-h-12" style={{ background: f.ctaBg, color: f.ctaFg }}>
          View installation <ArrowUpRight />
        </Link>
      </div>
    </section>
  );
}
