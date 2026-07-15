-- The enrollments_public_insert policy checks that the referenced student is
-- a guest (profile_id/company_id null) via a subquery on public.students.
-- That subquery runs as the `anon` role and is itself subject to RLS, but
-- anon has no SELECT policy on students (intentionally, to avoid exposing
-- other guests' personal data) so the exists() always evaluated to false.
-- Fix it the same way public.owns_company()/public.is_admin() do: a
-- security definer helper that bypasses RLS for just this existence check.

create or replace function public.is_guest_student(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.students s
    where s.id = target_student_id and s.profile_id is null and s.company_id is null
  );
$$;

drop policy if exists enrollments_public_insert on public.enrollments;

create policy enrollments_public_insert on public.enrollments for insert to anon
  with check (
    status = 'pending'
    and company_id is null
    and privacy_accepted_at is not null
    and privacy_accepted_at <= now()
    and payment_status = 'paid'
    and paid_at is not null
    and public.is_guest_student(enrollments.student_id)
    and exists (
      select 1 from public.course_sessions cs
      where cs.id = enrollments.course_session_id and cs.status = 'open'
    )
  );
