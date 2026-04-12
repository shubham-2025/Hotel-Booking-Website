"use client";

import Link from "next/link";
import { useState } from "react";
import { PasswordField } from "./password-field.client";

const REMEMBERED_EMAIL_KEY = "quickstay.remembered-email";

export function SignInForm({ action, next = "/" }) {
  const rememberedEmail =
    typeof window === "undefined"
      ? ""
      : window.localStorage.getItem(REMEMBERED_EMAIL_KEY) || "";
  const [email, setEmail] = useState(rememberedEmail);
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedEmail));

  function handleSubmit() {
    const trimmedEmail = email.trim();

    if (rememberMe && trimmedEmail) {
      window.localStorage.setItem(REMEMBERED_EMAIL_KEY, trimmedEmail);
      return;
    }

    window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
  }

  return (
    <form action={action} className="space-y-4" onSubmit={handleSubmit}>
      <input type="hidden" name="next" value={next} />

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--color-ink)]">Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="field-input"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <PasswordField
        label="Password"
        name="password"
        autoComplete="current-password"
        placeholder="Enter your password"
      />

      <div className="flex flex-col gap-3 rounded-[24px] border border-[var(--color-line)] bg-white/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-3 text-sm font-medium text-[var(--color-ink)]">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="h-4 w-4 rounded border-[var(--color-line)] text-[var(--color-highlight)] focus:ring-[var(--color-highlight)]"
          />
          Remember me on this device
        </label>

        <Link
          href="/forgot-password"
          className="text-sm font-semibold text-[var(--color-highlight)] transition hover:text-[var(--color-ink)]"
        >
          Forgot password?
        </Link>
      </div>

      <button type="submit" className="button-primary w-full">
        Login
      </button>
    </form>
  );
}
