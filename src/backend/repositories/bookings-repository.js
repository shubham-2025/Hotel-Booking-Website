import { createSupabaseAdminClient } from "@/src/backend/auth/supabase-admin-client";
import { createSupabaseServerClient } from "@/src/backend/auth/supabase-server-client";
import {
  hasBookingPaymentEnv,
  hasSupabasePublicEnv,
} from "@/src/backend/config/env";
import { isBookingInvoiceAccessTokenValid } from "@/src/backend/invoices/booking-invoice-access";
import { getFallbackRoomImages } from "@/src/backend/repositories/demo-fallback-repository";

const BLOCKING_BOOKING_STATUSES = ["pending", "confirmed"];
const LEGACY_TRAVELER_BOOKING_COLUMNS =
  "id, room_id, user_id, check_in_date, check_out_date, guests, total_price, status, payment_status, payment_method, notes, created_at, updated_at";
const TRACKED_TRAVELER_BOOKING_COLUMNS =
  "id, room_id, user_id, check_in_date, check_out_date, guests, total_price, status, payment_status, payment_method, payment_provider, payment_reference, payment_intent_id, payment_paid_at, payment_last_event, payment_last_event_at, payment_last_error, notes, created_at, updated_at";
const TRAVELER_ROOM_COLUMNS = "id, hotel_id, name, room_type, image_urls";
const TRAVELER_HOTEL_COLUMNS = "id, name, city, address, contact_email";
const TRAVELER_PROFILE_COLUMNS = "full_name, email";
const STRIPE_PAYMENT_PROVIDER = "stripe";
const MAX_STRIPE_RECOVERY_CANDIDATES = 8;

let bookingsPaymentColumnsAvailable = null;

function getUnavailableBookingsState(reason) {
  return {
    status: "unavailable",
    bookings: [],
    reason,
  };
}

function isMissingBookingPaymentColumnError(error) {
  return (
    error?.code === "42703" &&
    String(error.message || "").includes("bookings.payment_")
  );
}

function getTravelerBookingColumns(paymentColumnsAvailable) {
  return paymentColumnsAvailable === false
    ? LEGACY_TRAVELER_BOOKING_COLUMNS
    : TRACKED_TRAVELER_BOOKING_COLUMNS;
}

function normalizeBookingRow(row) {
  return {
    ...row,
    payment_provider: row?.payment_provider || "",
    payment_reference: row?.payment_reference || "",
    payment_intent_id: row?.payment_intent_id || "",
    payment_paid_at: row?.payment_paid_at || "",
    payment_last_event: row?.payment_last_event || "",
    payment_last_event_at: row?.payment_last_event_at || "",
    payment_last_error: row?.payment_last_error || "",
  };
}

async function detectBookingPaymentColumnsAvailability(client) {
  if (bookingsPaymentColumnsAvailable !== null) {
    return bookingsPaymentColumnsAvailable;
  }

  const { error } = await client.from("bookings").select("payment_provider").limit(1);

  if (!error) {
    bookingsPaymentColumnsAvailable = true;
    return bookingsPaymentColumnsAvailable;
  }

  if (isMissingBookingPaymentColumnError(error)) {
    bookingsPaymentColumnsAvailable = false;
    return bookingsPaymentColumnsAvailable;
  }

  return null;
}

async function runBookingQueryWithCompatibility(client, buildQuery) {
  const detectedAvailability = await detectBookingPaymentColumnsAvailability(client);
  const initialColumns = getTravelerBookingColumns(detectedAvailability);
  const initialResult = await buildQuery(client.from("bookings"), initialColumns);

  if (!initialResult.error) {
    if (detectedAvailability === null) {
      bookingsPaymentColumnsAvailable = true;
    }

    return {
      ...initialResult,
      paymentColumnsAvailable: bookingsPaymentColumnsAvailable !== false,
    };
  }

  if (!isMissingBookingPaymentColumnError(initialResult.error)) {
    return {
      ...initialResult,
      paymentColumnsAvailable: detectedAvailability !== false,
    };
  }

  bookingsPaymentColumnsAvailable = false;

  const fallbackResult = await buildQuery(
    client.from("bookings"),
    LEGACY_TRAVELER_BOOKING_COLUMNS,
  );

  return {
    ...fallbackResult,
    paymentColumnsAvailable: false,
  };
}

