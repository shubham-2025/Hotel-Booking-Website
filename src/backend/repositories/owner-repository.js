import { randomUUID } from "node:crypto";
import { createSupabaseAdminClient } from "@/src/backend/auth/supabase-admin-client";
import { requireOwner } from "@/src/backend/auth/require-owner";
import { AuthError } from "@/src/backend/auth/auth-errors";
import { createSupabaseServerClient } from "@/src/backend/auth/supabase-server-client";
import { hasSupabasePublicEnv } from "@/src/backend/config/env";
import { getFallbackRoomImages } from "@/src/backend/repositories/demo-fallback-repository";
import {
  deleteOwnerRoomImages,
  uploadOwnerRoomImages,
} from "@/src/backend/storage/owner-room-image-storage";

const OWNER_HOTEL_COLUMNS =
  "id, name, slug, description, city, address, contact_email, contact_phone, hero_image_url, amenities, status, created_at, updated_at";
const OWNER_ROOM_COLUMNS =
  "id, hotel_id, name, room_type, description, price_per_night, guest_capacity, bedroom_count, bathroom_count, amenities, image_urls, is_active, created_at, updated_at";
const OWNER_BOOKING_COLUMNS =
  "id, room_id, user_id, check_in_date, check_out_date, guests, total_price, status, payment_status, payment_method, notes, created_at, updated_at";
const OWNER_BOOKING_STATUS_TRANSITIONS = {
  pending: new Set(["confirmed", "cancelled"]),
  confirmed: new Set(["completed"]),
};

function getBaseMetrics() {
  return {
    totalHotels: 0,
    totalRooms: 0,
    activeRooms: 0,
    totalBookings: 0,
    totalRevenue: 0,
    lowestNightlyRate: 0,
    highestNightlyRate: 0,
    averageNightlyRate: 0,
  };
}

function getUnavailableState(profile, reason) {
  return {
    status: "unavailable",
    profile,
    hotels: [],
    primaryHotel: null,
    rooms: [],
    bookings: [],
    recentBookings: [],
    metrics: getBaseMetrics(),
    reason,
  };
}

async function getOwnerProfileOrNull() {
  try {
    const { profile } = await requireOwner();
    return profile;
  } catch (error) {
    if (error instanceof AuthError) {
      return null;
    }

    throw error;
  }
}

