"use client";

import { createClient } from "../supabase/client";
import { isSupabaseConfigured, STORAGE_BUCKETS } from "../supabase/env";

const MAX_PX = 2400;
const PREVIEW_MAX_PX = 1200;

/** Resize an image to fit within `max` px and encode as WebP (keeps transparency). */
export async function toWebp(file: File, max: number): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("Could not encode image"))), "image/webp", 0.86));
}

const blobToDataUrl = (b: Blob) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(r.error);
    r.readAsDataURL(b);
  });

/** Supabase's per-file upload limit on the current plan. Longer videos: use a YouTube link. */
export const MAX_VIDEO_MB = 50;

/**
 * Upload a photo (resized to WebP), a PDF or a video (as is). Returns the storage path.
 * In preview mode (no Supabase) images become data URLs kept in this browser.
 */
export async function uploadFile(file: File, kind: "photo" | "pdf" | "video", folder: string): Promise<string> {
  if (kind === "photo" && !file.type.startsWith("image/")) throw new Error("Choose an image file");
  if (kind === "pdf" && file.type !== "application/pdf") throw new Error("Choose a PDF file");
  if (kind === "video") {
    if (!file.type.startsWith("video/")) throw new Error("Choose a video file (MP4, MOV or WebM)");
    if (file.size > MAX_VIDEO_MB * 1024 * 1024)
      throw new Error(`This video is ${Math.round(file.size / 1024 / 1024)} MB; the limit is ${MAX_VIDEO_MB} MB. Shorten it, or upload it to YouTube and paste the link.`);
  }

  if (!isSupabaseConfigured) {
    if (kind !== "photo") return URL.createObjectURL(file);
    return blobToDataUrl(await toWebp(file, PREVIEW_MAX_PX));
  }

  const db = createClient()!;
  const body = kind === "photo" ? await toWebp(file, MAX_PX) : file;
  const videoExt = (file.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "") || "mp4";
  const ext = kind === "photo" ? "webp" : kind === "pdf" ? "pdf" : videoExt;
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  // Videos sit with the photos (public read).
  const bucket = kind === "pdf" ? STORAGE_BUCKETS.pdfs : STORAGE_BUCKETS.photos;
  const contentType = kind === "photo" ? "image/webp" : kind === "pdf" ? "application/pdf" : file.type;
  const { error } = await db.storage.from(bucket).upload(path, body, { contentType });
  if (error) throw new Error(error.message);
  return path;
}
