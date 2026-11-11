import { Placeholder } from "@/components/ui/Placeholder";
import { heroTransform, normalizeLayout } from "@/lib/photo";
import type { Partner } from "@/lib/types";

/**
 * A partner logo in its box. The logo sits in a fixed 200 × 60 area in the
 * middle of the box, moved and scaled by the saved layout, so the editor
 * preview matches the site whatever the box width.
 */
export function PartnerLogo({ partner: p }: { partner: Pick<Partner, "name" | "logo_path" | "logo_layout"> }) {
  const layout = normalizeLayout(p.logo_layout);
  if (!p.logo_path)
    return (
      <Placeholder path={null} label={p.name.replace(/^\[|\]$/g, "") || "Partner logo"} alt={p.name} className="h-[88px] rounded-[18px] bg-white/5" />
    );
  return (
    <div className="relative h-[88px] overflow-hidden rounded-[18px] bg-white/5">
      <div className="absolute left-1/2 top-1/2 h-[60px] w-[200px] max-w-[calc(100%-16px)] -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-0" style={{ transform: heroTransform(layout) }}>
          <Placeholder path={p.logo_path} label="Logo" alt={p.name} fit="contain" className="h-full w-full" sizes="240px" />
        </div>
      </div>
    </div>
  );
}
