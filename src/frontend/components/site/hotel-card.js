import Link from "next/link";
import { formatCurrency } from "@/src/frontend/lib/format";
import { siteAssets } from "@/src/frontend/assets";

export function HotelCard({ room, featuredLabel = "Best Seller" }) {
  return (
    <Link
      href={`/rooms/${room._id}`}
      className="group overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-[var(--color-card)] shadow-[var(--shadow-soft)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={room.images[0]}
          alt={room.hotel.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-[var(--color-ink)]">
          {featuredLabel}
        </span>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-2xl text-[var(--color-ink)]">
              {room.hotel.name}
            </p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {room.roomType}
            </p>
          </div>
          <div className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-sm font-medium text-[var(--color-accent-strong)]">
            4.8
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
          <img
            src={siteAssets.locationIcon}
            alt=""
            className="h-4 w-4 opacity-70"
          />
          <span>{room.hotel.address}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {room.amenities.slice(0, 3).map((amenity) => (
            <span
              key={amenity}
              className="rounded-full bg-white px-3 py-1 text-xs text-[var(--color-muted)] ring-1 ring-[var(--color-line)]"
            >
              {amenity}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-[var(--color-line)] pt-4">
          <p className="text-lg font-semibold text-[var(--color-ink)]">
            {formatCurrency(room.pricePerNight)}
            <span className="text-sm font-normal text-[var(--color-muted)]">
              {" "}
              / night
            </span>
          </p>
          <span className="text-sm font-semibold text-[var(--color-highlight)]">
            Explore room
          </span>
        </div>
      </div>
    </Link>
  );
}
