import Link from "next/link";
import { updateOwnerBookingStatusAction } from "@/src/backend/owner/owner-booking-actions";
import { getOwnerBookingsData } from "@/src/backend/repositories/owner-repository";
import { QueryStatusToast } from "@/src/frontend/components/feedback/query-status-toast.client";
import { PendingSubmitButton } from "@/src/frontend/components/shared/pending-submit-button.client";
import { OwnerPageHeader } from "@/src/frontend/components/owner/owner-page-header";
import { OwnerStatGrid } from "@/src/frontend/components/owner/owner-stat-grid";
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

function BookingRow({ booking }) {
  const bookingActions = getOwnerBookingActions(booking);

  return (
    <article className="grid gap-5 px-4 py-5 xl:grid-cols-[190px_minmax(0,1fr)_280px] xl:items-start">
      <img
        src={booking.room?.images?.[0] || siteAssets.heroImage}
        alt={booking.room?.name || booking.room?.roomType || booking.hotel?.name}
        className="aspect-[4/3] w-full rounded-[22px] object-cover"
      />

      <div className="min-w-0">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-[var(--color-card-soft)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-strong)] ring-1 ring-[var(--color-line)]">
            {booking.hotel?.city || "Guest stay"}
          </span>
          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
            {booking.room?.roomType || "Room"}
          </span>
        </div>

        <h2 className="mt-4 font-display text-3xl text-[var(--color-ink)]">
          {booking.room?.name || booking.room?.roomType || "Booked room"}
        </h2>
        <p className="mt-2 text-sm font-medium text-[var(--color-ink)]">
          {booking.hotel?.name || "Hotel unavailable"}
        </p>

        <div className="mt-3 flex flex-wrap gap-3 text-sm text-[var(--color-muted)]">
          <span>{formatDate(booking.checkInDate)} to {formatDate(booking.checkOutDate)}</span>
          <span>{booking.guests} guest{booking.guests === 1 ? "" : "s"}</span>
          <span>{formatCurrency(booking.totalPrice)}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
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

        <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-muted)]">
          <img
            src={siteAssets.locationIcon}
            alt=""
            className="h-4 w-4 opacity-70"
          />
          <span>{booking.hotel?.address || "Address unavailable"}</span>
        </div>

        {booking.notes ? (
          <div className="mt-4 rounded-[22px] bg-[var(--color-card-soft)] px-4 py-4 text-sm leading-7 text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
            <p className="font-semibold text-[var(--color-ink)]">
              Traveler notes
            </p>
            <p className="mt-1">{booking.notes}</p>
          </div>
        ) : null}
      </div>

      <div className="border-t border-[var(--color-line)] pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Actions
        </p>
        <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
          {getOwnerBookingActionMessage(booking)}
        </p>

        <div className="mt-4 flex flex-col gap-3">
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
            <div className="rounded-[22px] bg-white px-4 py-4 text-sm leading-7 text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
              No more actions are required for this stay right now.
            </div>
          )}
        </div>
      </div>
    </article>
  );
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
      <div className="space-y-8">
        {feedbackToast}
        <OwnerPageHeader
          eyebrow="Bookings"
          title="Your guest bookings are temporarily unavailable"
          description={ownerBookingsData.reason}
        />
      </div>
    );
  }

  if (ownerBookingsData.status === "no_hotel") {
    return (
      <div className="space-y-8">
        {feedbackToast}
        <OwnerPageHeader
          eyebrow="Bookings"
          title="Set up your property before managing stays"
          description="Guest bookings will begin appearing here once your property profile and room collection are ready."
          actions={
            <Link href="/owner/setup-hotel" className="button-primary min-h-11 px-5">
              Set up property
            </Link>
          }
        />
      </div>
    );
  }

  if (ownerBookingsData.status === "no_rooms") {
    return (
      <div className="space-y-8">
        {feedbackToast}
        <OwnerPageHeader
          eyebrow="Bookings"
          title="Add rooms before booking operations begin"
          description="Guest stays will start appearing here as soon as your property has rooms ready to welcome bookings."
          actions={
            <Link href="/owner/add-room" className="button-primary min-h-11 px-5">
              Add first room
            </Link>
          }
        />
      </div>
    );
  }

  if (ownerBookingsData.status === "empty") {
    return (
      <div className="space-y-8">
        {feedbackToast}
        <OwnerPageHeader
          eyebrow="Bookings"
          title="Your booking desk is ready"
          description="Rooms are connected and the desk is prepared. Guest stays will appear here automatically as soon as bookings begin."
          actions={
            <>
              <Link href="/owner" className="button-secondary min-h-11 px-5">
                Back to dashboard
              </Link>
              <Link href="/owner/list-room" className="button-primary min-h-11 px-5">
                Room collection
              </Link>
            </>
          }
        />

        <section className="rounded-[32px] border border-[rgba(205,220,236,0.96)] bg-white/96 p-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            What will appear here
          </p>
          <div className="mt-4 space-y-3 text-sm leading-8 text-[var(--color-muted)]">
            <p>1. Bookings tied only to rooms owned by this account.</p>
            <p>2. Booking status and payment status for every reservation.</p>
            <p>3. Clear actions to confirm, cancel, or complete each stay.</p>
          </div>
        </section>
      </div>
    );
  }

  const stats = [
    {
      label: "Total bookings",
      value: ownerBookingsData.bookings.length,
      tone: "accent",
    },
    {
      label: "Pending review",
      value: pendingCount,
      tone: "warm",
    },
    {
      label: "Confirmed stays",
      value: confirmedCount,
      tone: "success",
    },
    {
      label: "Paid stays",
      value: paidCount,
      tone: "neutral",
    },
  ];

  return (
    <div className="space-y-8">
      {feedbackToast}
      <OwnerPageHeader
        eyebrow="Bookings"
        title="Care for every guest stay with clarity"
        description="Review incoming stays, keep payment visibility clear, and move reservations forward from one quieter operational view."
        actions={
          <>
            <Link href="/owner" className="button-secondary min-h-11 px-5">
              Back to dashboard
            </Link>
            <Link href="/owner/list-room" className="button-primary min-h-11 px-5">
              Room collection
            </Link>
          </>
        }
      />

      <OwnerStatGrid items={stats} />

      <section className="rounded-[32px] border border-[rgba(205,220,236,0.96)] bg-white/96 p-5 shadow-[var(--shadow-soft)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
              Booking desk
            </p>
            <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
              Active guest stays
            </h2>
          </div>

          <p className="text-sm leading-7 text-[var(--color-muted)]">
            Compare status, payment progress, and next actions without scanning oversized cards.
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-[rgba(250,252,254,0.96)]">
          {ownerBookingsData.bookings.map((booking, index) => (
            <div
              key={booking._id}
              className={index === 0 ? "" : "border-t border-[var(--color-line)]"}
            >
              <BookingRow booking={booking} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
