export function SectionHeading({ eyebrow, title, description, align = "center" }) {
  return (
    <div
      className={`max-w-3xl ${align === "left" ? "text-left" : "mx-auto text-center"}`}
    >
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-strong)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-[var(--color-muted)]">
        {description}
      </p>
    </div>
  );
}
