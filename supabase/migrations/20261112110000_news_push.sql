-- News about the car (public page /news, editor › News) and web push notifications.

-- 1. News posts: same draft/publish rules as the other content tables.
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  body text not null default '',
  photo_path text,
  url text,
  published_at timestamptz not null default now(),
  notified_at timestamptz,
  sort int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.news enable row level security;
create policy "public read published" on public.news for select
  using (status = 'published' or private.is_editor());
create policy "editors insert drafts" on public.news for insert to authenticated
  with check (private.is_editor() and (status = 'draft' or private.is_owner()));
create policy "editors update drafts" on public.news for update to authenticated
  using (private.is_editor()) with check (private.is_editor() and (status = 'draft' or private.is_owner()));
create policy "editors delete" on public.news for delete to authenticated
  using (private.is_editor());

-- 2. Browsers that asked for notifications. Nobody reads this table through the API:
--    visitors add / remove their own subscription through the two functions below,
--    and the send-news-push Edge Function reads it with the service role.
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from anon, authenticated;

create or replace function public.push_subscribe(p_endpoint text, p_p256dh text, p_auth text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_endpoint is null or p_endpoint !~ '^https://' or length(p_endpoint) > 1000
     or coalesce(length(p_p256dh), 0) not between 40 and 200
     or coalesce(length(p_auth), 0) not between 10 and 100 then
    raise exception 'invalid subscription';
  end if;
  insert into public.push_subscriptions (endpoint, p256dh, auth)
  values (p_endpoint, p_p256dh, p_auth)
  on conflict (endpoint) do update set p256dh = excluded.p256dh, auth = excluded.auth;
end;
$$;

create or replace function public.push_unsubscribe(p_endpoint text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.push_subscriptions where endpoint = p_endpoint;
$$;

-- How many browsers are subscribed (editors only; shown in editor › News).
create or replace function public.push_subscriber_count()
returns integer
language sql
security definer
set search_path = ''
as $$
  select case when private.is_editor() then (select count(*)::int from public.push_subscriptions) else null end;
$$;

revoke execute on function public.push_subscribe(text, text, text) from public;
revoke execute on function public.push_unsubscribe(text) from public;
revoke execute on function public.push_subscriber_count() from public, anon;
grant execute on function public.push_subscribe(text, text, text) to anon, authenticated;
grant execute on function public.push_unsubscribe(text) to anon, authenticated;
grant execute on function public.push_subscriber_count() to authenticated;

-- 3. VAPID keys for web push. The send-news-push Edge Function generates the pair on
--    first use and stores it here; the private key never leaves the database / function.
create table if not exists private.push_config (
  id int primary key default 1 check (id = 1),
  vapid_public text not null,
  vapid_private_jwk jsonb not null
);
revoke all on private.push_config from public, anon, authenticated;

-- Public key for browsers (null until the function has generated the pair).
create or replace function public.push_vapid_public()
returns text
language sql
security definer
set search_path = ''
as $$ select vapid_public from private.push_config where id = 1; $$;

-- Both keys, for the Edge Function only.
create or replace function public.push_vapid_keys()
returns table (vapid_public text, vapid_private_jwk jsonb)
language sql
security definer
set search_path = ''
as $$ select vapid_public, vapid_private_jwk from private.push_config where id = 1; $$;

-- Store a freshly generated pair unless one exists; returns the stored pair.
create or replace function public.push_vapid_init(p_public text, p_private_jwk jsonb)
returns table (vapid_public text, vapid_private_jwk jsonb)
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into private.push_config (id, vapid_public, vapid_private_jwk)
  values (1, p_public, p_private_jwk)
  on conflict (id) do nothing;
  return query select c.vapid_public, c.vapid_private_jwk from private.push_config c where c.id = 1;
end;
$$;

revoke execute on function public.push_vapid_public() from public;
revoke execute on function public.push_vapid_keys() from public, anon, authenticated;
revoke execute on function public.push_vapid_init(text, jsonb) from public, anon, authenticated;
grant execute on function public.push_vapid_public() to anon, authenticated;
grant execute on function public.push_vapid_keys() to service_role;
grant execute on function public.push_vapid_init(text, jsonb) to service_role;
