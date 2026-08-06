"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { API_BASE } from "@/lib/config";
import type { Dictionary, Locale } from "@/lib/i18n";

export default function ForgotForm({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setFormError(null);

    try {
      await fetch(`${API_BASE}/api/auth/password-reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // The backend answers identically for known and unknown addresses so it
      // cannot be used to discover who has an account. Moving straight to the
      // code screen keeps that true in the interface too.
      router.push(`/${locale}/reset?email=${encodeURIComponent(email)}&sent=1`);
    } catch {
      setFormError(dict.auth.offline);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <Field
        label={dict.auth.email}
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        dir="ltr"
        required
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {formError && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_7%,transparent)] px-4 py-3 text-[0.9rem] text-[var(--danger)]"
        >
          {formError}
        </p>
      )}

      <Button type="submit" loading={busy} className="w-full">
        {dict.auth.forgot.submit}
      </Button>

      <p className="mt-6 text-center text-[0.92rem]">
        <Link
          href={`/${locale}/login`}
          className="text-ink-soft underline underline-offset-2 transition-colors hover:text-ink"
        >
          {dict.auth.forgot.backToLogin}
        </Link>
      </p>
    </form>
  );
}
