export function SectionHeading({ eyebrow, title, description, align = "center" }) {
  return (
    <div
      className={`max-w-3xl ${align === "left" ? "text-left" : "mx-auto text-center"}`}
    >
      {eyebrow ? (
        <p className="eyebrow-label">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-4 font-display text-3xl leading-tight text-[var(--color-ink)] sm:text-4xl lg:text-[2.8rem]">
        {title}
      </h2>
      <p className="mt-4 text-base leading-8 text-[var(--color-muted)] sm:text-[1.03rem]">
        {description}
      </p>
    </div>
  );
}
