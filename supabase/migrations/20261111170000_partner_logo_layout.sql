-- Position & size of each partner logo inside its box: {"x": -50..50, "y": -50..50, "scale": 50..200} (percent).
alter table public.partners add column if not exists logo_layout jsonb;
