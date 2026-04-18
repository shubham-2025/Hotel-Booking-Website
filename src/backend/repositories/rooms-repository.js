import { createSupabaseServerClient } from "@/src/backend/auth/supabase-server-client";
import { hasSupabasePublicEnv } from "@/src/backend/config/env";
import {
  getFallbackOwnerImage,
  getFallbackRoomImages,
  getFallbackRooms,
} from "@/src/backend/repositories/demo-fallback-repository";

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

function getFilteredFallbackRooms(filters = {}) {
  return applyRoomFilters(getFallbackRooms(), filters);
}

function mapSupabaseRoom(row, hotel) {
  return {
    _id: row.id,
    roomType: row.room_type,
    pricePerNight: Number(row.price_per_night),
    amenities: row.amenities || [],
    images: row.image_urls?.length ? row.image_urls : getFallbackRoomImages(),
    isAvailable: row.is_active ?? true,
    hotel: {
      _id: hotel.id,
      name: hotel.name,
      city: hotel.city,
      address: hotel.address,
      slug: hotel.slug,
      owner: {
        image: getFallbackOwnerImage(),
      },
    },
  };
}

export async function getRooms(filters = {}) {
  if (!hasSupabasePublicEnv()) {
    return getFilteredFallbackRooms(filters);
  }

  try {
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return getFilteredFallbackRooms(filters);
    }

    const { data: hotelData, error: hotelError } = await supabase
      .from("hotels")
      .select("id, name, slug, city, address")
      .eq("status", "active");

    if (hotelError) {
      throw hotelError;
    }

    const activeHotels = hotelData || [];

    if (!activeHotels.length) {
      return getFilteredFallbackRooms(filters);
    }

    const activeHotelMap = new Map(activeHotels.map((hotel) => [hotel.id, hotel]));
    const activeHotelIds = activeHotels.map((hotel) => hotel.id);

    const { data, error } = await supabase
      .from("rooms")
      .select(
        "id, hotel_id, room_type, price_per_night, amenities, image_urls, is_active",
      )
      .eq("is_active", true)
      .in("hotel_id", activeHotelIds);

    if (error) {
      throw error;
    }

    const mappedRooms = (data || [])
      .map((row) => {
        const hotel = activeHotelMap.get(row.hotel_id);
        return hotel ? mapSupabaseRoom(row, hotel) : null;
      })
      .filter(Boolean);

    return applyRoomFilters(
      mappedRooms.length ? mappedRooms : getFallbackRooms(),
      filters,
    );
  } catch {
    return getFilteredFallbackRooms(filters);
  }
}

export async function getRoomById(roomId) {
  const availableRooms = await getRooms();
  return availableRooms.find((room) => room._id === roomId) || null;
}
