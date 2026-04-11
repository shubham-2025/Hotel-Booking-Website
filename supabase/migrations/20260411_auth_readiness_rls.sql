create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    phone,
    avatar_url
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    phone = coalesce(excluded.phone, public.profiles.phone),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user_profile();

insert into public.profiles (
  id,
  email,
  full_name,
  phone,
  avatar_url
)
select
  users.id,
  users.email,
  coalesce(users.raw_user_meta_data ->> 'full_name', users.raw_user_meta_data ->> 'name'),
  users.raw_user_meta_data ->> 'phone',
  users.raw_user_meta_data ->> 'avatar_url'
from auth.users as users
left join public.profiles as profiles
  on profiles.id = users.id
where profiles.id is null;

create or replace function public.has_management_role()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('owner', 'admin')
  );
$$;

create or replace function public.owns_hotel(target_hotel_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_management_role()
    and exists (
      select 1
      from public.hotels
      where id = target_hotel_id
        and owner_id = auth.uid()
    );
$$;

create or replace function public.owns_room(target_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_management_role()
    and exists (
      select 1
      from public.rooms as rooms
      join public.hotels as hotels
        on hotels.id = rooms.hotel_id
      where rooms.id = target_room_id
        and hotels.owner_id = auth.uid()
    );
$$;

create index if not exists hotels_owner_id_idx
  on public.hotels (owner_id);

create index if not exists hotels_status_idx
  on public.hotels (status);

create index if not exists hotels_city_idx
  on public.hotels (city);

create index if not exists rooms_hotel_id_idx
  on public.rooms (hotel_id);

create index if not exists rooms_is_active_idx
  on public.rooms (is_active);

create index if not exists bookings_user_id_idx
  on public.bookings (user_id);

create index if not exists bookings_room_id_idx
  on public.bookings (room_id);

create index if not exists booking_inquiries_room_id_idx
  on public.booking_inquiries (room_id);

create index if not exists booking_inquiries_hotel_id_idx
  on public.booking_inquiries (hotel_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'bookings_check_out_after_check_in'
  ) then
    alter table public.bookings
      add constraint bookings_check_out_after_check_in
      check (check_out_date > check_in_date) not valid;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'booking_inquiries_check_out_after_check_in'
  ) then
    alter table public.booking_inquiries
      add constraint booking_inquiries_check_out_after_check_in
      check (check_out_date > check_in_date) not valid;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'rooms_guest_capacity_positive'
  ) then
    alter table public.rooms
      add constraint rooms_guest_capacity_positive
      check (guest_capacity > 0) not valid;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'rooms_bedroom_count_positive'
  ) then
    alter table public.rooms
      add constraint rooms_bedroom_count_positive
      check (bedroom_count > 0) not valid;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'rooms_bathroom_count_positive'
  ) then
    alter table public.rooms
      add constraint rooms_bathroom_count_positive
      check (bathroom_count > 0) not valid;
  end if;
end
$$;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Owners can insert own hotels" on public.hotels;
create policy "Owners can insert own hotels"
on public.hotels
for insert
to authenticated
with check (
  public.has_management_role()
  and owner_id = auth.uid()
);

drop policy if exists "Owners can read own hotels" on public.hotels;
create policy "Owners can read own hotels"
on public.hotels
for select
to authenticated
using (public.owns_hotel(id));

drop policy if exists "Owners can update own hotels" on public.hotels;
create policy "Owners can update own hotels"
on public.hotels
for update
to authenticated
using (public.owns_hotel(id))
with check (
  public.has_management_role()
  and owner_id = auth.uid()
);

drop policy if exists "Owners can insert rooms for owned hotels" on public.rooms;
create policy "Owners can insert rooms for owned hotels"
on public.rooms
for insert
to authenticated
with check (public.owns_hotel(hotel_id));

drop policy if exists "Owners can read own rooms" on public.rooms;
create policy "Owners can read own rooms"
on public.rooms
for select
to authenticated
using (public.owns_room(id));

drop policy if exists "Owners can update rooms for owned hotels" on public.rooms;
create policy "Owners can update rooms for owned hotels"
on public.rooms
for update
to authenticated
using (public.owns_room(id))
with check (public.owns_hotel(hotel_id));

drop policy if exists "Owners can delete rooms for owned hotels" on public.rooms;
create policy "Owners can delete rooms for owned hotels"
on public.rooms
for delete
to authenticated
using (public.owns_room(id));

drop policy if exists "Guests can read own bookings" on public.bookings;
create policy "Guests can read own bookings"
on public.bookings
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Guests can create own bookings" on public.bookings;
create policy "Guests can create own bookings"
on public.bookings
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Owners can read bookings for owned hotels" on public.bookings;
create policy "Owners can read bookings for owned hotels"
on public.bookings
for select
to authenticated
using (public.owns_room(room_id));
