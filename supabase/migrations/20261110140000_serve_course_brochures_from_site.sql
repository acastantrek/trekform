-- Serves course brochures from this site instead of trekform.com, using the 2026 files.
-- Run this only after the files in public/fichas are deployed.
update public.courses as c
set brochure_url = data.brochure_url
from (values
  ('curso-de-barredoras-fregadoras', '/fichas/ficha_fregadora_barredora.pdf'),
  ('curso-de-camion-grua-pluma', '/fichas/ficha_camion-pluma.pdf'),
  ('curso-de-carretillas-elevadoras', '/fichas/ficha_carretilllas.pdf'),
  ('curso-de-equipos-de-proteccion-individual-epi', '/fichas/ficha_epis.pdf'),
  ('curso-de-espacios-confinados', '/fichas/ficha_espacios_confinados.pdf'),
  ('curso-de-estiba-y-sujecion-de-cargas', '/fichas/ficha_estiba_camiones.pdf'),
  ('curso-de-lucha-contra-incendios', '/fichas/ficha_extincion_incendios.pdf'),
  ('curso-de-manipuladoras-telescopicas', '/fichas/ficha_manipuladora_telescopica.pdf'),
  ('curso-de-operario-de-dumper', '/fichas/ficha_dumper.pdf'),
  ('curso-de-operario-de-puente-grua', '/fichas/ficha_puente_grua.pdf'),
  ('curso-de-plataformas-elevadoras-pemp', '/fichas/ficha_plataformas.pdf'),
  ('curso-de-prevencion-basico', '/fichas/ficha-prl.pdf'),
  ('curso-de-prevencion-en-riesgos-electricos', '/fichas/ficha_riesgo_electrico.pdf'),
  ('curso-de-riesgo-electrico-basico', '/fichas/ficha_riesgo_electrico.pdf'),
  ('curso-de-trabajos-en-altura', '/fichas/ficha_trabajos_altura.pdf'),
  ('curso-de-trabajos-verticales', '/fichas/ficha_trabajos_verticales.pdf'),
  ('curso-primeros-auxilios', '/fichas/ficha-primeros-auxilios.pdf'),
  ('seguridad-cambio-baterias-carretillas', '/fichas/ficha_cambio_baterias.pdf')
) as data(slug, brochure_url)
where c.slug = data.slug;
