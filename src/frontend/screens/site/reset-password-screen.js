import Link from "next/link";
import { resetPasswordAction } from "@/src/backend/auth/auth-actions";
import { AuthPanel } from "@/src/frontend/features/auth/auth-panel";
import { ResetPasswordForm } from "@/src/frontend/features/auth/reset-password-form.client";

const errorMessages = {
  auth_unavailable: "Password reset is temporarily unavailable. Please try again shortly.",
  missing_fields: "Please enter and confirm your new password.",
  password_mismatch: "New password and confirm password must match.",
  password_too_short: "New password must be at least 6 characters long.",
  reset_failed:
    "We could not update your password. Try the reset link again or request a new email.",
};

function getStatus(errorCode) {
  if (errorCode && errorMessages[errorCode]) {
    return {
      tone: "error",
      message: errorMessages[errorCode],
    };
  }

  return null;
}

export function ResetPasswordScreen({ errorCode = "" }) {
  const status = getStatus(errorCode);

  return (
    <AuthPanel
      eyebrow="Choose a new password"
      title="Finish resetting your password"
      description="Create a new password for your QuickStay account and then head back to login."
      status={status}
      footerPrompt="Need a fresh recovery email?"
      footerLinkLabel="Request another one"
      footerLinkHref="/forgot-password"
    >
      <ResetPasswordForm action={resetPasswordAction} />

      <div className="mt-5 rounded-[24px] border border-[var(--color-line)] bg-white/80 px-4 py-4 text-sm leading-7 text-[var(--color-muted)]">
        This page works after a valid recovery link signs you into a temporary secure session.
      </div>

      <div className="mt-4 text-sm text-[var(--color-muted)]">
        Want to go back instead?{" "}
        <Link
          href="/login"
          className="font-semibold text-[var(--color-highlight)] transition hover:text-[var(--color-ink)]"
        >
          Return to login
        </Link>
      </div>
    </AuthPanel>
  );
}
