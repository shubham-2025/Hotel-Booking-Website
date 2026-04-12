export function getSafeRedirectTarget(value, fallback = "/") {
  if (typeof value !== "string" || value.length === 0) {
    return fallback;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  if (
    value === "/sign-in" ||
    value === "/sign-up" ||
    value === "/login" ||
    value === "/create-account" ||
    value === "/forgot-password" ||
    value === "/reset-password"
  ) {
    return fallback;
  }

  return value;
}
