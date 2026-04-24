"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "@/src/backend/auth/auth-errors";
import { updateOwnerBookingStatus } from "@/src/backend/repositories/owner-repository";
import { sendBookingStatusEmail } from "@/src/backend/services/booking-email-service";

const ALLOWED_NEXT_STATUSES = new Set(["confirmed", "cancelled", "completed"]);
const NOTICE_CODES_BY_STATUS = {
  confirmed: "booking_confirmed",
  cancelled: "booking_cancelled",
  completed: "booking_completed",
};

function buildOwnerBookingsRedirect(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string" && value.length > 0) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `/owner/bookings?${query}` : "/owner/bookings";
}

function getFieldValue(formData, key) {
  return String(formData.get(key) || "").trim();
}

export async function updateOwnerBookingStatusAction(formData) {
  const bookingId = getFieldValue(formData, "bookingId");
  const nextStatus = getFieldValue(formData, "nextStatus");

  if (!bookingId || !ALLOWED_NEXT_STATUSES.has(nextStatus)) {
    redirect(buildOwnerBookingsRedirect({ error: "invalid_action" }));
  }

  let result;

  try {
    result = await updateOwnerBookingStatus(bookingId, nextStatus);
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/");
    }

    console.error("updateOwnerBookingStatusAction failed", error);
    redirect(buildOwnerBookingsRedirect({ error: "update_failed" }));
  }

  if (result.status === "updated") {
    try {
      await sendBookingStatusEmail(result.notificationContext);
    } catch (error) {
      console.error("sendBookingStatusEmail failed", error);
    }

    revalidatePath("/owner");
    revalidatePath("/owner/bookings");
    revalidatePath("/my-bookings");
    redirect(
      buildOwnerBookingsRedirect({
        notice: NOTICE_CODES_BY_STATUS[nextStatus] || "booking_updated",
      }),
    );
  }

  if (result.status === "not_found") {
    redirect(buildOwnerBookingsRedirect({ error: "booking_not_found" }));
  }

  if (result.status === "invalid_transition") {
    redirect(buildOwnerBookingsRedirect({ error: "invalid_transition" }));
  }

  redirect(buildOwnerBookingsRedirect({ error: "update_failed" }));
}
