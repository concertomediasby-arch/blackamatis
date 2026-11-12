import type { Metadata } from "next";
import { ThemeView } from "@/components/public/views/ThemeView";

export const metadata: Metadata = {
  title: "Theme",
  description: "The two-face concept of Black Amethyst and how it carries through exterior, interior and trunk.",
};

export default function ThemePage() {
  return <ThemeView />;
}
