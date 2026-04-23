grant update (status) on public.bookings to authenticated;

drop policy if exists "Owners can update bookings for owned hotels" on public.bookings;
create policy "Owners can update bookings for owned hotels"
on public.bookings
for update
to authenticated
using (public.owns_room(room_id))
with check (public.owns_room(room_id));
