import { createSupabaseAdminClient } from "@/src/backend/auth/supabase-admin-client";
import { createSupabaseServerClient } from "@/src/backend/auth/supabase-server-client";
import {
  hasBookingPaymentEnv,
  hasSupabasePublicEnv,
} from "@/src/backend/config/env";
import { getFallbackRoomImages } from "@/src/backend/repositories/demo-fallback-repository";

const BLOCKING_BOOKING_STATUSES = ["pending", "confirmed"];
const TRAVELER_BOOKING_COLUMNS =
  "id, room_id, user_id, check_in_date, check_out_date, guests, total_price, status, payment_status, payment_method, notes, created_at";
const TRAVELER_ROOM_COLUMNS = "id, hotel_id, name, room_type, image_urls";
const TRAVELER_HOTEL_COLUMNS = "id, name, city, address, contact_email";
const TRAVELER_PROFILE_COLUMNS = "full_name, email";

function getUnavailableBookingsState(reason) {
  return {
    status: "unavailable",
    bookings: [],
    reason,
  };
}

function getTravelerBookingPaymentState(row) {
  const bookingStatus = row.status || "pending";
  const paymentStatus = row.payment_status || "unpaid";
  const totalPrice = Number(row.total_price || 0);

  if (paymentStatus === "paid") {
    return {
      canPayOnline: false,
      paymentActionMessage: row.payment_method
        ? `Payment received via ${row.payment_method}.`
        : "Payment received.",
    };
  }

  if (paymentStatus === "refunded") {
    return {
      canPayOnline: false,
      paymentActionMessage: "This booking payment has already been refunded.",
    };
  }

  if (bookingStatus === "pending") {
    return {
      canPayOnline: false,
      paymentActionMessage:
        "Payment will open here once the hotel confirms this booking.",
    };
  }

  if (bookingStatus === "cancelled") {
    return {
      canPayOnline: false,
      paymentActionMessage: "This booking was cancelled before payment.",
    };
  }

  if (bookingStatus === "completed") {
    return {
      canPayOnline: false,
      paymentActionMessage: "This stay has already been completed.",
    };
  }

  if (totalPrice <= 0) {
    return {
      canPayOnline: false,
      paymentActionMessage: "This booking total is not ready for payment yet.",
    };
  }

  if (!hasBookingPaymentEnv()) {
    return {
      canPayOnline: false,
      paymentActionMessage:
        "Online booking payment is temporarily unavailable right now.",
    };
  }

  return {
    canPayOnline: true,
    paymentActionMessage:
      "Secure payment is ready for this confirmed booking.",
  };
}

function mapTravelerBooking(row, room, hotel) {
  const uploadedImages = room?.image_urls || [];
  const roomName = room?.name || room?.room_type || "Booked room";
  const paymentState = getTravelerBookingPaymentState(row);

  return {
    _id: row.id,
    checkInDate: row.check_in_date,
    checkOutDate: row.check_out_date,
    guests: row.guests,
    totalPrice: Number(row.total_price || 0),
    status: row.status || "pending",
    paymentStatus: row.payment_status || "unpaid",
    paymentMethod: row.payment_method || "",
    canPayOnline: paymentState.canPayOnline,
    paymentActionMessage: paymentState.paymentActionMessage,
    notes: row.notes || "",
    createdAt: row.created_at,
    room: {
      _id: room?.id || row.room_id || "",
      name: roomName,
      roomType: room?.room_type || roomName,
      images: uploadedImages.length ? uploadedImages : getFallbackRoomImages(),
      usesFallbackImages: uploadedImages.length === 0,
    },
    hotel: {
      _id: hotel?.id || "",
      name: hotel?.name || "Hotel unavailable",
      city: hotel?.city || "",
      address: hotel?.address || "Address unavailable",
    },
  };
}

function getRoomDisplayName(room) {
  return room?.name || room?.room_type || room?.roomType || "Booked room";
}

