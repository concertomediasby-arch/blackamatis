import type { Metadata } from "next";
import { HistoryView } from "@/components/public/views/HistoryView";

export const metadata: Metadata = {
  title: "History",
  description: "From stock Honda Odyssey to EMMA 2026: before/after, build timeline and competition history.",
};

export default function HistoryPage() {
  return <HistoryView />;
}
