import type { Metadata } from "next";
import { JudgeView } from "@/components/public/views/JudgeView";

export const metadata: Metadata = {
  title: "Judge Mode",
  description: "Every EMMA 2026 install criterion linked to the evidence for Black Amethyst.",
};

export default function JudgePage() {
  return <JudgeView />;
}
