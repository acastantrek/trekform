# Trekform

Web de Trekform, empresa de formación en maquinaria industrial y prevención de riesgos laborales. Incluye la web pública (catálogo de cursos, convocatorias, inscripciones, blog y contacto) y un panel de administración en `/panel`.

> **Aún no está lista para sustituir a trekform.com.** El pago de las inscripciones es simulado y faltan las redirecciones SEO. Ver [Trabajo pendiente](#trabajo-pendiente).

## Tecnologías

- React 19, TypeScript y Vite
- React Router, con todas las rutas en el cliente
- Supabase: base de datos, autenticación y Edge Functions
- CSS propio con variables en `:root`, sin Tailwind
- Vercel para el despliegue

## Requisitos

- [Bun](https://bun.sh) 1.3.14 o compatible
- Node.js, para los scripts de contenido
- Un proyecto de Supabase con su esquema y sus claves

## Puesta en marcha

```bash
bun install
cp .env.example .env.local
# Rellena .env.local con los datos de tu proyecto de Supabase
bun run dev
```

Sin las variables de Supabase la aplicación arranca, pero no puede cargar datos: el cliente de `src/lib/supabase.ts` queda en `null`.

## Variables de entorno

Se guardan en `.env.local`, que git ignora.

| Variable                        | Dónde se usa                  | Notas                                             |
| ------------------------------- | ----------------------------- | ------------------------------------------------- |
| `VITE_SUPABASE_URL`             | Aplicación y scripts          | URL del proyecto                                  |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Aplicación y script de export | Clave pública                                     |
| `SUPABASE_SERVICE_ROLE_KEY`     | `import:course-content`       | **Secreta.** Nunca debe llevar el prefijo `VITE_` |

Vite incluye en el navegador todo lo que empiece por `VITE_`, así que ese prefijo solo debe usarse con valores públicos.

La Edge Function `invite-admin` acepta además `PANEL_APP_URL`, la URL del panel para los enlaces de invitación. Si no se define, usa `https://trekform.vercel.app`.

## Comandos

| Comando                           | Qué hace                                                  |
| --------------------------------- | --------------------------------------------------------- |
| `bun run dev`                     | Servidor de desarrollo                                    |
| `bun run build`                   | Comprueba los tipos y genera el build de producción       |
| `bun run preview`                 | Sirve el build de producción en local                     |
| `bun run lint`                    | Ejecuta ESLint                                            |
| `bun run format`                  | Formatea con Prettier                                     |
| `bun run format:check`            | Comprueba el formato sin modificar archivos               |
| `bun run export:original-courses` | Vuelca el contenido a `docs/original-course-content.json` |
| `bun run import:course-content`   | Sube ese contenido a Supabase con la clave de servicio    |

El proyecto no tiene tests automáticos.

## Estructura

```text
src/
  App.tsx        Rutas públicas y entrada al panel
  pages/         Páginas de la web pública
  components/    Componentes de la web pública
  services/      Acceso a datos de la web pública
  lib/           Cliente de Supabase
  styles/        Hojas de estilo
  types/         Tipos, incluidos los generados de la base de datos
  panel/         Panel de administración, cargado bajo demanda
    contexts/    Sesión y rol del usuario
    layouts/     Estructura del panel
    pages/       Gestión de cursos, convocatorias, blog, inscripciones y usuarios
    services/    Acceso a datos del panel
supabase/
  migrations/    Historial de migraciones SQL
  functions/     Edge Functions
scripts/         Exportación e importación de contenido
docs/            Notas del backend, catálogo y trabajo pendiente
```

## Base de datos

Supabase es el único backend, y todas las tablas públicas tienen RLS.

- **Esquema real:** las migraciones y `src/types/database.generated.ts` no reflejan por completo la base de datos en vivo, porque algunas columnas se añadieron directamente en remoto. Por eso `untypedSupabase` permite consultar esas columnas. Para conocer el esquema real, consulta el OpenAPI de PostgREST del proyecto.
- **Migraciones comentadas:** varias se conservan solo como historial. `docs/backend-mvp.md` indica cuáles son las activas.
- **Clave de servicio:** las operaciones que la necesiten deben hacerse en una Edge Function, nunca en el navegador.

## Panel de administración

Está en `/panel` y solo pueden entrar usuarios activos con `role = 'admin'` en `profiles`. Los usuarios nuevos reciben el rol `student`. El primer administrador se crea desde el SQL Editor de Supabase:

```sql
update public.profiles
set role = 'admin'
where id = '<auth-user-uuid>';
```

Los siguientes pueden invitarse desde la sección de usuarios del panel.

## Despliegue

Se despliega en Vercel. `vercel.json` envía todas las rutas a `index.html`, porque el enrutado ocurre en el cliente. En Vercel hay que configurar `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.

Esa regla hace que el servidor responda 200 incluso en las rutas que no existen. La página 404 lleva `noindex` por ese motivo.

## Trabajo pendiente

El detalle está en [`docs/deferred-work.md`](docs/deferred-work.md). Bloquean el lanzamiento:

- **Pago simulado:** la web indica al alumno que ha pagado, pero no se cobra nada y no hay integración con Stripe.
- **Redirecciones SEO:** las URLs de trekform.com no coinciden con las de este proyecto y faltan las redirecciones 301.

También queda alinear parte del contenido de los cursos con la web actual.
