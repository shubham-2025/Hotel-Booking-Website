import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/backend/auth/get-current-user";
import { syncBookingPaymentFromCheckoutSession } from "@/src/backend/services/booking-payment-service";
import { MyBookingsScreen } from "@/src/frontend/screens/site/my-bookings-screen";

export const metadata = {
  title: "My Bookings",
};

function buildMyBookingsRedirect(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string" && value.length > 0) {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `/my-bookings?${query}` : "/my-bookings";
}

export default async function MyBookingsPage({ searchParams }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?next=/my-bookings");
  }

  const params = (await searchParams) || {};
  const sessionId =
    typeof params.session_id === "string" ? params.session_id : "";

  if (sessionId) {
    const syncResult = await syncBookingPaymentFromCheckoutSession({
      sessionId,
      travelerId: currentUser.id,
    });

    if (syncResult.status === "updated" || syncResult.status === "already_paid") {
      redirect(
        buildMyBookingsRedirect({
          notice:
            typeof params.notice === "string" && params.notice
              ? params.notice
              : "payment_completed",
        }),
      );
    }

    redirect(buildMyBookingsRedirect({ error: syncResult.errorCode || "payment_sync_failed" }));
  }

  return <MyBookingsScreen searchParams={params} />;
}
