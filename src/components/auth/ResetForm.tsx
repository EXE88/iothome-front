"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import PasswordField from "@/components/ui/PasswordField";
import { ApiError } from "@/lib/auth";
import { API_BASE } from "@/lib/config";
import type { Dictionary, Locale } from "@/lib/i18n";

export default function ResetForm({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = useState(params.get("email") ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    setFormError(null);

    try {
      const response = await fetch(`${API_BASE}/api/auth/password-reset/confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, new_password: password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new ApiError(response.status, data);

      router.push(`/${locale}/login?reset=1`);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors({
          email: error.field("email"),
          code: error.field("code"),
          new_password: error.field("new_password"),
        });
        setFormError(
          error.field("code") || error.field("new_password") ? null : error.formError,
        );
      } else {
        setFormError(dict.auth.offline);
      }
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {params.get("sent") === "1" && (
        <p className="mb-5 rounded-xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--live)_8%,transparent)] px-4 py-3 text-[0.9rem] text-ink">
          {dict.auth.forgot.sent}
        </p>
      )}

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

      <Field
        label={dict.auth.code}
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        dir="ltr"
        required
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        error={errors.code}
        className="[&_input]:text-center [&_input]:text-[1.4rem] [&_input]:tracking-[0.4em]"
      />

      <PasswordField
        label={dict.auth.newPassword}
        name="new_password"
        autoComplete="new-password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.new_password}
        hint={dict.auth.passwordHint}
        showLabel={dict.auth.show}
        hideLabel={dict.auth.hide}
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
        {dict.auth.reset.submit}
      </Button>
    </form>
  );
}
