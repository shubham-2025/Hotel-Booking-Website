create extension if not exists btree_gist;

alter table public.bookings
  add column if not exists payment_provider text,
  add column if not exists payment_reference text,
  add column if not exists payment_intent_id text,
  add column if not exists payment_paid_at timestamptz,
  add column if not exists payment_last_event text,
  add column if not exists payment_last_event_at timestamptz,
  add column if not exists payment_last_error text;

create unique index if not exists bookings_payment_reference_unique
on public.bookings (payment_reference)
where payment_reference is not null;

create unique index if not exists bookings_payment_intent_id_unique
on public.bookings (payment_intent_id)
where payment_intent_id is not null;

do $$
begin
  if exists (
    select 1
    from public.bookings first_booking
    join public.bookings second_booking
      on first_booking.room_id = second_booking.room_id
     and first_booking.id < second_booking.id
     and first_booking.status in ('pending', 'confirmed')
     and second_booking.status in ('pending', 'confirmed')
     and daterange(
       first_booking.check_in_date,
       first_booking.check_out_date,
       '[)'
     ) && daterange(
       second_booking.check_in_date,
       second_booking.check_out_date,
       '[)'
     )
  ) then
    raise exception
      'Cannot apply bookings_no_overlapping_active_stays because overlapping pending/confirmed bookings already exist.';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'bookings_no_overlapping_active_stays'
  ) then
    alter table public.bookings
      add constraint bookings_no_overlapping_active_stays
      exclude using gist (
        room_id with =,
        daterange(check_in_date, check_out_date, '[)') with &&
      )
      where (status in ('pending', 'confirmed'));
  end if;
end
$$;
