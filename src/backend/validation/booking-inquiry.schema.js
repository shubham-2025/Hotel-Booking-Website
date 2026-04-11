import { z } from "zod";

export const bookingInquirySchema = z.object({
  roomId: z.string().min(1),
  hotelId: z.string().min(1),
  hotelName: z.string().min(1),
  roomType: z.string().min(1),
  name: z.string().min(2),
  email: z.email(),
  phone: z.string().optional().default(""),
  checkInDate: z.iso.date(),
  checkOutDate: z.iso.date(),
  guests: z.coerce.number().int().min(1).max(8),
  message: z.string().optional().default(""),
});
