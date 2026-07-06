# Backend MVP de Trekform

Estado aplicado al proyecto Supabase `wteagitvzdlujwgqgwog` el 6 de julio de 2026.

## Migraciones MVP

- `20260706084441_reset_create_mvp.sql`: elimina el backend anterior y crea el esquema MVP, enums, índices, triggers y RLS.
- `20260706084449_seed_mvp.sql`: inserta el catálogo y contenido inicial.

Los archivos posteriores del backend completo y las copias con timestamps provisionales se conservan como migraciones históricas comentadas porque OneDrive impide eliminarlas; no ejecutan SQL.

El reset preserva `auth.users`, schemas internos, extensiones y los cuatro buckets de Storage con sus objetos.

## Modelo

- Identidad: `profiles` con roles `admin`, `student` y `company`.
- Catálogo: `course_categories`, `courses`, `course_modules`.
- Convocatorias: `locations`, `venues`, `course_sessions`.
- Inscripciones: `companies`, `students`, `enrollments`.
- Formularios: `contact_requests`.
- CMS: `faqs`, `testimonials`, `blog_categories`, `blog_posts`, `site_settings`.

## Seguridad

Todas las tablas públicas tienen RLS. Los visitantes solo pueden leer contenido publicado y crear solicitudes de contacto. Los usuarios autenticados pueden gestionar su perfil y sus datos permitidos. El rol `admin` puede gestionar todo el esquema público.

Los buckets existentes se conservaron, pero se retiraron las políticas de Storage del backend anterior. No hay subida de archivos habilitada en el MVP hasta definir el flujo necesario.

## Arranque administrativo

Los nuevos usuarios reciben el rol `student`. Para crear el primer administrador, registra primero el usuario y actualiza su perfil desde una operación segura con service role o desde el SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = '<auth-user-uuid>';
```

No expongas la service role key en el frontend.
