-- Placement of the History headline and story: {story, align, valign, gap, width, margin}.
alter table public.vehicle add column if not exists history_layout jsonb;
