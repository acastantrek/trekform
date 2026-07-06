# Backend Supabase para Trekform (histórico)

> Este documento describe el diseño completo anterior. El backend activo es el MVP documentado en `docs/backend-mvp.md`.

## Alcance funcional observado

La web pública separa el catálogo de cursos de las convocatorias. Un curso define
contenido, categoría, público, modalidad, duración y metodología; una convocatoria
define fecha, sede, horario, aforo, precio y disponibilidad.

Los flujos principales son:

1. Catálogo filtrable por categoría y ficha SEO de cada curso.
2. Calendario de convocatorias abiertas por curso, provincia y fecha.
3. Matrícula de particulares con datos del alumno y pago mediante Stripe.
4. Solicitud de empresas para formar trabajadores, incluida formación In-Company y FUNDAE.
5. Emisión de diploma/carnet y verificación mediante QR y documento de identidad.
6. Captación de contactos, preguntas frecuentes, testimonios y blog/CMS.

Fuentes analizadas:

- https://trekform.com/
- https://trekform.com/cursos-trekform
- https://trekform.com/cursos-trekform/maquinaria-industrial/curso-de-carretillas-elevadoras
- https://inscripciones.trekcom.online/
- https://trekform.com/quienes-somos
- https://trekform.com/blog/
- https://trekform.com/blog/trekform-apuesta-por-la-innovacion-y-la-seguridad-en-sus-certificaciones

## Decisiones de diseño

- Todos los identificadores de negocio son UUID. Los códigos visibles (matrícula,
  factura y certificado) son columnas independientes y únicas.
- `courses` contiene la definición comercial del curso. `course_sessions` contiene
  cada convocatoria. `session_schedules` permite varias jornadas y separa teoría de
  práctica.
- Un alumno importado por una empresa puede existir sin usuario de Auth. Cuando se
  registra un usuario, se crean automáticamente `profiles`, el rol `student` y su
  fila de `students`.
- Los usuarios pueden acumular roles mediante `profile_roles`. `company_members`
  delimita qué empresas puede gestionar cada usuario. `trainers` y
  `session_trainers` delimitan las convocatorias asignadas a formadores.
- Los pagos guardan referencias del proveedor, no datos de tarjeta. Stripe debe
  confirmarse por webhook en una Edge Function con service role; el navegador no
  puede confirmar pagos ni emitir certificados.
- El DNI/NIE/Pasaporte se considera información privada. La tabla `certificates` no
  es pública. La verificación se realiza por RPC con token QR y documento, y devuelve
  solamente el resultado mínimo.
- `seo_metadata` usa la ruta canónica como clave y puede enlazarse opcionalmente a un
  curso o artículo. Así también cubre páginas estáticas.
- Los archivos públicos viven en `course-media` y `cms-media`; documentos internos y
  certificados usan buckets privados.

## Estado actual del proyecto Supabase

La inspección en modo lectura del proyecto `wteagitvzdlujwgqgwog` muestra una única
tabla pública existente: `cursos`, con 25 filas, clave `bigint` y RLS activo. Procede
de la migración remota `20260703115010_create_cursos_catalog` y es la fuente que usa
actualmente `src/services/courses.ts`.

Estas migraciones no eliminan ni modifican `cursos`. El nuevo modelo normalizado usa
`courses`; por tanto, la aplicación seguirá funcionando durante la transición. Una
migración o adaptación del frontend desde `cursos` a `courses` se hará por separado
cuando el nuevo esquema esté aplicado y verificado.

## Supuestos

- La aplicación operará inicialmente en España y EUR, pero conserva país y moneda.
- Una matrícula corresponde a un alumno y una convocatoria. Una empresa puede pagar
  varias matrículas, aunque cada matrícula conserva sus propios pagos por ahora.
- No se implementa un LMS completo (progreso por lección, exámenes o SCORM). Los
  módulos describen el temario. Puede añadirse progreso sin alterar el catálogo.
- La facturación electrónica, numeración fiscal definitiva, impuestos y abonos
  requieren reglas contables del negocio antes de automatizarse.
- La gestión FUNDAE se registra como atributo de empresa/convocatoria y solicitud de
  contacto; no se modelan todavía los expedientes externos de FUNDAE.
- Las convocatorias visibles en la web cambian diariamente, por lo que no se incluyen
  en el seed. El seed contiene únicamente categorías y cursos estables detectados.

## Orden de migración

1. `20260706110000_foundation.sql`: extensiones, enums y utilidades.
2. `20260706111000_schema.sql`: tablas, claves, restricciones e índices.
3. `20260706112000_security_storage.sql`: Auth, RLS, RPC y buckets.
4. `20260706113000_seed_catalog.sql`: categorías y catálogo inicial idempotente.

No se ha aplicado ninguna migración al proyecto remoto.

## Aplicación y verificación (requiere confirmación)

Tras confirmar, se aplicarán las migraciones al proyecto enlazado y se comprobarán:

- tablas, enums, foreign keys e índices;
- RLS habilitado y políticas instaladas;
- buckets y privacidad;
- seed de categorías/cursos;
- acceso anónimo limitado al catálogo publicado;
- generación de `src/types/database.ts` desde el esquema remoto.
