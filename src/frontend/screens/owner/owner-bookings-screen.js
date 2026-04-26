import Link from "next/link";
import { updateOwnerBookingStatusAction } from "@/src/backend/owner/owner-booking-actions";
import { getOwnerBookingsData } from "@/src/backend/repositories/owner-repository";
import { QueryStatusToast } from "@/src/frontend/components/feedback/query-status-toast.client";
import { PendingSubmitButton } from "@/src/frontend/components/shared/pending-submit-button.client";
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
    "We could not find that stay inside your hosting space.",
  invalid_transition:
    "That booking status change is not allowed from the current state.",
  payment_required:
    "This stay can only be completed after the traveler payment is received.",
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

  if (booking.status === "confirmed" && booking.paymentStatus === "paid") {
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

function getOwnerBookingActionMessage(booking) {
  if (booking.status === "confirmed" && booking.paymentStatus !== "paid") {
    return "Traveler payment is still pending. This stay can be completed after payment is received.";
  }

  return "No more updates are needed for this stay right now.";
}

function getPendingActionLabel(nextStatus) {
  if (nextStatus === "confirmed") {
    return "Confirming booking...";
  }

  if (nextStatus === "cancelled") {
    return "Cancelling booking...";
  }

  if (nextStatus === "completed") {
    return "Marking completed...";
  }

  return "Saving update...";
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
  const paidCount = ownerBookingsData.bookings.filter(
    (booking) => booking.paymentStatus === "paid",
  ).length;
  const feedbackToast = (
    <QueryStatusToast
      noticeCode={noticeCode}
      errorCode={errorCode}
      noticeMessages={noticeMessages}
      errorMessages={errorMessages}
    />
  );

  if (ownerBookingsData.status === "unavailable") {
    return (
      <div>
        {feedbackToast}
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Bookings
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          Your guest bookings are temporarily unavailable
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
        {feedbackToast}
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Bookings
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          Set up your hotel before managing bookings
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          Guest bookings begin once your property profile and room collection
          are ready. After that, each stay will appear here automatically.
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
        {feedbackToast}
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Bookings
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          Add rooms before booking operations begin
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          Guest stays will begin appearing here as soon as your property has
          rooms available to welcome bookings.
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
        {feedbackToast}
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Bookings
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          Your booking desk is ready
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          Your rooms are beautifully connected, and guest stays will start
          appearing here as soon as bookings begin.
        </p>

        <div className="mt-8 rounded-[30px] border border-[var(--color-line)] bg-[#fbfcfe] p-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
            What will appear here
          </p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-muted)]">
            <p>1. Bookings tied only to rooms owned by this account.</p>
            <p>2. Booking status and payment status for each reservation.</p>
            <p>3. Simple actions to confirm, cancel, or complete each stay.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {feedbackToast}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            Bookings
          </p>
          <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
            Care for every guest stay with clarity
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
            Review each stay, keep payment visibility clear, and guide guests
            from request to arrival with a calm operational view.
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

      <div className="mt-8 overflow-hidden rounded-[34px] border border-[rgba(188,208,229,0.9)] bg-[linear-gradient(135deg,rgba(19,48,75,0.98),rgba(39,89,131,0.95),rgba(137,186,229,0.82))] p-6 text-white shadow-[var(--shadow-lift)] sm:p-7">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/68">
              Booking desk
            </p>
            <h2 className="mt-3 font-display text-4xl text-white">
              Review new stays, confirm demand, and keep operations moving
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-8 text-white/78">
              This owner view now gives you a tighter operational snapshot with
              live statuses, payment awareness, and safer action controls.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-[24px] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/66">
                Total
              </p>
              <p className="mt-3 font-display text-3xl text-white">
                {ownerBookingsData.bookings.length}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/66">
                Pending / confirmed
              </p>
              <p className="mt-3 font-display text-3xl text-white">
                {pendingCount}/{confirmedCount}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/66">
                Paid stays
              </p>
              <p className="mt-3 font-display text-3xl text-white">
                {paidCount}
              </p>
            </div>
          </div>
        </div>
      </div>

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
              className="overflow-hidden rounded-[32px] border border-[rgba(205,220,236,0.96)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,253,0.98))] p-4 shadow-[var(--shadow-soft)]"
            >
              <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)_280px]">
                <img
                  src={booking.room?.images?.[0] || siteAssets.heroImage}
                  alt={booking.room?.name || booking.room?.roomType || booking.hotel?.name}
                  className="aspect-[4/3] w-full rounded-[24px] object-cover"
                />

                <div>
                  <div className="flex flex-wrap items-start justify-between gap-3">
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
                    </div>

                    <span className="pill-muted">Private hosting view</span>
                  </div>

                  {booking.room?.roomType !== booking.room?.name ? (
                    <p className="mt-3 text-sm text-[var(--color-muted)]">
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

                <div className="flex flex-col gap-4 rounded-[28px] bg-white/96 p-4 ring-1 ring-[var(--color-line)] shadow-[0_14px_34px_rgba(18,36,59,0.06)]">
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
                          <PendingSubmitButton
                            idleLabel={action.label}
                            pendingLabel={getPendingActionLabel(action.nextStatus)}
                            className={action.className}
                          />
                        </form>
                      ))
                    ) : (
                      <div className="rounded-[22px] bg-[var(--color-card-soft)] px-4 py-3 text-sm leading-7 text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
                        {getOwnerBookingActionMessage(booking)}
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
