import Link from "next/link";
import { SectionHeading } from "@/src/frontend/components/shared/section-heading";
import { formatCurrency, formatDate } from "@/src/frontend/lib/format";
import { siteAssets } from "@/src/frontend/assets";
import { getBookings } from "@/lib/data";

function formatStatusLabel(value) {
  return String(value || "unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getBookingStatusClasses(status) {
  if (status === "confirmed") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "pending") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "cancelled") {
    return "bg-rose-100 text-rose-700";
  }

  if (status === "completed") {
    return "bg-sky-100 text-sky-700";
  }

  return "bg-slate-200 text-slate-700";
}

function getPaymentStatusClasses(paymentStatus) {
  if (paymentStatus === "paid") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (paymentStatus === "refunded") {
    return "bg-slate-200 text-slate-700";
  }

  return "bg-amber-100 text-amber-700";
}

export async function MyBookingsScreen() {
  const bookingData = await getBookings();

  if (bookingData.status === "unauthenticated") {
    return (
      <section className="section-space">
        <div className="page-shell">
          <SectionHeading
            eyebrow="Traveler area"
            title="Log in to view your bookings"
            description="This page now reads real bookings from your traveler account, so a valid signed-in session is required."
            align="left"
          />

          <div className="mt-10 rounded-[30px] border border-[var(--color-line)] bg-[var(--color-card)] p-6 shadow-[var(--shadow-soft)]">
            <p className="text-sm leading-7 text-[var(--color-muted)]">
              {bookingData.reason}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/login?next=/my-bookings"
                className="button-primary min-h-11 px-5"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (bookingData.status === "unavailable") {
    return (
      <section className="section-space">
        <div className="page-shell">
          <SectionHeading
            eyebrow="Traveler area"
            title="Your bookings are temporarily unavailable"
            description="This page now reads real traveler bookings from your authenticated account. We could not load that data right now."
            align="left"
          />

          <div className="mt-10 rounded-[30px] border border-[var(--color-line)] bg-[var(--color-card)] p-6 shadow-[var(--shadow-soft)]">
            <p className="text-sm leading-7 text-[var(--color-muted)]">
              {bookingData.reason}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/rooms" className="button-primary min-h-11 px-5">
                Browse rooms
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (bookingData.status === "empty") {
    return (
      <section className="section-space">
        <div className="page-shell">
          <SectionHeading
            eyebrow="Traveler area"
            title="Your real bookings will appear here"
            description="This page now shows bookings saved to your authenticated traveler account instead of demo data."
            align="left"
          />

          <div className="mt-10 rounded-[30px] border border-[var(--color-line)] bg-[var(--color-card)] p-6 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
              No bookings yet
            </p>
            <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
              Once you reserve a stay, it will show up in this account page
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
              Start from a live room page, create a booking while signed in, and
              this section will list the stay window, status, payment state, and
              pricing for that reservation.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/rooms" className="button-primary min-h-11 px-5">
                Browse rooms
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const bookings = bookingData.bookings;

  return (
    <section className="section-space">
      <div className="page-shell">
        <SectionHeading
          eyebrow="Traveler area"
          title="Your bookings now come from your real traveler account"
          description="This view keeps the mobile-friendly stacked booking cards, but it now reads your saved reservations instead of demo fallback data."
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
                    {booking.room.name}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-[var(--color-ink)]">
                    {booking.hotel.name}
                  </p>
                  {booking.room.roomType !== booking.room.name ? (
                    <p className="mt-2 text-sm text-[var(--color-muted)]">
                      {booking.room.roomType}
                    </p>
                  ) : null}
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
                      Guests
                    </p>
                    <p className="mt-2 text-sm text-[var(--color-ink)]">
                      {booking.guests} guest{booking.guests === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                      Total price
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">
                      {formatCurrency(booking.totalPrice)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                      Status
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-2 text-xs font-semibold ${getBookingStatusClasses(
                          booking.status,
                        )}`}
                      >
                        {formatStatusLabel(booking.status)}
                      </span>
                      <span
                        className={`rounded-full px-3 py-2 text-xs font-semibold ${getPaymentStatusClasses(
                          booking.paymentStatus,
                        )}`}
                      >
                        {formatStatusLabel(booking.paymentStatus)}
                      </span>
                    </div>
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
