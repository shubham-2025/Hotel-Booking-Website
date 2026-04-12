"use client";

import { PasswordField } from "./password-field.client";

export function SignUpForm({ action, next = "/" }) {
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2 sm:col-span-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">Full name</span>
          <input
            type="text"
            name="fullName"
            required
            autoComplete="name"
            className="field-input"
            placeholder="Your name"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="field-input"
            placeholder="you@example.com"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">Phone number</span>
          <input
            type="tel"
            name="phone"
            required
            autoComplete="tel"
            className="field-input"
            placeholder="+91 98765 43210"
          />
        </label>

        <label className="block space-y-2 sm:col-span-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">Address</span>
          <textarea
            name="address"
            required
            autoComplete="street-address"
            className="field-textarea"
            placeholder="Enter your full address"
          />
        </label>

        <PasswordField
          label="Password"
          name="password"
          autoComplete="new-password"
          placeholder="Create a password"
          helperText="Use at least 6 characters. We never send passwords by email."
        />

        <PasswordField
          label="Confirm password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Re-enter your password"
        />
      </div>

      <div className="rounded-[24px] border border-[var(--color-line)] bg-white/80 px-4 py-4 text-sm leading-7 text-[var(--color-muted)]">
        After account creation, we will guide the user to the login flow. If email confirmation is enabled in Supabase, they will receive a secure verification email that returns them to QuickStay.
      </div>

      <button type="submit" className="button-primary w-full">
        Create account
      </button>
    </form>
  );
}
