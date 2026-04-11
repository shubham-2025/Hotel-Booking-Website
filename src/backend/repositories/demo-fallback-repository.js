import { bookings, rooms } from "@/src/frontend/content/demo/site-demo-data";
import { dashboardSnapshot } from "@/src/frontend/content/demo/owner-demo-data";

export function getFallbackRooms() {
  return rooms;
}

export function getFallbackBookings() {
  return bookings;
}

export function getFallbackDashboardData() {
  return dashboardSnapshot;
}

export function getFallbackRoomImages() {
  return rooms[0]?.images || [];
}

export function getFallbackOwnerImage() {
  return rooms[0]?.hotel?.owner?.image || "";
}
