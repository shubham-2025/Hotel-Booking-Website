import Link from "next/link";
import { formatCurrency } from "@/src/frontend/lib/format";
import { siteAssets } from "@/src/frontend/assets";

export function HotelCard({ room, featuredLabel = "Best Seller" }) {
  return (
    <Link
      href={`/rooms/${room._id}`}
      className="group motion-lift surface-card overflow-hidden rounded-[30px]"
    >
      <div className="relative aspect-[4/2.75] overflow-hidden">
        <img
          src={room.images[0]}
          alt={room.hotel.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink)]">
          {featuredLabel}
        </span>
        <span className="absolute right-4 top-4 rounded-full bg-[rgba(18,36,59,0.8)] px-3 py-1 text-sm font-semibold text-white backdrop-blur">
          4.8
        </span>
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
              {room.hotel.city}
            </p>
            <p className="mt-2 line-clamp-2 font-display text-[1.45rem] leading-tight text-[var(--color-ink)]">
              {room.hotel.name}
            </p>
            <p className="mt-1 text-sm font-medium text-[var(--color-muted)]">
              {room.roomType}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
          <img
            src={siteAssets.locationIcon}
            alt=""
            className="h-4 w-4 opacity-70"
          />
          <span className="line-clamp-1">{room.hotel.address}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {room.amenities.slice(0, 3).map((amenity) => (
            <span
              key={amenity}
              className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[var(--color-muted)] ring-1 ring-[var(--color-line)]"
            >
              {amenity}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-[var(--color-line)] pt-3">
          <p className="text-lg font-semibold text-[var(--color-ink)]">
            {formatCurrency(room.pricePerNight)}
            <span className="text-sm font-normal text-[var(--color-muted)]">
              {" "}
              / night
            </span>
          </p>
          <span className="text-sm font-semibold text-[var(--color-highlight)] transition group-hover:translate-x-0.5">
            View stay
          </span>
        </div>
      </div>
    </Link>
  );
}
