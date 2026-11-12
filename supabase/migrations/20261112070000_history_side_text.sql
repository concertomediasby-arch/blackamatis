-- Optional text on the left of the History slider (editor › Vehicle & Story).
alter table public.vehicle add column if not exists history_side_text text not null default '';
