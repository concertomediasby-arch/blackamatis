"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "@/lib/nav";

type Face = "dark" | "light";

/**
 * Floating glass header. On the home page the hero renders its own instance
 * (`inHero`) so it can follow the face toggle; the layout copy hides there.
 */
export function SiteHeader({ category, face = "dark", inHero = false }: { category: string; face?: Face; inHero?: boolean }) {
  const pathname = usePathname();
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
      className={`relative z-30 mx-3 mt-5 rounded-[32px] border px-3 py-2.5 pl-5 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-[24px] backdrop-saturate-150 transition-colors duration-500 sm:mx-6 lg:mx-10 ${shell}`}
    >
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="flex min-h-11 items-center font-display text-[22px] font-extrabold tracking-[0.08em]">
          BLACK AMATIS
        </Link>

        <nav aria-label="Main menu" className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => {
            const on = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={on ? "page" : undefined}
                className={`pill px-4 font-semibold ${on ? linkActive : linkIdle}`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {inHero ? (
            <a href="#contact" className={`pill ${light ? "bg-black text-lemon" : "bg-amber text-prussian"}`}>
              Contact
            </a>
          ) : (
            <span
              className={`hidden min-h-11 items-center rounded-full border px-4 font-mono text-xs tracking-[0.12em] sm:inline-flex ${
                light ? "border-black/30" : "border-white/15 bg-white/10"
              }`}
            >
              EMMA 2026 · {category}
            </span>
          )}
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
          <li className="px-5 pt-2 font-mono text-xs tracking-[0.12em] sm:hidden">EMMA 2026 · {category}</li>
        </ul>
      </nav>
    </header>
  );
}
