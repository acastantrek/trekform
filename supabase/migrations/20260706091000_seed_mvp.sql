/* Historical duplicate. Active version: 20260706084449_seed_mvp.sql.
insert into public.course_categories (name, slug, description, sort_order) values
  ('Maquinaria industrial', 'maquinaria-industrial', 'Cursos de manejo seguro de maquinaria industrial.', 10),
  ('Trabajos en altura', 'trabajos-en-altura', 'Formación preventiva para trabajos con riesgo de caída.', 20),
  ('Espacios confinados', 'espacios-confinados', 'Formación para acceso y trabajo seguro en espacios confinados.', 30),
  ('Formación TELCO', 'formacion-telco', 'Programas preventivos para telecomunicaciones.', 40),
  ('Trekform online', 'trekform-online', 'Formación flexible en modalidad online.', 50),
  ('Construcción y metal', 'construccion-metal', 'Prevención para construcción y sector metal.', 60),
  ('Prevención', 'prevencion', 'Prevención de riesgos, emergencias y primeros auxilios.', 70),
  ('Logística', 'logistica', 'Operaciones de almacén y movimiento de cargas.', 80),
  ('Hostelería', 'hosteleria', 'Seguridad alimentaria y formación para hostelería.', 90)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true;

with seed_courses(category_slug, title, slug, excerpt, description, duration_hours, featured) as (
  values
    ('maquinaria-industrial', 'Curso de Carretillas Elevadoras', 'curso-de-carretillas-elevadoras', 'Obtén formación teórica y práctica para manejar carretillas con seguridad.', 'Curso presencial para particulares y empresas con prácticas reales de conducción y seguridad.', 8.00, true),
    ('maquinaria-industrial', 'Curso de Plataformas Elevadoras (PEMP)', 'curso-de-plataformas-elevadoras-pemp', 'Aprende a operar plataformas elevadoras de forma segura.', 'Formación teórico-práctica sobre inspección, manejo y prevención de riesgos con PEMP.', 6.00, true),
    ('trabajos-en-altura', 'Curso de Trabajos en Altura', 'curso-de-trabajos-en-altura', 'Formación práctica para trabajar con seguridad en altura.', 'Uso de EPIs, sistemas anticaídas, anclajes y procedimientos de trabajo seguro.', 8.00, true),
    ('espacios-confinados', 'Curso de Espacios Confinados', 'curso-de-espacios-confinados', 'Prevención, acceso y actuación segura en espacios confinados.', 'Identificación de riesgos, medición de atmósferas, vigilancia y procedimientos de emergencia.', 8.00, true),
    ('prevencion', 'Curso Básico de Primeros Auxilios', 'curso-basico-primeros-auxilios', 'Protocolos básicos de actuación ante emergencias.', 'Evaluación inicial, soporte vital básico y actuación ante accidentes frecuentes.', 8.00, false),
    ('logistica', 'Curso de Operario de Almacén', 'curso-operario-almacen', 'Operaciones esenciales para trabajar en almacenes y centros logísticos.', 'Recepción, almacenamiento, preparación de pedidos y prevención de riesgos logísticos.', 32.00, false)
)
insert into public.courses (
  category_id, title, slug, excerpt, description, duration_hours, is_featured, status, published_at
)
select
  cc.id, sc.title, sc.slug, sc.excerpt, sc.description, sc.duration_hours,
  sc.featured, 'published', now()
from seed_courses sc
join public.course_categories cc on cc.slug = sc.category_slug
on conflict (slug) do update set
  category_id = excluded.category_id,
  title = excluded.title,
  excerpt = excluded.excerpt,
  description = excluded.description,
  duration_hours = excluded.duration_hours,
  is_featured = excluded.is_featured,
  status = excluded.status,
  published_at = excluded.published_at;

insert into public.course_modules (course_id, title, content, duration_minutes, position)
select c.id, m.title, m.content, m.duration_minutes, m.position
from public.courses c
cross join lateral (
  values
    ('Fundamentos y normativa', 'Conceptos esenciales, responsabilidades y normativa aplicable.', 120, 1),
    ('Prevención y operación segura', 'Identificación de riesgos y procedimientos de trabajo seguro.', 120, 2),
    ('Prácticas y evaluación', 'Aplicación práctica de los conocimientos y evaluación final.', 240, 3)
) as m(title, content, duration_minutes, position)
where c.slug in (
  'curso-de-carretillas-elevadoras',
  'curso-de-plataformas-elevadoras-pemp',
  'curso-de-trabajos-en-altura',
  'curso-de-espacios-confinados'
)
on conflict (course_id, position) do update set
  title = excluded.title,
  content = excluded.content,
  duration_minutes = excluded.duration_minutes;

insert into public.locations (name, slug, city, province) values
  ('Madrid', 'madrid', 'Madrid', 'Madrid'),
  ('Montcada i Reixac', 'montcada-i-reixac', 'Montcada i Reixac', 'Barcelona'),
  ('Reus', 'reus', 'Reus', 'Tarragona'),
  ('Dos Hermanas', 'dos-hermanas', 'Dos Hermanas', 'Sevilla')
on conflict (slug) do update set
  name = excluded.name,
  city = excluded.city,
  province = excluded.province,
  is_active = true;

insert into public.venues (location_id, name, slug, address, postal_code)
select l.id, v.name, v.slug, v.address, v.postal_code
from (
  values
    ('madrid', 'Centro Trekform Madrid', 'centro-trekform-madrid', 'Calle de la Formación, 10', '28031'),
    ('montcada-i-reixac', 'Centro Trekform Barcelona', 'centro-trekform-barcelona', 'Carrer de la Indústria, 20', '08110'),
    ('reus', 'Centro de Formación Reus', 'centro-formacion-reus', 'Carrer del Treball, 8', '43204'),
    ('dos-hermanas', 'Centro de Formación Sevilla', 'centro-formacion-sevilla', 'Avenida de la Industria, 15', '41701')
) as v(location_slug, name, slug, address, postal_code)
join public.locations l on l.slug = v.location_slug
on conflict (slug) do update set
  location_id = excluded.location_id,
  name = excluded.name,
  address = excluded.address,
  postal_code = excluded.postal_code,
  is_active = true;

insert into public.course_sessions (
  course_id, venue_id, code, slug, starts_at, ends_at, capacity, price_cents, status, published_at
)
select c.id, v.id, s.code, s.slug, s.starts_at, s.ends_at, s.capacity, s.price_cents, 'open', now()
from (
  values
    ('curso-de-carretillas-elevadoras', 'centro-trekform-madrid', 'MVP-CAR-MAD-20260715', 'carretillas-madrid-15-julio-2026', '2026-07-15 08:00:00+02'::timestamptz, '2026-07-15 16:00:00+02'::timestamptz, 14, 14900),
    ('curso-de-plataformas-elevadoras-pemp', 'centro-trekform-madrid', 'MVP-PEMP-MAD-20260717', 'pemp-madrid-17-julio-2026', '2026-07-17 08:00:00+02'::timestamptz, '2026-07-17 14:00:00+02'::timestamptz, 12, 13900),
    ('curso-de-trabajos-en-altura', 'centro-formacion-reus', 'MVP-ALT-REU-20260720', 'trabajos-altura-reus-20-julio-2026', '2026-07-20 08:00:00+02'::timestamptz, '2026-07-20 16:00:00+02'::timestamptz, 12, 14900),
    ('curso-de-espacios-confinados', 'centro-trekform-barcelona', 'MVP-EC-BAR-20260722', 'espacios-confinados-barcelona-22-julio-2026', '2026-07-22 08:00:00+02'::timestamptz, '2026-07-22 16:00:00+02'::timestamptz, 10, 15900)
) as s(course_slug, venue_slug, code, slug, starts_at, ends_at, capacity, price_cents)
join public.courses c on c.slug = s.course_slug
join public.venues v on v.slug = s.venue_slug
on conflict (code) do update set
  course_id = excluded.course_id,
  venue_id = excluded.venue_id,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  capacity = excluded.capacity,
  price_cents = excluded.price_cents,
  status = excluded.status,
  published_at = excluded.published_at;

insert into public.faqs (question, answer, sort_order, is_published) values
  ('¿Dónde puedo realizar los cursos?', 'Impartimos cursos en las principales ciudades de España. Consulta las convocatorias publicadas para ver fechas y sedes.', 10, true),
  ('¿Los cursos incluyen prácticas?', 'Los cursos presenciales principales combinan formación teórica con ejercicios prácticos.', 20, true),
  ('¿Pueden inscribirse empresas?', 'Sí. Las empresas pueden solicitar información para formar a uno o varios trabajadores.', 30, true);

insert into public.testimonials (author_name, author_role, content, rating, sort_order, is_published) values
  ('Angela D.', 'Alumna', 'El curso fue claro, práctico y el profesorado tuvo mucha paciencia.', 5, 10, true),
  ('Juan Carlos C.', 'Alumno', 'La teoría y las prácticas estuvieron bien organizadas y fueron muy útiles.', 5, 20, true),
  ('Jorge M.', 'Alumno', 'Buenas instalaciones y formadores con experiencia real.', 5, 30, true);

insert into public.blog_categories (name, slug, description) values
  ('Formación', 'formacion', 'Noticias y recursos sobre formación profesional.'),
  ('Prevención', 'prevencion', 'Consejos y novedades sobre prevención de riesgos.'),
  ('Maquinaria', 'maquinaria', 'Contenido sobre maquinaria industrial y operación segura.')
on conflict (slug) do update set name = excluded.name, description = excluded.description, is_active = true;

insert into public.site_settings (key, value, is_public) values
  ('contact', '{"email":"comercial@trekform.com","phone":"932640532"}'::jsonb, true),
  ('business_hours', '{"monday_thursday":"09:00-18:00","friday":"09:00-15:00","timezone":"Europe/Madrid"}'::jsonb, true),
  ('site', '{"name":"Trekform","country":"ES","currency":"EUR"}'::jsonb, true)
on conflict (key) do update set value = excluded.value, is_public = excluded.is_public;
*/