function buildBookingNotificationContext({
  event,
  bookingRow,
  roomRow,
  hotelRow,
  travelerProfile,
  travelerEmail = "",
  bookingOverrides = {},
}) {
  const roomName = getRoomDisplayName(roomRow);
  const mergedBooking = {
    ...bookingRow,
    ...bookingOverrides,
  };

  return {
    event: event || mergedBooking.status || "updated",
    traveler: {
      email: travelerProfile?.email || travelerEmail || "",
      fullName: travelerProfile?.full_name || "",
    },
    owner: {
      email: hotelRow?.contact_email || "",
    },
    room: {
      name: roomName,
      roomType: roomRow?.room_type || roomName,
    },
    hotel: {
      name: hotelRow?.name || "Hotel unavailable",
      city: hotelRow?.city || "",
      address: hotelRow?.address || "",
      contactEmail: hotelRow?.contact_email || "",
    },
    booking: {
      id: mergedBooking.id,
      checkInDate: mergedBooking.check_in_date,
      checkOutDate: mergedBooking.check_out_date,
      guests: mergedBooking.guests,
      totalPrice: Number(mergedBooking.total_price || 0),
      status: mergedBooking.status || "pending",
      paymentStatus: mergedBooking.payment_status || "unpaid",
      paymentMethod: mergedBooking.payment_method || "",
      notes: mergedBooking.notes || "",
    },
  };
}

async function getCurrentTravelerProfile(readClient, userId) {
  if (!userId) {
    return null;
  }

  try {
    const { data, error } = await readClient
      .from("profiles")
      .select(TRAVELER_PROFILE_COLUMNS)
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      return null;
    }

    return data || null;
  } catch {
    return null;
  }
}

async function getTravelerRooms(readClient, roomIds) {
  if (!roomIds.length) {
    return {
      rows: [],
      error: null,
    };
  }

  const { data, error } = await readClient
    .from("rooms")
    .select(TRAVELER_ROOM_COLUMNS)
    .in("id", roomIds);

  return {
    rows: data || [],
    error,
  };
}

async function getTravelerHotels(readClient, hotelIds) {
  if (!hotelIds.length) {
    return {
      rows: [],
      error: null,
    };
  }

  const { data, error } = await readClient
    .from("hotels")
    .select(TRAVELER_HOTEL_COLUMNS)
    .in("id", hotelIds);

  return {
    rows: data || [],
    error,
  };
}

function getNotPayableBookingState(reason) {
  return {
    status: "not_payable",
    booking: null,
    traveler: null,
    room: null,
    hotel: null,
    reason,
  };
}

