"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import PasswordField from "@/components/ui/PasswordField";
import { ApiError, useAuth } from "@/lib/auth";
import type { Dictionary, Locale } from "@/lib/i18n";

export default function LoginForm({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const { login, status } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [busy, setBusy] = useState(false);

  // Arriving here straight after verifying or resetting: say so, rather than
  // dropping the user on an unexplained empty form.
  const notice = params.get("verified")
    ? dict.auth.verify.success
    : params.get("reset")
      ? dict.auth.reset.success
      : null;

  const next = params.get("next") || `/${locale}/panel`;

  useEffect(() => {
    if (status === "authenticated") router.replace(next);
  }, [status, router, next]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    setFormError(null);
    setUnverified(false);

    try {
      await login(email, password);
      router.replace(next);
    } catch (error) {
      if (error instanceof ApiError) {
        // The backend refuses an unverified account with a `code` marker; that
        // is a different problem from a wrong password and needs a way out,
        // not just a red line.
        if (error.data.code === "email_not_verified") {
          setUnverified(true);
          setFormError(dict.auth.login.unverified);
        } else {
          setErrors({
            email: error.field("email"),
            password: error.field("password"),
          });
          setFormError(error.formError);
        }
      } else {
        setFormError(dict.auth.offline);
      }
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {notice && (
        <p className="mb-5 rounded-xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--live)_8%,transparent)] px-4 py-3 text-[0.9rem] text-ink">
          {notice}
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

      <PasswordField
        label={dict.auth.password}
        name="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        showLabel={dict.auth.show}
        hideLabel={dict.auth.hide}
      />

      {formError && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_7%,transparent)] px-4 py-3 text-[0.9rem] text-[var(--danger)]"
        >
          {formError}
          {unverified && (
            <>
              {" "}
              <Link
                href={`/${locale}/verify?email=${encodeURIComponent(email)}`}
                className="font-medium underline underline-offset-2"
              >
                {dict.auth.login.goVerify}
              </Link>
            </>
          )}
        </p>
      )}

      <Button type="submit" loading={busy} className="w-full">
        {dict.auth.login.submit}
      </Button>

      <div className="mt-6 flex flex-col gap-2 text-center text-[0.92rem]">
        <Link
          href={`/${locale}/forgot`}
          className="text-ink-soft underline underline-offset-2 transition-colors hover:text-ink"
        >
          {dict.auth.login.forgot}
        </Link>
        <p className="text-ink-soft">
          {dict.auth.login.noAccount}{" "}
          <Link href={`/${locale}/signup`} className="font-medium text-ink underline underline-offset-2">
            {dict.auth.login.signupLink}
          </Link>
        </p>
      </div>
    </form>
  );
}
