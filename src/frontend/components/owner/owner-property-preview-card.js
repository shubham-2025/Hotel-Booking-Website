export function OwnerPropertyPreviewCard({
  eyebrow = "Property preview",
  imageUrl,
  imageAlt,
  meta,
  name,
  location,
  description,
  amenities = [],
  note,
}) {
  return (
    <section className="rounded-[32px] border border-[rgba(205,220,236,0.96)] bg-white/96 p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
        {eyebrow}
      </p>

      <img
        src={imageUrl}
        alt={imageAlt}
        className="mt-5 aspect-[16/9] w-full rounded-[24px] object-cover"
      />

      {meta ? <div className="mt-5 flex flex-wrap gap-2">{meta}</div> : null}

      <h2 className="mt-5 break-words font-display text-3xl text-[var(--color-ink)] [overflow-wrap:anywhere] sm:text-4xl">
        {name}
      </h2>

      {location ? (
        <p className="mt-2 break-words text-sm leading-7 text-[var(--color-muted)] [overflow-wrap:anywhere]">
          {location}
        </p>
      ) : null}

      {description ? (
        <p className="mt-5 break-words text-sm leading-8 text-[var(--color-muted)] [overflow-wrap:anywhere]">
          {description}
        </p>
      ) : null}

      {amenities.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {amenities.map((amenity) => (
            <span
              key={amenity}
              className="rounded-full bg-[var(--color-card-soft)] px-3 py-2 text-xs font-medium text-[var(--color-muted)] ring-1 ring-[var(--color-line)]"
            >
              {amenity}
            </span>
          ))}
        </div>
      ) : null}

      {note ? (
        <div className="mt-6 rounded-[24px] bg-[var(--color-card-soft)] px-4 py-4 text-sm leading-7 text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
          {note}
        </div>
      ) : null}
    </section>
  );
}
