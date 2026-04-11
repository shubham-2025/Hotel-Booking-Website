import { createSupabaseAdminClient } from "@/src/backend/auth/supabase-admin-client";

export async function saveNewsletterSubscriber(payload) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return false;
  }

  const { error } = await supabase.from("newsletter_subscribers").upsert(
    {
      email: payload.email,
      source: payload.source,
    },
    { onConflict: "email" },
  );

  if (error) {
    throw error;
  }

  return true;
}
