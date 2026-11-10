-- Serves blog images from this site instead of the current trekform.com image server.
-- Run this only after the files in public/imagenes are deployed.
update public.blog_posts as p
set image_url = data.new_url
from (values
  ('https://cloudflare.shopincdn.ovh/trekform/cache/images/_product_catalogue_/1/0/7/1200x630_q91_cr0_fix1/curso_manipulador_alimentos.jpg', '/imagenes/curso_manipulador_alimentos.jpg'),
  ('https://cloudflare.shopincdn.ovh/trekform/cache/images/_product_catalogue_/1/2/4/1200x630_q91_cr0_fix1/curso_riesgo_incendio.jpg', '/imagenes/curso_riesgo_incendio.jpg'),
  ('https://cloudflare.shopincdn.ovh/trekform/cache/images/_product_catalogue_/1/3/7/1200x630_q91_cr0_fix1/plataformas-1.jpg', '/imagenes/plataformas-1.jpg'),
  ('https://cloudflare.shopincdn.ovh/trekform/cache/images/_product_catalogue_/1/4/4/1200x630_q91_cr0_fix1/curso_manipulacion_cargas.jpg', '/imagenes/curso_manipulacion_cargas.jpg'),
  ('https://cloudflare.shopincdn.ovh/trekform/cache/images/_product_catalogue_/1/4/5/1200x630_q91_cr0_fix1/curso_basico_riesgo_electrico_prevencion.jpg', '/imagenes/curso_basico_riesgo_electrico_prevencion.jpg'),
  ('https://cloudflare.shopincdn.ovh/trekform/cache/images/_product_catalogue_/1/6/1/1200x630_q91_cr0_fix1/montaje_desmontaje_andamios__1.png', '/imagenes/montaje_desmontaje_andamios__1.png'),
  ('https://cloudflare.shopincdn.ovh/trekform/cache/images/_product_catalogue_/1/6/9/1200x630_q91_cr0_fix1/retroexcavadora-2.jpg', '/imagenes/retroexcavadora-2.jpg'),
  ('https://cloudflare.shopincdn.ovh/trekform/cache/images/_product_catalogue_/1/7/4/1200x630_q91_cr0_fix1/curso_ciberseguridad.jpg', '/imagenes/curso_ciberseguridad.jpg'),
  ('https://cloudflare.shopincdn.ovh/trekform/cache/images/_product_catalogue_/1/9/0/1200x630_q91_cr0_fix1/curso_telco_espacios_confinados.jpg', '/imagenes/curso_telco_espacios_confinados.jpg'),
  ('https://cloudflare.shopincdn.ovh/trekform/cache/images/_product_catalogue_/9/2/1200x630_q91_cr0_fix1/curso_epis.jpg', '/imagenes/curso_epis.jpg'),
  ('https://cloudflare.shopincdn.ovh/trekform/cache/images/_product_catalogue_/9/3/1200x630_q91_cr0_fix1/curso_picking.jpg', '/imagenes/curso_picking.jpg'),
  ('https://cloudflare.shopincdn.ovh/trekform/cache/images/img_blogs/1170x636_q91_cr0_fix1/carretillero_trekform_en_baleares.jpg', '/imagenes/carretillero_trekform_en_baleares.jpg'),
  ('https://cloudflare.shopincdn.ovh/trekform/cache/images/img_blogs/1170x636_q91_cr0_fix1/conoce_un_poco_mejor_los_trabajos_en_altura_trekform.jpg', '/imagenes/conoce_un_poco_mejor_los_trabajos_en_altura_trekform.jpg'),
  ('https://cloudflare.shopincdn.ovh/trekform/cache/images/img_blogs/1170x636_q91_cr0_fix1/seguridad_laboral_indusrial_trekform.jpg', '/imagenes/seguridad_laboral_indusrial_trekform.jpg')
) as data(old_url, new_url)
where p.image_url = data.old_url;
