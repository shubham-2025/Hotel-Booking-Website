import { requireOwner } from "@/src/backend/auth/require-owner";
import { AuthError } from "@/src/backend/auth/auth-errors";
import { createSupabaseServerClient } from "@/src/backend/auth/supabase-server-client";
import { hasSupabasePublicEnv } from "@/src/backend/config/env";
import { getFallbackRoomImages } from "@/src/backend/repositories/demo-fallback-repository";

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

async function getOwnerScopedInventory() {
  const { user, profile } = await requireOwner();

  if (!hasSupabasePublicEnv()) {
    return getUnavailableState(
      profile,
      "Supabase environment variables are not configured yet.",
    );
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return getUnavailableState(
      profile,
      "Authenticated Supabase access is temporarily unavailable.",
    );
  }

  const { data: hotelRows, error: hotelError } = await supabase
    .from("hotels")
    .select(
      "id, name, slug, description, city, address, contact_email, contact_phone, hero_image_url, amenities, status, created_at, updated_at",
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });

  if (hotelError) {
    throw hotelError;
  }

  const hotels = (hotelRows || []).map(mapHotel);

  if (!hotels.length) {
    return {
      status: "no_hotel",
      profile,
      hotels: [],
      primaryHotel: null,
      rooms: [],
      recentBookings: [],
      metrics: getBaseMetrics(),
      reason: "",
    };
  }

  const hotelsById = new Map(hotels.map((hotel) => [hotel._id, hotel]));
  const hotelIds = hotels.map((hotel) => hotel._id);

  const { data: roomRows, error: roomError } = await supabase
    .from("rooms")
    .select(
      "id, hotel_id, name, room_type, description, price_per_night, guest_capacity, bedroom_count, bathroom_count, amenities, image_urls, is_active, created_at, updated_at",
    )
    .in("hotel_id", hotelIds)
    .order("created_at", { ascending: false });

  if (roomError) {
    throw roomError;
  }

  const rooms = (roomRows || []).map((row) =>
    mapRoom(row, hotelsById.get(row.hotel_id) || null),
  );

  const metrics = {
    totalHotels: hotels.length,
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
      primaryHotel: hotels[0] || null,
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
    .select(
      "id, room_id, user_id, check_in_date, check_out_date, guests, total_price, status, payment_status, payment_method, created_at",
    )
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
    primaryHotel: hotels[0] || null,
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
