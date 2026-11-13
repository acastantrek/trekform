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

**Bloquea el lanzamiento.** Plan acordado el 2026-11-13; sustituye a la revisión del 2026-11-12.

Principio: **conservar las mismas URLs siempre que se pueda** en lugar de redirigir. Una URL que sigue
igual, con el mismo contenido, no pierde nada; un 301 pierde poco, pero añade riesgo y tarda semanas en
consolidarse. Mismo dominio, sin cambiarlo. Cada URL que no se conserve redirige con un 301 a su
equivalente, nunca a la portada.

Situación de partida (sitemap del 2026-11-09): 1.163 URLs. Nuestras rutas no coinciden con las de
producción. Hoy todas las páginas usan el `<title>` y la `description` fijos de `index.html`, la web es una
SPA sin prerenderizar (el buscador recibe un `<div id="root">` vacío), no hay `robots.txt` ni
`sitemap.xml`, y una ruta desconocida muestra `NotFoundPage` pero `vercel.json` la sirve con código 200
(falso 404).

### Fase 0: inventario de la web actual

Todo lo demás depende de esto.

1. Rastrear trekform.com: todas las URLs del sitemap y las enlazadas fuera de él. Para cada una, guardar
   código HTTP, `title`, `meta description`, H1, `canonical`, texto principal y `alt` de las imágenes.
2. Exportar de Google Search Console los últimos 16 meses: páginas con clics e impresiones, consultas
   principales y enlaces externos.
3. Guardar las posiciones de partida de las 20-30 palabras clave principales (por ejemplo "curso
   carretillero Madrid", "curso PRL") para comparar tras el lanzamiento.

Resultado: una tabla URL → tráfico → metadatos → decisión.

### Fase 1: decidir el destino de cada URL

- **Cursos (52):** producción usa `/cursos-trekform/{categoria}/{curso}` y nosotros
  `/cursos-trekform/{curso}`; solo 15 de los 52 nombres coinciden. Adoptar la estructura y los slugs de
  producción: guardar la ruta antigua de cada curso en Supabase y usarla como URL principal, así no hace
  falta ninguna redirección. La correspondencia se hace por título del curso, no por URL. Ojo con
  `/cursos-trekform/prevencion/181`, que es `curso-de-prevencion-riesgos-electricos`.
- **Categorías:** crear páginas de categoría reales en las mismas rutas (por ejemplo
  `/cursos-trekform/maquinaria-industrial`), que sirvan a la vez de catálogo filtrado.
- **Landings por ciudad (unas 37):** por ejemplo `/curso-puente-grua-madrid`. Recrear con la misma URL las
  que tengan tráfico, con una plantilla curso + ciudad con contenido propio; las demás, 301 a la ficha del
  curso.
- **Blog (unas 1.050 URLs):** 927 en `/blog/…` y 126 en `/es/blog/…`; en Supabase hay 18 artículos
  publicados. Es el mayor riesgo. Migrar con la misma URL los artículos con tráfico o enlaces externos;
  agrupar el contenido flojo con 301 al artículo o curso más parecido; 410 para lo que no tenga valor
  (etiquetas, paginaciones, duplicados). Las `/es/blog/…` redirigen a su versión en `/blog/…`.
- **Resto:** páginas legales, contacto, quiénes somos… misma URL o 301 a su equivalente.

Confirmar también cómo resuelve producción `www`/sin `www`, la barra final y las mayúsculas, y copiarlo
exactamente.

### Fase 2: base técnica

1. **Prerenderizado:** generar en el build el HTML de cada ruta pública, incluidas las que salen de
   Supabase (por ejemplo con `vite-react-ssg` o un script propio que lea los slugs), sin cambiar de
   framework. Es la pieza más importante de esta fase.
2. **Metadatos por página:** `<title>`, `<meta name="description">`, `<link rel="canonical">` y Open
   Graph / Twitter, copiados de producción en las páginas que ya posicionan. React 19 permite ponerlos
   dentro del componente de cada página, sin librerías. Datos estructurados JSON-LD: `Organization`,
   `Course` en las fichas, `Article` en el blog y `BreadcrumbList`.
3. **404 real:** las rutas desconocidas deben devolver código 404.
4. **Redirecciones 301** en `redirects` de `vercel.json`, que Vercel aplica antes de la regla general.
   Comprobar que las rutas antiguas no queden atrapadas por esa regla. Vercel limita el número de
   redirecciones en ese archivo (confirmar el límite actual en su documentación); si el blog lo supera,
   resolverlas con middleware.
5. **`public/robots.txt` y `sitemap.xml`** generado en el build con todas las rutas públicas, cursos y
   artículos publicados, enlazado desde `robots.txt`.

### Fase 3: contenido equivalente

En las páginas con tráfico, mantener al menos el mismo H1, el texto de fondo, los enlaces internos y los
`alt` de las imágenes: si una página que posiciona pierde texto, pierde posiciones. Incluye los pendientes
de "Alinear el contenido de los cursos con producción" (metodologías, resúmenes de relleno, fichas PDF).

### Fase 4: validación antes de publicar

- Publicar en un entorno de pruebas de Vercel bloqueado con `noindex`.
- Script que recorra la lista completa de URLs antiguas: cada una debe devolver 200 o un único 301 a su
  equivalente, sin cadenas de redirecciones ni 404.
- Comparar `title` y H1 de las páginas clave con el inventario.
- Revisar Core Web Vitals con Lighthouse.

### Fase 5: lanzamiento y seguimiento

1. Publicar, asegurándose de que la versión publicada no lleva el `noindex` de pruebas. Repetir el script
   de validación contra producción.
2. Verificar `trekform.com` en Search Console (si no lo está), enviar el sitemap nuevo e inspeccionar a
   mano las 20 URLs principales.
3. Vigilar durante 4-8 semanas el informe de páginas (404, falsos 404, URLs excluidas) y las posiciones de
   partida, y añadir las redirecciones que falten.
4. Mantener las redirecciones al menos un año; en la práctica, indefinidamente.

### Hace falta

- Permiso para rastrear trekform.com (fase 0).
- Acceso o exportación de Search Console de `trekform.com`.
- Decidir cuántos artículos del blog se migran (con los datos de tráfico de la fase 0).
- Decidir si las landings por ciudad se recrean o se redirigen.
