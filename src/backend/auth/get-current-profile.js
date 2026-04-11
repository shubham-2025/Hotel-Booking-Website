import { createSupabaseServerClient } from "./supabase-server-client";
import { getCurrentUser } from "./get-current-user";

const PROFILE_COLUMNS = `
  id,
  full_name,
  email,
  phone,
  role,
  avatar_url,
  created_at,
  updated_at
`;

export async function getCurrentProfile(user = null) {
  const currentUser = user || (await getCurrentUser());

  if (!currentUser) {
    return null;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", currentUser.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
}
