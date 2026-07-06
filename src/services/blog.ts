import { supabase } from '../lib/supabase'

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  image: string
  category: string
  publishedAt: string
}

const fallbackImage =
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&q=85'

export const fallbackBlogPosts: BlogPost[] = [
  {
    id: 'fallback-carretillero-baleares',
    slug: 'carretillero-baleares',
    title: 'Curso de carretillero en Baleares: formación en un solo día',
    excerpt:
      'Una jornada intensiva que combina seguridad, conocimiento técnico y prácticas reales con maquinaria.',
    content:
      'La formación de carretillas elevadoras prepara al alumno para identificar riesgos, revisar el equipo y operar de forma segura.\n\nEl programa combina una base teórica directa con ejercicios prácticos supervisados. El objetivo no es únicamente obtener una acreditación, sino adquirir criterios que puedan aplicarse desde el primer día de trabajo.\n\nLas convocatorias abiertas permiten completar la formación en una jornada y están dirigidas tanto a particulares como a trabajadores enviados por empresas.',
    image:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=85',
    category: 'Maquinaria',
    publishedAt: '2026-07-01T08:00:00+02:00',
  },
  {
    id: 'fallback-trabajos-altura',
    slug: 'que-son-trabajos-altura',
    title: '¿Qué son los trabajos en altura?',
    excerpt:
      'Analizamos cuándo existe riesgo de caída y qué formación, equipos y procedimientos ayudan a controlarlo.',
    content:
      'Se considera trabajo en altura cualquier tarea en la que una caída pueda causar daños al trabajador. La prevención comienza antes de utilizar un arnés: hay que evaluar la tarea, el entorno y el sistema de acceso.\n\nLa formación práctica permite reconocer puntos de anclaje, utilizar correctamente los equipos de protección y actuar ante una incidencia. También ayuda a entender que cada sistema tiene limitaciones y requiere inspecciones periódicas.\n\nUna planificación adecuada reduce la improvisación y convierte la seguridad en parte del propio trabajo.',
    image:
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1400&q=85',
    category: 'Prevención',
    publishedAt: '2026-06-26T08:00:00+02:00',
  },
  {
    id: 'fallback-primeros-auxilios',
    slug: 'primeros-auxilios-vallecas',
    title: 'Curso de Primeros Auxilios en Vallecas (Madrid)',
    excerpt:
      'Cómo una respuesta ordenada durante los primeros minutos puede marcar la diferencia ante una emergencia.',
    content:
      'Los primeros minutos de una emergencia son decisivos. Saber proteger la zona, alertar a los servicios de emergencia y realizar una valoración inicial evita actuaciones impulsivas.\n\nEl curso trabaja situaciones habituales mediante ejercicios guiados: pérdida de consciencia, atragantamientos, hemorragias y soporte vital básico. La práctica ayuda a recordar los pasos bajo presión.\n\nEsta formación está orientada a trabajadores, responsables de equipo y cualquier persona que quiera responder con mayor seguridad.',
    image:
      'https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=1400&q=85',
    category: 'Formación',
    publishedAt: '2026-06-24T08:00:00+02:00',
  },
]

interface BlogPostRow {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string | null
  image_url: string | null
  published_at: string | null
  blog_categories: { name: string } | null
}

function mapPost(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? '',
    content: row.content ?? row.excerpt ?? '',
    image: row.image_url ?? fallbackImage,
    category: row.blog_categories?.name ?? 'Actualidad',
    publishedAt: row.published_at ?? new Date().toISOString(),
  }
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (!supabase) return fallbackBlogPosts

  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, content, image_url, published_at, blog_categories(name)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) throw new Error(`No se pudieron cargar los artículos: ${error.message}`)
  if (!data?.length) return fallbackBlogPosts
  return (data as BlogPostRow[]).map(mapPost)
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const fallback = fallbackBlogPosts.find((post) => post.slug === slug) ?? null
  if (!supabase) return fallback

  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, content, image_url, published_at, blog_categories(name)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) throw new Error(`No se pudo cargar el artículo: ${error.message}`)
  return data ? mapPost(data as BlogPostRow) : fallback
}
