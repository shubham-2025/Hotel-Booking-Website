import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/backend/auth/get-current-user";
import { MyBookingsScreen } from "@/src/frontend/screens/site/my-bookings-screen";

export const metadata = {
  title: "My Bookings",
};

export default async function MyBookingsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?next=/my-bookings");
  }

  return <MyBookingsScreen />;
}
