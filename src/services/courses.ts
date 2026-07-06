import { supabase } from '../lib/supabase'
import type { Course } from '../types/course'

interface CourseRow {
  id: number
  slug: string
  titulo: string
  categoria: string
  imagen_url: string
  ubicacion: string
  duracion: string
  color_acento: string
  descripcion: string
  destacado: boolean
  orden: number
}

const courseColumns =
  'id, slug, titulo, categoria, imagen_url, ubicacion, duracion, color_acento, descripcion, destacado, orden'

function mapCourse(row: CourseRow): Course {
  return {
    id: row.id,
    slug: row.slug,
    title: row.titulo,
    category: row.categoria,
    image: row.imagen_url,
    place: row.ubicacion,
    duration: row.duracion,
    color: row.color_acento,
    description: row.descripcion,
    featured: row.destacado,
    order: row.orden,
  }
}

export async function getCourses(options: { featured?: boolean } = {}): Promise<Course[]> {
  if (!supabase) {
    throw new Error('Falta configurar la conexión con Supabase.')
  }

  let query = supabase
    .from('cursos')
    .select(courseColumns)
    .order('orden', { ascending: true })
    .order('id', { ascending: true })

  if (options.featured) query = query.eq('destacado', true)

  const { data, error } = await query
  if (error) throw new Error(`No se pudieron cargar los cursos: ${error.message}`)

  return (data as CourseRow[]).map(mapCourse)
}
