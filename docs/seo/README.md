# Inventario SEO de trekform.com (fase 0)

Rastreo de la web actual del 2026-11-13, para el plan de "SEO: no perder posicionamiento al sustituir
trekform.com" de `docs/deferred-work.md`. Se rastrearon las 1.163 URLs del sitemap y los 100 enlaces
internos que no están en él, con `scripts/crawl-trekform-com.mjs`.

Falta la otra mitad de la fase 0: **la exportación de Search Console**. Sin ella no sabemos qué URLs
tienen tráfico, así que las decisiones de abajo marcadas "según tráfico" siguen abiertas.

## Archivos

- `inventario-trekform-com.csv`: una fila por URL con código HTTP, destino de la redirección, `title`,
  `description`, H1, `canonical`, número de palabras, imágenes, imágenes sin `alt` y enlaces internos
  entrantes. Es la referencia para copiar metadatos y comparar en la fase 4.
- `cursos-produccion-a-nuestros.csv`: los 52 cursos de producción emparejados con nuestros 52 `slug`
  (uno a uno, revisado). Incluye la categoría de cada lado.
- `redirecciones-existentes.csv`: las 218 redirecciones que producción ya aplica. Hay que mantenerlas.

## Resumen por grupo

| Grupo                                                  |      URLs | Responden 200 | Ya redirigen |
| ------------------------------------------------------ | --------: | ------------: | -----------: |
| Fichas de curso `/cursos-trekform/{categoria}/{curso}` |        52 |            52 |            0 |
| Categorías `/cursos-trekform/{categoria}`              |         9 |             9 |            0 |
| Catálogo `/cursos-trekform`                            |         1 |             1 |            0 |
| Landings en la raíz `/curso-…` (incluye `/cursos`)     |        38 |            37 |            1 |
| Blog `/blog/…`                                         |       927 |           783 |          144 |
| Blog `/es/blog/…/{id}`                                 |       126 |           120 |            6 |
| Otras (legales, quiénes somos, plantillas…)            |        10 |             9 |            1 |
| **Total sitemap**                                      | **1.163** |     **1.011** |      **152** |

## Hallazgos

### Cursos

- Los 52 cursos de producción tienen equivalente en nuestra base de datos, uno a uno. Solo 15 comparten
  `slug`.
