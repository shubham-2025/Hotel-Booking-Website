import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/src/backend/config/env";

function getInvoiceSigningSecret() {
  return env.supabaseServiceRoleKey || env.stripeSecretKey || "";
}

function buildInvoiceTokenPayload(bookingId, travelerId) {
  return `${bookingId || ""}:${travelerId || ""}`;
}

export function buildBookingInvoiceAccessToken(bookingId, travelerId) {
  const signingSecret = getInvoiceSigningSecret();

  if (!bookingId || !travelerId || !signingSecret) {
    return "";
  }

  return createHmac("sha256", signingSecret)
    .update(buildInvoiceTokenPayload(bookingId, travelerId))
    .digest("hex");
}

export function isBookingInvoiceAccessTokenValid(
  bookingId,
  travelerId,
  accessToken,
) {
  const expectedToken = buildBookingInvoiceAccessToken(bookingId, travelerId);

  if (!expectedToken || !accessToken || expectedToken.length !== accessToken.length) {
    return false;
  }

  try {
    return timingSafeEqual(
      Buffer.from(expectedToken, "utf8"),
      Buffer.from(accessToken, "utf8"),
    );
  } catch {
    return false;
  }
}

export function buildBookingInvoiceUrl(
  bookingId,
  travelerId,
  { download = false } = {},
) {
  if (!bookingId) {
    return "";
  }

  const url = new URL(`/my-bookings/invoices/${bookingId}`, env.siteUrl);
  const accessToken = buildBookingInvoiceAccessToken(bookingId, travelerId);

  if (accessToken) {
    url.searchParams.set("access", accessToken);
  }

  if (download) {
    url.searchParams.set("download", "1");
  }

  return url.toString();
}
