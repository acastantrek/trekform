begin;

-- Align legacy public.courses with the editorial fields expected by the frontend.
alter table public.courses
  add column if not exists short_title text,
  add column if not exists objectives text,
  add column if not exists audience_description text,
  add column if not exists audience text,
  add column if not exists methodology text,
  add column if not exists duration_minutes integer,
  add column if not exists featured_image_url text,
  add column if not exists brochure_url text,
  add column if not exists certification_name text,
  add column if not exists is_official_certification boolean not null default false,
  add column if not exists is_fundae_eligible boolean not null default false,
  add column if not exists sort_order integer not null default 0;

-- Backfill new course fields from legacy columns when possible.
update public.courses
set
  short_title = coalesce(short_title, title),
  audience = coalesce(audience, 'both'),
  duration_minutes = coalesce(duration_minutes, duration_hours * 60),
  featured_image_url = coalesce(featured_image_url, image_url),
  certification_name = coalesce(certification_name, 'Diploma acreditativo Trekform'),
  methodology = coalesce(methodology, 'Teórico-práctica')
where
  short_title is null
  or audience is null
  or duration_minutes is null
  or featured_image_url is null
  or certification_name is null
  or methodology is null;

-- Add a lightweight audience constraint only after backfill.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'courses_audience_check'
      and conrelid = 'public.courses'::regclass
  ) then
    alter table public.courses
      add constraint courses_audience_check
      check (audience in ('individuals', 'companies', 'both'));
  end if;
end
$$;

-- Align legacy public.course_modules with the newer shape expected by the frontend.
alter table public.course_modules
  add column if not exists description text,
  add column if not exists sort_order integer not null default 0;

update public.course_modules
set
  description = coalesce(description, content),
  sort_order = case
    when sort_order = 0 and position is not null then position
    else sort_order
  end
where
  description is null
  or (sort_order = 0 and position is not null);

create index if not exists courses_sort_order_idx
  on public.courses(status, is_featured, sort_order);

create index if not exists course_modules_course_sort_idx
  on public.course_modules(course_id, sort_order);

commit;
