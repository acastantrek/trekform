/* Historical full-backend migration superseded by reset_create_mvp.
create or replace function public.has_role(required_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profile_roles pr
    join public.roles r on r.id = pr.role_id
    where pr.profile_id = auth.uid() and r.key = required_role
  );
*/
$$;

create or replace function public.is_company_member(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.company_members cm
    where cm.company_id = target_company_id and cm.profile_id = auth.uid()
  );
$$;

create or replace function public.is_company_manager(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.company_members cm
    where cm.company_id = target_company_id and cm.profile_id = auth.uid() and cm.is_manager
  );
$$;

create or replace function public.is_session_trainer(target_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.session_trainers st
    join public.trainers t on t.id = st.trainer_id
    where st.course_session_id = target_session_id and t.profile_id = auth.uid()
  );
$$;

create or replace function public.can_access_student(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_role('admin') or exists (
    select 1
    from public.students s
    where s.id = target_student_id
      and (
        s.profile_id = auth.uid()
        or (s.company_id is not null and public.is_company_member(s.company_id))
        or exists (
          select 1
          from public.enrollments e
          where e.student_id = s.id and public.is_session_trainer(e.course_session_id)
        )
      )
  );
$$;

create or replace function public.can_access_student_private(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_role('admin') or exists (
    select 1 from public.students s
    where s.id = target_student_id
      and (
        s.profile_id = auth.uid()
        or (s.company_id is not null and public.is_company_member(s.company_id))
      )
  );
$$;

create or replace function public.can_access_enrollment(target_enrollment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_role('admin') or exists (
    select 1
    from public.enrollments e
    join public.students s on s.id = e.student_id
    where e.id = target_enrollment_id
      and (
        s.profile_id = auth.uid()
        or (e.company_id is not null and public.is_company_member(e.company_id))
        or public.is_session_trainer(e.course_session_id)
      )
  );
$$;

create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  student_role_id uuid;
  given_name text;
  family_name text;
begin
  given_name := coalesce(new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1));
  family_name := coalesce(new.raw_user_meta_data ->> 'last_name', '');

  insert into public.profiles (id, email, first_name, last_name, display_name)
  values (new.id, new.email, given_name, family_name, nullif(trim(given_name || ' ' || family_name), ''))
  on conflict (id) do update set email = excluded.email, updated_at = timezone('utc', now());

  select id into student_role_id from public.roles where key = 'student';
  insert into public.profile_roles (profile_id, role_id)
  values (new.id, student_role_id)
  on conflict do nothing;

  insert into public.students (profile_id, first_name, last_name, email)
  values (new.id, given_name, family_name, new.email)
  on conflict (profile_id) do update set email = excluded.email, updated_at = timezone('utc', now());

  return new;
end;
$$;

create or replace function public.handle_auth_user_updated()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set email = new.email,
      last_sign_in_at = new.last_sign_in_at,
      updated_at = timezone('utc', now())
  where id = new.id;

  update public.students
  set email = new.email,
      updated_at = timezone('utc', now())
  where profile_id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_auth_user_created();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email, last_sign_in_at on auth.users
  for each row execute function public.handle_auth_user_updated();

insert into public.profiles (id, email, first_name, last_name, display_name, last_sign_in_at)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'first_name', u.raw_user_meta_data ->> 'name', split_part(u.email, '@', 1)),
  coalesce(u.raw_user_meta_data ->> 'last_name', ''),
  coalesce(u.raw_user_meta_data ->> 'name', split_part(u.email, '@', 1)),
  u.last_sign_in_at
from auth.users u
on conflict (id) do update set email = excluded.email, last_sign_in_at = excluded.last_sign_in_at;

insert into public.profile_roles (profile_id, role_id)
select p.id, r.id from public.profiles p cross join public.roles r where r.key = 'student'
on conflict do nothing;

insert into public.students (profile_id, first_name, last_name, email)
select p.id, coalesce(p.first_name, split_part(p.email, '@', 1), 'Alumno'), coalesce(p.last_name, ''), p.email
from public.profiles p
on conflict (profile_id) do nothing;

create or replace function public.prepare_enrollment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_session public.course_sessions%rowtype;
begin
  select * into selected_session from public.course_sessions where id = new.course_session_id;
  if not found then
    raise exception 'Convocatoria no encontrada';
  end if;

  if auth.role() = 'authenticated' and not public.has_role('admin') then
    new.enrolled_by := auth.uid();
    new.status := 'pending';
    new.payment_status := 'unpaid';
    new.unit_price_cents := selected_session.price_cents;
    new.currency := selected_session.currency;
  end if;
  return new;
end;
$$;

create trigger prepare_enrollment_before_insert
  before insert on public.enrollments
  for each row execute function public.prepare_enrollment();

create or replace function public.protect_self_service_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() = 'authenticated' and not public.has_role('admin') then
    if tg_table_name = 'profiles' then
      new.id := old.id;
      new.email := old.email;
      new.is_active := old.is_active;
      new.last_sign_in_at := old.last_sign_in_at;
      new.created_at := old.created_at;
    elsif tg_table_name = 'students' then
      new.id := old.id;
      new.profile_id := old.profile_id;
      new.student_number := old.student_number;
      new.company_id := old.company_id;
      new.is_active := old.is_active;
      new.created_at := old.created_at;
    elsif tg_table_name = 'trainers' then
      new.id := old.id;
      new.profile_id := old.profile_id;
      new.is_active := old.is_active;
      new.created_at := old.created_at;
    end if;
  end if;
  return new;
end;
$$;

create trigger protect_profiles_self_service before update on public.profiles
  for each row execute function public.protect_self_service_fields();
create trigger protect_students_self_service before update on public.students
  for each row execute function public.protect_self_service_fields();
create trigger protect_trainers_self_service before update on public.trainers
  for each row execute function public.protect_self_service_fields();

create or replace function public.verify_certificate(
  p_verification_token uuid,
  p_identity_document text
)
returns table (
  valid boolean,
  certificate_number text,
  certificate_title text,
  student_name text,
  course_title text,
  issued_at timestamptz,
  expires_at timestamptz,
  certificate_status public.certificate_status
)
language sql
stable
security definer
set search_path = ''
as $$
  with matched as (
    select
      c.status = 'issued'
        and c.issued_at is not null
        and (c.expires_at is null or c.expires_at > timezone('utc', now())) as valid,
      c.certificate_number,
      c.title as certificate_title,
      trim(s.first_name || ' ' || s.last_name) as student_name,
      co.title as course_title,
      c.issued_at,
      c.expires_at,
      c.status as certificate_status
    from public.certificates c
    join public.enrollments e on e.id = c.enrollment_id
    join public.students s on s.id = e.student_id
    join public.student_private_data sp on sp.student_id = s.id
    join public.course_sessions cs on cs.id = e.course_session_id
    join public.courses co on co.id = cs.course_id
    where c.verification_token = p_verification_token
      and sp.identity_document is not null
      and public.normalize_identity_document(sp.identity_document) = public.normalize_identity_document(p_identity_document)
  )
  select * from matched
  union all
  select false, null::text, null::text, null::text, null::text, null::timestamptz, null::timestamptz, null::public.certificate_status
  where not exists (select 1 from matched)
  limit 1;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'roles', 'profiles', 'profile_roles', 'companies', 'company_members', 'students', 'student_private_data',
    'trainers', 'course_categories', 'courses', 'course_modules', 'locations', 'venues',
    'course_sessions', 'session_schedules', 'session_trainers', 'enrollments', 'payments',
    'invoices', 'certificates', 'contact_requests', 'faqs', 'testimonials', 'blog_categories',
    'blog_posts', 'blog_post_categories', 'media_assets', 'seo_metadata', 'site_settings'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end;
$$;

create policy roles_authenticated_read on public.roles for select to authenticated using (true);
create policy roles_admin_all on public.roles for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy profiles_own_read on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role('admin') or exists (
    select 1 from public.students s where s.profile_id = profiles.id and public.can_access_student(s.id)
  ));
