const toneClasses = {
  accent: "bg-[#f7fbff] ring-[#d7e5f7]",
  success: "bg-[#eef8f0] ring-[#d4ead8]",
  warm: "bg-[#fff7ef] ring-[#f3dcc5]",
  neutral: "bg-white ring-[var(--color-line)]",
};

export function OwnerStatGrid({ items = [], columnsClass = "md:grid-cols-2 xl:grid-cols-4" }) {
  if (!items.length) {
    return null;
  }

  return (
    <div className={`grid gap-4 ${columnsClass}`}>
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-[28px] p-5 ring-1 ${
            toneClasses[item.tone] || toneClasses.neutral
          } ${item.className || ""}`}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            {item.label}
          </p>
          <p className="mt-3 text-4xl font-semibold text-[var(--color-ink)]">
            {item.value}
          </p>
          {item.helper ? (
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              {item.helper}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
