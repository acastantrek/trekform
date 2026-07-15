-- privacy_accepted_at/paid_at are generated client-side (new Date().toISOString())
-- and checked against the database's now() at insert time. Any clock skew
-- between the visitor's browser and the Postgres server (even a few hundred
-- ms) makes the "<= now()" check fail intermittently. Drop that strict
-- comparison and keep only the "must be set" requirement.

drop policy if exists enrollments_public_insert on public.enrollments;

create policy enrollments_public_insert on public.enrollments for insert to anon
  with check (
    status = 'pending'
    and company_id is null
    and privacy_accepted_at is not null
    and payment_status = 'paid'
    and paid_at is not null
    and public.is_guest_student(enrollments.student_id)
    and exists (
      select 1 from public.course_sessions cs
      where cs.id = enrollments.course_session_id and cs.status = 'open'
    )
  );
