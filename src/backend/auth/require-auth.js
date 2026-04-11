import { AuthError, AUTH_ERROR_CODES } from "./auth-errors";
import { getCurrentProfile } from "./get-current-profile";
import { getCurrentUser } from "./get-current-user";

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthError(
      "Authentication is required for this action.",
      AUTH_ERROR_CODES.UNAUTHENTICATED,
    );
  }

  return user;
}

export async function requireProfile() {
  const user = await requireAuth();
  const profile = await getCurrentProfile(user);

  if (!profile) {
    throw new AuthError(
      "A profile is required for this action.",
      AUTH_ERROR_CODES.PROFILE_REQUIRED,
    );
  }

  return { user, profile };
}
