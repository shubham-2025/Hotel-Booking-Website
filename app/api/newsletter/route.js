import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { getResendClient } from "@/lib/resend";

const newsletterSchema = z.object({
  email: z.email(),
});

export async function POST(request) {
  try {
    const payload = newsletterSchema.parse(await request.json());
    const supabase = createSupabaseAdminClient();
    const resend = getResendClient();

    let storedInDatabase = false;
    let emailQueued = false;

    if (supabase) {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .upsert(
          {
            email: payload.email,
            source: "website",
          },
          { onConflict: "email" },
        );

      if (error) {
        throw error;
      }

      storedInDatabase = true;
    }

    if (resend && env.notificationEmail) {
      await resend.emails.send({
        from: env.resendFromEmail,
        to: env.notificationEmail,
        subject: "New newsletter subscriber",
        text: `New subscriber: ${payload.email}`,
      });

      emailQueued = true;
    }

    if (!storedInDatabase && !emailQueued) {
      return NextResponse.json(
        {
          message:
            "Newsletter route is ready, but Supabase/Resend environment variables still need to be configured.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      message: storedInDatabase
        ? "Subscriber saved. Once emails are configured, notifications can fan out automatically."
        : "Subscriber captured through email notification flow.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        message: "Unable to save this subscriber right now.",
      },
      { status: 500 },
    );
  }
}
