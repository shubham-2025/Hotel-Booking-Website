import { createSupabaseAdminClient } from "@/src/backend/auth/supabase-admin-client";
import { createSupabaseServerClient } from "@/src/backend/auth/supabase-server-client";
import { hasSupabasePublicEnv } from "@/src/backend/config/env";
import { getFallbackBookings } from "@/src/backend/repositories/demo-fallback-repository";

const BLOCKING_BOOKING_STATUSES = ["pending", "confirmed"];

export async function getBookings() {
  return getFallbackBookings();
}

function parseUtcDate(value) {
  return new Date(`${value}T00:00:00Z`);
}

function getMidnightUtcToday() {
  const today = new Date();
  return new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
}

function getNightCount(checkInDate, checkOutDate) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.round(
    (parseUtcDate(checkOutDate).getTime() - parseUtcDate(checkInDate).getTime()) /
      millisecondsPerDay,
  );
}

async function getBookingConflict({ roomId, checkInDate, checkOutDate }) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return {
      status: "unavailable",
      booking: null,
      reason:
        "Trusted availability validation is temporarily unavailable right now.",
    };
  }

  const { data, error } = await adminClient
    .from("bookings")
    .select("id, status, check_in_date, check_out_date")
    .eq("room_id", roomId)
    .in("status", BLOCKING_BOOKING_STATUSES)
    .lt("check_in_date", checkOutDate)
    .gt("check_out_date", checkInDate)
    .limit(1);

  if (error) {
    return {
      status: "unavailable",
      booking: null,
      reason:
        error.message ||
        "We could not verify room availability right now. Please try again shortly.",
    };
  }

  const conflictingBooking = data?.[0] || null;

  if (!conflictingBooking) {
    return {
      status: "clear",
      booking: null,
      reason: "",
    };
  }

  return {
    status: "conflict",
    booking: conflictingBooking,
    reason:
      "These dates are no longer available for this room. Please choose a different stay window.",
  };
}

export async function createBookingRecord(payload) {
  if (!hasSupabasePublicEnv()) {
    return {
      status: "unavailable",
      booking: null,
      reason: "Supabase booking configuration is not available right now.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      status: "unavailable",
      booking: null,
      reason: "Authenticated booking access is temporarily unavailable.",
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      status: "unauthenticated",
      booking: null,
      reason: "Please log in to create a booking.",
    };
  }

  const { data: roomRow, error: roomError } = await supabase
    .from("rooms")
    .select("id, hotel_id, room_type, price_per_night, guest_capacity")
    .eq("id", payload.roomId)
    .eq("is_active", true)
    .maybeSingle();

  if (roomError) {
    return {
      status: "unavailable",
      booking: null,
      reason:
        roomError.message ||
        "We could not verify this room right now. Please try again shortly.",
    };
  }

  if (!roomRow) {
    return {
      status: "not_bookable",
      booking: null,
      reason: "This room is no longer available for direct booking.",
    };
  }

  const { data: hotelRow, error: hotelError } = await supabase
    .from("hotels")
    .select("id, name, status")
    .eq("id", roomRow.hotel_id)
    .eq("status", "active")
    .maybeSingle();

  if (hotelError) {
    return {
      status: "unavailable",
      booking: null,
      reason:
        hotelError.message ||
        "We could not verify this hotel right now. Please try again shortly.",
    };
  }

  if (!hotelRow) {
    return {
      status: "not_bookable",
      booking: null,
      reason: "This hotel is not public for booking right now.",
    };
  }

  const checkInDate = parseUtcDate(payload.checkInDate);
  const checkOutDate = parseUtcDate(payload.checkOutDate);
  const today = getMidnightUtcToday();

  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    return {
      status: "invalid_dates",
      booking: null,
      reason: "Please choose valid travel dates.",
    };
  }

  if (checkInDate < today) {
    return {
      status: "invalid_dates",
      booking: null,
      reason: "Check-in date cannot be in the past.",
    };
  }

  if (checkOutDate <= checkInDate) {
    return {
      status: "invalid_dates",
      booking: null,
      reason: "Check-out date must be after check-in date.",
    };
  }

  if (payload.guests > roomRow.guest_capacity) {
    return {
      status: "invalid_guests",
      booking: null,
      reason: `This room allows up to ${roomRow.guest_capacity} guest${roomRow.guest_capacity === 1 ? "" : "s"}.`,
    };
  }

  const bookingConflict = await getBookingConflict({
    roomId: roomRow.id,
    checkInDate: payload.checkInDate,
    checkOutDate: payload.checkOutDate,
  });

  if (bookingConflict.status === "unavailable") {
    return {
      status: "unavailable",
      booking: null,
      reason: bookingConflict.reason,
    };
  }

  if (bookingConflict.status === "conflict") {
    return {
      status: "conflict",
      booking: null,
      reason: bookingConflict.reason,
    };
  }

  const nightCount = getNightCount(payload.checkInDate, payload.checkOutDate);
  const totalPrice = Number(roomRow.price_per_night) * nightCount;

  const { data: bookingRow, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      room_id: roomRow.id,
      user_id: user.id,
      check_in_date: payload.checkInDate,
      check_out_date: payload.checkOutDate,
      guests: payload.guests,
      total_price: totalPrice,
      status: "pending",
      payment_status: "unpaid",
      notes: payload.notes || null,
    })
    .select(
      "id, room_id, user_id, check_in_date, check_out_date, guests, total_price, status, payment_status, payment_method, notes, created_at",
    )
    .single();

  if (bookingError) {
    return {
      status: "unavailable",
      booking: null,
      reason:
        bookingError.message ||
        "We could not create your booking right now. Please try again shortly.",
    };
  }

  return {
    status: "created",
    booking: {
      _id: bookingRow.id,
      checkInDate: bookingRow.check_in_date,
      checkOutDate: bookingRow.check_out_date,
      guests: bookingRow.guests,
      totalPrice: Number(bookingRow.total_price || 0),
      status: bookingRow.status,
      paymentStatus: bookingRow.payment_status,
      createdAt: bookingRow.created_at,
      notes: bookingRow.notes || "",
      room: {
        _id: roomRow.id,
        roomType: roomRow.room_type,
      },
      hotel: {
        _id: hotelRow.id,
        name: hotelRow.name,
      },
    },
    reason: "",
  };
}
