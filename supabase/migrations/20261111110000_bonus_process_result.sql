-- Process and result media per bonus request (shown under Idea · Process · Result).
-- Each: [{"id": "...", "kind": "photo" | "video", "path": "...", "url": "...", "caption": "..."}].
-- The idea text is the existing `description` column.
alter table public.bonus_requests
  add column if not exists process jsonb default '[]'::jsonb,
  add column if not exists result jsonb default '[]'::jsonb;
