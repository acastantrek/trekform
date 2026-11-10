-- Display order for the public course catalog, agreed with the business on 2026-11-10.
-- Listed courses use negative values so unlisted and newly created courses, which
-- default to 0, always come after them. Revert by setting these rows back to 0.
update public.courses as c
set sort_order = data.sort_order
from (values
  ('curso-de-carretillas-elevadoras', -990),
  ('curso-de-plataformas-elevadoras-pemp', -980),
  ('curso-de-operario-de-puente-grua', -970),
  ('curso-de-trabajos-en-altura', -960),
  ('curso-de-espacios-confinados', -950),
  ('curso-de-trabajos-verticales', -940),
  ('curso-de-manipuladoras-telescopicas', -930),
  ('curso-primeros-auxilios', -920),
  ('curso-de-lucha-contra-incendios', -910),
  ('curso-de-riesgo-electrico-basico', -900),
  ('curso-de-prevencion-en-riesgos-electricos', -890),
  ('curso-de-prevencion-riesgos-electricos', -880),
  ('curso-de-prl-construccion-tpc-metal-tpm', -870),
  ('curso-especifico-20-horas-tpc-tpm', -860),
  ('curso-especifico-6-horas-tpc-tpm', -850),
  ('curso-de-camion-grua-pluma', -840),
  ('curso-de-operario-de-carretilla-trilateral', -830),
  ('curso-de-operario-de-recogepedidos', -820),
  ('curso-de-operario-de-retroexcavadora', -810),
  ('curso-de-miniretroexcavadoras', -800),
  ('curso-de-operario-de-pala-cargadora', -790),
  ('curso-de-operario-de-dumper', -780),
  ('curso-operario-almacen', -770),
  ('curso-de-operario-almacen-carnet-carretillas', -760),
  ('curso-de-operaciones-telco', -750),
  ('curso-de-espacios-confinados-telco', -740),
  ('curso-de-riesgos-electricos-telco', -730),
  ('curso-de-trabajos-altura-telco-i', -720),
  ('curso-de-trabajos-altura-telco-ii', -710),
  ('curso-de-estiba-y-sujecion-de-cargas', -700),
  ('curso-de-transpaletas-electricas-y-apiladores', -690),
  ('curso-de-picking-y-radiofrecuencia', -680)
) as data(slug, sort_order)
where c.slug = data.slug;

-- The "Más demandado" label belongs to exactly the courses ordered above.
update public.courses
set is_featured = (sort_order < 0)
where is_featured is distinct from (sort_order < 0);
