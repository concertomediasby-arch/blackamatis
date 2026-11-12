import type { Metadata } from "next";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Editor login", robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="editor flex min-h-screen items-center justify-center bg-prussian p-4">
      <div className="flex w-full max-w-[420px] flex-col gap-6 rounded-3xl bg-editor p-8 text-[#14141a]">
        <div className="flex flex-col gap-1">
          <span className="font-display text-3xl font-extrabold tracking-[0.08em] text-prussian">BLACK AMETHYST</span>
          <span className="font-mono text-xs tracking-[0.14em] text-[#55535c]">EDITOR LOGIN</span>
        </div>
        {isSupabaseConfigured ? (
          <LoginForm />
        ) : (
          <div className="flex flex-col gap-4 text-[15px]">
            <p className="m-0">Supabase is not connected yet, so login is off. You can try the editor in preview mode; drafts stay in this browser.</p>
            <Link href="/editor" className="pill bg-prussian text-lemon">
              Open editor (preview mode)
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
