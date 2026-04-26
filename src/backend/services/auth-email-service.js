import { env } from "@/src/backend/config/env";
import {
  renderTransactionalEmail,
  sendTransactionalEmail,
} from "@/src/backend/email/transactional-email";

export async function sendWelcomeLoginEmail({ email, fullName }) {
  if (!email) {
    return false;
  }

  const loginUrl = new URL("/login", env.siteUrl).toString();
  const safeName = fullName || "there";

  return sendTransactionalEmail({
    to: email,
    subject: "Your QuickStay account is ready",
    html: renderTransactionalEmail({
      preheader: "Your QuickStay account has been created successfully.",
      eyebrow: "Account ready",
      accentLabel: "Welcome",
      title: "Your QuickStay account is live",
      lead: `Hi ${safeName}, your account has been created successfully. Use the button below to sign in and continue booking stays.`,
      tone: "success",
      summaryRows: [
        {
          label: "Account email",
          value: email,
        },
        {
          label: "Status",
          value: "Ready to sign in",
        },
      ],
      contentBlocks: [
        {
          title: "Security note",
          html: "<p style=\"margin: 0;\">If email confirmation is enabled in Supabase, please verify your email address before signing in.</p>",
        },
      ],
      actionLabel: "Go to login",
      actionUrl: loginUrl,
      closingText: "Thanks for joining QuickStay.",
    }),
    text: [
      `Hi ${safeName},`,
      "",
      "Your QuickStay account has been created.",
      "Use the password you chose during signup to log in here:",
      loginUrl,
      "",
      "If email confirmation is enabled in Supabase, please verify your email before signing in.",
    ].join("\n"),
  });
}
