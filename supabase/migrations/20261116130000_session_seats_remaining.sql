-- Free seats per public session, so the site can show "Últimas plazas" / "Completo" from real
-- enrolments. Visitors can't read public.enrollments (RLS, it holds personal data), so this
-- security definer function exposes only the aggregate: capacity minus non-cancelled enrolments.

create or replace function public.session_seats_remaining()
returns table (course_session_id uuid, seats_remaining integer)
language sql
stable
security definer
set search_path = ''
as $$
  select cs.id, greatest(cs.capacity - count(e.id)::integer, 0)
  from public.course_sessions cs
  left join public.enrollments e
    on e.course_session_id = cs.id and e.status <> 'cancelled'
  where cs.status in ('open', 'full')
    and cs.capacity is not null
    and cs.ends_at >= now()
  group by cs.id, cs.capacity
$$;

revoke all on function public.session_seats_remaining() from public;
grant execute on function public.session_seats_remaining() to anon, authenticated;
