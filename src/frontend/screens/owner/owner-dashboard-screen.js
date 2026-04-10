import { formatCurrency } from "@/src/frontend/lib/format";
import { getDashboardData } from "@/lib/data";

export async function OwnerDashboardScreen() {
  const dashboardData = await getDashboardData();

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
        Dashboard
      </p>
      <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
        Owner KPIs are now easier to read on mobile
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
        This page keeps the existing dashboard intent, but the layout now stacks
        cleanly on smaller screens and is ready to receive live metrics from
        Supabase queries.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-[28px] bg-[#f7fbff] p-5 ring-1 ring-[#d7e5f7]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
            Total bookings
          </p>
          <p className="mt-3 text-4xl font-semibold text-[var(--color-ink)]">
            {dashboardData.totalBookings}
          </p>
        </div>
        <div className="rounded-[28px] bg-[#fff7ef] p-5 ring-1 ring-[#f3dcc5]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            Total revenue
          </p>
          <p className="mt-3 text-4xl font-semibold text-[var(--color-ink)]">
            {formatCurrency(dashboardData.totalRevenue)}
          </p>
        </div>
      </div>

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

        <div className="mt-6 grid gap-4">
          {dashboardData.bookings.map((booking) => (
            <div
              key={booking._id}
              className="rounded-[24px] bg-white p-4 ring-1 ring-[var(--color-line)]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-[var(--color-ink)]">
                    {booking.user.username}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    {booking.room.roomType} at {booking.hotel.name}
                  </p>
                </div>
                <div className="text-sm text-[var(--color-muted)]">
                  {formatCurrency(booking.totalPrice)}
                </div>
                <span
                  className={`rounded-full px-3 py-2 text-xs font-semibold ${
                    booking.isPaid
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {booking.isPaid ? "Completed" : "Pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
