import Image from "next/image";
import { heroTransform, type CarPhotoLayout } from "@/lib/photo";

/**
 * The cut-out car photo in the hero box, moved and scaled by the saved layout:
 * `mobile` below 768 px, `desktop` from 768 px. Also used by the editor preview.
 */
export function CarPhoto({ url, layout, force }: { url: string; layout: CarPhotoLayout; force?: "desktop" | "mobile" }) {
  const vars = { "--car-m": heroTransform(layout.mobile), "--car-d": heroTransform(layout.desktop) } as React.CSSProperties;
  const transform =
    force === "desktop" ? "[transform:var(--car-d)]" : force === "mobile" ? "[transform:var(--car-m)]" : "[transform:var(--car-m)] md:[transform:var(--car-d)]";
  return (
    <div className="relative aspect-[810/330] w-full max-w-[820px]">
      <div className={`absolute inset-0 ${transform}`} style={vars}>
        <Image
          src={url}
          alt="Black Amatis, Honda Odyssey"
          fill
          priority
          unoptimized={/^(blob:|data:)/.test(url)}
          sizes="(max-width: 768px) 100vw, 820px"
          className="pointer-events-none select-none object-contain drop-shadow-[0_40px_40px_rgba(0,0,0,0.45)]"
          draggable={false}
        />
      </div>
    </div>
  );
}