create policy profiles_own_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_all on public.profiles for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy profile_roles_own_read on public.profile_roles for select to authenticated using (profile_id = auth.uid() or public.has_role('admin'));
create policy profile_roles_admin_all on public.profile_roles for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy companies_member_read on public.companies for select to authenticated using (public.is_company_member(id) or public.has_role('admin'));
create policy companies_manager_update on public.companies for update to authenticated
  using (public.is_company_manager(id)) with check (public.is_company_manager(id));
create policy companies_admin_all on public.companies for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
create policy company_members_company_read on public.company_members for select to authenticated
  using (profile_id = auth.uid() or public.is_company_member(company_id) or public.has_role('admin'));
create policy company_members_admin_all on public.company_members for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
create policy company_members_manager_insert on public.company_members for insert to authenticated
  with check (public.is_company_manager(company_id));
create policy company_members_manager_update on public.company_members for update to authenticated
  using (public.is_company_manager(company_id)) with check (public.is_company_manager(company_id));
create policy company_members_manager_delete on public.company_members for delete to authenticated
  using (public.is_company_manager(company_id) and profile_id <> auth.uid());

create policy students_authorized_read on public.students for select to authenticated using (public.can_access_student(id));
create policy students_own_update on public.students for update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy students_company_insert on public.students for insert to authenticated
  with check (profile_id is null and company_id is not null and public.is_company_manager(company_id));
