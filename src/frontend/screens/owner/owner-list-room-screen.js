import Link from "next/link";
import { formatCurrency } from "@/src/frontend/lib/format";
import { getOwnerRoomsData } from "@/src/backend/repositories/owner-repository";

function formatHotelStatus(status) {
  if (!status) {
    return "Draft";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

export async function OwnerListRoomScreen() {
  const ownerRoomsData = await getOwnerRoomsData();
  const primaryHotel = ownerRoomsData.primaryHotel;

  if (ownerRoomsData.status === "unavailable") {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Inventory
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          Owner room inventory is unavailable
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          {ownerRoomsData.reason}
        </p>
      </div>
    );
  }

  if (ownerRoomsData.status === "no_hotel") {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Inventory
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          No hotel linked to this owner account
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          Room inventory now depends on real owner-scoped data. Since this
          account does not have a hotel yet, there are no rooms to load.
        </p>

        <div className="mt-8 rounded-[30px] border border-[var(--color-line)] bg-[#fbfcfe] p-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
            Setup first
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
            The next foundational step is creating the hotel record for this
            owner/admin. Once that exists, this page will show only rooms that
            belong to that hotel scope.
          </p>
          <div className="mt-5">
            <Link href="/owner/setup-hotel" className="button-primary min-h-11 px-5">
              Set up your hotel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            Inventory
          </p>
          <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
            Listing management
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
            This page now reads only rooms linked to the authenticated owner
            account. Public/demo inventory is no longer used here.
          </p>
        </div>

        {ownerRoomsData.rooms.length ? (
          <span className="rounded-full bg-[var(--color-accent-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            {ownerRoomsData.metrics.totalRooms} room
            {ownerRoomsData.metrics.totalRooms === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      <div className="mt-8 rounded-[30px] border border-[var(--color-line)] bg-[#fbfcfe] p-5 shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
              Hotel scope
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
              {ownerRoomsData.metrics.totalHotels} hotel
              {ownerRoomsData.metrics.totalHotels === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      {ownerRoomsData.status === "no_rooms" ? (
        <div className="mt-8 rounded-[30px] border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            No rooms yet
          </p>
          <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
            Your hotel is linked, but inventory is still empty
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
            This owner page is now using real account scope correctly, and you
            can add the first room for this hotel directly from the owner area.
          </p>
          <div className="mt-5">
            <Link href="/owner/add-room" className="button-primary min-h-11 px-5">
              Add your first room
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {ownerRoomsData.rooms.map((room) => (
            <article
              key={room._id}
              className="rounded-[28px] border border-[var(--color-line)] bg-[#fbfcfe] p-4 shadow-[var(--shadow-soft)]"
            >
              <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)_220px]">
                <img
                  src={room.images[0]}
                  alt={room.hotel?.name}
                  className="aspect-[4/3] w-full rounded-[24px] object-cover"
                />
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                    {room.hotel?.city}
                  </p>
                  <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
                    {room.hotel?.name}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    {room.roomType}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                    Capacity {room.guestCapacity} · {room.bedroomCount} bedroom
                    {room.bedroomCount === 1 ? "" : "s"} · {room.bathroomCount}
                    {" "}bathroom{room.bathroomCount === 1 ? "" : "s"}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {room.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="rounded-full bg-white px-3 py-1 text-xs text-[var(--color-muted)] ring-1 ring-[var(--color-line)]"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col justify-between rounded-[24px] bg-white p-4 ring-1 ring-[var(--color-line)]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                      Nightly price
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
                      {formatCurrency(room.pricePerNight)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                      Status
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-2 text-xs font-semibold ${
                        room.isAvailable
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {room.isAvailable ? "Active" : "Draft"}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
