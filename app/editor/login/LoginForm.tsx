"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { TextField, btn } from "@/components/editor/Field";
import { createClient } from "@/lib/supabase/client";
import { SITE_URL } from "@/lib/supabase/env";

const emailSchema = z.object({ email: z.email("Enter a valid email") });
const codeSchema = z.object({ code: z.string().trim().regex(/^\d{6,10}$/, "Enter the code from the email (numbers only)") });

const RESEND_SECONDS = 60;

/** Friendlier messages for the common Supabase auth errors. */
function explain(message: string) {
  const m = message.toLowerCase();
  if (m.includes("signups not allowed") || m.includes("user not found")) return "This email is not registered as an editor.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many emails sent. Wait a few minutes, then try again.";
  if (m.includes("expired") || m.includes("invalid")) return "The code is wrong or has expired. Request a new code.";
  return message;
}

/**
 * Passwordless login: Supabase emails a one-time code (and a sign-in link).
 * Existing accounts only; access to the editor still requires an `editors` row.
 */
export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const emailForm = useForm({ resolver: zodResolver(emailSchema) });
  const codeForm = useForm({ resolver: zodResolver(codeSchema) });

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendCode = async (address: string) => {
    setErr(null);
    const { error } = await createClient()!.auth.signInWithOtp({
      email: address,
      options: { shouldCreateUser: false, emailRedirectTo: `${SITE_URL.replace(/\/$/, "")}/editor/` },
    });
    if (error) {
      setErr(explain(error.message));
      return false;
    }
    setEmail(address);
    setStep("code");
    setCooldown(RESEND_SECONDS);
    return true;
  };

  const onEmail = emailForm.handleSubmit(async (v) => {
    await sendCode(v.email.trim().toLowerCase());
  });

  const onCode = codeForm.handleSubmit(async (v) => {
    setErr(null);
    const { error } = await createClient()!.auth.verifyOtp({ email, token: v.code.trim(), type: "email" });
    if (error) return setErr(explain(error.message));
    router.replace("/editor/");
  });

  if (step === "email") {
    return (
      <form onSubmit={onEmail} className="flex flex-col gap-4" noValidate>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          {...emailForm.register("email")}
          error={emailForm.formState.errors.email?.message}
          hint="We'll email you a one-time login code."
        />
        {err && (
          <p role="alert" className="m-0 text-sm text-red-700">
            {err}
          </p>
        )}
        <button type="submit" disabled={emailForm.formState.isSubmitting} className={btn.primary}>
          {emailForm.formState.isSubmitting ? "Sending…" : "Send login code"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onCode} className="flex flex-col gap-4" noValidate>
      <p className="m-0 text-[15px]" aria-live="polite">
        We sent a login code to <strong>{email}</strong>. Enter it below, or click the link in the email.
      </p>
      <TextField
        label="Login code"
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus
        maxLength={10}
        className="[&_input]:font-mono [&_input]:text-xl [&_input]:tracking-[0.3em]"
        {...codeForm.register("code")}
        error={codeForm.formState.errors.code?.message}
        hint="Check your spam folder if it doesn't arrive within a minute."
      />
      {err && (
        <p role="alert" className="m-0 text-sm text-red-700">
          {err}
        </p>
      )}
      <button type="submit" disabled={codeForm.formState.isSubmitting} className={btn.primary}>
        {codeForm.formState.isSubmitting ? "Checking…" : "Sign in"}
      </button>
      <div className="flex flex-wrap justify-between gap-2 text-sm">
        <button
          type="button"
          className="min-h-11 cursor-pointer underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60"
          disabled={cooldown > 0}
          onClick={() => void sendCode(email)}
        >
          {cooldown > 0 ? `Send a new code in ${cooldown}s` : "Send a new code"}
        </button>
        <button
          type="button"
          className="min-h-11 cursor-pointer underline"
          onClick={() => {
            setStep("email");
            setErr(null);
            codeForm.reset();
          }}
        >
          Use another email
        </button>
      </div>
    </form>
  );
}
