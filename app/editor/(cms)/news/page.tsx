"use client";

import { useEffect, useState } from "react";
import { Card, PageTitle, TextArea, TextField, btn } from "@/components/editor/Field";
import { useEditor } from "@/components/editor/EditorProvider";
import { ScaledPreview } from "@/components/editor/ScaledPreview";
import { UploadZone } from "@/components/editor/UploadZone";
import { newId, useList } from "@/components/editor/useList";
import { NewsList, newsDate } from "@/components/public/NewsList";
import { createClient } from "@/lib/supabase/client";
import type { NewsPost } from "@/lib/types";

const time = (iso: string) =>
  `${newsDate(iso)}, ${new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

/** Editor › News: posts for the public /news page, and push notifications to subscribers (owner only). */
export default function NewsEditorPage() {
  const { session, dirty, save } = useEditor();
  const news = useList("news");
  const posts = [...news.items].sort((a, b) => b.published_at.localeCompare(a.published_at));
  const [subscribers, setSubscribers] = useState<number | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, string>>({});
  const live = session.mode === "supabase";
  const owner = session.role === "owner";

  useEffect(() => {
    if (!live) return;
    createClient()
      ?.rpc("push_subscriber_count")
      .then(({ data }) => setSubscribers(typeof data === "number" ? data : null));
  }, [live, sending]);

  const add = () => {
    const p: NewsPost = {
      id: newId(),
      title: "",
      body: "",
      photo_path: null,
      url: null,
      published_at: new Date().toISOString(),
      notified_at: null,
      sort: 0,
    };
    news.setItems((xs) => [p, ...xs]);
  };

  const send = async (p: NewsPost) => {
    if (!p.title.trim()) {
      setResult((r) => ({ ...r, [p.id]: "Add a title first." }));
      return;
    }
    if (!window.confirm(`Send "${p.title}" as a notification to every subscribed device?`)) return;
    setSending(p.id);
    setResult((r) => ({ ...r, [p.id]: "" }));
    try {
      if (dirty) await save();
      const res = await createClient()!.functions.invoke("send-news-push", { body: { action: "send", news_id: p.id } });
      const data = res.data as { sent?: number; failed?: number; removed?: number; error?: string } | null;
      let msg: string;
      if (res.error || !data || data.error) {
        let detail = data?.error;
        const ctx = (res.error as { context?: Response } | null)?.context;
        if (!detail && ctx) detail = ((await ctx.json().catch(() => null)) as { error?: string } | null)?.error;
        msg = `Not sent: ${detail ?? "please try again."}`;
      } else {
        msg = `Sent to ${data.sent} device${data.sent === 1 ? "" : "s"}${data.failed ? `, ${data.failed} failed` : ""}${data.removed ? `, ${data.removed} no longer subscribed (removed)` : ""}.`;
        news.patch(p.id, { notified_at: new Date().toISOString() });
      }
      setResult((r) => ({ ...r, [p.id]: msg }));
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="News">
        Posts for the public News page. Visitors who turned on notifications (Settings, the gear at the top of the site)
        get a notification when the owner sends a post.
      </PageTitle>

      <Card title="Notifications" id="notifications">
        <p className="m-0 text-sm text-[#4a4852]">
          {live
            ? subscribers === null
              ? "Counting subscribed devices…"
              : `${subscribers} device${subscribers === 1 ? "" : "s"} subscribed.`
            : "Preview mode: notifications are not sent."}{" "}
          Android phones and computers (Chrome, Edge, Firefox) can subscribe straight from the site; iPhones after
          adding the site to the home screen. Each post is sent only when the owner clicks <b>Send notification</b>.
        </p>
      </Card>

      <Card title="Posts" id="posts">
        <button type="button" className={`${btn.primary} self-start`} onClick={add}>
          + New post
        </button>
        {posts.length === 0 && <p className="m-0 text-sm text-[#55535c]">No posts yet.</p>}
        <ol className="m-0 flex list-none flex-col gap-5 p-0">
          {posts.map((p) => (
            <li key={p.id} className="flex flex-col gap-4 rounded-xl border border-editor-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[#55535c]">
                <span>
                  Posted {time(p.published_at)}
                  {p.notified_at && ` · notification sent ${time(p.notified_at)}`}
                </span>
                <button
                  type="button"
                  className={btn.ghost}
                  aria-label={`Remove the post ${p.title || "without a title"}`}
                  onClick={() => window.confirm("Remove this post from the site?") && news.remove(p.id)}
                >
                  ✕
                </button>
              </div>
              <TextField
                label="Title"
                maxLength={90}
                value={p.title}
                onChange={(e) => news.patch(p.id, { title: e.target.value })}
                hint="Also the notification title."
              />
              <TextArea
                label="Text"
                rows={5}
                maxLength={1500}
                value={p.body}
                onChange={(e) => news.patch(p.id, { body: e.target.value })}
                hint="One paragraph per line. The first 180 characters go into the notification."
              />
              <UploadZone
                label="Photo (optional)"
                kind="photo"
                folder="news"
                value={p.photo_path}
                onChange={(path) => news.patch(p.id, { photo_path: path })}
              />
              <TextField
                label="Link (optional)"
                type="url"
                placeholder="https://"
                value={p.url ?? ""}
                onChange={(e) => news.patch(p.id, { url: e.target.value.trim() || null })}
                hint="For example an Instagram post or a video."
              />
              {owner && live && (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className={btn.secondary}
                    disabled={sending !== null}
                    onClick={() => void send(p)}
                  >
                    {sending === p.id ? "Sending…" : p.notified_at ? "Send notification again" : "Send notification"}
                  </button>
                  {result[p.id] && (
                    <span role="status" className="text-sm">
                      {result[p.id]}
                    </span>
                  )}
                </div>
              )}
            </li>
          ))}
        </ol>
        <ScaledPreview label="Preview of the News page" width={1280}>
          <div className="px-10 py-10">
            <NewsList posts={news.items} />
          </div>
        </ScaledPreview>
      </Card>
    </div>
  );
}
