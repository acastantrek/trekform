begin;

alter table public.courses
  add column if not exists hero_text text,
  add column if not exists seo_description text,
  add column if not exists sidebar_certification_title text,
  add column if not exists sidebar_certification_text text,
  add column if not exists sidebar_quality_title text,
  add column if not exists sidebar_quality_text text,
  add column if not exists sidebar_fundae_title text,
  add column if not exists sidebar_fundae_text text;

update public.courses
set
  hero_text = coalesce(hero_text, excerpt),
  seo_description = coalesce(seo_description, excerpt),
  sidebar_certification_title = coalesce(sidebar_certification_title, 'Certificación oficial'),
  sidebar_quality_title = coalesce(sidebar_quality_title, 'Calidad garantizada'),
  sidebar_fundae_title = coalesce(sidebar_fundae_title, 'Bonificaciones')
where
  hero_text is null
  or seo_description is null
  or sidebar_certification_title is null
  or sidebar_quality_title is null
  or sidebar_fundae_title is null;

commit;
