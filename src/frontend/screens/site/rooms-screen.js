import { RoomsBrowser } from "@/src/frontend/features/rooms/rooms-browser.client";
import { getPublicRoomInventorySnapshot } from "@/lib/data";

function InventoryNotice({ source, message }) {
  if (!message || (source !== "fallback" && source !== "empty")) {
    return null;
  }

  const isFallback = source === "fallback";

  return (
    <div
      className={`mt-8 rounded-[28px] border px-5 py-4 text-sm leading-7 shadow-[var(--shadow-soft)] ${
        isFallback
          ? "border-[rgba(220,190,144,0.9)] bg-[rgba(255,247,232,0.96)] text-[var(--color-ink)]"
          : "border-[rgba(188,208,229,0.9)] bg-white/96 text-[var(--color-muted)]"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
        {isFallback ? "Preview inventory" : "Live inventory pending"}
      </p>
      <p className="mt-2">{message}</p>
    </div>
  );
}

export async function RoomsScreen({ searchParams }) {
  const params = await searchParams;
  const initialCity = params?.city || "";
  const inventorySnapshot = await getPublicRoomInventorySnapshot({
    filters: { city: initialCity },
  });
  const roomData = inventorySnapshot.rooms;

  return (
    <section className="section-space">
      <div className="page-shell">
        <div className="overflow-hidden rounded-[36px] border border-[rgba(188,208,229,0.9)] bg-[linear-gradient(135deg,rgba(19,48,75,0.96),rgba(39,89,131,0.94),rgba(137,186,229,0.82))] p-6 text-white shadow-[var(--shadow-lift)] sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
            <div className="flex max-w-3xl flex-col justify-between text-left">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/68">
                Find your stay
              </p>
              <h1 className="mt-4 font-display text-4xl text-white sm:text-[2.9rem]">
                Browse rooms with filters that stay easy to use on every screen
              </h1>
              <p className="mt-4 text-base leading-8 text-white/78 sm:text-[1.03rem]">
                Compare price, room type, and location without losing the clean
                reading flow that makes travel decisions feel simpler.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
              <div className="flex h-full flex-col rounded-[24px] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/66">
                  Search mode
                </p>
                <p className="mt-3 text-sm leading-7 text-white/82">
                  Filter quickly by room type, price, and city without losing
                  the list context.
                </p>
              </div>
              <div className="flex h-full flex-col rounded-[24px] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/66">
                  Current city
                </p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {initialCity || "All destinations"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <InventoryNotice
          source={inventorySnapshot.source}
          message={inventorySnapshot.inventoryReason}
        />

        <div className="mt-8">
          <RoomsBrowser
            rooms={roomData}
            initialCity={initialCity}
            inventorySource={inventorySnapshot.source}
          />
        </div>
      </div>
    </section>
  );
}
