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
        <div className="mx-auto max-w-xl rounded-[32px] border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl text-[var(--color-ink)]">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
            {description}
          </p>

          {status ? (
            <div
              className={`mt-6 rounded-2xl px-4 py-3 text-sm ${
                status.tone === "error"
                  ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                  : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              }`}
            >
              {status.message}
            </div>
          ) : null}

          <div className="mt-8">{children}</div>

          <p className="mt-6 text-sm text-[var(--color-muted)]">
            {footerPrompt}{" "}
            <Link
              href={footerLinkHref}
              className="font-semibold text-[var(--color-highlight)]"
            >
              {footerLinkLabel}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
