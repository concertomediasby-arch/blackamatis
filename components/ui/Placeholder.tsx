import Image from "next/image";
import { storageUrl } from "@/lib/supabase/env";

type Props = {
  path?: string | null;
  label: string;
  alt?: string;
  className?: string;
  tone?: "dark" | "light";
  sizes?: string;
  fit?: "cover" | "contain";
};

/** Shows the uploaded photo, or a dashed placeholder with its label until one is uploaded. */
export function Placeholder({ path, label, alt, className = "", tone = "dark", sizes = "(max-width: 768px) 100vw, 50vw", fit = "cover" }: Props) {
  const url = storageUrl(path);
  if (url) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={url} alt={alt ?? label} fill sizes={sizes} unoptimized={/^(blob:|data:)/.test(url)} className={fit === "cover" ? "object-cover" : "object-contain"} />
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={`${alt ?? label} (photo not uploaded yet)`}
      className={`placeholder-box ${tone === "dark" ? "text-muted-2 border-white/30" : "text-dark-muted border-[#6B6400]"} ${className}`}
      style={{ borderColor: tone === "dark" ? "rgba(255,255,255,0.3)" : "#6B6400" }}
    >
      [{label}]
    </div>
  );
}
