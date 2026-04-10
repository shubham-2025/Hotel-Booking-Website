import { bookings, dashboardSnapshot, rooms } from "./mock-data";
import { hasSupabasePublicEnv } from "./env";
import { createSupabaseServerClient } from "./supabase/server";

function applyRoomFilters(roomCollection, filters = {}) {
  let filteredRooms = [...roomCollection];

  if (filters.city) {
    filteredRooms = filteredRooms.filter((room) =>
      room.hotel.city.toLowerCase().includes(filters.city.toLowerCase()),
    );
  }

  if (filters.roomType) {
    filteredRooms = filteredRooms.filter(
      (room) => room.roomType === filters.roomType,
    );
  }

  if (filters.priceRange) {
    const [min, max] = filters.priceRange;
    filteredRooms = filteredRooms.filter(
      (room) => room.pricePerNight >= min && room.pricePerNight <= max,
    );
  }

  if (filters.sort === "price-asc") {
    filteredRooms.sort((a, b) => a.pricePerNight - b.pricePerNight);
  }

  if (filters.sort === "price-desc") {
    filteredRooms.sort((a, b) => b.pricePerNight - a.pricePerNight);
  }

  if (filters.sort === "city") {
    filteredRooms.sort((a, b) => a.hotel.city.localeCompare(b.hotel.city));
  }

  return filteredRooms;
}

function mapSupabaseRoom(row) {
  const hotel = Array.isArray(row.hotels) ? row.hotels[0] : row.hotels;

  return {
    _id: row.id,
    roomType: row.room_type,
    pricePerNight: Number(row.price_per_night),
    amenities: row.amenities || [],
    images: row.image_urls?.length ? row.image_urls : rooms[0].images,
    isAvailable: row.is_active ?? true,
    hotel: {
      _id: hotel?.id || "demo-hotel",
      name: hotel?.name || "QuickStay Signature Hotel",
      city: hotel?.city || "New York",
      address: hotel?.address || "Address pending",
      slug: hotel?.slug || "quickstay-signature-hotel",
      owner: {
        image: rooms[0].hotel.owner.image,
      },
    },
  };
}

export async function getRooms(filters = {}) {
  if (!hasSupabasePublicEnv()) {
    return applyRoomFilters(rooms, filters);
  }

  try {
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return getFallbackRoomData(filters);
    }

    const { data, error } = await supabase
      .from("rooms")
      .select(
        "id, room_type, price_per_night, amenities, image_urls, is_active, hotels ( id, name, slug, city, address )",
      )
      .eq("is_active", true);

    if (error) {
      throw error;
    }

    const mappedRooms = (data || []).map(mapSupabaseRoom);

    return applyRoomFilters(mappedRooms.length ? mappedRooms : rooms, filters);
  } catch {
    return applyRoomFilters(rooms, filters);
  }
}

export async function getRoomById(roomId) {
  const availableRooms = await getRooms();
  return availableRooms.find((room) => room._id === roomId) || null;
}

export async function getBookings() {
  return bookings;
}

export async function getDashboardData() {
  return dashboardSnapshot;
}
