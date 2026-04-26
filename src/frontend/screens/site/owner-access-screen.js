import Link from "next/link";
import { startHostingAction } from "@/src/backend/owner/owner-access-actions";
import { PendingSubmitButton } from "@/src/frontend/components/shared/pending-submit-button.client";

const errorMessages = {
  profile_unavailable:
    "We could not load your account profile for owner setup. Please sign in again and retry.",
  owner_activation_unavailable:
    "Hosting is temporarily unavailable right now. Please try again shortly.",
  owner_activation_failed:
    "We could not activate hosting right now. Please try again shortly.",
};

function StepList({ items }) {
  return (
    <div className="space-y-3 text-sm leading-7 text-[var(--color-muted)]">
      {items.map((item, index) => (
        <p key={item}>{index + 1}. {item}</p>
      ))}
    </div>
  );
}

export function OwnerAccessScreen({
  state,
  supportEmail = "",
  fullName = "",
  hotelName = "",
  reason = "",
  errorCode = "",
}) {
  const errorMessage = errorCode && errorMessages[errorCode] ? errorMessages[errorCode] : "";

  if (state === "logged_out") {
    return (
      <section className="section-space">
        <div className="page-shell grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <div className="surface-card h-full rounded-[32px] p-6 sm:p-8">
            <p className="eyebrow-label">Hosting</p>
            <h1 className="mt-3 font-display text-4xl text-[var(--color-ink)]">
              Host beautifully with the same QuickStay account
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--color-muted)]">
              One account is all you need. Sign in first, then continue into
              your private hosting space from one calm, professional entry
              point.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/login?next=/host" className="button-primary min-h-11 px-5">
                Sign in for hosting
              </Link>
              <Link href="/create-account?next=/host" className="button-secondary min-h-11 px-5">
                Create account
              </Link>
            </div>
          </div>

          <div className="surface-card-soft h-full rounded-[32px] p-6 sm:p-8">
            <p className="eyebrow-label">What happens next</p>
            <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
              One path for both traveler and host access
            </h2>
            <div className="mt-6">
              <StepList
                items={[
                  "Log in or create your account.",
                  "Use the same account whenever hosting is enabled.",
                  "Continue to your property profile and room collection.",
                ]}
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (state === "guest") {
    return (
      <section className="section-space">
        <div className="page-shell grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <div className="surface-card h-full rounded-[32px] p-6 sm:p-8">
            <p className="eyebrow-label">Become a Host</p>
            <h1 className="mt-3 font-display text-4xl text-[var(--color-ink)]">
              Your account is ready for hosting{fullName ? `, ${fullName}` : ""}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--color-muted)]">
              Hosting uses the same QuickStay account, but every new account
              starts with guest access first. Turn on hosting here and we will
              guide you into your property setup next.
            </p>

            {errorMessage ? (
              <p className="mt-5 rounded-[22px] bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">
                {errorMessage}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <form action={startHostingAction}>
                <PendingSubmitButton
                  idleLabel="Start hosting"
                  pendingLabel="Opening hosting..."
                  className="button-primary min-h-11 px-5"
                />
              </form>
              <Link href="/" className="button-secondary min-h-11 px-5">
                Back to home
              </Link>
              <Link href="/host" className="button-secondary min-h-11 px-5">
                Refresh hosting
              </Link>
              {supportEmail ? (
                <a
                  href={`mailto:${supportEmail}?subject=QuickStay hosting request`}
                  className="button-secondary min-h-11 px-5"
                >
                  Contact support
                </a>
              ) : null}
            </div>
          </div>

          <div className="surface-card-soft h-full rounded-[32px] p-6 sm:p-8">
            <p className="eyebrow-label">Next step</p>
            <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
              Turn this account into a hosting space
            </h2>
            <div className="mt-6">
              <StepList
                items={[
                  "Keep using the same QuickStay login.",
                  "Activate hosting for this account from this page.",
                  "Continue directly to your property profile and rooms.",
                ]}
              />
            </div>
            <p className="mt-5 text-sm leading-7 text-[var(--color-muted)]">
              Once hosting is activated, the same account can still browse and
              book stays while also gaining access to property details, rooms,
              and guest bookings.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (state === "owner_no_hotel") {
    return (
      <section className="section-space">
        <div className="page-shell grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <div className="surface-card h-full rounded-[32px] p-6 sm:p-8">
            <p className="eyebrow-label">Hosting</p>
            <h1 className="mt-3 font-display text-4xl text-[var(--color-ink)]">
              Your hosting space is ready
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--color-muted)]">
              Your hosting access is active. The next step is creating the
              property profile that your rooms, bookings, and dashboard will
              grow around.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/owner/setup-hotel" className="button-primary min-h-11 px-5">
                Continue to property details
              </Link>
              <Link href="/owner" className="button-secondary min-h-11 px-5">
                Open dashboard
              </Link>
            </div>
          </div>

          <div className="surface-card-soft h-full rounded-[32px] p-6 sm:p-8">
            <p className="eyebrow-label">What comes next</p>
            <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
              Finish your owner onboarding
            </h2>
            <div className="mt-6">
              <StepList
                items={[
                  "Create the property profile.",
                  "Add rooms that fit the style of the stay.",
                  "Open selected rooms to guests when they feel ready.",
                ]}
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (state === "owner_unavailable") {
    return (
      <section className="section-space">
        <div className="page-shell grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <div className="surface-card h-full rounded-[32px] p-6 sm:p-8">
            <p className="eyebrow-label">Hosting</p>
            <h1 className="mt-3 font-display text-4xl text-[var(--color-ink)]">
              Hosting is active, but details are unavailable
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--color-muted)]">
              {reason || "We could not load your owner data right now. Please try again shortly."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/owner" className="button-primary min-h-11 px-5">
                Open dashboard
              </Link>
              <Link href="/host" className="button-secondary min-h-11 px-5">
                Refresh hosting
              </Link>
            </div>
          </div>

          <div className="surface-card-soft h-full rounded-[32px] p-6 sm:p-8">
            <p className="eyebrow-label">Current state</p>
            <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
              Your account role is correct
            </h2>
            <div className="mt-6">
              <StepList
                items={[
                  "Use the same account for owner and traveler access.",
                  "Retry the dashboard once your property data is available.",
                  "Continue to property details when everything is ready again.",
                ]}
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-space">
      <div className="page-shell grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <div className="surface-card h-full rounded-[32px] p-6 sm:p-8">
          <p className="eyebrow-label">Hosting</p>
          <h1 className="mt-3 font-display text-4xl text-[var(--color-ink)]">
            Your hosting dashboard is ready
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--color-muted)]">
            {hotelName
              ? `${hotelName} is already connected to this account and ready to manage.`
              : "A property is already connected to this account and ready to manage."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/owner" className="button-primary min-h-11 px-5">
              Open dashboard
            </Link>
            <Link href="/owner/list-room" className="button-secondary min-h-11 px-5">
              View rooms
            </Link>
          </div>
        </div>

        <div className="surface-card-soft h-full rounded-[32px] p-6 sm:p-8">
          <p className="eyebrow-label">Current hosting flow</p>
          <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
            Everything continues from here
          </h2>
          <div className="mt-6">
            <StepList
              items={[
                "Open your owner dashboard.",
                "Edit, publish, or unpublish rooms from inventory.",
                "Keep active rooms available to the public site only when ready.",
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
