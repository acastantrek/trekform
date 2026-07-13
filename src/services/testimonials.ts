import { supabase } from '../lib/supabase'

export interface Testimonial {
  id: string
  authorName: string
  authorRole: string
  content: string
  rating: number
}

const fallbackTestimonials: Testimonial[] = [
  {
    id: 'fallback-carlos',
    authorName: 'Carlos M.',
    authorRole: 'Operador de carretillas',
    content:
      'La formación fue muy práctica y los instructores increíbles. Gracias a Trekform obtuve mi certificado y ahora trabajo con total seguridad.',
    rating: 5,
  },
]

interface TestimonialRow {
  id: string
  author_name: string
  author_role: string | null
  content: string
  rating: number | null
}

function mapTestimonial(row: TestimonialRow): Testimonial {
  return {
    id: row.id,
    authorName: row.author_name,
    authorRole: row.author_role ?? 'Alumno',
    content: row.content,
    rating: row.rating ?? 5,
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!supabase) return fallbackTestimonials

  const { data, error } = await supabase
    .from('testimonials')
    .select('id, author_name, author_role, content, rating')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(`No se pudieron cargar los testimonios: ${error.message}`)
  if (!data?.length) return fallbackTestimonials
  return (data as TestimonialRow[]).map(mapTestimonial)
}
