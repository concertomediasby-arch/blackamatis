-- Parts on the cable diagram each circuit runs through (fuse holder, distribution,
-- ground block, main fuse, ultracap, VSS, ...): [{id, label, run, x, y, w, h}] in %
-- of the image. They light up with the clicked device and are clickable too.
alter table public.circuits add column if not exists parts jsonb not null default '[]'::jsonb;
