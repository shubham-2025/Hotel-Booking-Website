import { z } from "zod";

export const bookingCreateSchema = z.object({
  roomId: z.string().trim().min(1),
  checkInDate: z.iso.date(),
  checkOutDate: z.iso.date(),
  guests: z.coerce.number().int().min(1).max(8),
  notes: z.string().trim().max(1000).optional().default(""),
});
