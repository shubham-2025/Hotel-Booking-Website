create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  phone text,
  role text not null default 'guest' check (role in ('guest', 'owner', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hotels (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  city text not null,
  address text not null,
  contact_email text,
  contact_phone text,
  hero_image_url text,
  amenities text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  name text,
  room_type text not null,
  description text,
  price_per_night numeric(10,2) not null check (price_per_night >= 0),
  guest_capacity integer not null default 2,
  bedroom_count integer not null default 1,
  bathroom_count integer not null default 1,
  amenities text[] not null default '{}',
  image_urls text[] not null default '{}',
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete restrict,
  user_id uuid references public.profiles(id) on delete set null,
  check_in_date date not null,
  check_out_date date not null,
  guests integer not null default 1,
  total_price numeric(10,2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  payment_method text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'website',
  subscribed_at timestamptz not null default now()
);

create table if not exists public.booking_inquiries (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete set null,
  hotel_id uuid references public.hotels(id) on delete set null,
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  check_in_date date not null,
  check_out_date date not null,
  guests integer not null default 1,
  message text,
  status text not null default 'new' check (status in ('new', 'reviewed', 'converted', 'closed')),
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists hotels_set_updated_at on public.hotels;
create trigger hotels_set_updated_at
before update on public.hotels
for each row execute function public.set_updated_at();

drop trigger if exists rooms_set_updated_at on public.rooms;
create trigger rooms_set_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.hotels enable row level security;
alter table public.rooms enable row level security;
alter table public.bookings enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.booking_inquiries enable row level security;

drop policy if exists "Public can read active hotels" on public.hotels;
create policy "Public can read active hotels"
on public.hotels
for select
using (status = 'active');

drop policy if exists "Public can read active rooms" on public.rooms;
create policy "Public can read active rooms"
on public.rooms
for select
using (is_active = true);
