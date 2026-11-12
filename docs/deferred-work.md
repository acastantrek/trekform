# Trabajo aplazado

## Alinear el contenido de los cursos con producción

Origen: comparación del 2026-11-09 entre las 52 fichas de trekform.com y los 52 cursos publicados en
Supabase. Duración y objetivos coinciden. No se compararon precios ni certificaciones.

Los identificadores de abajo son los `slug` de nuestra tabla `courses`.

### 1. Metodología por curso

`src/pages/CourseDetailPage.tsx` muestra "Teórico-práctica" fija en todos los cursos. Hay que convertirla
en un campo por curso. Los 40 restantes son teórico-prácticos en producción.

"Teórico":

- `curso-de-equipos-de-proteccion-individual-epi`
- `curso-de-picking-y-radiofrecuencia`
- `curso-de-prevencion-riesgo-quimico`
- `curso-de-operaciones-telco`
- `curso-operario-almacen`
- `curso-de-manipulador-de-alimentos-online`
- `curso-de-gestion-prl-pymes-y-micropymes`
- `curso-de-prevencion-basico`
- `curso-de-prevencion-riesgos-electricos`
- `curso-de-camarera-de-pisos`
- `curso-prevencion-acoso-sexual-ctri0002`

"Plataforma online":

- `curso-de-manipulador-de-alimentos-empresas`

### 2. Modalidad

- `curso-de-manipulador-de-alimentos-empresas`: producción dice "Online" y nosotros `presential`.
  Corregir.
- `curso-de-prevencion-riesgo-quimico`: producción dice "A distancia" y nosotros `online`. Diferencia
  menor, decidir si se mantiene.

### 3. Fichas PDF

Ningún curso tiene `brochure_url`, y el enlace de la ficha solo aparece si existe. Las rutas son relativas
a `https://trekform.com`. Habrá que migrar los archivos antes de retirar la web actual.

- `curso-de-equipos-de-proteccion-individual-epi`: `/trekform/uploads/Cursos/PDF_cursos/ficha_epis.pdf`
- `curso-de-lucha-contra-incendios`: `/trekform/uploads/Cursos/PDF_cursos/ficha_extincion_incendios.pdf`
- `curso-de-trabajos-en-altura`: `/trekform/uploads/Cursos/PDF_cursos/ficha_trabajos_altura.pdf`
- `curso-de-trabajos-verticales`: `/trekform/uploads/Cursos/PDF_cursos/ficha_trabajos_verticales.pdf`
- `curso-de-plataformas-elevadoras-pemp`: `/trekform/uploads/Cursos/PDF_cursos/ficha_plataformas.pdf`
- `curso-de-operario-de-puente-grua`: `/trekform/uploads/Cursos/PDF_cursos/ficha_puente_grua.pdf`
- `curso-primeros-auxilios`: `/trekform/uploads/Cursos/PDF_cursos/ficha-primeros-auxilios.pdf`
- `curso-de-operario-de-dumper`: `/trekform/uploads/Cursos/PDF_cursos/ficha_dumper.pdf`
- `curso-de-prevencion-basico`: `/trekform/uploads/Cursos/PDF_cursos/ficha-prl.pdf`
- `curso-de-camion-grua-pluma`: `/trekform/uploads/Cursos/PDF_cursos/ficha_camion-pluma.pdf`
- `curso-de-riesgo-electrico-basico`: `/trekform/uploads/Cursos/PDF_cursos/ficha_riesgo_electrico.pdf`
- `curso-de-prevencion-en-riesgos-electricos`: `/trekform/uploads/Cursos/PDF_cursos/ficha_riesgo_electrico.pdf`
- `curso-de-barredoras-fregadoras`: `/trekform/uploads/Cursos/PDF_cursos/ficha_trabajos_altura.pdf`
  (parece un error en producción: es la ficha de trabajos en altura; confirmar cuál corresponde)
