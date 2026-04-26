import { ZodError } from "zod";
import { env } from "@/src/backend/config/env";
import {
  renderTransactionalEmail,
  sendTransactionalEmail,
} from "@/src/backend/email/transactional-email";
import { saveNewsletterSubscriber } from "@/src/backend/repositories/newsletter-subscribers-repository";
import { newsletterSchema } from "@/src/backend/validation/newsletter.schema";

export async function handleNewsletterPost(request) {
  try {
    const payload = newsletterSchema.parse(await request.json());

    const storedInDatabase = await saveNewsletterSubscriber({
      email: payload.email,
      source: "website",
    });

    let emailQueued = false;

    if (env.notificationEmail) {
      emailQueued = await sendTransactionalEmail({
        to: env.notificationEmail,
        subject: "New newsletter subscriber",
        html: renderTransactionalEmail({
          preheader: "A new traveler joined the newsletter.",
          eyebrow: "Newsletter",
          accentLabel: "New subscriber",
          title: "A traveler joined your email list",
          lead: "QuickStay captured a fresh newsletter signup from the website.",
          summaryRows: [
            {
              label: "Subscriber email",
              value: payload.email,
            },
            {
              label: "Source",
              value: "Website newsletter form",
            },
          ],
          closingText:
            "This message was triggered automatically from the live newsletter signup flow.",
        }),
        text: `New subscriber: ${payload.email}`,
      });
    }

    if (!storedInDatabase && !emailQueued) {
      return {
        status: 503,
        body: {
          message:
            "Newsletter route is ready, but Supabase/email environment variables still need to be configured.",
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
