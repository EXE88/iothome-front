"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import PasswordField from "@/components/ui/PasswordField";
import { ApiError } from "@/lib/auth";
import { API_BASE } from "@/lib/config";
import type { Dictionary, Locale } from "@/lib/i18n";

export default function SignupForm({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const router = useRouter();
  const [values, setValues] = useState({
    full_name: "",
    email: "",
    password: "",
    password_confirm: "",
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: event.target.value }));

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors({});
    setFormError(null);

    // Caught here rather than at the backend: the server would reject it too,
    // but a round trip to be told the two boxes differ is a wasted wait.
    if (values.password !== values.password_confirm) {
      setErrors({ password_confirm: dict.auth.signup.mismatch });
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new ApiError(response.status, data);

      // The account exists but cannot log in until the emailed code is used,
      // so go straight there with the address already filled.
      router.push(`/${locale}/verify?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors({
          full_name: error.field("full_name"),
          email: error.field("email"),
          password: error.field("password"),
          password_confirm: error.field("password_confirm"),
        });
        setFormError(
          error.field("email") || error.field("password") ? null : error.formError,
        );
      } else {
        setFormError(dict.auth.offline);
      }
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <Field
        label={`${dict.auth.fullName} (${dict.auth.optional})`}
        name="full_name"
        autoComplete="name"
        value={values.full_name}
        onChange={set("full_name")}
        error={errors.full_name}
      />

      <Field
        label={dict.auth.email}
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        dir="ltr"
        required
        value={values.email}
        onChange={set("email")}
        error={errors.email}
        hint={dict.auth.emailHint}
      />

      <PasswordField
        label={dict.auth.password}
        name="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={values.password}
        onChange={set("password")}
        error={errors.password}
        hint={dict.auth.passwordHint}
        showLabel={dict.auth.show}
        hideLabel={dict.auth.hide}
      />

      <PasswordField
        label={dict.auth.passwordConfirm}
        name="password_confirm"
        autoComplete="new-password"
        required
        value={values.password_confirm}
        onChange={set("password_confirm")}
        error={errors.password_confirm}
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
        {dict.auth.signup.submit}
      </Button>

      <p className="mt-6 text-center text-[0.92rem] text-ink-soft">
        {dict.auth.signup.haveAccount}{" "}
        <Link href={`/${locale}/login`} className="font-medium text-ink underline underline-offset-2">
          {dict.auth.signup.loginLink}
        </Link>
      </p>
    </form>
  );
}
