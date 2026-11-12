import { Placeholder } from "@/components/ui/Placeholder";
import type { NewsPost } from "@/lib/types";

export const newsDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
};

/** News posts, newest first (public page and the editor preview). */
export function NewsList({ posts }: { posts: NewsPost[] }) {
  const list = [...posts]
    .filter((p) => p.title.trim() || p.body.trim())
    .sort((a, b) => b.published_at.localeCompare(a.published_at));
  if (list.length === 0)
    return (
      <p className="m-0 rounded-[28px] border border-white/10 px-8 py-12 text-center font-mono text-[12px] tracking-[0.12em] text-muted-2">
        NO NEWS YET. TURN ON NOTIFICATIONS IN SETTINGS TO HEAR ABOUT THE FIRST POST.
      </p>
    );
  return (
    <ol className="m-0 mx-auto flex max-w-[960px] list-none flex-col gap-6 p-0">
      {list.map((p) => (
        <li key={p.id} id={`news-${p.id}`} className="glass-dark scroll-mt-28 overflow-hidden rounded-[32px]">
          {p.photo_path && (
            <Placeholder
              path={p.photo_path}
              label="News photo"
              alt={p.title}
              className="aspect-[16/9] w-full border-0 border-b"
              sizes="(max-width: 1024px) 100vw, 960px"
            />
          )}
          <article className="flex flex-col gap-4 p-7 sm:p-10">
            <time dateTime={p.published_at} className="font-mono text-[12px] tracking-[0.14em] text-amber">
              {newsDate(p.published_at).toUpperCase()}
            </time>
            <h2 className="display m-0 text-[36px] font-extrabold leading-none sm:text-[44px]">
              {p.title || "[News title]"}
            </h2>
            {p.body
              .split(/\n+/)
              .map((t) => t.trim())
              .filter(Boolean)
              .map((t, i) => (
                <p key={i} className="m-0 text-[17px] leading-[1.7] text-muted">
                  {t}
                </p>
              ))}
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center self-start text-[15px] font-semibold text-amber hover:text-lemon"
              >
                Open the link →
              </a>
            )}
          </article>
        </li>
      ))}
    </ol>
  );
}
