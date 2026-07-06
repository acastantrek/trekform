-- Applied remotely as migration 20260706082207_foundation.
create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;

create type public.app_role as enum ('admin', 'student', 'company', 'trainer');
create type public.record_status as enum ('draft', 'published', 'archived');
create type public.course_modality as enum ('presential', 'online', 'hybrid');
create type public.course_audience as enum ('individuals', 'companies', 'both');
create type public.session_kind as enum ('open', 'in_company');
create type public.session_status as enum ('draft', 'scheduled', 'open', 'full', 'in_progress', 'completed', 'cancelled');
create type public.schedule_block_type as enum ('theory', 'practice', 'exam', 'other');
create type public.enrollment_status as enum ('pending', 'confirmed', 'waitlisted', 'cancelled', 'attended', 'no_show', 'completed');
create type public.payment_status as enum ('unpaid', 'pending', 'paid', 'partially_refunded', 'refunded', 'failed', 'cancelled');
create type public.payment_provider as enum ('stripe', 'bank_transfer', 'cash', 'manual');
create type public.invoice_status as enum ('draft', 'issued', 'paid', 'void', 'refunded');
create type public.certificate_status as enum ('draft', 'issued', 'revoked', 'expired');
create type public.contact_request_type as enum ('general', 'course_info', 'company_training', 'in_company', 'fundae', 'career');
create type public.request_status as enum ('new', 'in_progress', 'resolved', 'spam', 'closed');
create type public.identity_document_type as enum ('dni', 'nie', 'passport', 'other');
create type public.media_kind as enum ('image', 'video', 'document', 'certificate', 'other');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.normalize_identity_document(value text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select upper(regexp_replace(value, '[^A-Za-z0-9]', '', 'g'));
$$;
