import Link from "next/link";
import { formatCurrency } from "@/src/frontend/lib/format";
import { getRooms } from "@/lib/data";

export async function OwnerListRoomScreen() {
  const rooms = await getRooms();

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
            The original table has been replaced with responsive inventory cards.
            Next step is wiring publish toggles and edits to authenticated owner
            actions in Supabase.
          </p>
        </div>
        <Link
          href="/owner/add-room"
          className="rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold text-white"
        >
          Add another room
        </Link>
      </div>

      <div className="mt-8 grid gap-4">
        {rooms.map((room) => (
          <article
            key={room._id}
            className="rounded-[28px] border border-[var(--color-line)] bg-[#fbfcfe] p-4 shadow-[var(--shadow-soft)]"
          >
            <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)_180px]">
              <img
                src={room.images[0]}
                alt={room.hotel.name}
                className="aspect-[4/3] w-full rounded-[24px] object-cover"
              />
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                  {room.hotel.city}
                </p>
                <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
                  {room.hotel.name}
                </h2>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  {room.roomType}
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
    </div>
  );
}
