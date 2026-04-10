import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { getResendClient } from "@/lib/resend";

const inquirySchema = z.object({
  roomId: z.string().min(1),
  hotelId: z.string().min(1),
  hotelName: z.string().min(1),
  roomType: z.string().min(1),
  name: z.string().min(2),
  email: z.email(),
  phone: z.string().optional().default(""),
  checkInDate: z.iso.date(),
  checkOutDate: z.iso.date(),
  guests: z.coerce.number().int().min(1).max(8),
  message: z.string().optional().default(""),
});

export async function POST(request) {
  try {
    const payload = inquirySchema.parse(await request.json());
    const supabase = createSupabaseAdminClient();
    const resend = getResendClient();

    let storedInDatabase = false;
    let emailQueued = false;

    if (supabase) {
      const { error } = await supabase.from("booking_inquiries").insert({
        room_id: payload.roomId,
        hotel_id: payload.hotelId,
        guest_name: payload.name,
        guest_email: payload.email,
        guest_phone: payload.phone,
        check_in_date: payload.checkInDate,
        check_out_date: payload.checkOutDate,
        guests: payload.guests,
        message: payload.message,
      });

      if (error) {
        throw error;
      }

      storedInDatabase = true;
    }

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
      return NextResponse.json(
        {
          message:
            "Inquiry route is ready, but Supabase/Resend environment variables still need to be configured.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      message:
        "Inquiry submitted successfully. We can now persist booking interest and trigger email notifications from the same backend flow.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Please complete the required inquiry fields." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        message: "Unable to submit your inquiry right now.",
      },
      { status: 500 },
    );
  }
}
