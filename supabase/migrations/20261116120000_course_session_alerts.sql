-- "Avísame cuando haya convocatorias": visitors who find no open session for a course leave
-- their details so the team can contact them once one is scheduled. Notification is manual
-- for now (the admin panel lists pending alerts and marks them as notified).
--
-- Follows the live conventions (verified against the database, not the older migrations):
-- public.is_admin() for admin access, public.set_updated_at() for updated_at, and a 5-minute
-- tolerance on privacy_accepted_at for visitors whose clock runs slightly ahead.

create table public.course_session_alerts (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  -- Optional: null means "any province".
  province text check (province is null or char_length(province) between 2 and 60),
  name text not null check (char_length(btrim(name)) between 2 and 120),
  email extensions.citext not null
    check (char_length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (phone is null or char_length(phone) <= 30),
  status text not null default 'pending' check (status in ('pending', 'notified', 'cancelled')),
  privacy_accepted_at timestamptz not null,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.course_session_alerts is
  'Visitors asking to be told when a course (optionally in a given province) gets an open session.';

-- One pending alert per person, course and province: a repeated sign-up is a no-op.
create unique index course_session_alerts_pending_unique
  on public.course_session_alerts (course_id, email, coalesce(province, ''))
  where status = 'pending';
create index course_session_alerts_status_created_idx
  on public.course_session_alerts (status, created_at desc);
create index course_session_alerts_course_idx on public.course_session_alerts (course_id);

create trigger set_course_session_alerts_updated_at
  before update on public.course_session_alerts
  for each row execute function public.set_updated_at();

alter table public.course_session_alerts enable row level security;

-- Anyone may sign up (no account needed), only as a fresh pending alert for a published course.
-- There is deliberately no public select policy: visitors can't read other people's alerts.
create policy course_session_alerts_public_insert on public.course_session_alerts
  for insert to anon, authenticated
  with check (
    status = 'pending'
    and notified_at is null
    and privacy_accepted_at <= now() + interval '5 minutes'
    and exists (
      select 1 from public.courses c
      where c.id = course_session_alerts.course_id and c.status = 'published'
    )
  );

create policy course_session_alerts_admin_all on public.course_session_alerts
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
