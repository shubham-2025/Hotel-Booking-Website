import { z } from "zod";

export const ownerRoomSchema = z.object({
  name: z.string().trim().max(120).optional().default(""),
  roomType: z.string().trim().min(2).max(80),
  pricePerNight: z.coerce.number().min(0).max(1000000),
  guestCapacity: z.coerce.number().int().min(1).max(12),
  bedroomCount: z.coerce.number().int().min(1).max(12),
  bathroomCount: z.coerce.number().int().min(1).max(12),
  description: z.string().trim().max(1500).optional().default(""),
  amenities: z.array(z.string().trim().min(1).max(60)).max(12).default([]),
});
