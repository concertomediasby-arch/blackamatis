import type { Metadata } from "next";
import { EditorGate } from "@/components/editor/EditorGate";

export const metadata: Metadata = { title: "Editor", robots: { index: false, follow: false } };

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return <EditorGate>{children}</EditorGate>;
}
