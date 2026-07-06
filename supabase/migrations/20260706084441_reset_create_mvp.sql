-- Destructive reset explicitly approved by the project owner on 2026-07-06.
-- Internal Supabase schemas, auth.users, extensions, buckets and stored objects are preserved.

drop policy if exists admin_storage_delete on storage.objects;
drop policy if exists admin_storage_insert on storage.objects;
drop policy if exists admin_storage_update on storage.objects;
drop policy if exists authorized_certificate_read on storage.objects;
drop policy if exists public_media_read on storage.objects;

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_updated on auth.users;

drop table if exists
  public.blog_post_categories,
  public.certificates,
  public.invoices,
  public.payments,
  public.session_trainers,
  public.session_schedules,
  public.enrollments,
  public.contact_requests,
  public.faqs,
  public.testimonials,
  public.blog_posts,
  public.blog_categories,
  public.media_assets,
  public.seo_metadata,
  public.site_settings,
  public.course_sessions,
  public.course_modules,
  public.courses,
  public.course_categories,
  public.venues,
  public.locations,
  public.student_private_data,
  public.students,
  public.trainers,
  public.company_members,
  public.companies,
  public.profile_roles,
  public.roles,
  public.profiles,
  public.cursos
cascade;

drop function if exists public.actualizar_updated_at_cursos();
drop function if exists public.can_access_enrollment(uuid);
drop function if exists public.can_access_student(uuid);
drop function if exists public.can_access_student_private(uuid);
drop function if exists public.handle_auth_user_created();
drop function if exists public.handle_auth_user_updated();
drop function if exists public.has_role(public.app_role);
drop function if exists public.is_company_manager(uuid);
drop function if exists public.is_company_member(uuid);
drop function if exists public.is_session_trainer(uuid);
drop function if exists public.normalize_identity_document(text);
drop function if exists public.prepare_enrollment();
drop function if exists public.protect_self_service_fields();
drop function if exists public.set_updated_at();
drop function if exists public.verify_certificate(uuid, text);

drop type if exists public.certificate_status;
drop type if exists public.contact_request_type;
drop type if exists public.course_audience;
drop type if exists public.course_modality;
drop type if exists public.identity_document_type;
drop type if exists public.invoice_status;
drop type if exists public.media_kind;
drop type if exists public.payment_provider;
drop type if exists public.payment_status;
drop type if exists public.record_status;
drop type if exists public.request_status;
drop type if exists public.schedule_block_type;
drop type if exists public.session_kind;
drop type if exists public.app_role;
drop type if exists public.enrollment_status;
drop type if exists public.session_status;

create type public.app_role as enum ('admin', 'student', 'company');
create type public.course_status as enum ('draft', 'published', 'archived');
create type public.session_status as enum ('draft', 'open', 'full', 'completed', 'cancelled');
create type public.enrollment_status as enum ('pending', 'confirmed', 'cancelled', 'completed');
create type public.contact_request_status as enum ('new', 'in_progress', 'resolved', 'spam');
create type public.blog_post_status as enum ('draft', 'published', 'archived');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'student',
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.course_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.course_categories(id) on delete restrict,
  title text not null,
  slug text not null unique,
  excerpt text,
  description text,
  modality text not null default 'presential' check (modality in ('presential', 'online', 'hybrid')),
  duration_hours numeric(6,2) check (duration_hours is null or duration_hours > 0),
  image_url text,
  is_featured boolean not null default false,
  status public.course_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index courses_category_id_idx on public.courses(category_id);
create index courses_catalog_idx on public.courses(status, is_featured, title);

create table public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  content text,
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, position)
);

create index course_modules_course_id_idx on public.course_modules(course_id);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  city text not null,
  province text not null,
  country_code char(2) not null default 'ES',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index locations_province_city_idx on public.locations(province, city);

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete restrict,
  name text not null,
  slug text not null unique,
  address text not null,
  postal_code text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index venues_location_id_idx on public.venues(location_id);

