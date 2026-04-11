import { NextResponse } from "next/server";
import { handleBookingInquiryPost } from "@/src/backend/services/booking-inquiry-service";

export async function POST(request) {
  const response = await handleBookingInquiryPost(request);
  return NextResponse.json(response.body, { status: response.status });
}
