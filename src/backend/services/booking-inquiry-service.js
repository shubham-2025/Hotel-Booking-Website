import { ZodError } from "zod";
import { env } from "@/src/backend/config/env";
import { getResendClient } from "@/src/backend/email/resend-client";
import { saveBookingInquiry } from "@/src/backend/repositories/booking-inquiries-repository";
import { bookingInquirySchema } from "@/src/backend/validation/booking-inquiry.schema";

export async function handleBookingInquiryPost(request) {
  try {
    const payload = bookingInquirySchema.parse(await request.json());
    const resend = getResendClient();

    const storedInDatabase = await saveBookingInquiry(payload);

    let emailQueued = false;

    if (resend && env.notificationEmail) {
      await resend.emails.send({
        from: env.resendFromEmail,
        to: env.notificationEmail,
        subject: `Booking inquiry for ${payload.hotelName}`,
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

      emailQueued = true;
    }

    if (!storedInDatabase && !emailQueued) {
      return {
        status: 503,
        body: {
          message:
            "Inquiry route is ready, but Supabase/Resend environment variables still need to be configured.",
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
