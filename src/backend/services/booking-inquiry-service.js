import { ZodError } from "zod";
import { env } from "@/src/backend/config/env";
import {
  escapeEmailHtml,
  renderTransactionalEmail,
  sendTransactionalEmail,
} from "@/src/backend/email/transactional-email";
import { saveBookingInquiry } from "@/src/backend/repositories/booking-inquiries-repository";
import { bookingInquirySchema } from "@/src/backend/validation/booking-inquiry.schema";

export async function handleBookingInquiryPost(request) {
  try {
    const payload = bookingInquirySchema.parse(await request.json());

    const storedInDatabase = await saveBookingInquiry(payload);

    let emailQueued = false;

    if (env.notificationEmail) {
      emailQueued = await sendTransactionalEmail({
        to: env.notificationEmail,
        subject: `Booking inquiry for ${payload.hotelName}`,
        html: renderTransactionalEmail({
          preheader: "A traveler submitted a new booking inquiry.",
          eyebrow: "Inquiry received",
          accentLabel: "New lead",
          title: "A new traveler wants this stay",
          lead: `QuickStay captured a booking inquiry for ${payload.hotelName}. Review the details below and continue the conversation by email.`,
          summaryRows: [
            {
              label: "Traveler",
              value: payload.name,
            },
            {
              label: "Traveler email",
              value: payload.email,
            },
            {
              label: "Phone",
              value: payload.phone || "-",
            },
            {
              label: "Hotel",
              value: payload.hotelName,
            },
            {
              label: "Room",
              value: payload.roomType,
            },
            {
              label: "Check-in",
              value: payload.checkInDate,
            },
            {
              label: "Check-out",
              value: payload.checkOutDate,
            },
            {
              label: "Guests",
              value: `${payload.guests}`,
            },
          ],
          contentBlocks: [
            {
              title: "Traveler notes",
              html: `<p style="margin: 0;">${escapeEmailHtml(
                payload.message || "No extra notes were shared in this inquiry.",
              )}</p>`,
            },
          ],
          closingText:
            "This message came from the public booking inquiry flow, not from a confirmed booking.",
        }),
        text: [
          `Name: ${payload.name}`,
          `Email: ${payload.email}`,
          `Phone: ${payload.phone || "-"}`,
          `Room: ${payload.roomType}`,
          `Check-in: ${payload.checkInDate}`,
          `Check-out: ${payload.checkOutDate}`,
          `Guests: ${payload.guests}`,
          `Notes: ${payload.message || "-"}`,
        ].join("\n"),
      });
    }

    if (!storedInDatabase && !emailQueued) {
      return {
        status: 503,
        body: {
          message:
            "Inquiry route is ready, but Supabase/email environment variables still need to be configured.",
        },
      };
    }

    return {
      status: 200,
      body: {
        message:
          "Inquiry submitted successfully. We can now persist booking interest and trigger email notifications from the same backend flow.",
      },
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        status: 400,
        body: {
          message: "Please complete the required inquiry fields.",
        },
      };
    }

    return {
      status: 500,
      body: {
        message: "Unable to submit your inquiry right now.",
      },
    };
  }
}
