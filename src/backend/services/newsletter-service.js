import { ZodError } from "zod";
import { env } from "@/src/backend/config/env";
import { getResendClient } from "@/src/backend/email/resend-client";
import { saveNewsletterSubscriber } from "@/src/backend/repositories/newsletter-subscribers-repository";
import { newsletterSchema } from "@/src/backend/validation/newsletter.schema";

export async function handleNewsletterPost(request) {
  try {
    const payload = newsletterSchema.parse(await request.json());
    const resend = getResendClient();

    const storedInDatabase = await saveNewsletterSubscriber({
      email: payload.email,
      source: "website",
    });

    let emailQueued = false;

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
      return {
        status: 503,
        body: {
          message:
            "Newsletter route is ready, but Supabase/Resend environment variables still need to be configured.",
        },
      };
    }

    return {
      status: 200,
      body: {
        message: storedInDatabase
          ? "Subscriber saved. Once emails are configured, notifications can fan out automatically."
          : "Subscriber captured through email notification flow.",
      },
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        status: 400,
        body: {
          message: "Please enter a valid email address.",
        },
      };
    }

    return {
      status: 500,
      body: {
        message: "Unable to save this subscriber right now.",
      },
    };
  }
}
