-- Moodboard items for the Theme page, and tuning notes on the vehicle row.

create table if not exists public.moodboard_items (
  id uuid primary key default gen_random_uuid(),
  caption text,
  path text,
  sort int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.moodboard_items enable row level security;
create policy "public read published" on public.moodboard_items for select
  using (status = 'published' or private.is_editor());
create policy "editors insert drafts" on public.moodboard_items for insert to authenticated
  with check (private.is_editor() and (status = 'draft' or private.is_owner()));
create policy "editors update drafts" on public.moodboard_items for update to authenticated
  using (private.is_editor()) with check (private.is_editor() and (status = 'draft' or private.is_owner()));
create policy "editors delete" on public.moodboard_items for delete to authenticated
  using (private.is_editor());

alter table public.vehicle
  add column if not exists tuning_eq text,
  add column if not exists tuning_listening text,
  add column if not exists tuning_measurement text;

-- Keep crossover rows in the order the editor sets.
alter table public.tuning add column if not exists sort int not null default 0;
