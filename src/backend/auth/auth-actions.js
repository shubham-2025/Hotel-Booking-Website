"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase-server-client";
import { env } from "./../config/env";
import { getSafeRedirectTarget } from "./get-safe-redirect-target";
import { sendWelcomeLoginEmail } from "@/src/backend/services/auth-email-service";

function buildRedirect(pathname, params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string" && value.length > 0) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export async function signInAction(formData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const next = getSafeRedirectTarget(String(formData.get("next") || ""), "/");

  if (!email || !password) {
    redirect(buildRedirect("/login", { error: "missing_fields", next }));
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(buildRedirect("/login", { error: "auth_unavailable", next }));
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(buildRedirect("/login", { error: "invalid_credentials", next }));
  }

  redirect(next);
}

export async function signUpAction(formData) {
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");
  const next = getSafeRedirectTarget(String(formData.get("next") || ""), "/");

  if (!fullName || !email || !phone || !address || !password || !confirmPassword) {
    redirect(buildRedirect("/create-account", { error: "missing_fields", next }));
  }

  if (password.length < 6) {
    redirect(buildRedirect("/create-account", { error: "password_too_short", next }));
  }

  if (password !== confirmPassword) {
    redirect(buildRedirect("/create-account", { error: "password_mismatch", next }));
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(buildRedirect("/create-account", { error: "auth_unavailable", next }));
  }

  const loginUrl = new URL("/login", env.siteUrl);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: loginUrl.toString(),
      data: {
        full_name: fullName,
        phone,
        address,
      },
    },
  });

  if (error) {
    const errorCode =
      error.message?.toLowerCase().includes("already registered")
        ? "email_in_use"
        : "signup_failed";

    redirect(buildRedirect("/create-account", { error: errorCode, next }));
  }

  if (data.session) {
    await supabase.auth.signOut();

    try {
      await sendWelcomeLoginEmail({ email, fullName });
    } catch {}

    redirect(buildRedirect("/login", { notice: "account_created", next }));
  }

  try {
    await sendWelcomeLoginEmail({ email, fullName });
  } catch {}

  redirect(buildRedirect("/login", { notice: "check_email", next }));
}

export async function forgotPasswordAction(formData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  if (!email) {
    redirect(buildRedirect("/forgot-password", { error: "missing_email" }));
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(buildRedirect("/forgot-password", { error: "auth_unavailable" }));
  }

  const callbackUrl = new URL("/auth/callback", env.siteUrl);
  callbackUrl.searchParams.set("next", "/reset-password");
  callbackUrl.searchParams.set("intent", "password-reset");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callbackUrl.toString(),
  });

  if (error) {
    redirect(buildRedirect("/forgot-password", { error: "reset_failed" }));
  }

  redirect(buildRedirect("/forgot-password", { notice: "reset_email_sent" }));
}

export async function resetPasswordAction(formData) {
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!password || !confirmPassword) {
    redirect(buildRedirect("/reset-password", { error: "missing_fields" }));
  }

  if (password.length < 6) {
    redirect(buildRedirect("/reset-password", { error: "password_too_short" }));
  }

  if (password !== confirmPassword) {
    redirect(buildRedirect("/reset-password", { error: "password_mismatch" }));
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(buildRedirect("/reset-password", { error: "auth_unavailable" }));
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    redirect(buildRedirect("/reset-password", { error: "reset_failed" }));
  }

  redirect(buildRedirect("/login", { notice: "password_reset" }));
}

export async function continueWithGoogleAction(formData) {
  const next = getSafeRedirectTarget(String(formData.get("next") || ""), "/");
  const intent = String(formData.get("intent") || "sign-in");
  const returnPath = intent === "sign-up" ? "/create-account" : "/login";
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(buildRedirect(returnPath, { error: "auth_unavailable", next }));
  }

  const callbackUrl = new URL("/auth/callback", env.siteUrl);
  callbackUrl.searchParams.set("next", next);
  callbackUrl.searchParams.set("intent", intent);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error || !data?.url) {
    redirect(buildRedirect(returnPath, { error: "oauth_failed", next }));
  }

  redirect(data.url);
}