function mapHotel(row) {
  return {
    _id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || "",
    city: row.city,
    address: row.address,
    contactEmail: row.contact_email || "",
    contactPhone: row.contact_phone || "",
    heroImageUrl: row.hero_image_url || "",
    amenities: row.amenities || [],
    status: row.status || "draft",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRoom(row, hotel) {
  const uploadedImages = row.image_urls || [];

  return {
    _id: row.id,
    name: row.name || row.room_type,
    roomType: row.room_type,
    description: row.description || "",
    pricePerNight: Number(row.price_per_night),
    guestCapacity: row.guest_capacity || 0,
    bedroomCount: row.bedroom_count || 0,
    bathroomCount: row.bathroom_count || 0,
    amenities: row.amenities || [],
    uploadedImages,
    images: uploadedImages.length ? uploadedImages : getFallbackRoomImages(),
    usesFallbackImages: uploadedImages.length === 0,
    isAvailable: row.is_active ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    hotel,
  };
}

function mapBooking(row, room) {
  return {
    _id: row.id,
    guests: row.guests,
    totalPrice: Number(row.total_price || 0),
    status: row.status,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method || "",
    checkInDate: row.check_in_date,
    checkOutDate: row.check_out_date,
    notes: row.notes || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    room,
    hotel: room?.hotel || null,
    guest: {
      _id: row.user_id || null,
      label: row.user_id ? "Authenticated traveler" : "Traveler",
    },
  };
}

async function getTravelerNotificationProfile(userId) {
  if (!userId) {
    return null;
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return null;
  }

  try {
    const { data, error } = await adminClient
      .from("profiles")
      .select("full_name, email")
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

function buildOwnerBookingNotificationContext({
  booking,
  bookingRow,
  nextStatus,
  travelerProfile,
}) {
  return {
    event: nextStatus,
    traveler: {
      email: travelerProfile?.email || "",
      fullName: travelerProfile?.full_name || "",
    },
    owner: {
      email: booking.hotel?.contactEmail || "",
    },
    room: {
      name: booking.room?.name || booking.room?.roomType || "Booked room",
      roomType: booking.room?.roomType || booking.room?.name || "",
    },
    hotel: {
      name: booking.hotel?.name || "Hotel unavailable",
      city: booking.hotel?.city || "",
      address: booking.hotel?.address || "",
      contactEmail: booking.hotel?.contactEmail || "",
    },
    booking: {
      id: booking._id,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      guests: booking.guests,
      totalPrice: booking.totalPrice,
      status: nextStatus,
      paymentStatus: booking.paymentStatus,
      notes: booking.notes || "",
      previousStatus: bookingRow.status,
    },
  };
}

async function getOwnerHotelContext() {
  const { user, profile } = await requireOwner();

  if (!hasSupabasePublicEnv()) {
    return {
      ...getUnavailableState(
        profile,
        "Supabase environment variables are not configured yet.",
      ),
      user,
      supabase: null,
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ...getUnavailableState(
        profile,
        "Authenticated Supabase access is temporarily unavailable.",
      ),
      user,
      supabase: null,
    };
  }

  const { data: hotelRows, error: hotelError } = await supabase
    .from("hotels")
    .select(OWNER_HOTEL_COLUMNS)
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });

  if (hotelError) {
    throw hotelError;
  }

  const hotels = (hotelRows || []).map(mapHotel);

  if (!hotels.length) {
    return {
      status: "no_hotel",
      user,
      profile,
      supabase,
      hotels: [],
      primaryHotel: null,
      metrics: getBaseMetrics(),
      reason: "",
    };
  }

  return {
    status: "ready",
    user,
    profile,
    supabase,
    hotels,
    primaryHotel: hotels[0] || null,
    metrics: {
      ...getBaseMetrics(),
      totalHotels: hotels.length,
    },
    reason: "",
  };
}

async function getOwnerScopedInventory() {
  const hotelContext = await getOwnerHotelContext();

  if (hotelContext.status !== "ready") {
    return {
      status: hotelContext.status,
      profile: hotelContext.profile,
      hotels: hotelContext.hotels,
      primaryHotel: hotelContext.primaryHotel,
      rooms: [],
      bookings: [],
      recentBookings: [],
      metrics: hotelContext.metrics,
      reason: hotelContext.reason,
    };
  }

  const { profile, supabase, hotels, primaryHotel, metrics: baseMetrics } =
    hotelContext;

  const hotelsById = new Map(hotels.map((hotel) => [hotel._id, hotel]));
  const hotelIds = hotels.map((hotel) => hotel._id);

  const { data: roomRows, error: roomError } = await supabase
    .from("rooms")
    .select(OWNER_ROOM_COLUMNS)
    .in("hotel_id", hotelIds)
    .order("created_at", { ascending: false });

  if (roomError) {
    throw roomError;
  }

  const rooms = (roomRows || []).map((row) =>
    mapRoom(row, hotelsById.get(row.hotel_id) || null),
  );

  const metrics = {
    ...baseMetrics,
    totalRooms: rooms.length,
    activeRooms: rooms.filter((room) => room.isAvailable).length,
    totalBookings: 0,
    totalRevenue: 0,
    lowestNightlyRate: rooms.length
      ? Math.min(...rooms.map((room) => room.pricePerNight))
      : 0,
    highestNightlyRate: rooms.length
      ? Math.max(...rooms.map((room) => room.pricePerNight))
      : 0,
    averageNightlyRate: rooms.length
      ? Math.round(
          rooms.reduce(
            (runningTotal, room) => runningTotal + room.pricePerNight,
            0,
          ) / rooms.length,
        )
      : 0,
  };

  if (!rooms.length) {
    return {
      status: "no_rooms",
      profile,
      hotels,
      primaryHotel,
      rooms: [],
      bookings: [],
      recentBookings: [],
      metrics,
      reason: "",
    };
  }

  const roomIds = rooms.map((room) => room._id);
  const roomMap = new Map(rooms.map((room) => [room._id, room]));

  const { data: bookingRows, error: bookingError } = await supabase
    .from("bookings")
    .select(OWNER_BOOKING_COLUMNS)
    .in("room_id", roomIds)
    .order("created_at", { ascending: false });

  if (bookingError) {
    throw bookingError;
  }

  const recentBookings = (bookingRows || []).map((booking) =>
    mapBooking(booking, roomMap.get(booking.room_id) || null),
  );

  return {
    status: "ready",
    profile,
    hotels,
    primaryHotel,
    rooms,
    bookings: recentBookings,
    recentBookings,
    metrics: {
      ...metrics,
      totalBookings: recentBookings.length,
      totalRevenue: recentBookings.reduce(
        (runningTotal, booking) => runningTotal + booking.totalPrice,
        0,
      ),
    },
    reason: "",
  };
}

function canOwnerUpdateBookingStatus(currentStatus, nextStatus) {
  return Boolean(
    OWNER_BOOKING_STATUS_TRANSITIONS[currentStatus]?.has(nextStatus),
  );
}

async function getOwnerManagedBookingContext(bookingId) {
  const ownerHotelData = await getOwnerHotelContext();

  if (ownerHotelData.status === "unavailable") {
    return {
      status: "unavailable",
      profile: ownerHotelData.profile,
      booking: null,
      reason: ownerHotelData.reason,
      supabase: null,
    };
  }

  if (ownerHotelData.status === "no_hotel") {
    return {
      status: "no_hotel",
      profile: ownerHotelData.profile,
      booking: null,
      reason: "",
      supabase: ownerHotelData.supabase,
    };
  }

  const { profile, supabase } = ownerHotelData;
  const { data: bookingRow, error: bookingError } = await supabase
    .from("bookings")
    .select(OWNER_BOOKING_COLUMNS)
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError) {
    return {
      status: "unavailable",
      profile,
      booking: null,
      reason:
        bookingError.message ||
        "Owner booking management is temporarily unavailable.",
      supabase,
    };
  }

  if (!bookingRow) {
    return {
      status: "not_found",
      profile,
      booking: null,
      reason: "",
      supabase,
    };
  }

  const roomData = await getOwnerRoomContext(bookingRow.room_id);

  if (roomData.status !== "ready" || !roomData.room) {
    return {
      status: roomData.status === "unavailable" ? "unavailable" : "not_found",
      profile,
      booking: null,
      reason:
        roomData.reason ||
        "This booking is not available in the current owner scope.",
      supabase,
    };
  }

  return {
    status: "ready",
    profile,
    booking: mapBooking(bookingRow, roomData.room),
    bookingRow,
    supabase,
    reason: "",
  };
}

async function getOwnerRoomContext(roomId) {
  const ownerHotelData = await getOwnerHotelContext();

  if (ownerHotelData.status === "unavailable") {
    return {
      status: "unavailable",
      user: ownerHotelData.user,
      profile: ownerHotelData.profile,
      hotels: [],
      primaryHotel: null,
      room: null,
      supabase: null,
      reason: ownerHotelData.reason,
    };
  }

  if (ownerHotelData.status === "no_hotel") {
    return {
      status: "no_hotel",
      user: ownerHotelData.user,
      profile: ownerHotelData.profile,
      hotels: [],
      primaryHotel: null,
      room: null,
      supabase: ownerHotelData.supabase,
      reason: "",
    };
  }

  const { user, profile, supabase, hotels, primaryHotel } = ownerHotelData;
  const hotelsById = new Map(hotels.map((hotel) => [hotel._id, hotel]));
  const hotelIds = hotels.map((hotel) => hotel._id);

  const { data, error } = await supabase
    .from("rooms")
    .select(OWNER_ROOM_COLUMNS)
    .eq("id", roomId)
    .in("hotel_id", hotelIds)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return {
      status: "not_found",
      user,
      profile,
      hotels,
      primaryHotel,
      room: null,
      supabase,
      reason: "",
    };
  }

  return {
    status: "ready",
    user,
    profile,
    hotels,
    primaryHotel,
    room: mapRoom(data, hotelsById.get(data.hotel_id) || primaryHotel || null),
    supabase,
    reason: "",
  };
}

