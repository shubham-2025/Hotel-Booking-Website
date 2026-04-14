import Link from "next/link";
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
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Hotel setup
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          Hotel bootstrap is already complete
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          This owner account already has a hotel linked to it, so a second
          bootstrap step is not needed for this batch.
        </p>

        <div className="mt-8 rounded-[30px] border border-[var(--color-line)] bg-[#fbfcfe] p-6 shadow-[var(--shadow-soft)]">
          <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-[24px] border border-[var(--color-line)] bg-white">
              <img
                src={
                  hotelSetupData.primaryHotel?.heroImageUrl ||
                  "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop"
                }
                alt={hotelSetupData.primaryHotel?.name}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
                  Linked hotel
                </p>
                <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
                  {hotelSetupData.primaryHotel?.name}
                </h2>
                <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                  {hotelSetupData.primaryHotel?.city} | {hotelSetupData.primaryHotel?.address}
                </p>
                {hotelSetupData.primaryHotel?.description ? (
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
                    {hotelSetupData.primaryHotel.description}
                  </p>
                ) : null}
                {hotelSetupData.primaryHotel?.amenities?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {hotelSetupData.primaryHotel.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="rounded-full bg-white px-3 py-1 text-xs text-[var(--color-muted)] ring-1 ring-[var(--color-line)]"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-strong)] ring-1 ring-[var(--color-line)]">
                {formatHotelStatus(hotelSetupData.primaryHotel?.status)}
              </span>
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
