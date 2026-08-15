create or replace function public.keep_alive()
returns timestamptz
language sql
stable
security invoker
set search_path = ''
as $$
  select now();
$$;

revoke all on function public.keep_alive() from public, anon, authenticated, service_role;
grant execute on function public.keep_alive() to anon;
