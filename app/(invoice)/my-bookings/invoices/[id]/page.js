import { redirect } from "next/navigation";
import { getTravelerBookingInvoiceData } from "@/src/backend/repositories/bookings-repository";
import { BookingInvoiceScreen } from "@/src/frontend/screens/site/booking-invoice-screen";

export const metadata = {
  title: "Booking Invoice",
};

function buildInvoiceLoginRedirect(bookingId, params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string" && value.length > 0) {
      search.set(key, value);
    }
  });

  const nextPath = search.toString()
    ? `/my-bookings/invoices/${bookingId}?${search.toString()}`
    : `/my-bookings/invoices/${bookingId}`;

  return `/login?next=${encodeURIComponent(nextPath)}`;
}

export default async function BookingInvoicePage({ params, searchParams }) {
  const routeParams = (await params) || {};
  const query = (await searchParams) || {};
  const bookingId = typeof routeParams.id === "string" ? routeParams.id : "";
  const accessToken = typeof query.access === "string" ? query.access : "";
  const invoiceData = await getTravelerBookingInvoiceData(bookingId, {
    accessToken,
  });

  if (invoiceData.status === "unauthenticated") {
    redirect(
      buildInvoiceLoginRedirect(bookingId, {
        download: typeof query.download === "string" ? query.download : "",
      }),
    );
  }

  return <BookingInvoiceScreen invoiceData={invoiceData} searchParams={query} />;
}
