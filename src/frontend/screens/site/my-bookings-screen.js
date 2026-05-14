import Link from "next/link";
import { QueryStatusToast } from "@/src/frontend/components/feedback/query-status-toast.client";
import { SectionHeading } from "@/src/frontend/components/shared/section-heading";
import { BookingPaymentButton } from "@/src/frontend/features/payment/booking-payment-button.client";
import { formatCurrency, formatDate } from "@/src/frontend/lib/format";
import { siteAssets } from "@/src/frontend/assets";
import { getBookings } from "@/lib/data";

const noticeMessages = {
  payment_completed:
    "Payment completed successfully. If the paid badge does not appear immediately, refresh in a moment.",
};

const errorMessages = {
  payment_cancelled:
    "Payment was cancelled before it finished. Your booking is still unchanged.",
  payment_sync_failed:
    "Payment returned from Stripe, but we could not finish syncing the booking status yet. Please refresh shortly.",
};

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

export async function MyBookingsScreen({ searchParams }) {
  const params = (await searchParams) || {};
  const bookingData = await getBookings();
  const noticeCode = typeof params.notice === "string" ? params.notice : "";
  const errorCode = typeof params.error === "string" ? params.error : "";
  const feedbackToast = (
    <QueryStatusToast
      noticeCode={noticeCode}
      errorCode={errorCode}
      noticeMessages={noticeMessages}
      errorMessages={errorMessages}
      clearKeys={["notice", "error", "session_id"]}
    />
  );

  if (bookingData.status === "unauthenticated") {
    return (
      <section className="section-space">
        <div className="page-shell">
          {feedbackToast}
          <SectionHeading
            eyebrow="My stays"
            title="Sign in to see your stays"
            description="Your upcoming rooms, payment updates, and booking details are all gathered here once you sign in."
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
          {feedbackToast}
          <SectionHeading
            eyebrow="My stays"
            title="Your stays are temporarily unavailable"
            description="We could not load your travel details right now, but your account and reservations are still safe."
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
          {feedbackToast}
          <SectionHeading
            eyebrow="My stays"
            title="Your stays will appear here"
            description="Once you reserve a room, this page becomes your personal place for dates, payments, and trip details."
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
              Choose a room, reserve it while signed in, and this page will
              keep the dates, payment status, and hotel details close at hand.
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
  const openCount = bookings.filter(
    (booking) => booking.status === "pending" || booking.status === "confirmed",
  ).length;
  const paidCount = bookings.filter(
    (booking) => booking.paymentStatus === "paid",
  ).length;
  const completedCount = bookings.filter(
    (booking) => booking.status === "completed",
  ).length;

  return (
    <section className="section-space">
      <div className="page-shell">
        {feedbackToast}
        <SectionHeading
          eyebrow="My stays"
          title="Every stay, payment, and next step in one place"
          description="Review your upcoming trips, payment progress, and hotel details in a calmer traveler view."
          align="left"
        />

        <div className="mt-8 overflow-hidden rounded-[34px] border border-[rgba(188,208,229,0.9)] bg-[linear-gradient(135deg,rgba(19,48,75,0.96),rgba(39,89,131,0.94),rgba(137,186,229,0.82))] p-6 text-white shadow-[var(--shadow-lift)] sm:p-7">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_440px] xl:items-stretch">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/68">
                Booking overview
              </p>
              <h2 className="mt-3 font-display text-4xl text-white">
                Track every stay, payment, and next step from one place
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-8 text-white/78">
                Payment returns, hotel confirmations, and completed stays all
                come back here so your plans stay clear and easy to follow.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex h-full flex-col rounded-[24px] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/66">
                  Total
                </p>
                <p className="mt-3 font-display text-3xl text-white">
                  {bookings.length}
                </p>
              </div>
              <div className="flex h-full flex-col rounded-[24px] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/66">
                  Open stays
                </p>
                <p className="mt-3 font-display text-3xl text-white">
                  {openCount}
                </p>
              </div>
              <div className="flex h-full flex-col rounded-[24px] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/66">
                  Paid / completed
                </p>
                <p className="mt-3 font-display text-3xl text-white">
                  {paidCount}/{completedCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5">
          {bookings.map((booking) => (
            <article
              key={booking._id}
              className="overflow-hidden rounded-[34px] border border-[rgba(205,220,236,0.96)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,253,0.98))] p-5 shadow-[var(--shadow-soft)]"
            >
              <div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)_230px]">
                <img
                  src={booking.room.images[0]}
                  alt={booking.hotel.name}
                  className="aspect-[4/3] w-full rounded-[24px] object-cover"
                />

                <div className="min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                        {booking.hotel.city || booking.hotel.address}
                      </p>
                      <h2 className="mt-2 break-words font-display text-3xl text-[var(--color-ink)] [overflow-wrap:anywhere]">
                        {booking.room.name}
                      </h2>
                      <p className="mt-2 text-sm font-medium text-[var(--color-ink)]">
                        {booking.hotel.name}
                      </p>
                    </div>

                    <span className="pill-muted">Booking record</span>
                  </div>

                  {booking.room.roomType !== booking.room.name ? (
                    <p className="mt-3 text-sm text-[var(--color-muted)]">
                      {booking.room.roomType}
                    </p>
                  ) : null}
                  <div className="mt-4 flex min-w-0 items-center gap-2 text-sm text-[var(--color-muted)]">
                    <img
                      src={siteAssets.locationIcon}
                      alt=""
                      className="h-4 w-4 opacity-70"
                    />
                    <span className="break-words [overflow-wrap:anywhere]">
                      {booking.hotel.address}
                    </span>
                  </div>

                  {booking.notes ? (
                    <div className="mt-5 rounded-[24px] bg-white/88 px-4 py-4 text-sm leading-7 text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                        Your notes
                      </p>
                      <p className="mt-2">{booking.notes}</p>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col justify-between gap-4 rounded-[28px] bg-white/96 p-4 ring-1 ring-[var(--color-line)] shadow-[0_14px_34px_rgba(18,36,59,0.06)]">
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
                    {booking.paymentMethod ? (
                      <p className="mt-2 text-xs text-[var(--color-muted)]">
                        Paid via {formatStatusLabel(booking.paymentMethod)}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                      Payment
                    </p>
                    {booking.canPayOnline ? (
                      <BookingPaymentButton bookingId={booking._id} />
                    ) : booking.paymentStatus === "paid" ? (
                      <div className="mt-2 space-y-3">
                        <p className="rounded-[18px] bg-[var(--color-card-soft)] px-4 py-3 text-sm leading-7 text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
                          {booking.paymentActionMessage}
                        </p>
                        <Link
                          href={`/my-bookings/invoices/${booking._id}?download=1`}
                          target="_blank"
                          rel="noreferrer"
                          className="button-secondary min-h-11 w-full px-4 text-center"
                        >
                          Download invoice
                        </Link>
                      </div>
                    ) : (
                      <p className="mt-2 rounded-[18px] bg-[var(--color-card-soft)] px-4 py-3 text-sm leading-7 text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
                        {booking.paymentActionMessage}
                      </p>
                    )}
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