export async function getBookings() {
  if (!hasSupabasePublicEnv()) {
    return getUnavailableBookingsState(
      "Supabase booking configuration is not available right now.",
    );
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return getUnavailableBookingsState(
      "Authenticated booking access is temporarily unavailable.",
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      status: "unauthenticated",
      bookings: [],
      reason: "Please log in to view your bookings.",
    };
  }

  const readClient = createSupabaseAdminClient() || supabase;
  const { data: bookingRows, error: bookingsError } = await readClient
    .from("bookings")
    .select(TRAVELER_BOOKING_COLUMNS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (bookingsError) {
    return getUnavailableBookingsState(
      bookingsError.message ||
        "We could not load your bookings right now. Please try again shortly.",
    );
  }

  const bookings = bookingRows || [];

  if (!bookings.length) {
    return {
      status: "empty",
      bookings: [],
      reason: "",
    };
  }

  const roomIds = [...new Set(bookings.map((booking) => booking.room_id).filter(Boolean))];
  const { rows: roomRows, error: roomsError } = await getTravelerRooms(
    readClient,
    roomIds,
  );

  if (roomsError) {
    return getUnavailableBookingsState(
      roomsError.message ||
        "We could not load the room details for your bookings right now.",
    );
  }

  const roomMap = new Map(roomRows.map((room) => [room.id, room]));
  const hotelIds = [
    ...new Set(roomRows.map((room) => room.hotel_id).filter(Boolean)),
  ];
  const { rows: hotelRows, error: hotelsError } = await getTravelerHotels(
    readClient,
    hotelIds,
  );

  if (hotelsError) {
    return getUnavailableBookingsState(
      hotelsError.message ||
        "We could not load the hotel details for your bookings right now.",
    );
  }

  const hotelMap = new Map(hotelRows.map((hotel) => [hotel.id, hotel]));

  return {
    status: "ready",
    bookings: bookings.map((booking) => {
      const room = roomMap.get(booking.room_id) || null;
      const hotel = room ? hotelMap.get(room.hotel_id) || null : null;
      return mapTravelerBooking(booking, room, hotel);
    }),
    reason: "",
  };
}

export async function getTravelerBookingCheckoutData(bookingId) {
  if (!hasSupabasePublicEnv()) {
    return {
      status: "unavailable",
      booking: null,
      traveler: null,
      room: null,
      hotel: null,
      reason: "Supabase booking configuration is not available right now.",
    };
  }

  if (!hasBookingPaymentEnv()) {
    return {
      status: "unavailable",
      booking: null,
      traveler: null,
      room: null,
      hotel: null,
      reason: "Online booking payment is temporarily unavailable right now.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      status: "unavailable",
      booking: null,
      traveler: null,
      room: null,
      hotel: null,
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
      traveler: null,
      room: null,
      hotel: null,
      reason: "Please log in to pay for this booking.",
    };
  }

  const readClient = createSupabaseAdminClient();

  if (!readClient) {
    return {
      status: "unavailable",
      booking: null,
      traveler: null,
      room: null,
      hotel: null,
      reason: "Trusted booking payment access is temporarily unavailable.",
    };
  }

  const { data: bookingRow, error: bookingError } = await readClient
    .from("bookings")
    .select(TRAVELER_BOOKING_COLUMNS)
    .eq("id", bookingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (bookingError) {
    return {
      status: "unavailable",
      booking: null,
      traveler: null,
      room: null,
      hotel: null,
      reason:
        bookingError.message ||
        "We could not load this booking for payment right now.",
    };
  }

  if (!bookingRow) {
    return {
      status: "not_found",
      booking: null,
      traveler: null,
      room: null,
      hotel: null,
      reason: "This booking is not available in your traveler account.",
    };
  }

  if (bookingRow.payment_status === "paid") {
    return {
      status: "already_paid",
      booking: null,
      traveler: null,
      room: null,
      hotel: null,
      reason: "This booking has already been paid.",
    };
  }

  if (bookingRow.status !== "confirmed") {
    return getNotPayableBookingState(
      bookingRow.status === "pending"
        ? "This booking must be confirmed by the hotel before payment opens."
        : "This booking is no longer payable in its current status.",
    );
  }

  if (Number(bookingRow.total_price || 0) <= 0) {
    return getNotPayableBookingState(
      "This booking total is not ready for online payment yet.",
    );
  }

  const { data: roomRow, error: roomError } = await readClient
    .from("rooms")
    .select("id, hotel_id, name, room_type")
    .eq("id", bookingRow.room_id)
    .maybeSingle();

  if (roomError || !roomRow) {
    return {
      status: "unavailable",
      booking: null,
      traveler: null,
      room: null,
      hotel: null,
      reason:
        roomError?.message ||
        "We could not load the room details for this booking right now.",
    };
  }

  const { data: hotelRow, error: hotelError } = await readClient
    .from("hotels")
    .select("id, name")
    .eq("id", roomRow.hotel_id)
    .maybeSingle();

  if (hotelError || !hotelRow) {
    return {
      status: "unavailable",
      booking: null,
      traveler: null,
      room: null,
      hotel: null,
      reason:
        hotelError?.message ||
        "We could not load the hotel details for this booking right now.",
    };
  }

  const travelerProfile = await getCurrentTravelerProfile(readClient, user.id);

  return {
    status: "ready",
    booking: {
      id: bookingRow.id,
      userId: bookingRow.user_id,
      checkInDate: bookingRow.check_in_date,
      checkOutDate: bookingRow.check_out_date,
      totalPrice: Number(bookingRow.total_price || 0),
      status: bookingRow.status,
      paymentStatus: bookingRow.payment_status,
    },
    traveler: {
      email: travelerProfile?.email || user.email || "",
      fullName:
        travelerProfile?.full_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        "",
    },
    room: {
      id: roomRow.id,
      name: roomRow.name || roomRow.room_type || "Booked room",
      roomType: roomRow.room_type || roomRow.name || "Booked room",
    },
    hotel: {
      id: hotelRow.id,
      name: hotelRow.name || "Hotel unavailable",
    },
    reason: "",
  };
}

export async function getBookingNotificationContext(bookingId, options = {}) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return {
      status: "unavailable",
      notificationContext: null,
      reason: "Trusted booking email data is temporarily unavailable.",
    };
  }

  const { data: bookingRow, error: bookingError } = await adminClient
    .from("bookings")
    .select(TRAVELER_BOOKING_COLUMNS)
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError) {
    return {
      status: "unavailable",
      notificationContext: null,
      reason:
        bookingError.message ||
        "We could not load the booking email details right now.",
    };
  }

  if (!bookingRow) {
    return {
      status: "not_found",
      notificationContext: null,
      reason: "This booking no longer exists.",
    };
  }

  const { data: roomRow, error: roomError } = await adminClient
    .from("rooms")
    .select("id, hotel_id, name, room_type")
    .eq("id", bookingRow.room_id)
    .maybeSingle();

  if (roomError || !roomRow) {
    return {
      status: "unavailable",
      notificationContext: null,
      reason:
        roomError?.message ||
        "We could not load the room details for this booking right now.",
    };
  }

  const { data: hotelRow, error: hotelError } = await adminClient
    .from("hotels")
    .select("id, name, city, address, contact_email")
    .eq("id", roomRow.hotel_id)
    .maybeSingle();

  if (hotelError || !hotelRow) {
    return {
      status: "unavailable",
      notificationContext: null,
      reason:
        hotelError?.message ||
        "We could not load the hotel details for this booking right now.",
    };
  }

  const travelerProfile = await getCurrentTravelerProfile(
    adminClient,
    bookingRow.user_id,
  );

  return {
    status: "ready",
    notificationContext: buildBookingNotificationContext({
      event: options.event || "",
      bookingRow,
      roomRow,
      hotelRow,
      travelerProfile,
      travelerEmail: options.travelerEmail || "",
      bookingOverrides: options.bookingOverrides || {},
    }),
    reason: "",
  };
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
    .select("id, hotel_id, name, room_type, price_per_night, guest_capacity")
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
    .select("id, name, city, address, contact_email, status")
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
  const travelerProfile = await getCurrentTravelerProfile(supabase, user.id);
  const roomName = getRoomDisplayName(roomRow);

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
        name: roomName,
        roomType: roomRow.room_type,
      },
      hotel: {
        _id: hotelRow.id,
        name: hotelRow.name,
        city: hotelRow.city || "",
        address: hotelRow.address || "",
      },
    },
    notificationContext: buildBookingNotificationContext({
      event: "created",
      bookingRow,
      roomRow,
      hotelRow,
      travelerProfile: {
        full_name:
          travelerProfile?.full_name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          "",
        email: travelerProfile?.email || user.email || "",
      },
      travelerEmail: user.email || "",
    }),
    reason: "",
  };
}

