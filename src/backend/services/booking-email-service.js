import { env } from "@/src/backend/config/env";
import {
  escapeEmailHtml,
  formatCurrency,
  formatDate,
  formatStatusLabel,
  renderTransactionalEmail,
  sendTransactionalEmail,
} from "@/src/backend/email/transactional-email";

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

function buildBookingSummaryRows(context) {
  return [
    {
      label: "Hotel",
      value: context.hotel?.name || "Hotel unavailable",
    },
    {
      label: "Room",
      value: getRoomLabel(context),
    },
    {
      label: "Check-in",
      value: formatDate(context.booking?.checkInDate),
    },
    {
      label: "Check-out",
      value: formatDate(context.booking?.checkOutDate),
    },
    {
      label: "Guests",
      value: `${context.booking?.guests || 0}`,
    },
    {
      label: "Total price",
      value: formatCurrency(context.booking?.totalPrice),
    },
    {
      label: "Booking status",
      value: formatStatusLabel(context.booking?.status),
    },
    {
      label: "Payment status",
      value: formatStatusLabel(context.booking?.paymentStatus),
    },
  ];
}

function buildLocationHtml(context) {
  if (!context.hotel?.city && !context.hotel?.address) {
    return "<p style=\"margin: 0;\">Location details will be available inside your booking dashboard.</p>";
  }

  return `
    <p style="margin: 0;">
      ${escapeEmailHtml(context.hotel?.city || "")}
      ${context.hotel?.city && context.hotel?.address ? " | " : ""}
      ${escapeEmailHtml(context.hotel?.address || "")}
    </p>`;
}

function buildNotesHtml(context) {
  return `
    <p style="margin: 0;">
      ${escapeEmailHtml(context.booking?.notes || "No extra notes were attached to this booking.")}
    </p>`;
}

function buildTravelerEmailPayload({
  context,
  subject,
  eyebrow,
  accentLabel,
  title,
  lead,
  tone = "accent",
  closingText,
}) {
  return {
    to: context.traveler?.email || "",
    subject,
    html: renderTransactionalEmail({
      preheader: lead,
      eyebrow,
      accentLabel,
      title,
      lead,
      tone,
      summaryRows: buildBookingSummaryRows(context),
      contentBlocks: [
        {
          title: "Property details",
          html: buildLocationHtml(context),
        },
        {
          title: "Booking notes",
          html: buildNotesHtml(context),
        },
      ],
      actionLabel: "View my booking",
      actionUrl: getTravelerBookingsUrl(),
      closingText,
    }),
    text: [
      getTravelerGreeting(context.traveler?.fullName || ""),
      "",
      lead,
      "",
      ...buildBookingSummaryRows(context).map(
        (row) => `${row.label}: ${row.value}`,
      ),
      "",
      `Property details: ${context.hotel?.city || ""}${context.hotel?.city && context.hotel?.address ? " | " : ""}${context.hotel?.address || ""}`,
      `Booking notes: ${context.booking?.notes || "-"}`,
      "",
      "View your booking here:",
      getTravelerBookingsUrl(),
      "",
      closingText,
    ].join("\n"),
  };
}

function buildOwnerEmailPayload({
  context,
  subject,
  eyebrow,
  accentLabel,
  title,
  lead,
  tone = "accent",
  closingText,
}) {
  const ownerRecipient =
    context.owner?.email || context.hotel?.contactEmail || env.notificationEmail;

  return {
    to: ownerRecipient,
    subject,
    html: renderTransactionalEmail({
      preheader: lead,
      eyebrow,
      accentLabel,
      title,
      lead,
      tone,
      summaryRows: [
        {
          label: "Traveler",
          value:
            context.traveler?.fullName ||
            context.traveler?.email ||
            "Authenticated traveler",
        },
        {
          label: "Traveler email",
          value: context.traveler?.email || "-",
        },
        ...buildBookingSummaryRows(context),
      ],
      contentBlocks: [
        {
          title: "Hotel address",
          html: buildLocationHtml(context),
        },
        {
          title: "Traveler notes",
          html: buildNotesHtml(context),
        },
      ],
      actionLabel: "Open booking desk",
      actionUrl: getOwnerBookingsUrl(),
      closingText,
    }),
    text: [
      lead,
      "",
      `Traveler: ${context.traveler?.fullName || "Authenticated traveler"}`,
      `Traveler email: ${context.traveler?.email || "-"}`,
      ...buildBookingSummaryRows(context).map(
        (row) => `${row.label}: ${row.value}`,
      ),
      "",
      `Traveler notes: ${context.booking?.notes || "-"}`,
      "",
      "Open the owner booking desk here:",
      getOwnerBookingsUrl(),
      "",
      closingText,
    ].join("\n"),
  };
}

