import { env } from "@/src/backend/config/env";
import { getResendClient } from "@/src/backend/email/resend-client";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getTravelerGreeting(fullName) {
  return fullName ? `Hi ${fullName},` : "Hi there,";
}

function getRoomLabel(context) {
  return context?.room?.name || context?.room?.roomType || "Booked room";
}

function getTravelerBookingsUrl() {
  return new URL("/my-bookings", env.siteUrl).toString();
}

function getOwnerBookingsUrl() {
  return new URL("/owner/bookings", env.siteUrl).toString();
}

async function sendTextEmail({ to, subject, lines }) {
  const resend = getResendClient();

  if (!resend || !to) {
    return false;
  }

  try {
    await resend.emails.send({
      from: env.resendFromEmail,
      to,
      subject,
      text: lines.join("\n"),
    });

    return true;
  } catch (error) {
    console.error("sendTextEmail failed", {
      to,
      subject,
      error,
    });
    return false;
  }
}

function buildBookingSummaryLines(context) {
  return [
    `Hotel: ${context.hotel?.name || "Hotel unavailable"}`,
    `Room: ${getRoomLabel(context)}`,
    `Check-in: ${formatDate(context.booking?.checkInDate)}`,
    `Check-out: ${formatDate(context.booking?.checkOutDate)}`,
    `Guests: ${context.booking?.guests || 0}`,
    `Total price: ${formatCurrency(context.booking?.totalPrice)}`,
    `Booking status: ${context.booking?.status || "unknown"}`,
    `Payment status: ${context.booking?.paymentStatus || "unknown"}`,
    `Notes: ${context.booking?.notes || "-"}`,
  ];
}

export async function sendBookingCreatedEmails(context) {
  if (!context) {
    return {
      traveler: false,
      owner: false,
    };
  }

  const travelerResult = await sendTextEmail({
    to: context.traveler?.email || "",
    subject: `Your QuickStay booking is pending at ${context.hotel?.name || "QuickStay"}`,
    lines: [
      getTravelerGreeting(context.traveler?.fullName || ""),
      "",
      "Your booking has been created and saved as a pending reservation.",
      "",
      ...buildBookingSummaryLines(context),
      "",
      "You can review this booking here:",
      getTravelerBookingsUrl(),
    ],
  });

  const ownerRecipient =
    context.owner?.email || context.hotel?.contactEmail || env.notificationEmail;
  const ownerResult = await sendTextEmail({
    to: ownerRecipient,
    subject: `New booking for ${context.hotel?.name || "your hotel"}`,
    lines: [
      "A new QuickStay booking has been created.",
      "",
      `Traveler: ${context.traveler?.fullName || "-"}`,
      `Traveler email: ${context.traveler?.email || "-"}`,
      ...buildBookingSummaryLines(context),
      "",
      "Review this booking in the owner booking desk:",
      getOwnerBookingsUrl(),
    ],
  });

  return {
    traveler: travelerResult,
    owner: ownerResult,
  };
}

function getStatusEmailCopy(event) {
  if (event === "confirmed") {
    return {
      subjectPrefix: "confirmed",
      intro: "Your booking has been confirmed by the hotel.",
    };
  }

  if (event === "cancelled") {
    return {
      subjectPrefix: "cancelled",
      intro: "Your booking has been cancelled by the hotel.",
    };
  }

  return {
    subjectPrefix: "completed",
    intro: "Your booking has been marked as completed.",
  };
}

export async function sendBookingStatusEmail(context) {
  if (!context || !context.traveler?.email) {
    return false;
  }

  const copy = getStatusEmailCopy(context.event);

  return sendTextEmail({
    to: context.traveler.email,
    subject: `Your QuickStay booking is ${copy.subjectPrefix} at ${context.hotel?.name || "QuickStay"}`,
    lines: [
      getTravelerGreeting(context.traveler?.fullName || ""),
      "",
      copy.intro,
      "",
      ...buildBookingSummaryLines(context),
      "",
      "You can review your latest booking details here:",
      getTravelerBookingsUrl(),
    ],
  });
}
