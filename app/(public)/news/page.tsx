import type { Metadata } from "next";
import { NewsView } from "@/components/public/views/NewsView";

export const metadata: Metadata = {
  title: "News",
  description: "The latest news about Black Amethyst, the two-face Honda Odyssey built for EMMA 2026.",
};

export default function NewsPage() {
  return <NewsView />;
}
