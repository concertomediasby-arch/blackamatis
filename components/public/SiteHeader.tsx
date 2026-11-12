"use client";

import { headerLabel } from "@/lib/home";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV, normPath } from "@/lib/nav";
import { useVehicleField } from "./ContentProvider";
import { SettingsMenu } from "./SettingsMenu";

type Face = "dark" | "light";

/**
 * Floating glass header. On the home page the hero renders its own instance
 * (`inHero`) so it can follow the face toggle; the layout copy hides there.
 */
export function SiteHeader({ face = "dark", inHero = false }: { face?: Face; inHero?: boolean }) {
  const pathname = normPath(usePathname());
  const label = headerLabel(useVehicleField("home"), useVehicleField("category"));
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  if (pathname === "/" && !inHero) return null;

  const light = face === "light";
  const shell = light
    ? "bg-white/35 border-white/75 text-black on-light"
    : "bg-[rgba(1,20,53,0.62)] border-white/15 text-ink";
  const linkIdle = light ? "text-black hover:bg-black/10" : "text-muted-2 hover:text-ink hover:bg-white/10";
  const linkActive = light ? "bg-black text-lemon" : "bg-lemon text-black";

  return (
    <header
      className={`relative z-30 mx-3 mt-5 rounded-[36px] border px-3 py-3 pl-5 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-[24px] backdrop-saturate-150 transition-colors duration-500 sm:mx-6 lg:mx-10 lg:py-3.5 lg:pl-7 lg:pr-4 ${shell}`}
    >
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="flex min-h-11 items-center font-display text-[24px] font-extrabold tracking-[0.08em] lg:text-[28px]">
          BLACK AMETHYST
        </Link>

        <nav aria-label="Main menu" className="hidden items-center gap-1.5 lg:flex">
          {NAV.map((n) => {
            const on = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={on ? "page" : undefined}
                className={`pill min-h-12 px-3.5 text-[15px] font-semibold xl:px-5 xl:text-[16px] ${on ? linkActive : linkIdle}`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {inHero ? (
            <a href="#contact" className={`pill min-h-12 px-6 text-[15px] xl:text-[16px] ${light ? "bg-black text-lemon" : "bg-amber text-prussian"}`}>
              Contact
            </a>
          ) : (
            <span
              className={`hidden min-h-12 items-center rounded-full border px-5 font-mono text-[13px] tracking-[0.12em] sm:inline-flex lg:hidden 2xl:inline-flex ${
                light ? "border-black/30" : "border-white/15 bg-white/10"
              }`}
            >
              {label}
            </span>
          )}
          <SettingsMenu light={light} />
          <button
            type="button"
            className={`pill border lg:hidden ${light ? "border-black/40" : "border-white/30"}`}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
            Menu
          </button>
        </div>
      </div>

      <nav id="mobile-nav" aria-label="Main menu" hidden={!open} className="lg:hidden">
        <ul className="mt-3 flex flex-col gap-1 pb-2">
          {NAV.map((n) => {
            const on = pathname === n.href;
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={on ? "page" : undefined}
                  className={`pill w-full justify-start ${on ? linkActive : linkIdle}`}
                >
                  {n.label}
                </Link>
              </li>
            );
          })}
          <li className="px-5 pt-2 font-mono text-xs tracking-[0.12em] sm:hidden">{label}</li>
        </ul>
      </nav>
    </header>
  );
}
