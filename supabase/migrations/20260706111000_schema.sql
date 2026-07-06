/* Historical full-backend migration superseded by reset_create_mvp.
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  key public.app_role not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.roles (key, name, description) values
  ('admin', 'Administrador', 'Acceso completo de administración'),
  ('student', 'Alumno', 'Acceso a matrículas y certificados propios'),
  ('company', 'Empresa', 'Gestión de empresa y trabajadores'),
  ('trainer', 'Formador', 'Gestión de convocatorias asignadas')
on conflict (key) do update set name = excluded.name, description = excluded.description;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email extensions.citext,
  first_name text,
  last_name text,
  display_name text,
  phone text,
  avatar_url text,
  locale text not null default 'es-ES',
  marketing_consent boolean not null default false,
  is_active boolean not null default true,
  last_sign_in_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index profiles_email_unique on public.profiles (email) where email is not null;

create table public.profile_roles (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  granted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (profile_id, role_id)
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  legal_name text not null,
  trade_name text,
  tax_id text unique,
  email extensions.citext,
  phone text,
  website text,
  address_line1 text,
  address_line2 text,
  postal_code text,
  city text,
  province text,
  country_code char(2) not null default 'ES',
  fundae_enabled boolean not null default false,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.company_members (
  company_id uuid not null references public.companies(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  is_manager boolean not null default false,
  job_title text,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (company_id, profile_id)
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  student_number text not null unique default ('STU-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
  first_name text not null,
  last_name text not null,
  email extensions.citext,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index students_company_id_idx on public.students(company_id);
create index students_email_idx on public.students(email);

create table public.student_private_data (
  student_id uuid primary key references public.students(id) on delete cascade,
  identity_document_type public.identity_document_type,
  identity_document text,
  birth_date date,
  address_line1 text,
  address_line2 text,
  postal_code text,
  city text,
  province text,
  country_code char(2) not null default 'ES',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint student_private_data_identity_pair check (
    (identity_document_type is null and identity_document is null)
    or (identity_document_type is not null and identity_document is not null)
  )
);

create unique index student_private_data_identity_document_unique
  on public.student_private_data (public.normalize_identity_document(identity_document))
  where identity_document is not null;

create table public.trainers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  bio text,
  specialties text[] not null default '{}',
  certifications text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.course_categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.course_categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  image_url text,
  sort_order integer not null default 0,
  status public.record_status not null default 'draft',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index course_categories_parent_id_idx on public.course_categories(parent_id);
create index course_categories_status_sort_idx on public.course_categories(status, sort_order);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.course_categories(id) on delete restrict,
  title text not null,
  slug text not null unique,
  short_title text,
  excerpt text,
  description text,
  objectives text,
  audience_description text,
  audience public.course_audience not null default 'both',
  modality public.course_modality not null default 'presential',
  methodology text,
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  featured_image_url text,
  brochure_url text,
  certification_name text,
  is_official_certification boolean not null default false,
  is_fundae_eligible boolean not null default false,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  status public.record_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index courses_category_id_idx on public.courses(category_id);
create index courses_public_catalog_idx on public.courses(status, is_featured, sort_order);

create table public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (course_id, sort_order)
);

create index course_modules_course_id_idx on public.course_modules(course_id);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  city text not null,
  province text not null,
  autonomous_community text,
  postal_code text,
  country_code char(2) not null default 'ES',
  latitude numeric(9,6),
  longitude numeric(9,6),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index locations_province_city_idx on public.locations(province, city);

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete restrict,
  slug text not null unique,
  name text not null,
  address_line1 text not null,
  address_line2 text,
  postal_code text,
  contact_phone text,
  contact_email extensions.citext,
  directions text,
  accessibility_notes text,
  is_public boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index venues_location_id_idx on public.venues(location_id);

create table public.course_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete restrict,
  venue_id uuid references public.venues(id) on delete restrict,
  company_id uuid references public.companies(id) on delete restrict,
  code text not null unique,
  slug text not null unique,
  kind public.session_kind not null default 'open',
  modality public.course_modality not null,
  status public.session_status not null default 'draft',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  enrollment_opens_at timestamptz,
  enrollment_closes_at timestamptz,
  capacity integer check (capacity is null or capacity > 0),
  price_cents integer not null default 0 check (price_cents >= 0),
  currency char(3) not null default 'EUR',
  theory_minutes integer not null default 0 check (theory_minutes >= 0),
  practice_minutes integer not null default 0 check (practice_minutes >= 0),
  is_renewal_available boolean not null default false,
  is_fundae_eligible boolean not null default false,
  public_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint course_sessions_dates_valid check (ends_at > starts_at),
  constraint course_sessions_kind_company check (
    (kind = 'open' and company_id is null) or (kind = 'in_company' and company_id is not null)
  ),
  constraint course_sessions_modality_venue check (modality = 'online' or venue_id is not null)
);

create index course_sessions_catalog_idx on public.course_sessions(status, starts_at);
create index course_sessions_course_id_idx on public.course_sessions(course_id, starts_at);
create index course_sessions_venue_id_idx on public.course_sessions(venue_id);
create index course_sessions_company_id_idx on public.course_sessions(company_id);

create table public.session_schedules (
  id uuid primary key default gen_random_uuid(),
  course_session_id uuid not null references public.course_sessions(id) on delete cascade,
  block_type public.schedule_block_type not null default 'other',
  title text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint session_schedules_dates_valid check (ends_at > starts_at),
  unique (course_session_id, sort_order)
);

create index session_schedules_session_id_idx on public.session_schedules(course_session_id, starts_at);

create table public.session_trainers (
  course_session_id uuid not null references public.course_sessions(id) on delete cascade,
  trainer_id uuid not null references public.trainers(id) on delete restrict,
  is_lead boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (course_session_id, trainer_id)
);

create index session_trainers_trainer_id_idx on public.session_trainers(trainer_id);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  course_session_id uuid not null references public.course_sessions(id) on delete restrict,
  student_id uuid not null references public.students(id) on delete restrict,
  company_id uuid references public.companies(id) on delete restrict,
  enrolled_by uuid references public.profiles(id) on delete set null,
  enrollment_number text not null unique default ('ENR-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
  status public.enrollment_status not null default 'pending',
  payment_status public.payment_status not null default 'unpaid',
  is_renewal boolean not null default false,
  unit_price_cents integer not null default 0 check (unit_price_cents >= 0),
  currency char(3) not null default 'EUR',
  privacy_accepted_at timestamptz not null,
  marketing_consent boolean not null default false,
  attendance_percentage numeric(5,2) check (attendance_percentage between 0 and 100),
  completed_at timestamptz,
  cancellation_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (course_session_id, student_id)
);

create index enrollments_student_id_idx on public.enrollments(student_id, created_at desc);
create index enrollments_company_id_idx on public.enrollments(company_id, created_at desc);
create index enrollments_session_status_idx on public.enrollments(course_session_id, status);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete restrict,
  provider public.payment_provider not null,
  provider_payment_id text,
  provider_customer_id text,
  status public.payment_status not null default 'pending',
  amount_cents integer not null check (amount_cents >= 0),
  refunded_amount_cents integer not null default 0 check (refunded_amount_cents >= 0),
  currency char(3) not null default 'EUR',
  paid_at timestamptz,
  failure_code text,
  failure_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint payments_refund_valid check (refunded_amount_cents <= amount_cents)
);

create unique index payments_provider_payment_unique
  on public.payments(provider, provider_payment_id) where provider_payment_id is not null;
create index payments_enrollment_id_idx on public.payments(enrollment_id, created_at desc);
create index payments_status_idx on public.payments(status, created_at desc);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references public.payments(id) on delete restrict,
  enrollment_id uuid not null references public.enrollments(id) on delete restrict,
  company_id uuid references public.companies(id) on delete restrict,
  invoice_number text unique,
  status public.invoice_status not null default 'draft',
  billing_name text not null,
  billing_tax_id text,
  billing_address jsonb not null default '{}'::jsonb,
  subtotal_cents integer not null check (subtotal_cents >= 0),
  tax_cents integer not null default 0 check (tax_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  currency char(3) not null default 'EUR',
  issued_at timestamptz,
  due_at timestamptz,
  pdf_path text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint invoices_totals_valid check (total_cents = subtotal_cents + tax_cents)
);

create index invoices_enrollment_id_idx on public.invoices(enrollment_id);
create index invoices_company_id_idx on public.invoices(company_id, created_at desc);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null unique references public.enrollments(id) on delete restrict,
  certificate_number text not null unique,
  verification_token uuid not null unique default gen_random_uuid(),
  status public.certificate_status not null default 'draft',
  title text not null,
  issued_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  revocation_reason text,
  storage_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint certificates_expiry_valid check (expires_at is null or issued_at is null or expires_at > issued_at)
);

create index certificates_status_idx on public.certificates(status, issued_at desc);

create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  request_type public.contact_request_type not null default 'general',
  status public.request_status not null default 'new',
  course_id uuid references public.courses(id) on delete set null,
  course_session_id uuid references public.course_sessions(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  name text not null,
  company_name text,
  email extensions.citext not null,
  phone text,
  subject text,
  message text,
  privacy_accepted_at timestamptz not null,
  marketing_consent boolean not null default false,
  source_url text,
  assigned_to uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index contact_requests_status_created_idx on public.contact_requests(status, created_at desc);
create index contact_requests_email_idx on public.contact_requests(email);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  status public.record_status not null default 'draft',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index faqs_course_status_sort_idx on public.faqs(course_id, status, sort_order);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete set null,
  author_name text not null,
  author_role text,
  company_name text,
  content text not null,
  rating smallint check (rating between 1 and 5),
  avatar_url text,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  status public.record_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index testimonials_public_idx on public.testimonials(status, is_featured, sort_order);

create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  status public.record_status not null default 'draft',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  featured_image_url text,
  status public.record_status not null default 'draft',
  is_featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index blog_posts_public_idx on public.blog_posts(status, published_at desc);

create table public.blog_post_categories (
  blog_post_id uuid not null references public.blog_posts(id) on delete cascade,
  blog_category_id uuid not null references public.blog_categories(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (blog_post_id, blog_category_id)
);

create index blog_post_categories_category_idx on public.blog_post_categories(blog_category_id);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  uploaded_by uuid references public.profiles(id) on delete set null,
  bucket_id text not null,
  object_path text not null,
  kind public.media_kind not null,
  title text,
  alt_text text,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (bucket_id, object_path)
);

create index media_assets_kind_idx on public.media_assets(kind, created_at desc);

create table public.seo_metadata (
  id uuid primary key default gen_random_uuid(),
  route_path text not null unique,
  course_id uuid unique references public.courses(id) on delete cascade,
  blog_post_id uuid unique references public.blog_posts(id) on delete cascade,
  title text not null,
  description text,
  canonical_url text,
  robots text not null default 'index,follow',
  og_title text,
  og_description text,
  og_image_url text,
  structured_data jsonb not null default '{}'::jsonb,
  status public.record_status not null default 'draft',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint seo_metadata_single_entity check (num_nonnulls(course_id, blog_post_id) <= 1),
  constraint seo_metadata_route_format check (route_path like '/%')
);

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  is_public boolean not null default false,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'roles', 'profiles', 'companies', 'students', 'student_private_data', 'trainers', 'course_categories',
    'courses', 'course_modules', 'locations', 'venues', 'course_sessions',
    'session_schedules', 'enrollments', 'payments', 'invoices', 'certificates',
    'contact_requests', 'faqs', 'testimonials', 'blog_categories', 'blog_posts',
    'media_assets', 'seo_metadata', 'site_settings'
  ]
  loop
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end;
$$;
*/
