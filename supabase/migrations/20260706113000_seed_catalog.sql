/* Historical full-backend migration superseded by reset_create_mvp.
insert into public.course_categories (name, slug, description, sort_order, status) values
  ('Maquinaria industrial', 'maquinaria-industrial', 'Formación para el manejo seguro de maquinaria y equipos industriales.', 10, 'published'),
  ('Trabajos en altura', 'trabajos-en-altura', 'Formación preventiva y práctica para trabajos con riesgo de caída.', 20, 'published'),
  ('Espacios confinados', 'espacios-confinados', 'Acceso, trabajo, vigilancia y rescate en espacios confinados.', 30, 'published'),
  ('Formación TELCO', 'formacion-telco', 'Programas de seguridad y prevención para el sector de telecomunicaciones.', 40, 'published'),
  ('Trekform online', 'trekform-online', 'Cursos online con acceso flexible y contenidos acreditativos.', 50, 'published'),
  ('Construcción (TPC) / Metal (TPM)', 'construccion-tpc-metal-tpm', 'Formación de prevención para construcción y metal.', 60, 'published'),
  ('Prevención', 'prevencion', 'Prevención de riesgos laborales, emergencias y primeros auxilios.', 70, 'published'),
  ('Logística', 'logistica', 'Operaciones de almacén, picking y movimiento de cargas.', 80, 'published'),
  ('Hostelería', 'hosteleria', 'Seguridad alimentaria y formación para hostelería.', 90, 'published')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  status = excluded.status;

with course_data(category_slug, title, slug, excerpt, modality, duration_minutes, audience, featured, sort_order) as (
  values
    ('espacios-confinados', 'Curso de Espacios Confinados', 'curso-de-espacios-confinados', 'Formación teórico-práctica para trabajar de forma segura en espacios confinados.', 'presential', 480, 'both', true, 10),
    ('prevencion', 'Curso de Riesgo Eléctrico', 'curso-de-riesgo-electrico', 'Prevención y actuación segura frente al riesgo eléctrico.', 'presential', 360, 'both', true, 20),
    ('prevencion', 'Curso Básico de Primeros Auxilios', 'curso-basico-de-primeros-auxilios', 'Protocolos básicos de actuación ante emergencias y accidentes.', 'presential', 480, 'both', true, 30),
    ('prevencion', 'Curso de Lucha Contra Incendios', 'curso-de-lucha-contra-incendios', 'Prevención, extinción inicial y evacuación ante incendios.', 'presential', 480, 'both', true, 40),
    ('logistica', 'Curso de Operario de Almacén', 'curso-de-operario-de-almacen', 'Operaciones seguras y eficientes en almacenes y centros logísticos.', 'presential', 1920, 'both', true, 50),
    ('maquinaria-industrial', 'Curso de Carretillas Elevadoras', 'curso-de-carretillas-elevadoras', 'Curso de carretillero con teoría, prácticas reales y diploma acreditativo.', 'presential', 480, 'both', true, 60),
    ('prevencion', 'Curso de Equipos de Protección Individual (EPI)', 'curso-de-equipos-de-proteccion-individual-epi', 'Selección, uso, mantenimiento y revisión de equipos de protección individual.', 'online', 1200, 'both', false, 70),
    ('logistica', 'Curso de Operario de Almacén + Carnet de Carretillas', 'curso-de-operario-almacen-carnet-carretillas', 'Programa combinado de almacén y manejo seguro de carretillas.', 'presential', 2400, 'both', false, 80),
    ('trabajos-en-altura', 'Curso de Seguridad de Trabajos en Altura', 'curso-de-seguridad-de-trabajos-en-altura', 'Formación preventiva con prácticas de equipos, anclajes y procedimientos seguros.', 'presential', 480, 'both', true, 90),
    ('logistica', 'Curso de Picking y Radiofrecuencia', 'curso-de-picking-y-radiofrecuencia', 'Preparación de pedidos y uso de terminales de radiofrecuencia.', 'presential', 480, 'both', false, 100),
    ('hosteleria', 'Curso de Manipulador de Alimentos para Empresas', 'curso-de-manipulador-de-alimentos-empresas', 'Buenas prácticas de higiene y seguridad alimentaria para equipos de empresa.', 'presential', 240, 'companies', false, 110),
    ('formacion-telco', 'Curso de Riesgos Eléctricos TELCO', 'curso-de-riesgos-electricos-telco', 'Formación TELCO para trabajos con exposición a riesgos eléctricos.', 'presential', 360, 'both', false, 120),
    ('trabajos-en-altura', 'Curso de Trabajos Verticales', 'curso-de-trabajos-verticales', 'Técnicas de acceso, progresión y trabajo seguro mediante cuerdas.', 'presential', 960, 'both', false, 130),
    ('maquinaria-industrial', 'Curso de Plataformas Elevadoras (PEMP)', 'curso-de-plataformas-elevadoras-pemp', 'Manejo seguro de plataformas elevadoras móviles de personal.', 'presential', 360, 'both', true, 140),
    ('prevencion', 'Curso de Prevención de Riesgo Químico', 'curso-de-prevencion-riesgo-quimico', 'Identificación, prevención y control de riesgos por agentes químicos.', 'presential', 360, 'both', false, 150),
    ('formacion-telco', 'Curso de Operaciones TELCO', 'curso-de-operaciones-telco', 'Procedimientos preventivos aplicados a operaciones de telecomunicaciones.', 'presential', 360, 'both', false, 160),
    ('maquinaria-industrial', 'Curso de Operario de Puente Grúa', 'curso-de-operario-de-puente-grua', 'Manejo, inspección y operación segura de puente grúa.', 'presential', 480, 'both', true, 170),
    ('prevencion', 'Curso de Manipulación Manual de Cargas', 'curso-de-manipulacion-manual-de-cargas', 'Ergonomía y técnicas seguras para manipular cargas manualmente.', 'presential', 240, 'both', false, 180),
    ('maquinaria-industrial', 'Curso de Operario de Carretilla Trilateral', 'curso-de-operario-de-carretilla-trilateral', 'Operación segura de carretillas trilaterales en pasillos estrechos.', 'presential', 480, 'both', false, 190),
    ('formacion-telco', 'Curso de Trabajos en Altura TELCO I', 'curso-de-trabajos-en-altura-telco-i', 'Nivel inicial TELCO para trabajos seguros en altura.', 'presential', 360, 'both', false, 200),
    ('trekform-online', 'Curso de Manipulador de Alimentos Online', 'curso-de-manipulador-de-alimentos-online', 'Formación online flexible en higiene y seguridad alimentaria.', 'online', 240, 'both', false, 210),
    ('formacion-telco', 'Curso de Trabajos en Altura TELCO II', 'curso-de-trabajos-en-altura-telco-ii', 'Nivel avanzado TELCO para operaciones y rescate en altura.', 'presential', 480, 'both', false, 220),
    ('trabajos-en-altura', 'Curso de Trabajos en Altura para Poda de Árboles', 'curso-de-trabajos-en-altura-para-poda-de-arboles', 'Técnicas y prevención para poda y arboricultura en altura.', 'presential', 480, 'both', false, 230),
    ('maquinaria-industrial', 'Curso de Operario de Dumper', 'curso-de-operario-de-dumper', 'Manejo preventivo y seguro de dumper en obra e industria.', 'presential', 480, 'both', false, 240),
    ('prevencion', 'Curso DEA + SVB Continuado', 'curso-dea-svb-continuado', 'Soporte vital básico y uso seguro del desfibrilador externo.', 'presential', 360, 'both', false, 250),
    ('logistica', 'Curso de Operario de Recogepedidos', 'curso-de-operario-de-recogepedidos', 'Uso seguro de equipos recogepedidos y operativa logística.', 'presential', 480, 'both', false, 260),
    ('trekform-online', 'Curso de Ciberseguridad (IFCT135PO)', 'curso-de-ciberseguridad-ifct135po', 'Principios y prácticas esenciales de seguridad digital.', 'online', 1500, 'both', false, 270)
)
insert into public.courses (
  category_id, title, slug, excerpt, audience_description, audience, modality, methodology,
  duration_minutes, certification_name, is_official_certification, is_fundae_eligible,
  is_featured, sort_order, status, published_at
)
select
  cc.id,
  d.title,
  d.slug,
  d.excerpt,
  case d.audience when 'companies' then 'Empresas y entidades.' else 'Particulares, empresas y entidades.' end,
  d.audience::public.course_audience,
  d.modality::public.course_modality,
  case d.modality when 'online' then 'teórico online' else 'teórico-práctico' end,
  d.duration_minutes,
  'Diploma acreditativo Trekform',
  true,
  true,
  d.featured,
  d.sort_order,
  'published',
  timezone('utc', now())
from course_data d
join public.course_categories cc on cc.slug = d.category_slug
on conflict (slug) do update set
  category_id = excluded.category_id,
  title = excluded.title,
  excerpt = excluded.excerpt,
  audience_description = excluded.audience_description,
  audience = excluded.audience,
  modality = excluded.modality,
  methodology = excluded.methodology,
  duration_minutes = excluded.duration_minutes,
  is_featured = excluded.is_featured,
  sort_order = excluded.sort_order,
  status = excluded.status;

insert into public.seo_metadata (route_path, course_id, title, description, status)
select
  '/cursos-trekform/' || cc.slug || '/' || c.slug,
  c.id,
  c.title || ' | Trekform',
  c.excerpt,
  'published'
from public.courses c
join public.course_categories cc on cc.id = c.category_id
where c.status = 'published'
on conflict (route_path) do update set
  course_id = excluded.course_id,
  title = excluded.title,
  description = excluded.description,
  status = excluded.status;

insert into public.site_settings (key, value, is_public, description) values
  ('contact', '{"email":"comercial@trekform.com","phones":{"barcelona":"932640532","madrid":"917376166"}}'::jsonb, true, 'Datos generales de contacto'),
  ('business_hours', '{"monday_thursday":"09:00-18:00","friday":"09:00-15:00","timezone":"Europe/Madrid"}'::jsonb, true, 'Horario de atención'),
  ('payments', '{"currency":"EUR","provider":"stripe"}'::jsonb, false, 'Configuración funcional de pagos')
on conflict (key) do update set value = excluded.value, is_public = excluded.is_public, description = excluded.description;
*/
