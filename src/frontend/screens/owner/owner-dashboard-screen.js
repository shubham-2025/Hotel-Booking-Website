import Link from "next/link";
import { formatCurrency, formatDate } from "@/src/frontend/lib/format";
import { getDashboardData } from "@/lib/data";
import { OwnerPageHeader } from "@/src/frontend/components/owner/owner-page-header";
import { OwnerPropertyPreviewCard } from "@/src/frontend/components/owner/owner-property-preview-card";
import { OwnerStatGrid } from "@/src/frontend/components/owner/owner-stat-grid";

function formatHotelStatus(status) {
  if (!status) {
    return "Draft";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatStatusLabel(value) {
  return String(value || "unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getBookingStatusClasses(status) {
  if (status === "confirmed") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "pending") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "cancelled") {
    return "bg-rose-100 text-rose-700";
  }

  if (status === "completed") {
    return "bg-sky-100 text-sky-700";
  }

  return "bg-slate-200 text-slate-700";
}

function getPaymentStatusClasses(paymentStatus) {
  if (paymentStatus === "paid") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (paymentStatus === "refunded") {
    return "bg-slate-200 text-slate-700";
  }

  return "bg-amber-100 text-amber-700";
}

function getDashboardDescription(dashboardData) {
  if (dashboardData.status === "no_rooms") {
    return "Your property profile is ready. The next step is building a room collection that guests can browse, compare, and book with confidence.";
  }

  return "Use this workspace to monitor room visibility, review guest activity, and keep the property presentation aligned with daily operations.";
}

function DashboardWorkspacePanel({ dashboardData, primaryHotel }) {
  const rateValues = [
    {
      label: "Starting rate",
      value: dashboardData.metrics.lowestNightlyRate
        ? formatCurrency(dashboardData.metrics.lowestNightlyRate)
        : "Not set",
    },
    {
      label: "Average rate",
      value: dashboardData.metrics.averageNightlyRate
        ? formatCurrency(dashboardData.metrics.averageNightlyRate)
        : "Not set",
    },
    {
      label: "Highest rate",
      value: dashboardData.metrics.highestNightlyRate
        ? formatCurrency(dashboardData.metrics.highestNightlyRate)
        : "Not set",
    },
  ];
  const amenityPreview = primaryHotel?.amenities?.slice(0, 5) || [];
  const visibilityNote =
    primaryHotel?.status === "active"
      ? "This property is open to discovery. Keep the story and room collection current so every guest arrives with the right expectations."
      : "This property is still private. Refine the details here first, then open it when the experience feels ready to present.";

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_320px]">
      <OwnerPropertyPreviewCard
        imageUrl={
          primaryHotel?.heroImageUrl ||
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop"
        }
        imageAlt={primaryHotel?.name}
        meta={
          <>
            <span className="rounded-full bg-[var(--color-accent-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-strong)]">
              {formatHotelStatus(primaryHotel?.status)}
            </span>
            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
              {dashboardData.metrics.totalHotels} hotel
              {dashboardData.metrics.totalHotels === 1 ? "" : "s"}
            </span>
            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
              {dashboardData.metrics.activeRooms} active room
              {dashboardData.metrics.activeRooms === 1 ? "" : "s"}
            </span>
          </>
        }
        name={primaryHotel?.name}
        location={`${primaryHotel?.city} | ${primaryHotel?.address}`}
        description={
          primaryHotel?.description ||
          "Complete the property story with clear imagery, a calm description, and room details that help guests trust the stay quickly."
        }
        amenities={amenityPreview}
        note={visibilityNote}
      />

      <aside className="rounded-[32px] border border-[rgba(205,220,236,0.96)] bg-[linear-gradient(180deg,#f8fbff,#ffffff)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Workspace focus
        </p>
        <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
          Keep the essentials in view
        </h2>

        <div className="mt-5 space-y-3">
          <div className="rounded-[22px] bg-white px-4 py-4 ring-1 ring-[var(--color-line)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
              Property visibility
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              {primaryHotel?.status === "active"
                ? "Travelers can discover this property when rooms are also active."
                : "The property is still private. Rooms remain hidden until the hotel is open."}
            </p>
          </div>

          <div className="rounded-[22px] bg-white px-4 py-4 ring-1 ring-[var(--color-line)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
              Rate snapshot
            </p>
            <div className="mt-3 space-y-2 text-sm leading-7 text-[var(--color-muted)]">
              {rateValues.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4">
                  <span>{item.label}</span>
                  <span className="font-semibold text-[var(--color-ink)]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] bg-white px-4 py-4 ring-1 ring-[var(--color-line)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
              Operational note
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              Keep the room collection, pricing, and booking activity aligned so
              guests always see a polished and current stay.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function RecentBookingsSection({ dashboardData }) {
  if (dashboardData.status === "no_rooms") {
    return (
      <section className="rounded-[32px] border border-[rgba(205,220,236,0.96)] bg-white/96 p-5 shadow-[var(--shadow-soft)] sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Next step
        </p>
        <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
          Add the first room to start operations
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-[var(--color-muted)]">
          Once your first room is added, this dashboard becomes a faster control
          point for availability, pricing, and incoming guest stays.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/owner/add-room" className="button-primary min-h-11 px-5">
            Add first room
          </Link>
          <Link href="/owner/setup-hotel" className="button-secondary min-h-11 px-5">
            Refine property
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[32px] border border-[rgba(205,220,236,0.96)] bg-white/96 p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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
        <div className="mt-6 overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-[rgba(250,252,254,0.96)]">
          {dashboardData.recentBookings.slice(0, 6).map((booking, index) => (
            <div
              key={booking._id}
              className={`grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center ${
                index === 0 ? "" : "border-t border-[var(--color-line)]"
              }`}
            >
              <div className="min-w-0">
                <p className="text-lg font-semibold text-[var(--color-ink)]">
                  {booking.guest.label}
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {booking.room?.roomType} at {booking.hotel?.name}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
                  {formatDate(booking.checkInDate)} to {formatDate(booking.checkOutDate)}
                </p>
              </div>

              <div className="text-sm font-semibold text-[var(--color-ink)]">
                {formatCurrency(booking.totalPrice)}
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <span
                  className={`rounded-full px-3 py-2 text-xs font-semibold ${getBookingStatusClasses(
                    booking.status,
                  )}`}
                >
                  {formatStatusLabel(booking.status)}
                </span>
                <span
                  className={`rounded-full px-3 py-2 text-xs font-semibold ${getPaymentStatusClasses(
                    booking.paymentStatus,
                  )}`}
                >
                  {formatStatusLabel(booking.paymentStatus)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[24px] bg-[var(--color-card-soft)] px-4 py-4 text-sm leading-7 text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
          Your rooms are live in the workspace. Guest stays will appear here as
          soon as bookings begin.
        </div>
      )}
    </section>
  );
}

export async function OwnerDashboardScreen() {
  const dashboardData = await getDashboardData();
  const ownerName =
    dashboardData.profile?.full_name ||
    dashboardData.profile?.email ||
    "Owner";

  if (dashboardData.status === "unavailable") {
    return (
      <div className="space-y-8">
        <OwnerPageHeader
          eyebrow="Dashboard"
          title="Your hosting overview is temporarily unavailable"
          description={dashboardData.reason}
        />

        <section className="rounded-[32px] border border-[rgba(205,220,236,0.96)] bg-white/96 p-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm leading-8 text-[var(--color-muted)]">
            As soon as your property data becomes available again, this page
            will return to room, rate, and booking visibility.
          </p>
        </section>
      </div>
    );
  }

  if (dashboardData.status === "no_hotel") {
    return (
      <div className="space-y-8">
        <OwnerPageHeader
          eyebrow="Dashboard"
          title={`Welcome, ${ownerName}`}
          description="Your hosting space is active, and the first step is creating the property profile that rooms, rates, and guest stays will grow around."
          actions={
            <Link href="/owner/setup-hotel" className="button-primary min-h-11 px-5">
              Set up property
            </Link>
          }
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-[32px] border border-[rgba(205,220,236,0.96)] bg-white/96 p-6 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
              First step
            </p>
            <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
              Build the property foundation first
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-8 text-[var(--color-muted)]">
              Once the property profile is in place, the owner workspace becomes
              clearer and more useful for room inventory, pricing, and bookings.
            </p>
            <div className="mt-6">
              <Link href="/owner/setup-hotel" className="button-primary min-h-11 px-5">
                Create property profile
              </Link>
            </div>
          </section>

          <aside className="rounded-[32px] border border-[rgba(205,220,236,0.96)] bg-[linear-gradient(180deg,#f8fbff,#ffffff)] p-6 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
              What comes next
            </p>
            <div className="mt-4 space-y-3 text-sm leading-8 text-[var(--color-muted)]">
              <p>1. Add the property name, location, story, and guest-facing details.</p>
              <p>2. Create rooms and decide which ones are ready for travelers.</p>
              <p>3. Use this dashboard later for bookings, visibility, and pricing checks.</p>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  const primaryHotel = dashboardData.primaryHotel;
  const hasRooms = dashboardData.rooms.length > 0;
  const dashboardActions = hasRooms ? (
    <>
      <Link href="/owner/list-room" className="button-primary min-h-11 px-5">
        Room collection
      </Link>
      <Link href="/owner/bookings" className="button-secondary min-h-11 px-5">
        Guest bookings
      </Link>
      <Link href="/owner/setup-hotel" className="button-secondary min-h-11 px-5">
        Property details
      </Link>
    </>
  ) : (
    <>
      <Link href="/owner/add-room" className="button-primary min-h-11 px-5">
        Add first room
      </Link>
      <Link href="/owner/setup-hotel" className="button-secondary min-h-11 px-5">
        Property details
      </Link>
    </>
  );

  const stats = [
    {
      label: "Total rooms",
      value: dashboardData.metrics.totalRooms,
      tone: "accent",
    },
    {
      label: "Open to guests",
      value: dashboardData.metrics.activeRooms,
      tone: "success",
    },
    {
      label: "Guest stays",
      value: dashboardData.metrics.totalBookings,
      tone: "neutral",
    },
    {
      label: "Revenue",
      value: formatCurrency(dashboardData.metrics.totalRevenue),
      tone: "warm",
    },
  ];

  return (
    <div className="space-y-8">
      <OwnerPageHeader
        eyebrow="Dashboard"
        title={primaryHotel?.name || "Hosting overview"}
        description={getDashboardDescription(dashboardData)}
        meta={
          <>
            <span className="rounded-full bg-[var(--color-accent-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-strong)]">
              {formatHotelStatus(primaryHotel?.status)}
            </span>
            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
              {primaryHotel?.city}
            </span>
          </>
        }
        actions={dashboardActions}
      />

      <OwnerStatGrid items={stats} />

      <DashboardWorkspacePanel
        dashboardData={dashboardData}
        primaryHotel={primaryHotel}
      />

      <RecentBookingsSection dashboardData={dashboardData} />
    </div>
  );
}
