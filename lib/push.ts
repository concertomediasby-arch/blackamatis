"use client";

/**
 * Web push for news about the car: the visitor turns notifications on in the
 * Settings menu; the browser subscribes with the site's VAPID public key and
 * the subscription is stored through the `push_subscribe` database function.
 * The owner sends a news post from the editor (Edge Function send-news-push).
 */
import { createClient } from "@/lib/supabase/client";

export type PushState =
  /** This browser cannot receive web push. */
  | "unsupported"
  /** iPhone / iPad in Safari: only works after "Add to Home Screen". */
  | "ios-install"
  /** The visitor blocked notifications for this site. */
  | "denied"
  | "off"
  | "on";

const SW_URL = "/sw.js";

export const isIos = () =>
  typeof navigator !== "undefined" &&
  (/iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true);

const supported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

async function registration() {
  return (await navigator.serviceWorker.getRegistration("/")) ?? null;
}

/** Where this browser stands (no prompt is shown). */
export async function pushState(): Promise<PushState> {
  if (!supported()) return isIos() && !isStandalone() ? "ios-install" : "unsupported";
  if (Notification.permission === "denied") return "denied";
  const reg = await registration();
  const sub = await reg?.pushManager.getSubscription();
  return sub && Notification.permission === "granted" ? "on" : "off";
}

function keyBytes(base64url: string) {
  const pad = "=".repeat((4 - (base64url.length % 4)) % 4);
  const raw = atob((base64url + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/** The site's VAPID public key (the Edge Function creates the pair on first use). */
async function publicKey(): Promise<string> {
  const db = createClient();
  if (!db) throw new Error("Notifications are not available right now.");
  const { data } = await db.rpc("push_vapid_public");
  if (typeof data === "string" && data) return data;
  const res = await db.functions.invoke("send-news-push", { body: { action: "public-key" } });
  const key = (res.data as { publicKey?: string } | null)?.publicKey;
  if (!key) throw new Error("Notifications are not available right now.");
  return key;
}

/** Ask for permission, subscribe this browser and store the subscription. */
export async function turnOn(): Promise<PushState> {
  if (!supported()) return pushState();
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "denied" : "off";
  const reg = (await registration()) ?? (await navigator.serviceWorker.register(SW_URL, { scope: "/" }));
  await navigator.serviceWorker.ready;
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(await publicKey()) }));
  const json = sub.toJSON();
  const db = createClient();
  const { error } = await db!.rpc("push_subscribe", {
    p_endpoint: json.endpoint,
    p_p256dh: json.keys?.p256dh,
    p_auth: json.keys?.auth,
  });
  if (error) {
    await sub.unsubscribe();
    throw new Error("Could not turn on notifications. Please try again.");
  }
  return "on";
}

/** Unsubscribe this browser and remove its subscription. */
export async function turnOff(): Promise<PushState> {
  const reg = await registration();
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await createClient()?.rpc("push_unsubscribe", { p_endpoint: sub.endpoint });
    await sub.unsubscribe();
  }
  return pushState();
}
