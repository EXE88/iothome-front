"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { ApiError } from "@/lib/auth";
import { API_BASE } from "@/lib/config";
import type { Dictionary, Locale } from "@/lib/i18n";

const RESEND_COOLDOWN = 60;

export default function VerifyForm({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const prefilled = params.get("email") ?? "";

  const [email, setEmail] = useState(prefilled);
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // The backend throttles resends; mirroring that here stops the user from
  // pressing it repeatedly and collecting 429s instead of an email.
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    setFormError(null);

    try {
      const response = await fetch(`${API_BASE}/api/auth/verify-email/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new ApiError(response.status, data);

      router.push(`/${locale}/login?verified=1`);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors({ email: error.field("email"), code: error.field("code") });
        setFormError(error.field("code") ? null : error.formError);
      } else {
        setFormError(dict.auth.offline);
      }
      setBusy(false);
    }
  }

  async function resend() {
    setCooldown(RESEND_COOLDOWN);
    setFormError(null);
    try {
      await fetch(`${API_BASE}/api/auth/resend-verification/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Deliberately the same message whatever happened: the endpoint does not
      // reveal whether the address has an account, and neither should this.
      setNotice(dict.auth.verify.resent);
    } catch {
      setFormError(dict.auth.offline);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {prefilled && (
        <p className="mb-5 text-[0.92rem] leading-relaxed text-ink-soft">
          {dict.auth.verify.sentTo.replace("{email}", prefilled)}
        </p>
      )}

      {!prefilled && (
        <Field
          label={dict.auth.email}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          dir="ltr"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
      )}

      <Field
        label={dict.auth.code}
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={6}
        dir="ltr"
        required
        autoFocus
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        error={errors.code}
        className="[&_input]:text-center [&_input]:text-[1.4rem] [&_input]:tracking-[0.4em]"
      />

      {notice && (
        <p className="mb-4 rounded-xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--live)_8%,transparent)] px-4 py-3 text-[0.9rem] text-ink">
          {notice}
        </p>
      )}

      {formError && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_7%,transparent)] px-4 py-3 text-[0.9rem] text-[var(--danger)]"
        >
          {formError}
        </p>
      )}

      <Button type="submit" loading={busy} className="w-full">
        {dict.auth.verify.submit}
      </Button>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0 || !email}
          className="text-[0.92rem] text-ink-soft underline underline-offset-2 transition-colors hover:text-ink disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60"
        >
          {cooldown > 0
            ? dict.auth.verify.wait.replace("{seconds}", String(cooldown))
            : dict.auth.verify.resend}
        </button>
      </div>
    </form>
  );
}
