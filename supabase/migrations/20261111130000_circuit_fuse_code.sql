-- Fuse code of a circuit as labelled on the distribution block, e.g. "A7" (block A, 7th fuse).
alter table public.circuits add column if not exists fuse_code text;
