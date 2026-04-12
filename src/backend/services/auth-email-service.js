import { env } from "@/src/backend/config/env";
import { getResendClient } from "@/src/backend/email/resend-client";

export async function sendWelcomeLoginEmail({ email, fullName }) {
  const resend = getResendClient();

  if (!resend || !email) {
    return false;
  }

  const loginUrl = new URL("/login", env.siteUrl).toString();
  const safeName = fullName || "there";

  await resend.emails.send({
    from: env.resendFromEmail,
    to: email,
    subject: "Your QuickStay account is ready",
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

  return true;
}