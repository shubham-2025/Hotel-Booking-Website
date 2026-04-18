import { NextResponse } from "next/server";
import { handleBookingPost } from "@/src/backend/services/booking-service";

export async function POST(request) {
  const response = await handleBookingPost(request);
  return NextResponse.json(response.body, { status: response.status });
}
