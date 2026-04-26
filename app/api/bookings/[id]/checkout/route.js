import { NextResponse } from "next/server";
import { handleBookingCheckoutPost } from "@/src/backend/services/booking-payment-service";

export async function POST(_request, context) {
  const params = await context.params;
  const response = await handleBookingCheckoutPost(params?.id || "");
  return NextResponse.json(response.body, { status: response.status });
}
