import { createSupabaseAdminClient } from "@/src/backend/auth/supabase-admin-client";

export async function saveBookingInquiry(payload) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return false;
  }

  const { error } = await supabase.from("booking_inquiries").insert({
    room_id: payload.roomId,
    hotel_id: payload.hotelId,
    guest_name: payload.name,
    guest_email: payload.email,
    guest_phone: payload.phone,
    check_in_date: payload.checkInDate,
    check_out_date: payload.checkOutDate,
    guests: payload.guests,
    message: payload.message,
  });

  if (error) {
    throw error;
  }

  return true;
}