function toIsoTimestamp(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }

  if (typeof value === "number") {
    const timestamp =
      value > 1_000_000_000_000
        ? new Date(value)
        : new Date(value * 1000);

    return Number.isNaN(timestamp.getTime()) ? null : timestamp.toISOString();
  }

  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime()) ? null : timestamp.toISOString();
}

function getTravelerBookingPaymentState(row) {
  const bookingStatus = row.status || "pending";
  const paymentStatus = row.payment_status || "unpaid";
  const totalPrice = Number(row.total_price || 0);

  if (paymentStatus === "paid") {
    return {
      canPayOnline: false,
      paymentActionMessage: row.payment_paid_at
        ? `Payment received${row.payment_method ? ` via ${row.payment_method}` : ""} on ${new Intl.DateTimeFormat(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric",
            },
          ).format(new Date(row.payment_paid_at))}.`
        : row.payment_method
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

  if (row.payment_last_event === "payment_failed") {
    return {
      canPayOnline: true,
      paymentActionMessage:
        row.payment_last_error ||
        "Your last payment attempt did not complete. You can try secure payment again.",
    };
  }

  if (row.payment_last_event === "checkout_expired") {
    return {
      canPayOnline: true,
      paymentActionMessage:
        "Your previous payment session expired. Start a fresh secure payment when you're ready.",
    };
  }

  if (row.payment_reference) {
    return {
      canPayOnline: true,
      paymentActionMessage:
        "A secure payment session already exists for this booking. If you already paid, the latest status will sync back here automatically.",
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

function mapTravelerBooking(row, room, hotel, paymentColumnsAvailable = true) {
  const uploadedImages = room?.image_urls || [];
  const roomName = room?.name || room?.room_type || "Booked room";
  const safeRow = normalizeBookingRow(row);
  const paymentState = getTravelerBookingPaymentState(safeRow);

  return {
    _id: safeRow.id,
    checkInDate: safeRow.check_in_date,
    checkOutDate: safeRow.check_out_date,
    guests: safeRow.guests,
    totalPrice: Number(safeRow.total_price || 0),
    status: safeRow.status || "pending",
    paymentStatus: safeRow.payment_status || "unpaid",
    paymentMethod: safeRow.payment_method || "",
    paymentProvider: safeRow.payment_provider || "",
    paymentReference: safeRow.payment_reference || "",
    paymentIntentId: safeRow.payment_intent_id || "",
    paymentPaidAt: safeRow.payment_paid_at || "",
    paymentLastEvent: safeRow.payment_last_event || "",
    paymentLastEventAt: safeRow.payment_last_event_at || "",
    paymentLastError: safeRow.payment_last_error || "",
    canPayOnline: paymentState.canPayOnline,
    paymentActionMessage: paymentState.paymentActionMessage,
    notes: safeRow.notes || "",
    createdAt: safeRow.created_at,
    room: {
      _id: room?.id || safeRow.room_id || "",
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
    ...normalizeBookingRow(bookingRow),
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
      userId: mergedBooking.user_id || "",
      checkInDate: mergedBooking.check_in_date,
      checkOutDate: mergedBooking.check_out_date,
      guests: mergedBooking.guests,
      totalPrice: Number(mergedBooking.total_price || 0),
      status: mergedBooking.status || "pending",
      paymentStatus: mergedBooking.payment_status || "unpaid",
      paymentMethod: mergedBooking.payment_method || "",
      paymentProvider: mergedBooking.payment_provider || "",
      paymentReference: mergedBooking.payment_reference || "",
      paymentIntentId: mergedBooking.payment_intent_id || "",
      paymentPaidAt: mergedBooking.payment_paid_at || "",
      notes: mergedBooking.notes || "",
    },
  };
}

function getInvoiceIssuedAt(row) {
  return (
    row?.payment_paid_at ||
    row?.updated_at ||
    row?.created_at ||
    new Date().toISOString()
  );
}

function getBookingInvoiceNumber(row) {
  const issuedDate = new Date(getInvoiceIssuedAt(row));
  const year = issuedDate.getUTCFullYear();
  const month = `${issuedDate.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${issuedDate.getUTCDate()}`.padStart(2, "0");

  return `QS-${year}${month}${day}-${String(row?.id || "")
    .slice(0, 8)
    .toUpperCase()}`;
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

export async function getTravelerStripePaymentRecoveryCandidates(travelerId) {
  if (!travelerId) {
    return [];
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return [];
  }

  try {
    const paymentColumnsAvailable =
      await detectBookingPaymentColumnsAvailability(adminClient);

    if (paymentColumnsAvailable === false) {
      return [];
    }

    const { data, error } = await adminClient
      .from("bookings")
      .select(
        "id, user_id, payment_reference, payment_intent_id, payment_last_event, payment_status, status",
      )
      .eq("user_id", travelerId)
      .eq("payment_status", "unpaid")
      .eq("status", "confirmed")
      .eq("payment_provider", STRIPE_PAYMENT_PROVIDER)
      .not("payment_reference", "is", null)
      .order("updated_at", { ascending: false })
      .limit(MAX_STRIPE_RECOVERY_CANDIDATES);

    if (error) {
      console.error("getTravelerStripePaymentRecoveryCandidates failed", error);
      return [];
    }

    return (data || [])
      .filter((booking) => Boolean(booking.payment_reference))
      .map((booking) => ({
        bookingId: booking.id,
        travelerId: booking.user_id || "",
        paymentReference: booking.payment_reference || "",
        paymentIntentId: booking.payment_intent_id || "",
        paymentLastEvent: booking.payment_last_event || "",
      }));
  } catch (error) {
    console.error("getTravelerStripePaymentRecoveryCandidates threw", error);
    return [];
  }
}

export async function recordBookingPaymentCheckpoint(
  bookingId,
  options = {},
) {
  if (!bookingId) {
    return false;
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return false;
  }

  const paymentColumnsAvailable =
    await detectBookingPaymentColumnsAvailability(adminClient);

  if (paymentColumnsAvailable === false) {
    return false;
  }

  const updatePayload = {};

  if ("paymentProvider" in options) {
    updatePayload.payment_provider =
      options.paymentProvider || STRIPE_PAYMENT_PROVIDER;
  }

  if ("paymentReference" in options) {
    updatePayload.payment_reference = options.paymentReference || null;
  }

  if ("paymentIntentId" in options) {
    updatePayload.payment_intent_id = options.paymentIntentId || null;
  }

  if ("paymentPaidAt" in options) {
    updatePayload.payment_paid_at = toIsoTimestamp(options.paymentPaidAt);
  }

  if ("paymentLastEvent" in options) {
    updatePayload.payment_last_event = options.paymentLastEvent || null;
    updatePayload.payment_last_event_at =
      toIsoTimestamp(options.occurredAt) || new Date().toISOString();
  }

  if ("paymentLastError" in options) {
    updatePayload.payment_last_error = options.paymentLastError || null;
    if (!("paymentLastEvent" in options)) {
      updatePayload.payment_last_event_at =
        toIsoTimestamp(options.occurredAt) || new Date().toISOString();
    }
  }

  if (!Object.keys(updatePayload).length) {
    return false;
  }

  try {
    const { error } = await adminClient
      .from("bookings")
      .update(updatePayload)
      .eq("id", bookingId);

    if (error) {
      if (isMissingBookingPaymentColumnError(error)) {
        bookingsPaymentColumnsAvailable = false;
        return false;
      }

      console.error("recordBookingPaymentCheckpoint failed", {
        bookingId,
        error,
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error("recordBookingPaymentCheckpoint threw", {
      bookingId,
      error,
    });
    return false;
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
  const {
    data: bookingRows,
    error: bookingsError,
    paymentColumnsAvailable,
  } = await runBookingQueryWithCompatibility(readClient, (query, columns) =>
    query
      .select(columns)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  );

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
      return mapTravelerBooking(
        booking,
        room,
        hotel,
        paymentColumnsAvailable !== false,
      );
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

  const {
    data: bookingRow,
    error: bookingError,
    paymentColumnsAvailable,
  } = await runBookingQueryWithCompatibility(readClient, (query, columns) =>
    query
      .select(columns)
      .eq("id", bookingId)
      .eq("user_id", user.id)
      .maybeSingle(),
  );

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
  const safeBookingRow = normalizeBookingRow(bookingRow);

  return {
    status: "ready",
    booking: {
      id: safeBookingRow.id,
      userId: safeBookingRow.user_id,
      checkInDate: safeBookingRow.check_in_date,
      checkOutDate: safeBookingRow.check_out_date,
      totalPrice: Number(safeBookingRow.total_price || 0),
      status: safeBookingRow.status,
      paymentStatus: safeBookingRow.payment_status,
      paymentTrackingAvailable: paymentColumnsAvailable !== false,
      paymentReference: safeBookingRow.payment_reference || "",
      paymentIntentId: safeBookingRow.payment_intent_id || "",
      paymentLastEvent: safeBookingRow.payment_last_event || "",
      paymentLastError: safeBookingRow.payment_last_error || "",
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

export async function getTravelerBookingInvoiceData(
  bookingId,
  { accessToken = "" } = {},
) {
  if (!bookingId) {
    return {
      status: "not_found",
      invoice: null,
      reason: "We could not find that QuickStay invoice.",
    };
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return {
      status: "unavailable",
      invoice: null,
      reason: "Trusted invoice access is temporarily unavailable right now.",
    };
  }

  let viewerUser = null;

  try {
    const serverClient = await createSupabaseServerClient();

    if (serverClient) {
      const {
        data: { user },
      } = await serverClient.auth.getUser();

      viewerUser = user || null;
    }
  } catch {}

  const { data: bookingRow, error: bookingError } =
    await runBookingQueryWithCompatibility(adminClient, (query, columns) =>
      query.select(columns).eq("id", bookingId).maybeSingle(),
    );

  if (bookingError) {
    return {
      status: "unavailable",
      invoice: null,
      reason:
        bookingError.message ||
        "We could not load this invoice right now.",
    };
  }

  if (!bookingRow) {
    return {
      status: "not_found",
      invoice: null,
      reason: "We could not find that QuickStay invoice.",
    };
  }

  const safeBookingRow = normalizeBookingRow(bookingRow);
  const viewerOwnsBooking = viewerUser?.id === safeBookingRow.user_id;
  const hasSignedInvoiceAccess = Boolean(
    accessToken &&
      isBookingInvoiceAccessTokenValid(
        safeBookingRow.id,
        safeBookingRow.user_id,
        accessToken,
      ),
  );

  if (!viewerOwnsBooking && !hasSignedInvoiceAccess) {
    if (accessToken) {
      return {
        status: "forbidden",
        invoice: null,
        reason:
          "This invoice link is no longer valid. Please open the latest invoice from QuickStay.",
      };
    }

    if (!viewerUser) {
      return {
        status: "unauthenticated",
        invoice: null,
        reason: "Please log in to open this invoice.",
      };
    }

    return {
      status: "forbidden",
      invoice: null,
      reason: "This invoice is not available in the current traveler account.",
    };
  }

  const { data: roomRow, error: roomError } = await adminClient
    .from("rooms")
    .select("id, hotel_id, name, room_type")
    .eq("id", safeBookingRow.room_id)
    .maybeSingle();

  if (roomError || !roomRow) {
    return {
      status: "unavailable",
      invoice: null,
      reason:
        roomError?.message ||
        "We could not load the room details for this invoice right now.",
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
      invoice: null,
      reason:
        hotelError?.message ||
        "We could not load the hotel details for this invoice right now.",
    };
  }

  const travelerProfile = await getCurrentTravelerProfile(
    adminClient,
    safeBookingRow.user_id,
  );
  const nightCount = Math.max(
    1,
    getNightCount(safeBookingRow.check_in_date, safeBookingRow.check_out_date),
  );
  const unitPrice = Number(safeBookingRow.total_price || 0) / nightCount;
  const issuedAt = getInvoiceIssuedAt(safeBookingRow);

  return {
    status: "ready",
    invoice: {
      bookingId: safeBookingRow.id,
      invoiceNumber: getBookingInvoiceNumber(safeBookingRow),
      issuedAt,
      stayLabel: roomRow.name || roomRow.room_type || "Booked room",
      nightCount,
      unitPrice,
      totalPrice: Number(safeBookingRow.total_price || 0),
      status: safeBookingRow.status || "pending",
      paymentStatus: safeBookingRow.payment_status || "unpaid",
      paymentMethod: safeBookingRow.payment_method || "",
      paymentPaidAt: issuedAt,
      paymentReference: safeBookingRow.payment_reference || "",
      notes: safeBookingRow.notes || "",
      traveler: {
        fullName:
          travelerProfile?.full_name ||
          viewerUser?.user_metadata?.full_name ||
          viewerUser?.user_metadata?.name ||
          "",
        email: travelerProfile?.email || viewerUser?.email || "",
      },
      room: {
        id: roomRow.id,
        name: roomRow.name || roomRow.room_type || "Booked room",
        roomType: roomRow.room_type || roomRow.name || "Booked room",
      },
      hotel: {
        id: hotelRow.id,
        name: hotelRow.name || "Hotel unavailable",
        city: hotelRow.city || "",
        address: hotelRow.address || "",
        contactEmail: hotelRow.contact_email || "",
      },
      booking: {
        checkInDate: safeBookingRow.check_in_date,
        checkOutDate: safeBookingRow.check_out_date,
        guests: safeBookingRow.guests || 0,
        createdAt: safeBookingRow.created_at,
      },
      lineItems: [
        {
          label: roomRow.name || roomRow.room_type || "Booked room",
          description: `${nightCount} night${nightCount === 1 ? "" : "s"} at ${hotelRow.name || "QuickStay"}`,
          quantity: nightCount,
          unitPrice,
          total: Number(safeBookingRow.total_price || 0),
        },
      ],
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

  const { data: bookingRow, error: bookingError } =
    await runBookingQueryWithCompatibility(adminClient, (query, columns) =>
      query.select(columns).eq("id", bookingId).maybeSingle(),
    );

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
  const paymentColumnsAvailable =
    await detectBookingPaymentColumnsAvailability(supabase);
  const bookingSelectColumns = getTravelerBookingColumns(paymentColumnsAvailable);

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
    .select(bookingSelectColumns)
    .single();

  if (bookingError) {
    if (bookingError.code === "23P01") {
      return {
        status: "conflict",
        booking: null,
        reason:
          "These dates are no longer available for this room. Please choose a different stay window.",
      };
    }

    return {
      status: "unavailable",
      booking: null,
      reason:
        bookingError.message ||
        "We could not create your booking right now. Please try again shortly.",
    };
  }

  const safeBookingRow = normalizeBookingRow(bookingRow);

  return {
    status: "created",
    booking: {
      _id: safeBookingRow.id,
      checkInDate: safeBookingRow.check_in_date,
      checkOutDate: safeBookingRow.check_out_date,
      guests: safeBookingRow.guests,
      totalPrice: Number(safeBookingRow.total_price || 0),
      status: safeBookingRow.status,
      paymentStatus: safeBookingRow.payment_status,
      createdAt: safeBookingRow.created_at,
      notes: safeBookingRow.notes || "",
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

export async function markBookingAsPaid(
  bookingId,
  {
    paymentMethod = STRIPE_PAYMENT_PROVIDER,
    paymentProvider = STRIPE_PAYMENT_PROVIDER,
    paymentReference = "",
    paymentIntentId = "",
    paymentPaidAt = null,
    paymentLastEvent = "payment_received",
  } = {},
) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return {
      status: "unavailable",
      booking: null,
      reason: "Trusted booking payment updates are temporarily unavailable.",
    };
  }

  const {
    data: bookingRow,
    error: bookingError,
    paymentColumnsAvailable,
  } = await runBookingQueryWithCompatibility(adminClient, (query, columns) =>
    query.select(columns).eq("id", bookingId).maybeSingle(),
  );

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

  const safeBookingRow = normalizeBookingRow(bookingRow);

  if (safeBookingRow.payment_status === "paid") {
    return {
      status: "already_paid",
      booking: {
        _id: safeBookingRow.id,
        paymentStatus: safeBookingRow.payment_status,
        paymentMethod: safeBookingRow.payment_method || paymentMethod,
        paymentProvider: safeBookingRow.payment_provider || paymentProvider,
        paymentReference: safeBookingRow.payment_reference || paymentReference,
        paymentIntentId: safeBookingRow.payment_intent_id || paymentIntentId,
        paymentPaidAt: safeBookingRow.payment_paid_at || "",
      },
      reason: "",
    };
  }

  if (safeBookingRow.status !== "confirmed") {
    return {
      status: "not_payable",
      booking: null,
      reason: "Only confirmed bookings can be marked as paid.",
    };
  }

  const supportsTrackedPaymentColumns = paymentColumnsAvailable !== false;
  const updatePayload = {
    payment_status: "paid",
    payment_method: paymentMethod || "stripe",
  };

  if (supportsTrackedPaymentColumns) {
    updatePayload.payment_provider = paymentProvider || null;
    updatePayload.payment_reference = paymentReference || null;
    updatePayload.payment_intent_id = paymentIntentId || null;
    updatePayload.payment_paid_at =
      toIsoTimestamp(paymentPaidAt) || new Date().toISOString();
    updatePayload.payment_last_event = paymentLastEvent || "payment_received";
    updatePayload.payment_last_event_at = new Date().toISOString();
    updatePayload.payment_last_error = null;
  }

  const { data: updatedRow, error: updateError } = await adminClient
    .from("bookings")
    .update(updatePayload)
    .eq("id", bookingId)
    .eq("status", "confirmed")
    .eq("payment_status", "unpaid")
    .select(getTravelerBookingColumns(paymentColumnsAvailable))
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
    const { data: latestRow } = await runBookingQueryWithCompatibility(
      adminClient,
      (query, columns) => query.select(columns).eq("id", bookingId).maybeSingle(),
    );
    const safeLatestRow = latestRow ? normalizeBookingRow(latestRow) : null;

    if (safeLatestRow?.payment_status === "paid") {
      return {
        status: "already_paid",
        booking: {
          _id: safeLatestRow.id,
          paymentStatus: safeLatestRow.payment_status,
          paymentMethod: safeLatestRow.payment_method || paymentMethod,
          paymentProvider: safeLatestRow.payment_provider || paymentProvider,
          paymentReference: safeLatestRow.payment_reference || paymentReference,
          paymentIntentId: safeLatestRow.payment_intent_id || paymentIntentId,
          paymentPaidAt: safeLatestRow.payment_paid_at || "",
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

  const safeUpdatedRow = normalizeBookingRow(updatedRow);

  return {
    status: "updated",
    booking: {
      _id: safeUpdatedRow.id,
      paymentStatus: safeUpdatedRow.payment_status,
      paymentMethod: safeUpdatedRow.payment_method || paymentMethod,
      paymentProvider: safeUpdatedRow.payment_provider || paymentProvider,
      paymentReference: safeUpdatedRow.payment_reference || paymentReference,
      paymentIntentId: safeUpdatedRow.payment_intent_id || paymentIntentId,
      paymentPaidAt: safeUpdatedRow.payment_paid_at || "",
    },
    reason: "",
  };
}