create table public.course_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete restrict,
  venue_id uuid references public.venues(id) on delete restrict,
  code text not null unique,
  slug text not null unique,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity integer not null check (capacity > 0),
  price_cents integer not null default 0 check (price_cents >= 0),
  status public.session_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_sessions_dates_valid check (ends_at > starts_at)
);

create index course_sessions_course_date_idx on public.course_sessions(course_id, starts_at);
create index course_sessions_public_idx on public.course_sessions(status, starts_at);
create index course_sessions_venue_id_idx on public.course_sessions(venue_id);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid references public.profiles(id) on delete set null,
  legal_name text not null,
  trade_name text,
  slug text not null unique,
  tax_id text unique,
  email text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index companies_owner_profile_id_idx on public.companies(owner_profile_id);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  identity_document text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index students_company_id_idx on public.students(company_id);
create index students_email_idx on public.students(email);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  course_session_id uuid not null references public.course_sessions(id) on delete restrict,
  student_id uuid not null references public.students(id) on delete restrict,
  company_id uuid references public.companies(id) on delete set null,
  status public.enrollment_status not null default 'pending',
  privacy_accepted_at timestamptz not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_session_id, student_id)
);

create index enrollments_student_id_idx on public.enrollments(student_id, created_at desc);
create index enrollments_company_id_idx on public.enrollments(company_id, created_at desc);
create index enrollments_session_status_idx on public.enrollments(course_session_id, status);

create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  company_name text,
  subject text,
  message text not null,
  status public.contact_request_status not null default 'new',
  privacy_accepted_at timestamptz not null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contact_requests_status_created_idx on public.contact_requests(status, created_at desc);
create index contact_requests_email_idx on public.contact_requests(email);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  question text not null,
  answer text not null,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index faqs_public_idx on public.faqs(is_published, sort_order);
create index faqs_course_id_idx on public.faqs(course_id);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete set null,
  author_name text not null,
  author_role text,
  content text not null,
  rating smallint check (rating between 1 and 5),
  sort_order integer not null default 0 check (sort_order >= 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index testimonials_public_idx on public.testimonials(is_published, sort_order);

create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.blog_categories(id) on delete set null,
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  image_url text,
  status public.blog_post_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blog_posts_public_idx on public.blog_posts(status, published_at desc);
create index blog_posts_category_id_idx on public.blog_posts(category_id);

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'profiles', 'course_categories', 'courses', 'course_modules', 'locations', 'venues',
    'course_sessions', 'companies', 'students', 'enrollments', 'contact_requests',
    'faqs', 'testimonials', 'blog_categories', 'blog_posts', 'site_settings'
  ]
  loop
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      target_table,
      target_table
    );
  end loop;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin' and p.is_active
  );
$$;

create or replace function public.owns_company(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.companies c
    where c.id = target_company_id and c.owner_profile_id = auth.uid() and c.is_active
  );
$$;

create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_student_id uuid;
  given_name text;
  family_name text;
begin
  given_name := coalesce(new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1));
  family_name := coalesce(new.raw_user_meta_data ->> 'last_name', '');

  insert into public.profiles (id, first_name, last_name)
  values (new.id, given_name, family_name)
  on conflict (id) do nothing;

  insert into public.students (profile_id, first_name, last_name, email)
  values (new.id, given_name, family_name, new.email)
  on conflict (profile_id) do nothing
  returning id into created_student_id;

  return new;
end;
$$;

create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() = 'authenticated' and not public.is_admin() then
    new.id := old.id;
    new.role := old.role;
    new.is_active := old.is_active;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

create trigger protect_profile_privileged_fields
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_fields();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_auth_user_created();

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'profiles', 'course_categories', 'courses', 'course_modules', 'locations', 'venues',
    'course_sessions', 'companies', 'students', 'enrollments', 'contact_requests',
    'faqs', 'testimonials', 'blog_categories', 'blog_posts', 'site_settings'
  ]
  loop
    execute format('alter table public.%I enable row level security', target_table);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      target_table || '_admin_all',
      target_table
    );
  end loop;
end;
$$;

