import { getFallbackDashboardData } from "@/src/backend/repositories/demo-fallback-repository";

export async function getDashboardData() {
  return getFallbackDashboardData();
}
