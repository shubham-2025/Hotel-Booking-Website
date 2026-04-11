import { z } from "zod";

export const ownerHotelSchema = z.object({
  name: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(80),
  address: z.string().trim().min(5).max(200),
  contactEmail: z.union([z.literal(""), z.email()]).default(""),
  contactPhone: z.string().trim().max(32).optional().default(""),
  description: z.string().trim().max(1000).optional().default(""),
});
