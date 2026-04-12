import { requireOwner } from "@/src/backend/auth/require-owner";
import { AuthError } from "@/src/backend/auth/auth-errors";
import { createSupabaseServerClient } from "@/src/backend/auth/supabase-server-client";
import { hasSupabasePublicEnv } from "@/src/backend/config/env";
import { getFallbackRoomImages } from "@/src/backend/repositories/demo-fallback-repository";

const OWNER_HOTEL_COLUMNS =
  "id, name, slug, description, city, address, contact_email, contact_phone, hero_image_url, amenities, status, created_at, updated_at";
const OWNER_ROOM_COLUMNS =
  "id, hotel_id, name, room_type, description, price_per_night, guest_capacity, bedroom_count, bathroom_count, amenities, image_urls, is_active, created_at, updated_at";
const OWNER_BOOKING_COLUMNS =
  "id, room_id, user_id, check_in_date, check_out_date, guests, total_price, status, payment_status, payment_method, created_at";

function getBaseMetrics() {
  return {
    totalHotels: 0,
    totalRooms: 0,
    activeRooms: 0,
    totalBookings: 0,
    totalRevenue: 0,
  };
}

function getUnavailableState(profile, reason) {
  return {
    status: "unavailable",
    profile,
    hotels: [],
    primaryHotel: null,
    rooms: [],
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
    images: row.image_urls?.length ? row.image_urls : getFallbackRoomImages(),
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
    createdAt: row.created_at,
    room,
    hotel: room?.hotel || null,
    guest: {
      _id: row.user_id || null,
      label: row.user_id ? "Authenticated traveler" : "Traveler",
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
  };

  if (!rooms.length) {
    return {
      status: "no_rooms",
      profile,
      hotels,
      primaryHotel,
      rooms: [],
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

async function getOwnerRoomContext(roomId) {
  const ownerHotelData = await getOwnerHotelContext();

  if (ownerHotelData.status === "unavailable") {
    return {
      status: "unavailable",
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
      profile: ownerHotelData.profile,
      hotels: [],
      primaryHotel: null,
      room: null,
      supabase: ownerHotelData.supabase,
      reason: "",
    };
  }

  const { profile, supabase, hotels, primaryHotel } = ownerHotelData;
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
    profile,
    hotels,
    primaryHotel,
    room: mapRoom(data, hotelsById.get(data.hotel_id) || primaryHotel || null),
    supabase,
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
  const contactEmail = payload.contactEmail || profile?.email || "";
  const contactPhone = payload.contactPhone || profile?.phone || "";
  const slugCandidates = [
    payload.slugBase,
    `${payload.slugBase}-${user.id.slice(0, 8)}`,
  ];

  for (const slug of slugCandidates) {
    const { data, error } = await supabase
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

    throw error;
  }

  return {
    status: "unavailable",
    profile,
    hotel: null,
    reason: "Unable to create a unique hotel record right now. Please try again.",
  };
}

export async function createOwnerRoomRecord(payload) {
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

  const { profile, supabase, primaryHotel } = ownerHotelData;

  const { data, error } = await supabase
    .from("rooms")
    .insert({
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
    throw error;
  }

  return {
    status: "created",
    profile,
    hotel: primaryHotel,
    room: mapRoom(data, primaryHotel),
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

export async function updateOwnerRoomRecord(roomId, payload) {
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

  const { data, error } = await supabase
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

  const { data, error } = await supabase
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
