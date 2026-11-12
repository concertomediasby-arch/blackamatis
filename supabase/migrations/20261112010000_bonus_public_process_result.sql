-- The public Bonus page reads each request's Process and Result media.
-- bonus_requests uses column-level grants for anon (strength stays editor-only),
-- so new public columns must be granted explicitly.
grant select (process, result) on public.bonus_requests to anon;
