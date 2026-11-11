"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { TextField, btn } from "@/components/editor/Field";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({ email: z.email("Enter a valid email"), password: z.string().min(6, "At least 6 characters") });

export function LoginForm() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (v) => {
    setErr(null);
    const { error } = await createClient()!.auth.signInWithPassword(v);
    if (error) return setErr(error.message);
    router.replace("/editor/");
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <TextField label="Email" type="email" autoComplete="email" {...register("email")} error={formState.errors.email?.message} />
      <TextField label="Password" type="password" autoComplete="current-password" {...register("password")} error={formState.errors.password?.message} />
      {err && (
        <p role="alert" className="m-0 text-sm text-red-700">
          {err}
        </p>
      )}
      <button type="submit" disabled={formState.isSubmitting} className={btn.primary}>
        {formState.isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
