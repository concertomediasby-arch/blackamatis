import type { ComponentPropsWithoutRef, ElementType } from "react";

type Props<T extends ElementType> = {
  as?: T;
  tone?: "dark" | "light" | "inset";
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

/** Glass surface: dark glass, lemon glass, or a flatter inset panel. */
export function GlassPanel<T extends ElementType = "div">({ as, tone = "dark", className = "", ...rest }: Props<T>) {
  const Tag = (as ?? "div") as ElementType;
  const cls = tone === "light" ? "glass-light on-light" : tone === "inset" ? "glass-inset" : "glass-dark";
  return <Tag className={`${cls} ${className}`} {...rest} />;
}
