-- Keep the RLS helper functions out of the exposed API schema (no /rest/v1/rpc access).
-- Policies reference the functions by OID, so they keep working after the move.
create schema if not exists private;
grant usage on schema private to anon, authenticated;
alter function public.is_editor() set schema private;
alter function public.is_owner() set schema private;
revoke execute on function private.is_editor() from public;
revoke execute on function private.is_owner() from public;
grant execute on function private.is_editor() to anon, authenticated;
grant execute on function private.is_owner() to anon, authenticated;
