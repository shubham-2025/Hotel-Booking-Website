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
          Your hosting overview is temporarily unavailable
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          {dashboardData.reason}
        </p>

        <div className="mt-8 rounded-[30px] border border-[var(--color-line)] bg-[#fbfcfe] p-6">
          <p className="text-sm text-[var(--color-muted)]">
            As soon as your property data is available again, this space will
            return to showing your rooms, bookings, pricing, and performance.
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
        <p className="mt-3 max-w-3xl text-sm leading-8 text-[var(--color-muted)]">
          Your hosting space is ready, but it still needs its first property.
          Add the hotel details now so rooms, rates, and guest bookings have a
          beautiful place to live.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[30px] border border-[var(--color-line)] bg-[#fbfcfe] p-6 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
              First step
            </p>
            <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
              Your hotel story starts here
            </h2>
            <p className="mt-3 text-sm leading-8 text-[var(--color-muted)]">
              Once your property profile is in place, you can shape the rooms,
              styling, pricing, and guest journey around it.
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
            <div className="mt-4 space-y-3 text-sm leading-8 text-[var(--color-muted)]">
              <p>1. Introduce the hotel with a name, address, imagery, and tone.</p>
              <p>2. Add the comforts and details that help guests feel at ease.</p>
              <p>3. Build a beautiful room collection around that property profile.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const primaryHotel = dashboardData.primaryHotel;

  return (
    <div>
      <div className="overflow-hidden rounded-[34px] border border-[rgba(188,208,229,0.9)] bg-[linear-gradient(135deg,rgba(19,48,75,0.98),rgba(39,89,131,0.95),rgba(137,186,229,0.82))] p-6 text-white shadow-[var(--shadow-lift)] sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/68">
              Dashboard
            </p>
            <h1 className="mt-3 font-display text-4xl text-white">
              {primaryHotel?.name || "Your hosting overview"}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-8 text-white/78">
              {dashboardData.status === "no_rooms"
                ? "Your property is beautifully set up and ready for its first room."
                : "A calm overview of performance, pricing, and upcoming guest activity for your property."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/owner/setup-hotel" className="button-secondary min-h-11 px-5">
              Refine property
            </Link>
            {dashboardData.rooms.length ? (
              <Link href="/owner/bookings" className="button-secondary min-h-11 px-5">
                Guest bookings
              </Link>
            ) : null}
            {dashboardData.rooms.length ? (
              <Link href="/owner/list-room" className="button-secondary min-h-11 px-5">
                Room collection
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-[34px] border border-[rgba(188,208,229,0.9)] bg-[linear-gradient(135deg,#f7fbff,#ffffff)] p-5 shadow-[var(--shadow-soft)]">
        <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
          <div className="overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-white shadow-[0_18px_40px_rgba(18,36,59,0.08)]">
            <img
              src={
                primaryHotel?.heroImageUrl ||
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop"
              }
              alt={primaryHotel?.name}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[var(--color-accent-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-strong)]">
                Signature property
              </span>
              <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
                {formatHotelStatus(primaryHotel?.status)}
              </span>
              <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
                {dashboardData.metrics.totalHotels} hotel
                {dashboardData.metrics.totalHotels === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
                Property spotlight
              </p>
              <h2 className="mt-2 break-words font-display text-3xl text-[var(--color-ink)]">
                {primaryHotel?.name}
              </h2>
              <p className="mt-2 break-words text-sm leading-7 text-[var(--color-muted)]">
                {primaryHotel?.city} | {primaryHotel?.address}
              </p>
            </div>

            {primaryHotel?.description ? (
              <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--color-muted)]">
                {primaryHotel.description}
              </p>
            ) : null}

            {primaryHotel?.amenities?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {primaryHotel.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full bg-white px-3 py-2 text-xs text-[var(--color-muted)] ring-1 ring-[var(--color-line)]"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            ) : null}
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
            Open to guests
          </p>
          <p className="mt-3 text-4xl font-semibold text-[var(--color-ink)]">
            {dashboardData.metrics.activeRooms}
          </p>
        </div>

        <div className="rounded-[28px] bg-[#f7f5ff] p-5 ring-1 ring-[#e1daf9]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            Guest stays
          </p>
          <p className="mt-3 text-4xl font-semibold text-[var(--color-ink)]">
            {dashboardData.metrics.totalBookings}
          </p>
        </div>

        <div className="rounded-[28px] bg-[#fff7ef] p-5 ring-1 ring-[#f3dcc5]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            Revenue
          </p>
          <p className="mt-3 text-4xl font-semibold text-[var(--color-ink)]">
            {formatCurrency(dashboardData.metrics.totalRevenue)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-[28px] border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            Starting rate
          </p>
          <p className="mt-3 text-3xl font-semibold text-[var(--color-ink)]">
            {dashboardData.metrics.lowestNightlyRate
              ? formatCurrency(dashboardData.metrics.lowestNightlyRate)
              : "Not set"}
          </p>
        </div>

        <div className="rounded-[28px] border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            Average nightly rate
          </p>
          <p className="mt-3 text-3xl font-semibold text-[var(--color-ink)]">
            {dashboardData.metrics.averageNightlyRate
              ? formatCurrency(dashboardData.metrics.averageNightlyRate)
              : "Not set"}
          </p>
        </div>

        <div className="rounded-[28px] border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            Highest nightly rate
          </p>
          <p className="mt-3 text-3xl font-semibold text-[var(--color-ink)]">
            {dashboardData.metrics.highestNightlyRate
              ? formatCurrency(dashboardData.metrics.highestNightlyRate)
              : "Not set"}
          </p>
        </div>
      </div>

      {dashboardData.status === "no_rooms" ? (
        <div className="mt-8 rounded-[30px] border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            Room collection
          </p>
          <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
            Your property is ready for its first room
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-8 text-[var(--color-muted)]">
            Add your first room to start building the stay experience guests
            will browse, compare, and remember.
          </p>
          <div className="mt-5">
            <Link href="/owner/add-room" className="button-primary min-h-11 px-5">
              Add your first room
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-[30px] border border-[var(--color-line)] bg-[#fbfcfe] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                Guest activity
              </p>
              <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
                Latest stays
              </h2>
            </div>
            <Link href="/owner/bookings" className="button-secondary min-h-11 px-5">
              Open bookings
            </Link>
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
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-2 text-xs font-semibold ${
                          booking.status === "confirmed"
                            ? "bg-emerald-100 text-emerald-700"
                            : booking.status === "completed"
                              ? "bg-sky-100 text-sky-700"
                              : booking.status === "cancelled"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      <span
                        className={`rounded-full px-3 py-2 text-xs font-semibold ${
                          booking.paymentStatus === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : booking.paymentStatus === "refunded"
                              ? "bg-slate-200 text-slate-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {booking.paymentStatus === "paid"
                          ? "Paid"
                          : booking.paymentStatus === "refunded"
                            ? "Refunded"
                            : "Unpaid"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[24px] bg-white p-5 text-sm leading-7 text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
              Your rooms are ready, and the first guest stays will appear here
              as soon as bookings begin.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
