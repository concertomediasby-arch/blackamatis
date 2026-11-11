import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EditorProvider } from "@/components/editor/EditorProvider";
import { EditorShell } from "@/components/editor/EditorShell";
import { getEditorContent, getEditorSession } from "@/lib/editor/actions";

export const metadata: Metadata = { title: "Editor", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function EditorLayout({ children }: { children: React.ReactNode }) {
  const session = await getEditorSession();
  if (!session) redirect("/editor/login");
  const content = await getEditorContent();
  return (
    <EditorProvider session={session} initial={content}>
      <EditorShell>{children}</EditorShell>
    </EditorProvider>
  );
}
