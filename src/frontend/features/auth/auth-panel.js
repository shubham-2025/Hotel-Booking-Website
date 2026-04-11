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
        <div className="mx-auto max-w-xl rounded-[34px] border border-[var(--color-line)] bg-white/85 p-1 shadow-[var(--shadow-lift)]">
          <div className="overflow-hidden rounded-[30px] bg-white">
            <div className="bg-[linear-gradient(135deg,#12243b,#1f4e86,#7da6d9)] px-6 py-7 text-white sm:px-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/72">
                {eyebrow}
              </p>
              <h1 className="mt-3 font-display text-4xl text-white">
                {title}
              </h1>
              <p className="mt-3 text-sm leading-7 text-white/78">
                {description}
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

              <p className="mt-6 text-sm text-[var(--color-muted)]">
                {footerPrompt}{" "}
                <Link
                  href={footerLinkHref}
                  className="font-semibold text-[var(--color-highlight)] transition hover:text-[var(--color-ink)]"
                >
                  {footerLinkLabel}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
