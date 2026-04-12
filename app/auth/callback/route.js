import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/backend/auth/supabase-server-client";
import { getSafeRedirectTarget } from "@/src/backend/auth/get-safe-redirect-target";

function getReturnPath(intent) {
  if (intent === "sign-up") {
    return "/create-account";
  }

  if (intent === "password-reset") {
    return "/forgot-password";
  }

  return "/login";
}

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const intent = requestUrl.searchParams.get("intent") || "sign-in";
  const rawNext = requestUrl.searchParams.get("next");
  const next =
    intent === "password-reset"
      ? rawNext === "/reset-password"
        ? "/reset-password"
        : "/reset-password"
      : getSafeRedirectTarget(rawNext, "/");
  const returnPath = getReturnPath(intent);
  const authError = requestUrl.searchParams.get("error");
  const callbackErrorCode =
    intent === "password-reset" ? "reset_failed" : "oauth_failed";

  if (authError) {
    return NextResponse.redirect(
      new URL(
        `${returnPath}?error=${callbackErrorCode}&next=${encodeURIComponent(next)}`,
        requestUrl.origin,
      ),
    );
  }

  const supabase = await createSupabaseServerClient();

  if (!code || !supabase) {
    return NextResponse.redirect(
      new URL(
        `${returnPath}?error=auth_unavailable&next=${encodeURIComponent(next)}`,
        requestUrl.origin,
      ),
    );
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(
        `${returnPath}?error=${callbackErrorCode}&next=${encodeURIComponent(next)}`,
        requestUrl.origin,
      ),
    );
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
