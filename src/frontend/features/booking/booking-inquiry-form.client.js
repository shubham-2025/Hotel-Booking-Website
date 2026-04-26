"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

function TravelerIdentityCard({ traveler }) {
  return (
    <div className="mt-4 rounded-[22px] bg-[var(--color-card-soft)] px-4 py-3 text-sm leading-7 text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
      <p className="font-semibold text-[var(--color-ink)]">
        Reserving as {traveler?.full_name || traveler?.email || "guest"}
      </p>
      <p className="mt-1">
        {traveler?.email || "Email unavailable"}
        {traveler?.phone ? ` | ${traveler.phone}` : ""}
      </p>
    </div>
  );
}

function LoggedOutBookingState({ room }) {
  return (
    <div className="surface-card rounded-[32px] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow-label">Book this stay</p>
          <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
            Sign in to reserve this stay
          </h2>
        </div>
        <span className="pill-muted">Traveler account required</span>
      </div>

      <div className="mt-4 rounded-[22px] bg-[var(--color-card-soft)] px-4 py-3 text-sm leading-7 text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
        Sign in so your stay details, payment progress, and booking updates are
        all kept together in your personal account.
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/login?next=/rooms/${room._id}`}
          className="button-accent min-h-12 px-5"
        >
          Login to book
        </Link>
        <Link
          href={`/create-account?next=/rooms/${room._id}`}
          className="button-secondary min-h-12 px-5"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}

function RealBookingForm({ room, traveler }) {
  const [formState, setFormState] = useState({
    checkInDate: "",
    checkOutDate: "",
    guests: 2,
    notes: "",
  });
  const [isPending, startTransition] = useTransition();

  function updateField(key, value) {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    startTransition(async () => {
      const toastId = toast.loading("Creating your booking...");
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: room._id,
          checkInDate: formState.checkInDate,
          checkOutDate: formState.checkOutDate,
          guests: formState.guests,
          notes: formState.notes,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(
          payload.message ||
            "We could not create your booking right now. Please try again shortly.",
          { id: toastId },
        );
        return;
      }

      setFormState({
        checkInDate: "",
        checkOutDate: "",
        guests: 2,
        notes: "",
      });
      toast.success(
        payload.message || "Your stay request has been received successfully.",
        { id: toastId },
      );
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="surface-card rounded-[32px] p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow-label">Book this stay</p>
          <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
            Reserve your stay in a few calm steps
          </h2>
        </div>
        <span className="pill-muted">Fast confirmation flow</span>
      </div>

      <TravelerIdentityCard traveler={traveler} />

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Check in
          </span>
          <input
            type="date"
            required
            value={formState.checkInDate}
            onChange={(event) => updateField("checkInDate", event.target.value)}
            className="field-input"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Check out
          </span>
          <input
            type="date"
            required
            value={formState.checkOutDate}
            onChange={(event) => updateField("checkOutDate", event.target.value)}
            className="field-input"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Guests
          </span>
          <input
            type="number"
            min="1"
            max={room.guestCapacity || 8}
            required
            value={formState.guests}
            onChange={(event) => updateField("guests", event.target.value)}
            className="field-input"
          />
        </label>

        <div className="rounded-[24px] bg-[var(--color-card-soft)] px-4 py-3 text-sm leading-7 text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
          Designed for up to {room.guestCapacity || 0} guest
          {room.guestCapacity === 1 ? "" : "s"}, with availability checked
          before your stay request is placed.
        </div>
      </div>

      <label className="mt-4 block space-y-2">
        <span className="text-sm font-medium text-[var(--color-ink)]">
          Notes for the hotel
        </span>
        <textarea
          rows="4"
          value={formState.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          className="field-textarea"
          placeholder="Mention arrival timing, bed preference, accessibility needs, or any special request."
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="button-accent mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Reserving your stay..." : "Reserve your stay"}
      </button>
    </form>
  );
}

function FallbackInquiryForm({ room }) {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    checkInDate: "",
    checkOutDate: "",
    guests: 2,
    message: "",
  });
  const [isPending, startTransition] = useTransition();

  function updateField(key, value) {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    startTransition(async () => {
      const toastId = toast.loading("Sending your request...");
      const response = await fetch("/api/booking-inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formState,
          roomId: room._id,
          hotelId: room.hotel._id,
          hotelName: room.hotel.name,
          roomType: room.roomType,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(
          payload.message ||
            "We could not send your request right now. Please try again shortly.",
          { id: toastId },
        );
        return;
      }

      setFormState({
        name: "",
        email: "",
        phone: "",
        checkInDate: "",
        checkOutDate: "",
        guests: 2,
        message: "",
      });
      toast.success(
        "Your request has been sent. The hotel can now review your preferred dates and details.",
        { id: toastId },
      );
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="surface-card rounded-[32px] p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow-label">Request this stay</p>
          <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
            Ask about availability in a few quick steps
          </h2>
        </div>
        <span className="pill-muted">Replies usually within a day</span>
      </div>

      <div className="mt-4 rounded-[22px] bg-[var(--color-card-soft)] px-4 py-3 text-sm leading-7 text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
        Send your preferred dates and details, and the hotel can reply with the
        best way to continue your stay planning.
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Full name
          </span>
          <input
            required
            autoComplete="name"
            value={formState.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="field-input"
            placeholder="Your full name"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Email
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={formState.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="field-input"
            placeholder="you@example.com"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Phone
          </span>
          <input
            type="tel"
            autoComplete="tel"
            value={formState.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className="field-input"
            placeholder="+91 98765 43210"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Guests
          </span>
          <input
            type="number"
            min="1"
            max="8"
            required
            value={formState.guests}
            onChange={(event) => updateField("guests", event.target.value)}
            className="field-input"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Check in
          </span>
          <input
            type="date"
            required
            value={formState.checkInDate}
            onChange={(event) => updateField("checkInDate", event.target.value)}
            className="field-input"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Check out
          </span>
          <input
            type="date"
            required
            value={formState.checkOutDate}
            onChange={(event) => updateField("checkOutDate", event.target.value)}
            className="field-input"
          />
        </label>
      </div>

      <label className="mt-4 block space-y-2">
        <span className="text-sm font-medium text-[var(--color-ink)]">
          Notes for the hotel
        </span>
        <textarea
          rows="4"
          value={formState.message}
          onChange={(event) => updateField("message", event.target.value)}
          className="field-textarea"
          placeholder="Mention arrival time, bed preference, accessibility needs, or any special request."
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="button-accent mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Sending request..." : "Send booking request"}
      </button>
    </form>
  );
}

export function BookingInquiryForm({ room, traveler, isAuthenticated }) {
  if (room.isBookablePublic) {
    if (!isAuthenticated) {
      return <LoggedOutBookingState room={room} />;
    }

    return <RealBookingForm room={room} traveler={traveler} />;
  }

  return <FallbackInquiryForm room={room} />;
}
