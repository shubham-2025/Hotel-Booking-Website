import Link from "next/link";
import { startHostingAction } from "@/src/backend/owner/owner-access-actions";

const errorMessages = {
  profile_unavailable:
    "We could not load your account profile for owner setup. Please sign in again and retry.",
  owner_activation_unavailable:
    "Owner activation is temporarily unavailable in this environment. Please try again shortly.",
  owner_activation_failed:
    "We could not activate owner access right now. Please try again shortly.",
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
        <div className="page-shell grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="surface-card rounded-[32px] p-6 sm:p-8">
            <p className="eyebrow-label">Owner access</p>
            <h1 className="mt-3 font-display text-4xl text-[var(--color-ink)]">
              Host with the same QuickStay account
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--color-muted)]">
              Travelers and hosts use the same login system here. Sign in first, then continue into the owner flow from one clear entry point.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/login?next=/host" className="button-primary min-h-11 px-5">
                Login for owner access
              </Link>
              <Link href="/create-account?next=/host" className="button-secondary min-h-11 px-5">
                Create account
              </Link>
            </div>
          </div>

          <div className="surface-card-soft rounded-[32px] p-6 sm:p-8">
            <p className="eyebrow-label">What happens next</p>
            <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
              One path for both traveler and host access
            </h2>
            <div className="mt-6">
              <StepList
                items={[
                  "Log in or create your account.",
                  "Use the same account whenever owner access is enabled.",
                  "Continue to hotel setup and room management from the owner area.",
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
        <div className="page-shell grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="surface-card rounded-[32px] p-6 sm:p-8">
            <p className="eyebrow-label">Become a Host</p>
            <h1 className="mt-3 font-display text-4xl text-[var(--color-ink)]">
              Your account is signed in as a traveler{fullName ? `, ${fullName}` : ""}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--color-muted)]">
              Owner access uses the same QuickStay account, but every new
              account starts as a traveler first. This account still needs an
              `owner` or `admin` role before hotel setup can begin.
            </p>

            {errorMessage ? (
              <p className="mt-5 rounded-[22px] bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">
                {errorMessage}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <form action={startHostingAction}>
                <button type="submit" className="button-primary min-h-11 px-5">
                  Start hosting
                </button>
              </form>
              <Link href="/" className="button-secondary min-h-11 px-5">
                Back to home
              </Link>
              <Link href="/host" className="button-secondary min-h-11 px-5">
                Refresh owner access
              </Link>
              {supportEmail ? (
                <a
                  href={`mailto:${supportEmail}?subject=QuickStay owner access request`}
                  className="button-secondary min-h-11 px-5"
                >
                  Request owner access
                </a>
              ) : null}
            </div>
          </div>

          <div className="surface-card-soft rounded-[32px] p-6 sm:p-8">
            <p className="eyebrow-label">Next step</p>
            <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
              Guest to owner in this batch
            </h2>
            <div className="mt-6">
              <StepList
                items={[
                  "Keep using the same QuickStay login.",
                  "Activate owner access for this account from this page.",
                  "Continue directly to hotel setup and then add rooms.",
                ]}
              />
            </div>
            <p className="mt-5 text-sm leading-7 text-[var(--color-muted)]">
              Once owner access is activated, this same account can still browse
              home, rooms, and bookings like any normal user, while also gaining
              access to hotel setup and owner inventory pages.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (state === "owner_no_hotel") {
    return (
      <section className="section-space">
        <div className="page-shell grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="surface-card rounded-[32px] p-6 sm:p-8">
            <p className="eyebrow-label">Owner access</p>
            <h1 className="mt-3 font-display text-4xl text-[var(--color-ink)]">
              Owner access is ready
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--color-muted)]">
              Your management role is active. The next step is creating the first hotel record that your future rooms and owner dashboard will attach to.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/owner/setup-hotel" className="button-primary min-h-11 px-5">
                Continue to hotel setup
              </Link>
              <Link href="/owner" className="button-secondary min-h-11 px-5">
                Open owner area
              </Link>
            </div>
          </div>

          <div className="surface-card-soft rounded-[32px] p-6 sm:p-8">
            <p className="eyebrow-label">What comes next</p>
            <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
              Finish your owner onboarding
            </h2>
            <div className="mt-6">
              <StepList
                items={[
                  "Create the hotel record.",
                  "Add rooms under that hotel.",
                  "Publish active rooms when they are ready for public discovery.",
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
        <div className="page-shell grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="surface-card rounded-[32px] p-6 sm:p-8">
            <p className="eyebrow-label">Owner access</p>
            <h1 className="mt-3 font-display text-4xl text-[var(--color-ink)]">
              Owner access is active, but data is unavailable
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--color-muted)]">
              {reason || "We could not load your owner data right now. Please try again shortly."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/owner" className="button-primary min-h-11 px-5">
                Open owner dashboard
              </Link>
              <Link href="/host" className="button-secondary min-h-11 px-5">
                Refresh owner access
              </Link>
            </div>
          </div>

          <div className="surface-card-soft rounded-[32px] p-6 sm:p-8">
            <p className="eyebrow-label">Current state</p>
            <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
              Your account role is correct
            </h2>
            <div className="mt-6">
              <StepList
                items={[
                  "Use the same account for owner and traveler access.",
                  "Retry owner setup or dashboard once backend data is available.",
                  "Continue to hotel setup when the owner data layer is healthy again.",
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
      <div className="page-shell grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="surface-card rounded-[32px] p-6 sm:p-8">
          <p className="eyebrow-label">Owner access</p>
          <h1 className="mt-3 font-display text-4xl text-[var(--color-ink)]">
            Owner dashboard is ready
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--color-muted)]">
            {hotelName
              ? `You already have owner access with ${hotelName} linked to this account.`
              : "You already have owner access with a hotel linked to this account."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/owner" className="button-primary min-h-11 px-5">
              Open owner dashboard
            </Link>
            <Link href="/owner/list-room" className="button-secondary min-h-11 px-5">
              Manage inventory
            </Link>
          </div>
        </div>

        <div className="surface-card-soft rounded-[32px] p-6 sm:p-8">
          <p className="eyebrow-label">Current owner flow</p>
          <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
            Room lifecycle now continues from here
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
