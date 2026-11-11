-- Runs on the team's cable diagram: "trunk" (battery to a distribution / ground block)
-- and "channel" (one device fed from a trunk). Chains and cables are jsonb:
--   power / ground: [{"id","t":"node","label","fuse_a"} | {"id","t":"cable","name","awg","length_cm"}]
--   cables:         [{"id","role":"signal"|"speaker"|"other","from","to","to_key","name","awg","length_cm"}]
--   wiring_hotspots: [{"x","y","w","h"}] in percent of the cable diagram image.
create table if not exists public.circuits (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  kind text not null default 'channel' check (kind in ('trunk', 'channel')),
  component_key text,
  power_from uuid,
  ground_from uuid,
  power jsonb not null default '[]'::jsonb,
  ground jsonb not null default '[]'::jsonb,
  cables jsonb not null default '[]'::jsonb,
  wiring_hotspots jsonb not null default '[]'::jsonb,
  sort int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.circuits enable row level security;
create policy "public read published" on public.circuits for select
  using (status = 'published' or private.is_editor());
create policy "editors insert drafts" on public.circuits for insert to authenticated
  with check (private.is_editor() and (status = 'draft' or private.is_owner()));
create policy "editors update drafts" on public.circuits for update to authenticated
  using (private.is_editor()) with check (private.is_editor() and (status = 'draft' or private.is_owner()));
create policy "editors delete" on public.circuits for delete to authenticated
  using (private.is_editor());
