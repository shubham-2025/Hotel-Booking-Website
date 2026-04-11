import { NextResponse } from "next/server";
import { handleNewsletterPost } from "@/src/backend/services/newsletter-service";

export async function POST(request) {
  const response = await handleNewsletterPost(request);
  return NextResponse.json(response.body, { status: response.status });
}