create policy profiles_own_select on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_own_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy course_categories_public_select on public.course_categories for select to anon, authenticated using (is_active);
create policy courses_public_select on public.courses for select to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= now());
create policy course_modules_public_select on public.course_modules for select to anon, authenticated
  using (exists (
    select 1 from public.courses c
    where c.id = course_modules.course_id and c.status = 'published' and c.published_at is not null and c.published_at <= now()
  ));
create policy locations_public_select on public.locations for select to anon, authenticated using (is_active);
create policy venues_public_select on public.venues for select to anon, authenticated using (is_active);
create policy course_sessions_public_select on public.course_sessions for select to anon, authenticated
  using (
    status in ('open', 'full', 'completed')
    and published_at is not null
    and published_at <= now()
    and exists (select 1 from public.courses c where c.id = course_sessions.course_id and c.status = 'published')
  );

create policy companies_owner_select on public.companies for select to authenticated using (owner_profile_id = auth.uid());
create policy companies_owner_insert on public.companies for insert to authenticated
  with check (owner_profile_id = auth.uid() and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'company' and p.is_active
  ));
create policy companies_owner_update on public.companies for update to authenticated
  using (owner_profile_id = auth.uid()) with check (owner_profile_id = auth.uid());

create policy students_own_select on public.students for select to authenticated using (profile_id = auth.uid());
create policy students_own_update on public.students for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy students_company_select on public.students for select to authenticated
  using (company_id is not null and public.owns_company(company_id));
create policy students_company_insert on public.students for insert to authenticated
  with check (profile_id is null and company_id is not null and public.owns_company(company_id));
create policy students_company_update on public.students for update to authenticated
  using (company_id is not null and public.owns_company(company_id))
  with check (company_id is not null and public.owns_company(company_id));

create policy enrollments_own_select on public.enrollments for select to authenticated
  using (exists (select 1 from public.students s where s.id = enrollments.student_id and s.profile_id = auth.uid()));
create policy enrollments_own_insert on public.enrollments for insert to authenticated
  with check (
    status = 'pending'
    and company_id is null
    and exists (select 1 from public.students s where s.id = enrollments.student_id and s.profile_id = auth.uid())
    and exists (select 1 from public.course_sessions cs where cs.id = course_session_id and cs.status = 'open')
  );
create policy enrollments_company_select on public.enrollments for select to authenticated
  using (company_id is not null and public.owns_company(company_id));
create policy enrollments_company_insert on public.enrollments for insert to authenticated
  with check (
    status = 'pending'
    and company_id is not null
    and public.owns_company(company_id)
    and exists (select 1 from public.students s where s.id = enrollments.student_id and s.company_id = enrollments.company_id)
    and exists (select 1 from public.course_sessions cs where cs.id = course_session_id and cs.status = 'open')
  );

create policy contact_requests_public_insert on public.contact_requests for insert to anon, authenticated
  with check (status = 'new' and resolved_at is null and privacy_accepted_at <= now());
create policy faqs_public_select on public.faqs for select to anon, authenticated using (is_published);
create policy testimonials_public_select on public.testimonials for select to anon, authenticated using (is_published);
create policy blog_categories_public_select on public.blog_categories for select to anon, authenticated using (is_active);
create policy blog_posts_public_select on public.blog_posts for select to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= now());
create policy site_settings_public_select on public.site_settings for select to anon, authenticated using (is_public);

grant usage on schema public to anon, authenticated;
grant select on public.course_categories, public.courses, public.course_modules, public.locations,
  public.venues, public.course_sessions, public.faqs, public.testimonials, public.blog_categories,
  public.blog_posts, public.site_settings to anon, authenticated;
grant insert on public.contact_requests to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.course_categories, public.courses,
  public.course_modules, public.locations, public.venues, public.course_sessions, public.companies,
  public.students, public.enrollments, public.contact_requests, public.faqs, public.testimonials,
  public.blog_categories, public.blog_posts, public.site_settings to authenticated;

revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_auth_user_created() from public, anon, authenticated;
revoke execute on function public.protect_profile_privileged_fields() from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.owns_company(uuid) from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.owns_company(uuid) to authenticated;