async function getOwnerManagedHotelContext(hotelId = "") {
  const ownerHotelData = await getOwnerHotelContext();

  if (ownerHotelData.status !== "ready") {
    return {
      status: ownerHotelData.status,
      user: ownerHotelData.user,
      profile: ownerHotelData.profile,
      hotels: ownerHotelData.hotels,
      primaryHotel: ownerHotelData.primaryHotel,
      hotel: ownerHotelData.primaryHotel,
      supabase: ownerHotelData.supabase,
      reason: ownerHotelData.reason,
    };
  }

  const matchedHotel =
    ownerHotelData.hotels.find((hotel) => hotel._id === hotelId) ||
    ownerHotelData.primaryHotel;

  if (!matchedHotel) {
    return {
      status: "not_found",
      user: ownerHotelData.user,
      profile: ownerHotelData.profile,
      hotels: ownerHotelData.hotels,
      primaryHotel: ownerHotelData.primaryHotel,
      hotel: null,
      supabase: ownerHotelData.supabase,
      reason: "",
    };
  }

  return {
    status: "ready",
    user: ownerHotelData.user,
    profile: ownerHotelData.profile,
    hotels: ownerHotelData.hotels,
    primaryHotel: ownerHotelData.primaryHotel,
    hotel: matchedHotel,
    supabase: ownerHotelData.supabase,
    reason: "",
  };
}

