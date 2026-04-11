import { getCurrentProfile } from "./get-current-profile";

export function hasManagementRole(role) {
  return role === "owner" || role === "admin";
}

export async function getCurrentRole() {
  const profile = await getCurrentProfile();
  return profile?.role || null;
}

export async function isCurrentUserOwnerOrAdmin() {
  const role = await getCurrentRole();
  return hasManagementRole(role);
}
