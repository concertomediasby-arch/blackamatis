import { PhotoSlider } from "@/components/public/PhotoSlider";
import type { HistorySlider } from "@/lib/page-layout";
import type { BonusMedia } from "@/lib/types";

/**
 * The History slider, with the team's optional text on its left (wide screens)
 * or above it (phones and tablets). Without text the slider fills the row as before.
 */
export function HistorySlides({
  photos,
  text,
  slider,
  label,
}: {
  photos: BonusMedia[];
  text?: string | null;
  slider: HistorySlider;
  label: string;
}) {
  const slides = (
    <PhotoSlider
      photos={photos}
      label={label}
      maxVh={slider.height}
      bordered={slider.frame}
    />
  );
  // Each line or blank-line-separated block is its own paragraph.
  const paragraphs = (text ?? "")
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) return slides;
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] lg:items-center lg:gap-12">
      <div className="flex flex-col gap-4 px-2 text-lg leading-[1.7] text-muted lg:pl-8">
        {paragraphs.map((p, i) => (
          <p key={i} className="m-0">
            {p}
          </p>
        ))}
      </div>
      <div className="min-w-0">{slides}</div>
    </div>
  );
}
