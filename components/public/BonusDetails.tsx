"use client";

import { Placeholder } from "@/components/ui/Placeholder";
import { normalizeMedia, youtubeId } from "@/lib/bonus-media";
import { splitPhoto } from "@/lib/photo";
import { storageUrl } from "@/lib/supabase/env";
import type { BonusMedia, PublicBonusRequest } from "@/lib/types";

export type BonusTab = "idea" | "process" | "result";

/** One photo or video with its caption. Process items are numbered as steps. */
function MediaItem({
  m,
  step,
  name,
}: {
  m: BonusMedia;
  step?: number;
  name: string;
}) {
  const label = m.caption || (step ? `Step ${step}` : "Result");
  const yt = m.kind === "video" ? youtubeId(m.url) : null;
  const file = storageUrl(m.path);
  const box =
    "relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black/10";
  let media: React.ReactNode;
  if (m.kind === "photo") {
    const full = storageUrl(splitPhoto(m.path).path);
    media = full ? (
      <a
        href={full}
        target="_blank"
        rel="noopener noreferrer"
        className={`${box} block`}
        aria-label={`${label}: open photo full size`}
      >
        <Placeholder
          path={m.path}
          label="Photo"
          alt={label}
          tone="light"
          className="h-full w-full"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </a>
    ) : (
      <Placeholder
        path={null}
        label="Photo"
        alt={label}
        tone="light"
        className={`${box} text-[10px]`}
      />
    );
  } else if (yt) {
    media = (
      <div className={box}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${yt}`}
          title={`${name}: ${label}`}
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  } else if (file) {
    media = (
      <div className={box}>
        <video
          src={file}
          controls
          playsInline
          preload="metadata"
          aria-label={`${name}: ${label}`}
          className="absolute inset-0 h-full w-full bg-black object-contain"
        />
      </div>
    );
  } else if (m.url) {
    media = (
      <a
        href={m.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${box} flex flex-col items-center justify-center gap-2 bg-black text-lemon hover:bg-black/85`}
      >
        <svg
          aria-hidden="true"
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
        <span className="text-sm font-semibold">Watch video ↗</span>
      </a>
    );
  } else {
    media = (
      <Placeholder
        path={null}
        label="Video"
        alt={label}
        tone="light"
        className={`${box} text-[10px]`}
      />
    );
  }
  return (
    <figure className="m-0 flex flex-col gap-2.5">
      {media}
      <figcaption className="flex flex-col gap-1">
        <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-dark-muted">
          {step ? `STEP ${String(step).padStart(2, "0")}` : "RESULT"}
          <span aria-hidden="true">·</span>
          {m.kind === "video" ? "VIDEO" : "PHOTO"}
        </span>
        <span className="text-[14px] leading-snug">
          {m.caption || (
            <span className="font-mono text-[12px] text-dark-muted">
              [Caption: what this shows]
            </span>
          )}
        </span>
      </figcaption>
    </figure>
  );
}

function MediaGrid({
  items,
  steps,
  name,
  empty,
}: {
  items: BonusMedia[];
  steps: boolean;
  name: string;
  empty: string;
}) {
  if (items.length === 0)
    return (
      <p className="m-0 font-mono text-[12px] tracking-[0.08em] text-dark-muted">
        [{empty}]
      </p>
    );
  return (
    <ol className="m-0 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((m, i) => (
        <li key={m.id}>
          <MediaItem m={m} step={steps ? i + 1 : undefined} name={name} />
        </li>
      ))}
    </ol>
  );
}

/** Idea, Process or Result of one bonus request, shown under its row (the row's buttons pick which). */
export function BonusDetails({
  request: r,
  id,
  tab,
}: {
  request: PublicBonusRequest;
  id: string;
  tab: BonusTab;
}) {
  const name = r.title || r.code;
  const paragraphs = (r.description ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const label = { idea: "Idea", process: "Process", result: "Result" }[tab];

  return (
    <section
      id={id}
      role="tabpanel"
      aria-label={`${name}: ${label}`}
      className="flex flex-col gap-4"
    >
      {tab === "idea" &&
        (paragraphs.length ? (
          <div className="flex max-w-[760px] flex-col gap-3 text-[16px] leading-[1.7]">
            {paragraphs.map((p, i) => (
              <p key={i} className="m-0 whitespace-pre-line">
                {p}
              </p>
            ))}
          </div>
        ) : (
          <p className="m-0 font-mono text-[12px] tracking-[0.08em] text-dark-muted">
            [IDEA NOT WRITTEN YET]
          </p>
        ))}
      {tab === "process" && (
        <MediaGrid
          items={normalizeMedia(r.process)}
          steps
          name={name}
          empty="NO PROCESS PHOTOS OR VIDEOS YET"
        />
      )}
      {tab === "result" && (
        <MediaGrid
          items={normalizeMedia(r.result)}
          steps={false}
          name={name}
          empty="NO RESULT PHOTOS OR VIDEOS YET"
        />
      )}
    </section>
  );
}
