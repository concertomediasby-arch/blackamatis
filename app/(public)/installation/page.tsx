import type { Metadata } from "next";
import { InstallationView } from "@/components/public/views/InstallationView";

export const metadata: Metadata = {
  title: "Installation",
  description: "Signal flow, power & fuses, tuning notes, photo log and craftsmanship close-ups for Black Amethyst.",
};

export default function InstallationPage() {
  return <InstallationView />;
}
