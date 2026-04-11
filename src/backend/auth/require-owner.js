import { AuthError, AUTH_ERROR_CODES } from "./auth-errors";
import { hasManagementRole, isCurrentUserOwnerOrAdmin } from "./get-current-role";
import { requireProfile } from "./require-auth";

export async function requireOwner() {
  const { user, profile } = await requireProfile();

  if (!hasManagementRole(profile.role)) {
    throw new AuthError(
      "Owner access is required for this action.",
      AUTH_ERROR_CODES.OWNER_REQUIRED,
    );
  }

  return { user, profile };
}

export { isCurrentUserOwnerOrAdmin };
