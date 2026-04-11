import Link from "next/link";
import { formatCurrency, formatDate } from "@/src/frontend/lib/format";
import { getDashboardData } from "@/lib/data";

function formatHotelStatus(status) {
  if (!status) {
    return "Draft";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

export async function OwnerDashboardScreen() {
  const dashboardData = await getDashboardData();
  const ownerName =
    dashboardData.profile?.full_name ||
    dashboardData.profile?.email ||
    "Owner";

  if (dashboardData.status === "unavailable") {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Dashboard
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          Owner data is temporarily unavailable
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          {dashboardData.reason}
        </p>

        <div className="mt-8 rounded-[30px] border border-[var(--color-line)] bg-[#fbfcfe] p-6">
          <p className="text-sm text-[var(--color-muted)]">
            Once Supabase access is available, this dashboard will load only the
            hotel, rooms, and booking activity that belong to your management
            account.
          </p>
        </div>
      </div>
    );
  }

  if (dashboardData.status === "no_hotel") {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Dashboard
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          Welcome, {ownerName}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          Your account has owner/admin access, but no hotel is linked to it yet.
          The next safe step is creating the hotel record that future rooms,
          bookings, and owner analytics will attach to.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[30px] border border-[var(--color-line)] bg-[#fbfcfe] p-6 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
              Hotel setup required
            </p>
            <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
              No hotel found for this owner account
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
              We have stopped showing demo dashboard data here. As soon as a
              hotel is created for this account, owner pages will start reading
              real owner-scoped rooms and bookings.
            </p>
            <div className="mt-5">
              <Link href="/owner/setup-hotel" className="button-primary min-h-11 px-5">
                Set up your hotel
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
              What comes next
            </p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-muted)]">
              <p>1. Create the owner hotel record.</p>
              <p>2. Attach rooms to that hotel.</p>
              <p>3. The dashboard will then show real inventory and bookings.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const primaryHotel = dashboardData.primaryHotel;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            Dashboard
          </p>
          <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
            {primaryHotel?.name || "Owner dashboard"}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
            {dashboardData.status === "no_rooms"
              ? "Your hotel is linked correctly, but no rooms are attached to it yet. This page is now reading your real owner account instead of demo data."
              : "This dashboard is now reading real owner-scoped inventory and booking activity for the authenticated management account."}
          </p>
        </div>

        {dashboardData.rooms.length ? (
          <Link href="/owner/list-room" className="button-secondary min-h-11 px-5">
            View room inventory
          </Link>
        ) : null}
      </div>

      <div className="mt-8 rounded-[30px] border border-[var(--color-line)] bg-[#fbfcfe] p-5 shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
              Primary hotel
            </p>
            <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
              {primaryHotel?.name}
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              {primaryHotel?.city} · {primaryHotel?.address}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-strong)] ring-1 ring-[var(--color-line)]">
              {formatHotelStatus(primaryHotel?.status)}
            </span>
            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
              {dashboardData.metrics.totalHotels} hotel
              {dashboardData.metrics.totalHotels === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] bg-[#f7fbff] p-5 ring-1 ring-[#d7e5f7]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
            Total rooms
          </p>
          <p className="mt-3 text-4xl font-semibold text-[var(--color-ink)]">
            {dashboardData.metrics.totalRooms}
          </p>
        </div>

        <div className="rounded-[28px] bg-[#eef8f0] p-5 ring-1 ring-[#d4ead8]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Active rooms
          </p>
          <p className="mt-3 text-4xl font-semibold text-[var(--color-ink)]">
            {dashboardData.metrics.activeRooms}
          </p>
        </div>

        <div className="rounded-[28px] bg-[#f7f5ff] p-5 ring-1 ring-[#e1daf9]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            Total bookings
          </p>
          <p className="mt-3 text-4xl font-semibold text-[var(--color-ink)]">
            {dashboardData.metrics.totalBookings}
          </p>
        </div>

        <div className="rounded-[28px] bg-[#fff7ef] p-5 ring-1 ring-[#f3dcc5]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            Total revenue
          </p>
          <p className="mt-3 text-4xl font-semibold text-[var(--color-ink)]">
            {formatCurrency(dashboardData.metrics.totalRevenue)}
          </p>
        </div>
      </div>

      {dashboardData.status === "no_rooms" ? (
        <div className="mt-8 rounded-[30px] border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            Inventory empty
          </p>
          <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
            Your hotel is ready for its first room
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
            The owner area is now correctly scoped to your account. The next
            small product batch can focus on turning the existing add-room form
            into a real authenticated room creation flow.
          </p>
        </div>
      ) : (
        <div className="mt-8 rounded-[30px] border border-[var(--color-line)] bg-[#fbfcfe] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                Recent bookings
              </p>
              <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
                Activity stream
              </h2>
            </div>
          </div>

          {dashboardData.recentBookings.length ? (
            <div className="mt-6 grid gap-4">
              {dashboardData.recentBookings.slice(0, 6).map((booking) => (
                <div
                  key={booking._id}
                  className="rounded-[24px] bg-white p-4 ring-1 ring-[var(--color-line)]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-[var(--color-ink)]">
                        {booking.guest.label}
                      </p>
                      <p className="text-sm text-[var(--color-muted)]">
                        {booking.room?.roomType} at {booking.hotel?.name}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
                        {formatDate(booking.checkInDate)} to {formatDate(booking.checkOutDate)}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-[var(--color-muted)]">
                      {formatCurrency(booking.totalPrice)}
                    </div>
                    <span
                      className={`rounded-full px-3 py-2 text-xs font-semibold ${
                        booking.paymentStatus === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {booking.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[24px] bg-white p-5 text-sm leading-7 text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
              Rooms are linked to your hotel now, but booking activity has not
              started yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
