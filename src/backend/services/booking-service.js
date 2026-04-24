import { ZodError } from "zod";
import { createBookingRecord } from "@/src/backend/repositories/bookings-repository";
import { sendBookingCreatedEmails } from "@/src/backend/services/booking-email-service";
import { bookingCreateSchema } from "@/src/backend/validation/booking-create.schema";

export async function handleBookingPost(request) {
  try {
    const payload = bookingCreateSchema.parse(await request.json());
    const result = await createBookingRecord(payload);

    if (result.status === "created") {
      try {
        await sendBookingCreatedEmails(result.notificationContext);
      } catch (error) {
        console.error("sendBookingCreatedEmails failed", error);
      }

      return {
        status: 201,
        body: {
          message:
            "Your booking has been created and saved as a pending reservation.",
          booking: result.booking,
        },
      };
    }

    if (result.status === "unauthenticated") {
      return {
        status: 401,
        body: {
          message: result.reason,
        },
      };
    }

    if (
      result.status === "not_bookable" ||
      result.status === "conflict" ||
      result.status === "invalid_dates" ||
      result.status === "invalid_guests"
    ) {
      return {
        status: result.status === "conflict" ? 409 : 400,
        body: {
          message: result.reason,
        },
      };
    }

    return {
      status: 503,
      body: {
        message:
          result.reason ||
          "Booking creation is temporarily unavailable right now.",
      },
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        status: 400,
        body: {
          message: "Please complete the required booking details correctly.",
        },
      };
    }

    console.error("handleBookingPost failed", error);

    return {
      status: 500,
      body: {
        message: "Unable to create your booking right now.",
      },
    };
  }
}