export async function getOwnerHotelBootstrapData() {
  try {
    const ownerHotelData = await getOwnerHotelContext();

    return {
      status: ownerHotelData.status,
      profile: ownerHotelData.profile,
      hotels: ownerHotelData.hotels,
      primaryHotel: ownerHotelData.primaryHotel,
      metrics: ownerHotelData.metrics,
      reason: ownerHotelData.reason,
    };
  } catch {
    const profile = await getOwnerProfileOrNull();
    return getUnavailableState(
      profile,
      "Owner hotel setup is temporarily unavailable. Please try again shortly.",
    );
  }
}

export async function createOwnerHotelRecord(payload) {
  const ownerHotelData = await getOwnerHotelContext();

  if (ownerHotelData.status === "unavailable") {
    return {
      status: "unavailable",
      profile: ownerHotelData.profile,
      hotel: null,
      reason: ownerHotelData.reason,
    };
  }

  if (ownerHotelData.status === "ready") {
    return {
      status: "already_exists",
      profile: ownerHotelData.profile,
      hotel: ownerHotelData.primaryHotel,
      reason: "",
    };
  }

  const { user, profile, supabase } = ownerHotelData;
  const writeClient = createSupabaseAdminClient() || supabase;
  const contactEmail = payload.contactEmail || profile?.email || "";
  const contactPhone = payload.contactPhone || profile?.phone || "";
  const slugCandidates = [
    payload.slugBase,
    `${payload.slugBase}-${user.id.slice(0, 8)}`,
  ];

  for (const slug of slugCandidates) {
    const { data, error } = await writeClient
      .from("hotels")
      .insert({
        owner_id: user.id,
        name: payload.name,
        slug,
        description: payload.description || null,
        city: payload.city,
        address: payload.address,
        contact_email: contactEmail || null,
        contact_phone: contactPhone || null,
        hero_image_url: payload.heroImageUrl || null,
        amenities: payload.amenities || [],
        status: "draft",
      })
      .select(OWNER_HOTEL_COLUMNS)
      .single();

    if (!error) {
      return {
        status: "created",
        profile,
        hotel: mapHotel(data),
        reason: "",
      };
    }

    if (error.code === "23505") {
      continue;
    }

    return {
      status: "unavailable",
      profile,
      hotel: null,
      reason:
        error.message ||
        "Unable to save your hotel right now. Please try again shortly.",
    };
  }

  return {
    status: "unavailable",
    profile,
    hotel: null,
    reason: "Unable to create a unique hotel record right now. Please try again.",
  };
}