create policy students_company_update on public.students for update to authenticated
  using (company_id is not null and public.is_company_manager(company_id))
  with check (company_id is not null and public.is_company_manager(company_id));
create policy students_admin_all on public.students for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy student_private_data_authorized_read on public.student_private_data for select to authenticated
  using (public.can_access_student_private(student_id));
create policy student_private_data_own_insert on public.student_private_data for insert to authenticated
  with check (exists (select 1 from public.students s where s.id = student_id and s.profile_id = auth.uid()));
create policy student_private_data_own_update on public.student_private_data for update to authenticated
  using (exists (select 1 from public.students s where s.id = student_id and s.profile_id = auth.uid()))
  with check (exists (select 1 from public.students s where s.id = student_id and s.profile_id = auth.uid()));
create policy student_private_data_company_insert on public.student_private_data for insert to authenticated
  with check (exists (select 1 from public.students s where s.id = student_id and s.company_id is not null and public.is_company_manager(s.company_id)));
create policy student_private_data_company_update on public.student_private_data for update to authenticated
  using (exists (select 1 from public.students s where s.id = student_id and s.company_id is not null and public.is_company_manager(s.company_id)))
  with check (exists (select 1 from public.students s where s.id = student_id and s.company_id is not null and public.is_company_manager(s.company_id)));
create policy student_private_data_admin_all on public.student_private_data for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

