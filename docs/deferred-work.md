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