function getStatusEmailCopy(event) {
  if (event === "confirmed") {
    return {
      subjectPrefix: "confirmed",
      accentLabel: "Confirmed",
      title: "Your stay is confirmed",
      lead: "The hotel has confirmed your booking and your stay window is now locked in.",
      tone: "success",
    };
  }

  if (event === "cancelled") {
    return {
      subjectPrefix: "cancelled",
      accentLabel: "Cancelled",
      title: "Your booking was cancelled",
      lead: "The hotel has cancelled this booking. Review the booking page for the latest status details.",
      tone: "danger",
    };
  }

  return {
    subjectPrefix: "completed",
    accentLabel: "Completed",
    title: "Your stay has been completed",
    lead: "The hotel has marked this booking as completed. Thank you for staying with QuickStay.",
    tone: "accent",
  };
}

export async function sendBookingCreatedEmails(context) {
  if (!context) {
    return {
      traveler: false,
      owner: false,
    };
  }

  const travelerResult = await sendTransactionalEmail(
    buildTravelerEmailPayload({
      context,
      subject: `Your QuickStay booking is pending at ${context.hotel?.name || "QuickStay"}`,
      eyebrow: "Booking received",
      accentLabel: "Pending",
      title: "Your booking request is in",
      lead: "Your stay has been created and saved as a pending reservation while the hotel reviews it.",
      closingText:
        "We will email you again as soon as the hotel confirms, cancels, or completes this booking.",
    }),
  );

  const ownerResult = await sendTransactionalEmail(
    buildOwnerEmailPayload({
      context,
      subject: `New booking for ${context.hotel?.name || "your hotel"}`,
      eyebrow: "New reservation",
      accentLabel: "Action needed",
      title: "A new booking needs review",
      lead: "A traveler just created a new booking. Review it in the owner booking desk and move it forward when you're ready.",
      closingText:
        "This notification was triggered automatically from the live QuickStay booking flow.",
    }),
  );

  return {
    traveler: travelerResult,
    owner: ownerResult,
  };
}

export async function sendBookingStatusEmail(context) {
  if (!context || !context.traveler?.email) {
    return false;
  }

  const copy = getStatusEmailCopy(context.event);

  return sendTransactionalEmail(
    buildTravelerEmailPayload({
      context,
      subject: `Your QuickStay booking is ${copy.subjectPrefix} at ${context.hotel?.name || "QuickStay"}`,
      eyebrow: "Booking update",
      accentLabel: copy.accentLabel,
      title: copy.title,
      lead: copy.lead,
      tone: copy.tone,
      closingText: "You can always review the latest stay and payment details in your QuickStay booking page.",
    }),
  );
}

export async function sendBookingPaymentEmails(context) {
  if (!context) {
    return {
      traveler: false,
      owner: false,
    };
  }

  const travelerResult = context.traveler?.email
    ? await sendTransactionalEmail(
        buildTravelerEmailPayload({
          context,
          subject: `Payment received for your QuickStay booking at ${context.hotel?.name || "QuickStay"}`,
          eyebrow: "Payment received",
          accentLabel: "Paid",
          title: "Your booking payment is complete",
          lead: `We received your payment${context.booking?.paymentMethod ? ` via ${formatStatusLabel(context.booking.paymentMethod)}` : ""}. Your booking now shows as paid in your traveler account.`,
          tone: "success",
          closingText:
            "Keep this email for your records, and open your booking page anytime if you want to review the latest stay details.",
        }),
      )
    : false;

  const ownerResult = await sendTransactionalEmail(
    buildOwnerEmailPayload({
      context,
      subject: `Payment received for booking at ${context.hotel?.name || "your hotel"}`,
      eyebrow: "Payment update",
      accentLabel: "Paid",
      title: "A booking payment was received",
      lead: "A traveler completed payment for an active booking. The owner booking desk now reflects the updated paid status.",
      tone: "success",
      closingText:
        "You can continue managing this reservation from the owner booking desk whenever needed.",
    }),
  );

  return {
    traveler: travelerResult,
    owner: ownerResult,
  };
}
