-- Adds a generic program (course_modules) and one upcoming convocatoria (course_sessions)
-- to every published course that doesn't have any yet. Only 4 of 54 published courses had
-- real modules/sessions (the original MVP seed); this brings the rest up to parity so
-- "Programa formativo" and "Próximas convocatorias" render on every course detail page.
-- Idempotent: skips courses that already have modules/sessions, safe to re-run.

insert into public.course_modules (course_id, title, content, description, duration_minutes, position, sort_order)
select
  c.id,
  m.title,
  m.content,
  m.content,
  m.duration_minutes,
  m.position,
  m.position
from public.courses c
cross join lateral (
  values
    ('Fundamentos y normativa', 'Conceptos esenciales, responsabilidades y normativa aplicable.', 120, 1),
    ('Prevención y operación segura', 'Identificación de riesgos y procedimientos de trabajo seguro.', 120, 2),
    ('Prácticas y evaluación', 'Aplicación práctica de los conocimientos y evaluación final.', 240, 3)
) as m(title, content, duration_minutes, position)
where c.status = 'published'
  and not exists (
    select 1 from public.course_modules cm where cm.course_id = c.id
  )
on conflict (course_id, position) do nothing;

with target_courses as (
  select
    c.id,
    c.slug,
    c.modality,
    row_number() over (order by c.slug) - 1 as rn
  from public.courses c
  where c.status = 'published'
    and not exists (
      select 1 from public.course_sessions cs where cs.course_id = c.id
    )
),
venue_list as (
  select v.id, row_number() over (order by v.slug) - 1 as vrn
  from public.venues v
  where v.is_active
),
venue_count as (
  select count(*) as n from venue_list
),
session_dates as (
  select
    tc.*,
    ('2026-07-27'::date + (tc.rn * 3)) as session_date
  from target_courses tc
)
insert into public.course_sessions (
  course_id, venue_id, code, slug, starts_at, ends_at, capacity, price_cents, status, published_at
)
select
  sd.id,
  case when sd.modality = 'online' then null else vl.id end,
  'EXP-' || lpad(sd.rn::text, 4, '0'),
  sd.slug || '-' || to_char(sd.session_date, 'yyyy-mm-dd'),
  (sd.session_date::text || ' 08:00:00+02')::timestamptz,
  (sd.session_date::text || ' 16:00:00+02')::timestamptz,
  case when sd.modality = 'online' then 25 else 12 end,
  case when sd.modality = 'online' then 6900 else 14900 end,
  'open',
  now()
from session_dates sd
join venue_count vc on true
join venue_list vl on vl.vrn = sd.rn % vc.n
on conflict (code) do nothing;
