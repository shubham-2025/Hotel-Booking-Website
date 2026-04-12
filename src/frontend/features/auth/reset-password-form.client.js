"use client";

import { PasswordField } from "./password-field.client";

export function ResetPasswordForm({ action }) {
  return (
    <form action={action} className="space-y-4">
      <PasswordField
        label="New password"
        name="password"
        autoComplete="new-password"
        placeholder="Create your new password"
        helperText="Use at least 6 characters to finish the reset flow."
      />

      <PasswordField
        label="Confirm new password"
        name="confirmPassword"
        autoComplete="new-password"
        placeholder="Re-enter your new password"
      />

      <button type="submit" className="button-primary w-full">
        Update password
      </button>
    </form>
  );
}
