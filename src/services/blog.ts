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

const defaultContent =
  'La formación técnica y preventiva ayuda a trabajar con mayor seguridad, reducir riesgos y mejorar la preparación profesional. En Trekform combinamos teoría clara, práctica real y criterios aplicables al puesto de trabajo.\n\nCada convocatoria está pensada para que el alumno entienda los riesgos, use correctamente los equipos y pueda aplicar lo aprendido desde el primer día.'

export const fallbackBlogPosts: BlogPost[] = [
  {
    id: 'fallback-carretillas-bizkaia',
    slug: 'curso-carretillas-elevadoras-bizkaia',
    title: 'Curso de carretillas elevadoras en Bizkaia | Carnet oficial con prácticas reales',
    excerpt: 'Formación práctica con carretillas elevadoras y criterios de seguridad para almacén.',
    content: defaultContent,
    image:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=85',
    category: 'Maquinaria',
    publishedAt: '2026-07-06T08:00:00+02:00',
  },
  {
    id: 'fallback-seguridad-industrial',
    slug: 'seguridad-laboral-industrial-activo-humano',
    title: 'Seguridad laboral industrial: el activo humano',
    excerpt: 'La seguridad industrial empieza por la formación y la prevención diaria.',
    content: defaultContent,
    image:
      'https://cloudflare.shopincdn.ovh/trekform/cache/images/img_blogs/1170x636_q91_cr0_fix1/seguridad_laboral_indusrial_trekform.jpg',
    category: 'Prevención',
    publishedAt: '2026-07-03T08:00:00+02:00',
  },
  {
    id: 'fallback-carretillero-baleares',
    slug: 'carretillero-baleares',
    title: 'Curso de carretillero en Baleares: formación en un solo día',
    excerpt: 'Una jornada intensiva con seguridad, técnica y prácticas reales.',
    content: defaultContent,
    image:
      'https://cloudflare.shopincdn.ovh/trekform/cache/images/img_blogs/1170x636_q91_cr0_fix1/carretillero_trekform_en_baleares.jpg',
    category: 'Maquinaria',
    publishedAt: '2026-07-01T08:00:00+02:00',
  },
  {
    id: 'fallback-trabajos-altura',
    slug: 'que-son-trabajos-altura',
    title: '¿Qué son los trabajos en altura?',
    excerpt: 'Cuándo existe riesgo de caída y qué formación ayuda a controlarlo.',
    content: defaultContent,
    image:
      'https://cloudflare.shopincdn.ovh/trekform/cache/images/img_blogs/1170x636_q91_cr0_fix1/conoce_un_poco_mejor_los_trabajos_en_altura_trekform.jpg',
    category: 'Trabajos en altura',
    publishedAt: '2026-06-26T08:00:00+02:00',
  },
  {
    id: 'fallback-primeros-auxilios',
    slug: 'primeros-auxilios-vallecas',
    title: 'Curso de Primeros Auxilios en Vallecas (Madrid)',
    excerpt: 'Cómo responder con orden durante los primeros minutos de una emergencia.',
    content: defaultContent,
    image:
      'https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=900&q=85',
    category: 'Formación',
    publishedAt: '2026-06-24T08:00:00+02:00',
  },
  {
    id: 'fallback-san-juan',
    slug: 'verbena-san-juan-prevencion',
    title: 'Verbena de San Juan: tradición, celebración y prevención.',
    excerpt: 'Consejos básicos para disfrutar con seguridad de una noche especial.',
    content: defaultContent,
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85',
    category: 'Prevención',
    publishedAt: '2026-06-23T08:00:00+02:00',
  },
  {
    id: 'fallback-grua-puente',
    slug: 'que-es-una-grua-puente',
    title: '¿Qué es una grúa puente?',
    excerpt: 'Funcionamiento, usos habituales y pautas de seguridad esenciales.',
    content: defaultContent,
    image: 'https://trekform.com/trekform/uploads/assets/images/services/services-1-3a.png',
    category: 'Maquinaria',
    publishedAt: '2026-06-19T08:00:00+02:00',
  },
  {
    id: 'fallback-altura-montcada',
    slug: 'ultimas-plazas-trabajos-altura-montcada',
    title: 'Últimas plazas curso de Trabajos en Altura en Montcada i Reixac (Barcelona)',
    excerpt: 'Convocatoria presencial para adquirir criterios prácticos de seguridad.',
    content: defaultContent,
    image:
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=900&q=85',
    category: 'Trabajos en altura',
    publishedAt: '2026-06-18T08:00:00+02:00',
  },
  {
    id: 'fallback-altura-huelva',
    slug: 'curso-trabajos-altura-huelva',
    title: 'Curso de trabajos en altura en Huelva con prácticas reales y certificación profesional',
    excerpt: 'Formación aplicada para tareas en altura y uso correcto de equipos.',
    content: defaultContent,
    image:
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=85',
    category: 'Trabajos en altura',
    publishedAt: '2026-06-17T08:00:00+02:00',
  },
  {
    id: 'fallback-andamios-madrid',
    slug: 'montaje-desmontaje-andamios-madrid',
    title: 'Curso de montaje y desmontaje de andamios en Madrid',
    excerpt: 'Aprende los criterios técnicos y preventivos para trabajar con andamios.',
    content: defaultContent,
    image:
      'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=900&q=85',
    category: 'Construcción',
    publishedAt: '2026-06-15T08:00:00+02:00',
  },
  {
    id: 'fallback-carretillas-huelva',
    slug: 'curso-carretillas-elevadoras-huelva',
    title: 'Curso de carretillas elevadoras en Huelva',
    excerpt: 'Manejo seguro, prácticas reales y acreditación profesional.',
    content: defaultContent,
    image:
      'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=900&q=85',
    category: 'Maquinaria',
    publishedAt: '2026-06-14T08:00:00+02:00',
  },
  {
    id: 'fallback-altura-vallecas',
    slug: 'seguridad-trabajos-altura-vallecas',
    title: 'Curso de seguridad en trabajos en altura: Compromiso y formación en Madrid (Vallecas)',
    excerpt: 'Prevención, equipos y procedimientos para realizar trabajos en altura.',
    content: defaultContent,
    image:
      'https://images.unsplash.com/photo-1601314167099-232775b3d6fd?auto=format&fit=crop&w=900&q=85',
    category: 'Prevención',
    publishedAt: '2026-06-08T08:00:00+02:00',
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
    image: row.image_url ?? fallbackBlogPosts[0].image,
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
