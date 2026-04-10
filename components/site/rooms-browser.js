"use client";

import Link from "next/link";
import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import { siteAssets } from "@/lib/mock-data";

const roomTypes = ["Single Bed", "Double Bed", "Family Suite", "Luxury Room"];
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

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-[28px] border border-[var(--color-line)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
              Filters
            </p>
            <h2 className="mt-2 font-display text-2xl text-[var(--color-ink)]">
              Refine results
            </h2>
          </div>
          <button
            type="button"
            className="rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-medium text-[var(--color-muted)] lg:hidden"
            onClick={() => setShowFilters((open) => !open)}
          >
            {showFilters ? "Hide" : "Show"}
          </button>
        </div>

        <div className={`${showFilters ? "mt-6 grid" : "mt-6 hidden"} gap-6 lg:grid`}>
          <div>
            <p className="text-sm font-semibold text-[var(--color-ink)]">
              Room type
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedType("")}
                className={`rounded-full px-3 py-2 text-xs font-medium ${
                  selectedType === ""
                    ? "bg-[var(--color-ink)] text-white"
                    : "bg-white text-[var(--color-muted)] ring-1 ring-[var(--color-line)]"
                }`}
              >
                All
              </button>
              {roomTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`rounded-full px-3 py-2 text-xs font-medium ${
                    selectedType === type
                      ? "bg-[var(--color-ink)] text-white"
                      : "bg-white text-[var(--color-muted)] ring-1 ring-[var(--color-line)]"
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
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm ${
                  selectedPrice === ""
                    ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"
                    : "bg-white text-[var(--color-muted)] ring-1 ring-[var(--color-line)]"
                }`}
              >
                Any budget
              </button>
              {priceOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedPrice(option.value)}
                  className={`w-full rounded-2xl px-4 py-3 text-left text-sm ${
                    selectedPrice === option.value
                      ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"
                      : "bg-white text-[var(--color-muted)] ring-1 ring-[var(--color-line)]"
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
              className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-highlight)]"
            >
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="city">City</option>
            </select>
          </label>
        </div>
      </aside>

      <div className="space-y-5">
        <div className="flex flex-col gap-4 rounded-[28px] border border-[var(--color-line)] bg-white/80 p-5 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
              Search summary
            </p>
            <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
              {visibleRooms.length} room{visibleRooms.length === 1 ? "" : "s"} ready
            </h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {initialCity
                ? `Showing matches around ${initialCity}.`
                : "Showing the current featured inventory and fallback demo data."}
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] hover:bg-white"
          >
            New search
          </Link>
        </div>

        <div className="grid gap-5">
          {visibleRooms.map((room) => (
            <Link
              key={room._id}
              href={`/rooms/${room._id}`}
              className="overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-[var(--color-card)] shadow-[var(--shadow-soft)]"
            >
              <div className="grid gap-5 p-4 sm:p-5 xl:grid-cols-[320px_minmax(0,1fr)]">
                <img
                  src={room.images[0]}
                  alt={room.hotel.name}
                  className="aspect-[4/3] w-full rounded-[22px] object-cover"
                />
                <div className="flex flex-col justify-between gap-5">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                          {room.hotel.city}
                        </p>
                        <h3 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
                          {room.hotel.name}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--color-muted)]">
                          {room.roomType}
                        </p>
                      </div>
                      <div className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-sm font-semibold text-[var(--color-accent-strong)]">
                        4.8 guest rating
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

                  <div className="flex flex-col gap-3 border-t border-[var(--color-line)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xl font-semibold text-[var(--color-ink)]">
                      {formatCurrency(room.pricePerNight)}
                      <span className="text-sm font-normal text-[var(--color-muted)]">
                        {" "}
                        / night
                      </span>
                    </p>
                    <span className="text-sm font-semibold text-[var(--color-highlight)]">
                      View room details
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
