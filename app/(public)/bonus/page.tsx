import type { Metadata } from "next";
import { BonusView } from "@/components/public/views/BonusView";

export const metadata: Metadata = {
  title: "Bonus Point",
  description: "Black Amethyst bonus point requests and a personal estimate of the EMMA 2026 bonus score.",
};

export default function BonusPage() {
  return <BonusView />;
}
