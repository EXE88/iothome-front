"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import PasswordField from "@/components/ui/PasswordField";
import { ApiError, useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import type { Dictionary, Locale } from "@/lib/i18n";

/**
 * The account screen.
 *
 * Two independent forms rather than one: changing a display name and changing
 * a password are different commitments, they hit different endpoints, and a
 * single Save that did both would make a failure in one look like a failure in
 * the whole page.
 *
 * The email is shown but never editable — the backend's UserSerializer marks
 * it read-only, because the address is the account's identity and it is the
 * canonicalised Gmail form, not what was typed.
 */
export default function ProfileView({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const router = useRouter();
  const { status, user, apiFetch, refresh, logout } = useAuth();

  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsSaved, setDetailsSaved] = useState(false);
  const [detailErrors, setDetailErrors] = useState<Record<string, string>>({});

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === "anonymous") {
      router.replace(`/${locale}/login?next=/${locale}/account`);
    }
  }, [status, router, locale]);

  if (status !== "authenticated" || !user) {
    return <p className="text-[0.98rem] text-ink-soft">{dict.panel.loading}</p>;
  }

  async function saveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingDetails(true);
    setDetailsSaved(false);
    setDetailErrors({});

    const form = new FormData(event.currentTarget);
    try {
      const response = await apiFetch("/api/auth/me/", {
        method: "PATCH",
        body: JSON.stringify({
          full_name: String(form.get("full_name") ?? ""),
          phone: String(form.get("phone") ?? ""),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new ApiError(response.status, data);

      // The session carries the profile, so it has to be re-read or the
      // header would keep showing the old name until a reload.
      await refresh();
      setDetailsSaved(true);
    } catch (error) {
      if (error instanceof ApiError) {
        setDetailErrors({
          full_name: error.field("full_name") ?? "",
          phone: error.field("phone") ?? "",
          form: error.formError ?? "",
        });
      } else {
        setDetailErrors({ form: dict.auth.offline });
      }
    } finally {
      setSavingDetails(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setChangingPassword(true);
    setPasswordChanged(false);
    setPasswordErrors({});

    const data = new FormData(form);
    try {
      const response = await apiFetch("/api/auth/change-password/", {
        method: "POST",
        body: JSON.stringify({
          current_password: String(data.get("current_password") ?? ""),
          new_password: String(data.get("new_password") ?? ""),
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new ApiError(response.status, body);
      setPasswordChanged(true);
      form.reset();
    } catch (error) {
      if (error instanceof ApiError) {
        setPasswordErrors({
          current_password: error.field("current_password") ?? "",
          new_password: error.field("new_password") ?? "",
          form: error.formError ?? "",
        });
      } else {
        setPasswordErrors({ form: dict.auth.offline });
      }
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="max-w-xl">
      <section>
        <h2 className="text-[1.25rem] font-semibold tracking-[-0.02em]">
          {dict.profile.details}
        </h2>

        {/* Facts about the account, not fields: shown as a ruled list so they
            do not read as things waiting to be filled in. */}
        <dl className="mt-5 border-t border-[var(--line)]">
          <div className="flex items-baseline justify-between gap-6 border-b border-[var(--line)] py-3">
            <dt className="text-[0.85rem] text-ink-faint">{dict.profile.email}</dt>
            <dd className="text-[0.95rem] text-ink" dir="ltr">
              {user.email}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-6 border-b border-[var(--line)] py-3">
            <dt className="text-[0.85rem] text-ink-faint">{dict.profile.joined}</dt>
            <dd className="text-[0.95rem] text-ink">
              {formatDate(user.date_joined, locale)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-6 border-b border-[var(--line)] py-3">
            <dt className="text-[0.85rem] text-ink-faint">
              {dict.panel.account.verified}
            </dt>
            <dd className="flex items-center gap-2 text-[0.95rem] text-ink">
              <i
                className={`bi ${
                  user.is_email_verified ? "bi-check2" : "bi-exclamation-circle"
                }`}
                aria-hidden="true"
              />
              {user.is_email_verified
                ? dict.profile.verified
                : dict.profile.unverified}
            </dd>
          </div>
        </dl>
        <p className="mt-2.5 text-[0.82rem] text-ink-faint">
          {dict.profile.emailNote}
        </p>

        <form onSubmit={saveDetails} className="mt-8">
          <Field
            name="full_name"
            label={dict.profile.fullName}
            defaultValue={user.full_name}
            maxLength={150}
            autoComplete="name"
            error={detailErrors.full_name || undefined}
          />
          <Field
            name="phone"
            label={dict.profile.phone}
            defaultValue={user.phone}
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            maxLength={20}
            error={detailErrors.phone || undefined}
          />

          {detailErrors.form && (
            <p role="alert" className="mb-4 text-[0.88rem] text-[var(--danger)]">
              {detailErrors.form}
            </p>
          )}

          <div className="flex items-center gap-4">
            <Button type="submit" loading={savingDetails}>
              {dict.profile.save}
            </Button>
            {detailsSaved && (
              <p role="status" className="text-[0.9rem] text-ink-soft">
                {dict.profile.saved}
              </p>
            )}
          </div>
        </form>
      </section>

      <section className="mt-14 border-t border-[var(--line)] pt-10">
        <h2 className="text-[1.25rem] font-semibold tracking-[-0.02em]">
          {dict.profile.password.title}
        </h2>

        <form onSubmit={changePassword} className="mt-6">
          <PasswordField
            name="current_password"
            label={dict.profile.password.current}
            required
            autoComplete="current-password"
            showLabel={dict.auth.show}
            hideLabel={dict.auth.hide}
            error={passwordErrors.current_password || undefined}
          />
          <PasswordField
            name="new_password"
            label={dict.profile.password.next}
            required
            minLength={8}
            autoComplete="new-password"
            showLabel={dict.auth.show}
            hideLabel={dict.auth.hide}
            hint={dict.auth.passwordHint}
            error={passwordErrors.new_password || undefined}
          />

          {passwordErrors.form && (
            <p role="alert" className="mb-4 text-[0.88rem] text-[var(--danger)]">
              {passwordErrors.form}
            </p>
          )}

          <div className="flex items-center gap-4">
            <Button type="submit" variant="secondary" loading={changingPassword}>
              {dict.profile.password.submit}
            </Button>
            {passwordChanged && (
              <p role="status" className="text-[0.9rem] text-ink-soft">
                {dict.profile.password.changed}
              </p>
            )}
          </div>
        </form>
      </section>

      <section className="mt-14 border-t border-[var(--line)] pt-10">
        <h2 className="text-[1.25rem] font-semibold tracking-[-0.02em]">
          {dict.profile.danger.title}
        </h2>
        <p className="mt-2 max-w-[46ch] text-[0.92rem] leading-relaxed text-ink-soft">
          {dict.profile.danger.body}
        </p>
        <Button
          variant="secondary"
          className="mt-5"
          onClick={async () => {
            await logout();
            router.replace(`/${locale}`);
          }}
        >
          <i className="bi bi-box-arrow-right rtl:rotate-180" aria-hidden="true" />
          {dict.profile.danger.logout}
        </Button>
      </section>
    </div>
  );
}
