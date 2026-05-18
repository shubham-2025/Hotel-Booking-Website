function normalizeAbsoluteUrl(value) {
  const trimmedValue = String(value || "").trim();

  if (!trimmedValue) {
    return "";
  }

  if (
    trimmedValue.startsWith("http://") ||
    trimmedValue.startsWith("https://")
  ) {
    return trimmedValue.replace(/\/$/, "");
  }

  return `https://${trimmedValue.replace(/\/$/, "")}`;
}

function resolveSiteUrl() {
  return (
    normalizeAbsoluteUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    normalizeAbsoluteUrl(process.env.SITE_URL) ||
    normalizeAbsoluteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    normalizeAbsoluteUrl(process.env.VERCEL_URL) ||
    "http://localhost:3000"
  );
}

function resolveSupabaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ""
  );
}

function resolveSupabaseAnonKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ""
  );
}

export const env = {
  siteUrl: resolveSiteUrl(),
  supabaseUrl: resolveSupabaseUrl(),
  supabaseAnonKey: resolveSupabaseAnonKey(),
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
