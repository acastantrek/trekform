-- Add payment tracking to enrollments and allow anonymous visitors to record
-- a simulated payment when they submit the public enrollment modal. There is
-- no real payment gateway wired up yet: the frontend marks payment_status as
-- 'paid' directly. When a real provider (Stripe/Redsys...) is integrated,
-- replace the anon insert policies below with a service-role Edge Function
-- that verifies the payment before writing.

create type public.enrollment_payment_status as enum ('pending', 'paid', 'refunded');

alter table public.enrollments
  add column payment_status public.enrollment_payment_status not null default 'pending',
  add column paid_at timestamptz,
  add column amount_paid_cents integer,
  add column payment_reference text;

create policy students_public_insert on public.students for insert to anon
  with check (profile_id is null and company_id is null);

create policy enrollments_public_insert on public.enrollments for insert to anon
  with check (
    status = 'pending'
    and company_id is null
    and privacy_accepted_at is not null
    and privacy_accepted_at <= now()
    and payment_status = 'paid'
    and paid_at is not null
    and exists (
      select 1 from public.students s
      where s.id = enrollments.student_id and s.profile_id is null and s.company_id is null
    )
    and exists (
      select 1 from public.course_sessions cs
      where cs.id = enrollments.course_session_id and cs.status = 'open'
    )
  );
