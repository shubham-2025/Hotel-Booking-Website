import Link from "next/link";

export function AuthPanel({
  eyebrow,
  title,
  description,
  status,
  footerPrompt,
  footerLinkLabel,
  footerLinkHref,
  children,
}) {
  return (
    <section className="section-space">
      <div className="page-shell">
        <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[0.94fr_1.06fr]">
          <div className="relative overflow-hidden rounded-[36px] bg-[linear-gradient(135deg,#12243b,#1f4e86,#82b0de)] p-7 text-white shadow-[var(--shadow-lift)] sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%)]" />
            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/72">
                {eyebrow}
              </p>
              <h1 className="mt-4 font-display text-4xl text-white sm:text-[2.8rem]">
                {title}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-8 text-white/78 sm:text-base">
                {description}
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "One account for both guests and hosts",
                  "Booking and payment updates stay tied to your login",
                  "Secure email recovery whenever access needs a reset",
                  "Cleaner mobile-first forms with fewer dead ends",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[24px] border border-white/12 bg-white/10 px-4 py-4 text-sm leading-7 text-white/82 backdrop-blur-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[28px] border border-white/12 bg-white/10 px-5 py-5 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/68">
                  QuickStay access flow
                </p>
                <p className="mt-3 text-sm leading-8 text-white/78">
                  Sign in, create an account, or recover access without losing
                  your path back to bookings, payments, or owner tools.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[36px] border border-[rgba(213,225,239,0.92)] bg-white/88 p-1 shadow-[var(--shadow-lift)] backdrop-blur-xl">
            <div className="h-full overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,251,253,0.96))]">
              <div className="border-b border-[var(--color-line)] bg-[linear-gradient(135deg,rgba(233,245,255,0.88),rgba(255,255,255,0.92))] px-6 py-6 sm:px-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                  Your details
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
                  Keep your details accurate so room bookings, payment notices,
                  and account emails stay in sync.
                </p>
              </div>

              <div className="p-6 sm:p-8">
                {status ? (
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      status.tone === "error"
                        ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                        : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    }`}
                  >
                    {status.message}
                  </div>
                ) : null}

                <div className={status ? "mt-6" : ""}>{children}</div>

                {footerPrompt && footerLinkLabel && footerLinkHref ? (
                  <p className="mt-6 text-sm text-[var(--color-muted)]">
                    {footerPrompt}{" "}
                    <Link
                      href={footerLinkHref}
                      className="font-semibold text-[var(--color-highlight)] transition hover:text-[var(--color-ink)]"
                    >
                      {footerLinkLabel}
                    </Link>
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
