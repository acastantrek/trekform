/* Historical duplicate. Active version: 20260706093948_complete_course_catalog.sql.
create table if not exists public.course_category_assignments (
  course_id uuid not null references public.courses(id) on delete cascade,
  category_id uuid not null references public.course_categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (course_id, category_id)
);

create index if not exists course_category_assignments_category_idx
  on public.course_category_assignments(category_id, course_id);

alter table public.course_category_assignments enable row level security;

create policy course_category_assignments_public_select
  on public.course_category_assignments for select to anon, authenticated
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_category_assignments.course_id
        and c.status = 'published'
        and c.published_at is not null
        and c.published_at <= now()
    )
    and exists (
      select 1 from public.course_categories cc
      where cc.id = course_category_assignments.category_id and cc.is_active
    )
  );

create policy course_category_assignments_admin_all
  on public.course_category_assignments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant select on public.course_category_assignments to anon, authenticated;
grant insert, update, delete on public.course_category_assignments to authenticated;

insert into public.course_categories (name, slug, description, sort_order, is_active) values
  ('Maquinaria industrial', 'maquinaria-industrial', 'Formación para el manejo seguro de maquinaria y equipos industriales.', 10, true),
  ('Trabajos en altura', 'trabajos-en-altura', 'Formación preventiva y práctica para trabajos con riesgo de caída.', 20, true),
  ('Espacios confinados', 'espacios-confinados', 'Acceso, trabajo, vigilancia y rescate en espacios confinados.', 30, true),
  ('Formación TELCO', 'formacion-telco', 'Programas de seguridad y prevención para telecomunicaciones.', 40, true),
  ('Trekform online', 'trekform-online', 'Formación online flexible para profesionales y empresas.', 50, true),
  ('Construcción (TPC) / Metal (TPM)', 'construccion-metal', 'Formación preventiva para construcción y sector metal.', 60, true),
  ('Prevención', 'prevencion', 'Prevención de riesgos laborales, emergencias y primeros auxilios.', 70, true),
  ('Logística', 'logistica', 'Operaciones de almacén, transporte y movimiento de cargas.', 80, true),
  ('Hostelería', 'hosteleria', 'Seguridad alimentaria y formación profesional para hostelería.', 90, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

with catalog(primary_category, title, slug, modality, image_url, featured) as (
  values
    ('maquinaria-industrial', 'Curso de plataformas elevadoras (PEMP)', 'curso-de-plataformas-elevadoras-pemp', 'presential', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=82', true),
    ('maquinaria-industrial', 'Curso de operario de puente grúa', 'curso-de-operario-de-puente-grua', 'presential', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=82', true),
    ('maquinaria-industrial', 'Curso de operario de carretilla trilateral', 'curso-de-operario-de-carretilla-trilateral', 'presential', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=82', false),
    ('maquinaria-industrial', 'Curso de operario de dumper', 'curso-de-operario-de-dumper', 'presential', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=82', false),
    ('maquinaria-industrial', 'Curso de operario de recogepedidos', 'curso-de-operario-de-recogepedidos', 'presential', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=82', false),
    ('maquinaria-industrial', 'Curso de operario de retroexcavadora', 'curso-de-operario-de-retroexcavadora', 'presential', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=82', false),
    ('maquinaria-industrial', 'Curso de camión grúa / pluma', 'curso-de-camion-grua-pluma', 'presential', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=82', false),
    ('maquinaria-industrial', 'Curso de tractores agrícolas', 'curso-de-tractores-agricolas', 'presential', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=82', false),
    ('maquinaria-industrial', 'Curso de miniretroexcavadoras', 'curso-de-miniretroexcavadoras', 'presential', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=82', false),
    ('maquinaria-industrial', 'Curso de carretillas sube escaleras', 'curso-de-carretillas-sube-escaleras', 'presential', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=82', false),
    ('maquinaria-industrial', 'Curso de barredoras / fregadoras', 'curso-de-barredoras-fregadoras', 'presential', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=82', false),
    ('maquinaria-industrial', 'Curso de manipuladoras telescópicas', 'curso-de-manipuladoras-telescopicas', 'presential', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=82', false),
    ('maquinaria-industrial', 'Curso de operador de desbrozadoras', 'curso-de-operador-de-desbrozadoras', 'presential', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=82', false),
    ('maquinaria-industrial', 'Curso de operario de pala cargadora', 'curso-de-operario-de-pala-cargadora', 'presential', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=82', false),
    ('maquinaria-industrial', 'Curso de transpaletas eléctricas y apiladores', 'curso-de-transpaletas-electricas-y-apiladores', 'presential', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=82', false),
    ('maquinaria-industrial', 'Curso de carretillas elevadoras', 'curso-de-carretillas-elevadoras', 'presential', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=82', true),
    ('trabajos-en-altura', 'Curso de seguridad de trabajos en altura', 'curso-de-trabajos-en-altura', 'presential', 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1000&q=82', true),
    ('trabajos-en-altura', 'Curso de trabajos verticales', 'curso-de-trabajos-verticales', 'presential', 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1000&q=82', false),
    ('trabajos-en-altura', 'Curso de trabajos en altura para poda de árboles', 'curso-de-trabajos-en-altura-para-poda-de-arboles', 'presential', 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1000&q=82', false),
    ('espacios-confinados', 'Curso de espacios confinados', 'curso-de-espacios-confinados', 'presential', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1000&q=82', true),
    ('formacion-telco', 'Curso de riesgos eléctricos TELCO', 'curso-de-riesgos-electricos-telco', 'presential', 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1000&q=82', false),
    ('formacion-telco', 'Curso de operaciones TELCO', 'curso-de-operaciones-telco', 'presential', 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1000&q=82', false),
    ('formacion-telco', 'Curso de trabajos altura TELCO I', 'curso-de-trabajos-altura-telco-i', 'presential', 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1000&q=82', false),
    ('formacion-telco', 'Curso de trabajos altura TELCO II', 'curso-de-trabajos-altura-telco-ii', 'presential', 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1000&q=82', false),
    ('formacion-telco', 'Curso de espacios confinados TELCO', 'curso-de-espacios-confinados-telco', 'presential', 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1000&q=82', false),
    ('trekform-online', 'Curso de equipos de protección individual (EPI)', 'curso-de-equipos-de-proteccion-individual-epi', 'online', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=82', false),
    ('trekform-online', 'Curso de picking y radiofrecuencia', 'curso-de-picking-y-radiofrecuencia', 'online', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=82', false),
    ('trekform-online', 'Curso de operario de almacén', 'curso-operario-almacen', 'online', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=82', false),
    ('trekform-online', 'Curso de manipulador de alimentos online', 'curso-de-manipulador-de-alimentos-online', 'online', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=82', false),
    ('trekform-online', 'Curso de ciberseguridad (IFCT135PO)', 'curso-de-ciberseguridad-ifct135po', 'online', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=82', false),
    ('trekform-online', 'Curso de Microsoft Excel básico', 'curso-de-microsoft-excel-basico', 'online', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=82', false),
    ('trekform-online', 'Curso de Microsoft Excel avanzado', 'curso-de-microsoft-excel-avanzado', 'online', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=82', false),
    ('trekform-online', 'Curso de prevención riesgos eléctricos', 'curso-de-prevencion-riesgos-electricos', 'online', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=82', false),
    ('trekform-online', 'Curso de prevención del acoso sexual y por razón de sexo (CTRI0002)', 'curso-prevencion-acoso-sexual-ctri0002', 'online', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=82', false),
    ('trekform-online', 'Curso plan de igualdad y prevención del acoso sexual en el trabajo', 'curso-plan-igualdad-prevencion-acoso-sexual', 'online', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=82', false),
    ('construccion-metal', 'Curso de PRL construcción (TPC) / metal (TPM)', 'curso-de-prl-construccion-tpc-metal-tpm', 'presential', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=82', false),
    ('construccion-metal', 'Curso específico 6 horas TPC/TPM', 'curso-especifico-6-horas-tpc-tpm', 'presential', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=82', false),
    ('construccion-metal', 'Curso específico 20 horas TPC/TPM', 'curso-especifico-20-horas-tpc-tpm', 'presential', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=82', false),
    ('prevencion', 'Curso de lucha contra incendios', 'curso-de-lucha-contra-incendios', 'presential', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=82', true),
    ('prevencion', 'Curso básico de primeros auxilios', 'curso-basico-primeros-auxilios', 'presential', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=82', true),
    ('prevencion', 'Curso DEA + SVB continuado', 'curso-dea-svb-continuado', 'presential', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=82', false),
    ('prevencion', 'Curso de prevención básico', 'curso-de-prevencion-basico', 'online', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=82', false),
    ('prevencion', 'Curso de gestión PRL (pymes y micropymes)', 'curso-de-gestion-prl-pymes-y-micropymes', 'online', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=82', false),
    ('prevencion', 'Curso de riesgo eléctrico básico', 'curso-de-riesgo-electrico-basico', 'presential', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=82', false),
    ('prevencion', 'Curso de prevención riesgo químico', 'curso-de-prevencion-riesgo-quimico', 'online', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=82', false),
    ('prevencion', 'Curso de prevención en riesgos eléctricos', 'curso-de-prevencion-en-riesgos-electricos', 'presential', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=82', false),
    ('prevencion', 'Curso de montaje y desmontaje de andamios', 'curso-de-montaje-y-desmontaje-andamios', 'presential', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=82', false),
    ('prevencion', 'Curso de trabajos en carretera', 'curso-de-trabajos-en-carretera', 'presential', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=82', false),
    ('logistica', 'Curso de manipulación manual de cargas', 'curso-de-manipulacion-manual-de-cargas', 'presential', 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1000&q=82', false),
    ('logistica', 'Curso de estiba y sujeción de cargas', 'curso-de-estiba-y-sujecion-de-cargas', 'presential', 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1000&q=82', false),
    ('logistica', 'Seguridad cambio de baterías de carretillas', 'seguridad-cambio-baterias-carretillas', 'presential', 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1000&q=82', false),
    ('logistica', 'Curso de operario almacén + carnet carretillas', 'curso-de-operario-almacen-carnet-carretillas', 'presential', 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1000&q=82', false),
    ('logistica', 'Curso de gestor de almacén', 'curso-de-gestor-de-almacen', 'online', 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1000&q=82', false),
    ('hosteleria', 'Curso de camarera de pisos', 'curso-de-camarera-de-pisos', 'online', 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1000&q=82', false),
    ('hosteleria', 'Curso de manipulador de alimentos (Empresas)', 'curso-de-manipulador-de-alimentos-empresas', 'presential', 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1000&q=82', false)
)
insert into public.courses (
  category_id, title, slug, excerpt, description, modality, image_url,
  is_featured, status, published_at
)
select
  cc.id,
  c.title,
  c.slug,
  'Formación profesional de Trekform para particulares y empresas.',
  'Curso orientado a adquirir conocimientos prácticos y trabajar con seguridad.',
  c.modality,
  c.image_url,
  c.featured,
  'published',
  now()
from catalog c
join public.course_categories cc on cc.slug = c.primary_category
on conflict (slug) do update set
  category_id = excluded.category_id,
  title = excluded.title,
  excerpt = coalesce(public.courses.excerpt, excluded.excerpt),
  description = coalesce(public.courses.description, excluded.description),
  modality = excluded.modality,
  image_url = excluded.image_url,
  is_featured = excluded.is_featured,
  status = excluded.status,
  published_at = coalesce(public.courses.published_at, excluded.published_at);

with memberships(category_slug, course_slug) as (
  values
    ('maquinaria-industrial', 'curso-de-plataformas-elevadoras-pemp'),
    ('maquinaria-industrial', 'curso-de-operario-de-puente-grua'),
    ('maquinaria-industrial', 'curso-de-operario-de-carretilla-trilateral'),
    ('maquinaria-industrial', 'curso-de-operario-de-dumper'),
    ('maquinaria-industrial', 'curso-de-operario-de-recogepedidos'),
    ('maquinaria-industrial', 'curso-de-operario-de-retroexcavadora'),
    ('maquinaria-industrial', 'curso-de-camion-grua-pluma'),
    ('maquinaria-industrial', 'curso-de-tractores-agricolas'),
    ('maquinaria-industrial', 'curso-de-miniretroexcavadoras'),
    ('maquinaria-industrial', 'curso-de-carretillas-sube-escaleras'),
    ('maquinaria-industrial', 'curso-de-barredoras-fregadoras'),
    ('maquinaria-industrial', 'curso-de-manipuladoras-telescopicas'),
    ('maquinaria-industrial', 'curso-de-operador-de-desbrozadoras'),
    ('maquinaria-industrial', 'curso-de-operario-de-pala-cargadora'),
    ('maquinaria-industrial', 'curso-de-transpaletas-electricas-y-apiladores'),
    ('maquinaria-industrial', 'curso-de-carretillas-elevadoras'),
    ('trabajos-en-altura', 'curso-de-trabajos-en-altura'),
    ('trabajos-en-altura', 'curso-de-trabajos-verticales'),
    ('trabajos-en-altura', 'curso-de-trabajos-altura-telco-i'),
    ('trabajos-en-altura', 'curso-de-trabajos-altura-telco-ii'),
    ('trabajos-en-altura', 'curso-de-trabajos-en-altura-para-poda-de-arboles'),
    ('espacios-confinados', 'curso-de-espacios-confinados-telco'),
    ('espacios-confinados', 'curso-de-espacios-confinados'),
    ('formacion-telco', 'curso-de-riesgos-electricos-telco'),
    ('formacion-telco', 'curso-de-operaciones-telco'),
    ('formacion-telco', 'curso-de-trabajos-altura-telco-i'),
    ('formacion-telco', 'curso-de-trabajos-altura-telco-ii'),
    ('formacion-telco', 'curso-de-espacios-confinados-telco'),
    ('trekform-online', 'curso-de-equipos-de-proteccion-individual-epi'),
    ('trekform-online', 'curso-de-picking-y-radiofrecuencia'),
    ('trekform-online', 'curso-de-prevencion-riesgo-quimico'),
    ('trekform-online', 'curso-operario-almacen'),
    ('trekform-online', 'curso-de-manipulador-de-alimentos-online'),
    ('trekform-online', 'curso-de-ciberseguridad-ifct135po'),
    ('trekform-online', 'curso-de-prevencion-basico'),
    ('trekform-online', 'curso-de-microsoft-excel-basico'),
    ('trekform-online', 'curso-de-microsoft-excel-avanzado'),
    ('trekform-online', 'curso-de-prevencion-riesgos-electricos'),
    ('trekform-online', 'curso-de-camarera-de-pisos'),
    ('trekform-online', 'curso-prevencion-acoso-sexual-ctri0002'),
    ('trekform-online', 'curso-plan-igualdad-prevencion-acoso-sexual'),
    ('construccion-metal', 'curso-de-prl-construccion-tpc-metal-tpm'),
    ('construccion-metal', 'curso-especifico-6-horas-tpc-tpm'),
    ('construccion-metal', 'curso-especifico-20-horas-tpc-tpm'),
    ('prevencion', 'curso-de-lucha-contra-incendios'),
    ('prevencion', 'seguridad-cambio-baterias-carretillas'),
    ('prevencion', 'curso-de-estiba-y-sujecion-de-cargas'),
    ('prevencion', 'curso-basico-primeros-auxilios'),
    ('prevencion', 'curso-dea-svb-continuado'),
    ('prevencion', 'curso-de-prevencion-basico'),
    ('prevencion', 'curso-de-gestion-prl-pymes-y-micropymes'),
    ('prevencion', 'curso-de-riesgo-electrico-basico'),
    ('prevencion', 'curso-de-prevencion-riesgo-quimico'),
    ('prevencion', 'curso-de-prevencion-en-riesgos-electricos'),
    ('prevencion', 'curso-de-prl-construccion-tpc-metal-tpm'),
    ('prevencion', 'curso-de-montaje-y-desmontaje-andamios'),
    ('prevencion', 'curso-de-manipulador-de-alimentos-empresas'),
    ('prevencion', 'curso-de-manipulador-de-alimentos-online'),
    ('prevencion', 'curso-de-trabajos-en-carretera'),
    ('prevencion', 'curso-especifico-6-horas-tpc-tpm'),
    ('prevencion', 'curso-especifico-20-horas-tpc-tpm'),
    ('logistica', 'curso-de-manipulacion-manual-de-cargas'),
    ('logistica', 'curso-de-estiba-y-sujecion-de-cargas'),
    ('logistica', 'seguridad-cambio-baterias-carretillas'),
    ('logistica', 'curso-de-operario-almacen-carnet-carretillas'),
    ('logistica', 'curso-de-gestor-de-almacen'),
    ('hosteleria', 'curso-de-camarera-de-pisos'),
    ('hosteleria', 'curso-de-manipulador-de-alimentos-empresas'),
    ('hosteleria', 'curso-de-manipulador-de-alimentos-online')
)
insert into public.course_category_assignments (course_id, category_id)
select c.id, cc.id
from memberships m
join public.courses c on c.slug = m.course_slug
join public.course_categories cc on cc.slug = m.category_slug
on conflict (course_id, category_id) do nothing;
*/
