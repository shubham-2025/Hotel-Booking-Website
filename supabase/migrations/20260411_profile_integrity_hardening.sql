create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() = old.id then
    if new.role is distinct from old.role then
      raise exception 'You cannot change your own role.';
    end if;

    if new.email is distinct from old.email then
      raise exception 'You cannot change your own profile email directly.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_prevent_privilege_escalation on public.profiles;
create trigger profiles_prevent_privilege_escalation
before update on public.profiles
for each row execute function public.prevent_profile_privilege_escalation();

revoke update on public.profiles from authenticated;
grant update (full_name, phone, avatar_url) on public.profiles to authenticated;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update of email, raw_user_meta_data on auth.users
for each row
when (
  old.email is distinct from new.email
  or old.raw_user_meta_data is distinct from new.raw_user_meta_data
)
execute function public.handle_new_user_profile();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'bookings_guests_positive'
  ) then
    alter table public.bookings
      add constraint bookings_guests_positive
      check (guests > 0) not valid;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'booking_inquiries_guests_positive'
  ) then
    alter table public.booking_inquiries
      add constraint booking_inquiries_guests_positive
      check (guests > 0) not valid;
  end if;
end
$$;

-- Constraint validation remains deferred intentionally.
-- The following constraints were introduced as NOT VALID and should be
-- validated only after auditing live data:
--   bookings_check_out_after_check_in
--   booking_inquiries_check_out_after_check_in
--   rooms_guest_capacity_positive
--   rooms_bedroom_count_positive
--   rooms_bathroom_count_positive
--   bookings_guests_positive
--   booking_inquiries_guests_positive
