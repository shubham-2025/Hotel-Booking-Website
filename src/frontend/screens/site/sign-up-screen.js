import { signUpAction } from "@/src/backend/auth/auth-actions";
import { AuthPanel } from "@/src/frontend/features/auth/auth-panel";

const errorMessages = {
  auth_unavailable: "Auth is not configured yet. Add Supabase env vars to enable sign up.",
  missing_fields: "Please complete the required sign up fields.",
  signup_failed: "We could not create your account right now.",
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

  return (
    <AuthPanel
      eyebrow="Create account"
      title="Start with a minimal account"
      description="Sign up with email and password. New accounts default to the guest role until owner/admin access is granted in profiles."
      status={status}
      footerPrompt="Already have an account?"
      footerLinkLabel="Sign in"
      footerLinkHref={next && next !== "/" ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in"}
    >
      <form action={signUpAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />

        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Full name
          </span>
          <input
            type="text"
            name="fullName"
            required
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
            placeholder="Your name"
          />
        </label>

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
            placeholder="Create a password"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-2xl bg-[var(--color-ink)] px-5 py-4 text-sm font-semibold text-white hover:bg-[var(--color-highlight)]"
        >
          Create account
        </button>
      </form>
    </AuthPanel>
  );
}
