"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  children: ReactNode;
};

const VARIANTS = {
  primary:
    "bg-ink text-paper hover:-translate-y-0.5 disabled:hover:translate-y-0",
  secondary:
    "border border-[var(--line-strong)] text-ink hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]",
  ghost: "text-ink-soft hover:text-ink",
};

/**
 * The loading state keeps the label in place and only swaps the affordance, so
 * the button does not resize mid-submit and the user can still read what they
 * pressed.
 */
export default function Button({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: Props) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[0.95rem] font-medium transition-[transform,background-color,color,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:cursor-not-allowed disabled:opacity-55 ${VARIANTS[variant]} ${className}`}
    >
      {loading && (
        <i
          className="bi bi-arrow-repeat animate-spin text-[1em]"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
