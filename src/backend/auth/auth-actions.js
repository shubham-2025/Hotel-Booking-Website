"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase-server-client";
import { getSafeRedirectTarget } from "./get-safe-redirect-target";

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
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = getSafeRedirectTarget(String(formData.get("next") || ""), "/");

  if (!email || !password) {
    redirect(buildRedirect("/sign-in", { error: "missing_fields", next }));
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(buildRedirect("/sign-in", { error: "auth_unavailable", next }));
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(buildRedirect("/sign-in", { error: "invalid_credentials", next }));
  }

  redirect(next);
}

export async function signUpAction(formData) {
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = getSafeRedirectTarget(String(formData.get("next") || ""), "/");

  if (!fullName || !email || !password) {
    redirect(buildRedirect("/sign-up", { error: "missing_fields", next }));
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(buildRedirect("/sign-up", { error: "auth_unavailable", next }));
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    redirect(buildRedirect("/sign-up", { error: "signup_failed", next }));
  }

  if (data.session) {
    redirect(next);
  }

  redirect(buildRedirect("/sign-in", { notice: "check_email" }));
}