create policy trainers_own_read on public.trainers for select to authenticated using (profile_id = auth.uid() or public.has_role('admin'));
create policy trainers_own_update on public.trainers for update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy trainers_admin_all on public.trainers for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy categories_public_read on public.course_categories for select to anon, authenticated using (status = 'published');
create policy categories_admin_all on public.course_categories for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
create policy courses_public_read on public.courses for select to anon, authenticated using (status = 'published' and published_at <= timezone('utc', now()));
create policy courses_admin_all on public.courses for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
create policy modules_public_read on public.course_modules for select to anon, authenticated using (
  is_published and exists (select 1 from public.courses c where c.id = course_modules.course_id and c.status = 'published' and c.published_at <= timezone('utc', now()))
);
create policy modules_admin_all on public.course_modules for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy locations_public_read on public.locations for select to anon, authenticated using (is_active);
create policy locations_admin_all on public.locations for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
create policy venues_public_read on public.venues for select to anon, authenticated using (is_active and is_public);
create policy venues_admin_all on public.venues for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy sessions_public_read on public.course_sessions for select to anon, authenticated using (
  kind = 'open' and status in ('scheduled', 'open', 'full', 'in_progress', 'completed')
  and exists (select 1 from public.courses c where c.id = course_sessions.course_id and c.status = 'published')
);
create policy sessions_private_authorized_read on public.course_sessions for select to authenticated using (
  public.has_role('admin') or public.is_session_trainer(id) or (company_id is not null and public.is_company_member(company_id))
);
create policy sessions_admin_all on public.course_sessions for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy schedules_public_read on public.session_schedules for select to anon, authenticated using (
  exists (select 1 from public.course_sessions cs where cs.id = session_schedules.course_session_id and cs.kind = 'open' and cs.status in ('scheduled', 'open', 'full', 'in_progress', 'completed'))
);
create policy schedules_authorized_read on public.session_schedules for select to authenticated using (
  public.has_role('admin') or public.is_session_trainer(course_session_id)
  or exists (select 1 from public.course_sessions cs where cs.id = session_schedules.course_session_id and cs.company_id is not null and public.is_company_member(cs.company_id))
);
create policy schedules_admin_all on public.session_schedules for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy session_trainers_own_read on public.session_trainers for select to authenticated using (
  public.has_role('admin') or public.is_session_trainer(course_session_id)
);
create policy session_trainers_admin_all on public.session_trainers for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy enrollments_authorized_read on public.enrollments for select to authenticated using (public.can_access_enrollment(id));
create policy enrollments_student_insert on public.enrollments for insert to authenticated with check (
  enrolled_by = auth.uid()
  and status = 'pending'
  and payment_status = 'unpaid'
  and exists (select 1 from public.students s where s.id = student_id and s.profile_id = auth.uid())
  and company_id is null
  and exists (select 1 from public.course_sessions cs where cs.id = course_session_id and cs.kind = 'open' and cs.status = 'open')
);
create policy enrollments_company_insert on public.enrollments for insert to authenticated with check (
  enrolled_by = auth.uid()
  and status = 'pending'
  and payment_status = 'unpaid'
  and company_id is not null
  and public.is_company_manager(company_id)
  and exists (select 1 from public.students s where s.id = student_id and s.company_id = enrollments.company_id)
  and exists (
    select 1 from public.course_sessions cs
    where cs.id = course_session_id
      and cs.status = 'open'
      and (cs.kind = 'open' or (cs.kind = 'in_company' and cs.company_id = enrollments.company_id))
  )
);
create policy enrollments_admin_all on public.enrollments for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy payments_authorized_read on public.payments for select to authenticated using (public.can_access_enrollment(enrollment_id));
create policy payments_admin_all on public.payments for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
create policy invoices_authorized_read on public.invoices for select to authenticated using (public.can_access_enrollment(enrollment_id));
create policy invoices_admin_all on public.invoices for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
create policy certificates_authorized_read on public.certificates for select to authenticated using (public.can_access_enrollment(enrollment_id));
create policy certificates_admin_all on public.certificates for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy contact_requests_public_insert on public.contact_requests for insert to anon, authenticated with check (
  status = 'new' and assigned_to is null and resolved_at is null and privacy_accepted_at <= timezone('utc', now())
);
create policy contact_requests_admin_all on public.contact_requests for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy faqs_public_read on public.faqs for select to anon, authenticated using (status = 'published');
create policy faqs_admin_all on public.faqs for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
create policy testimonials_public_read on public.testimonials for select to anon, authenticated using (status = 'published' and published_at <= timezone('utc', now()));
create policy testimonials_admin_all on public.testimonials for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
create policy blog_categories_public_read on public.blog_categories for select to anon, authenticated using (status = 'published');
create policy blog_categories_admin_all on public.blog_categories for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
create policy blog_posts_public_read on public.blog_posts for select to anon, authenticated using (status = 'published' and published_at <= timezone('utc', now()));
create policy blog_posts_admin_all on public.blog_posts for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
create policy blog_post_categories_public_read on public.blog_post_categories for select to anon, authenticated using (
  exists (select 1 from public.blog_posts bp where bp.id = blog_post_categories.blog_post_id and bp.status = 'published' and bp.published_at <= timezone('utc', now()))
);
create policy blog_post_categories_admin_all on public.blog_post_categories for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
create policy media_assets_public_read on public.media_assets for select to anon, authenticated using (bucket_id in ('course-media', 'cms-media'));
create policy media_assets_admin_all on public.media_assets for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
create policy seo_metadata_public_read on public.seo_metadata for select to anon, authenticated using (status = 'published');
create policy seo_metadata_admin_all on public.seo_metadata for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
create policy site_settings_public_read on public.site_settings for select to anon, authenticated using (is_public);
create policy site_settings_admin_all on public.site_settings for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

