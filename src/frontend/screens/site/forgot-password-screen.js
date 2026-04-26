import Link from "next/link";
import { forgotPasswordAction } from "@/src/backend/auth/auth-actions";
import { QueryStatusToast } from "@/src/frontend/components/feedback/query-status-toast.client";
import { AuthPanel } from "@/src/frontend/features/auth/auth-panel";
import { ForgotPasswordForm } from "@/src/frontend/features/auth/forgot-password-form.client";

const errorMessages = {
  auth_unavailable: "Password reset is temporarily unavailable. Please try again shortly.",
  missing_email: "Please enter the email linked to your account.",
  reset_failed: "We could not send a reset email right now. Please try again.",
};

const noticeMessages = {
  reset_email_sent:
    "If this email exists in QuickStay, a secure password reset link is on the way.",
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

export function ForgotPasswordScreen({ errorCode = "", noticeCode = "" }) {
  const status = getStatus(errorCode);

  return (
    <AuthPanel
      eyebrow="Account recovery"
      title="Reset your password"
      description="Enter your account email and we will send you a secure reset link to finish the recovery flow."
      status={status}
      footerPrompt="Remembered your password?"
      footerLinkLabel="Back to login"
      footerLinkHref="/login"
    >
      <QueryStatusToast
        noticeCode={noticeCode}
        noticeMessages={noticeMessages}
        showErrorToast={false}
      />

      <ForgotPasswordForm action={forgotPasswordAction} />

      <div className="mt-5 rounded-[24px] border border-[var(--color-line)] bg-white/80 px-4 py-4 text-sm leading-7 text-[var(--color-muted)]">
        For security, password reset links are always emailed securely. We never display or send stored passwords.
      </div>

      <div className="mt-4 text-sm text-[var(--color-muted)]">
        Prefer to try another sign-in method?{" "}
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
