"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/src/frontend/lib/format";
import { siteAssets } from "@/src/frontend/assets";

const priceOptions = [
  { label: "Under $250", value: "budget", range: [0, 250] },
  { label: "$250 to $350", value: "mid", range: [250, 350] },
  { label: "$350+", value: "premium", range: [351, 10000] },
];

export function RoomsBrowser({ rooms, initialCity = "" }) {
  const [selectedType, setSelectedType] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [sortBy, setSortBy] = useState("price-asc");
  const [showFilters, setShowFilters] = useState(false);

  const roomTypes = useMemo(
    () => Array.from(new Set(rooms.map((room) => room.roomType))),
    [rooms],
  );

  const visibleRooms = rooms
    .filter((room) =>
      initialCity
        ? room.hotel.city.toLowerCase().includes(initialCity.toLowerCase())
        : true,
    )
    .filter((room) => (selectedType ? room.roomType === selectedType : true))
    .filter((room) => {
      if (!selectedPrice) {
        return true;
      }

      const option = priceOptions.find((item) => item.value === selectedPrice);

      if (!option) {
        return true;
      }

      return (
        room.pricePerNight >= option.range[0] &&
        room.pricePerNight <= option.range[1]
      );
    })
    .sort((first, second) => {
      if (sortBy === "price-desc") {
        return second.pricePerNight - first.pricePerNight;
      }

      if (sortBy === "city") {
        return first.hotel.city.localeCompare(second.hotel.city);
      }

      return first.pricePerNight - second.pricePerNight;
    });

  const hasActiveFilters = Boolean(selectedType || selectedPrice);

  function resetFilters() {
    setSelectedType("");
    setSelectedPrice("");
    setSortBy("price-asc");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="surface-card xl:sticky xl:top-24 xl:self-start">
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow-label">Filters</p>
              <h2 className="mt-3 font-display text-2xl text-[var(--color-ink)]">
                Refine your options
              </h2>
            </div>
            <button
              type="button"
              className="button-secondary min-h-10 px-4 text-xs lg:hidden"
              onClick={() => setShowFilters((open) => !open)}
            >
              {showFilters ? "Hide" : "Show"}
            </button>
          </div>

          <div
            className={`${showFilters ? "mt-6 grid" : "mt-6 hidden"} gap-6 lg:grid`}
          >
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">
                Room type
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedType("")}
                  className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                    selectedType === ""
                      ? "bg-[var(--color-ink)] text-white"
                      : "bg-white text-[var(--color-muted)] ring-1 ring-[var(--color-line)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  All
                </button>
                {roomTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                      selectedType === type
                        ? "bg-[var(--color-ink)] text-white"
                        : "bg-white text-[var(--color-muted)] ring-1 ring-[var(--color-line)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">
                Price range
              </p>
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => setSelectedPrice("")}
                  className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    selectedPrice === ""
                      ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"
                      : "bg-white text-[var(--color-muted)] ring-1 ring-[var(--color-line)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  Any budget
                </button>
                {priceOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedPrice(option.value)}
                    className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                      selectedPrice === option.value
                        ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"
                        : "bg-white text-[var(--color-muted)] ring-1 ring-[var(--color-line)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-[var(--color-ink)]">
                Sort by
              </span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="field-select text-sm"
              >
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="city">City</option>
              </select>
            </label>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="button-secondary w-full"
              >
                Reset filters
              </button>
            ) : null}
          </div>
        </div>
      </aside>

      <div className="space-y-5 min-w-0">
        <div className="surface-card flex flex-col gap-4 rounded-[28px] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow-label">Search summary</p>
            <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
              {visibleRooms.length} stay option{visibleRooms.length === 1 ? "" : "s"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              {initialCity
                ? `Showing matches around ${initialCity}. Adjust filters to narrow the list further.`
                : "Explore the current room collection with a calmer, easier-to-scan layout."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {initialCity ? <span className="pill-muted">{initialCity}</span> : null}
            <Link href="/" className="button-secondary min-h-11 px-4">
              New search
            </Link>
          </div>
        </div>

        {visibleRooms.length === 0 ? (
          <div className="surface-card rounded-[30px] p-8 text-center">
            <p className="eyebrow-label justify-center">No matches yet</p>
            <h3 className="mt-4 font-display text-3xl text-[var(--color-ink)]">
              Try widening your filters
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[var(--color-muted)]">
              We could not find a room that matches the current combination. A
              broader price range or another room type should bring options back.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="button-primary"
              >
                Clear filters
              </button>
              <Link href="/" className="button-secondary">
                Start a new search
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-5">
            {visibleRooms.map((room) => (
              <Link
                key={room._id}
                href={`/rooms/${room._id}`}
                className="group surface-card motion-lift h-full overflow-hidden rounded-[28px]"
              >
                <div className="grid gap-5 p-4 sm:p-5 2xl:grid-cols-[320px_minmax(0,1fr)]">
                  <img
                    src={room.images[0]}
                    alt={room.hotel.name}
                    className="aspect-[4/3] w-full rounded-[22px] object-cover"
                  />
                  <div className="flex min-w-0 flex-col justify-between gap-5">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                            {room.hotel.city}
                          </p>
                          <h3 className="mt-2 break-words font-display text-3xl text-[var(--color-ink)] [overflow-wrap:anywhere]">
                            {room.hotel.name}
                          </h3>
                          <p className="mt-1 text-sm font-medium text-[var(--color-muted)]">
                            {room.roomType}
                          </p>
                        </div>
                        <div className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-sm font-semibold text-[var(--color-accent-strong)]">
                          4.8 guest rating
                        </div>
                      </div>

                      <div className="flex min-w-0 items-center gap-2 text-sm text-[var(--color-muted)]">
                        <img
                          src={siteAssets.locationIcon}
                          alt=""
                          className="h-4 w-4 opacity-70"
                        />
                        <span className="line-clamp-2 break-words [overflow-wrap:anywhere]">
                          {room.hotel.address}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {room.amenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[var(--color-muted)] ring-1 ring-[var(--color-line)]"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-[var(--color-line)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xl font-semibold text-[var(--color-ink)]">
                        {formatCurrency(room.pricePerNight)}
                        <span className="text-sm font-normal text-[var(--color-muted)]">
                          {" "}
                          / night
                        </span>
                      </p>
                      <span className="text-sm font-semibold text-[var(--color-highlight)] transition group-hover:translate-x-0.5">
                        See room details
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
