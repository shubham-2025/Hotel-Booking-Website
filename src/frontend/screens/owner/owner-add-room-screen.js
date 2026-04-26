import Link from "next/link";
import { getOwnerHotelBootstrapData } from "@/src/backend/repositories/owner-repository";
import { AddRoomPanel } from "@/src/frontend/features/owner/add-room-panel.client";

export async function OwnerAddRoomScreen() {
  const hotelSetupData = await getOwnerHotelBootstrapData();

  if (hotelSetupData.status === "unavailable") {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Add room
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          Room setup is temporarily unavailable
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          {hotelSetupData.reason}
        </p>
      </div>
    );
  }

  if (hotelSetupData.status === "no_hotel") {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Add room
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          Create your hotel before adding rooms
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          Rooms are shaped around a property profile. Set up the hotel first,
          then come back here to create your first room.
        </p>

        <div className="mt-8">
          <Link href="/owner/setup-hotel" className="button-primary min-h-11 px-5">
            Set up your hotel
          </Link>
        </div>
      </div>
    );
  }

  return <AddRoomPanel hotel={hotelSetupData.primaryHotel} />;
}