grant usage on schema public to anon, authenticated;
grant select on public.course_categories, public.courses, public.course_modules, public.locations, public.venues,
  public.course_sessions, public.session_schedules, public.faqs, public.testimonials, public.blog_categories,
  public.blog_posts, public.blog_post_categories, public.media_assets, public.seo_metadata, public.site_settings
  to anon, authenticated;
grant insert on public.contact_requests to anon, authenticated;
grant select, insert, update, delete on public.roles, public.profiles, public.profile_roles, public.companies, public.company_members,
  public.students, public.student_private_data, public.trainers, public.course_categories, public.courses, public.course_modules,
  public.locations, public.venues, public.course_sessions, public.session_schedules, public.session_trainers,
  public.enrollments, public.payments, public.invoices, public.certificates, public.contact_requests,
  public.faqs, public.testimonials, public.blog_categories, public.blog_posts, public.blog_post_categories,
  public.media_assets, public.seo_metadata, public.site_settings to authenticated;
grant all on all tables in schema public to service_role;
grant execute on function public.verify_certificate(uuid, text) to anon, authenticated;
grant execute on function public.has_role(public.app_role), public.is_company_member(uuid), public.is_company_manager(uuid),
  public.is_session_trainer(uuid), public.can_access_student(uuid), public.can_access_student_private(uuid), public.can_access_enrollment(uuid)
  to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('course-media', 'course-media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf']),
  ('cms-media', 'cms-media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']),
  ('private-documents', 'private-documents', false, 20971520, array['application/pdf', 'image/jpeg', 'image/png']),
  ('certificates', 'certificates', false, 10485760, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy public_media_read on storage.objects for select to anon, authenticated
  using (bucket_id in ('course-media', 'cms-media'));
create policy admin_storage_insert on storage.objects for insert to authenticated
  with check (bucket_id in ('course-media', 'cms-media', 'private-documents', 'certificates') and public.has_role('admin'));
create policy admin_storage_update on storage.objects for update to authenticated
  using (bucket_id in ('course-media', 'cms-media', 'private-documents', 'certificates') and public.has_role('admin'))
  with check (bucket_id in ('course-media', 'cms-media', 'private-documents', 'certificates') and public.has_role('admin'));
create policy admin_storage_delete on storage.objects for delete to authenticated
  using (bucket_id in ('course-media', 'cms-media', 'private-documents', 'certificates') and public.has_role('admin'));
create policy authorized_certificate_read on storage.objects for select to authenticated
  using (
    bucket_id = 'certificates'
    and exists (
      select 1 from public.certificates c
      where c.storage_path = storage.objects.name and public.can_access_enrollment(c.enrollment_id)
    )
  );
