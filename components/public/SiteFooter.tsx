"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { prevNext } from "@/lib/nav";
import { useVehicleField } from "./ContentProvider";

export function SiteFooter() {
  const instagram = useVehicleField("instagram") ?? "";
  const installer = useVehicleField("installer") ?? "…";
  const pathname = usePathname();
  const { prev, next } = prevNext(pathname);
  return (
    <footer
      id="contact"
      className="glass-dark relative z-10 mx-3 mb-6 mt-24 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-[32px] px-7 py-3.5 font-mono text-xs tracking-[0.1em] text-muted-2 sm:mx-6 lg:mx-10"
    >
      <span className="flex min-h-11 items-center">BLACK AMATIS · HONDA ODYSSEY</span>
      <span className="flex min-h-11 items-center gap-4">
        {instagram && (
          <>
            <span>{instagram}</span>
            <span aria-hidden="true">·</span>
          </>
        )}
        <span>INSTALLED BY {installer}</span>
      </span>
      <span className="flex items-center gap-6">
        {prev && (
          <Link href={prev.href} className="flex min-h-11 items-center text-amber hover:text-lemon">
            ← {prev.label.toUpperCase()}
          </Link>
        )}
        {next && (
          <Link href={next.href} className="flex min-h-11 items-center text-amber hover:text-lemon">
            NEXT: {next.label.toUpperCase()} →
          </Link>
        )}
      </span>
    </footer>
  );
}