- `/cursos-trekform/prevencion/181` es nuestro `curso-de-prevencion-riesgos-electricos` (ficha "Curso de
  prevención riesgos eléctricos", distinta de `curso-de-prevencion-en-riesgos-electricos`).
- **Las categorías no coinciden.** Producción usa 11 categorías en las URLs de curso y nosotros 9, con
  otros nombres y otras asignaciones: `contruccion-tpc-metal-tpm` (con la errata) es nuestra
  `construccion-metal`, y `area-de-informatica` y `seguridad-vial` no existen aquí. Además, cursos como
  los de TELCO o algunos de prevención están en categorías distintas. Por eso, para conservar las URLs, la
  ruta de cada curso no puede construirse con nuestra categoría: hay que guardar la ruta de producción por
  curso (la columna `ruta_produccion` del CSV) y servir la ficha en ella.
- Producción ya devuelve un 404 real para rutas que no existen y 301 para la categoría
  `/cursos-trekform/seguridad-vial`. La categoría `/cursos-trekform/area-de-informatica` da 404.
- El catálogo tiene paginación (`/cursos-trekform/page:2`, `page:3`), enlazada desde la web.

### Landings en la raíz

- 34 landings de curso + ciudad: carretillero (10 ciudades), PEMP (6), puente grúa (6), carretilla
  trilateral (6), trabajos en altura (3), dumper (3) y una variante rota
  (`/curso-de-carretillas-elevadoras-valencia`, sin `title` ni `description`).
- Dos landings son cursos que **no tenemos**: `/curso-de-operador-de-desbrozadoras` y
  `/curso-plan-de-igualdad-y-prevencion-del-acoso-sexual-en-el-trabajo`.
- 39 páginas tienen datos estructurados `FAQPage`: casi todas son estas landings.
- Las landings concentran redirecciones: producción ya envía a ellas 142 artículos antiguos del blog.

### Blog

- 903 artículos responden 200: 783 en `/blog/…` y 120 en `/es/blog/…/{id}`. Las de `/es/blog` tienen
  `canonical` a sí mismas y solo 4 comparten nombre con un artículo de `/blog`, así que son artículos
  distintos, no duplicados.
- Clasificación aproximada por el título: unos 406 son anuncios de convocatorias con fecha (2022-2024 la
  mayoría), unos 122 son "curso X en ciudad Y" y unos 375 son contenido atemporal ("Qué son los trabajos en
  altura", "Carretillas retráctiles vs. frontales"…). Los anuncios caducados son candidatos a 301 hacia la
  landing o ficha del curso, como ya hace producción con 150 de ellos; el contenido atemporal, a migrar
  según tráfico.
- Ninguno de nuestros 18 artículos tiene la misma URL que en producción. Al menos 4 son versiones de
  artículos existentes con otro `slug`: `que-son-trabajos-altura` (`/blog/que-son-los-trabajos-en-altura`),
  `seguridad-laboral-industrial-activo-humano` (`/blog/seguridad-laboral-industrial-el-activo-humano`),
  `carretillero-baleares` y `primeros-auxilios-vallecas`. Para conservarlos habría que darles el `slug` de
  producción.
- Mediana de 621 palabras por artículo (mínimo 202, máximo 3.523), contando también el texto de la
  plantilla.

### Redirecciones que ya existen

- 218 redirecciones en total: 142 aparecen en el sitemap y 76 se encontraron en enlaces internos. Muchas
  vienen de un WordPress anterior (`/cursos/{curso}/`, `/course-category/{categoria}/`, `/contacto/`) y
  probablemente todavía reciben enlaces externos.
- Hay que reproducirlas todas en la web nueva **apuntando directamente al destino final**, para no crear
  cadenas de dos saltos (por ejemplo `/cursos/puente-grua/` → ruta antigua → ruta nueva).
- 5 son 302 (temporales), entre ellas `/aviso-legal` → `/aviso-legal-v2` y `/es/cms/sobre-nosotros` →
  `/quienes-somos`. En la web nueva deben ser 301.

### Otras páginas

- Coinciden con las nuestras: `/quienes-somos`, `/politica-de-privacidad`, `/politica-de-cookies`.
- No coinciden: el contacto es `/es/contacto` (nosotros `/contacto`) y el aviso legal es
  `/aviso-legal-v2` (nosotros `/aviso-legal`).
- No tenemos: `/condiciones-generales` y `/trabaja-con-nosotros-formadores`.
- Tres plantillas internas están publicadas e indexables: `/plantilla_cursos_landing`,
  `/plantilla-curso-+-ubicacion-+-particulares` y `/plantilla_landing_empresas`. No se migran.

### Técnico

- La portada `/` no está en el sitemap, y el sitemap incluye 152 URLs que redirigen. El nuestro debe
  listar solo URLs que respondan 200.
- `http://trekform.com` redirige a `https` con un **302**; `www.trekform.com` con un 301. La línea
  `Sitemap:` de `robots.txt` apunta a `www`.
- Todas las páginas tienen `canonical` a sí mismas y ninguna tiene `noindex`.
- Todas llevan JSON-LD (`Organization`, `WebSite`, `BreadcrumbList`, `WebPage`…), las 54 fichas de curso
  y similares llevan `product` con `AggregateOffer`, y 39 llevan `FAQPage`. La web nueva debe tener al
  menos lo mismo.
- 3.298 de 6.487 imágenes no tienen `alt`: la web nueva puede mejorar en esto.
- Metadatos: 7 páginas del sitemap sin `description` y 13 títulos repetidos en el blog.