export async function markBookingAsPaid(bookingId, paymentMethod = "stripe") {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return {
      status: "unavailable",
      booking: null,
      reason: "Trusted booking payment updates are temporarily unavailable.",
    };
  }

  const { data: bookingRow, error: bookingError } = await adminClient
    .from("bookings")
    .select(TRAVELER_BOOKING_COLUMNS)
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError) {
    return {
      status: "unavailable",
      booking: null,
      reason:
        bookingError.message ||
        "We could not load the booking payment state right now.",
    };
  }

  if (!bookingRow) {
    return {
      status: "not_found",
      booking: null,
      reason: "This booking no longer exists.",
    };
  }

  if (bookingRow.payment_status === "paid") {
    return {
      status: "already_paid",
      booking: {
        _id: bookingRow.id,
        paymentStatus: bookingRow.payment_status,
        paymentMethod: bookingRow.payment_method || paymentMethod,
      },
      reason: "",
    };
  }

  if (bookingRow.status !== "confirmed") {
    return {
      status: "not_payable",
      booking: null,
      reason: "Only confirmed bookings can be marked as paid.",
    };
  }

  const { data: updatedRow, error: updateError } = await adminClient
    .from("bookings")
    .update({
      payment_status: "paid",
      payment_method: paymentMethod || "stripe",
    })
    .eq("id", bookingId)
    .eq("status", "confirmed")
    .eq("payment_status", "unpaid")
    .select(TRAVELER_BOOKING_COLUMNS)
    .maybeSingle();

  if (updateError) {
    return {
      status: "unavailable",
      booking: null,
      reason:
        updateError.message ||
        "We could not update the booking payment status right now.",
    };
  }

  if (!updatedRow) {
    const { data: latestRow } = await adminClient
      .from("bookings")
      .select(TRAVELER_BOOKING_COLUMNS)
      .eq("id", bookingId)
      .maybeSingle();

    if (latestRow?.payment_status === "paid") {
      return {
        status: "already_paid",
        booking: {
          _id: latestRow.id,
          paymentStatus: latestRow.payment_status,
          paymentMethod: latestRow.payment_method || paymentMethod,
        },
        reason: "",
      };
    }

    return {
      status: "not_payable",
      booking: null,
      reason: "This booking payment can no longer be updated automatically.",
    };
  }

  return {
    status: "updated",
    booking: {
      _id: updatedRow.id,
      paymentStatus: updatedRow.payment_status,
      paymentMethod: updatedRow.payment_method || paymentMethod,
    },
    reason: "",
  };
}