export async function updateOwnerHotelRecord(hotelId, payload) {
  const hotelData = await getOwnerManagedHotelContext(hotelId);

  if (hotelData.status !== "ready") {
    return {
      status: hotelData.status,
      profile: hotelData.profile,
      hotel: hotelData.hotel,
      reason: hotelData.reason,
    };
  }

  const { profile, supabase, hotel } = hotelData;
  const writeClient = createSupabaseAdminClient() || supabase;

  const { data, error } = await writeClient
    .from("hotels")
    .update({
      name: payload.name,
      description: payload.description || null,
      city: payload.city,
      address: payload.address,
      contact_email: payload.contactEmail || null,
      contact_phone: payload.contactPhone || null,
      hero_image_url: payload.heroImageUrl || null,
      amenities: payload.amenities || [],
    })
    .eq("id", hotel._id)
    .eq("owner_id", hotelData.user.id)
    .select(OWNER_HOTEL_COLUMNS)
    .single();

  if (error) {
    return {
      status: "unavailable",
      profile,
      hotel,
      reason:
        error.message ||
        "Unable to update your hotel right now. Please try again shortly.",
    };
  }

  return {
    status: "updated",
    profile,
    hotel: mapHotel(data),
    reason: "",
  };
}

export async function setOwnerHotelAvailability(hotelId, shouldBeActive) {
  const hotelData = await getOwnerManagedHotelContext(hotelId);

  if (hotelData.status !== "ready") {
    return {
      status: hotelData.status,
      profile: hotelData.profile,
      hotel: hotelData.hotel,
      reason: hotelData.reason,
    };
  }

  const { profile, supabase, hotel } = hotelData;
  const writeClient = createSupabaseAdminClient() || supabase;

  const { data, error } = await writeClient
    .from("hotels")
    .update({
      status: shouldBeActive ? "active" : "draft",
    })
    .eq("id", hotel._id)
    .eq("owner_id", hotelData.user.id)
    .select(OWNER_HOTEL_COLUMNS)
    .single();

  if (error) {
    return {
      status: "unavailable",
      profile,
      hotel,
      reason:
        error.message ||
        "Unable to update your hotel status right now. Please try again shortly.",
    };
  }

  return {
    status: "updated",
    profile,
    hotel: mapHotel(data),
    reason: "",
  };
}

export async function createOwnerRoomRecord(payload, options = {}) {
  const ownerHotelData = await getOwnerHotelContext();

  if (ownerHotelData.status === "unavailable") {
    return {
      status: "unavailable",
      profile: ownerHotelData.profile,
      room: null,
      hotel: null,
      reason: ownerHotelData.reason,
    };
  }

  if (ownerHotelData.status === "no_hotel") {
    return {
      status: "no_hotel",
      profile: ownerHotelData.profile,
      room: null,
      hotel: null,
      reason: "",
    };
  }

  const { user, profile, supabase, primaryHotel } = ownerHotelData;
  const writeClient = createSupabaseAdminClient() || supabase;
  const roomId = randomUUID();

  const { data, error } = await writeClient
    .from("rooms")
    .insert({
      id: roomId,
      hotel_id: primaryHotel._id,
      name: payload.name || null,
      room_type: payload.roomType,
      description: payload.description || null,
      price_per_night: payload.pricePerNight,
      guest_capacity: payload.guestCapacity,
      bedroom_count: payload.bedroomCount,
      bathroom_count: payload.bathroomCount,
      amenities: payload.amenities,
      image_urls: [],
      is_active: false,
    })
    .select(OWNER_ROOM_COLUMNS)
    .single();

  if (error) {
    return {
      status: "unavailable",
      profile,
      room: null,
      hotel: primaryHotel,
      reason:
        error.message ||
        "Unable to save your room right now. Please try again shortly.",
    };
  }

  let nextRow = data;
  let uploadedImages = [];

  try {
    if (options.imageFiles?.length) {
      uploadedImages = await uploadOwnerRoomImages({
        supabase: writeClient,
        ownerId: user.id,
        roomId,
        files: options.imageFiles,
      });

      const imageUrls = uploadedImages.map((image) => image.url);
      const { data: updatedRow, error: updateError } = await writeClient
        .from("rooms")
        .update({
          image_urls: imageUrls,
        })
        .eq("id", roomId)
        .eq("hotel_id", primaryHotel._id)
        .select(OWNER_ROOM_COLUMNS)
        .single();

      if (updateError) {
        throw updateError;
      }

      nextRow = updatedRow;
    }
  } catch (uploadError) {
    if (uploadedImages.length) {
      try {
        await deleteOwnerRoomImages({
          supabase: writeClient,
          ownerId: user.id,
          publicUrls: uploadedImages.map((image) => image.url),
        });
      } catch {}
    }

    await writeClient
      .from("rooms")
      .delete()
      .eq("id", roomId)
      .eq("hotel_id", primaryHotel._id);
    throw uploadError;
  }

  return {
    status: "created",
    profile,
    hotel: primaryHotel,
    room: mapRoom(nextRow, primaryHotel),
    reason: "",
  };
}

