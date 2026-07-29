create or replace function public.complete_attendance_session(
  p_session_id uuid,
  p_absent_student_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.sessions
    where id = p_session_id and user_id = auth.uid()
  ) then
    raise exception 'Session not found or access denied';
  end if;

  delete from public.attendance_records
  where session_id = p_session_id;

  insert into public.attendance_records (session_id, student_id, status)
  select p_session_id, student_id, 'absent'
  from unnest(coalesce(p_absent_student_ids, array[]::uuid[])) as student_id;

  update public.sessions
  set completed = true, completed_at = now()
  where id = p_session_id and user_id = auth.uid();
end;
$$;
