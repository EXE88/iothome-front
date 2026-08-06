"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | null;
  hint?: ReactNode;
};

/**
 * One text input, its label, and the place its error appears.
 *
 * The error sits under the field and is wired with `aria-describedby`, so a
 * screen reader reads the problem with the field rather than as loose text
 * somewhere on the page. The field keeps its own height when there is no
 * error, so a failed submit does not shift the form under the cursor.
 */
export default function Field({ label, error, hint, className = "", ...props }: Props) {
  const id = useId();
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(" ");

  return (
    // The hint slot alone is not separation: with it, a field carrying a hint
    // ran straight into the next label and the hint read as that label's
    // caption. Fields own their bottom margin; the slot only reserves height.
    <div className={`mb-5 ${className}`}>
      <label htmlFor={id} className="block text-[0.92rem] font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        {...props}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={`mt-2 w-full rounded-xl border bg-[color-mix(in_srgb,#ffffff_70%,transparent)] px-4 py-3 text-[0.98rem] text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink-faint focus:border-[var(--ink)] focus-visible:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--ink)_12%,transparent)] ${
          error ? "border-[var(--danger)]" : "border-[var(--line-strong)]"
        }`}
      />
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
