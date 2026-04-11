import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/backend/auth/supabase-server-client";
import { getSafeRedirectTarget } from "@/src/backend/auth/get-safe-redirect-target";

function getReturnPath(intent) {
  return intent === "sign-up" ? "/sign-up" : "/sign-in";
}

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeRedirectTarget(requestUrl.searchParams.get("next"), "/");
  const intent = requestUrl.searchParams.get("intent") || "sign-in";
  const returnPath = getReturnPath(intent);
  const authError = requestUrl.searchParams.get("error");

  if (authError) {
    return NextResponse.redirect(
      new URL(`${returnPath}?error=oauth_failed&next=${encodeURIComponent(next)}`, requestUrl.origin),
    );
  }

  const supabase = await createSupabaseServerClient();

  if (!code || !supabase) {
    return NextResponse.redirect(
      new URL(`${returnPath}?error=auth_unavailable&next=${encodeURIComponent(next)}`, requestUrl.origin),
    );
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`${returnPath}?error=oauth_failed&next=${encodeURIComponent(next)}`, requestUrl.origin),
    );
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
