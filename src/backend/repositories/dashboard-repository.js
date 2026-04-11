import { getOwnerDashboardData } from "@/src/backend/repositories/owner-repository";

export async function getDashboardData() {
  return getOwnerDashboardData();
}
