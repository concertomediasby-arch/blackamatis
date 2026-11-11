export function Eyebrow({ children, tone = "dark", className = "" }: { children: React.ReactNode; tone?: "dark" | "light"; className?: string }) {
  return <span className={`eyebrow ${tone === "dark" ? "text-amber" : "text-navy"} ${className}`}>{children}</span>;
}
