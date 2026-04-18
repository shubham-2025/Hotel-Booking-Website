import Link from "next/link";
import { toggleOwnerHotelAvailabilityAction } from "@/src/backend/owner/owner-hotel-actions";
import { getOwnerHotelBootstrapData } from "@/src/backend/repositories/owner-repository";
import { HotelSetupPanel } from "@/src/frontend/features/owner/hotel-setup-panel.client";

function formatHotelStatus(status) {
  if (!status) {
    return "Draft";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

export async function OwnerHotelSetupScreen() {
  const hotelSetupData = await getOwnerHotelBootstrapData();
  const ownerName =
    hotelSetupData.profile?.full_name ||
    hotelSetupData.profile?.email ||
    "Owner";

  if (hotelSetupData.status === "unavailable") {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Hotel setup
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          Hotel setup is temporarily unavailable
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          {hotelSetupData.reason}
        </p>
      </div>
    );
  }

  if (hotelSetupData.status !== "no_hotel") {
    const primaryHotel = hotelSetupData.primaryHotel;
    const isHotelActive = primaryHotel?.status === "active";

    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Hotel management
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          Keep your hotel details and visibility current
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          This owner account already has a linked hotel, so this page now acts
          as the real edit and visibility control point for your property.
          Rooms only become truly public when both the room and the hotel are
          active.
        </p>

        <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-[30px] border border-[var(--color-line)] bg-[#fbfcfe] p-6 shadow-[var(--shadow-soft)]">
            <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="overflow-hidden rounded-[24px] border border-[var(--color-line)] bg-white">
                <img
                  src={
                    primaryHotel?.heroImageUrl ||
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop"
                  }
                  alt={primaryHotel?.name}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
                      Linked hotel
                    </p>
                    <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
                      {primaryHotel?.name}
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                      {primaryHotel?.city} | {primaryHotel?.address}
                    </p>
                    {primaryHotel?.description ? (
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
                        {primaryHotel.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-strong)] ring-1 ring-[var(--color-line)]">
                      {formatHotelStatus(primaryHotel?.status)}
                    </span>
                    <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
                      {hotelSetupData.metrics.totalHotels} hotel
                      {hotelSetupData.metrics.totalHotels === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>

                {primaryHotel?.amenities?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {primaryHotel.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="rounded-full bg-white px-3 py-1 text-xs text-[var(--color-muted)] ring-1 ring-[var(--color-line)]"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="rounded-[24px] bg-white p-4 text-sm leading-7 text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
                  {isHotelActive
                    ? "This hotel is currently public. Any active rooms under it can now appear in public room inventory."
                    : "This hotel is still private. Even if some rooms are active, they will stay hidden from public room inventory until the hotel is published."}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
              Visibility
            </p>
            <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
              {isHotelActive ? "Hotel is public" : "Hotel is still private"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
              {isHotelActive
                ? "Keep the hotel active when the core branding, address, and contact details are ready for public travelers."
                : "Publish the hotel only when the core property details are ready. Public rooms now require an active hotel and an active room together."}
            </p>

            <form action={toggleOwnerHotelAvailabilityAction} className="mt-5">
              <input type="hidden" name="hotelId" value={primaryHotel?._id || ""} />
              <input
                type="hidden"
                name="nextState"
                value={isHotelActive ? "unpublish" : "publish"}
              />
              <button type="submit" className="button-primary min-h-11 w-full px-5">
                {isHotelActive ? "Deactivate hotel" : "Publish hotel"}
              </button>
            </form>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/owner" className="button-secondary min-h-11 px-5">
                Back to dashboard
              </Link>
              <Link href="/owner/list-room" className="button-secondary min-h-11 px-5">
                Room inventory
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[30px] border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)]">
            <HotelSetupPanel
              profile={hotelSetupData.profile}
              hotel={primaryHotel}
              mode="edit"
            />
          </div>

          <div className="rounded-[30px] border border-[var(--color-line)] bg-[#fbfcfe] p-6 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
              Public visibility rules
            </p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-muted)]">
              <p>1. A room must be active to qualify for public browsing.</p>
              <p>2. The hotel must also be active, otherwise all linked rooms stay private.</p>
              <p>3. If no real public rooms qualify yet, the public pages can still fall back safely.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/owner" className="button-secondary min-h-11 px-5">
            Back to dashboard
          </Link>
          <Link href="/owner/list-room" className="button-primary min-h-11 px-5">
            Continue to inventory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
        Hotel setup
      </p>
      <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
        Create your first hotel, {ownerName}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
        This is the first real owner bootstrap step. Once the hotel record is
        created, the owner dashboard and inventory pages will stop showing the
        no-hotel onboarding state and will move into room setup, pricing, and
        listing readiness.
      </p>

      <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[30px] border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)]">
          <HotelSetupPanel profile={hotelSetupData.profile} />
        </div>

        <div className="rounded-[30px] border border-[var(--color-line)] bg-[#fbfcfe] p-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
            What happens next
          </p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-muted)]">
            <p>1. The hotel is linked to your authenticated owner/admin account.</p>
            <p>2. Owner dashboard starts reading the real hotel context and cover image.</p>
            <p>3. Inventory page becomes ready for room setup, pricing, and listing media.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
