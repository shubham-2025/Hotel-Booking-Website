import Link from "next/link";
import { updateOwnerBookingStatusAction } from "@/src/backend/owner/owner-booking-actions";
import { getOwnerBookingsData } from "@/src/backend/repositories/owner-repository";
import { formatCurrency, formatDate } from "@/src/frontend/lib/format";
import { siteAssets } from "@/src/frontend/assets";

const noticeMessages = {
  booking_confirmed: "Booking status updated to confirmed.",
  booking_cancelled: "Booking status updated to cancelled.",
  booking_completed: "Booking status updated to completed.",
  booking_updated: "Booking status updated successfully.",
};

const errorMessages = {
  invalid_action: "We could not understand that booking update action.",
  booking_not_found:
    "That booking is no longer available in your current owner scope.",
  invalid_transition:
    "That booking status change is not allowed from the current state.",
  update_failed:
    "We could not update the booking right now. Please try again shortly.",
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

function getOwnerBookingActions(booking) {
  if (booking.status === "pending") {
    return [
      {
        label: "Confirm booking",
        nextStatus: "confirmed",
        className: "button-primary min-h-11 px-4",
      },
      {
        label: "Cancel booking",
        nextStatus: "cancelled",
        className:
          "min-h-11 rounded-full border border-[var(--color-line)] bg-white px-4 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-card-soft)]",
      },
    ];
  }

  if (booking.status === "confirmed") {
    return [
      {
        label: "Mark completed",
        nextStatus: "completed",
        className: "button-primary min-h-11 px-4",
      },
    ];
  }

  return [];
}

function FeedbackBanner({ noticeCode = "", errorCode = "" }) {
  if (errorCode && errorMessages[errorCode]) {
    return (
      <p className="mt-6 rounded-[24px] bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">
        {errorMessages[errorCode]}
      </p>
    );
  }

  if (noticeCode && noticeMessages[noticeCode]) {
    return (
      <p className="mt-6 rounded-[24px] bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-100">
        {noticeMessages[noticeCode]}
      </p>
    );
  }

  return null;
}

export async function OwnerBookingsScreen({ searchParams }) {
  const params = (await searchParams) || {};
  const ownerBookingsData = await getOwnerBookingsData();
  const noticeCode =
    typeof params.notice === "string" ? params.notice : "";
  const errorCode = typeof params.error === "string" ? params.error : "";
  const pendingCount = ownerBookingsData.bookings.filter(
    (booking) => booking.status === "pending",
  ).length;
  const confirmedCount = ownerBookingsData.bookings.filter(
    (booking) => booking.status === "confirmed",
  ).length;

  if (ownerBookingsData.status === "unavailable") {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Bookings
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          Owner bookings are temporarily unavailable
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          {ownerBookingsData.reason}
        </p>
      </div>
    );
  }

  if (ownerBookingsData.status === "no_hotel") {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Bookings
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          Set up your hotel before managing bookings
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          Booking operations depend on the owner account being linked to a real
          hotel first. Once your hotel and rooms exist, bookings tied to that
          inventory will appear here.
        </p>
        <div className="mt-8">
          <Link href="/owner/setup-hotel" className="button-primary min-h-11 px-5">
            Set up your hotel
          </Link>
        </div>
      </div>
    );
  }

  if (ownerBookingsData.status === "no_rooms") {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Bookings
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          Add rooms before booking operations begin
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          Owners can only review bookings for real rooms attached to their hotel
          scope. Once inventory exists, bookings for those rooms will appear
          here automatically.
        </p>
        <div className="mt-8">
          <Link href="/owner/add-room" className="button-primary min-h-11 px-5">
            Add your first room
          </Link>
        </div>
      </div>
    );
  }

  if (ownerBookingsData.status === "empty") {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Bookings
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          Owner booking management is ready
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          Your rooms are linked correctly, but no traveler bookings have been
          created for this owner scope yet.
        </p>

        <FeedbackBanner noticeCode={noticeCode} errorCode={errorCode} />

        <div className="mt-8 rounded-[30px] border border-[var(--color-line)] bg-[#fbfcfe] p-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
            What will appear here
          </p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-muted)]">
            <p>1. Bookings tied only to rooms owned by this account.</p>
            <p>2. Booking status and payment status for each reservation.</p>
            <p>3. Basic owner actions to confirm, cancel, or complete stays.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            Bookings
          </p>
          <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
            Booking operations for your owned rooms
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
            This page shows only bookings that belong to the current owner
            account&apos;s rooms, and it now supports the first safe status
            transitions for real operational flow.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/owner" className="button-secondary min-h-11 px-5">
            Back to dashboard
          </Link>
          <Link href="/owner/list-room" className="button-secondary min-h-11 px-5">
            View room inventory
          </Link>
        </div>
      </div>

      <FeedbackBanner noticeCode={noticeCode} errorCode={errorCode} />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] bg-[#f7fbff] p-5 ring-1 ring-[#d7e5f7]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
            Total bookings
          </p>
          <p className="mt-3 text-4xl font-semibold text-[var(--color-ink)]">
            {ownerBookingsData.bookings.length}
          </p>
        </div>

        <div className="rounded-[28px] bg-[#fff7ef] p-5 ring-1 ring-[#f3dcc5]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
            Pending review
          </p>
          <p className="mt-3 text-4xl font-semibold text-[var(--color-ink)]">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-[28px] bg-[#eef8f0] p-5 ring-1 ring-[#d4ead8]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Confirmed stays
          </p>
          <p className="mt-3 text-4xl font-semibold text-[var(--color-ink)]">
            {confirmedCount}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4">
        {ownerBookingsData.bookings.map((booking) => {
          const bookingActions = getOwnerBookingActions(booking);

          return (
            <article
              key={booking._id}
              className="rounded-[28px] border border-[var(--color-line)] bg-[#fbfcfe] p-4 shadow-[var(--shadow-soft)]"
            >
              <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)_280px]">
                <img
                  src={booking.room?.images?.[0] || siteAssets.heroImage}
                  alt={booking.room?.name || booking.room?.roomType || booking.hotel?.name}
                  className="aspect-[4/3] w-full rounded-[24px] object-cover"
                />

                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                    {booking.hotel?.city || booking.hotel?.address}
                  </p>
                  <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
                    {booking.room?.name || booking.room?.roomType || "Booked room"}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-[var(--color-ink)]">
                    {booking.hotel?.name || "Hotel unavailable"}
                  </p>
                  {booking.room?.roomType !== booking.room?.name ? (
                    <p className="mt-2 text-sm text-[var(--color-muted)]">
                      {booking.room?.roomType}
                    </p>
                  ) : null}

                  <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-muted)]">
                    <img
                      src={siteAssets.locationIcon}
                      alt=""
                      className="h-4 w-4 opacity-70"
                    />
                    <span>{booking.hotel?.address || "Address unavailable"}</span>
                  </div>

                  {booking.notes ? (
                    <div className="mt-4 rounded-[22px] bg-white px-4 py-3 text-sm leading-7 text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
                      <p className="font-semibold text-[var(--color-ink)]">
                        Traveler notes
                      </p>
                      <p className="mt-1">{booking.notes}</p>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-4 rounded-[24px] bg-white p-4 ring-1 ring-[var(--color-line)]">
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

                  <div className="flex flex-col gap-3">
                    {bookingActions.length ? (
                      bookingActions.map((action) => (
                        <form action={updateOwnerBookingStatusAction} key={action.nextStatus}>
                          <input type="hidden" name="bookingId" value={booking._id} />
                          <input
                            type="hidden"
                            name="nextStatus"
                            value={action.nextStatus}
                          />
                          <button type="submit" className={action.className}>
                            {action.label}
                          </button>
                        </form>
                      ))
                    ) : (
                      <div className="rounded-[22px] bg-[var(--color-card-soft)] px-4 py-3 text-sm leading-7 text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
                        No further status updates are available for this booking
                        in this batch.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
