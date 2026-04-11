import { signInAction } from "@/src/backend/auth/auth-actions";
import { AuthPanel } from "@/src/frontend/features/auth/auth-panel";

const errorMessages = {
  auth_unavailable: "Auth is not configured yet. Add Supabase env vars to enable sign in.",
  invalid_credentials: "We could not sign you in with those credentials.",
  missing_fields: "Please enter both email and password.",
};

const noticeMessages = {
  check_email:
    "Your account was created. Check your email if confirmation is required before signing in.",
};

function getStatus(errorCode, noticeCode) {
  if (errorCode && errorMessages[errorCode]) {
    return {
      tone: "error",
      message: errorMessages[errorCode],
    };
  }

  if (noticeCode && noticeMessages[noticeCode]) {
    return {
      tone: "success",
      message: noticeMessages[noticeCode],
    };
  }

  return null;
}

export function SignInScreen({ next = "/", errorCode = "", noticeCode = "" }) {
  const status = getStatus(errorCode, noticeCode);

  return (
    <AuthPanel
      eyebrow="Account access"
      title="Sign in to continue"
      description="Use your email and password to access account-aware features. Owner routes stay protected by your profile role."
      status={status}
      footerPrompt="Need an account?"
      footerLinkLabel="Create one"
      footerLinkHref={next && next !== "/" ? `/sign-up?next=${encodeURIComponent(next)}` : "/sign-up"}
    >
      <form action={signInAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />

        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Email
          </span>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
            placeholder="you@example.com"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Password
          </span>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
            placeholder="Enter your password"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-2xl bg-[var(--color-ink)] px-5 py-4 text-sm font-semibold text-white hover:bg-[var(--color-highlight)]"
        >
          Sign in
        </button>
      </form>
    </AuthPanel>
  );
}
