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
  return applyRoomFilters(getFallbackRooms(), filters).map((room) => ({
    ...room,
    inventorySource: "fallback",
    isBookablePublic: false,
    usesFallbackImages: false,
  }));
}

function mapSupabaseRoom(row, hotel) {
  return {
    _id: row.id,
    roomType: row.room_type,
    pricePerNight: Number(row.price_per_night),
    guestCapacity: row.guest_capacity || 0,
    amenities: row.amenities || [],
    images: row.image_urls?.length ? row.image_urls : getFallbackRoomImages(),
    usesFallbackImages: !(row.image_urls?.length),
    isAvailable: row.is_active ?? true,
    inventorySource: "real",
    isBookablePublic: true,
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

async function getRealPublicRooms() {
  if (!hasSupabasePublicEnv()) {
    return {
      status: "fallback",
      reason: "missing_env",
      rooms: [],
    };
  }

  try {
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return {
        status: "fallback",
        reason: "client_unavailable",
        rooms: [],
      };
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
      return {
        status: "ready",
        reason: "",
        rooms: [],
      };
    }

    const activeHotelMap = new Map(activeHotels.map((hotel) => [hotel.id, hotel]));
    const activeHotelIds = activeHotels.map((hotel) => hotel.id);

    const { data, error } = await supabase
      .from("rooms")
      .select(
        "id, hotel_id, room_type, price_per_night, guest_capacity, amenities, image_urls, is_active",
      )
      .eq("is_active", true)
      .in("hotel_id", activeHotelIds);

    if (error) {
      throw error;
    }

    return {
      status: "ready",
      reason: "",
      rooms: (data || [])
        .map((row) => {
          const hotel = activeHotelMap.get(row.hotel_id);
          return hotel ? mapSupabaseRoom(row, hotel) : null;
        })
        .filter(Boolean),
    };
  } catch {
    return {
      status: "fallback",
      reason: "query_failed",
      rooms: [],
    };
  }
}

function buildPublicRoomInventorySnapshot(
  roomCollection,
  source,
  limit = 4,
  metadata = {},
) {
  const cityNames = [...new Set(roomCollection.map((room) => room.hotel.city))];
  const hotelIds = new Set(roomCollection.map((room) => room.hotel._id));
  const averageNightlyRate = roomCollection.length
    ? Math.round(
        roomCollection.reduce(
          (runningTotal, room) => runningTotal + room.pricePerNight,
          0,
        ) / roomCollection.length,
      )
    : 0;

  const featuredRooms =
    source === "real"
      ? [...roomCollection]
          .sort((left, right) => {
            if (left.usesFallbackImages !== right.usesFallbackImages) {
              return Number(left.usesFallbackImages) - Number(right.usesFallbackImages);
            }

            return left.hotel.city.localeCompare(right.hotel.city);
          })
          .slice(0, limit)
      : roomCollection.slice(0, limit);

  return {
    source,
    inventoryReason: metadata.inventoryReason || "",
    liveRoomCount: metadata.liveRoomCount || 0,
    rooms: roomCollection,
    featuredRooms,
    totalPublicRooms: roomCollection.length,
    activeCityCount: cityNames.length,
    activeHotelCount: hotelIds.size,
    averageNightlyRate,
    featuredCities: cityNames.slice(0, 6),
  };
}

export async function getPublicRoomInventorySnapshot({
  filters = {},
  limit = 4,
} = {}) {
  const inventory = await getRealPublicRooms();

  if (inventory.status === "ready") {
    const filteredRealRooms = applyRoomFilters(inventory.rooms, filters);

    return buildPublicRoomInventorySnapshot(
      filteredRealRooms,
      inventory.rooms.length ? "real" : "empty",
      limit,
      {
        inventoryReason: inventory.rooms.length
          ? ""
          : "No public rooms are live yet. Publish the hotel and at least one room to make inventory visible to travelers.",
        liveRoomCount: inventory.rooms.length,
      },
    );
  }

  return buildPublicRoomInventorySnapshot(
    getFilteredFallbackRooms(filters),
    "fallback",
    limit,
    {
      inventoryReason:
        inventory.reason === "missing_env"
          ? "Live inventory is unavailable because the Supabase public environment is not configured."
          : "Live inventory is temporarily unavailable, so demo rooms are shown instead.",
      liveRoomCount: 0,
    },
  );
}

export async function getRooms(filters = {}) {
  const snapshot = await getPublicRoomInventorySnapshot({ filters });
  return snapshot.rooms;
}

export async function getRoomById(roomId) {
  const availableRooms = await getRooms();
  return availableRooms.find((room) => room._id === roomId) || null;
}