export async function getOwnerRoomForEditData(roomId) {
  try {
    const roomData = await getOwnerRoomContext(roomId);

    return {
      status: roomData.status,
      profile: roomData.profile,
      hotels: roomData.hotels,
      primaryHotel: roomData.primaryHotel,
      room: roomData.room,
      reason: roomData.reason,
    };
  } catch {
    const profile = await getOwnerProfileOrNull();
    return {
      status: "unavailable",
      profile,
      hotels: [],
      primaryHotel: null,
      room: null,
      reason: "Room editor is temporarily unavailable. Please try again shortly.",
    };
  }
}

export async function updateOwnerRoomRecord(roomId, payload, options = {}) {
  const roomData = await getOwnerRoomContext(roomId);

  if (roomData.status !== "ready") {
    return {
      status: roomData.status,
      profile: roomData.profile,
      room: roomData.room,
      hotel: roomData.primaryHotel,
      reason: roomData.reason,
    };
  }

  const { user, profile, supabase, room } = roomData;
  const writeClient = createSupabaseAdminClient() || supabase;
  const retainedImageUrls = Array.from(
    new Set(
      (options.retainedImageUrls || []).filter((imageUrl) =>
        (room.uploadedImages || []).includes(imageUrl),
      ),
    ),
  );
  let uploadedImages = [];

  try {
    if (options.imageFiles?.length) {
      uploadedImages = await uploadOwnerRoomImages({
        supabase: writeClient,
        ownerId: user.id,
        roomId,
        files: options.imageFiles,
      });
    }

    const nextImageUrls = [
      ...retainedImageUrls,
      ...uploadedImages.map((image) => image.url),
    ];

    const { data, error } = await writeClient
      .from("rooms")
      .update({
        name: payload.name || null,
        room_type: payload.roomType,
        description: payload.description || null,
        price_per_night: payload.pricePerNight,
        guest_capacity: payload.guestCapacity,
        bedroom_count: payload.bedroomCount,
        bathroom_count: payload.bathroomCount,
        amenities: payload.amenities,
        image_urls: nextImageUrls,
      })
      .eq("id", roomId)
      .eq("hotel_id", room.hotel?._id || "")
      .select(OWNER_ROOM_COLUMNS)
      .single();

    if (error) {
      throw error;
    }

    const removedImageUrls = (room.uploadedImages || []).filter(
      (imageUrl) => !retainedImageUrls.includes(imageUrl),
    );

    if (removedImageUrls.length) {
      try {
        await deleteOwnerRoomImages({
          supabase: writeClient,
          ownerId: user.id,
          publicUrls: removedImageUrls,
        });
      } catch {}
    }

    return {
      status: "updated",
      profile,
      hotel: room.hotel,
      room: mapRoom(data, room.hotel),
      reason: "",
    };
  } catch (error) {
    if (uploadedImages.length) {
      try {
        await deleteOwnerRoomImages({
          supabase: writeClient,
          ownerId: user.id,
          publicUrls: uploadedImages.map((image) => image.url),
        });
      } catch {}
    }

    throw error;
  }
}

