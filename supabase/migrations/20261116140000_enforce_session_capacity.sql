-- Enforce session capacity in the database, not only in the web UI: an enrolment can't be
-- created (or moved/reactivated into a session) once the session has no free seats left.
--
-- A trigger rather than an extra RLS condition because:
--   * it covers every insert path at once (enrollments_public_insert for guests,
--     enrollments_own_insert for students, enrollments_company_insert for companies);
--   * it locks the session row while counting, so two people can't both take the last seat
--     at the same moment (an RLS check alone would let concurrent inserts overbook).
--
-- Seats are counted like public.session_seats_remaining(): non-cancelled enrolments against
-- course_sessions.capacity (no limit when capacity is null). Admins (the panel) and direct
-- database/service connections are exempt, so the team can still overbook deliberately.

create or replace function public.enforce_session_capacity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  session_capacity integer;
  taken integer;
begin
  -- Only requests made through the API as a visitor or a signed-in non-admin are limited.
  if coalesce(auth.role(), '') not in ('anon', 'authenticated') or public.is_admin() then
    return new;
  end if;

  -- Cancelled enrolments don't use a seat.
  if new.status = 'cancelled' then
    return new;
  end if;

  -- On update, only re-check when the enrolment starts using a seat it didn't use before.
  if tg_op = 'UPDATE'
    and new.course_session_id = old.course_session_id
    and old.status <> 'cancelled' then
    return new;
  end if;

  -- Lock the session so concurrent enrolments for it are counted one after the other.
  select cs.capacity into session_capacity
  from public.course_sessions cs
  where cs.id = new.course_session_id
  for update;

  if session_capacity is null then
    return new;
  end if;

  select count(*) into taken
  from public.enrollments e
  where e.course_session_id = new.course_session_id
    and e.status <> 'cancelled'
    and e.id <> new.id;

  if taken >= session_capacity then
    raise exception 'SESSION_FULL'
      using errcode = 'P0001',
            detail = 'La convocatoria no tiene plazas libres.',
            hint = 'Elige otra convocatoria.';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_session_capacity() from public;

drop trigger if exists enforce_session_capacity on public.enrollments;
create trigger enforce_session_capacity
  before insert or update of course_session_id, status on public.enrollments
  for each row execute function public.enforce_session_capacity();
