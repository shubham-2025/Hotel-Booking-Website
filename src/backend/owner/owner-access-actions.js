"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/src/backend/auth/supabase-admin-client";
import { getCurrentProfile } from "@/src/backend/auth/get-current-profile";
import { getCurrentUser } from "@/src/backend/auth/get-current-user";
import { hasManagementRole } from "@/src/backend/auth/get-current-role";

function buildHostRedirect(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string" && value.length > 0) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `/host?${query}` : "/host";
}

function buildOwnerSetupRedirect(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string" && value.length > 0) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `/owner/setup-hotel?${query}` : "/owner/setup-hotel";
}

export async function startHostingAction() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/host");
  }

  let profile = null;

  try {
    profile = await getCurrentProfile(user);
  } catch {
    profile = null;
  }

  if (!profile) {
    redirect(buildHostRedirect({ error: "profile_unavailable" }));
  }

  if (hasManagementRole(profile.role)) {
    redirect("/host");
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    redirect(buildHostRedirect({ error: "owner_activation_unavailable" }));
  }

  const { error } = await adminClient
    .from("profiles")
    .update({
      role: "owner",
    })
    .eq("id", user.id)
    .eq("role", "guest");

  if (error) {
    redirect(buildHostRedirect({ error: "owner_activation_failed" }));
  }

  redirect(buildOwnerSetupRedirect({ notice: "owner_access_ready" }));
}
