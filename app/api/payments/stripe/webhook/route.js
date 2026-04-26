import { NextResponse } from "next/server";
import { handleStripeWebhook } from "@/src/backend/services/booking-payment-service";

export const runtime = "nodejs";

export async function POST(request) {
  const response = await handleStripeWebhook(request);
  return NextResponse.json(response.body, { status: response.status });
}
