import { OwnerBookingsScreen } from "@/src/frontend/screens/owner/owner-bookings-screen";

export const metadata = {
  title: "Owner Bookings",
};

export default function OwnerBookingsPage({ searchParams }) {
  return <OwnerBookingsScreen searchParams={searchParams} />;
}
