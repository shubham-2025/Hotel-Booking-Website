import { SectionHeading } from "@/components/site/section-heading";
import { getBookings } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";
import { siteAssets } from "@/lib/mock-data";

export const metadata = {
  title: "My Bookings",
};

export default async function MyBookingsPage() {
  const bookings = await getBookings();

  return (
    <section className="section-space">
      <div className="page-shell">
        <SectionHeading
          eyebrow="Traveler area"
          title="Bookings view is now mobile-friendly"
          description="The old table-first layout was difficult on smaller screens. This version renders as stacked booking cards first, while keeping all of the essential trip details visible."
          align="left"
        />

        <div className="mt-10 grid gap-5">
          {bookings.map((booking) => (
            <article
              key={booking._id}
              className="rounded-[30px] border border-[var(--color-line)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-soft)]"
            >
              <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)_220px]">
                <img
                  src={booking.room.images[0]}
                  alt={booking.hotel.name}
                  className="aspect-[4/3] w-full rounded-[24px] object-cover"
                />

                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                    {booking.hotel.city || booking.hotel.address}
                  </p>
                  <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
                    {booking.hotel.name}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    {booking.room.roomType} for {booking.guests} guest
                    {booking.guests > 1 ? "s" : ""}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-muted)]">
                    <img
                      src={siteAssets.locationIcon}
                      alt=""
                      className="h-4 w-4 opacity-70"
                    />
                    <span>{booking.hotel.address}</span>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-4 rounded-[24px] bg-white p-4 ring-1 ring-[var(--color-line)]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                      Stay window
                    </p>
                    <p className="mt-2 text-sm text-[var(--color-ink)]">
                      {formatDate(booking.checkInDate)}
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">
                      to {formatDate(booking.checkOutDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                      Payment
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">
                      {formatCurrency(booking.totalPrice)}
                    </p>
                    <p
                      className={`mt-1 text-sm font-medium ${
                        booking.isPaid ? "text-emerald-700" : "text-amber-700"
                      }`}
                    >
                      {booking.isPaid ? "Paid" : "Pending payment"}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
