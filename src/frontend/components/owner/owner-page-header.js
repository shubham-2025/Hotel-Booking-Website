export function OwnerPageHeader({
  eyebrow = "Workspace",
  title,
  description = "",
  meta = null,
  actions = null,
}) {
  return (
    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
      <div className="min-w-0 max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-display text-4xl text-[var(--color-ink)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-3xl text-sm leading-8 text-[var(--color-muted)]">
            {description}
          </p>
        ) : null}
        {meta ? <div className="mt-4 flex flex-wrap gap-2">{meta}</div> : null}
      </div>

      {actions ? (
        <div className="flex flex-wrap gap-3 xl:justify-end">{actions}</div>
      ) : null}
    </div>
  );
}