export async function setOwnerRoomAvailability(roomId, shouldBeActive) {
  const roomData = await getOwnerRoomContext(roomId);

  if (roomData.status !== "ready") {
    return {
      status: roomData.status,
      profile: roomData.profile,
      room: roomData.room,
      hotel: roomData.primaryHotel,
      reason: roomData.reason,
    };
  }

  const { profile, supabase, room } = roomData;
  const writeClient = createSupabaseAdminClient() || supabase;

  const { data, error } = await writeClient
    .from("rooms")
    .update({
      is_active: shouldBeActive,
    })
    .eq("id", roomId)
    .eq("hotel_id", room.hotel?._id || "")
    .select(OWNER_ROOM_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return {
    status: "updated",
    profile,
    hotel: room.hotel,
    room: mapRoom(data, room.hotel),
    reason: "",
  };
}

export async function getOwnerDashboardData() {
  try {
    return await getOwnerScopedInventory();
  } catch {
    const profile = await getOwnerProfileOrNull();
    return getUnavailableState(
      profile,
      "Owner data could not be loaded right now. Please try again shortly.",
    );
  }
}

export async function getOwnerRoomsData() {
  try {
    const ownerData = await getOwnerScopedInventory();

    return {
      status: ownerData.status,
      profile: ownerData.profile,
      hotels: ownerData.hotels,
      primaryHotel: ownerData.primaryHotel,
      rooms: ownerData.rooms,
      metrics: ownerData.metrics,
      reason: ownerData.reason,
    };
  } catch {
    const profile = await getOwnerProfileOrNull();
    return getUnavailableState(
      profile,
      "Owner room inventory is temporarily unavailable. Please try again shortly.",
    );
  }
}

export async function getOwnerBookingsData() {
  try {
    const ownerData = await getOwnerScopedInventory();

    if (ownerData.status !== "ready") {
      return {
        status: ownerData.status,
        profile: ownerData.profile,
        hotels: ownerData.hotels,
        primaryHotel: ownerData.primaryHotel,
        bookings: ownerData.bookings || [],
        metrics: ownerData.metrics,
        reason: ownerData.reason,
      };
    }

    if (!ownerData.bookings.length) {
      return {
        status: "empty",
        profile: ownerData.profile,
        hotels: ownerData.hotels,
        primaryHotel: ownerData.primaryHotel,
        bookings: [],
        metrics: ownerData.metrics,
        reason: "",
      };
    }

    return {
      status: "ready",
      profile: ownerData.profile,
      hotels: ownerData.hotels,
      primaryHotel: ownerData.primaryHotel,
      bookings: ownerData.bookings,
      metrics: ownerData.metrics,
      reason: "",
    };
  } catch {
    const profile = await getOwnerProfileOrNull();
    return {
      ...getUnavailableState(
        profile,
        "Owner bookings are temporarily unavailable. Please try again shortly.",
      ),
      bookings: [],
    };
  }
}

export async function updateOwnerBookingStatus(bookingId, nextStatus) {
  const bookingData = await getOwnerManagedBookingContext(bookingId);

  if (bookingData.status !== "ready") {
    return {
      status: bookingData.status,
      profile: bookingData.profile,
      booking: bookingData.booking,
      reason: bookingData.reason,
    };
  }

  const { profile, booking, bookingRow, supabase } = bookingData;

  if (nextStatus === "completed" && bookingRow.payment_status !== "paid") {
    return {
      status: "payment_required",
      profile,
      booking,
      reason: "Confirmed bookings can be completed only after payment is received.",
    };
  }

  if (!canOwnerUpdateBookingStatus(bookingRow.status, nextStatus)) {
    return {
      status: "invalid_transition",
      profile,
      booking,
      reason: `Booking status cannot move from ${bookingRow.status} to ${nextStatus}.`,
    };
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({
      status: nextStatus,
    })
    .eq("id", bookingId)
    .select(OWNER_BOOKING_COLUMNS)
    .single();

  if (error) {
    return {
      status: "unavailable",
      profile,
      booking,
      reason:
        error.message ||
        "Unable to update the booking status right now. Please try again shortly.",
    };
  }

  const travelerProfile = await getTravelerNotificationProfile(bookingRow.user_id);

  return {
    status: "updated",
    profile,
    booking: {
      ...booking,
      status: data.status,
      updatedAt: data.updated_at,
    },
    notificationContext: buildOwnerBookingNotificationContext({
      booking: {
        ...booking,
        status: data.status,
        updatedAt: data.updated_at,
      },
      bookingRow,
      nextStatus: data.status,
      travelerProfile,
    }),
    reason: "",
  };
}