- `curso-de-manipuladoras-telescopicas`: `/trekform/uploads/Cursos/PDF_cursos/ficha_manipuladora_telescopica.pdf`
- `curso-de-carretillas-elevadoras`: `/trekform/uploads/Cursos/PDF_cursos/ficha_carretilllas.pdf`
- `seguridad-cambio-baterias-carretillas`: `/trekform/uploads/Cursos/PDF_cursos/ficha_cambio_baterias.pdf`
- `curso-de-estiba-y-sujecion-de-cargas`: `/trekform/uploads/Cursos/PDF_cursos/ficha_estiba_camiones.pdf`
- `curso-de-espacios-confinados`: `/trekform/uploads/Cursos/PDF_cursos/ficha_espacios_confinados.pdf`

### 4. Resúmenes de relleno

Estos cursos tienen como `excerpt` "Formación profesional de Trekform para particulares y empresas.".
Sustituirlo por la descripción de la ficha de producción (su `meta description`).

- `curso-de-operario-de-puente-grua`
- `curso-de-manipulador-de-alimentos-online`
- `curso-de-prevencion-basico`
- `curso-de-tractores-agricolas`
- `curso-de-microsoft-excel-basico`
- `curso-de-miniretroexcavadoras`
- `curso-de-prevencion-riesgos-electricos`
- `curso-de-trabajos-en-carretera`

### 5. Contenido que falta

- `curso-especifico-6-horas-tpc-tpm` y `curso-especifico-20-horas-tpc-tpm`: completar "Contenido genérico
  del curso" y "Cursos específicos disponibles".
- `curso-operario-almacen`: completar "Ventajas del curso de operario de almacén a distancia" y "¿Por qué
  elegir este curso?".
- `curso-de-operario-almacen-carnet-carretillas`: producción explica que es semipresencial de 40 horas y
  nosotros mostramos las tarjetas estándar de tipología.

### 6. Certificación cortada

- `curso-de-carretillas-elevadoras`: su `accreditation_title` es "Carnet y diploma homologado para", que
  parece cortado. Desde el 2026-11-11 la ficha de curso muestra este campo, así que hay que completarlo
  desde el panel.

## Sustituir el pago simulado

**Bloquea el lanzamiento.** Hoy no se cobra nada, pero la web le dice al alumno que ha pagado.

- `src/components/registrations/EnrollmentModal.tsx` muestra "Realizar pago", "Pago 100% seguro con
  STRIPE" y "¡Pago realizado!". El proyecto no tiene ninguna integración real con Stripe.
- `submitSimulatedPayment` en `src/services/enrollments.ts` guarda la inscripción con
  `payment_status: 'paid'`, `paid_at` y una referencia `SIMULADO-…`.
- Las inscripciones se crean desde el navegador sin login (políticas `students_public_insert` y
  `enrollments_public_insert`), así que el estado "pagado" no debe poder escribirse desde ahí.

Pasos:

1. Solución provisional, si se publica antes de tener Stripe: cambiar el paso a "Solicitar plaza", sin
   mensajes de pago y guardando la inscripción como pendiente para que el equipo contacte con el alumno.
2. Integrar Stripe Checkout con una Edge Function de Supabase que confirme el pago por webhook, y quitar
   del acceso público la posibilidad de escribir los campos de pago.

Hace falta: cuenta de Stripe y decidir cómo se gestionan las facturas.

## SEO: no perder posicionamiento al sustituir trekform.com

**Bloquea el lanzamiento.** Si la web nueva se publica tal cual en `trekform.com`, Google encontrará las
URLs antiguas sin destino y todas las páginas con el mismo título. Revisado el 2026-11-12.

Lo que hay que conservar: cada URL indexada debe seguir existiendo o redirigir con un 301 a su equivalente
(nunca a la portada), y cada página debe mantener el título, la descripción y el contenido que la hacían
posicionar. Mismo dominio, sin cambiarlo.

