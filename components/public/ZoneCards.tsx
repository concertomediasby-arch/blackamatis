import { Placeholder } from "@/components/ui/Placeholder";
import type { SiteContent } from "@/lib/types";

/** Theme: Exterior / Interior / Trunk cards with their judge criterion and theme elements (also the editor's preview). */
export function ZoneCards({ zones }: { zones: SiteContent["zones"] }) {
  return (
    <ul className="px-8 sm:px-[72px] lg:px-[88px] m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 pb-24">
      {zones.map((z) => (
        <li
          key={z.key}
          className="glass-dark flex flex-col overflow-hidden rounded-[28px]"
        >
          <Placeholder
            path={z.photo_path}
            label={`${z.name} photo`}
            alt={z.name}
            className="h-[260px] border-0 border-b"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="flex flex-col gap-3.5 p-7">
            <span className="label text-amber">
              Judge criterion · {z.criterion}
            </span>
            <h3 className="display m-0 text-[34px] font-extrabold">{z.name}</h3>
            <ul className="m-0 flex flex-col gap-2 pl-5 text-[15px] leading-normal text-muted">
              {z.elements.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ul>
  );
}
