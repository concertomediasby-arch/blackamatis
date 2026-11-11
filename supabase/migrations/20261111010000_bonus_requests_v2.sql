-- Bonus requests now cover the whole car (glass, lights, rims, body, interior, trunk).
alter table public.bonus_requests
  add column if not exists code text,
  add column if not exists "group" text,
  add column if not exists strength text check (strength in ('strong','medium','weak','unlikely')),
  add column if not exists submit boolean not null default false,
  add column if not exists sort int;

-- Element is no longer a single letter: allow combinations ("B/D"), "Overall design" or "—".
alter table public.bonus_requests drop constraint if exists bonus_requests_element_check;
alter table public.bonus_requests alter column element drop not null;

alter table public.bonus_requests drop constraint if exists bonus_requests_group_check;
alter table public.bonus_requests add constraint bonus_requests_group_check
  check ("group" is null or "group" in ('glass','lights','rims','body','interior','trunk','new'));

-- `strength` is editor-only: anonymous visitors cannot read that column.
revoke select on public.bonus_requests from anon;
grant select (id, no, code, "group", title, element, description, photo_path, submit, idea, execution, sort, status, updated_at)
  on public.bonus_requests to anon;