### 1. Redirecciones 301

Las URLs de producción no coinciden con las nuestras. Datos del sitemap del 2026-11-09.

- **Cursos (52):** producción usa `/cursos-trekform/{categoria}/{curso}` y nosotros
  `/cursos-trekform/{curso}`. Solo 15 de los 52 nombres de URL son iguales, así que la correspondencia debe
  hacerse por título del curso, no por URL. Ojo con `/cursos-trekform/prevencion/181`, que es
  `curso-de-prevencion-riesgos-electricos`.
- **Categorías:** existen páginas como `/cursos-trekform/maquinaria-industrial`, que también necesitan destino.
- **Landings por ciudad (unas 37):** por ejemplo `/curso-puente-grua-madrid`. Decidir si se recrean o se
  redirigen a la ficha del curso.
- **Blog (unas 1.050 URLs):** 927 en `/blog/…` y 126 en `/es/blog/…`. Sin comparar todavía con nuestros
  artículos (en Supabase hay 18 publicados).
- **Otras URLs:** el sitemap tiene 1.163 en total. Revisar las que no entren en los grupos anteriores.

Las redirecciones 301 se pueden definir en `redirects` de `vercel.json`, que Vercel aplica antes de la regla
general que envía todo a la aplicación. Comprobar que `/cursos-trekform/{categoria}/{curso}` no quede
atrapada por esa regla. Mantenerlas al menos un año.

Mejor fuente para priorizar: exportación de Google Search Console (Rendimiento → Páginas), que dice qué URLs
tienen clics e impresiones. Las que tienen tráfico o enlaces externos van primero.

### 2. Falso 404

Una ruta desconocida muestra `NotFoundPage` (`path="*"` en `src/App.tsx`), pero la regla general de
`vercel.json` la sirve con código **200**. Google lo trata como un falso 404. Se resuelve con el
prerenderizado del punto 4 (página 404 real) o devolviendo 404 desde Vercel para rutas no conocidas.

### 3. Título y metadatos por página

Hoy todas las páginas usan el `<title>` y la `description` fijos de `index.html`. Falta en cada página
pública (portada, catálogo, ficha de curso, blog, artículo, contacto…):

- `<title>` y `<meta name="description">` propios, copiando los de producción que ya posicionan. React 19
  permite ponerlos directamente dentro del componente de cada página, sin librerías.
- `<link rel="canonical">` con la URL definitiva.
- Etiquetas Open Graph / Twitter para compartir en redes y WhatsApp.
- Datos estructurados JSON-LD: `Organization`, `Course` en las fichas, `Article` en el blog y
  `BreadcrumbList`.

Los títulos y descripciones de producción se pueden sacar en el mismo rastreo que las URLs.

### 4. Prerenderizado

La web es una SPA: el HTML que recibe un buscador está vacío y el contenido se monta con JavaScript. Google
lo procesa más tarde y peor; Bing y las vistas previas de redes ven una página en blanco. Generar en el
build el HTML de cada ruta pública (por ejemplo con `vite-react-ssg` o un script de prerenderizado que lea
los slugs de Supabase), sin cambiar a otro framework.

### 5. `robots.txt` y `sitemap.xml`

No existen. Crear `public/robots.txt` y un `sitemap.xml` generado en el build con todas las rutas
públicas, cursos y artículos publicados (leídos de Supabase), y enlazarlo desde `robots.txt`.

### 6. Al publicar

1. Verificar `trekform.com` en Search Console (si no lo está) y enviar el sitemap nuevo.
2. Vigilar durante 4-8 semanas el informe de páginas: errores 404, falsos 404 y caídas de posiciones, y
   añadir las redirecciones que falten.
3. Mantener el contenido equivalente al de producción (H1, texto de fondo y `alt` de imágenes) en las
   páginas que más tráfico traen.

Hace falta: acceso a Search Console de `trekform.com`, o permiso para rastrear la web actual y su sitemap.
