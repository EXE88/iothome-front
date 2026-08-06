"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  error?: string | null;
  hint?: ReactNode;
  showLabel: string;
  hideLabel: string;
};

/**
 * A password field with a reveal toggle.
 *
 * Worth the extra control: this product only accepts Gmail addresses and
 * eight-character-plus passwords, and a typo in a masked field on a phone
 * keyboard is the most common reason a correct password gets rejected. The
 * toggle is a real button so it is reachable by keyboard, and it announces
 * which state it will move to.
 */
export default function PasswordField({
  label,
  error,
  hint,
  showLabel,
  hideLabel,
  className = "",
  ...props
}: Props) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`mb-5 ${className}`}>
      <label htmlFor={id} className="block text-[0.92rem] font-medium text-ink">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          type={visible ? "text" : "password"}
          {...props}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={`w-full rounded-xl border bg-[color-mix(in_srgb,#ffffff_70%,transparent)] px-4 py-3 pe-12 text-[0.98rem] text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink-faint focus:border-[var(--ink)] focus-visible:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--ink)_12%,transparent)] ${
            error ? "border-[var(--danger)]" : "border-[var(--line-strong)]"
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? hideLabel : showLabel}
          className="absolute inset-y-0 end-0 flex w-12 items-center justify-center rounded-e-xl text-ink-soft transition-colors hover:text-ink"
        >
          <i
            className={`bi ${visible ? "bi-eye-slash" : "bi-eye"} text-[1.05rem]`}
            aria-hidden="true"
          />
        </button>
      </div>
      <div className="min-h-[1.25rem] pt-1.5">
        {error ? (
          <p id={`${id}-error`} className="text-[0.85rem] text-[var(--danger)]">
            {error}
          </p>
        ) : hint ? (
          <p id={`${id}-hint`} className="text-[0.85rem] text-ink-faint">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
