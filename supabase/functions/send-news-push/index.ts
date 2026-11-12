// Web push for news about the car.
//   { action: "public-key" }       → { publicKey }  (anyone; generates the VAPID pair on first use)
//   { action: "send", news_id }     → { sent, failed, removed }  (signed-in owner only)
// The VAPID private key is generated here and kept in private.push_config; it never
// leaves the database / this function. Deployed with verify_jwt off: the site uses a
// publishable (non-JWT) key, and "send" checks the user's own access token below.
import { createClient } from "npm:@supabase/supabase-js@2";
import * as webpush from "jsr:@negrel/webpush@0.5.0";

const SITE = "https://blackamethyst.concerto.id";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

type Keys = { vapid_public: string; vapid_private_jwk: webpush.ExportedVapidKeys };

/** The stored VAPID pair, generated and stored on first use. */
async function vapidKeys(): Promise<Keys> {
  const got = await admin.rpc("push_vapid_keys");
  if (got.error) throw got.error;
  if (got.data?.[0]) return got.data[0] as Keys;
  const pair = await webpush.generateVapidKeys({ extractable: true });
  const made = await admin.rpc("push_vapid_init", {
    p_public: await webpush.exportApplicationServerKey(pair),
    p_private_jwk: await webpush.exportVapidKeys(pair),
  });
  if (made.error) throw made.error;
  return made.data[0] as Keys;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { action, news_id } = await req.json().catch(() => ({}));

    if (action === "public-key") return json({ publicKey: (await vapidKeys()).vapid_public });
    if (action !== "send") return json({ error: "Unknown action." }, 400);

    // Only a signed-in owner may notify every subscriber.
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: who } = await admin.auth.getUser(token);
    if (!who?.user) return json({ error: "Sign in to the editor first." }, 401);
    const { data: editor } = await admin.from("editors").select("role").eq("user_id", who.user.id).maybeSingle();
    if (editor?.role !== "owner") return json({ error: "Only the owner can send notifications." }, 403);

    const { data: post } = await admin.from("news").select("id, title, body, status").eq("id", news_id).maybeSingle();
    if (!post || post.status !== "published") {
      return json({ error: "Save the news post first, so it is live on the site." }, 400);
    }

    const keys = await vapidKeys();
    const server = await webpush.ApplicationServer.new({
      contactInformation: SITE,
      vapidKeys: await webpush.importVapidKeys(keys.vapid_private_jwk),
    });
    const { data: subs, error } = await admin.from("push_subscriptions").select("endpoint, p256dh, auth");
    if (error) throw error;

    const payload = JSON.stringify({
      title: post.title || "Black Amethyst",
      body: (post.body ?? "").replace(/\s+/g, " ").trim().slice(0, 180),
      url: `${SITE}/news/#news-${post.id}`,
    });
    let sent = 0;
    let failed = 0;
    const gone: string[] = [];
    await Promise.all(
      (subs ?? []).map(async (s) => {
        try {
          await server
            .subscribe({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } })
            .pushTextMessage(payload, { ttl: 86400 });
          sent++;
        } catch (e) {
          const status = (e as { response?: Response }).response?.status;
          if (status === 404 || status === 410) gone.push(s.endpoint);
          else failed++;
        }
      }),
    );
    if (gone.length) await admin.from("push_subscriptions").delete().in("endpoint", gone);
    await admin.from("news").update({ notified_at: new Date().toISOString() }).eq("id", post.id);

    return json({ sent, failed, removed: gone.length });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
