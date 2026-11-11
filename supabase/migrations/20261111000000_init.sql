-- Black Amatis · EMMA 2026 portfolio — initial schema
-- Content tables carry status ('draft' | 'published'); public pages read only published rows.

create extension if not exists "pgcrypto";

-- Editors -----------------------------------------------------------------
create table if not exists public.editors (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'editor' check (role in ('owner', 'editor')),
  created_at timestamptz not null default now()
);

create or replace function public.is_editor() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.editors where user_id = auth.uid());
$$;

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.editors where user_id = auth.uid() and role = 'owner');
$$;

-- Content -----------------------------------------------------------------
create table if not exists public.vehicle (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Black Amatis',
  model text not null default 'Honda Odyssey',
  year text, category text,
  class text not null default 'X' check (class in ('E', 'S', 'M', 'X', 'XU')),
  event text default 'EMMA 2026',
  dark_side_name text, light_side_name text,
  dark_side_body text, light_side_body text,
  statement text, story text,
  owner text, installer text, designer text, tuner text,
  instagram text, website text,
  car_photo_path text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_by uuid references auth.users (id),
  updated_at timestamptz not null default now()
);

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  when_label text, title text not null, body text, photo_path text,
  sort int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now()
);

create table if not exists public.competitions (
  id uuid primary key default gen_random_uuid(),
  event text not null, city text, category text, install_points text, result text, date date,
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now()
);

create table if not exists public.components (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null, role text,
  type text not null check (type in ('head_unit', 'dsp', 'amplifier', 'speaker', 'battery', 'main_fuse', 'distribution')),
  brand text, model text,
  specs jsonb not null default '[]'::jsonb,
  note text,
  photo_path text, pdf_path text,
  in_system boolean not null default false,
  in_wiring boolean not null default false,
  fed_by text,
  sort int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now()
);

create table if not exists public.wiring_links (
  id uuid primary key default gen_random_uuid(),
  from_key text not null, to_key text not null,
  cable_mm2 numeric, fuse_a numeric,
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now()
);

create table if not exists public.tuning (
  id uuid primary key default gen_random_uuid(),
  driver text not null, hpf_hz text, lpf_hz text, slope_db text, time_align_ms text, eq_bands text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  area text not null check (area in ('engine', 'doors', 'dash', 'trunk', 'floor')),
  code text not null, caption text, proves_criterion text, path text,
  sort int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now()
);

create table if not exists public.craft_photos (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('wiring', 'hu', 'amps', 'spk', 'other')),
  caption text, path text,
  sort int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now()
);

create table if not exists public.bonus_requests (
  id uuid primary key default gen_random_uuid(),
  no int not null,
  title text not null,
  element text not null check (element in ('A', 'B', 'C', 'D')),
  description text, photo_path text,
  idea boolean not null default false,
  execution int not null default 0 check (execution between 0 and 2),
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now()
);

create table if not exists public.judge_evidence (
  criterion_key text primary key,
  ready boolean not null default false,
  note text,
  updated_by uuid references auth.users (id),
  updated_at timestamptz not null default now()
);

create table if not exists public.team (
  id uuid primary key default gen_random_uuid(),
  role text, name text, line text, photo_path text,
  sort int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now()
);

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text, logo_path text, url text,
  sort int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now()
);

create table if not exists public.before_after (
  id uuid primary key default gen_random_uuid(),
  view text not null check (view in ('exterior', 'dashboard', 'trunk')),
  before_path text, after_path text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now()
);

create table if not exists public.theme_zones (
  id uuid primary key default gen_random_uuid(),
  key text not null check (key in ('exterior', 'interior', 'trunk')),
  name text not null, criterion text, photo_path text,
  elements jsonb not null default '[]'::jsonb,
  sort int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now()
);

-- RLS ---------------------------------------------------------------------
-- Public: select published rows. Editors: full read/write. Only owners publish.
do $$
declare t text;
begin
  foreach t in array array['vehicle','milestones','competitions','components','wiring_links','tuning',
                           'photos','craft_photos','bonus_requests','team','partners','before_after','theme_zones']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public read published" on public.%I', t);
    execute format('create policy "public read published" on public.%I for select using (status = ''published'' or public.is_editor())', t);
    execute format('drop policy if exists "editors insert drafts" on public.%I', t);
    execute format('create policy "editors insert drafts" on public.%I for insert to authenticated with check (public.is_editor() and (status = ''draft'' or public.is_owner()))', t);
    execute format('drop policy if exists "editors update drafts" on public.%I', t);
    execute format('create policy "editors update drafts" on public.%I for update to authenticated using (public.is_editor()) with check (public.is_editor() and (status = ''draft'' or public.is_owner()))', t);
    execute format('drop policy if exists "editors delete" on public.%I', t);
    execute format('create policy "editors delete" on public.%I for delete to authenticated using (public.is_editor())', t);
  end loop;
end $$;

alter table public.judge_evidence enable row level security;
create policy "public read evidence" on public.judge_evidence for select using (true);
create policy "editors write evidence" on public.judge_evidence for all to authenticated
  using (public.is_editor()) with check (public.is_editor());

alter table public.editors enable row level security;
create policy "editors read editors" on public.editors for select to authenticated using (public.is_editor());
create policy "owners manage editors" on public.editors for all to authenticated
  using (public.is_owner()) with check (public.is_owner());

-- Storage -----------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('photos', 'photos', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('pdfs', 'pdfs', true) on conflict (id) do nothing;

create policy "public read photos and pdfs" on storage.objects for select
  using (bucket_id in ('photos', 'pdfs'));
create policy "editors upload" on storage.objects for insert to authenticated
  with check (bucket_id in ('photos', 'pdfs') and public.is_editor());
create policy "editors update files" on storage.objects for update to authenticated
  using (bucket_id in ('photos', 'pdfs') and public.is_editor());
create policy "editors delete files" on storage.objects for delete to authenticated
  using (bucket_id in ('photos', 'pdfs') and public.is_editor());
