export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || "",
  smtpPassword: process.env.SMTP_PASSWORD || "",
  smtpFromEmail: process.env.SMTP_FROM_EMAIL || process.env.NOTIFICATION_EMAIL || "",
  smtpFromName: process.env.SMTP_FROM_NAME || "QuickStay",
  smtpReplyToEmail:
    process.env.SMTP_REPLY_TO_EMAIL || process.env.NOTIFICATION_EMAIL || "",
  resendApiKey: process.env.RESEND_API_KEY || "",
  resendFromEmail:
    process.env.RESEND_FROM_EMAIL || "QuickStay <onboarding@resend.dev>",
  notificationEmail: process.env.NOTIFICATION_EMAIL || "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
};

export function hasSupabasePublicEnv() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function hasSupabaseServiceEnv() {
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
}

export function hasResendEnv() {
  return Boolean(env.resendApiKey);
}

export function hasSmtpEnv() {
  return Boolean(
    env.smtpHost &&
      env.smtpPort &&
      env.smtpUser &&
      env.smtpPassword &&
      env.smtpFromEmail,
  );
}

export function hasStripeSecretEnv() {
  return Boolean(env.stripeSecretKey);
}

export function hasStripePaymentEnv() {
  return Boolean(env.stripeSecretKey);
}

export function hasStripeWebhookEnv() {
  return Boolean(env.stripeSecretKey && env.stripeWebhookSecret);
}

export function hasBookingPaymentEnv() {
  return Boolean(hasSupabaseServiceEnv() && hasStripePaymentEnv());
}
