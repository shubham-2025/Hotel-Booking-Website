import { getFallbackBookings } from "@/src/backend/repositories/demo-fallback-repository";

export async function getBookings() {
  return getFallbackBookings();
}
