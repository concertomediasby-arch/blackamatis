-- The editor fills empty text columns with "" when it loads content, so a request
-- without a strength came back as "" and failed bonus_requests_strength_check on save.
-- Store a blank strength as NULL (no strength), before the check runs.
create or replace function public.bonus_strength_blank_to_null()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.strength is not null and btrim(new.strength) = '' then
    new.strength := null;
  end if;
  return new;
end;
$$;

drop trigger if exists bonus_strength_blank_to_null on public.bonus_requests;
create trigger bonus_strength_blank_to_null
  before insert or update on public.bonus_requests
  for each row execute function public.bonus_strength_blank_to_null();
