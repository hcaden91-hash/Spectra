-- ============================================================================
-- SPECTRA — Supabase schema
-- Run this ONCE in the Supabase dashboard → SQL Editor → New query.
-- Everything security-critical is enforced here (Row Level Security), not in
-- the client: even a user who edits the JavaScript cannot write to these
-- tables unless they hold the single admin seat.
-- ============================================================================

-- ─── Products ───────────────────────────────────────────────────────────────
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  brand         text not null,
  model         text not null,
  price         numeric(10,2) not null check (price >= 0),
  category      text not null check (category in ('Gaming','Business','Creator','Everyday')),
  cpu           text not null,
  gpu           text not null,
  gpu_type      text not null check (gpu_type in ('NVIDIA','AMD','Apple','Integrated')),
  ram_gb        integer not null check (ram_gb > 0),
  storage_gb    integer not null check (storage_gb > 0),
  display       text not null,
  battery       text not null,
  gradient_from text not null default '#2b2f3d',
  gradient_to   text not null default '#0e1017',
  image_url     text,
  featured      boolean not null default false,
  in_stock      boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (brand, model)
);

-- ─── One-time master admin seat ─────────────────────────────────────────────
-- A singleton row (id must equal 1). The primary-key conflict makes claiming
-- atomic: exactly one signup can ever win, with no race condition.
create table if not exists public.admin_account (
  id         integer primary key default 1 check (id = 1),
  user_id    uuid not null unique references auth.users (id) on delete cascade,
  claimed_at timestamptz not null default now()
);

-- ─── Global site settings (singleton) ───────────────────────────────────────
create table if not exists public.site_settings (
  id                       integer primary key default 1 check (id = 1),
  site_name                text not null default 'SPECTRA',
  announcement             text not null default 'Free shipping on orders over $999 — every machine ships spec-verified.',
  hero_title               text not null default 'Machines, measured.',
  hero_subtitle            text not null default 'Fifty laptops. Real silicon, real specs, straight answers. Filter by what actually matters and check out in seconds.',
  cta_text                 text not null default 'Browse the lineup',
  banner_image_url         text not null default '',
  color_accent             text not null default '#4f8dff',
  color_accent_2           text not null default '#22d3ee',
  color_void               text not null default '#0a0c10',
  checkout_url             text not null default '',
  tax_rate                 numeric(5,4) not null default 0.0800 check (tax_rate >= 0 and tax_rate < 1),
  shipping_flat            numeric(10,2) not null default 19.00 check (shipping_flat >= 0),
  free_shipping_threshold  numeric(10,2) not null default 999.00 check (free_shipping_threshold >= 0),
  updated_at               timestamptz not null default now()
);

insert into public.site_settings (id) values (1)
on conflict (id) do nothing;

-- ─── updated_at maintenance ─────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_products_touch on public.products;
create trigger trg_products_touch
  before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_settings_touch on public.site_settings;
create trigger trg_settings_touch
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- ─── Helper: is the caller the admin? ───────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.admin_account where user_id = auth.uid()
  );
$$;

-- ─── RPC: claim the admin seat (first authenticated caller wins, forever) ───
create or replace function public.claim_admin()
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'Must be signed in to claim the admin seat';
  end if;

  -- Atomic: the id=1 primary key means only the first insert ever succeeds.
  insert into public.admin_account (id, user_id)
  values (1, auth.uid())
  on conflict (id) do nothing;

  -- True if the caller now holds the seat (either just claimed it, or
  -- already held it); false if someone else claimed it first.
  return exists (
    select 1 from public.admin_account where user_id = auth.uid()
  );
end;
$$;

-- ─── RPC: public admin status (leaks no identity, only claim state) ─────────
create or replace function public.get_admin_status()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'claimed', exists (select 1 from public.admin_account),
    'is_admin', exists (select 1 from public.admin_account where user_id = auth.uid())
  );
$$;

revoke all on function public.claim_admin() from public;
grant execute on function public.claim_admin() to authenticated;
grant execute on function public.get_admin_status() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ─── Row Level Security ─────────────────────────────────────────────────────
alter table public.products      enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_account enable row level security;

-- Products: everyone reads the catalog; only the admin writes it.
drop policy if exists "products_public_read"  on public.products;
create policy "products_public_read"
  on public.products for select
  to anon, authenticated
  using (true);

drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert"
  on public.products for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update"
  on public.products for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete"
  on public.products for delete
  to authenticated
  using (public.is_admin());

-- Settings: everyone reads; only the admin updates; nobody inserts/deletes
-- (the singleton row is seeded above and protected by the id = 1 check).
drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read"
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "settings_admin_update" on public.site_settings;
create policy "settings_admin_update"
  on public.site_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- admin_account: no direct client access at all. All reads/writes go through
-- the two security-definer RPCs above, so the admin's user id never leaks.

-- ─── Realtime ───────────────────────────────────────────────────────────────
-- Broadcast every product and settings change to all connected sessions.
do $$
begin
  alter publication supabase_realtime add table public.products;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.site_settings;
exception when duplicate_object then null;
end $$;
