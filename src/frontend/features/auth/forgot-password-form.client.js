"use client";

import { PendingSubmitButton } from "@/src/frontend/components/shared/pending-submit-button.client";

export function ForgotPasswordForm({ action }) {
  return (
    <form action={action} className="space-y-4">
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

      <PendingSubmitButton
        idleLabel="Send reset link"
        pendingLabel="Sending reset link..."
        className="button-primary w-full"
      />
    </form>
  );
}
