-- ============================================================
-- 12th Business Convention 2026 — Supabase Schema
-- Run this entire file in: Supabase → SQL Editor → New query
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── PROFILES ────────────────────────────────────────────────
-- Mirrors auth.users; populated by the trigger below.
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  role        text not null default 'registerer' check (role in ('system_admin', 'supervisor', 'registerer')),
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user is added
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'registerer')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── CONVENTIONS ─────────────────────────────────────────────
create table if not exists public.conventions (
  id              uuid primary key default gen_random_uuid(),
  year            int  not null unique,
  title           text not null,
  fee_resident    int  not null default 40000,
  fee_non_resident int not null default 30000,
  is_active       boolean not null default false,
  created_at      timestamptz not null default now()
);

-- Ensure only one convention is active at a time
create unique index if not exists one_active_convention
  on public.conventions (is_active)
  where is_active = true;

-- Insert the current convention
insert into public.conventions (year, title, fee_resident, fee_non_resident, is_active)
values (2026, '12th Business Convention 2026', 40000, 30000, true)
on conflict (year) do nothing;

-- ─── LOOKUPS ─────────────────────────────────────────────────
-- Stores districts, churches, and occupations for autocomplete
create table if not exists public.lookups (
  id         uuid primary key default gen_random_uuid(),
  category   text not null check (category in ('district', 'church', 'occupation')),
  value      text not null,
  created_at timestamptz not null default now(),
  unique (category, value)
);

-- ─── ATTENDEES ───────────────────────────────────────────────
create table if not exists public.attendees (
  id              uuid primary key default gen_random_uuid(),
  convention_id   uuid not null references public.conventions(id) on delete restrict,
  full_name       text not null,
  gender          text not null check (gender in ('Male', 'Female')),
  occupation      text not null,
  district        text not null,
  church          text not null,
  residency       text not null check (residency in ('Resident', 'Non-Resident')),
  amount_paid     int  not null default 0,
  payment_method  text not null check (payment_method in ('Cash', 'MoMo', 'Waived')),
  phone           text,
  notes           text,
  checked_in_at   timestamptz,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Auto-update the updated_at column
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists attendees_updated_at on public.attendees;
create trigger attendees_updated_at
  before update on public.attendees
  for each row execute procedure public.set_updated_at();

-- Indexes for common query patterns
create index if not exists attendees_convention_id on public.attendees(convention_id);
create index if not exists attendees_full_name     on public.attendees(lower(full_name));
create index if not exists attendees_church        on public.attendees(church);
create index if not exists attendees_district      on public.attendees(district);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
alter table public.profiles  enable row level security;
alter table public.conventions enable row level security;
alter table public.lookups   enable row level security;
alter table public.attendees enable row level security;

-- Profiles: users see their own profile; admins see all
create policy "users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "admins can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'system_admin'
    )
  );

-- Conventions: any authenticated user can read
create policy "authenticated can read conventions"
  on public.conventions for select
  to authenticated using (true);

-- Lookups: authenticated users can read; only admins can write
create policy "authenticated can read lookups"
  on public.lookups for select
  to authenticated using (true);

create policy "admins can insert lookups"
  on public.lookups for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'system_admin'
    )
  );

create policy "admins can delete lookups"
  on public.lookups for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'system_admin'
    )
  );

-- Attendees: authenticated users can read, insert, update; only admins can delete
create policy "authenticated can read attendees"
  on public.attendees for select
  to authenticated using (true);

create policy "authenticated can insert attendees"
  on public.attendees for insert
  to authenticated with check (true);

create policy "authenticated can update attendees"
  on public.attendees for update
  to authenticated using (true);

create policy "admins can delete attendees"
  on public.attendees for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'system_admin'
    )
  );

-- ─── CSV EXPORT VIEW (convenience) ───────────────────────────
create or replace view public.attendees_export as
select
  a.full_name,
  a.gender,
  a.occupation,
  a.district,
  a.church,
  a.residency,
  a.amount_paid,
  a.payment_method,
  a.phone,
  a.notes,
  case when a.checked_in_at is not null then 'Yes' else 'No' end as checked_in,
  to_char(a.created_at at time zone 'Africa/Kampala', 'YYYY-MM-DD HH24:MI') as registered_at
from public.attendees a
join public.conventions c on c.id = a.convention_id
where c.is_active = true
order by a.created_at desc;
