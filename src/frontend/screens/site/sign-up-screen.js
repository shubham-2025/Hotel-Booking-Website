import {
  continueWithGoogleAction,
  signUpAction,
} from "@/src/backend/auth/auth-actions";
import { AuthPanel } from "@/src/frontend/features/auth/auth-panel";
import { SignUpForm } from "@/src/frontend/features/auth/sign-up-form.client";

const errorMessages = {
  auth_unavailable: "Account creation is temporarily unavailable. Please try again shortly.",
  email_rate_limited:
    "Too many verification emails were requested recently. Please wait a few minutes before creating another account.",
  missing_fields: "Please complete the required sign up fields.",
  password_mismatch: "Password and confirm password must match.",
  password_too_short: "Password must be at least 6 characters long.",
  email_in_use: "An account already exists with this email address.",
  signup_failed: "We could not create your account right now.",
  oauth_failed: "Google sign up could not be completed. Please try again.",
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

export function SignUpScreen({ next = "/", errorCode = "" }) {
  const status = getStatus(errorCode);
  const ownerAccessIntent = next === "/host";

  return (
    <AuthPanel
      eyebrow="Create account"
      title="Create your QuickStay account"
      description="Set up your traveler account with contact details, a secure password, and a smoother return path into future booking flows."
      status={status}
      footerPrompt="Already have an account?"
      footerLinkLabel="Login"
      footerLinkHref={
        next && next !== "/" ? `/login?next=${encodeURIComponent(next)}` : "/login"
      }
    >
      {ownerAccessIntent ? (
        <div className="mb-6 rounded-[24px] border border-[var(--color-line)] bg-white/80 px-4 py-4 text-sm leading-7 text-[var(--color-muted)]">
          This creates the same common QuickStay account used for both traveler
          and owner access. New accounts start as traveler accounts first, and
          after login we will guide the start-hosting step from there.
        </div>
      ) : null}

      <form action={continueWithGoogleAction}>
        <input type="hidden" name="next" value={next} />
        <input type="hidden" name="intent" value="sign-up" />
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[var(--color-line)] bg-white px-5 py-3.5 text-sm font-semibold text-[var(--color-ink)] shadow-[0_10px_24px_rgba(18,36,59,0.06)] transition hover:bg-[var(--color-card-soft)]"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
            <path
              fill="#EA4335"
              d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.8-5.5 3.8-3.3 0-6-2.8-6-6.2s2.7-6.2 6-6.2c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 2.8 14.7 2 12 2 6.9 2 2.8 6.5 2.8 12s4.1 10 9.2 10c5.3 0 8.8-3.7 8.8-9 0-.6-.1-1.1-.2-1.6H12Z"
            />
            <path
              fill="#34A853"
              d="M3.9 7.3 7 9.5C7.9 7.6 9.8 6.2 12 6.2c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 2.8 14.7 2 12 2 8.4 2 5.2 4.1 3.9 7.3Z"
            />
            <path
              fill="#4A90E2"
              d="M12 22c2.6 0 4.8-.8 6.4-2.3l-3-2.5c-.8.6-1.9 1-3.4 1-2.5 0-4.6-1.7-5.4-4.1l-3.1 2.4C4.8 19.8 8.1 22 12 22Z"
            />
            <path
              fill="#FBBC05"
              d="M6.6 14.1c-.2-.6-.4-1.3-.4-2.1s.1-1.4.4-2.1L3.5 7.5C2.9 8.8 2.6 10.3 2.6 12s.3 3.2.9 4.5l3.1-2.4Z"
            />
          </svg>
          Continue with Google
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--color-line)]" />
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
          or continue with email
        </span>
        <div className="h-px flex-1 bg-[var(--color-line)]" />
      </div>

      <SignUpForm action={signUpAction} next={next} />
    </AuthPanel>
  );
}
